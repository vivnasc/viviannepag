/* eslint-disable */
// MONTA o MP4 do ANÚNCIO do Amparo a partir das peças que a Vivianne JÁ viu/ouviu
// no admin (sem surpresas):
//   planos → as VÁRIAS cenas do Kling que ela pré-viu (manifesto.cenas[]), a cortar
//            ao longo do vídeo; senão Ken Burns
//   voz    → a voz dela (eleven_v3) que ela pré-ouviu (manifesto.voz, COM timestamps)
//   texto  → KARAOKÊ: cada palavra acende no instante em que a voz a diz, frame a
//            frame (Puppeteer + Fraunces embebida), como nos reels dela — NÃO texto
//            parado, NÃO legenda chapada
//   som    → música "Ancient Ground" por baixo da voz (amix)
//   junta  → ffmpeg (molde do render-series.js)   ·   publica → Supabase Storage
//
// O trabalho PESADO (cena Flux + motion Kling + voz) é feito no admin (Vercel, onde
// existe a REPLICATE_API_TOKEN). Aqui só se MONTA — por isso não depende de Replicate.
//
// Uso: VARIANTE=A node scripts/anuncio/render-anuncio.js   (precisa ffmpeg + chaves)
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
const TMP = path.join(ROOT, '.anuncio-tmp');
const VAR = (process.env.VARIANTE || 'A').toUpperCase();
// MODO de junção dos planos: 'continuo' = fundidos (cinematográfico, sem cortes)
// · 'cortes' = corte seco entre cenas. As duas opções ficam à escolha dela.
const MODO = (process.env.MODO_ANUNCIO || 'continuo').toLowerCase() === 'cortes' ? 'cortes' : 'continuo';
const GUIOES = require(path.join(ROOT, 'lib', 'anuncio', 'guiao.json'));
const G = GUIOES[VAR] || GUIOES.A;

const W = 1080, H = 1920, FPS = 24;
const XFADE = 0.7;      // duração do fundido entre planos (modo contínuo)
const FADE = 0.4;       // fade dos cartões de gancho
const FIM_DUR = 5.5;    // duração do cartão final
const TAIL = 0.6;       // respiração depois da última fala, antes do cartão final
const MUSICA_VOL = 0.2; // música por baixo da voz
const BUCKET = 'viviannepag-assets';

// ───────────────────────── helpers ─────────────────────────
const sh = (cmd) => cp.execSync(cmd, { stdio: 'inherit', cwd: ROOT });
const sho = (cmd) => cp.execSync(cmd, { cwd: ROOT }).toString().trim();
const probeDur = (f) => parseFloat(sho(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`)) || 0;
async function baixar(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${r.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

// fontes da casa embebidas (molde do capa-compor.js / render anterior)
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

// ───────────────────────── manifesto (o que ela aprovou no admin) ─────────────────────────
const { createClient } = require('@supabase/supabase-js');
function sb() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}
async function lerManifesto(client) {
  try {
    const { data, error } = await client.storage.from(BUCKET).download(`anuncios/_manifesto-${VAR.toLowerCase()}.json`);
    if (error || !data) return {};
    return JSON.parse(Buffer.from(await data.arrayBuffer()).toString('utf8'));
  } catch { return {}; }
}

// ───────────────────────── voz (ElevenLabs, COM timestamps p/ karaokê) ─────────────────────────
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY || process.env.XI_API_KEY;
const ELEVEN_VOICE = process.env.ELEVEN_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || process.env.VOICE_ID;
function palavrasDeAlinhamento(a) {
  if (!a || !a.characters || !a.characters.length) return [];
  const out = []; let buf = '', t0 = 0, aberto = false;
  const fechar = (tEnd) => { const w = buf.trim(); if (w && !w.includes('[') && !w.includes(']')) out.push({ w, t0, t1: tEnd }); buf = ''; aberto = false; };
  for (let i = 0; i < a.characters.length; i++) {
    const ch = a.characters[i];
    const cs = a.character_start_times_seconds[i] ?? 0;
    const ce = a.character_end_times_seconds[i] ?? cs;
    if (/\s/.test(ch)) { if (aberto) fechar(ce); continue; }
    if (!aberto) { t0 = cs; aberto = true; }
    buf += ch;
  }
  if (aberto) fechar(a.character_end_times_seconds[a.character_end_times_seconds.length - 1] ?? t0);
  return out;
}
async function ttsTimestamps(texto, out) {
  if (!ELEVEN_KEY || !ELEVEN_VOICE) throw new Error('faltam ELEVENLABS_API_KEY / ELEVEN_VOICE_ID');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}/with-timestamps`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ text: texto, model_id: 'eleven_v3' }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  if (!j.audio_base64) throw new Error('elevenlabs: sem áudio');
  fs.writeFileSync(out, Buffer.from(j.audio_base64, 'base64'));
  const palavras = palavrasDeAlinhamento(j.alignment || j.normalized_alignment);
  return { palavras, dur: palavras.length ? palavras[palavras.length - 1].t1 : probeDur(out) };
}

