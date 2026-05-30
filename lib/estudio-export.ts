import type { ConteudoDia, Mundo } from './estudio-conteudo';
import { PALETAS } from './estudio-conteudo';

const HASHTAGS_IG = [
  '#viviannedossantos', '#psicologiatranspessoal', '#constelacaofamiliar',
  '#autoconhecimento', '#crescimentopessoal', '#terapia', '#maternidade',
  '#ebooks', '#recursosterapeuticos',
];

const HASHTAGS_TT = [
  '#viviannedossantos', '#psicologia', '#autoconhecimento',
  '#fyp', '#foryou', '#terapia',
];

export function gerarCaptionInstagram(c: ConteudoDia): string {
  const pal = PALETAS[c.mundo];
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
    lines.push('');
    lines.push('Desliza para ler.');
  }

  lines.push('');
  lines.push(`Vivianne dos Santos`);
  lines.push('');
  lines.push('Ebooks e guias em PDF imediato:');
  lines.push('viviannedossantos.com/loja');
  lines.push('');
  lines.push([...c.hashtags.slice(0, 8), ...HASHTAGS_IG.slice(0, 5)].filter((v, i, a) => a.indexOf(v) === i).join(' '));

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
  lines.push([...c.hashtags.slice(0, 5), ...HASHTAGS_TT].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10).join(' '));

  return lines.join('\n');
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

// imagensPorDia: dia -> array de URLs ordenado por slideIdx (carrosseis e citacoes)
export function gerarMetricoolCSV(
  conteudos: ConteudoDia[],
  startDate: string,
  imagensPorDia?: Map<number, string[]>,
): string {
  const lines: string[] = [CSV_HEADER.join(',')];
  const start = new Date(startDate + 'T00:00:00');

  for (const c of conteudos) {
    const date = new Date(start);
    date.setDate(date.getDate() + c.dia - 1);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = c.horario.length === 5 ? `${c.horario}:00` : c.horario; // HH:MM:SS

    const ehReel = c.tipo.startsWith('reel');
    const ehCitacao = c.tipo === 'citacao-visual';
    const ehCarrossel = c.tipo.startsWith('carrossel');
    const podeTerMusica = ehReel || ehCitacao;
    const musica = c.reelScript?.musica ?? c.musicaSugerida ?? '';
    const urls = imagensPorDia?.get(c.dia) ?? [];

    // Reels nao tem media ainda (vais filmar) -> draft. Carrosseis e citacoes ja renderizados.
    const draft = ehReel ? 'TRUE' : 'FALSE';

    // Picture Urls (apenas para carrosseis e citacoes que tem PNG renderizado)
    const pictureCols: RowOverrides = {};
    if ((ehCarrossel || ehCitacao) && urls.length > 0) {
      urls.slice(0, 10).forEach((u, i) => {
        pictureCols[`Picture Url ${i + 1}`] = u;
      });
    }

    if (c.plataforma === 'instagram' || c.plataforma === 'ambas') {
      const captionIG = gerarCaptionInstagram(c);
      const firstCommentIG = podeTerMusica && musica
        ? `Musica sugerida: ${musica}\n\n${c.hashtags.join(' ')}`
        : c.hashtags.join(' ');

      const igPostType = ehReel ? 'REEL' : 'POST';

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
        'Threads': 'TRUE',
        'Bluesky': 'FALSE',
        'Instagram Post Type': igPostType,
        'Instagram Show Reel On Feed': ehReel ? 'TRUE' : '',
        'Facebook Post Type': ehReel ? 'REEL' : 'POST',
        'First Comment Text': firstCommentIG,
      }));
    }

    if (c.plataforma === 'tiktok' || c.plataforma === 'ambas') {
      const captionTT = gerarCaptionTikTok(c);

      lines.push(buildRow({
        ...pictureCols,
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
