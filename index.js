import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 8080;

// Proper multer config
const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Agent is running" });
});

// Upload route — FIXED
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const zipPath = req.file.path;
    const extractPath = path.join(__dirname, "extracted");

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // Add any processing logic here
    console.log("✅ ZIP processed successfully");
    res.status(200).json({ message: "ZIP processed", extractPath });

  } catch (err) {
    console.error("Error processing ZIP:", err);
    res.status(500).json({ error: "Failed to process ZIP", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});
