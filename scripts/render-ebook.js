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

const SLUG = process.env.SLUG || 'ebook-01-culpa';
const SLUGS = (process.env.SLUGS ?? '').split(',').map(s => s.trim()).filter(Boolean);
const MUNDO = process.env.MUNDO || 'freeme';
// COLECAO=freeme-mae|infonte|amor|forca|prosperidade|pertenca|trabalho
// Filtra o bulk a um universo de cada vez (lotes mais leves). Ver npm run render:<universo>.
const COLECAO = (process.env.COLECAO || '').trim();
// RENDER_LANG=en gera os PDFs ingleses (le content/produtos/<slug>-en/, texto EN,
// MESMA capa do produto PT, grava em produtos/<slug>-en.pdf, SEM tocar na DB).
const RENDER_LANG = (process.env.RENDER_LANG || 'pt').toLowerCase();
// DRY=1 lista os slugs do lote e sai (sem render, sem Supabase nem deps pesadas).
const DRY = ['1', 'true', 'yes'].includes((process.env.DRY || '').toLowerCase());

// Deps pesadas (parsing/render) so sao precisas no render real, nao no DRY/plan.
const matter = DRY ? null : require('gray-matter');
const { marked } = DRY ? {} : require('marked');
const puppeteer = DRY ? null : require('puppeteer');
const { createClient } = DRY ? {} : require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DRY) {
  for (const [k, v] of Object.entries({ SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY })) {
    if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
  }
}

// Imagens MJ vivem em viviannepag-assets (publico). PDFs entregaveis em
// escritos (privado, lido pelo /api/download via signed URL).
const BUCKET_ASSETS = 'viviannepag-assets';
const BUCKET_PRODUTOS = 'escritos';
const supabase = DRY ? null : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EBOOK_PATH = path.join(__dirname, '..', 'content', 'produtos', SLUG, `${SLUG}.md`);
const TMP_PDF = path.join('/tmp', `${SLUG}.pdf`);

