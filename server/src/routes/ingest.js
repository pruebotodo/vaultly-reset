import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { insertItem, updateItemSummaryAndTranscript, searchItems, getItem } from '../db.js';
import { detectPlatform, downloadAudio } from '../services/downloader.js';
import { transcribeAudio } from '../services/transcriber.js';
import { summarizeText } from '../services/summarizer.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaRoot = path.resolve(__dirname, '../../media');
if (!fs.existsSync(mediaRoot)) fs.mkdirSync(mediaRoot, { recursive: true });

router.post('/ingest', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Falta url' });

    const id = uuidv4();
    const platform = detectPlatform(url);
    const outFile = path.join(mediaRoot, `${id}.mp3`);
    const meta = await downloadAudio(url, outFile);
    const { title, uploader } = meta;

    insertItem({ id, source_url: url, platform, title: title || null, author: uploader || null,
      audio_path: outFile, transcript: null, summary: null, key_points: null });

    const transcriptText = await transcribeAudio(outFile);
    const { summary, keyPoints } = await summarizeText(transcriptText, { title, platform });

    updateItemSummaryAndTranscript(id, transcriptText, summary, JSON.stringify(keyPoints || []));
    return res.json({ id, title, platform, uploader, summary, keyPoints });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
});

router.get('/items', (req, res) => res.json(searchItems(req.query.q || '')));
router.get('/items/:id', (req, res) => {
  const row = getItem(req.params.id);
  if (!row) return res.status(404).json({ error: 'No encontrado' });
  res.json(row);
});

export default router;
