import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch"; // Add this line

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// Health check routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "v0Flow Agent is running." });
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});

app.get("/keep-alive", (req, res) => {
  res.send("Still here 👋");
});

// Upload handler
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

// Keep-alive heartbeats
setInterval(() => {
  console.log("💓 Agent heartbeat...");

  // Self-ping every 60 seconds to keep container warm
  fetch(`