// Paletas por mundo. As chaves mantêm-se iguais em todos os mundos (o CSS usa
// ${COLORS.barro} etc.), por isso muda-se só de paleta, nunca o CSS editorial.
const PALETTES = {
  freeme: {
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
  },
  // Infonte: terra, ocre, sereno (marca Sete Ecos). Calmo, espaçado.
  infonte: {
    barro: '#5C3D24',
    barroEscuro: '#3A2A1C',
    barroClaro: '#8A5E34',
    areia: '#F2E8DC',
    creme: '#F2E8DC',
    cremeEscuro: '#E7DAC8',
    salvia: '#6B6B47',
    texto: '#2A2018',
    textoSuave: '#6B5A48',
    ouro: '#B8843D',
  },
  // Prosperidade: valor a circular. Mel, ocre quente, ouro abundante mas com chão.
  prosperidade: {
    barro: '#A86A2E',
    barroEscuro: '#6E4520',
    barroClaro: '#C68A3E',
    areia: '#F6EAD6',
    creme: '#F6EDDD',
    cremeEscuro: '#EBD9BE',
    salvia: '#8A7A45',
    texto: '#3A2A16',
    textoSuave: '#6E5A3C',
    ouro: '#D49A3A',
  },
  // SyncHim: vínculo amoroso. Rosa-madeira, terracota íntima, cobre. Estrela persa.
  synchim: {
    barro: '#9E4A45',
    barroEscuro: '#6A2F2E',
    barroClaro: '#B86A60',
    areia: '#F5E7DF',
    creme: '#F5E8E1',
    cremeEscuro: '#ECD4C9',
    salvia: '#9C6B5A',
    texto: '#3A211E',
    textoSuave: '#6E4A42',
    ouro: '#C98A5E',
  },
  // Pertença: raiz, lugar, família. Oliveira, bronze morno, salva. Enraizado.
  pertenca: {
    barro: '#75663A',
    barroEscuro: '#4C4326',
    barroClaro: '#928047',
    areia: '#F1ECDB',
    creme: '#F2EDDD',
    cremeEscuro: '#E2DAC2',
    salvia: '#7C8A5E',
    texto: '#322E1C',
    textoSuave: '#5E5838',
    ouro: '#B89A48',
  },
  // Força: sobrevivência e armadura que pousa. Castanho fundo, protetor, brasa segura.
  forca: {
    barro: '#6B4A3A',
    barroEscuro: '#422E24',
    barroClaro: '#8A6450',
    areia: '#EFE6DB',
    creme: '#F0E8DD',
    cremeEscuro: '#DED2C4',
    salvia: '#6E7763',
    texto: '#2E2018',
    textoSuave: '#5E4C40',
    ouro: '#C58A4E',
  },
  // Trabalho: identidade e existir. Umbria, bronze sóbrio, ouro firme. Digno.
  trabalho: {
    barro: '#7A5230',
    barroEscuro: '#4E351F',
    barroClaro: '#9A6C40',
    areia: '#F2EADC',
    creme: '#F3EBDD',
    cremeEscuro: '#E4D6BF',
    salvia: '#74704C',
    texto: '#312414',
    textoSuave: '#665236',
    ouro: '#C99A40',
  },
};
const LABELS = {
  freeme: 'FreeMe', infonte: 'Infonte', prosperidade: 'Prosperidade',
  synchim: 'SyncHim', pertenca: 'Pertença', forca: 'Força', trabalho: 'Trabalho',
};
// Fontes por mundo (só os mundos que divergem do default Fraunces/Outfit).
const FONTS = {
  infonte: {
    serif: "'EB Garamond'",
    sans: "'Inter'",
    importUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap',
  },
  // Prosperidade: serifa generosa e refinada.
  prosperidade: {
    serif: "'Cormorant Garamond'",
    sans: "'Outfit'",
    importUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500&display=swap',
  },
  // SyncHim: serifa íntima e literária.
  synchim: {
    serif: "'Lora'",
    sans: "'Inter'",
    importUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap',
  },
  // Pertença: serifa humanista e enraizada.
  pertenca: {
    serif: "'Source Serif 4'",
    sans: "'Outfit'",
    importUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500&display=swap',
  },
  // Força: serifa calma e sólida.
  forca: {
    serif: "'Newsreader'",
    sans: "'Inter'",
    importUrl: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap',
  },
  // Trabalho: serifa digna e profissional.
  trabalho: {
    serif: "'Spectral'",
    sans: "'Inter'",
    importUrl: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap',
  },
};
// Aplica as fontes do mundo ao HTML. Para freeme (sem entrada em FONTS) devolve
// o HTML intacto, por isso o FreeMe fica byte-idêntico.
function applyFonts(html, mundo) {
  const f = FONTS[mundo];
  if (!f) return html;
  return html
    .replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);/, `@import url('${f.importUrl}');`)
    .replace(/'Fraunces'/g, f.serif)
    .replace(/'Outfit'/g, f.sans);
}
// Default mantém o comportamento antigo (barro) para qualquer referência solta.
const COLORS = PALETTES.freeme;

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
    } else if (titulo && !autoria && (line.startsWith('*Por ') || line.startsWith('*By '))) {
      autoria = line.replace(/[*]/g, '').replace(/^(Por|By) /, '').trim();
    } else if (autoria && !bio && line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      bio = line.replace(/^\*|\*$/g, '').trim();
    } else if (lines[i].startsWith('## ')) {
      bodyStartIdx = i;
      break;
    } else if (line.startsWith('*Este ebook') || line.startsWith('*Este guia') || line.startsWith('*This ebook') || line.startsWith('*This guide')) {
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

// Mapeia slug -> mundo (logica original, ainda usada como hint inicial).
function slugToMundo(slug) {
  if (/^pros-/.test(slug)) return 'prosperidade';
  if (/^syn-/.test(slug)) return 'synchim';
  if (/^per-/.test(slug)) return 'pertenca';
  if (/^for-/.test(slug)) return 'forca';
  if (/^tra-/.test(slug)) return 'trabalho';
  if (/^inf-/.test(slug) || /sonho|voz|mente|teu/.test(slug)) return 'infonte';
  if (/casal|perguntas/.test(slug)) return 'synchim';
  if (/quemes|sentido|escuro|presenca/.test(slug)) return 'escola';
  // Guias-ancora novos (um por universo) — fontes/label corretos.
  if (/^guia-09-meta/.test(slug)) return 'infonte';
  if (/^guia-10-receber/.test(slug)) return 'prosperidade';
  if (/^guia-11-intensidade/.test(slug)) return 'synchim';
  if (/^guia-12-lugar/.test(slug)) return 'pertenca';
  if (/^guia-13-guarda/.test(slug)) return 'forca';
  if (/^guia-14-parar/.test(slug)) return 'trabalho';
  return 'freeme';
}

// Mapeia slug -> colecao (replica lib/colecoes.ts slugToColecao em JS).
// Pool de imagens e organizado por colecao, nao por mundo de origem.
function slugToColecao(slug) {
  // Ebooks novos por prefixo de colecao (1 prefixo = 1 universo).
  if (/^mae-\d/.test(slug)) return 'freeme-mae';
  if (/^inf-\d/.test(slug)) return 'infonte';
  if (/^pros-\d/.test(slug)) return 'prosperidade';
  if (/^syn-\d/.test(slug)) return 'amor';
  if (/^per-\d/.test(slug)) return 'pertenca';
  if (/^for-\d/.test(slug)) return 'forca';
  if (/^tra-\d/.test(slug)) return 'trabalho';
  // Ebooks/guias antigos + guias-ancora novos (um por universo).
  if (/^ebook-01-culpa|^ebook-02-herdaste|^guia-01-meu|^guia-02-frases|^guia-08-culpa/.test(slug)) return 'freeme-mae';
  if (/^ebook-(09|10|11|12)|mae-que|mae-arrependida|mae-solo|mae-que-teme/.test(slug)) return 'freeme-mae';
  if (/^ebook-03-quemes|^ebook-04-sentido|^ebook-07-sonho|^ebook-08-voz/.test(slug)) return 'infonte';
  if (/^guia-03-presenca|^guia-04-mente|^guia-07-teu|^guia-09-meta/.test(slug)) return 'infonte';
  if (/^guia-10-receber/.test(slug)) return 'prosperidade';
  if (/^ebook-06-no-casal|^guia-06-perguntas|^guia-11-intensidade/.test(slug)) return 'amor';
  if (/^guia-12-lugar/.test(slug)) return 'pertenca';
  if (/^ebook-05-escuro|^guia-05-luto|^guia-13-guarda/.test(slug)) return 'forca';
  if (/^guia-14-parar/.test(slug)) return 'trabalho';
  return 'freeme-mae';
}

// Monta a linha de produto a partir dos metadados do markdown. Usado quando o
// render encontra um livro que ainda nao existe na loja: cria-o publicado.
// guia-* = guia €5; resto (ebook-*, mae/inf/pros/syn/per/for/tra-*) = ebook €7.
const ORDEM_UNIVERSO = { mae: 1, inf: 2, pros: 3, syn: 4, per: 5, for: 6, tra: 7 };
function metaProduto(slug, ebook, raw) {
  const isGuia = /^guia-/.test(slug);
  const palavras = raw.trim().split(/\s+/).length;
  const indice = ebook.chapters
    .map((c, i) => `${i + 1}. ${c.title.replace(/^\d+\.\s*/, '')}`)
    .join('\n');
  const descricao = isGuia
    ? `**Guia prático · ${palavras.toLocaleString('pt-PT')} palavras · PDF imediato**\n\n${ebook.subtitulo}\n\nPor Vivianne dos Santos.`
    : `**Ebook · ${palavras.toLocaleString('pt-PT')} palavras · ${ebook.chapters.length} capítulos · PDF imediato**\n\n${ebook.subtitulo}\n\n**O que vais encontrar:**\n${indice}\n\nPor Vivianne dos Santos.`;
  const pre = slug.split('-')[0];
  const num = Number(slug.split('-')[1]) || 0;
  return {
    slug,
    titulo: ebook.titulo,
    subtitulo: ebook.subtitulo,
    descricao,
    preco: isGuia ? '€5' : '€7',
    preco_original: isGuia ? '€15' : '€29',
    badge: isGuia ? 'guia' : 'ebook',
    destaque: false,
    publicado: true,
    ordem: 100 + (ORDEM_UNIVERSO[pre] ?? 9) * 20 + num,
  };
}

// Pool de imagens por colecao — puxa de varios mundos para max diversidade.
// 'autora' tem muitas fotos versateis e entra em quase todas as colecoes.
const MUNDOS_POR_COLECAO = {
  'freeme-mae': ['freeme', 'autora'],         // ~95 imagens
  'infonte':    ['infonte', 'escola', 'autora'], // ~95
  'amor':       ['synchim', 'autora'],         // ~60
  'forca':      ['escola', 'autora'],          // ~70
  'prosperidade': ['infonte', 'autora'],       // ~75
  'pertenca':   ['freeme', 'autora'],          // ~95
  'trabalho':   ['infonte', 'escola'],         // ~45
};

// Lista de todos os slugs de ebooks/guias PT. Permite bulk sem hard-coding.
function listAllSlugs() {
  const dir = path.join(__dirname, '..', 'content', 'produtos');
  return fs.readdirSync(dir)
    .filter(name => /^(ebook|guia|mae|inf|pros|syn|per|for|tra)-\d+/.test(name) && !name.endsWith('-en'))
    .filter(name => fs.existsSync(path.join(dir, name, `${name}.md`)))
    .sort();
}

// Lane unica por slug DENTRO DA COLECAO (e nao dentro do mundo). Permite
// diversidade entre produtos da mesma colecao usando o pool combinado.
function laneDoSlug(slug) {
  const colecao = slugToColecao(slug);
  const all = listAllSlugs().filter(s => slugToColecao(s) === colecao).sort();
  const idx = all.indexOf(slug);
  return { lane: idx === -1 ? 0 : idx, total: Math.max(all.length, 1), colecao };
}

// Pool de imagens da colecao — combina varios mundos (ver MUNDOS_POR_COLECAO).
async function fetchImagensColecao(colecao) {
  const mundos = MUNDOS_POR_COLECAO[colecao] ?? ['freeme'];
  const all = [];
  for (const m of mundos) {
    const imgs = await fetchImagensMundo(m);
    all.push(...imgs);
  }
  // Shuffle deterministico por colecao para que diferentes colecoes nao apanhem
  // sempre as mesmas imagens nas mesmas lanes (capa do ebook 1 freeme vs capa
  // do ebook do mesmo lane numa colecao diferente).
  const seed = colecao.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const seeded = all.map((im, i) => ({ im, k: ((i + 1) * 9301 + seed) % 233280 }));
  seeded.sort((a, b) => a.k - b.k);
  return seeded.map(s => s.im);
}

// Distribui imagens pelos capitulos sem repetir entre produtos da mesma colecao.
// Stride = total de slugs da colecao. Cada slug pega imagens[lane], [lane+total],
// [lane+2*total], ... — disjuntos por construcao.
function distribuirImagens(imagens, nChapters, slug) {
  if (imagens.length === 0) return { capa: null, porCapitulo: [], lane: 0, total: 0 };

  const { lane, total, colecao } = laneDoSlug(slug);
  const stride = total;

  const minhaSeq = [];
  for (let i = lane; i < imagens.length; i += stride) {
    minhaSeq.push(imagens[i]);
  }
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
  return { capa, porCapitulo, lane, total, colecao };
}

// ─── Alocacao GLOBAL de capas (sem repetir entre TODOS os produtos) ───
// A Vivianne tem mil+ imagens no pool. Nao faz sentido repetir capas. Esta
// funcao percorre os universos por ordem fixa e, para cada produto, escolhe a
// PRIMEIRA imagem do pool tematico do seu universo que ainda nao foi usada como
// capa por nenhum outro produto (Set global `usado`). Como os pools de varios
// universos partilham mundos (ex. 'autora'), so o Set global garante capas
// unicas em todo o catalogo. Deterministico: o mesmo render produz sempre o
// mesmo mapa, por isso cada render por-slug chega ao mesmo resultado.
const ORDEM_COLECOES = ['freeme-mae', 'infonte', 'amor', 'forca', 'prosperidade', 'pertenca', 'trabalho'];
let _capasGlobais = null;
async function alocarCapasGlobais() {
  if (_capasGlobais) return _capasGlobais;
  const usado = new Set();      // urls ja usadas como CAPA por algum produto
  const capaPorSlug = {};
  const todos = listAllSlugs();
  for (const colecao of ORDEM_COLECOES) {
    const pool = await fetchImagensColecao(colecao);
    const slugs = todos.filter(s => slugToColecao(s) === colecao).sort();
    for (const slug of slugs) {
      const img = pool.find(im => !usado.has(im.url));
      if (img) { usado.add(img.url); capaPorSlug[slug] = img; }
    }
  }
  _capasGlobais = { capaPorSlug, usado };
  return _capasGlobais;
}

// ─── HTML builder ───

function buildHtml(ebook, capa, porCapitulo, mundo = 'freeme', lang = 'pt') {
  const isEn = lang === 'en';
  const L = isEn
    ? { capitulo: 'Chapter', antes: 'Before you begin', conteudo: 'Contents', sumario: 'Contents', disclaimer: 'This ebook is a resource for self-awareness and understanding. It does not replace therapeutic support.' }
    : { capitulo: 'Capítulo', antes: 'Antes de começar', conteudo: 'Conteúdo', sumario: 'Sumário', disclaimer: 'Este ebook é um material de autoconhecimento e compreensão. Não substitui acompanhamento terapêutico.' };
  const COLORS = PALETTES[mundo] || PALETTES.freeme;
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
          <div class="opener-cap-label">${L.capitulo}</div>
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
    <p class="capa-autora">Ebook · ${LABELS[mundo] || (MUNDO === 'freeme' ? 'FreeMe' : MUNDO)}</p>
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
    <div class="disclaimer-label">${L.antes}</div>
    <p class="disclaimer-text">${ebook.disclaimer || L.disclaimer}</p>
  </div>
</div>

<!-- SUMARIO -->
<div class="sumario">
  <div class="sumario-label">${L.conteudo}</div>
  <h2>${L.sumario}</h2>
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

async function renderUm(slug, mundoOverride, lang = 'pt') {
  const isEn = lang === 'en';
  const mundo = mundoOverride || slugToMundo(slug);
  console.log(`\n── [slug=${slug} mundo=${mundo} lang=${lang}] ──`);

  // Em EN le content/produtos/<slug>-en/<slug>-en.md; capa e imagens vêm do
  // slug BASE (mesma capa que o PT).
  const mdSlug = isEn ? `${slug}-en` : slug;
  const ebookPath = path.join(__dirname, '..', 'content', 'produtos', mdSlug, `${mdSlug}.md`);
  if (!fs.existsSync(ebookPath)) {
    throw new Error(`md nao encontrado: ${ebookPath}`);
  }
  const raw = fs.readFileSync(ebookPath, 'utf8');
  const ebook = parseEbook(raw);
  console.log(`  [parsed] ${ebook.chapters.length} capitulos`);

  const colecao = slugToColecao(slug);
  const mundosPool = MUNDOS_POR_COLECAO[colecao] ?? ['freeme'];
  const imagens = await fetchImagensColecao(colecao);
  console.log(`  [pool] colecao=${colecao} mundos=${mundosPool.join('+')} total=${imagens.length} fotos`);

  // Capa unica em todo o catalogo (nunca repete entre produtos).
  const { capaPorSlug, usado: capasUsadas } = await alocarCapasGlobais();
  // Capitulos: pool sem nenhuma das capas, para nem os interiores repetirem uma capa.
  const imagensCapitulos = imagens.filter(im => !capasUsadas.has(im.url));
  const dist = distribuirImagens(imagensCapitulos, ebook.chapters.length, slug);
  const { porCapitulo, lane, total } = dist;
  const capa = capaPorSlug[slug] ?? dist.capa ?? imagens[0] ?? null;
  console.log(`  [lane ${lane}/${total}] capa unica (${capasUsadas.size} capas alocadas): ${capa?.url ? '…' + capa.url.slice(-50) : 'sem capa'}`);

  const html = applyFonts(buildHtml(ebook, capa, porCapitulo, mundo, lang), mundo);
  const tmpPdf = path.join('/tmp', `${mdSlug}.pdf`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  // A5 portrait em px @ 96dpi (559×794) com deviceScaleFactor 2 → screenshot 1118×1588
  await page.setViewport({ width: 559, height: 794, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');

  // Screenshot da capa (1a pagina, .capa div ocupa 100vw×100vh)
  const capaJpg = await page.screenshot({
    type: 'jpeg',
    quality: 88,
    clip: { x: 0, y: 0, width: 559, height: 794 },
  });

  await page.pdf({
    path: tmpPdf,
    format: 'A5',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    displayHeaderFooter: false,
  });
  await browser.close();

  const pdfBuf = fs.readFileSync(tmpPdf);
  console.log(`  [pdf] ${(pdfBuf.length / 1024).toFixed(0)} KB · [capa] ${(capaJpg.length / 1024).toFixed(0)} KB`);

  // ── Modo EN: so grava o PDF ingles em produtos/<slug>-en.pdf nos dois buckets.
  // NAO toca na DB (titulo/capa/ficheiro_path do produto sao os do PT). A capa
  // do PDF e a mesma imagem do produto PT; so o texto muda.
  if (isEn) {
    const enKey = `produtos/${slug}-en.pdf`;
    let okEn = false;
    for (const bucket of [BUCKET_PRODUTOS, BUCKET_ASSETS]) {
      const { error } = await supabase.storage.from(bucket).upload(enKey, pdfBuf, { contentType: 'application/pdf', upsert: true });
      if (!error) { okEn = true; console.log(`  [entregavel-en] ${bucket}/${enKey}`); }
      else console.warn(`  [en-upload ${bucket}] ${error.message}`);
    }
    try { fs.unlinkSync(tmpPdf); } catch {}
    if (!okEn) throw new Error('upload EN falhou em todos os buckets');
    return { slug, mundo, lane, size: pdfBuf.length, lang: 'en' };
  }

  // Cascata de upload PDF
  let ficheiroPath = `produtos/${slug}.pdf`;
  let { data: produto } = await supabase
    .from('produtos').select('id, ficheiro_path, capa').eq('slug', slug).maybeSingle();

  // Se o produto ainda nao existe na loja, cria-o (publicado) a partir dos
  // metadados do markdown. Assim, renderizar = registar: aparece no admin, na
  // loja e no pack do universo, sem seed manual.
  if (!produto) {
    const { data: novo, error: errNovo } = await supabase
      .from('produtos').insert(metaProduto(slug, ebook, raw)).select('id, ficheiro_path, capa').single();
    if (errNovo) console.warn(`  [produto-insert-falhou] ${errNovo.message}`);
    else { produto = novo; console.log(`  [produto-criado] ${slug} (publicado)`); }
  }

  if (produto?.ficheiro_path) ficheiroPath = produto.ficheiro_path;

  async function tryUpload(bucket, p, mime) {
    const { error } = await supabase.storage
      .from(bucket).upload(p, pdfBuf, { contentType: mime, upsert: true });
    return error?.message ?? null;
  }

  let destino = null;
  for (const t of [
    { bucket: BUCKET_PRODUTOS, path: ficheiroPath, mime: 'application/pdf' },
    { bucket: BUCKET_PRODUTOS, path: ficheiroPath, mime: 'application/octet-stream' },
    { bucket: BUCKET_ASSETS, path: `produtos/${slug}.pdf`, mime: 'application/pdf' },
  ]) {
    const err = await tryUpload(t.bucket, t.path, t.mime);
    if (!err) { destino = t; break; }
  }
  if (!destino) throw new Error('upload falhou em todos os buckets');
  console.log(`  [entregavel] ${destino.bucket}/${destino.path}`);

  if (produto && !produto.ficheiro_path && destino.bucket === BUCKET_PRODUTOS) {
    await supabase.from('produtos').update({ ficheiro_path: ficheiroPath }).eq('id', produto.id);
  }

  // Preview admin publico
  if (destino.bucket !== BUCKET_ASSETS) {
    await supabase.storage.from(BUCKET_ASSETS).upload(`produtos/${slug}.pdf`, pdfBuf, {
      contentType: 'application/pdf', upsert: true,
    });
  }

  // Upload da capa (sempre publico — capas vao para a loja)
  const capaKey = `produtos/capas/${slug}.jpg`;
  const { error: errCapa } = await supabase.storage
    .from(BUCKET_ASSETS).upload(capaKey, capaJpg, {
      contentType: 'image/jpeg', upsert: true,
    });
  let capaUrl = null;
  if (!errCapa) {
    const baseUrl = supabase.storage.from(BUCKET_ASSETS).getPublicUrl(capaKey).data.publicUrl;
    // Cache-bust com timestamp — forca browsers a re-fetch quando regerar
    capaUrl = `${baseUrl}?v=${Date.now()}`;
    console.log(`  [capa-uploaded] ${capaKey}`);
    // Actualiza produtos.capa na DB para a loja mostrar a capa editorial
    if (produto) {
      await supabase.from('produtos').update({ capa: capaUrl }).eq('id', produto.id);
      console.log(`  [db] capa actualizada`);
    }
  } else {
    console.warn(`  [capa-falhou] ${errCapa.message}`);
  }

  // limpa tmp
  try { fs.unlinkSync(tmpPdf); } catch {}

  return { slug, mundo, lane, size: pdfBuf.length, capaUrl };
}

async function main() {
  // Determina lista de slugs a renderizar
  let slugs = [];
  if (SLUGS.length > 0) slugs = SLUGS;
  else if (COLECAO) slugs = listAllSlugs();         // COLECAO=<universo> => todo o universo
  else if (SLUG && SLUG !== 'ALL') slugs = [SLUG];
  else slugs = listAllSlugs();

  // SLUG="ALL" ou SLUGS vazio + SLUG vazio = todos
  if (SLUG === 'ALL' || slugs.length === 0) slugs = listAllSlugs();

  // COLECAO=<universo> filtra o lote a um unico universo (render mais leve).
  if (COLECAO) {
    const antes = slugs.length;
    slugs = slugs.filter(s => slugToColecao(s) === COLECAO);
    console.log(`[colecao] ${COLECAO}: ${slugs.length}/${antes} produto(s)`);
    if (slugs.length === 0) { console.error(`Nenhum produto na colecao '${COLECAO}'. Validas: freeme-mae, infonte, amor, forca, prosperidade, pertenca, trabalho.`); process.exit(1); }
  }

  // DRY=1 — so lista o lote e sai, sem renderizar.
  if (DRY) {
    console.log(`[dry] ${slugs.length} produto(s)${COLECAO ? ' em ' + COLECAO : ''}:`);
    slugs.forEach(s => console.log(`  ${s}  ->  ${slugToColecao(s)} / ${slugToMundo(s)}`));
    return;
  }

  console.log(`[start] ${slugs.length} produto(s) [lang=${RENDER_LANG}]: ${slugs.join(', ')}`);

  const ok = [];
  const erros = [];
  for (const s of slugs) {
    try {
      const r = await renderUm(s, MUNDO !== 'auto' && slugs.length === 1 ? MUNDO : null, RENDER_LANG);
      ok.push(r);
    } catch (e) {
      console.error(`  [erro ${s}] ${e.message}`);
      erros.push({ slug: s, erro: e.message });
    }
  }

  console.log(`\n[done] ok=${ok.length} erros=${erros.length}`);
  if (erros.length > 0) {
    console.log('Erros:'); erros.forEach(e => console.log(`  ${e.slug}: ${e.erro}`));
    process.exitCode = ok.length === 0 ? 1 : 0; // exit 1 so se TODOS falharem
  }
}

main().catch(e => {
  console.error('[fatal]', e);
  process.exit(1);
});
