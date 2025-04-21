import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "v0Flow Agent is running." });
});

app.get("/health", (req, res) => {
  res.send("Healthy");
});

// Upload and process v0 zip
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const zip = new AdmZip(file.path);
  const zipEntries = zip.getEntries();

  const outputDir = `unzipped/${Date.now()}`;
  fs.mkdirSync(outputDir, { recursive: true });
  zip.extractAllTo(outputDir, true);

  // You would then parse files & update GitHub
  res.send({ status: "success", extractedTo: outputDir });
});

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});
