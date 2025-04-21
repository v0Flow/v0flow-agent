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

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('✅ v0Flow Agent is running');
});

app.post('/upload', upload.single('zipFile'), (req, res) => {
  const zipPath = req.file.path;
  const zip = new AdmZip(zipPath);
  zip.extractAllTo('unzipped', true);
  res.send('✅ ZIP extracted and ready for processing');
});

// Add more logic for pushing to GitHub, triggering Vercel, error handling, etc.

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});
