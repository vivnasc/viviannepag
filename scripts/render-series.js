// Render das SÉRIES DIÁRIAS (VC Sabia / Hoje em Mim) em MP4 9:16.
// Para cada dia: descarrega o MOTION (vídeo da pool/MJ/Runway) e o ÁUDIO,
// fotografa a MOLDURA TRANSPARENTE frame a frame (Puppeteer, /render-veu com
// __setKProg = typewriter/bloom), e o ffmpeg sobrepõe a moldura ao motion +
// junta o áudio. Sobe o MP4 e grava dias[].videoUrl (a Publicar fica pronta).
//
// env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SERIE?, SLUGS?, FORCE?

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SERIE = (process.env.SERIE || '').trim();          // vcsabia | hojeemmim | '' (todas)
const SLUGS = (process.env.SLUGS || '').split(',').map((s) => s.trim()).filter(Boolean);
const FORCE = (process.env.FORCE || '') === '1';
const BUCKET = 'viviannepag-assets';
const FPS = 25, DUR = 9, N = FPS * DUR; // 9s por reel

if (!SITE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function baixar(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

async function main() {
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, dias, theme')
    .eq('theme->>formato', 'serie-diaria');
  if (error) throw new Error(`db: ${error.message}`);

  let cols = (data || []).filter((c) => !SERIE || (c.theme && c.theme.serie === SERIE));
  if (SLUGS.length) cols = cols.filter((c) => SLUGS.includes(c.slug));
  const comDia = cols.map((c) => ({ c, d: (Array.isArray(c.dias) && c.dias[0]) || null }));
  // dias SEM motion ("falta motion"): não dá para renderizar — conta-se e avisa-se,
  // mas NÃO é falha (a Vivianne gera o motion certo no MJ e re-renderiza).
  const semMotion = comDia.filter((x) => !(x.d && x.d.slides && x.d.slides[0] && x.d.slides[0].motionUrl));
  // ordena por data; rende os que têm motion e (sem vídeo, ou FORCE)
  const fila = comDia
    .filter((x) => x.d && x.d.slides && x.d.slides[0] && x.d.slides[0].motionUrl)
    .filter((x) => FORCE || !(x.d.videoUrl || x.d.slides[0].videoUrl))
    .sort((a, b) => String(a.c.theme.agendadoEm || '').localeCompare(String(b.c.theme.agendadoEm || '')));

  console.log(`[start] ${fila.length} a renderizar · ${semMotion.length} sem motion (saltados) · serie=${SERIE || 'todas'}`);
  if (semMotion.length) console.log(`[sem-motion] ${semMotion.map((x) => x.c.slug).join(', ')}`);
  if (!fila.length) { console.log(`[done] nada a renderizar · ${semMotion.length} sem motion`); return; }
  const cols2 = fila;
  let ok = 0; const falhas = [];

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'serie-'));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const { c, d } of cols2) {
    const slug = c.slug;
    const slide = d.slides[0];
    const dir = path.join(tmp, slug.replace(/[^a-z0-9-]/gi, '_'));
    const framesDir = path.join(dir, 'frames');
    fs.mkdirSync(framesDir, { recursive: true });
    try {
      // 1) motion + áudio
      await baixar(slide.motionUrl, path.join(dir, 'motion.mp4'));
      const audioUrl = d.faixa && d.faixa.url;
      let temAudio = false;
      if (audioUrl) { try { await baixar(audioUrl, path.join(dir, 'audio.mp3')); temAudio = true; } catch (e) { console.log(`[audio] ${slug}: ${e.message}`); } }

      // 2) moldura transparente, frame a frame (typewriter/bloom)
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      await page.goto(`${SITE_URL}/render-veu?slug=${encodeURIComponent(slug)}&dia=1&idx=0&video=1`, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      for (let i = 0; i < N; i++) {
        const prog = Math.min(1, (i / (N - 1)) / 0.82); // escreve até 82%, segura cheio no fim
        await page.evaluate((p) => window.__setKProg && window.__setKProg(p), prog);
        await new Promise((r) => setTimeout(r, 25));
        await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 }, omitBackground: true });
      }
      await page.close();
      console.log(`[frames] ${slug}: ${N}`);

      // 3) ffmpeg: motion (loop, 9:16 cover) + overlay da moldura + áudio
      const aIn = temAudio ? `-stream_loop -1 -t ${DUR} -i audio.mp3` : '';
      const aMap = temAudio ? '-map 2:a -c:a aac -b:a 160k' : '';
      const fc = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS},setsar=1[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]`;
      execSync(
        `ffmpeg -y -stream_loop -1 -t ${DUR} -i motion.mp4 -framerate ${FPS} -i frames/f%04d.png ${aIn} -filter_complex "${fc}" -map "[v]" ${aMap} -r ${FPS} -c:v libx264 -pix_fmt yuv420p -t ${DUR} -movflags +faststart out.mp4`,
        { cwd: dir, stdio: 'inherit' },
      );

      // 4) upload + grava videoUrl
      const filePath = `series-renders/${slug}.mp4`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(dir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
      if (upErr) { console.error(`[upload] ${slug}: ${upErr.message}`); falhas.push(slug); continue; }
      const url = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
      const novasDias = (Array.isArray(c.dias) ? c.dias : []).map((x, i) => {
        if (i !== 0) return x;
        const slides = (x.slides || []).map((s, j) => (j === 0 ? { ...s, videoUrl: url } : s));
        return { ...x, videoUrl: url, slides };
      });
      const novoTheme = { ...(c.theme || {}), renderEm: Date.now() };
      await supabase.from('carousel_collections').update({ dias: novasDias, theme: novoTheme }).eq('slug', slug);
      console.log(`[ok] ${slug} -> ${url}`);
      ok++;
    } catch (e) {
      console.error(`[falhou] ${slug}: ${e.message}`);
      falhas.push(slug);
    }
  }

  await browser.close();
  console.log(`[done] ${ok} feito(s) · ${falhas.length} falhado(s) · ${semMotion.length} sem motion (saltados)`);
  // verde HONESTO: o job só passa se nada falhou de verdade. Dias "sem motion"
  // são esperados (a Vivianne gera-os) e NÃO fazem o lote ficar vermelho.
  if (falhas.length) { console.error(`[falhas] ${falhas.join(', ')}`); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
