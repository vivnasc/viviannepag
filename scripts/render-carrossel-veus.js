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
// MODO=carrossel: em vez de MP4, gera cada slide como IMAGEM 4:5 (carrossel de
// imagens a deslizar, como o da Crescer). Vazio = comportamento de sempre (MP4).
const MODO = (process.env.MODO || '').trim();
const modoCarrossel = MODO === 'carrossel';
const BUCKET = 'viviannepag-assets';
const SEG = 5.5; // segundos por slide (tempo de leitura; 3.5 era rapido demais nos reels de varios slides)
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
  // DIAGNÓSTICO do motion: a peça tem clip do Kling guardado? (theme.soulab.clipUrl)
  console.log(`[clip] theme.soulab.clipUrl = ${col.theme?.soulab?.clipUrl ? col.theme.soulab.clipUrl.slice(-60) : 'NENHUM (a peça não tem motion → sai a imagem + câmara)'}`);

  const formato = col.theme?.formato;
  const duasFaces = col.theme?.subtipo === 'duasfaces'; // MÃE: 1 reel, 2 FACES (dor -> revelação) num só MP4
  const nbeats = col.theme?.subtipo === 'nbeats'; // TARDE: N beats sobre 1 cena dramática (1 só MP4)
  const visual = col.theme?.subtipo === 'visual'; // VISUAL (vir): 1 cena de luz + 1 linha
  const carta = col.theme?.subtipo === 'carta'; // CARTA DE RENOMEAR (vir): tipográfica, abre página a página
  const kinetic = !modoCarrossel && formato === 'reel' && (col.theme?.subtipo === 'kinetico' || col.theme?.subtipo === 'domingo' || duasFaces || nbeats || visual || carta); // frase/beats com motion
  // ÁUDIO PRÓPRIO da peça (som da cena OU música ambiente, gerado no estúdio e
  // guardado em theme.soulab.somUrl). Se existir, é o áudio do reel — vale para o
  // SOULAB E para o MÉTODO VS (partilham o mesmo estúdio de som). ANTES isto só lia
  // o som das peças 'soulab', por isso o método caía no Ancient Ground mesmo com som
  // gerado — era o bug do «Ancient Ground a sair no render». Agora lê sempre.
  const somSoulab = col.theme?.soulab?.somUrl || null;
  // A loja (Carrosséis dos 7 Véus) é a ÚNICA que usa o Ancient Ground por default.
  // O método e o soulab NUNCA usam Ancient Ground: ou têm áudio próprio (somSoulab)
  // ou ficam sem música (silêncio), nunca o Ancient Ground que ela já não quer.
  const ehMetodoOuSoulab = ['soulab', 'metodovs', 'versoltar', 'virsoltar', 'viversoltar', 'crescer'].includes(col.theme?.marca);
  // resolve o áudio de fundo de um dia: áudio próprio > (loja) faixa do dia / Ancient
  // Ground > (método/soulab) nada. Devolve null quando não há áudio nenhum.
  const audioDeFundo = (d) => somSoulab || (ehMetodoOuSoulab ? null : (d.faixa?.url || faixaUrl(semana, d.dia)));
  const infografico = !modoCarrossel && formato === 'infografico'; // passa a ter MP4 animado (camada a camada)
  // sinais / o que ninguem / uma ideia: passaram a REELS MP4 (usam o ramo
  // generico Ken Burns + musica, como Ca em Casa e I am a Hero). Ja nao ha
  // carrossel de imagens nesta conta (o carrossel quase nao gera alcance).
  const carrossel = false;
  // MODO=carrossel => só imagens (cada slide um PNG 4:5), sem MP4. (como os aneis)
  const soImagens = modoCarrossel || formato === 'aneis';
  // MODO=carrossel: as telas saem NATIVAS em 4:5 (1080x1350) — o feed do Instagram
  // recusa 9:16 no carrossel (barras pretas). Antes saíam 1920 e eram "encaixadas".
  const H = formato === 'aneis' ? 1080 : (formato === 'infografico' || carrossel || modoCarrossel) ? 1350 : 1920;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'veu-'));
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const resultados = [];

  for (const d of dias) {
    const slides = d.slides || [];
    if (!slides.length) continue;
    const diaDir = path.join(tmp, `dia-${d.dia}`);
    fs.mkdirSync(diaDir, { recursive: true });

    // ── CARROSSEL (sinais / o que ninguem / uma ideia): so PNGs 4:5, sem MP4.
    // Guarda os URLs em dias[].imagens para poderem ser publicados no Instagram. ──
    if (carrossel) {
      const imagensDia = [];
      for (let i = 0; i < slides.length; i++) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
        const url = `${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=${i}&solo=1`;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
        const pngPath = path.join(diaDir, `c${i}.png`);
        await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
        await page.close();
        const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/slide-${i}.png`;
        const { error: pe } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(pngPath), { contentType: 'image/png', upsert: true });
        if (!pe) imagensDia.push(`${supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl}?v=${Date.now()}`);
        console.log(`[carrossel] dia ${d.dia} slide ${i}`);
      }
      resultados.push({ dia: d.dia, videoUrl: null, imagens: imagensDia });
      console.log(`[dia ${d.dia}] carrossel: ${imagensDia.length} imagens`);
      continue;
    }

    // ── KINETIC: frase com motion (typewriter). Captura frame a frame
    // conduzindo window.__setKProg e monta MP4 a partir da sequencia. ──
    if (kinetic) {
      // TEMPO DE LEITURA (sem voz): ~4.8s por beat — dá tempo de LER cada linha
      // (3.4s era rápido demais). Com voz, a duração é a da narração (mais abaixo).
      const FPS = 25;
      // SOULAB / MÉTODO VS · tempo POR MOMENTO à escolha dela (slides[0].segPorMomento,
      // em segundos); sem escolha, 7s — 5.5s era rápido demais para LER cada momento (ela
      // teve de re-renderizar imensos clips por isso). A pré-visualização do admin lê o
      // MESMO valor → o que vê é o que sai (vale para o Soulab E para o Método VS).
      const soulabSeg = Math.min(12, Math.max(3, Number(slides[0]?.segPorMomento) || 7));
      const ehMetodoVS = ['metodovs', 'versoltar', 'virsoltar', 'viversoltar'].includes(col.theme?.marca);
      // o tempo POR MOMENTO vale para TODO o Método VS (mãe E filhas) e o Soulab —
      // ANTES só 'metodovs' entrava aqui, por isso as FILHAS (versoltar/virsoltar/
      // viversoltar) ignoravam o tempo e saíam sempre rápidas. Agora respeitam-no.
      const seqPorMomento = (col.theme?.marca === 'soulab' || ehMetodoVS) && slides.length > 1;
      // FRAME ÚNICO do Método VS (manhã/filhas = 1 só linha): a duração passa a ser o
      // tempo escolhido por ela (soulabSeg, 7s por defeito), não 6.5s fixo — senão a
      // frase única lia-se rápido demais e o slider não a controlava.
      const frameUnicoMetodoVS = ehMetodoVS && slides.length <= 1 && !duasFaces && !nbeats && !carta && !visual;
      let DUR = duasFaces ? 17 : nbeats ? Math.max(16, Math.round(4.8 * slides.length)) : carta ? Math.max(16, Math.round(4.6 * slides.length)) : seqPorMomento ? Math.max(8, Math.round(soulabSeg * slides.length)) : visual ? Math.max(9, Math.round(soulabSeg)) : frameUnicoMetodoVS ? soulabSeg : 8;
      // VOZ (narração): se o post tem voz, ELA MANDA — a duração do reel passa a ser a
      // da narração e os slides avançam ao ritmo dela (a frase no ecrã = a que é dita
      // = karaokê ao nível da frase). Guardado por d.vozUrl (a loja não tem voz).
      let vozOk = false;
      if (d.vozUrl) {
        try {
          const vr = await fetch(d.vozUrl);
          if (vr.ok) {
            fs.writeFileSync(path.join(diaDir, 'voz.mp3'), Buffer.from(await vr.arrayBuffer()));
            const dur = parseFloat(execSync('ffprobe -v error -show_entries format=duration -of csv=p=0 voz.mp3', { cwd: diaDir }).toString().trim());
            if (dur && isFinite(dur) && dur > 1) { DUR = Math.ceil(dur) + 1; vozOk = true; }
          }
        } catch (e) { console.log(`[voz] ${e.message}`); }
      }
      const N = Math.round(FPS * DUR);
      // KARAOKÊ palavra-a-palavra: se a voz traz timestamps de palavra, o prog é LINEAR
      // (a página acende cada palavra pelo tempo real); senão, distribui por frase.
      const temPalavras = Array.isArray(d.vozPalavras) && d.vozPalavras.length > 0;
      // fronteiras de tempo por beat (proporcionais ao tamanho do texto ≈ tempo falado),
      // para o slide certo estar no ecrã enquanto a sua linha é narrada.
      const txts = (slides || []).map((s) => (s.texto || '').trim());
      const nb = Math.max(1, txts.length);
      const pesos = txts.map((t) => Math.max(8, t.length));
      const somaP = pesos.reduce((a, b) => a + b, 0) || 1;
      const fronteiras = [0]; let acc = 0;
      for (const p of pesos) { acc += p / somaP; fronteiras.push(acc); }
      const progKaraoke = (tf) => {
        let k = 0; while (k < nb - 1 && tf >= fronteiras[k + 1]) k++;
        const span = (fronteiras[k + 1] - fronteiras[k]) || 1;
        const inner = Math.max(0, Math.min(1, (tf - fronteiras[k]) / span));
        return Math.min(1, (k + inner) / nb);
      };
      // SINCRONIA REAL texto<->voz: em vez de estimar pelo tamanho do texto, usa os TEMPOS
      // REAIS das palavras (vozPalavras) para saber quando cada momento é FALADO, e move o
      // prog (e o typewriter) a esse ritmo. Aplica-se aos reels de sequência (Soulab/Método
      // VS) e ao frame único do método, que revelam por prog. fronteirasV em fração de ÁUDIO.
      const audioDur = (temPalavras && d.vozPalavras.length) ? (Number(d.vozPalavras[d.vozPalavras.length - 1].t1) || DUR) : DUR;
      let fronteirasV = fronteiras;
      if (temPalavras) {
        const wc = txts.map((t) => t.split(/\s+/).filter(Boolean).length);
        const tot = wc.reduce((a, b) => a + b, 0);
        if (tot > 0) {
          const fr = [0]; let idx = 0;
          for (let m = 0; m < wc.length; m++) { idx += wc[m]; const w = d.vozPalavras[Math.min(idx, d.vozPalavras.length) - 1]; fr.push(Math.min(1, (w ? Number(w.t1) : audioDur) / audioDur)); }
          fronteirasV = fr;
        }
      }
      const progSeq = (tf) => {
        const ta = Math.min(1, (tf * DUR) / audioDur); // fração de vídeo -> fração de áudio
        let k = 0; while (k < nb - 1 && ta >= fronteirasV[k + 1]) k++;
        const span = (fronteirasV[k + 1] - fronteirasV[k]) || 1;
        const inner = Math.max(0, Math.min(1, (ta - fronteirasV[k]) / span));
        return Math.min(1, (k + inner) / nb);
      };
      // O Método VS com voz+palavras passa a usar KARAOKÊ (KaraokeMetodo), que precisa de prog
      // LINEAR (timeS = tempo real). Por isso o progSeq (typewriter ao ritmo da voz) fica só
      // para o Soulab; o método com voz vai linear.
      const usaProgSeq = vozOk && !ehMetodoVS && (seqPorMomento || col.theme?.marca === 'soulab');
      const framesDir = path.join(diaDir, 'frames');
      fs.mkdirSync(framesDir, { recursive: true });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      // &dur=DUR: a duração REAL do reel, para o karaoke acender as palavras pelo tempo
      // do vídeo (e não pelo da voz, que é mais curta com o +1s de respiro).
      const url = `${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=0&dur=${DUR}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      // DIAGNÓSTICO: a página montou e CARREGOU o vídeo do clip? (readyState>=2 e vw>0 = ok)
      try {
        const ci = await page.evaluate(() => {
          const v = document.querySelector('video.clip-bg');
          if (!v) return 'SEM <video clip-bg> (saiu imagem + câmara, não o clip)';
          return `video.clip-bg src=…${(v.currentSrc || v.src || '').slice(-32)} readyState=${v.readyState} vw=${v.videoWidth}`;
        });
        console.log(`[clip] ${ci}`);
      } catch (e) { console.log(`[clip] diag falhou: ${e.message}`); }
      for (let i = 0; i < N; i++) {
        const tf = i / (N - 1);
        // sequência Soulab/Método VS com voz: move ao ritmo REAL das palavras (sincroniza);
        // KaraokeMetodo (a página acende as palavras sozinha) fica linear; sem palavras, estima.
        const prog = usaProgSeq ? progSeq(tf) : (vozOk && !temPalavras) ? progKaraoke(tf) : tf;
        await page.evaluate((p) => window.__setKProg && window.__setKProg(p), prog);
        await new Promise((r) => setTimeout(r, 35));
        await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      }
      await page.close();
      console.log(`[kinetic] dia ${d.dia}: ${N} frames${vozOk ? ' (voz)' : ''}`);

      // audio: a VOZ (se houver) é o áudio principal e NÃO faz loop (é a duração).
      // Decisão da Vivianne: quando HÁ voz, mistura-se por baixo o Ancient Ground
      // baixinho (voz à frente, AG atrás) — em todas as contas com voz. Sem voz, o
      // som ambiente próprio faz loop como antes (e o método nunca usa Ancient Ground).
      let temAudio = false; let vozAudio = false; let agBed = false;
      if (vozOk && fs.existsSync(path.join(diaDir, 'voz.mp3'))) {
        temAudio = true; vozAudio = true;
        try {
          const agr = await fetch(faixaUrl(semana, d.dia)); // leito Ancient Ground (varia por dia)
          if (agr.ok) { fs.writeFileSync(path.join(diaDir, 'ag.mp3'), Buffer.from(await agr.arrayBuffer())); agBed = true; }
        } catch (e) { console.log(`[ag bed] ${e.message}`); }
      } else {
        const aUrl = audioDeFundo(d);
        if (aUrl) { try { const ar = await fetch(aUrl); if (ar.ok) { fs.writeFileSync(path.join(diaDir, 'audio.mp3'), Buffer.from(await ar.arrayBuffer())); temAudio = true; } } catch (e) { console.log(`[audio] ${e.message}`); } }
      }

      // video da sequencia. Voz = áudio direto (sem loop). Som ambiente = LOOP
      // (-stream_loop) + -shortest corta no fim do vídeo.
      let videoUrl = null;
      try {
        const vf = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p';
        if (vozAudio && agBed) {
          // VOZ à frente + Ancient Ground baixinho atrás (mix): voz (input 1) a cheio,
          // AG (input 2) em loop a volume baixo; amix com normalize=0 para a voz não baixar.
          execSync(`ffmpeg -y -framerate ${FPS} -i frames/f%04d.png -i voz.mp3 -stream_loop -1 -i ag.mp3 -filter_complex "[0:v]${vf}[vout];[2:a]volume=0.14[bed];[1:a][bed]amix=inputs=2:duration=first:normalize=0[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -r 30 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        } else {
          const audioArg = vozAudio ? '-i voz.mp3' : '-stream_loop -1 -i audio.mp3';
          const inputs = `-framerate ${FPS} -i frames/f%04d.png${temAudio ? ` ${audioArg}` : ''}`;
          const maps = temAudio ? '-map 0:v -map 1:a -c:a aac -b:a 160k -shortest' : '-map 0:v';
          execSync(`ffmpeg -y ${inputs} ${maps} -c:v libx264 -r 30 -pix_fmt yuv420p -vf "${vf}" -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        }
        const filePath = `carrossel-veus/${SLUG}/dia-${d.dia}.mp4`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(diaDir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
        if (upErr) console.error(`[upload mp4] ${upErr.message}`);
        else videoUrl = `${supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl}?v=${Date.now()}`;
      } catch (e) { console.error(`[kinetic mp4] ${e.message}`); }

      // poster: ultimo frame (frase completa) como imagem
      const imagensDia = [];
      try {
        // capa: no reel de 2 faces, o gancho é a DOR (face 1), por isso a capa sai
        // de um frame da 1.ª metade (face 1 completa), não do fim (revelação).
        const coverIdx = duasFaces ? Math.round((N - 1) * 0.42) : nbeats ? Math.round((N - 1) * 0.08) : (N - 1);
        const last = path.join(framesDir, `f${String(coverIdx).padStart(4, '0')}.png`);
        const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/cover.png`;
        const { error: ce } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(last), { contentType: 'image/png', upsert: true });
        if (!ce) imagensDia.push(`${supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl}?v=${Date.now()}`);
      } catch (e) { console.log(`[poster] ${e.message}`); }

      resultados.push({ dia: d.dia, videoUrl, imagens: imagensDia });
      console.log(`[dia ${d.dia}] kinetic mp4=${videoUrl ? 'ok' : 'falhou'}`);
      continue;
    }

    // ── INFOGRAFICO: gera DUAS coisas — (a) o PNG 4:5 para o feed (estatico,
    // prog=1) e (b) um MP4 9:16 onde cada camada entra a vez (conduzido por
    // window.__setKProg, igual ao cinetico). Reels rendem muito mais que estatico. ──
    if (infografico) {
      const imagensInfo = [];
      // (a) PNG estatico 4:5 para o feed
      try {
        const p0 = await browser.newPage();
        await p0.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
        await p0.goto(`${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=0`, { waitUntil: 'networkidle0', timeout: 60000 });
        await p0.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
        const feedPng = path.join(diaDir, 'feed.png');
        await p0.screenshot({ path: feedPng, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
        await p0.close();
        const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/slide-0.png`;
        const { error: pe } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(feedPng), { contentType: 'image/png', upsert: true });
        if (!pe) imagensInfo.push(`${supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl}?v=${Date.now()}`);
      } catch (e) { console.log(`[info feed] ${e.message}`); }

      // (b) MP4 9:16 animado (camada a camada). Mais longo = tempo de leitura.
      const FPS = 25, DUR = 19, N = FPS * DUR;
      const framesDir = path.join(diaDir, 'frames');
      fs.mkdirSync(framesDir, { recursive: true });
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      await page.goto(`${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=0&video=1`, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      for (let i = 0; i < N; i++) {
        const prog = Math.min(1, (i / (N - 1)) / 0.8); // revela ate 80%, segura cheio no fim
        await page.evaluate((p) => window.__setKProg && window.__setKProg(p), prog);
        await new Promise((r) => setTimeout(r, 30));
        await page.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      }
      await page.close();
      console.log(`[infografico] dia ${d.dia}: ${N} frames`);

      let temAudio = false;
      const aUrl = audioDeFundo(d);
      if (aUrl) { try { const ar = await fetch(aUrl); if (ar.ok) { fs.writeFileSync(path.join(diaDir, 'audio.mp3'), Buffer.from(await ar.arrayBuffer())); temAudio = true; } } catch (e) { console.log(`[audio] ${e.message}`); } }

      let videoUrl = null;
      try {
        const inputs = `-framerate ${FPS} -i frames/f%04d.png${temAudio ? ' -i audio.mp3' : ''}`;
        const maps = temAudio ? '-map 0:v -map 1:a -c:a aac -b:a 160k -shortest' : '-map 0:v';
        execSync(`ffmpeg -y ${inputs} ${maps} -c:v libx264 -r 30 -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p" -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        const filePath = `carrossel-veus/${SLUG}/dia-${d.dia}.mp4`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(diaDir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
        if (upErr) console.error(`[upload mp4] ${upErr.message}`);
        else videoUrl = `${supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl}?v=${Date.now()}`;
      } catch (e) { console.error(`[info mp4] ${e.message}`); }

      resultados.push({ dia: d.dia, videoUrl, imagens: imagensInfo });
      console.log(`[dia ${d.dia}] infografico mp4=${videoUrl ? 'ok' : 'falhou'}`);
      continue;
    }

    // 1. screenshot de cada slide (PNG) + upload como imagem do carrossel
    const imagensDia = [];
    for (let i = 0; i < slides.length; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: H, deviceScaleFactor: 1 });
      const url = `${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=${i}&solo=1`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
      const pngPath = path.join(diaDir, `s${i}.png`);
      await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1080, height: H } });
      await page.close();
      // O Instagram RECUSA 9:16 (0.562) no carrossel de FEED: so aceita entre
      // 3:4 e 1.91:1. Por isso, quando o slide e 1080x1920, gera-se uma versao
      // 4:5 (1080x1350) que encaixa o slide INTEIRO (sem cortar texto nem
      // imagens) e preenche os lados com a cor de fundo. O MP4 fica 9:16.
      // EXCECAO: o Ca em Casa e o I am a Hero saem como REEL, e a CAPA (slide 0)
      // e a miniatura do feed. Encaixar a capa em 4:5 com barras escuras faz a
      // grelha do perfil "nao preencher". Por isso a capa destes fica full-bleed
      // 9:16 (preenche a grelha, como os reels cineticos que ja enchem).
      const capaReelFullBleed = (formato === 'banda' || formato === 'heroi') && i === 0;
      let uploadPath = pngPath;
      if (H === 1920 && !capaReelFullBleed) {
        const feedPath = path.join(diaDir, `s${i}_feed.png`);
        try {
          execSync(`ffmpeg -y -i "${pngPath}" -vf "scale=-1:1350,pad=1080:1350:(ow-iw)/2:0:color=0x0F0F1A" "${feedPath}"`, { stdio: 'ignore' });
          uploadPath = feedPath;
        } catch (e) { console.log(`[feed 4:5] falhou dia ${d.dia} slide ${i}: ${e.message}`); }
      }
      // upload da imagem do slide (versao 4:5 para o carrossel de feed)
      const dest = `carrossel-veus/${SLUG}/dia-${d.dia}/slide-${i}.png`;
      const { error: pngErr } = await supabase.storage.from(BUCKET).upload(dest, fs.readFileSync(uploadPath), { contentType: 'image/png', upsert: true });
      // CACHE-BUSTING: o ficheiro fica no MESMO caminho (upsert), mas o CDN serve a
      // versao antiga ~1h pelo URL. Um ?v=timestamp por render forca a versao nova
      // (senao re-renderizar nao muda nada no admin/feed). Ver CLAUDE.md.
      if (!pngErr) imagensDia.push(`${supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl}?v=${Date.now()}`);
      console.log(`[shot] dia ${d.dia} slide ${i}`);
    }

    // Infografico = so imagem (sem audio/video).
    let videoUrl = null;
    if (!soImagens) {
      // 2. audio do dia
      const aUrl = audioDeFundo(d);
      let temAudio = false;
      if (aUrl) try {
        const ar = await fetch(aUrl);
        if (ar.ok) { fs.writeFileSync(path.join(diaDir, 'audio.mp3'), Buffer.from(await ar.arrayBuffer())); temAudio = true; }
        else console.log(`[audio] ${ar.status} ${aUrl}`);
      } catch (e) { console.log(`[audio] erro ${e.message}`); }

      // 3b. CAPA ANIMADA (loja): o slide 0 (o gancho) revela-se com movimento —
      // o topo floresce e a frase escreve-se palavra a palavra — capturado frame
      // a frame conduzindo __setKProg (como os reels cinéticos). Entra no
      // slideshow no lugar do slide 0 estático. Se falhar, cai no render de
      // sempre (capaFramesDir = null).
      let capaFramesDir = null;
      const capaFps = 30, capaN = Math.round(capaFps * 4.6);
      if (slides.length >= 2 && slides[0]?.tipo === 'capa') {
        try {
          capaFramesDir = path.join(diaDir, 'capa');
          fs.mkdirSync(capaFramesDir, { recursive: true });
          const cp = await browser.newPage();
          await cp.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
          await cp.goto(`${SITE_URL}/render-veu?slug=${encodeURIComponent(SLUG)}&dia=${d.dia}&idx=0`, { waitUntil: 'networkidle0', timeout: 60000 });
          await cp.waitForSelector('body[data-slide-ready="true"]', { timeout: 30000 }).catch(() => {});
          for (let i = 0; i < capaN; i++) {
            const prog = Math.min(1, (i / (capaN - 1)) / 0.72); // escreve-se até 72%, segura cheio no fim
            await cp.evaluate((p) => window.__setKProg && window.__setKProg(p), prog);
            await new Promise((r) => setTimeout(r, 30));
            await cp.screenshot({ path: path.join(capaFramesDir, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
          }
          await cp.close();
          // monta os frames num clip de VÍDEO real (30fps). Um input de vídeo
          // encaixa no xfade do slideshow; o input image2 (frames soltos) dava
          // "Failed to configure output pad on xfade / Invalid argument" e caía
          // no fallback estático (por isso a capa saía parada).
          execSync(`ffmpeg -y -framerate ${capaFps} -i capa/f%04d.png -c:v libx264 -r ${capaFps} -pix_fmt yuv420p capa.mp4`, { cwd: diaDir, stdio: 'inherit' });
          console.log(`[capa-motion] dia ${d.dia}: ${capaN} frames -> capa.mp4`);
        } catch (e) { console.log(`[capa-motion] falhou dia ${d.dia}: ${e.message}`); capaFramesDir = null; }
      }

      // 4. video ANIMADO: cada slide com Ken Burns (zoom lento) + fundido entre
      // slides, para Cá em Casa e I am a Hero terem movimento (como os outros).
      try {
        const FPS = 30, D = 0.8; // FPS e duração do fundido (s)
        // sobe a imagem (1.5x) e faz zoom lento dentro dela => movimento suave, sem perder nitidez
        const kb = (i, inIdx = i) => `[${inIdx}:v]scale=1620:2880:force_original_aspect_ratio=increase,crop=1620:2880,zoompan=z='min(zoom+0.0004,1.10)':d=${Math.round(SEG * FPS)}:s=1080x1920:fps=${FPS},setsar=1,format=yuv420p[v${i}]`;

        // monta o slideshow. Com animCapa, o slide 0 entra como CLIP ANIMADO
        // (frames da capa, o gancho a escrever-se) em vez de imagem estática.
        const buildSlideshow = (animCapa) => {
          if (slides.length < 2) {
            // 1 slide: só o zoom lento
            const audioIn = temAudio ? ' -i audio.mp3' : '';
            const maps = temAudio ? '-map "[vout]" -map 1:a -c:a aac -b:a 160k -shortest' : '-map "[vout]"';
            execSync(`ffmpeg -y -loop 1 -t ${SEG} -i s0.png${audioIn} -filter_complex "${kb(0).replace('[v0]', '[vout]')}" ${maps} -c:v libx264 -r ${FPS} -pix_fmt yuv420p -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
            return;
          }
          if (animCapa) {
            const capaSeg = capaN / capaFps;
            // input 0 = capa.mp4 (clip de vídeo real, 30fps; o movimento É o
            // reveal, sem zoompan); inputs 1..n = imagens dos slides com Ken Burns.
            const ins = `-i capa.mp4 ` + slides.slice(1).map((_, i) => `-loop 1 -t ${SEG} -i s${i + 1}.png`).join(' ');
            let fc = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=${FPS},format=yuv420p[v0]`;
            for (let i = 1; i < slides.length; i++) fc += `;${kb(i, i)}`;
            let last = 'v0';
            for (let i = 1; i < slides.length; i++) {
              const off = (capaSeg - D + (i - 1) * (SEG - D)).toFixed(3);
              const out = i === slides.length - 1 ? 'vout' : `x${i}`;
              fc += `;[${last}][v${i}]xfade=transition=fade:duration=${D}:offset=${off}[${out}]`;
              last = out;
            }
            const nImg = slides.length - 1;
            const totalDur = (capaSeg + nImg * SEG - nImg * D).toFixed(3);
            const audioIn = temAudio ? ' -i audio.mp3' : '';
            const maps = temAudio ? `-map "[vout]" -map ${slides.length}:a -c:a aac -b:a 160k -t ${totalDur}` : '-map "[vout]"';
            execSync(`ffmpeg -y ${ins}${audioIn} -filter_complex "${fc}" ${maps} -c:v libx264 -r ${FPS} -pix_fmt yuv420p -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
            return;
          }
          // estático (de sempre): todas as imagens com Ken Burns + fundido
          const ins = slides.map((_, i) => `-loop 1 -t ${SEG} -i s${i}.png`).join(' ');
          let fc = slides.map((_, i) => kb(i)).join(';');
          let last = 'v0';
          for (let i = 1; i < slides.length; i++) {
            const off = (i * (SEG - D)).toFixed(3);
            const out = i === slides.length - 1 ? 'vout' : `x${i}`;
            fc += `;[${last}][v${i}]xfade=transition=fade:duration=${D}:offset=${off}[${out}]`;
            last = out;
          }
          const totalDur = (slides.length * SEG - (slides.length - 1) * D).toFixed(3);
          const audioIn = temAudio ? ' -i audio.mp3' : '';
          const maps = temAudio ? `-map "[vout]" -map ${slides.length}:a -c:a aac -b:a 160k -t ${totalDur}` : '-map "[vout]"';
          execSync(`ffmpeg -y ${ins}${audioIn} -filter_complex "${fc}" ${maps} -c:v libx264 -r ${FPS} -pix_fmt yuv420p -movflags +faststart out.mp4`, { cwd: diaDir, stdio: 'inherit' });
        };

        try {
          buildSlideshow(!!capaFramesDir);
        } catch (e) {
          // se a capa animada falhar no ffmpeg, cai no render de sempre (estático)
          if (capaFramesDir) { console.log(`[capa-motion mp4] falhou, fallback estático: ${e.message}`); buildSlideshow(false); }
          else throw e;
        }

        const filePath = `carrossel-veus/${SLUG}/dia-${d.dia}.mp4`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, fs.readFileSync(path.join(diaDir, 'out.mp4')), { contentType: 'video/mp4', upsert: true });
        if (upErr) console.error(`[upload mp4] ${upErr.message}`);
        else videoUrl = `${supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl}?v=${Date.now()}`;
      } catch (e) { console.error(`[mp4] ${e.message}`); }
    }

    resultados.push({ dia: d.dia, videoUrl, imagens: imagensDia });
    console.log(`[dia ${d.dia}] ${imagensDia.length} imagens · mp4=${videoUrl ? 'ok' : (soImagens ? 'n/a' : 'falhou')}`);
  }

  await browser.close();

  // 6. grava videoUrl de volta na coleccao
  if (resultados.length) {
    // CACHE-BUSTING: o MP4 fica SEMPRE no mesmo URL (upsert), por isso o CDN servia
    // o ficheiro antigo ~1h depois de re-renderizar — parecia que o render não tinha
    // mudado nada. O ?v=carimbo muda o URL a cada render, e o player do admin mostra
    // logo o MP4 novo. (O export para o Metricool já fazia isto à parte com semCache.)
    const carimbo = Date.now();
    const comCache = (u) => (u ? `${u.split('?')[0]}?v=${carimbo}` : u);
    const novosDias = (col.dias || []).map((d) => {
      const rsd = resultados.find((x) => x.dia === d.dia);
      if (!rsd) return d;
      // MODO=carrossel: a peça passa a ser CARROSSEL de imagens — APAGA o MP4 antigo
      // (renderizado como reel noutra altura), para não ficar colado nem ser publicado.
      const novoVideo = modoCarrossel ? null : (rsd.videoUrl ? comCache(rsd.videoUrl) : d.videoUrl);
      return { ...d, videoUrl: novoVideo, imagens: rsd.imagens };
    });
    // carimba a capa como renderizada com a correção atual (ver CAPA_REV em
    // lib/render/dispatch.ts): o publicador só publica carrosséis com esta rev.
    const novoTheme = { ...(col.theme || {}), capaRev: 2 };
    const { error } = await supabase.from('carousel_collections').update({ dias: novosDias, theme: novoTheme }).eq('slug', SLUG);
    if (error) console.error(`[update] ${error.message}`);
  }
  console.log(`[done] ${resultados.length} videos`);
}

main().catch((e) => { console.error(e); process.exit(1); });
