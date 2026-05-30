#!/usr/bin/env node
/**
 * Render reels: foto MJ 9:16 + voz ElevenLabs por linha + legenda kinetic burned-in.
 *
 * Pipeline:
 *  1. Fetch manifest do site -> [{ dia, mundo, titulo, linhas[], imageUrl }]
 *  2. Por dia:
 *     a. Background PNG 1080x1920 (via ffmpeg: crop image + vignette + brand + handle drawtext)
 *     b. Por linha: TTS (cache em Storage por sha1) -> MP3 -> ffprobe duracao
 *     c. ASS subtitle com fade 240ms, timing real
 *     d. 1 ffmpeg: bg loop + concat audios (so 1o leva adelay) + subtitles filter -> MP4
 *  3. Upload MP4 + result.json
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const os = require('node:os');

const SITE_URL = process.env.SITE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID;
const JOB_ID = process.env.JOB_ID || `reels-${Date.now()}`;
const DIAS_FILTER = (process.env.DIAS_FILTER ?? '').trim();
const BUCKET = 'viviannepag-assets';
const RENDER_FOLDER = `renders/${JOB_ID}`;
const FONT_DIR = path.resolve(__dirname, 'fonts');
const FONT_NAME = 'Fraunces';

// scope=all (sem filtro) -> usar MP4 antigo se existir (resume seguro).
// scope=especifico (com dias) -> forcar re-render.
const SKIP_EXISTING = DIAS_FILTER === '';

for (const [k, v] of Object.entries({
  SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ELEVEN_API_KEY, ELEVEN_VOICE_ID,
})) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'reels-'));

// ──────────────────── utils ────────────────────

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let stdout = '', stderr = '';
    p.stdout.on('data', d => stdout += d);
    p.stderr.on('data', d => stderr += d);
    p.on('close', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exit ${code}: ${stderr.substring(0, 500)}`));
    });
  });
}

async function ffprobeDuration(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ]);
  return parseFloat(stdout.trim());
}

async function downloadToFile(url, dest, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function storagePut(pKey, buf, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(pKey, buf, {
    contentType, upsert: true,
  });
  if (error) throw new Error(`upload ${pKey}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(pKey).data.publicUrl;
}

async function storageHas(pKey) {
  const dir = pKey.substring(0, pKey.lastIndexOf('/'));
  const name = pKey.substring(pKey.lastIndexOf('/') + 1);
  try {
    const { data } = await supabase.storage.from(BUCKET).list(dir, { limit: 100 });
    return data?.some(f => f.name === name) ?? false;
  } catch { return false; }
}

async function storageDownload(pKey, dest) {
  const { data, error } = await supabase.storage.from(BUCKET).download(pKey);
  if (error || !data) throw new Error(`download ${pKey}: ${error?.message}`);
  fs.writeFileSync(dest, Buffer.from(await data.arrayBuffer()));
}

let lastResultWrite = 0;
async function writeResult(result, force = false) {
  const now = Date.now();
  if (!force && now - lastResultWrite < 2000) return;
  lastResultWrite = now;
  await storagePut(`${RENDER_FOLDER}/result.json`,
    Buffer.from(JSON.stringify(result, null, 2)), 'application/json',
  ).catch(e => console.warn('result write:', e.message));
}

// ──────────────────── TTS ────────────────────

// pKey da cache TTS: tts/{voiceId}/{sha1(ttsTexto + intent)}.mp3
// IMPORTANTE: voiceId no path para se reusar entre jobs e nao misturar vozes.
function ttsPathKey(intent, ttsTexto) {
  const h = crypto.createHash('sha1').update(`${intent}::${ttsTexto}`).digest('hex').substring(0, 16);
  return `tts/${ELEVEN_VOICE_ID}/${h}.mp3`;
}

async function gerarOuCacheTTS(intent, ttsTexto, destLocal) {
  const pKey = ttsPathKey(intent, ttsTexto);
  if (await storageHas(pKey)) {
    await storageDownload(pKey, destLocal);
    return { reused: true, pKey };
  }

  // v3: SEM voice_settings, SEM language_code (corrompe PT-PT).
  const body = {
    text: ttsTexto,
    model_id: 'eleven_v3',
  };
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`elevenlabs ${res.status}: ${t.substring(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destLocal, buf);
  await storagePut(pKey, buf, 'audio/mpeg');
  return { reused: false, pKey };
}

// ──────────────────── ASS subtitles ────────────────────

function fmtTime(s) {
  const cs = Math.round(s * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const sec = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

function escapeAssText(s) {
  return s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

// Constroi ASS: 1080x1920, Fraunces 64, branco com borda preta + sombra, fade 240ms
function buildAss(linhas, timings) {
  const head = [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: 1080',
    'PlayResY: 1920',
    'WrapStyle: 0',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Default,${FONT_NAME},64,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,5,80,80,0,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
  const events = linhas.map((l, i) => {
    const { startSec, endSec } = timings[i];
    const fadeIn = 240, fadeOut = 240;
    const txt = `{\\fad(${fadeIn},${fadeOut})}${escapeAssText(l.texto)}`;
    return `Dialogue: 0,${fmtTime(startSec)},${fmtTime(endSec)},Default,,0,0,0,,${txt}`;
  });
  return [...head, ...events].join('\n');
}

// ──────────────────── pipeline por dia ────────────────────

async function renderDia(tarefa, result) {
  const { dia, mundo, titulo, linhas, imageUrl } = tarefa;
  console.log(`\n[dia ${dia}] ${titulo} (${linhas.length} linhas)`);

  if (!imageUrl) {
    throw new Error(`sem imagem MJ para mundo=${mundo}`);
  }

  const diaDir = path.join(TMP, `dia-${dia}`);
  fs.mkdirSync(diaDir, { recursive: true });

  const mp4Key = `${RENDER_FOLDER}/dia-${String(dia).padStart(2, '0')}/reel.mp4`;
  if (SKIP_EXISTING && await storageHas(mp4Key)) {
    const url = supabase.storage.from(BUCKET).getPublicUrl(mp4Key).data.publicUrl;
    console.log(`[dia ${dia}] skip (mp4 ja existe)`);
    return { dia, mundo, titulo, url, reused: true };
  }

  // 1. download imagem fonte
  const srcImg = path.join(diaDir, 'src.jpg');
  await downloadToFile(imageUrl, srcImg);

  // 2. construir background 1080x1920 com vignette + brand + handle
  const bgPng = path.join(diaDir, 'bg.png');
  // crop ao centro para 9:16, escala 1080x1920, vignette, brand top-right, handle bottom
  const handle = '@vivianne.dos.santos';
  const fontFile = path.join(FONT_DIR, 'Fraunces.ttf');
  await run('ffmpeg', [
    '-y', '-i', srcImg,
    '-vf', [
      'scale=1080:1920:force_original_aspect_ratio=increase',
      'crop=1080:1920',
      'vignette=PI/4',
      `drawtext=fontfile=${fontFile}:text='V':fontsize=72:fontcolor=white@0.85:x=w-tw-60:y=60`,
      `drawtext=fontfile=${fontFile}:text='${handle}':fontsize=34:fontcolor=white@0.7:x=(w-tw)/2:y=h-th-80:shadowcolor=black@0.6:shadowx=2:shadowy=2`,
    ].join(','),
    '-frames:v', '1', bgPng,
  ]);

  // 3. TTS por linha + durations
  const linhaFiles = [];
  for (const linha of linhas) {
    const mp3 = path.join(diaDir, `line-${linha.idx}.mp3`);
    const { reused } = await gerarOuCacheTTS(linha.intent, linha.ttsTexto, mp3);
    const dur = await ffprobeDuration(mp3);
    linhaFiles.push({ ...linha, file: mp3, duration: dur });
    console.log(`  linha ${linha.idx} (${linha.intent})${reused ? ' [cache]' : ''} dur=${dur.toFixed(2)}s`);
  }

  // 4. timings: intro pad 600ms, gap entre linhas 350ms
  const INTRO_PAD = 0.6;
  const GAP = 0.35;
  let cursor = INTRO_PAD;
  const timings = linhaFiles.map(l => {
    const startSec = cursor;
    const endSec = cursor + l.duration;
    cursor = endSec + GAP;
    return { startSec, endSec };
  });
  const totalDur = cursor; // ultimo end + gap (gap final = breath)

  // 5. ASS
  const assPath = path.join(diaDir, 'subs.ass');
  fs.writeFileSync(assPath, buildAss(linhaFiles, timings));

  // 6. ffmpeg final: bg loop + audios concat (SO 1o leva adelay) + subtitles burn
  // input 0: bg image (loop)
  // inputs 1..N: cada mp3
  // filter_complex:
  //   [1:a]adelay=600|600,apad=pad_dur=GAP[a1]   <- so o primeiro tem adelay
  //   [2:a]apad=pad_dur=GAP[a2]
  //   ...
  //   [a1][a2]...[aN]concat=n=N:v=0:a=1[a]
  //   [0:v]subtitles='subs.ass':fontsdir=FONT_DIR[v]
  const introMs = Math.round(INTRO_PAD * 1000);
  const gapStr = GAP.toFixed(3);
  const audioFilters = linhaFiles.map((_, i) => {
    if (i === 0) {
      return `[${i + 1}:a]adelay=${introMs}|${introMs},apad=pad_dur=${gapStr}[a${i}]`;
    }
    return `[${i + 1}:a]apad=pad_dur=${gapStr}[a${i}]`;
  });
  const concatInputs = linhaFiles.map((_, i) => `[a${i}]`).join('');
  const filterComplex = [
    ...audioFilters,
    `${concatInputs}concat=n=${linhaFiles.length}:v=0:a=1[a]`,
    `[0:v]subtitles='${assPath}':fontsdir=${FONT_DIR}[v]`,
  ].join(';');

  const mp4Path = path.join(diaDir, 'reel.mp4');
  const ffArgs = [
    '-y',
    '-loop', '1', '-t', String(totalDur), '-i', bgPng,
    ...linhaFiles.flatMap(l => ['-i', l.file]),
    '-filter_complex', filterComplex,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    mp4Path,
  ];
  await run('ffmpeg', ffArgs);

  // 7. upload
  const mp4Buf = fs.readFileSync(mp4Path);
  const url = await storagePut(mp4Key, mp4Buf, 'video/mp4');
  console.log(`[dia ${dia}] ok ${(mp4Buf.length / 1024 / 1024).toFixed(2)}MB`);

  return { dia, mundo, titulo, url, duration: totalDur, reused: false };
}

// ──────────────────── main ────────────────────

async function main() {
  console.log(`[start] job=${JOB_ID} site=${SITE_URL} skipExisting=${SKIP_EXISTING}`);

  const manifestUrl = new URL(`${SITE_URL}/api/admin/estudio/render-reels-manifest`);
  manifestUrl.searchParams.set('jobId', JOB_ID);
  if (DIAS_FILTER) manifestUrl.searchParams.set('dias', DIAS_FILTER);

  const manRes = await fetch(manifestUrl.toString());
  if (!manRes.ok) throw new Error(`manifest ${manRes.status}: ${await manRes.text()}`);
  const manifest = await manRes.json();
  console.log(`[manifest] ${manifest.total} reels`);

  const result = {
    jobId: JOB_ID,
    tipo: 'reels',
    status: 'a-renderizar',
    progress: 0,
    total: manifest.tarefas.length,
    uploaded: [],
    skipped: [],
    failed: [],
    iniciadoEm: new Date().toISOString(),
  };
  await writeResult(result, true);

  for (const tarefa of manifest.tarefas) {
    try {
      const r = await renderDia(tarefa, result);
      const entry = {
        dia: r.dia, idx: 0, tipo: 'reel-video',
        filename: `dia-${String(r.dia).padStart(2, '0')}/reel.mp4`,
        url: r.url, duration: r.duration,
      };
      if (r.reused) result.skipped.push(entry);
      else result.uploaded.push(entry);
    } catch (e) {
      console.error(`[erro dia ${tarefa.dia}]`, e.message);
      result.failed.push({ dia: tarefa.dia, erro: e.message });
    }
    result.progress++;
    await writeResult(result);
  }

  result.status = result.failed.length > 0 ? 'feito-com-falhas' : 'feito';
  result.terminadoEm = new Date().toISOString();
  await writeResult(result, true);
}

main().catch(async (e) => {
  console.error('[fatal]', e);
  await writeResult({
    jobId: JOB_ID, tipo: 'reels', status: 'erro',
    erro: e.message, terminadoEm: new Date().toISOString(),
  }, true);
  process.exit(1);
});
