import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ensureDB } from './db.js';
import ingestRouter from './routes/ingest.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

ensureDB();
app.use('/api', ingestRouter);
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => console.log(`Vaultly API on http://localhost:${PORT}`));
