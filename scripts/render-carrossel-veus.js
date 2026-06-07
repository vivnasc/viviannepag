// Render dos Carrosseis dos 7 Veus em MP4.
// Para cada dia da coleccao: Puppeteer fotografa os 6 slides (1080x1920) na
// pagina /render-veu, ffmpeg monta um slideshow com a faixa Ancient Ground do
// dia, e faz upload do MP4 para o Supabase. Atualiza a coleccao com os videoUrl.
//
// env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SLUG, DIAS_FILTER?

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SLUG = process.env.SLUG;
const DIAS_FILTER = (process.env.DIAS_FILTER || '').split(',').map((s) => s.trim()).filter(Boolean);
const BUCKET = 'viviannepag-assets';
const SEG = 3.5; // segundos por slide
const AUDIO_BASE = 'https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground';
const NUM_FAIXAS = 100;

if (!SITE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SLUG) {
  console.error('Missing env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SLUG');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function faixaUrl(semana, dia) {
  const idx = ((Math.max(1, semana) - 1) * 7 + (Math.max(1, dia) - 1)) % NUM_FAIXAS;
  const n = String(idx + 1).padStart(2, '0');
  return `${AUDIO_BASE}/faixa-${n}.mp3`;
}

async function main() {
  console.log(`[start] slug=${SLUG} site=${SITE_URL}`);
  const r = await fetch(`${SITE_URL}/api/carrossel-veus/data?slug=${encodeURIComponent(SLUG)}`);
  if (!r.ok) throw new Error(`data ${r.status}: ${await r.text()}`);
  const col = await r.json();
  const semana = col.theme?.semana ?? 1;
  let dias = Array.isArray(col.dias) ? col.dias : [];
  if (DIAS_FILTER.length) dias = dias.filter((d) => DIAS_FILTER.includes(String(d.dia)));
  console.log(`[data] ${dias.length} dias`);

  const formato = col.theme?.formato;
  const kinetic = formato === 'reel' && col.theme?.subtipo === 'kinetico'; // frase com motion
  const soImagens = formato === 'infografico' || formato === 'aneis'; // imagem unica, sem video
  const H = formato === 'aneis' ? 1080 : formato === 'infografico' ? 1350 : 1920;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'veu-'));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const resultados = [];

  for (const d of dias) {
    const slides = d.slides || [];
    if (!slides.length) continue;
    const diaDir = path.join(tmp, `dia-${d.dia}`);
    fs.mkdirSync(diaDir, { recursive: true });

    // ── KINETIC: frase com motion (typewriter). Captura frame a frame
    // conduzindo window.__setKProg e monta MP4 a partir da sequencia. ──
    if (kinetic) {
      const FPS = 25, DUR = 7, N = FPS * DUR;
      const framesDir = path.join(diaDir, 'frames');
      fs.mkdirSync(framesDir, { recursive: true });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      const url = `${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=0`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      for (let i = 0; i < N; i++) {
        const prog = i / (N - 1);
        await page.evaluate((p) => window.__setKProg && window.__setKProg(p), prog);
        await new Promise((r) => setTimeout(r, 35));
        await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      }
      await page.close();
      console.log(`[kinetic] dia ${d.dia}: ${N} frames`);

      // audio
      let temAudio = false;
      const aUrl = d.faixa?.url || faixaUrl(semana, d.dia);
      try { const ar = await fetch(aUrl); if (ar.ok) { fs.writeFileSync(path.join(diaDir, 'audio.mp3'), Buffer.from(await ar.arrayBuffer())); temAudio = true; } } catch (e) { console.log(`[audio] ${e.message}`); }

      // video da sequencia
      let videoUrl = null;
      try {
        const inputs = `-framerate ${FPS} -i frames/f%04d.png${temAudio ? ' -i audio.mp3' : ''}`;
        const maps = temAudio ? '-map 0:v -map 1:a -c:a aac -b:a 160k -shortest' : '-map 0:v';
        execSync(`ffmpeg -y ${inputs} ${maps} -c:v libx264 -r 30 -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p" out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        const filePath = `carrossel-veus/${SLUG}/dia-${d.dia}.mp4`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(diaDir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
        if (upErr) console.error(`[upload mp4] ${upErr.message}`);
        else videoUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
      } catch (e) { console.error(`[kinetic mp4] ${e.message}`); }

      // poster: ultimo frame (frase completa) como imagem
      const imagensDia = [];
      try {
        const last = path.join(framesDir, `f${String(N - 1).padStart(4, '0')}.png`);
        const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/cover.png`;
        const { error: ce } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(last), { contentType: 'image/png', upsert: true });
        if (!ce) imagensDia.push(supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl);
      } catch (e) { console.log(`[poster] ${e.message}`); }

      resultados.push({ dia: d.dia, videoUrl, imagens: imagensDia });
      console.log(`[dia ${d.dia}] kinetic mp4=${videoUrl ? 'ok' : 'falhou'}`);
      continue;
    }

    // 1. screenshot de cada slide (PNG) + upload como imagem do carrossel
    const imagensDia = [];
    for (let i = 0; i < slides.length; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: H, deviceScaleFactor: 1 });
      const url = `${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=${i}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      const pngPath = path.join(diaDir, `s${i}.png`);
      await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1080, height: H } });
      await page.close();
      // upload da imagem do slide
      const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/slide-${i}.png`;
      const { error: pngErr } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(pngPath), { contentType: 'image/png', upsert: true });
      if (!pngErr) imagensDia.push(supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl);
      console.log(`[shot] dia ${d.dia} slide ${i}`);
    }

    // Infografico = so imagem (sem audio/video).
    let videoUrl = null;
    if (!soImagens) {
      // 2. audio do dia
      const aUrl = d.faixa?.url || faixaUrl(semana, d.dia);
      let temAudio = false;
      try {
        const ar = await fetch(aUrl);
        if (ar.ok) { fs.writeFileSync(path.join(diaDir, 'audio.mp3'), Buffer.from(await ar.arrayBuffer())); temAudio = true; }
        else console.log(`[audio] ${ar.status} ${aUrl}`);
      } catch (e) { console.log(`[audio] erro ${e.message}`); }

      // 3. lista concat
      const lista = [];
      for (let i = 0; i < slides.length; i++) { lista.push(`file 's${i}.png'`); lista.push(`duration ${SEG}`); }
      lista.push(`file 's${slides.length - 1}.png'`);
      fs.writeFileSync(path.join(diaDir, 'list.txt'), lista.join('\n'));

      // 4. video (opcional)
      try {
        const vf = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p';
        const inputs = `-f concat -safe 0 -i list.txt${temAudio ? ' -i audio.mp3' : ''}`;
        const maps = temAudio ? '-map 0:v -map 1:a -c:a aac -b:a 160k -shortest' : '-map 0:v';
        execSync(`ffmpeg -y ${inputs} ${maps} -c:v libx264 -vf "${vf}" -pix_fmt yuv420p out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        const filePath = `carrossel-veus/${SLUG}/dia-${d.dia}.mp4`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(diaDir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
        if (upErr) console.error(`[upload mp4] ${upErr.message}`);
        else videoUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
      } catch (e) { console.error(`[mp4] ${e.message}`); }
    }

    resultados.push({ dia: d.dia, videoUrl, imagens: imagensDia });
    console.log(`[dia ${d.dia}] ${imagensDia.length} imagens · mp4=${videoUrl ? 'ok' : (soImagens ? 'n/a' : 'falhou')}`);
  }

  await browser.close();

  // 6. grava videoUrl de volta na coleccao
  if (resultados.length) {
    const novosDias = (col.dias || []).map((d) => {
      const rsd = resultados.find((x) => x.dia === d.dia);
      return rsd ? { ...d, videoUrl: rsd.videoUrl ?? d.videoUrl, imagens: rsd.imagens } : d;
    });
    const { error } = await supabase.from('carousel_collections').update({ dias: novosDias }).eq('slug', SLUG);
    if (error) console.error(`[update] ${error.message}`);
  }
  console.log(`[done] ${resultados.length} videos`);
}

main().catch((e) => { console.error(e); process.exit(1); });
