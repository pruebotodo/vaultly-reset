import fs from 'fs';
import OpenAI from 'openai';

export async function transcribeAudio(audioPath) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[Vaultly] OPENAI_API_KEY no definido. Se generará una transcripción mínima.');
    return 'Transcripción no disponible (no se configuró OPENAI_API_KEY).';
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL_TRANSCRIBE || 'whisper-1';
  const fileStream = fs.createReadStream(audioPath);
  const resp = await openai.audio.transcriptions.create({ file: fileStream, model });
  return (resp.text || '').trim();
}
