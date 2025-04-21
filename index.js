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
  await fs.mkdir(tmpDir, {
