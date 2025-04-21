import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();
const app = express();
const port = process.env.PORT || 8080;

const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/health", (req, res) => {
  res.send("v0Flow Agent running ✅");
});

app.post("/deploy", upload.single("zip"), async (req, res) => {
  try {
    const zip = new AdmZip(req.file.path);
    const extractPath = path.join(__dirname, "extracted");
    zip.extractAllTo(extractPath, true);

    const files = fs.readdirSync(extractPath, { withFileTypes: true });

    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const branch = process.env.GITHUB_BRANCH || "main";

    for (const file of files) {
      const filePath = path.join(extractPath, file.name);
      const content = fs.readFileSync(filePath, "utf8");
      const encodedContent = Buffer.from(content).toString("base64");

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: file.name,
        message: `Auto deploy ${file.name}`,
        content: encodedContent,
        branch,
      });
    }

    res.send("✅ Deployed and pushed to GitHub.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Deployment failed.");
  }
});

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});
