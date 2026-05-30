#!/usr/bin/env node
/**
 * Editorial PDF render para ebooks da Vivianne.
 *
 * Lê content/produtos/{slug}/{slug}.md → parse título/subtítulo/capítulos
 * → fetch imagens MJ do mundo correspondente em Supabase
 * → renderiza HTML editorial → Puppeteer → MP4 PDF
 * → upload para Supabase Storage em produtos/{slug}.pdf
 *
 * Uso:
 *   SLUG=ebook-01-culpa MUNDO=freeme node scripts/render-ebook.js
 */

const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

const SLUG = process.env.SLUG || 'ebook-01-culpa';
const MUNDO = process.env.MUNDO || 'freeme';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
}

// Imagens MJ vivem em viviannepag-assets (publico). PDFs entregaveis em
// escritos (privado, lido pelo /api/download via signed URL).
const BUCKET_ASSETS = 'viviannepag-assets';
const BUCKET_PRODUTOS = 'escritos';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EBOOK_PATH = path.join(__dirname, '..', 'content', 'produtos', SLUG, `${SLUG}.md`);
const TMP_PDF = path.join('/tmp', `${SLUG}.pdf`);

const COLORS = {
  barro: '#8C4A36',
  barroEscuro: '#5A3D2E',
  barroClaro: '#9A5A43',
  areia: '#F3E4D6',
  creme: '#F1E8DD',
  cremeEscuro: '#E8DCC9',
  salvia: '#7D8A6A',
  texto: '#3D2B1F',
  textoSuave: '#6B5548',
  ouro: '#EBAE4A',
};

// ─── parsing do markdown em capitulos ───

function parseEbook(raw) {
  const { content } = matter(raw);
  const lines = content.split('\n');

  let titulo = '';
  let subtitulo = '';
  let autoria = '';
  let bio = '';
  let disclaimer = '';
  let bodyStartIdx = -1;

  // Header parsing (linhas antes do primeiro ##)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!titulo && line.startsWith('# ')) {
      titulo = line.replace('# ', '').trim();
    } else if (titulo && !subtitulo && line.startsWith('**') && line.endsWith('**')) {
      subtitulo = line.replace(/\*\*/g, '').trim();
    } else if (titulo && !autoria && line.startsWith('*Por ')) {
      autoria = line.replace(/[*]/g, '').replace('Por ', '').trim();
    } else if (autoria && !bio && line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      bio = line.replace(/^\*|\*$/g, '').trim();
    } else if (lines[i].startsWith('## ')) {
      bodyStartIdx = i;
      break;
    } else if (line.startsWith('*Este ebook')) {
      disclaimer = line.replace(/^\*|\*$/g, '').trim();
    }
  }

  // Split body em capitulos
  const body = lines.slice(bodyStartIdx).join('\n');
  const chapterRx = /^## (.+)$/gm;
  const chapters = [];
  let last = null;
  body.split('\n').forEach(line => {
    const m = line.match(/^## (.+)$/);
    if (m) {
      if (last) chapters.push(last);
      last = { title: m[1].trim(), md: '' };
    } else if (last) {
      last.md += line + '\n';
    }
  });
  if (last) chapters.push(last);

  // Strip --- separadores no fim de cada capitulo
  chapters.forEach(c => {
    c.md = c.md.replace(/\n+---\s*\n*$/, '\n').trim();
  });

  return { titulo, subtitulo, autoria, bio, disclaimer, chapters };
}

// ─── fetch imagens MJ ───

async function fetchImagensMundo(mundo) {
  // Lista todas as imagens em estudio/{mundo}/dia-*/
  const imagens = [];
  try {
    const { data: dias } = await supabase.storage.from(BUCKET_ASSETS).list(`estudio/${mundo}`, { limit: 100 });
    for (const d of dias ?? []) {
      if (!d.name?.startsWith('dia-')) continue;
      const dia = Number(d.name.replace('dia-', ''));
      const { data: files } = await supabase.storage.from(BUCKET_ASSETS).list(`estudio/${mundo}/${d.name}`, { limit: 100 });
      for (const f of files ?? []) {
        if (!f.name?.endsWith('.jpg')) continue;
        const m = f.name.match(/^slide-(\d+)-(.+)-(\d{10,13})\.jpg$/);
        if (!m) continue;
        const path = `estudio/${mundo}/${d.name}/${f.name}`;
        const url = supabase.storage.from(BUCKET_ASSETS).getPublicUrl(path).data.publicUrl;
        imagens.push({ dia, slideIdx: Number(m[1]), layout: m[2], ts: Number(m[3]), url });
      }
    }
  } catch (e) {
    console.warn('fetch imagens:', e.message);
  }
  // ordena por dia asc, slideIdx asc, ts desc (mais recente do mesmo slide ganha)
  imagens.sort((a, b) => a.dia - b.dia || a.slideIdx - b.slideIdx || b.ts - a.ts);

  // dedup por (dia, slideIdx) — mais recente ganha
  const seen = new Set();
  const dedup = [];
  for (const im of imagens) {
    const k = `${im.dia}-${im.slideIdx}`;
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(im);
  }
  return dedup;
}

