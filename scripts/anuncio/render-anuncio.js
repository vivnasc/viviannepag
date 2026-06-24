/* eslint-disable */
// Gera o MP4 do ANÚNCIO do Amparo ponta a ponta, reusando a IA da casa:
//   voz  → ElevenLabs eleven_v3 (a tua voz clonada)
//   cena → Kling (anima a capa) via Replicate; se não houver token, Ken Burns
//   texto→ Puppeteer + Fraunces/Outfit (tipografia da casa), molduras transparentes
//   som  → música "Ancient Ground" por baixo da voz (amix)
//   junta→ ffmpeg (espelha render-series.js)   ·   publica → Supabase Storage
//
// Uso (no GitHub Actions, ou local para testar os PNGs):
//   node scripts/anuncio/render-anuncio.js            → render completo (precisa ffmpeg + chaves)
//   node scripts/anuncio/render-anuncio.js --pngs     → só gera as molduras PNG (teste local)
//   VARIANTE=B node ...                                → usa o guião B (reconhecimento)
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const TMP = path.join(ROOT, '.anuncio-tmp');
const SO_PNGS = process.argv.includes('--pngs');
const VAR = (process.env.VARIANTE || 'A').toUpperCase();

// ───────────────────────── GUIÃO (edita aqui) ─────────────────────────
// intro = molduras de gancho sobre a cena, SEM voz (só música).
// falas = a tua narração (uma frase por entrada); cada uma vira voz + legenda.
// fim   = cartão final com a capa e o convite.
const GUIOES = {
  A: {
    capaPng: 'ficcao-plano/AMPARO-capa-pt.png',
    klingPrompt:
      'Gentle, very slow cinematic motion: thin chimney smoke rising and drifting over the terracotta rooftops, the single warm-lit window softly flickering, two or three swallows crossing the blue-dusk sky, a faint shimmer on the quiet river, a slow push-in. The hands stay perfectly still and intact. Warm, tender, painterly, calm. No people moving, no camera shake, no morphing.',
    intro: [
      { texto: 'Há mulheres que seguram\ntoda a gente.', st: 0.6, en: 3.4 },
      { texto: 'E que ninguém segura.', st: 3.7, en: 5.4 },
    ],
    introDur: 5.6,
    falas: [
      'A Amparo apanha o filho antes de cada queda há trinta e seis anos.',
      'Este é o ano em que aprende que as mãos também se pousam.',
      'Escrevi este romance de dentro. Hoje é oferta: o livro inteiro, sem pedir nada.',
      'Lê o primeiro capítulo. Vê se te reconheces.',
    ],
    fim: { titulo: 'As Mãos de Amparo', cta: 'lê o primeiro capítulo · grátis', site: 'viviannedossantos.com' },
  },
  B: {
    capaPng: 'ficcao-plano/AMPARO-capa-pt.png',
    klingPrompt:
      'Gentle, very slow cinematic motion: thin chimney smoke rising, the warm-lit window flickering, swallows crossing the dusk sky, slow push-in on the cupped hands holding the little house. Hands stay still and intact. Warm, painterly, calm. No people moving, no camera shake, no morphing.',
    intro: [
      { texto: 'Se és a pessoa a quem todos\nligam quando precisam…', st: 0.6, en: 4.2 },
      { texto: '…e ninguém liga só para\nsaber de ti.', st: 4.5, en: 7.2 },
    ],
    introDur: 7.4,
    falas: [
      'Este livro é para ti.',
      'As Mãos de Amparo é o meu primeiro romance, e é oferta.',
      'O livro inteiro, sem pedir nada. Começa por um capítulo que lês sem pagar.',
      'Talvez te reconheças.',
    ],
    fim: { titulo: 'As Mãos de Amparo', cta: 'um romance para quem carrega de mais · grátis', site: 'viviannedossantos.com' },
  },
};
const G = GUIOES[VAR] || GUIOES.A;

const W = 1080, H = 1920, FPS = 30;
const GAP = 0.28;       // pausa entre falas
const FADE = 0.4;       // fade das molduras
const FIM_DUR = 5.5;    // duração do cartão final
const MUSICA_VOL = 0.2; // música por baixo da voz

