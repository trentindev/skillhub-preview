import { exec } from "child_process";
import crypto from "crypto";
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Paramètres de runtime : port d'écoute et secret partagé avec GitHub.
const PORT = process.env.WEBHOOK_PORT || 4000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Le serveur refuse de démarrer sans secret pour éviter tout webhook non authentifié.
if (!WEBHOOK_SECRET) {
  console.error("Erreur : GITHUB_WEBHOOK_SECRET non défini dans le fichier .env");
  process.exit(1);
}

// Calcul d'un chemin absolu robuste vers le script pipeline, quel que soit le cwd.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pipelineScriptPath = path.resolve(__dirname, "../scripts/pipeline.sh");

// On conserve le body brut pour recalculer la signature HMAC à l'identique de GitHub.
app.use(
  express.json({
    // Conserve le corps brut pour une future verification de signature GitHub.
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Endpoint de sante simple pour supervision (Docker, load balancer, etc.).
app.get("/status", (req, res) => {
  res.status(200).json({
    service: "skillhub-webhook-server",
    status: "running",
    signature_check: "enabled",
    timestamp: new Date().toISOString(),
  });
});

// Point d'entrée principal des webhooks GitHub.
app.post("/webhook", (req, res) => {
  const githubEvent = req.get("X-GitHub-Event") || "unknown";
  const githubDelivery = req.get("X-GitHub-Delivery") || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";

  console.log("Webhook reçu");
  console.log(`Event       : ${githubEvent}`);
  console.log(`Delivery ID : ${githubDelivery}`);
  console.log(`User-Agent  : ${userAgent}`);

  const isValidSignature = verifyGitHubSignature(req);

  // On accepte le webhook mais on ne traite que les push pour l'instant.
  if (githubEvent !== "push") {
    return res.status(202).json({
      status: "ignored",
      message: "Événement reçu mais non traité pour le moment",
      event: githubEvent,
    });
  }

  // Extraction defensive du payload GitHub avec valeurs de repli.
  const branch = req.body?.ref || "inconnue";
  const repository = req.body?.repository?.full_name || "inconnu";
  const author = req.body?.pusher?.name || "inconnu";
  const commitMessage = req.body?.head_commit?.message || "aucun message";

  console.log("Signature   : valide");
  console.log(`Branche     : ${branch}`);
  console.log(`Dépôt       : ${repository}`);
  console.log(`Auteur      : ${author}`);
  console.log(`Commit      : ${commitMessage}`);

  // Garde-fou métier : pipeline déclenché uniquement sur la branche main.
  if (branch !== "refs/heads/main") {
    return res.status(202).json({
      status: "ignored",
      message: "Push reçu mais branche non ciblée",
      branch,
    });
  }

  console.log("Déclenchement du pipeline...");

  // Exécution asynchrone du pipeline ; la réponse HTTP n'attend pas la fin du script.
  exec(`bash "${pipelineScriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur lors de l'exécution du pipeline :", error.message);
      return;
    }

    if (stdout) {
      console.log("Sortie pipeline :");
      console.log(stdout);
    }

    if (stderr) {
      console.error("Erreurs pipeline :");
      console.error(stderr);
    }
  });

  // Accusé de réception rapide à GitHub après validation + déclenchement.
  return res.status(200).json({
    status: "ok",
    message: "Webhook GitHub authentifié et pipeline déclenché",
    branch,
    repository,
    author,
  });
});

// Démarrage du serveur HTTP.
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});