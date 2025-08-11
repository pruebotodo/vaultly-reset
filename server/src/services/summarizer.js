import OpenAI from 'openai';

export async function summarizeText(text, context = {}) {
  if (!text || !text.trim()) return { summary: 'Sin contenido para resumir.', keyPoints: [] };
  if (!process.env.OPENAI_API_KEY) {
    const { summary, keyPoints } = naiveExtractiveSummary(text);
    return { summary, keyPoints };
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL_SUMMARY || 'gpt-4o-mini';
  const prompt = [
    'Devuelve JSON con "summary" (5-7 líneas) y "key_points" (5-8 bullets). Español neutro.',
    context?.title ? `Título: ${context.title}` : '',
    context?.platform ? `Plataforma: ${context.platform}` : '',
    'Transcripción completa:', text
  ].filter(Boolean).join('\n');
  const resp = await openai.chat.completions.create({
    model, temperature: 0.2,
    messages: [{ role: 'system', content: 'Responde solo JSON válido.' }, { role: 'user', content: prompt }]
  });
  let content = resp.choices?.[0]?.message?.content || '{}';
  try { const p = JSON.parse(content); return { summary: p.summary || '', keyPoints: p.key_points || [] }; }
  catch { return { summary: content.slice(0, 1200), keyPoints: [] }; }
}

function naiveExtractiveSummary(text) {
  const sentences = text.split(/(?<=[\.\!\?])\s+/).filter(s => s && s.length > 30);
  const top = sentences.slice(0, 6);
  const summary = top.join(' ') || text.slice(0, 800);
  const keyPoints = top.map(s => s.length > 160 ? s.slice(0,157)+'…' : s);
  return { summary, keyPoints };
}
