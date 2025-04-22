import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/health", (req, res) => {
  res.json({ status: "🟢 Agent is healthy" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const zip = new AdmZip(req.file.path);
    const extractPath = path.join(__dirname, "extracted");

    // Ensure directory exists
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
    }

    zip.extractAllTo(extractPath, true);
    console.log("✅ ZIP file extracted.");

    return res.json({ message: "ZIP processed successfully", extractPath });
  } catch (err) {
    console.error("❌ Error processing ZIP:", err);
    return res.status(500).json({ error: "Failed to process ZIP file." });
  }
});

// ✅ Use Render-assigned port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Agent listening on port ${PORT}`);
});
