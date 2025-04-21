// v0Flow Agent (Railway-compatible)
// Accepts ZIP uploads → Generates + Deploys

import express from "express"
import multer from "multer"
import AdmZip from "adm-zip"
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import { Octokit } from "@octokit/rest"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const upload = multer({ dest: "uploads/" })
const PORT = process.env.PORT || 3000

const octokit = new Octokit({ auth: process.env.GITHUB_PAT })

// Utility: Deploy via Vercel CLI
function deployToVercel(localPath, projectName) {
  return new Promise((resolve, reject) => {
    exec(
      `cd ${localPath} && vercel --prod --yes --token ${process.env.VERCEL_PAT}`,
      (error, stdout, stderr) => {
        if (error) return reject(stderr)
        resolve(stdout)
      }
    )
  })
}

// Main ZIP Upload & Deploy Endpoint
app.post("/deploy", upload.single("zip"), async (req, res) => {
  const zipPath = req.file.path
  const zip = new AdmZip(zipPath)
  const tmpDir = path.join("temp", Date.now().toString())
  await fs.mkdir(tmpDir, { recursive: true })
  zip.extractAllTo(tmpDir, true)

  const repoName = `v0flow-auto-${Date.now()}`
  const owner = process.env.GITHUB_OWNER

  // Create GitHub Repo
  const repo = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    private: true,
  })

  // Init Git & Push
  exec(
    `cd ${tmpDir} && git init && git remote add origin https://$${process.env.GITHUB_PAT}@github.com/${owner}/${repoName}.git && git add . && git commit -m "init" && git push origin master`,
    async (err) => {
      if (err) return res.status(500).send("Git push failed")

      // Deploy to Vercel
      try {
        const deployOutput = await deployToVercel(tmpDir, repoName)
        res.send({ message: "Deployed", output: deployOutput })
      } catch (e) {
        res.status(500).send(`Vercel deploy error: ${e}`)
      }
    }
  )
})

app.get("/health", (req, res) => {
  res.send("v0Flow Agent running ✅")
})

app.listen(PORT, () => {
  console.log(`✅ Agent listening on port ${PORT}`)
})