// agrupa as palavras (do stream contínuo) nas FALAS, por contagem de tokens, para o
// karaokê mostrar uma fala de cada vez. Tempos relativos ao início da narração.
function agruparEmFalas(palavras, falas) {
  const grupos = []; let k = 0;
  for (const fala of falas) {
    const n = fala.trim().split(/\s+/).filter(Boolean).length;
    const ws = palavras.slice(k, k + n); k += n;
    if (ws.length) grupos.push({ words: ws.map((p) => ({ w: p.w, t0: p.t0, t1: p.t1 })) });
  }
  // sobras (se a tokenização divergir): junta à última fala
  if (k < palavras.length && grupos.length) {
    grupos[grupos.length - 1].words.push(...palavras.slice(k).map((p) => ({ w: p.w, t0: p.t0, t1: p.t1 })));
  }
  return grupos;
}

// ───────────────────────── fundo: motion (pré-visto) ou Ken Burns ─────────────────────────
function kenBurns(img, dur, out) {
  const frames = Math.ceil(dur * FPS);
  sh(`ffmpeg -y -loop 1 -i "${img}" -vf "scale=1400:-1,zoompan=z='min(zoom+0.0006,1.12)':d=${frames}:s=${W}x${H}:fps=${FPS},setsar=1" -t ${dur} -c:v libx264 -preset veryfast -pix_fmt yuv420p "${out}"`);
}

// ───────────────────────── música ─────────────────────────
function faixaUrl() {
  const n = String(((new Date().getDate()) % 100) + 1).padStart(2, '0');
  return `https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/ancient-ground/faixa-${n}.mp3`;
}