// Hash deterministico do slug → lane. Permite que produtos do mesmo mundo
// usem subsets diferentes de imagens (cada lane salta de stride em stride).
function hashSlugLane(slug, totalLanes) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % totalLanes;
}

// Distribui imagens pelos capitulos sem repetir entre produtos do mesmo mundo.
// Estrategia: o slug determina uma 'lane' (offset inicial), e percorremos as
// imagens com stride = LANE_COUNT. Dois produtos com lanes diferentes nunca
// caem nas mesmas imagens.
function distribuirImagens(imagens, nChapters, slug) {
  if (imagens.length === 0) return { capa: null, porCapitulo: [] };

  // 8 lanes = ate 8 produtos por mundo sem overlap, desde que haja >= 8*9 imgs.
  // Com fallback elegante quando ha menos imagens (volta ao inicio).
  const LANE_COUNT = 8;
  const lane = hashSlugLane(slug, LANE_COUNT);

  // Constroi sequencia desta lane: [lane, lane+8, lane+16, ...]
  const minhaSeq = [];
  for (let i = lane; i < imagens.length; i += LANE_COUNT) {
    minhaSeq.push(imagens[i]);
  }
  // Se a lane resultou em <= nChapters imagens (mundo pequeno), preenche com o
  // resto da pool por ordem.
  if (minhaSeq.length < nChapters + 1) {
    for (const im of imagens) {
      if (!minhaSeq.includes(im)) minhaSeq.push(im);
      if (minhaSeq.length >= nChapters + 1) break;
    }
  }

  const capa = minhaSeq[0];
  const porCapitulo = [];
  for (let i = 0; i < nChapters; i++) {
    porCapitulo.push(minhaSeq[i + 1] ?? minhaSeq[i % minhaSeq.length]);
  }
  return { capa, porCapitulo, lane };
}

// ─── HTML builder ───

