import express from "express";

const app = express();
// Port configurable via l'environnement pour s'adapter au local, conteneur et CI.
const PORT = process.env.WEBHOOK_PORT || 4000;

app.use(
  express.json({
    // Conserve le corps brut pour une future verification de signature GitHub.
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Endpoint de sante simple pour supervision (Docker, load balancer, etc.).
app.get("/status", (req, res) => {
  res.status(200).json({
    service: "skillhub-webhook-server",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/webhook", (req, res) => {
  const githubEvent = req.get("X-GitHub-Event") || "unknown";
  const githubDelivery = req.get("X-GitHub-Delivery") || "unknown";
  const githubSignature = req.get("X-Hub-Signature-256") || "absent";

  console.log("Webhook reçu");
  console.log(`Event       : ${githubEvent}`);
  console.log(`Delivery ID : ${githubDelivery}`);
  console.log(
    `Signature   : ${githubSignature !== "absent" ? "présente" : "absente"}`,
  );

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

  console.log(`Branche     : ${branch}`);
  console.log(`Dépôt       : ${repository}`);
  console.log(`Auteur      : ${author}`);
  console.log(`Commit      : ${commitMessage}`);

  return res.status(200).json({
    status: "ok",
    message: "Webhook push reçu avec succès",
    branch,
    repository,
    author,
  });
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
