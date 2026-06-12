import type { ConteudoDia, Mundo, Slide } from './estudio-conteudo';
import { PALETAS } from './estudio-conteudo';

// ─── HASHTAGS SEO ─────────────────────────────────────────
// Estrategia: branded + nicho alta intencao + medio volume + discovery + geo
// IG aceita ate 30, optimo 20-25 mistura tiers. TT optimo 6-10 FYP-heavy.

const HASHTAGS_BASE_IG = [
  // Branded
  '#viviannedossantos',
  // Nicho alta intencao
  '#psicologiatranspessoal', '#constelacaofamiliar', '#lealdadeinvisivel',
  // Medio volume
  '#psicologia', '#autoconhecimento', '#terapia', '#saudemental',
  '#desenvolvimentopessoal', '#consciencia', '#psicoterapia',
  // Discovery
  '#amorproprio', '#reflexao', '#motivacaodiaria',
  // Geo PT/BR (audiencia lusofona)
  '#psicologiaportugal', '#psicologiabrasil',
];

const HASHTAGS_POR_MUNDO_IG: Record<Mundo, string[]> = {
  freeme: ['#culpamaterna', '#maternidadereal', '#filhasdaculpa', '#maesemculpa', '#heranca'],
  infonte: ['#sentidodavida', '#proposito', '#identidade', '#quemsou', '#vazioexistencial'],
  synchim: ['#casalconsciente', '#relacoes', '#amorconsciente', '#vinculoseguro', '#sistemicas'],
  escola: ['#psicologiajunguiana', '#bertheelinger', '#psicologiasistemica', '#self'],
  autora: ['#ebookpsicologia', '#guiapsicologico', '#livrosdepsicologia', '#pdfimediato'],
};

const HASHTAGS_BASE_TT = [
  '#viviannedossantos', '#psicologia', '#autoconhecimento',
  '#fyp', '#foryou', '#parati', '#portugal', '#brasil',
];

const HASHTAGS_POR_MUNDO_TT: Record<Mundo, string[]> = {
  freeme: ['#culpa', '#maternidade'],
  infonte: ['#proposito', '#sentido'],
  synchim: ['#casal', '#relacionamento'],
  escola: ['#psicologiatranspessoal', '#constelacaofamiliar'],
  autora: ['#ebook'],
};

function montarHashtagsIG(c: ConteudoDia): string {
  const set = new Set<string>();
  // Tier 1: hashtags especificas do conteudo (mais relevante para o algoritmo)
  c.hashtags.forEach(h => set.add(h));
  // Tier 2: mundo
  HASHTAGS_POR_MUNDO_IG[c.mundo].forEach(h => set.add(h));
  // Tier 3: base (branded + nicho + medio + discovery + geo)
  HASHTAGS_BASE_IG.forEach(h => set.add(h));
  // Cap a 25 (zona segura IG, evita parecer spam)
  return Array.from(set).slice(0, 25).join(' ');
}

function montarHashtagsTT(c: ConteudoDia): string {
  const set = new Set<string>();
  c.hashtags.slice(0, 3).forEach(h => set.add(h));
  HASHTAGS_POR_MUNDO_TT[c.mundo].forEach(h => set.add(h));
  HASHTAGS_BASE_TT.forEach(h => set.add(h));
  return Array.from(set).slice(0, 10).join(' ');
}

export function gerarCaptionInstagram(c: ConteudoDia): string {
  const lines: string[] = [];

  if (c.reelScript) {
    lines.push(c.reelScript.gancho);
    lines.push('');
    c.reelScript.corpo.forEach(l => lines.push(l));
    lines.push('');
    lines.push(c.reelScript.cta);
  } else if (c.slides && c.slides.length > 0) {
    const capa = c.slides[0];
    lines.push(capa.texto.replace(/\n/g, ' '));
    if (capa.titulo) lines.push(capa.titulo);                        // subtitulo (carrossel 7 Veus)
    if (capa.destaque) { lines.push(''); lines.push(capa.destaque); } // frase de abertura (carrossel)
    lines.push('');
    lines.push('Desliza para ler.');
  }

  lines.push('');
  lines.push('Vivianne dos Santos');
  lines.push('');
  lines.push('Ebooks e guias em PDF imediato:');
  lines.push('viviannedossantos.com/loja');
  lines.push('');
  lines.push(montarHashtagsIG(c));

  return lines.join('\n');
}

