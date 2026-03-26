import crypto from "crypto";
import "dotenv/config";
import express from "express";

const app = express();

// Configuration runtime : port d'écoute et secret partagé avec GitHub.
const PORT = process.env.WEBHOOK_PORT || 4000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;


if (!WEBHOOK_SECRET) {
  console.error("Erreur : GITHUB_WEBHOOK_SECRET non défini dans le fichier .env");
  process.exit(1);
}

// On conserve le body brut pour recalculer la signature HMAC exactement comme GitHub.
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

function verifyGitHubSignature(req) {
  // Signature envoyée par GitHub dans l'en-tête HTTP.
  const signatureHeader = req.get("X-Hub-Signature-256");

  if (!signatureHeader) {    
    return false;
  }

  const expectedSignature = "sha256=" + crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signatureHeader, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {  

    return false;
  }

  // Comparaison en temps constant pour éviter les attaques timing.
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
s
// Endpoint de supervision simple pour vérifier que le service répond.
app.get("/status", (req, res) => {
  res.status(200).json({
    service: "skillhub-webhook-server",
    status: "running",
    signature_check: "enabled",
    timestamp: new Date().toISOString()
  });
});

// Point d'entrée des webhooks GitHub.
app.post("/webhook", (req, res) => {
  const githubEvent = req.get("X-GitHub-Event") || "unknown";
  const githubDelivery = req.get("X-GitHub-Delivery") || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";

  console.log("Webhook reçu");
  console.log(`Event       : ${githubEvent}`);
  console.log(`Delivery ID : ${githubDelivery}`);
  console.log(`User-Agent  : ${userAgent}`);

  const isValidSignature = verifyGitHubSignature(req);

  // Rejette toute requête non authentifiée par la signature GitHub.
  if (!isValidSignature) {
    console.error("Signature invalide ou absente.");
    return res.status(401).json({
      status: "error",
      message: "Signature GitHub invalide"
    });
  }

  // Pour l'instant, seul l'événement push est traité.
  if (githubEvent !== "push") {
    return res.status(202).json({
      status: "ignored",
      message: "Événement reçu mais non traité pour le moment",
      event: githubEvent
    });
  }

  const branch = req.body?.ref || "inconnue";
  const repository = req.body?.repository?.full_name || "inconnu";
  const author = req.body?.pusher?.name || "inconnu";
  const commitMessage = req.body?.head_commit?.message || "aucun message";

  console.log("Signature   : valide");
  console.log(`Branche     : ${branch}`);
  console.log(`Dépôt       : ${repository}`);
  console.log(`Auteur      : ${author}`);
  console.log(`Commit      : ${commitMessage}`);

  // Réponse concise confirmant la bonne réception du webhook authentifié.
  return res.status(200).json({
    status: "ok",
    message: "Webhook GitHub authentifié et reçu avec succès",
    branch,
    repository,
    author
  });
});

// Démarrage du serveur HTTP.
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});