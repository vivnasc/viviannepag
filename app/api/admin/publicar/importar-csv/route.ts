import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { ContaId } from '@/lib/instagram/contas';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { csv, conta } — importa um CSV do Metricool e cria um post por cada
// linha de INSTAGRAM (ignora as de TikTok/etc., para não duplicar). O vídeo vem
// na coluna "Picture Url 1"; o texto na "Text". Cada post fica RASCUNHO (a
// Vivianne aprova depois no Publicar). A media já são URLs públicas.

// parser CSV simples mas correto: aspas, aspas duplas escapadas, \n dentro de aspas
function parseCSV(txt: string): string[][] {
  const linhas: string[][] = [];
  let campo = '', linha: string[] = [], dentro = false;
  txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (dentro) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else dentro = false; }
      else campo += c;
    } else {
      if (c === '"') dentro = true;
      else if (c === ',') { linha.push(campo); campo = ''; }
      else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
      else campo += c;
    }
  }
  if (campo.length || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((x) => x.trim() !== ''));
}

// corrige texto UTF-8 lido como Latin-1 (Ã£ -> ã, Â· -> ·) quando há sinais disso
function corrigeAcentos(s: string): string {
  if (!/Ã.|Â./.test(s)) return s;
  try { return decodeURIComponent(escape(s)); } catch { return s; }
}

const basename = (u: string) => (u.split('/').pop() || u).replace(/\.[a-z0-9]+$/i, '').slice(0, 60);

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { csv, conta = 'loja' } = (await req.json().catch(() => ({}))) as { csv?: string; conta?: ContaId };
  if (!csv || csv.length < 20) return NextResponse.json({ erro: 'csv-vazio' }, { status: 400 });

  const linhas = parseCSV(csv);
  if (linhas.length < 2) return NextResponse.json({ erro: 'csv-sem-linhas' }, { status: 400 });
  const head = linhas[0].map((h) => h.trim());
  const col = (nome: string) => head.indexOf(nome);
  const cText = col('Text'), cDate = col('Date'), cTime = col('Time'), cIG = col('Instagram'), cTipo = col('Instagram Post Type');
  const cPics = Array.from({ length: 10 }, (_, i) => col(`Picture Url ${i + 1}`)).filter((x) => x >= 0);
  if (cText < 0 || cDate < 0 || cIG < 0) return NextResponse.json({ erro: 'csv-formato', detalhe: 'faltam colunas Text/Date/Instagram (é o CSV do Metricool?)' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  let criados = 0, ignorados = 0; const erros: string[] = [];

  for (const l of linhas.slice(1)) {
    if ((l[cIG] || '').trim().toUpperCase() !== 'TRUE') { ignorados++; continue; } // só Instagram
    const texto = corrigeAcentos((l[cText] || '').trim());
    const data = (l[cDate] || '').trim().slice(0, 10);
    const hora = ((l[cTime] || '13:00').trim().slice(0, 5)) || '13:00';
    const tipo = (cTipo >= 0 ? (l[cTipo] || '').trim().toUpperCase() : '');
    const media = cPics.map((i) => (l[i] || '').trim()).filter(Boolean);
    if (!data || media.length === 0) { erros.push(`linha sem data/media (${data})`); continue; }

    const ehVideo = tipo === 'REEL' || /\.mp4($|\?)/i.test(media[0]);
    const dia: Record<string, unknown> = { dia: 1, legenda: texto, hashtags: [] };
    if (ehVideo) dia.videoUrl = media[0];
    else dia.imagens = media;

    const slug = `csv-${conta}-${basename(media[0])}`;
    const titulo = (texto.split('\n').find((x) => x.trim()) || 'Post').trim().slice(0, 48);
    const row = {
      slug,
      title: titulo,
      brief: 'importado do CSV',
      dias: [dia],
      theme: { marca: conta, formato: 'reel', externo: true, agendadoEm: data, hora, aprovado: false, capaRev: 2 },
    };
    const { error } = await supabase.from('carousel_collections').upsert(row, { onConflict: 'slug' });
    if (error) erros.push(`${slug}: ${error.message}`); else criados++;
  }

  return NextResponse.json({ ok: true, criados, ignorados, erros: erros.slice(0, 8) });
}