export function gerarCaptionTikTok(c: ConteudoDia): string {
  const lines: string[] = [];

  if (c.reelScript) {
    lines.push(c.reelScript.gancho);
    lines.push('');
    lines.push(c.reelScript.cta);
  } else if (c.slides && c.slides.length > 0) {
    lines.push(c.slides[0].texto.replace(/\n/g, ' '));
  }

  lines.push('');
  lines.push(montarHashtagsTT(c));

  return lines.join('\n');
}

// Threads: limite duro 500 chars. Estrategia: hook curto + CTA + 3 hashtags top.
// Target conservador: 480 chars para evitar erros de import.
export function gerarCaptionThreads(c: ConteudoDia): string {
  const THREADS_MAX = 480;
  const hashtagsCurtas = c.hashtags.slice(0, 3).join(' ');
  const sufixo = `\n\n— Vivianne dos Santos\nviviannedossantos.com/loja\n\n${hashtagsCurtas}`;
  const espaco = THREADS_MAX - sufixo.length;

  let corpo = '';
  if (c.reelScript) {
    corpo = c.reelScript.gancho.trim();
    if (corpo.length + 2 < espaco) {
      corpo += `\n\n${c.reelScript.cta.trim()}`;
    }
  } else if (c.slides && c.slides.length > 0) {
    corpo = c.slides[0].texto.replace(/\n/g, ' ').trim();
  }

  if (corpo.length > espaco) {
    corpo = corpo.slice(0, espaco - 1).replace(/\s+\S*$/, '') + '…';
  }

  return corpo + sufixo;
}

// Pinterest pin description: SEO-rich + CTA. Pinterest da preferencia a texto
// descritivo com keywords. Max 500 chars.
export function gerarPinterestDescription(c: ConteudoDia): string {
  const PIN_MAX = 480;
  const kw = KEYWORD_POR_MUNDO[c.mundo];
  const hashtagsPin = HASHTAGS_POR_MUNDO_IG[c.mundo].slice(0, 4).join(' ');
  const sufixo = `\n\n${kw} · PDF imediato em viviannedossantos.com/loja\n\n${hashtagsPin}`;
  const espaco = PIN_MAX - sufixo.length;

  let corpo = c.descricao || c.titulo;
  if (c.slides?.[0]) {
    const snippet = c.slides[0].texto.replace(/\n/g, ' ').trim();
    if (snippet.length < espaco) corpo = snippet;
  }
  if (corpo.length > espaco) {
    corpo = corpo.slice(0, espaco - 1).replace(/\s+\S*$/, '') + '…';
  }

  return corpo + sufixo;
}

export function gerarCaptionWhatsApp(c: ConteudoDia): string {
  const pal = PALETAS[c.mundo];
  const lines: string[] = [];

  if (c.reelScript) {
    lines.push(`*${c.titulo}*`);
    lines.push('');
    lines.push(c.reelScript.gancho);
    lines.push('');
    lines.push(c.reelScript.cta);
  } else if (c.slides && c.slides.length > 0) {
    lines.push(`*${c.titulo}*`);
    lines.push('');
    lines.push(c.slides[0].texto.replace(/\n/g, ' '));
    if (c.produtoRelacionado) {
      lines.push('');
      lines.push('Disponivel em viviannedossantos.com/loja');
    }
  }

  lines.push('');
  lines.push(`_Vivianne dos Santos_`);

  return lines.join('\n');
}

