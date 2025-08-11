import youtubedl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';

export function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'X/Twitter';
  return 'Otro';
}

export async function downloadAudio(url, outFile) {
  const result = await youtubedl(url, {
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: 0,
    output: outFile,
    noWarnings: true,
    preferFreeFormats: true,
    ffmpegLocation: ffmpegPath || undefined,
    dumpSingleJson: true
  });
  let meta = {};
  try { meta = typeof result === 'string' ? JSON.parse(result) : result; } catch { meta = {}; }
  return { title: meta.title || null, uploader: meta.uploader || meta.channel || null, duration: meta.duration || null };
}
