import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// Health endpoints
app.get("/", (req, res) => {
  res.status(200).json({ message: "v0Flow Agent is running." });
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});

app.get("/keep-alive", (req, res) => {
  res.send("Still here 👋");
});

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const zip = new AdmZip(file.path);
  const outputDir = `unzipped/${Date.now()}`;
  fs.mkdirSync(outputDir, { recursive: true });
  zip.extractAllTo(outputDir, true);

  res.send({ status: "success", extractedTo: outputDir });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});

// Self-ping to keep alive
setInterval(() => {
  console.log("💓 Agent heartbeat...");
  fetch(`http://localhost:${port}/keep-alive`)
    .then((res) => res.text())
    .then((text) => console.log(`🔄 Self-ping: ${text}`))
    .catch((err) => console.error("Ping failed:", err));
}, 60 * 1000);