// Cabecalho oficial Metricool (template descarregado a 2026-05-29)
const PINTEREST_BOARDS: Record<Mundo, string> = {
  freeme: 'Culpa e Constelação Familiar',
  infonte: 'Sentido e Identidade',
  synchim: 'Relações e Casal',
  escola: 'Psicologia Transpessoal',
  autora: 'Ebooks Vivianne dos Santos',
};

// Keyword principal de cada mundo (entra no Pin Title e no Alt Text)
const KEYWORD_POR_MUNDO: Record<Mundo, string> = {
  freeme: 'Constelação Familiar',
  infonte: 'Autoconhecimento',
  synchim: 'Relações e Casal',
  escola: 'Psicologia Transpessoal',
  autora: 'Ebook Psicologia',
};

const PINTEREST_LINK = 'https://viviannedossantos.com/loja';

// Pinterest e motor de busca: titulo deve casar com termos procurados.
// Formato: "Titulo emocional | Keyword do mundo" (limite ~100 char).
function gerarPinTitle(c: ConteudoDia): string {
  const kw = KEYWORD_POR_MUNDO[c.mundo];
  const titulo = c.titulo.replace(/\s+/g, ' ').trim();
  const full = `${titulo} | ${kw}`;
  if (full.length <= 100) return full;
  // Se nao cabe, trunca o titulo mantendo a keyword
  const maxTitulo = 100 - kw.length - 3 - 3; // " | " + "..."
  return `${titulo.slice(0, maxTitulo)}... | ${kw}`;
}

// Alt text: snippet do slide + keyword (acessibilidade + SEO Pinterest)
function gerarAltText(slide: Slide, mundo: Mundo): string {
  const kw = KEYWORD_POR_MUNDO[mundo];
  const snippet = slide.texto.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
  return `${snippet} · ${kw} · Vivianne dos Santos`;
}

const CSV_HEADER = [
  'Text', 'Date', 'Time', 'Draft',
  'Facebook', 'Twitter/X', 'LinkedIn', 'GBP', 'Instagram', 'Pinterest', 'TikTok', 'Youtube', 'Threads', 'Bluesky',
  'Picture Url 1', 'Picture Url 2', 'Picture Url 3', 'Picture Url 4', 'Picture Url 5',
  'Picture Url 6', 'Picture Url 7', 'Picture Url 8', 'Picture Url 9', 'Picture Url 10',
  'Alt text picture 1', 'Alt text picture 2', 'Alt text picture 3', 'Alt text picture 4', 'Alt text picture 5',
  'Alt text picture 6', 'Alt text picture 7', 'Alt text picture 8', 'Alt text picture 9', 'Alt text picture 10',
  'Document title', 'Shortener', 'Video Thumbnail Url', 'Video Cover Frame',
  'Twitter/X Can reply', 'Twitter/X Type', 'Twitter/X Poll Duration minutes',
  'Twitter/X Poll Option 1', 'Twitter/X Poll Option 2', 'Twitter/X Poll Option 3', 'Twitter/X Poll Option 4',
  'Pinterest Board', 'Pinterest Pin Title', 'Pinterest Pin Link', 'Pinterest Pin New Format',
  'Instagram Post Type', 'Instagram Show Reel On Feed',
  'Youtube Video Title', 'Youtube Video Type', 'Youtube Video Privacy', 'Youtube video for kids',
  'Youtube Video Category', 'Youtube Video Tags', 'Youtube playlist',
  'GBP Post Type', 'Facebook Post Type', 'Facebook Title',
  'First Comment Text',
  'TikTok Title', 'TikTok disable comments', 'TikTok disable duet', 'TikTok disable stitch',
  'TikTok Post Privacy', 'TikTok Branded Content', 'TikTok Your Brand', 'TikTok Auto Add Music',
  'TikTok Photo Cover Index',
  'TikTok musicId', 'TikTok music title', 'TikTok music author', 'TikTok music previewUrl',
  'TikTok music thumbnailUrl', 'TikTok music soundVolume', 'TikTok music originalVolume',
  'TikTok music startMillis', 'TikTok music endMillis', 'TikTok is AI generated content',
  'LinkedIn Type', 'LinkedIn Poll Question',
  'LinkedIn Poll Option 1', 'LinkedIn Poll Option 2', 'LinkedIn Poll Option 3', 'LinkedIn Poll Option 4',
  'LinkedIn Poll Duration', 'LinkedIn Show link preview', 'LinkedIn Images as Carousel',
  'Threads Reply Control', 'Threads Is Spoiler', 'Threads Post Type',
];

