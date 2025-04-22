import express from 'express'
import multer from 'multer'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8080
const upload = multer({ dest: 'uploads/' })

// Health check endpoint
app.get('/health', (_req, res) => {
  res.send('✅ v0Flow Agent is live!')
})

// Self-ping to keep alive (Render handles this but good for redundancy/logging)
setInterval(() => {
  console.log('💓 Agent heartbeat...')
}, 60000)

// File upload endpoint
app.post('/upload', upload.single('zipFile'), async (req, res) => {
  try {
    const filePath = req.file.path
    const zip = new AdmZip(filePath)
    const extractPath = path.join(__dirname, 'extracted')
    zip.extractAllTo(extractPath, true)
    console.log(`✅ Extracted ZIP contents to: ${extractPath}`)

    res.status(200).send('✅ ZIP file uploaded and extracted.')
  } catch (error) {
    console.error('❌ Error processing ZIP:', error)
    res.status(500).send('❌ Failed to process ZIP file.')
  }
})

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`)
})
