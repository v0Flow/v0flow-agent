import express from 'express'
import multer from 'multer'
import AdmZip from 'adm-zip'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8080
const upload = multer({ dest: 'uploads/' })

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ v0Flow Agent is running!')
})

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ✨ (You can add file upload & GitHub logic here...)

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`)
})