// ───────────────────────── a página do overlay (karaokê + ganchos + fim) ─────────────────────────
// Uma só página; por cada frame chamamos window.__at(t) e fotografamos com fundo
// transparente. O texto ACENDE palavra a palavra no tempo da voz (karaokê), os
// ganchos entram/saem em fade, e o cartão final cobre o fim.
function paginaOverlay(plano) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${W}px;height:${H}px;overflow:hidden}
    #root{position:relative;width:${W}px;height:${H}px}
    .gancho{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 90px}
    .gancho p{font-family:'Fraunces',serif;font-weight:300;color:#F6EDE0;font-size:78px;line-height:1.22;letter-spacing:-.01em;white-space:pre-line;text-shadow:0 3px 30px rgba(12,8,18,.9)}
    .kar{position:absolute;left:0;right:0;bottom:300px;display:flex;justify-content:center;padding:0 70px}
    .kar .box{max-width:900px;background:rgba(16,12,20,.62);padding:22px 36px;border-radius:24px;text-align:center}
    .kar span{font-family:'Fraunces','Georgia','Times New Roman',serif;font-weight:600;font-size:62px;line-height:1.3;text-shadow:0 2px 12px rgba(0,0,0,.95)}
    .fim{position:absolute;inset:0;background:#1b1612;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px;padding:60px}
    .fim img{width:62%;border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
    .fim .t{font-family:'Fraunces',serif;font-weight:600;color:#F6EDE0;font-size:62px;margin-bottom:18px;text-align:center}
    .fim .c{font-family:'Fraunces',serif;font-style:italic;font-weight:300;color:#E9B98F;font-size:40px;margin-bottom:30px;text-align:center}
    .fim .s{font-family:'Outfit',sans-serif;font-weight:500;letter-spacing:.26em;text-transform:uppercase;color:#C9A98E;font-size:26px;text-align:center}
  </style></head><body><div id="root"></div>
  <script>
    var P = ${JSON.stringify(plano)};
    var root = document.getElementById('root');
    function clamp(x){return x<0?0:(x>1?1:x);}
    window.__at = function(t){
      // cartão final cobre tudo
      if (t >= P.fimStart){
        var op = clamp((t - P.fimStart)/0.5);
        root.innerHTML = '<div class="fim" style="opacity:'+op.toFixed(3)+'">'
          + (P.capa ? '<img src="'+P.capa+'"/>' : '')
          + '<div><div class="t">'+P.fim.titulo+'</div><div class="c">'+P.fim.cta+'</div><div class="s">'+P.fim.site+'</div></div></div>';
        return;
      }
      // ganchos (intro)
      for (var i=0;i<P.intro.length;i++){
        var g = P.intro[i];
        if (t >= g.st - ${FADE} && t <= g.en + ${FADE}){
          var fin = clamp((t - g.st)/${FADE});
          var fout = clamp((g.en - t)/${FADE});
          var o = Math.min(fin, fout);
          if (o > 0){ root.innerHTML = '<div class="gancho" style="opacity:'+o.toFixed(3)+'"><p>'+g.texto.replace(/\\n/g,'<br>')+'</p></div>'; return; }
        }
      }
      // karaokê: a fala ativa (a última cujo início já passou)
      var fala=null;
      for (var j=0;j<P.falas.length;j++){ if (t >= P.falas[j].words[0].t0) fala = P.falas[j]; }
      if (fala){
        var last = fala.words[fala.words.length-1];
        var vis = clamp((t - fala.words[0].t0 + ${FADE})/${FADE}) * clamp((last.t1 + ${TAIL} - t)/${FADE});
        var html = '';
        for (var w=0; w<fala.words.length; w++){
          var p = fala.words[w];
          var cor, op;
          if (t >= p.t1){ cor='#F6EDE0'; op='1'; }            // já dita
          else if (t >= p.t0){ cor='#E9B98F'; op='1'; }       // a dizer agora
          else { cor='#F6EDE0'; op='0.5'; }                   // por dizer
          html += '<span style="color:'+cor+';opacity:'+op+'">'+p.w+'</span> ';
        }
        root.innerHTML = '<div class="kar" style="opacity:'+clamp(vis).toFixed(3)+'"><div class="box">'+html+'</div></div>';
        return;
      }
      root.innerHTML = '';
    };
  </script></body></html>`;
}

// ───────────────────────── upload ─────────────────────────
async function publicar(client, file) {
  const dest = `anuncios/amparo-${VAR.toLowerCase()}-${Date.now()}.mp4`;
  const { error } = await client.storage.from(BUCKET).upload(dest, fs.readFileSync(file), { contentType: 'video/mp4', upsert: true });
  if (error) throw new Error('upload: ' + error.message);
  return client.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
}

// ───────────────────────── montagem ─────────────────────────
async function main() {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const client = sb();
  const man = await lerManifesto(client);

  // 1. VOZ + timing (a que ela pré-ouviu; senão gera agora)
  const vozMp3 = path.join(TMP, 'voz-fala.mp3');
  let palavras;
  if (man.voz && man.voz.url && Array.isArray(man.voz.palavras) && man.voz.palavras.length) {
    console.log('· voz: a usar a que foi pré-ouvida no admin');
    await baixar(man.voz.url, vozMp3);
    palavras = man.voz.palavras;
  } else {
    console.log('· voz: a gerar agora (ElevenLabs, com timestamps)…');
    const r = await ttsTimestamps(G.falas.join(' '), vozMp3);
    palavras = r.palavras;
  }
  const narrDur = probeDur(vozMp3);
  const falasKar = agruparEmFalas(palavras, G.falas).map((f) => ({
    words: f.words.map((p) => ({ w: p.w, t0: +(G.introDur + p.t0).toFixed(3), t1: +(G.introDur + p.t1).toFixed(3) })),
  }));
  const ultimoFim = falasKar.length ? falasKar[falasKar.length - 1].words.slice(-1)[0].t1 : G.introDur + narrDur;
  const fimStart = ultimoFim + TAIL;
  const TOTAL = +(fimStart + FIM_DUR).toFixed(2);

  // 2. faixa de voz: silêncio(intro) + narração
  console.log('· faixa de voz…');
  sh(`ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${G.introDur} "${path.join(TMP, 'sil.wav')}"`);
  sh(`ffmpeg -y -i "${vozMp3}" -ar 44100 -ac 1 "${path.join(TMP, 'narr.wav')}"`);
  fs.writeFileSync(path.join(TMP, 'voz.txt'), `file 'sil.wav'\nfile 'narr.wav'`);
  sh(`ffmpeg -y -f concat -safe 0 -i "${path.join(TMP, 'voz.txt')}" -c copy "${path.join(TMP, 'voz.wav')}"`);

  // 3. fundo: SEQUÊNCIA de planos (cada cena um plano que CORTA ao longo do vídeo).
  // Divide o tempo total pelos planos prontos; cada plano vira um segmento (motion em
  // loop até ao seu tempo, ou Ken Burns se só tiver imagem). Junta os segmentos por
  // corte seco. Sem planos → cena única antiga / Ken Burns sobre a capa (retrocompat).
  const bg = path.join(TMP, 'bg.mp4');
  const capaAbs = path.join(ROOT, G.capaPng);
  // planos pela ORDEM do guião: cada cena com motion/imagem entra; a cena com
  // usarCapa usa SEMPRE a capa real do livro (Ken Burns, texto nítido). As que ela
  // ainda não gerou ficam de fora da sequência.
  const cenasG = Array.isArray(G.cenas) ? G.cenas : [];
  const planos = [];
  for (let i = 0; i < cenasG.length; i++) {
    const m = (Array.isArray(man.cenas) && man.cenas[i]) || {};
    // um clip escolhido/gerado MANDA sobre a capa por defeito (ela pode pôr uma
    // animação da biblioteca no plano da capa).
    if (m.motionUrl || m.cenaUrl) planos.push({ motionUrl: m.motionUrl, cenaUrl: m.cenaUrl });
    else if (cenasG[i] && cenasG[i].usarCapa) planos.push({ capa: true });
  }
  if (!planos.length && (man.motionUrl || man.cenaUrl)) planos.push({ motionUrl: man.motionUrl, cenaUrl: man.cenaUrl });
  // diagnóstico claro: que tem cada plano (MOTION = mexe · imagem-fixa = Ken Burns)
  console.log('· planos:', planos.length ? planos.map((p, i) => `${i + 1}:${p.capa ? 'capa' : (p.motionUrl ? 'MOTION' : 'imagem-fixa')}`).join(' · ') : 'nenhum');
  const semMotion = planos.filter((p) => !p.capa && !p.motionUrl && p.cenaUrl).length;
  if (semMotion) console.log(`· AVISO: ${semMotion} plano(s) sem motion → saem como imagem fixa. Gera o motion (🎬 pôr a mexer) ANTES de montar.`);

  async function segmentoDePlano(p, dur, out) {
    if (p.capa) {
      const img = out.replace(/\.mp4$/, '.jpg');
      fs.copyFileSync(capaAbs, img);
      kenBurns(img, dur, out);
    } else if (p.motionUrl) {
      const raw = out.replace(/\.mp4$/, '-raw.mp4');
      await baixar(p.motionUrl, raw);
      // movimento CONTÍNUO (cinematográfico), NUNCA em loop: se o clip chega ao tempo
      // do plano, corta-se; se for curto, ABRANDA-SE (setpts) para encher — nunca repete.
      const cd = probeDur(raw) || dur;
      const corte = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1`;
      const vf = cd >= dur ? corte : `setpts=${(dur / cd).toFixed(4)}*PTS,${corte}`;
      sh(`ffmpeg -y -i "${raw}" -vf "${vf}" -an -c:v libx264 -preset veryfast -pix_fmt yuv420p -t ${dur} "${out}"`);
    } else {
      const img = out.replace(/\.mp4$/, '.jpg');
      await baixar(p.cenaUrl, img);
      kenBurns(img, dur, out);
    }
  }

  if (planos.length === 0) {
    console.log('· fundo: Ken Burns sobre a capa (sem planos gerados)…');
    const cena = path.join(TMP, 'cena.jpg');
    fs.copyFileSync(path.join(ROOT, G.capaPng), cena);
    kenBurns(cena, TOTAL, bg);
  } else if (planos.length === 1) {
    console.log('· fundo: 1 plano (movimento contínuo)…');
    await segmentoDePlano(planos[0], TOTAL, bg);
  } else if (MODO === 'cortes') {
    // CORTES: cada plano é um segmento; junta-se por corte seco.
    console.log(`· fundo: ${planos.length} planos · CORTES secos…`);
    const segBase = TOTAL / planos.length;
    const segs = [];
    for (let i = 0; i < planos.length; i++) {
      const dur = +((i === planos.length - 1 ? TOTAL - segBase * (planos.length - 1) : segBase)).toFixed(2);
      const seg = path.join(TMP, `seg${i}.mp4`);
      await segmentoDePlano(planos[i], dur, seg);
      segs.push(seg);
    }
    fs.writeFileSync(path.join(TMP, 'segs.txt'), segs.map((s) => `file '${s}'`).join('\n'));
    sh(`ffmpeg -y -f concat -safe 0 -i "${path.join(TMP, 'segs.txt')}" -vf "fps=${FPS},setsar=1" -c:v libx264 -preset veryfast -pix_fmt yuv420p -t ${TOTAL} "${bg}"`);
  } else {
    // CONTÍNUO (cinematográfico): planos FUNDIDOS uns nos outros (xfade), sem cortes.
    // Cada segmento é maior XFADE para o tempo total bater certo depois dos fundidos.
    const n = planos.length;
    const seg = +(((TOTAL + (n - 1) * XFADE) / n)).toFixed(3);
    console.log(`· fundo: ${n} planos · CONTÍNUO (fundidos)…`);
    const segs = [];
    for (let i = 0; i < n; i++) {
      const s = path.join(TMP, `seg${i}.mp4`);
      await segmentoDePlano(planos[i], seg, s);
      segs.push(s);
    }
    const ins = segs.map((s) => `-i "${s}"`).join(' ');
    const fc = [];
    let prev = '[0:v]'; let off = seg - XFADE;
    for (let i = 1; i < n; i++) {
      const lbl = i === n - 1 ? '[vbg]' : `[x${i}]`;
      fc.push(`${prev}[${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${off.toFixed(3)}${lbl}`);
      prev = lbl; off += seg - XFADE;
    }
    sh(`ffmpeg -y ${ins} -filter_complex "${fc.join(';')}" -map "[vbg]" -r ${FPS} -c:v libx264 -preset veryfast -pix_fmt yuv420p -t ${TOTAL} "${bg}"`);
  }

  // 4. overlay: karaokê + ganchos + cartão final, frame a frame (Puppeteer)
  console.log('· overlay (karaokê) frame a frame…');
  const capaB64 = fs.readFileSync(path.join(ROOT, G.capaPng)).toString('base64');
  const plano = {
    introDur: G.introDur, fimStart, total: TOTAL,
    intro: G.intro, falas: falasKar,
    fim: G.fim, capa: `data:image/png;base64,${capaB64}`,
  };
  const ovDir = path.join(TMP, 'ov');
  fs.mkdirSync(ovDir, { recursive: true });
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(paginaOverlay(plano), { waitUntil: 'load' });
  await page.evaluateHandle('document.fonts.ready');
  const N = Math.ceil(TOTAL * FPS);
  for (let i = 0; i < N; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.__at(tt), t);
    await page.screenshot({ path: path.join(ovDir, `f${String(i).padStart(5, '0')}.png`), clip: { x: 0, y: 0, width: W, height: H }, omitBackground: true });
  }
  await browser.close();
  console.log(`· ${N} frames de overlay`);

  // 5. ÁUDIO FINAL — um único ficheiro PCM com a duração EXATA (TOTAL), pronto a colar.
  // É montado AQUI (fora do passe pesado): voz padada a TOTAL + música (se houver),
  // mistura com duração=first (a voz, finita). Assim o passe final NÃO filtra áudio —
  // evita o "Queue input is backward in time" do AAC que travava o ffmpeg a 0.017x.
  console.log('· áudio final…');
  const vozFull = path.join(TMP, 'voz-full.wav');
  sh(`ffmpeg -y -i "${path.join(TMP, 'voz.wav')}" -af apad -t ${TOTAL} -ar 44100 -ac 2 "${vozFull}"`);
  const audioFinal = path.join(TMP, 'audio.wav');
  let temMusica = false;
  const mus = path.join(TMP, 'mus.mp3');
  try { const r = await fetch(faixaUrl()); if (r.ok) { fs.writeFileSync(mus, Buffer.from(await r.arrayBuffer())); temMusica = true; } } catch {}
  if (temMusica) {
    const musFull = path.join(TMP, 'mus-full.wav');
    sh(`ffmpeg -y -i "${mus}" -af "volume=${MUSICA_VOL},apad,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5" -t ${TOTAL} -ar 44100 -ac 2 "${musFull}"`);
    sh(`ffmpeg -y -i "${vozFull}" -i "${musFull}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=0[a]" -map "[a]" -t ${TOTAL} -ar 44100 -ac 2 "${audioFinal}"`);
  } else {
    fs.copyFileSync(vozFull, audioFinal);
  }

  // 6. ffmpeg final: bg + sequência de overlay + áudio já pronto (só colar, sem filtrar
  //    áudio). bg já é W×H@FPS, por isso não se re-escala. -preset veryfast acelera o x264.
  console.log('· montagem final…');
  const out = path.join(TMP, `anuncio-${VAR}.mp4`);
  sh(`ffmpeg -y -i "${bg}" -framerate ${FPS} -i "${path.join(ovDir, 'f%05d.png')}" -i "${audioFinal}" -filter_complex "[1:v]format=rgba[ov];[0:v][ov]overlay=0:0:shortest=1,format=yuv420p[v]" -map "[v]" -map 2:a -r ${FPS} -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 192k -t ${TOTAL} -movflags +faststart "${out}"`);

  // 7. publicar
  console.log('· a publicar…');
  const url = await publicar(client, out);
  console.log('\n✓ ANÚNCIO PRONTO:', url);
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
