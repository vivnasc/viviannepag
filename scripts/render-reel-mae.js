#!/usr/bin/env node
/**
 * Render do REEL DA MAE (assinatura VDS): grava a pagina animada /render-reel-mae
 * frame a frame (Puppeteer + window.__setKProg), poe a VOZ CLONADA (ElevenLabs) por
 * cima, monta o MP4 (ffmpeg) e faz upload + writeback do videoUrl na coleccao.
 *
 * Pipeline por peca (carousel_collections, slug crescer-*, reel):
 *  1. tema + linhas (frase real minerada dos livros).
 *  2. TTS eleven_v3 (voz pura) das linhas -> voz.mp3 -> ffprobe duracao D.
 *  3. N = (D + cauda) * FPS frames; por frame __setKProg(i/(N-1)) -> screenshot.
 *  4. ffmpeg frames + voz -> MP4 1080x1920.
 *  5. upload crescer/reels/<slug>.mp4 e escreve dias[0].videoUrl na coleccao.
 */
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const SITE_URL = process.env.SITE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY || process.env.ELEVENLABS_KEY || process.env.ELEVEN_LABS_API_KEY || process.env.XI_API_KEY;
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || process.env.VOICE_ID;
const SLUG = (process.env.SLUG ?? '').trim();
const JOB_ID = process.env.JOB_ID || `reel-mae-${Date.now()}`;
const BUCKET = 'viviannepag-assets';
const FPS = 30;

for (const [k, v] of Object.entries({ SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'reelmae-'));

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d));
    p.on('close', (c) => (c === 0 ? resolve({ out, err }) : reject(new Error(`${cmd} ${c}: ${err.slice(0, 400)}`))));
  });
}
async function ffprobeDuration(file) {
  const { out } = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]);
  return parseFloat(out.trim()) || 0;
}
async function tts(texto, dest) {
  const h = crypto.createHash('sha1').update(`mae::${texto}`).digest('hex').slice(0, 16);
  const pKey = `tts/${ELEVEN_VOICE_ID}/${h}.mp3`;
  const { data: has } = await supabase.storage.from(BUCKET).list(path.dirname(pKey), { search: path.basename(pKey) });
  if (has && has.some((f) => f.name === path.basename(pKey))) {
    const { data } = await supabase.storage.from(BUCKET).download(pKey);
    fs.writeFileSync(dest, Buffer.from(await data.arrayBuffer())); return true;
  }
  if (!ELEVEN_API_KEY || !ELEVEN_VOICE_ID) return false;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`, {
    method: 'POST', headers: { 'xi-api-key': ELEVEN_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_v3' }),
  });
  if (!res.ok) { console.error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`); return false; }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  await supabase.storage.from(BUCKET).upload(pKey, buf, { contentType: 'audio/mpeg', upsert: true });
  return true;
}

function linhasDaPeca(row) {
  const slides = row?.dias?.[0]?.slides ?? [];
  const textos = slides.map((s) => (s.texto || '').trim()).filter(Boolean);
  const linhas = textos.length > 1 ? textos : [(row.brief || textos[0] || '').trim()];
  return linhas.filter(Boolean).slice(0, 4);
}