function buildHtml(ebook, capa, porCapitulo) {
  const chaptersHtml = ebook.chapters.map((ch, i) => {
    const img = porCapitulo[i];
    const bodyHtml = marked.parse(ch.md);
    // marker no primeiro <p> para drop cap
    const bodyComDropCap = bodyHtml.replace(/^<p>/, '<p class="primeiro-p">');
    return `
      <section class="capitulo-opener">
        ${img ? `<div class="opener-bg" style="background-image:url('${img.url}')"></div>` : ''}
        <div class="opener-overlay"></div>
        <div class="opener-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="opener-titulo">
          <div class="opener-cap-label">Capítulo</div>
          <h2>${ch.title.replace(/^\d+\.\s*/, '')}</h2>
        </div>
      </section>
      <section class="capitulo-corpo">
        ${bodyComDropCap}
      </section>
    `;
  }).join('');

  const sumarioHtml = ebook.chapters.map((ch, i) => `
    <li>
      <span class="sum-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="sum-titulo">${ch.title.replace(/^\d+\.\s*/, '')}</span>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500&display=swap');

  @page {
    size: A5;
    margin: 0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 300;
    font-size: 11pt;
    line-height: 1.78;
    color: ${COLORS.texto};
    background: ${COLORS.creme};
  }

  /* ═══════════════════ CAPA ═══════════════════ */
  .capa {
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: ${COLORS.barroEscuro};
  }
  .capa-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: brightness(0.78) contrast(1.05) saturate(0.95);
  }
  .capa-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to bottom,
        rgba(29,19,11,0.25) 0%,
        rgba(29,19,11,0.15) 45%,
        rgba(29,19,11,0.85) 100%);
  }
  .capa-grain {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%);
  }
  .capa-marca {
    position: absolute;
    top: 14mm;
    left: 14mm;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8.5pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${COLORS.areia};
    opacity: 0.85;
  }
  .capa-conteudo {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 20mm 14mm 16mm 14mm;
  }
  .capa-titulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 34pt;
    line-height: 1.04;
    color: ${COLORS.areia};
    letter-spacing: -0.02em;
    margin-bottom: 6mm;
  }
  .capa-subtitulo {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 11pt;
    line-height: 1.5;
    color: ${COLORS.areia};
    opacity: 0.78;
    max-width: 88%;
    margin-bottom: 12mm;
  }
  .capa-linha {
    width: 18mm;
    height: 0.5pt;
    background: ${COLORS.ouro};
    margin-bottom: 5mm;
    opacity: 0.7;
  }
  .capa-autora {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 9pt;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: ${COLORS.areia};
  }

  /* ═══════════════════ HALF-TITLE / AUTORA ═══════════════════ */
  .half-title {
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30mm 18mm;
    text-align: center;
    background: ${COLORS.creme};
  }
  .half-title-orn {
    font-size: 14pt;
    color: ${COLORS.barroClaro};
    letter-spacing: 0.8em;
    margin-bottom: 12mm;
    opacity: 0.6;
  }
  .half-title h1 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 24pt;
    line-height: 1.2;
    color: ${COLORS.barro};
    letter-spacing: -0.015em;
    margin-bottom: 6mm;
  }
  .half-title .subtit {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 300;
    font-size: 11pt;
    line-height: 1.5;
    color: ${COLORS.textoSuave};
    max-width: 70%;
  }

  .autora-page {
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30mm 22mm;
    text-align: center;
    background: ${COLORS.creme};
  }
  .autora-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
    margin-bottom: 8mm;
  }
  .autora-nome {
    font-family: 'Fraunces', serif;
    font-weight: 400;
    font-size: 18pt;
    color: ${COLORS.barro};
    margin-bottom: 8mm;
    letter-spacing: -0.01em;
  }
  .autora-bio {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 10.5pt;
    line-height: 1.7;
    color: ${COLORS.textoSuave};
    max-width: 78%;
  }

  /* ═══════════════════ DISCLAIMER ═══════════════════ */
  .disclaimer-page {
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30mm 22mm;
    background: ${COLORS.creme};
  }
  .disclaimer-box {
    border-top: 0.5pt solid ${COLORS.salvia}80;
    border-bottom: 0.5pt solid ${COLORS.salvia}80;
    padding: 10mm 0;
  }
  .disclaimer-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
    text-align: center;
    margin-bottom: 6mm;
  }
  .disclaimer-text {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 9.5pt;
    line-height: 1.75;
    color: ${COLORS.textoSuave};
    text-align: center;
  }

  /* ═══════════════════ SUMARIO ═══════════════════ */
  .sumario {
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    padding: 28mm 22mm 25mm 22mm;
    background: ${COLORS.creme};
  }
  .sumario-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
    margin-bottom: 4mm;
  }
  .sumario h2 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 22pt;
    color: ${COLORS.barro};
    margin-bottom: 12mm;
    letter-spacing: -0.015em;
  }
  .sumario ol {
    list-style: none;
    padding: 0;
  }
  .sumario li {
    display: flex;
    align-items: baseline;
    gap: 6mm;
    padding: 3.5mm 0;
    border-bottom: 0.3pt solid ${COLORS.barroClaro}30;
  }
  .sumario .sum-num {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 12pt;
    color: ${COLORS.barroClaro};
    min-width: 12mm;
    font-variant-numeric: tabular-nums;
  }
  .sumario .sum-titulo {
    font-family: 'Fraunces', serif;
    font-weight: 400;
    font-size: 11pt;
    color: ${COLORS.texto};
    line-height: 1.4;
  }

  /* ═══════════════════ CAPITULO OPENER ═══════════════════ */
  .capitulo-opener {
    page-break-before: always;
    page-break-after: always;
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: ${COLORS.barroEscuro};
  }
  .opener-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: brightness(0.72) contrast(1.02);
  }
  .opener-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top,
        rgba(29,19,11,0.92) 0%,
        rgba(29,19,11,0.35) 50%,
        rgba(29,19,11,0.15) 100%);
  }
  .opener-num {
    position: absolute;
    top: 16mm;
    right: 14mm;
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 56pt;
    line-height: 1;
    color: ${COLORS.ouro};
    opacity: 0.85;
    letter-spacing: -0.03em;
  }
  .opener-titulo {
    position: absolute;
    bottom: 18mm;
    left: 14mm;
    right: 14mm;
  }
  .opener-cap-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 8.5pt;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${COLORS.ouro};
    opacity: 0.9;
    margin-bottom: 5mm;
  }
  .opener-titulo h2 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 26pt;
    line-height: 1.1;
    color: ${COLORS.areia};
    letter-spacing: -0.018em;
  }

  /* ═══════════════════ CAPITULO CORPO ═══════════════════ */
  .capitulo-corpo {
    padding: 22mm 20mm 26mm 20mm;
    background: ${COLORS.creme};
  }
  .capitulo-corpo p {
    margin-bottom: 4mm;
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
    orphans: 3;
    widows: 3;
  }
  .capitulo-corpo p.primeiro-p::first-letter {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 54pt;
    line-height: 0.88;
    color: ${COLORS.barro};
    float: left;
    margin: 0 3mm -2mm 0;
    padding-top: 1mm;
  }
  .capitulo-corpo h3 {
    font-family: 'Fraunces', serif;
    font-weight: 400;
    font-size: 13pt;
    color: ${COLORS.barroClaro};
    margin: 10mm 0 4mm 0;
    page-break-after: avoid;
    letter-spacing: -0.005em;
  }
  .capitulo-corpo strong {
    font-weight: 500;
    color: ${COLORS.barro};
  }
  .capitulo-corpo em {
    font-style: italic;
    color: ${COLORS.texto};
  }
  .capitulo-corpo blockquote {
    margin: 8mm 4mm;
    padding: 4mm 6mm;
    border-left: 1.5pt solid ${COLORS.ouro};
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 12.5pt;
    line-height: 1.55;
    color: ${COLORS.barroEscuro};
  }
  .capitulo-corpo hr {
    border: none;
    text-align: center;
    margin: 10mm auto;
    height: 8mm;
    line-height: 8mm;
  }
  .capitulo-corpo hr::before {
    content: '· · ·';
    color: ${COLORS.barroClaro};
    font-size: 14pt;
    letter-spacing: 0.4em;
    opacity: 0.6;
  }
  .capitulo-corpo ul, .capitulo-corpo ol {
    padding-left: 6mm;
    margin: 4mm 0 6mm 0;
  }
  .capitulo-corpo li { margin-bottom: 2.5mm; }

  /* ═══════════════════ FINAL ═══════════════════ */
  .final {
    page-break-before: always;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30mm 22mm;
    text-align: center;
    background: ${COLORS.creme};
  }
  .final-orn {
    font-size: 14pt;
    color: ${COLORS.barroClaro};
    letter-spacing: 0.8em;
    margin-bottom: 12mm;
    opacity: 0.5;
  }
  .final h3 {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 300;
    font-size: 18pt;
    color: ${COLORS.barro};
    margin-bottom: 10mm;
    letter-spacing: -0.01em;
  }
  .final p {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-size: 10pt;
    line-height: 1.7;
    color: ${COLORS.textoSuave};
    margin-bottom: 4mm;
    max-width: 75%;
  }
  .final a {
    color: ${COLORS.barro};
    text-decoration: none;
    border-bottom: 0.3pt solid ${COLORS.barroClaro}60;
  }
  .final-credits {
    margin-top: 16mm;
    font-family: 'Outfit', sans-serif;
    font-weight: 400;
    font-size: 7.5pt;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: ${COLORS.salvia};
  }
</style>
</head>
<body>

<!-- CAPA -->
<div class="capa">
  ${capa ? `<div class="capa-bg" style="background-image:url('${capa.url}')"></div>` : ''}
  <div class="capa-overlay"></div>
  <div class="capa-grain"></div>
  <div class="capa-marca">VIVIANNE DOS SANTOS</div>
  <div class="capa-conteudo">
    <h1 class="capa-titulo">${ebook.titulo}</h1>
    <p class="capa-subtitulo">${ebook.subtitulo}</p>
    <div class="capa-linha"></div>
    <p class="capa-autora">Ebook · ${MUNDO === 'freeme' ? 'FreeMe' : MUNDO}</p>
  </div>
</div>

<!-- HALF-TITLE -->
<div class="half-title">
  <div class="half-title-orn">· · ·</div>
  <h1>${ebook.titulo}</h1>
  <p class="subtit">${ebook.subtitulo}</p>
</div>

<!-- AUTORA -->
<div class="autora-page">
  <div class="autora-label">A autora</div>
  <h2 class="autora-nome">${ebook.autoria || 'Vivianne dos Santos'}</h2>
  <p class="autora-bio">${ebook.bio || ''}</p>
</div>

<!-- DISCLAIMER -->
<div class="disclaimer-page">
  <div class="disclaimer-box">
    <div class="disclaimer-label">Antes de começar</div>
    <p class="disclaimer-text">${ebook.disclaimer || 'Este ebook é um material de autoconhecimento e compreensão. Não substitui acompanhamento terapêutico.'}</p>
  </div>
</div>

<!-- SUMARIO -->
<div class="sumario">
  <div class="sumario-label">Conteúdo</div>
  <h2>Sumário</h2>
  <ol>
    ${sumarioHtml}
  </ol>
</div>

<!-- CAPITULOS -->
${chaptersHtml}

<!-- FINAL -->
<div class="final">
  <div class="final-orn">· · ·</div>
  <h3>Para a leitora</h3>
  <p>Obrigada por leres até aqui. Se algo te tocou, partilha — não como prova, mas como semente.</p>
  <p>Encontras mais ebooks, guias e o caminho completo em <a href="https://viviannedossantos.com">viviannedossantos.com</a>.</p>
  <div class="final-credits">
    © 2025 Vivianne dos Santos &nbsp;·&nbsp; viviannedossantos.com
  </div>
</div>

</body>
</html>`;
}

// ─── main ───

async function main() {
  console.log(`[start] slug=${SLUG} mundo=${MUNDO}`);

  const raw = fs.readFileSync(EBOOK_PATH, 'utf8');
  const ebook = parseEbook(raw);
  console.log(`[parsed] ${ebook.chapters.length} capitulos`);

  const imagens = await fetchImagensMundo(MUNDO);
  console.log(`[imagens] ${imagens.length} fotos MJ disponiveis`);

  const { capa, porCapitulo, lane } = distribuirImagens(imagens, ebook.chapters.length, SLUG);
  console.log(`[lane ${lane}/8] capa: ${capa?.url ?? 'sem capa'}`);

  const html = buildHtml(ebook, capa, porCapitulo);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  await page.pdf({
    path: TMP_PDF,
    format: 'A5',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    displayHeaderFooter: false,
  });
  await browser.close();

  const stats = fs.statSync(TMP_PDF);
  console.log(`[pdf] ${(stats.size / 1024).toFixed(0)} KB`);

  const pdfBuf = fs.readFileSync(TMP_PDF);

  // ─── ESTRATEGIA DE UPLOAD ────────────────────────────────────────
  // Tentamos por ordem:
  //   1. escritos (privado) com mime=application/pdf
  //   2. escritos (privado) com mime=application/octet-stream (alguns buckets
  //      tem allowed_mime_types restrito e isto passa por bruteforce)
  //   3. viviannepag-assets/produtos (publico) — sempre funciona, perde-se
  //      pequena privacidade (URL publica, mas com slug = obfuscation leve)
  // /api/download-directo testa os 2 sitios em sequencia.
  let ficheiroPath = `produtos/${SLUG}.pdf`;
  const { data: produto } = await supabase
    .from('produtos')
    .select('id, ficheiro_path')
    .eq('slug', SLUG)
    .maybeSingle();
  if (produto?.ficheiro_path) ficheiroPath = produto.ficheiro_path;

  async function tryUpload(bucket, p, mime) {
    const { error } = await supabase.storage
      .from(bucket).upload(p, pdfBuf, { contentType: mime, upsert: true });
    return error?.message ?? null;
  }

  let destino = null;
  for (const tentativa of [
    { bucket: BUCKET_PRODUTOS, path: ficheiroPath, mime: 'application/pdf' },
    { bucket: BUCKET_PRODUTOS, path: ficheiroPath, mime: 'application/octet-stream' },
    { bucket: BUCKET_ASSETS, path: `produtos/${SLUG}.pdf`, mime: 'application/pdf' },
  ]) {
    const err = await tryUpload(tentativa.bucket, tentativa.path, tentativa.mime);
    if (!err) {
      destino = tentativa;
      console.log(`[entregavel] ${tentativa.bucket}/${tentativa.path} (mime=${tentativa.mime})`);
      break;
    }
    console.log(`[skip] ${tentativa.bucket}: ${err}`);
  }
  if (!destino) throw new Error('upload falhou em todos os buckets');

  // Se produto existe na DB e ficheiro_path estava vazio, regista
  if (produto && !produto.ficheiro_path && destino.bucket === BUCKET_PRODUTOS) {
    await supabase.from('produtos').update({ ficheiro_path: ficheiroPath }).eq('id', produto.id);
    console.log(`[db] ficheiro_path = ${ficheiroPath}`);
  }

  // Preview admin publico (sempre escreve aqui para o botao 'ver PDF' funcionar)
  const previewKey = `produtos/${SLUG}.pdf`;
  if (destino.bucket !== BUCKET_ASSETS) {
    await supabase.storage.from(BUCKET_ASSETS).upload(previewKey, pdfBuf, {
      contentType: 'application/pdf', upsert: true,
    });
  }
  const previewUrl = supabase.storage.from(BUCKET_ASSETS).getPublicUrl(previewKey).data.publicUrl;
  console.log(`[preview] ${previewUrl}`);
}

main().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
