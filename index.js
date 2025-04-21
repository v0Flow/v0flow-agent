import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads and unzip dirs exist
const uploadsDir = path.join(__dirname, 'uploads');
const unzipDir = path.join(__dirname, 'unzipped');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(unzipDir)) fs.mkdirSync(unzipDir);

const upload = multer({ dest: uploadsDir });

app.get('/', (req, res) => {
  res.send('✅ v0Flow Agent is running');
});

app.post('/upload', upload.single('zipFile'), (req, res) => {
  try {
    const zipPath = req.file.path;
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(unzipDir, true);
    res.send('✅ ZIP extracted successfully');
  } catch (error) {
    console.error('❌ ZIP extraction error:', error);
    res.status(500).send('❌ Failed to extract ZIP');
  }
});

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});