async function main() {
  let q = supabase.from('carousel_collections').select('slug, brief, dias, theme').like('slug', 'crescer-%');
  if (SLUG) q = q.eq('slug', SLUG);
  const { data, error } = await q;
  if (error) { console.error('db', error.message); process.exit(1); }
  const alvos = (data ?? []).filter((r) => r?.theme?.crescer && (SLUG || !r?.dias?.[0]?.videoUrl));
  if (!alvos.length) { console.log('nada a renderizar'); return; }
  console.log(`[reel-mae] ${alvos.length} peca(s)`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const row of alvos) {
    try {
      const tema = row.theme?.crescer?.tematica || 'consciencia';
      const linhas = linhasDaPeca(row);
      if (!linhas.length) { console.log(`[skip] ${row.slug} sem texto`); continue; }
      const dir = path.join(TMP, row.slug); const framesDir = path.join(dir, 'frames');
      fs.mkdirSync(framesDir, { recursive: true });

      // VOZ: usa a que a Vivianne JA gerou e aprovou no admin (theme.soulab.vozUrl).
      // Regra dela: o render nao gera voz nem traz surpresas; so cola o que ja existe.
      // (fallback a TTS so se, por acaso, nao houver voz pre-gerada.)
      const vozMp3 = path.join(dir, 'voz.mp3');
      const vozUrl = row.theme?.soulab?.vozUrl || null;
      let temVoz = false;
      if (vozUrl) {
        try { const r = await fetch(vozUrl); if (r.ok) { fs.writeFileSync(vozMp3, Buffer.from(await r.arrayBuffer())); temVoz = true; } } catch { /* segue sem voz */ }
      }
      if (!temVoz) temVoz = await tts(linhas.join('. '), vozMp3).catch(() => false);
      const D = temVoz ? await ffprobeDuration(vozMp3) : Math.max(6, linhas.length * 3.2);
      const N = Math.min(1200, Math.max(120, Math.round((D + 1.4) * FPS)));

      // frames (com o LAYOUT dela, para o MP4 sair igual ao pre-ver, sem surpresas)
      const layoutQ = (process.env.LAYOUT || '').trim();
      // imagem do banco (ou Flux) escolhida na geração: o MP4 sai igual ao pre-ver.
      const img = row.theme?.crescer?.img || '';
      const imgModo = row.theme?.crescer?.imgModo || '';
      const imgQ = img ? `&img=${encodeURIComponent(img)}${imgModo ? `&imgmodo=${encodeURIComponent(imgModo)}` : ''}` : '';
      const url = `${SITE_URL}/render-reel-mae?tema=${encodeURIComponent(tema)}&linhas=${encodeURIComponent(linhas.join('|'))}&seed=${encodeURIComponent(row.slug)}${imgQ}${layoutQ ? '&' + layoutQ : ''}`;
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      for (let i = 0; i < N; i++) {
        await page.evaluate((p) => window.__setKProg && window.__setKProg(p), i / (N - 1));
        await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      }
      await page.close();

      // DRONE por baixo (biblioteca): a Vivianne aplica-o no admin (theme.soulab.somUrl).
      // Vem em loop e baixinho (0.16) por baixo da voz. Ambos ja foram ouvidos por ela.
      const dronMp3 = path.join(dir, 'drone.mp3');
      const somUrl = row.theme?.soulab?.somUrl || null;
      let temDrone = false;
      if (somUrl) { try { const r = await fetch(somUrl); if (r.ok) { fs.writeFileSync(dronMp3, Buffer.from(await r.arrayBuffer())); temDrone = true; } } catch { /* segue sem drone */ } }

      // mp4 (video 0:v; voz 1:a; drone 2:a em loop). Mistura conforme o que existe.
      const outMp4 = path.join(dir, 'out.mp4');
      const args = ['-y', '-framerate', String(FPS), '-i', path.join(framesDir, 'f%04d.png')];
      if (temVoz) args.push('-i', vozMp3);
      if (temDrone) args.push('-stream_loop', '-1', '-i', dronMp3);
      args.push('-c:v', 'libx264', '-r', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');
      if (temVoz && temDrone) {
        args.push('-filter_complex', '[2:a]volume=0.16[bed];[1:a][bed]amix=inputs=2:duration=first:normalize=0[aout]', '-map', '0:v', '-map', '[aout]', '-c:a', 'aac', '-b:a', '160k', '-shortest');
      } else if (temVoz) {
        args.push('-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '160k', '-shortest');
      } else if (temDrone) {
        args.push('-filter_complex', '[1:a]volume=0.5[aout]', '-map', '0:v', '-map', '[aout]', '-c:a', 'aac', '-b:a', '160k', '-shortest');
      }
      args.push(outMp4);
      await run('ffmpeg', args, { cwd: dir, stdio: 'inherit' });

      // upload + writeback
      const filePath = `crescer/reels/${row.slug}.mp4`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(outMp4), { contentType: 'video/mp4', upsert: true });
      if (upErr) { console.error(`[upload] ${row.slug}: ${upErr.message}`); continue; }
      const videoUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl + `?v=${Date.now()}`;
      const dias = Array.isArray(row.dias) ? row.dias : [{}];
      dias[0] = { ...(dias[0] || {}), videoUrl };
      const theme = { ...(row.theme || {}), assinatura: true, video: true };
      await supabase.from('carousel_collections').update({ dias, theme }).eq('slug', row.slug);
      console.log(`[ok] ${row.slug} reel=${videoUrl}${temVoz ? ' (voz)' : ' (sem voz)'}`);
    } catch (e) { console.error(`[erro] ${row.slug}: ${e.message}`); }
  }
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