function csvEscape(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

type RowOverrides = Partial<Record<string, string>>;

function buildRow(overrides: RowOverrides): string {
  return CSV_HEADER.map(h => csvEscape(overrides[h] ?? '')).join(',');
}

// imagensPorDia: dia -> URLs PNG por slideIdx (usadas em IG/FB/Pinterest/Threads)
// imagensJpgPorDia: dia -> URLs JPG por slideIdx (TikTok rejeita PNG, exige JPG)
// videosReelsPorDia: dia -> URL do MP4 do reel
// apenas: filtro de plataforma — 'tiktok' so emite linhas TikTok,
//         'instagram' so emite linhas IG+FB+Threads+Pinterest, undefined emite todas
export function gerarMetricoolCSV(
  conteudos: ConteudoDia[],
  startDate: string,
  imagensPorDia?: Map<number, string[]>,
  videosReelsPorDia?: Map<number, string>,
  imagensJpgPorDia?: Map<number, string[]>,
  apenas?: 'tiktok' | 'instagram',
): string {
  const lines: string[] = [CSV_HEADER.join(',')];
  const start = new Date(startDate + 'T00:00:00');
  // Cache-busting: as imagens do carrossel sao re-renderizadas no MESMO URL, mas
  // o CDN do Supabase serve a versao antiga em cache (ate ~1h). Acrescentar um
  // ?v= forca o Metricool/Instagram a buscar a versao mais recente (a 4:5).
  const cacheBust = Date.now();
  const semCache = (u: string) => u + (u.includes('?') ? '&' : '?') + 'v=' + cacheBust;

  for (const c of conteudos) {
    const ehCitacao = c.tipo === 'citacao-visual';
    const ehCarrossel = c.tipo.startsWith('carrossel');
    const urls = imagensPorDia?.get(c.dia) ?? [];
    const videoReel = videosReelsPorDia?.get(c.dia);
    // Se houver MP4 para o dia, PUBLICA-SE COMO REEL de video (mesmo que o tipo
    // seja "carrossel"): ha produtos que sao reels MP4 com musica, nao carrosseis
    // de imagens. So cai no PNG quando NAO ha video nenhum.
    const ehReel = c.tipo.startsWith('reel') || !!videoReel;

    // Skip se nao ha media: reel sem MP4, ou carrossel/citacao sem imagem nem video.
    if (ehReel && !videoReel) continue;
    if ((ehCarrossel || ehCitacao) && urls.length === 0 && !videoReel) continue;

    const date = new Date(start);
    date.setDate(date.getDate() + c.dia - 1);
    // Formata a partir dos componentes LOCAIS (nao toISOString, que converte
    // para UTC e em Portugal/UTC+1 recuava a data um dia para domingo).
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD
    const timeStr = c.horario.length === 5 ? `${c.horario}:00` : c.horario; // HH:MM:SS

    const podeTerMusica = ehCitacao;
    const musica = c.musicaSugerida ?? c.reelScript?.musica ?? '';

    const draft = 'FALSE';

    // Picture Urls + Alt Texts
    // - Carrosseis/citacoes: 1..N URLs dos slides PNG
    // - Reels: Picture Url 1 = MP4 (Metricool detecta pela extensao)
    const pictureCols: RowOverrides = {};
    if (ehReel && videoReel) {
      pictureCols['Picture Url 1'] = semCache(videoReel);
      pictureCols['Alt text picture 1'] = `${c.titulo} — reel video por Vivianne dos Santos`;
    } else if ((ehCarrossel || ehCitacao) && urls.length > 0) {
      urls.slice(0, 10).forEach((u, i) => {
        pictureCols[`Picture Url ${i + 1}`] = semCache(u);
        const slide = c.slides?.[i];
        if (slide) {
          pictureCols[`Alt text picture ${i + 1}`] = gerarAltText(slide, c.mundo);
        }
      });
    }

    if ((c.plataforma === 'instagram' || c.plataforma === 'ambas') && apenas !== 'tiktok') {
      const captionIG = gerarCaptionInstagram(c);
      const firstCommentIG = podeTerMusica && musica
        ? `🎵 Música sugerida: ${musica}`
        : '';

      const igPostType = ehReel ? 'REEL' : 'POST';
      // Pinterest nao aceita video: so quando e mesmo carrossel/citacao de imagem.
      const podePinterest = (ehCarrossel || ehCitacao) && !ehReel;

      // ─── LINHA 1: Instagram + Facebook (caption longa + todos os pics) ───
      lines.push(buildRow({
        ...pictureCols,
        'Text': captionIG,
        'Date': dateStr,
        'Time': timeStr,
        'Draft': draft,
        'Facebook': 'TRUE',
        'Twitter/X': 'FALSE',
        'LinkedIn': 'FALSE',
        'GBP': 'FALSE',
        'Instagram': 'TRUE',
        'Pinterest': 'FALSE',
        'TikTok': 'FALSE',
        'Youtube': 'FALSE',
        'Threads': 'FALSE',
        'Bluesky': 'FALSE',
        'Instagram Post Type': igPostType,
        'Instagram Show Reel On Feed': ehReel ? 'TRUE' : '',
        'Facebook Post Type': ehReel ? 'REEL' : 'POST',
        'First Comment Text': firstCommentIG,
      }));

      // ─── LINHA 2: Threads (caption curta ≤480, so cover image) ───
      // Pic 1 = cover do carrossel/citacao OU MP4 do reel
      const threadsCover: RowOverrides = {};
      const coverUrl = pictureCols['Picture Url 1'];
      if (coverUrl) {
        threadsCover['Picture Url 1'] = coverUrl;
        if (pictureCols['Alt text picture 1']) {
          threadsCover['Alt text picture 1'] = pictureCols['Alt text picture 1'];
        }
      }
      lines.push(buildRow({
        ...threadsCover,
        'Text': gerarCaptionThreads(c),
        'Date': dateStr,
        'Time': timeStr,
        'Draft': draft,
        'Facebook': 'FALSE',
        'Twitter/X': 'FALSE',
        'LinkedIn': 'FALSE',
        'GBP': 'FALSE',
        'Instagram': 'FALSE',
        'Pinterest': 'FALSE',
        'TikTok': 'FALSE',
        'Youtube': 'FALSE',
        'Threads': 'TRUE',
        'Bluesky': 'FALSE',
        'Threads Post Type': ehReel ? 'VIDEO' : 'POST',
      }));

      // ─── LINHA 3: Pinterest (so carrosseis/citacoes, 1 image only) ───
      if (podePinterest && coverUrl) {
        const pinPic: RowOverrides = {
          'Picture Url 1': coverUrl,
          'Alt text picture 1': pictureCols['Alt text picture 1'] ?? gerarPinTitle(c),
        };
        lines.push(buildRow({
          ...pinPic,
          'Text': gerarPinterestDescription(c),
          'Date': dateStr,
          'Time': timeStr,
          'Draft': draft,
          'Facebook': 'FALSE',
          'Twitter/X': 'FALSE',
          'LinkedIn': 'FALSE',
          'GBP': 'FALSE',
          'Instagram': 'FALSE',
          'Pinterest': 'TRUE',
          'TikTok': 'FALSE',
          'Youtube': 'FALSE',
          'Threads': 'FALSE',
          'Bluesky': 'FALSE',
          'Pinterest Board': PINTEREST_BOARDS[c.mundo],
          'Pinterest Pin Title': gerarPinTitle(c),
          'Pinterest Pin Link': PINTEREST_LINK,
        }));
      }
    }

    if ((c.plataforma === 'tiktok' || c.plataforma === 'ambas') && apenas !== 'instagram') {
      const captionTT = gerarCaptionTikTok(c);

      // TikTok exige image/jpeg ou image/webp — rejeita PNG.
      // Constroi pictureCols especifico do TikTok com URLs .jpg.
      const urlsJpg = ehReel ? null : (imagensJpgPorDia?.get(c.dia) ?? null);
      const pictureColsTT: RowOverrides = {};
      if (ehReel && videoReel) {
        pictureColsTT['Picture Url 1'] = semCache(videoReel);
        pictureColsTT['Alt text picture 1'] = pictureCols['Alt text picture 1'] ?? '';
      } else if ((ehCarrossel || ehCitacao) && urlsJpg && urlsJpg.length > 0) {
        urlsJpg.slice(0, 10).forEach((u, i) => {
          pictureColsTT[`Picture Url ${i + 1}`] = u;
          const altKey = `Alt text picture ${i + 1}`;
          if (pictureCols[altKey]) pictureColsTT[altKey] = pictureCols[altKey];
        });
      } else {
        // Fallback: usa as URLs PNG (TikTok vai rejeitar se nao tiver JPG ainda)
        Object.assign(pictureColsTT, pictureCols);
      }

      lines.push(buildRow({
        ...pictureColsTT,
        'Text': captionTT,
        'Date': dateStr,
        'Time': timeStr,
        'Draft': draft,
        'Facebook': 'FALSE',
        'Twitter/X': 'FALSE',
        'LinkedIn': 'FALSE',
        'GBP': 'FALSE',
        'Instagram': 'FALSE',
        'Pinterest': 'FALSE',
        'TikTok': 'TRUE',
        'Youtube': 'FALSE',
        'Threads': 'FALSE',
        'Bluesky': 'FALSE',
        'TikTok disable comments': 'FALSE',
        'TikTok disable duet': 'FALSE',
        'TikTok disable stitch': 'FALSE',
        'TikTok Post Privacy': 'PUBLIC_TO_EVERYONE',
        'TikTok Branded Content': 'FALSE',
        'TikTok Your Brand': 'FALSE',
        'TikTok Auto Add Music': podeTerMusica ? 'TRUE' : 'FALSE',
        'TikTok is AI generated content': 'FALSE',
      }));
    }
  }

  return lines.join('\r\n');
}

// ── CSV Metricool a partir da PUBLICAR (qualquer conta) ──
// Reaproveita o CABEÇALHO e o escaping reais do Metricool. Exporta os posts que
// a Vivianne escolhe na Publicar (por conta + intervalo de datas) para agendar
// em massa — sobretudo o TikTok, que não se publica sozinho daqui.
//   - post com vídeo (reel/MP4): TikTok e/ou Instagram (Reel)
//   - post com imagens (carrossel): Instagram (carrossel). TikTok não aceita PNG,
//     por isso fica de fora dos posts de imagem.
// A legenda LONGA (com hashtags) vai no Text. Cache-busting no URL.
export type PublicarCsvDia = { videoUrl?: string | null; imagens?: string[]; caption: string; titulo?: string; date: string; time: string };

export function gerarMetricoolCSVPublicar(dias: PublicarCsvDia[], plataforma: 'tiktok' | 'instagram' | 'ambas' = 'tiktok'): string {
  const lines: string[] = [CSV_HEADER.join(',')];
  const cacheBust = Date.now();
  const semCache = (u: string) => u + (u.includes('?') ? '&' : '?') + 'v=' + cacheBust;
  const base: RowOverrides = {
    'Facebook': 'FALSE', 'Twitter/X': 'FALSE', 'LinkedIn': 'FALSE', 'GBP': 'FALSE',
    'Instagram': 'FALSE', 'Pinterest': 'FALSE', 'TikTok': 'FALSE', 'Youtube': 'FALSE',
    'Threads': 'FALSE', 'Bluesky': 'FALSE', 'Draft': 'FALSE',
  };
  const querTT = plataforma === 'tiktok' || plataforma === 'ambas';
  const querIG = plataforma === 'instagram' || plataforma === 'ambas';
  for (const d of dias) {
    const video = d.videoUrl ? semCache(d.videoUrl) : '';
    const imagens = (d.imagens ?? []).filter(Boolean);
    if (!video && !imagens.length) continue;
    const time = d.time?.length === 5 ? `${d.time}:00` : (d.time || '13:00:00');
    const alt = (d.titulo ?? '').slice(0, 140);

    if (video) {
      // REEL / vídeo — TikTok (Picture Url 1 = MP4) e/ou Instagram Reel
      if (querTT) {
        lines.push(buildRow({
          ...base, 'Picture Url 1': video, 'Alt text picture 1': alt,
          'Text': d.caption, 'Date': d.date, 'Time': time, 'TikTok': 'TRUE',
          'TikTok Title': (d.titulo ?? '').slice(0, 90),
          'TikTok disable comments': 'FALSE', 'TikTok disable duet': 'FALSE', 'TikTok disable stitch': 'FALSE',
          'TikTok Post Privacy': 'PUBLIC_TO_EVERYONE', 'TikTok Branded Content': 'FALSE',
          'TikTok Your Brand': 'FALSE', 'TikTok Auto Add Music': 'FALSE', 'TikTok is AI generated content': 'FALSE',
        }));
      }
      if (querIG) {
        lines.push(buildRow({
          ...base, 'Picture Url 1': video, 'Alt text picture 1': alt,
          'Text': d.caption, 'Date': d.date, 'Time': time, 'Instagram': 'TRUE',
          'Instagram Post Type': 'Reel', 'Instagram Show Reel On Feed': 'TRUE',
        }));
      }
    } else if (querIG) {
      // CARROSSEL de imagens — só Instagram (TikTok rejeita PNG)
      const pics: RowOverrides = {};
      imagens.slice(0, 10).forEach((u, i) => { pics[`Picture Url ${i + 1}`] = semCache(u); });
      if (alt) pics['Alt text picture 1'] = alt;
      lines.push(buildRow({
        ...base, ...pics, 'Text': d.caption, 'Date': d.date, 'Time': time,
        'Instagram': 'TRUE', 'Instagram Post Type': 'POST',
      }));
    }
  }
  return lines.join('\r\n');
}

export function gerarResumoTexto(conteudos: ConteudoDia[]): string {
  const lines: string[] = ['CALENDARIO DE CONTEUDO · 30 DIAS', '='.repeat(50), ''];

  for (const c of conteudos) {
    const pal = PALETAS[c.mundo];
    lines.push(`DIA ${c.dia} | ${c.tipo.toUpperCase()} | ${pal.nome} | ${c.horario}`);
    lines.push(`Titulo: ${c.titulo}`);
    lines.push(`Plataforma: ${c.plataforma === 'ambas' ? 'Instagram + TikTok' : c.plataforma}`);

    if (c.produtoRelacionado) {
      lines.push(`Produto: ${c.produtoRelacionado}`);
    }

    if (c.slides) {
      lines.push(`Slides: ${c.slides.length}`);
      c.slides.forEach((s, i) => {
        lines.push(`  [${i + 1}] ${s.tipo}${s.titulo ? ` · ${s.titulo}` : ''}`);
        lines.push(`      ${s.texto.replace(/\n/g, ' ').substring(0, 100)}...`);
      });
    }

    if (c.reelScript) {
      lines.push(`Duracao: ${c.reelScript.duracao}`);
      lines.push(`Gancho: ${c.reelScript.gancho}`);
      lines.push(`CTA: ${c.reelScript.cta}`);
      if (c.reelScript.musica) lines.push(`Musica: ${c.reelScript.musica}`);
    }

    lines.push(`Hashtags: ${c.hashtags.join(' ')}`);
    lines.push('');
    lines.push('-'.repeat(50));
    lines.push('');
  }

  return lines.join('\n');
}
