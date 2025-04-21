import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 8080;

// __dirname shim for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage setup for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ v0Flow agent is running and healthy.');
});

// Upload and unzip endpoint
app.post('/upload', upload.single('zip'), (req, res) => {
  try {
    const filePath = req.file.path;
    const unzipPath = path.join(__dirname, 'unzipped');

    if (!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath);
    }

    const zip = new AdmZip(filePath);
    zip.extractAllTo(unzipPath, true);

    res.status(200).send('✅ File uploaded and unzipped successfully.');
  } catch (error) {
    console.error('❌ Error unzipping file:', error);
    res.status(500).send('❌ Error processing file.');
  }
});

app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`);
});