// ───────────────────────── helpers ─────────────────────────
const sh = (cmd) => cp.execSync(cmd, { stdio: 'inherit', cwd: ROOT });
const sho = (cmd) => cp.execSync(cmd, { cwd: ROOT }).toString().trim();
function probeDur(file) {
  return parseFloat(sho(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`)) || 0;
}

// fontes da casa embebidas (molde do capa-compor.js)
function fontFace(fam, w, st, file) {
  const dir = fam === 'Fraunces' ? 'fraunces' : 'outfit';
  const base = path.dirname(require.resolve(`@fontsource/${dir}/package.json`));
  const b64 = fs.readFileSync(path.join(base, 'files', `${file}.woff2`)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url('data:font/woff2;base64,${b64}') format('woff2')}`;
}
const FONTS = [
  ['Fraunces', 300, 'normal', 'fraunces-latin-300-normal'],
  ['Fraunces', 600, 'normal', 'fraunces-latin-600-normal'],
  ['Fraunces', 300, 'italic', 'fraunces-latin-300-italic'],
  ['Outfit', 500, 'normal', 'outfit-latin-500-normal'],
].map((a) => fontFace(...a)).join('\n');

let _browser = null;
async function pngDeHtml(html, out) {
  const puppeteer = require('puppeteer');
  if (!_browser) _browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await _browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
    *{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px}</style></head><body>${html}</body></html>`, { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
}

// moldura de texto grande, centrada (gancho)
const htmlCartao = (texto) => `<div style="width:${W}px;height:${H}px;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 90px">
  <p style="font-family:'Fraunces',serif;font-weight:300;color:#F6EDE0;font-size:78px;line-height:1.22;letter-spacing:-.01em;white-space:pre-line;text-shadow:0 3px 30px rgba(12,8,18,.85)">${texto}</p></div>`;

// legenda (terço inferior), com um leve fundo para legibilidade
const htmlLegenda = (texto) => `<div style="position:absolute;left:0;right:0;bottom:240px;display:flex;justify-content:center;padding:0 80px">
  <p style="font-family:'Fraunces',serif;font-weight:300;color:#fff;font-size:52px;line-height:1.3;text-align:center;background:rgba(18,14,22,.42);padding:18px 30px;border-radius:18px;text-shadow:0 2px 16px rgba(12,8,18,.8)">${texto}</p></div>`;

// cartão final: a capa + convite
function htmlFim(capaB64, fim) {
  return `<div style="width:${W}px;height:${H}px;background:#1b1612;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px;padding:60px">
    <img src="data:image/png;base64,${capaB64}" style="width:62%;border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.5)"/>
    <div style="text-align:center">
      <p style="font-family:'Fraunces',serif;font-weight:600;color:#F6EDE0;font-size:62px;margin-bottom:18px">${fim.titulo}</p>
      <p style="font-family:'Fraunces',serif;font-style:italic;font-weight:300;color:#E9B98F;font-size:40px;margin-bottom:30px">${fim.cta}</p>
      <p style="font-family:'Outfit',sans-serif;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:#C9A98E;font-size:26px">${fim.site}</p>
    </div></div>`;
}

// ───────────────────────── voz (ElevenLabs) ─────────────────────────
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY || process.env.XI_API_KEY;
const ELEVEN_VOICE = process.env.ELEVEN_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || process.env.VOICE_ID;
async function tts(texto, out) {
  if (!ELEVEN_KEY || !ELEVEN_VOICE) throw new Error('faltam ELEVENLABS_API_KEY / ELEVEN_VOICE_ID');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_v3' }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

// ───────────────────────── cena (Kling via Replicate) ou Ken Burns ─────────────────────────
const REPLICATE = process.env.REPLICATE_API_TOKEN;
async function klingAnima(capaUrl, out) {
  const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';
  const corpo = (campo) => ({ input: { prompt: G.klingPrompt, negative_prompt: 'text, watermark, distortion, morphing, extra fingers, fast motion, camera shake', duration: 10, [campo]: capaUrl } });
  let r = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST', headers: { Authorization: `Bearer ${REPLICATE}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify(corpo('start_image')),
  });
  if (r.status === 422) r = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST', headers: { Authorization: `Bearer ${REPLICATE}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
    body: JSON.stringify(corpo('image')),
  });
  if (!r.ok) throw new Error(`kling ${r.status}: ${(await r.text()).slice(0, 160)}`);
  let pred = await r.json();
  for (let i = 0; i < 60 && pred.status !== 'succeeded' && pred.status !== 'failed'; i++) {
    await new Promise((s) => setTimeout(s, 3000));
    pred = await (await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${REPLICATE}` } })).json();
  }
  if (pred.status !== 'succeeded') throw new Error('kling não terminou');
  const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  fs.writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
function kenBurns(capa, dur, out) {
  // empurra-lente lento sobre a capa (fallback sem IA): 9:16, fps fixos
  const frames = Math.ceil(dur * FPS);
  sh(`ffmpeg -y -loop 1 -i "${capa}" -vf "scale=1400:-1,zoompan=z='min(zoom+0.0006,1.12)':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1" -t ${dur} -c:v libx264 -pix_fmt yuv420p "${out}"`);
}

// ───────────────────────── música ─────────────────────────
function faixaUrl() {
  const n = String(((new Date().getDate()) % 100) + 1).padStart(2, '0');
  return `https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-${n}.mp3`;
}

// ───────────────────────── upload (Supabase) ─────────────────────────
async function publicar(file) {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const dest = `anuncios/amparo-${VAR.toLowerCase()}-${Date.now()}.mp4`;
  const { error } = await sb.storage.from('viviannepag-assets').upload(dest, fs.readFileSync(file), { contentType: 'video/mp4', upsert: true });
  if (error) throw new Error('upload: ' + error.message);
  return sb.storage.from('viviannepag-assets').getPublicUrl(dest).data.publicUrl;
}

// ───────────────────────── montagem ─────────────────────────
async function main() {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const capaAbs = path.join(ROOT, G.capaPng);
  const capaB64 = fs.readFileSync(capaAbs).toString('base64');

  // 1. molduras PNG (sempre — é o que valido localmente)
  console.log('· molduras de texto…');
  const overlays = []; // {png, st, en, fadeOut}
  for (let i = 0; i < G.intro.length; i++) {
    const o = G.intro[i], png = path.join(TMP, `intro${i}.png`);
    await pngDeHtml(htmlCartao(o.texto), png);
    overlays.push({ png, st: o.st, en: o.en, fadeOut: true });
  }
  const fimPng = path.join(TMP, 'fim.png');
  await pngDeHtml(htmlFim(capaB64, G.fim), fimPng);

  if (SO_PNGS) { console.log('✓ PNGs em', TMP, '(modo --pngs, sem ffmpeg/voz)'); await _browser?.close(); return; }

  // 2. voz: uma fala por frase, para sincronizar a legenda
  console.log('· voz (ElevenLabs)…');
  const falas = [];
  let tVoz = G.introDur;
  for (let i = 0; i < G.falas.length; i++) {
    const mp3 = path.join(TMP, `fala${i}.mp3`);
    await tts(G.falas[i], mp3);
    const d = probeDur(mp3);
    const legenda = path.join(TMP, `leg${i}.png`);
    await pngDeHtml(htmlLegenda(G.falas[i]), legenda);
    overlays.push({ png: legenda, st: tVoz, en: tVoz + d, fadeOut: true });
    falas.push({ mp3, st: tVoz, d });
    tVoz += d + GAP;
  }
  await _browser?.close();
  const TOTAL = Math.max(tVoz, G.introDur) + FIM_DUR;
  // cartão final: cobre tudo no fim
  overlays.push({ png: fimPng, st: TOTAL - FIM_DUR, en: TOTAL, fadeOut: false });

  // 3. faixa de voz contínua: silêncio(intro) + falas com pausas
  console.log('· junta a voz…');
  const vozLista = path.join(TMP, 'voz.txt');
  const partes = [`file 'sil.wav'`];
  sh(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${G.introDur} "${path.join(TMP, 'sil.wav')}"`);
  for (let i = 0; i < falas.length; i++) {
    sh(`ffmpeg -y -i "${falas[i].mp3}" -ar 44100 -ac 1 "${path.join(TMP, `f${i}.wav`)}"`);
    partes.push(`file 'f${i}.wav'`);
    if (i < falas.length - 1) { sh(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${GAP} "${path.join(TMP, `g${i}.wav`)}"`); partes.push(`file 'g${i}.wav'`); }
  }
  fs.writeFileSync(vozLista, partes.join('\n'));
  sh(`ffmpeg -y -f concat -safe 0 -i "${vozLista}" -c copy "${path.join(TMP, 'voz.wav')}"`);

  // 4. cena de fundo (Kling ou Ken Burns), em loop até TOTAL
  const bgRaw = path.join(TMP, 'bg-raw.mp4');
  let temMotion = false;
  if (REPLICATE) {
    try {
      console.log('· cena animada (Kling)…');
      // a capa tem de ter URL pública; usa a capa-composta do Storage do Amparo
      const capaUrl = `${(process.env.SUPABASE_URL || 'https://tdytdamtfillqyklgrmb.supabase.co').replace(/\/$/, '')}/storage/v1/object/public/viviannepag-assets/romances/rom-01-amparo/capa-composta-pt.png`;
      await klingAnima(capaUrl, bgRaw); temMotion = true;
    } catch (e) { console.log('  (Kling falhou, uso Ken Burns):', e.message); }
  }
  const bg = path.join(TMP, 'bg.mp4');
  if (temMotion) {
    sh(`ffmpeg -y -stream_loop -1 -t ${TOTAL} -i "${bgRaw}" -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1" -an -c:v libx264 -pix_fmt yuv420p -t ${TOTAL} "${bg}"`);
  } else {
    console.log('· cena (Ken Burns sobre a capa)…');
    kenBurns(capaAbs, TOTAL, bg);
  }

  // 5. música por baixo
  const mus = path.join(TMP, 'mus.mp3');
  let temMusica = false;
  try { const r = await fetch(faixaUrl()); if (r.ok) { fs.writeFileSync(mus, Buffer.from(await r.arrayBuffer())); temMusica = true; } } catch {}

  // 6. ffmpeg final: bg + overlays (fade/enable) + voz (+música amix)
  console.log('· montagem final…');
  const ins = [`-i "${bg}"`, ...overlays.map((o) => `-loop 1 -t ${TOTAL} -i "${o.png}"`), `-i "${path.join(TMP, 'voz.wav')}"`];
  if (temMusica) ins.push(`-i "${mus}"`);
  const idxVoz = 1 + overlays.length;
  const idxMus = idxVoz + 1;
  const fc = [];
  fc.push(`[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1[b]`);
  overlays.forEach((o, i) => {
    const fo = o.fadeOut ? `,fade=t=out:st=${(o.en - FADE).toFixed(2)}:d=${FADE}:alpha=1` : '';
    fc.push(`[${i + 1}:v]format=rgba,fade=t=in:st=${o.st.toFixed(2)}:d=${FADE}:alpha=1${fo}[o${i}]`);
  });
  let prev = 'b';
  overlays.forEach((o, i) => { const out = i === overlays.length - 1 ? 'v' : `c${i}`; fc.push(`[${prev}][o${i}]overlay=enable='between(t,${o.st.toFixed(2)},${o.en.toFixed(2)})'[${out}]`); prev = out; });
  let aMap;
  if (temMusica) { fc.push(`[${idxVoz}:a]apad[vz]`, `[${idxMus}:a]volume=${MUSICA_VOL},afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5[mu]`, `[vz][mu]amix=inputs=2:duration=longest:dropout_transition=0[a]`); aMap = '[a]'; }
  else { fc.push(`[${idxVoz}:a]apad[a]`); aMap = '[a]'; }
  const out = path.join(TMP, `anuncio-${VAR}.mp4`);
  sh(`ffmpeg -y ${ins.join(' ')} -filter_complex "${fc.join(';')}" -map "[v]" -map "${aMap}" -r ${FPS} -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -t ${TOTAL} -movflags +faststart "${out}"`);

  // 7. publicar
  console.log('· a publicar…');
  const url = await publicar(out);
  console.log('\n✓ ANÚNCIO PRONTO:', url);
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
