// PROTÓTIPO · REEL NARRATIVO (mãe) — um vídeo CONTÍNUO de ~40s feito de clips que
// se COMPLETAM, em vez de 1 imagem em loop. A técnica: gera um clip (Kling) a
// partir da imagem da peça, tira o ÚLTIMO FRAME, gera o clip seguinte a CONTINUAR
// dali, e por aí fora; no fim cola tudo num só MP4. O texto entra depois, no render
// normal (este script só faz o vídeo de fundo contínuo, para ela ver custo+qualidade).
//
// env: SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REPLICATE_API_TOKEN, SLUG,
//      N_CLIPS? (default 4), DUR? (5|10, default 10).
//
// CUSTO: N_CLIPS gerações Kling por reel (~4). É um formato OCASIONAL, não diário.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TOKEN = process.env.REPLICATE_API_TOKEN;
const SLUG = process.env.SLUG;
const N_CLIPS = Math.max(2, Math.min(8, Number(process.env.N_CLIPS) || 4));
const DUR = Number(process.env.DUR) === 5 ? 5 : 10;
const MODEL = 'kwaivgi/kling-v2.5-turbo-pro';
const BUCKET = 'viviannepag-assets';

if (!SITE_URL || !SUPABASE_URL || !SUPABASE_KEY || !TOKEN || !SLUG) {
  console.error('[erro] faltam env (SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REPLICATE_API_TOKEN, SLUG)');
  process.exit(1);
}
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// BEATS de CÂMARA/movimento (não conteúdo): dão a sensação de um plano que avança e
// se completa, sem a cena derivar. Cada clip continua o anterior pelo último frame.
const BEATS = [
  'establishing the scene with a slow, gentle cinematic push-in; the elements settle into natural life',
  'the camera keeps moving in slowly, the moment deepening, soft continuous lifelike motion',
  'a gentle cinematic rise, the scene opening up, a quiet sense of lift and breath',
  'the moment resolves calmly, the camera easing, a soft sense of release and stillness',
  'a final slow drift, the scene holding, serene and complete',
];
const promptDoClip = (i) => {
  const beat = BEATS[Math.min(i, BEATS.length - 1)];
  return (
    `Photorealistic, cinematic, premium fine-art film look. CONTINUE this exact scene as ONE seamless shot: ${beat}. ` +
    'Keep the SAME subject, wardrobe, palette, lighting, setting and mood as the image; coherent continuous motion, real depth (parallax). ' +
    'No warping, no morphing, no distortion, no camera shake, no scene cuts. ' +
    'CRITICAL: absolutely NO text, letters, words, captions, subtitles, signage or logos anywhere in the frame.'
  );
};
const NEG = 'text, letters, words, captions, subtitles, signage, logo, watermark, morphing, warping, distortion, melting, glitch, extra limbs, deformed face, deformed hands, scene cut, jump cut, fast jittery motion, camera shake, strobing, flickering, low quality, blurry';

async function klingClip(imageUrl) {
  const criar = (imgField) =>
    fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait=60' },
      body: JSON.stringify({ input: { prompt: promptDoClip(klingClip._i || 0), negative_prompt: NEG, duration: DUR, [imgField]: imageUrl } }),
    });
  let res = await criar('start_image');
  if (res.status === 422) res = await criar('image');
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`);
  let pred = await res.json();
  let polls = 0;
  while (!['succeeded', 'failed', 'canceled'].includes(pred.status) && polls < 120) {
    await new Promise((r) => setTimeout(r, 3000));
    const pr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!pr.ok) throw new Error(`Replicate poll ${pr.status}`);
    pred = await pr.json();
    polls++;
  }
  if (pred.status !== 'succeeded') throw new Error(`Replicate: ${pred.error || pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  if (!out) throw new Error('Replicate: sem output');
  return out;
}

async function baixar(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}
async function subir(localPath, key, contentType) {
  const { error } = await sb.storage.from(BUCKET).upload(key, fs.readFileSync(localPath), { contentType, upsert: true });
  if (error) throw new Error(`upload ${key}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

async function main() {
  console.log(`[start] slug=${SLUG} clips=${N_CLIPS}x${DUR}s site=${SITE_URL}`);
  const r = await fetch(`${SITE_URL}/api/carrossel-veus/data?slug=${encodeURIComponent(SLUG)}`);
  if (!r.ok) throw new Error(`data ${r.status}`);
  const col = await r.json();
  const imagem0 = col?.dias?.[0]?.slides?.[0]?.imageUrl;
  if (!imagem0) throw new Error('a peça não tem imagem (gera a imagem primeiro)');

  const dir = path.join(process.cwd(), 'narrativo');
  fs.mkdirSync(dir, { recursive: true });
  const slugSeguro = SLUG.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-');
  const stamp = Date.now();

  let imagemAtual = imagem0;
  const clips = [];
  for (let i = 0; i < N_CLIPS; i++) {
    klingClip._i = i;
    console.log(`[clip ${i + 1}/${N_CLIPS}] a gerar (${DUR}s)…`);
    const clipUrl = await klingClip(imagemAtual);
    const clipPath = path.join(dir, `clip-${i}.mp4`);
    await baixar(clipUrl, clipPath);
    clips.push(clipPath);
    if (i < N_CLIPS - 1) {
      // ÚLTIMO FRAME -> imagem de início do clip seguinte (a continuidade)
      const framePath = path.join(dir, `frame-${i}.jpg`);
      execSync(`ffmpeg -y -sseof -0.3 -i "${clipPath}" -frames:v 1 -q:v 2 "${framePath}"`, { stdio: 'inherit' });
      imagemAtual = await subir(framePath, `reel-narrativo/${slugSeguro}-frame-${stamp}-${i}.jpg`, 'image/jpeg');
      console.log(`[clip ${i + 1}] último frame -> próxima imagem ok`);
    }
  }

  // cola os clips num só MP4 contínuo (re-encode para juntar em segurança)
  const lista = path.join(dir, 'lista.txt');
  fs.writeFileSync(lista, clips.map((c) => `file '${c}'`).join('\n'));
  const finalPath = path.join(dir, 'final.mp4');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${lista}" -c:v libx264 -pix_fmt yuv420p -r 30 -movflags +faststart "${finalPath}"`, { stdio: 'inherit' });
  const finalUrl = await subir(finalPath, `reel-narrativo/${slugSeguro}-${stamp}.mp4`, 'video/mp4');
  console.log(`[ok] vídeo contínuo: ${finalUrl}`);

  // guarda na peça: vira o clip de fundo (clipUrl) e marca o MP4 final por refazer,
  // para o render normal pôr o texto por cima deste vídeo contínuo.
  try {
    const { data: row } = await sb.from('carousel_collections').select('dias, theme').eq('slug', SLUG).single();
    const theme = { ...(row?.theme || {}) };
    theme.soulab = { ...(theme.soulab || {}), clipUrl: finalUrl };
    theme.reelNarrativo = { url: finalUrl, clips: N_CLIPS, dur: DUR, criadoEm: stamp };
    const dias = Array.isArray(row?.dias) ? row.dias : [];
    if (dias[0]) dias[0].videoUrl = null;
    const { error } = await sb.from('carousel_collections').update({ theme, dias }).eq('slug', SLUG);
    if (error) console.error(`[update] ${error.message}`);
    else console.log('[ok] guardado na peça (clipUrl). Re-renderiza para pôr o texto por cima.');
  } catch (e) { console.error(`[update] ${e.message}`); }

  console.log('[done]');
}

main().catch((e) => { console.error(`[FALHOU] ${e.message}`); process.exit(1); });
