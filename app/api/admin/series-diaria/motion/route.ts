import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listarAudios, escolherAudio, type SerieId } from '@/lib/series/pool';

export const runtime = 'nodejs';
const BUCKET = 'viviannepag-assets';

// POST — carregar o motion de um dia (upload assinado, browser->Supabase direto,
// para não tropeçar no limite de corpo da Vercel com vídeos grandes):
//   { action:'sign', slug, ext } -> { bucket, path, token }  (browser faz uploadToSignedUrl)
//   { action:'set',  slug, path } -> grava o URL publico do motion na coleção
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; slug?: string; ext?: string; path?: string };
  const slug = (body.slug || '').trim();
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const sb = getSupabaseAdmin();

  // QUEIMAR: marca o motion ATUAL deste dia como já usado (entra em quarentena
  // 90 dias) e LIBERTA o dia (volta a "falta motion") para gerar/carregar outro.
  if (body.action === 'queimar') {
    const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
    if (e1 || !row) return NextResponse.json({ erro: 'dia-nao-encontrado' }, { status: 404 });
    const t = (row.theme ?? {}) as { formato?: string; motionPath?: string; agendadoEm?: string };
    if (t.formato !== 'serie-diaria') return NextResponse.json({ erro: 'nao-e-serie' }, { status: 400 });
    if (!t.motionPath) return NextResponse.json({ erro: 'este dia não tem motion para marcar' }, { status: 400 });
    const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ motionUrl?: string | null; videoUrl?: string | null }>; videoUrl?: string | null }>;
    if (dias[0]?.slides?.[0]) { dias[0].slides[0].motionUrl = null; dias[0].slides[0].videoUrl = null; }
    if (dias[0]) dias[0].videoUrl = null;
    const theme = { ...((row.theme as Record<string, unknown>) ?? {}), motionQueimado: t.motionPath, motionQueimadoEm: t.agendadoEm ?? new Date().toISOString().slice(0, 10), motionPath: null, motionNome: null, motionFonte: null };
    const { error } = await sb.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'sign') {
    const ext = ((body.ext || 'mp4').replace(/[^a-z0-9]/gi, '').toLowerCase()) || 'mp4';
    const path = `series-motions/${slug}-${Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ erro: 'sign', detalhe: error?.message }, { status: 500 });
    return NextResponse.json({ ok: true, bucket: BUCKET, path: data.path, token: data.token });
  }

  if (body.action === 'set') {
    const path = (body.path || '').trim();
    if (!path) return NextResponse.json({ erro: 'falta path' }, { status: 400 });
    const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
    if (e1 || !row) return NextResponse.json({ erro: 'colecao-nao-encontrada' }, { status: 404 });
    const t = (row.theme ?? {}) as { serie?: SerieId; dia?: string; mjPrompt?: string; audioFonte?: string };
    const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ motionUrl?: string; videoUrl?: string | null }>; faixa?: { titulo?: string; url?: string }; videoUrl?: string | null }>;
    if (dias[0]?.slides?.[0]) { dias[0].slides[0].motionUrl = url; dias[0].slides[0].videoUrl = null; }
    if (dias[0]) dias[0].videoUrl = null; // motion novo → MP4 antigo desatualizado
    // o SOM só re-casa automaticamente se NÃO foi escolhido à mão pela Vivianne
    // (audioFonte='manual' = escolha dela, intocável; o match automático tem
    // inconsistências e som que não bate parte o momento contemplativo)
    let audioMood: string | null = dias[0]?.faixa?.titulo ?? null;
    if (t.audioFonte !== 'manual') {
      try {
        const serie: SerieId = t.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
        const audios = await listarAudios(serie);
        const a = audios.length ? escolherAudio({ descritor: t.mjPrompt ?? '', dia: t.dia ?? '', serie, audios }) : null;
        if (a && dias[0]) { dias[0].faixa = { titulo: a.mood, url: a.url }; audioMood = a.mood; }
      } catch { /* sem pool de áudios: mantém o som que tinha */ }
    }
    const theme = { ...((row.theme as Record<string, unknown>) ?? {}), motionPath: path, motionFonte: 'upload' };
    const { error } = await sb.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, url, audioMood });
  }

  return NextResponse.json({ erro: 'action inválida' }, { status: 400 });
}
