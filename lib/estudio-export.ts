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

const CSV_HEADER = [
  'Draft', 'Social Account', 'Publish Date', 'Publish Time', 'Content',
  'Image URL 1', 'Image URL 2', 'Image URL 3', 'Image URL 4', 'Image URL 5',
  'Video URL', 'Video Thumbnail',
  'Instagram: Location', 'Instagram: First Comment', 'Instagram: Collaborator Username',
  'Instagram: Share to Feed', 'Instagram: Pin to Profile',
  'TikTok: Privacy', 'TikTok: Allow Comments', 'TikTok: Allow Duet',
  'TikTok: Allow Stitch', 'TikTok: Content Disclosure', 'TikTok: Your Brand',
  'TikTok: Branded Content', 'TikTok: Auto Music',
];

function csvEscape(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function gerarMetricoolCSV(conteudos: ConteudoDia[], startDate: string): string {
  const lines: string[] = [CSV_HEADER.join(',')];
  const start = new Date(startDate);

  for (const c of conteudos) {
    const date = new Date(start);
    date.setDate(date.getDate() + c.dia - 1);
    const dateStr = date.toISOString().split('T')[0];

    const captionIG = gerarCaptionInstagram(c);
    const captionTT = gerarCaptionTikTok(c);

    // Musica: prioriza reelScript.musica, depois musicaSugerida (citacao)
    const musica = c.reelScript?.musica ?? c.musicaSugerida ?? '';
    const ehReel = c.tipo.startsWith('reel');
    const ehCitacao = c.tipo === 'citacao-visual';
    const podeTerMusica = ehReel || ehCitacao;

    // Para IG, adicionar musica ao first comment se aplicavel
    const firstCommentIG = podeTerMusica && musica
      ? `♪ Música sugerida: ${musica}\n\n${c.hashtags.join(' ')}`
      : c.hashtags.join(' ');

    if (c.plataforma === 'instagram' || c.plataforma === 'ambas') {
      const row = [
        'FALSE',
        'Instagram',
        dateStr,
        c.horario,
        csvEscape(captionIG),
        '', '', '', '', '',
        '', '',
        '', csvEscape(firstCommentIG), '',
        'TRUE', 'FALSE',
        '', '', '', '', '', '', '', '',
      ];
      lines.push(row.join(','));
    }

    if (c.plataforma === 'tiktok' || c.plataforma === 'ambas') {
      // TikTok: Auto Music = TRUE para reels e citacoes (Metricool escolhe trending)
      const autoMusic = podeTerMusica ? 'TRUE' : 'FALSE';

      const row = [
        'FALSE',
        'TikTok',
        dateStr,
        c.horario,
        csvEscape(captionTT),
        '', '', '', '', '',
        '', '',
        '', '', '',
        '', '',
        'PUBLIC', 'TRUE', 'TRUE',
        'TRUE', 'FALSE', 'FALSE',
        'FALSE', autoMusic,
      ];
      lines.push(row.join(','));
    }
  }

  return lines.join('\n');
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
