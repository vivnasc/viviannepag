import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarSom, somPromptDoDia } from '@/lib/series/som';

export const runtime = 'nodejs';
export const maxDuration = 60;
const BUCKET = 'viviannepag-assets';

// POST — SOM por dia, escolhido pela Vivianne (o match automático tem
// inconsistências; num formato contemplativo, som que não bate parte o
// momento). O som manual fica audioFonte='manual' e NUNCA é esmagado por
// re-matches automáticos.
//   { action:'sign', slug, ext }          → upload assinado de um som dela
//   { action:'set', slug, mood, url }     → som da pool (escolhido à mão)
//   { action:'set-upload', slug, path }   → som carregado por ela
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; slug?: string; ext?: string; mood?: string; url?: string; path?: string };
  const slug = (body.slug || '').trim();
  if (!slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });
  const sb = getSupabaseAdmin();

  if (body.action === 'sign') {
    const ext = ((body.ext || 'mp3').replace(/[^a-z0-9]/gi, '').toLowerCase()) || 'mp3';
    const path = `series-audios/${slug}-${Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ erro: 'sign', detalhe: error?.message }, { status: 500 });
    return NextResponse.json({ ok: true, bucket: BUCKET, path: data.path, token: data.token });
  }

  // GERAR o som deste dia na ElevenLabs, do prompt que NASCE da cena do motion
  // (pool: descrição do próprio motion; novo: somPrompt par do mjPrompt)
  if (body.action === 'gerar') {
    const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
    if (e1 || !row) return NextResponse.json({ erro: 'dia-nao-encontrado' }, { status: 404 });
    const t = (row.theme ?? {}) as { formato?: string; somPrompt?: string; mjPrompt?: string; motionNome?: string | null; motionFonte?: string | null };
    if (t.formato !== 'serie-diaria') return NextResponse.json({ erro: 'nao-e-serie' }, { status: 400 });
    const prompt = somPromptDoDia(t);
    if (!prompt) return NextResponse.json({ erro: 'sem-prompt-de-som (gera/regenera a frase primeiro)' }, { status: 400 });
    let url = '';
    try { url = await gerarSom(prompt, slug); } catch (e) { return NextResponse.json({ erro: 'elevenlabs', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }
    const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ faixa?: { titulo?: string; url?: string }; videoUrl?: string | null; slides?: Array<{ videoUrl?: string | null }> }>;
    if (!dias[0]) return NextResponse.json({ erro: 'sem-dias' }, { status: 500 });
    dias[0].faixa = { titulo: 'som da cena', url };
    dias[0].videoUrl = null; // som novo → MP4 antigo desatualizado
    if (dias[0].slides?.[0]) dias[0].slides[0].videoUrl = null;
    const theme = { ...((row.theme as Record<string, unknown>) ?? {}), audioFonte: 'gerado' };
    const { error } = await sb.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, mood: 'som da cena', url, prompt });
  }

  let mood = '', url = '';
  if (body.action === 'set') {
    mood = (body.mood || '').trim(); url = (body.url || '').trim();
    if (!url) return NextResponse.json({ erro: 'falta url' }, { status: 400 });
  } else if (body.action === 'set-upload') {
    const path = (body.path || '').trim();
    if (!path) return NextResponse.json({ erro: 'falta path' }, { status: 400 });
    url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    mood = 'som teu';
  } else {
    return NextResponse.json({ erro: 'action inválida' }, { status: 400 });
  }

  const { data: row, error: e1 } = await sb.from('carousel_collections').select('dias, theme').eq('slug', slug).single();
  if (e1 || !row) return NextResponse.json({ erro: 'dia-nao-encontrado' }, { status: 404 });
  if ((row.theme as { formato?: string } | null)?.formato !== 'serie-diaria') return NextResponse.json({ erro: 'nao-e-serie' }, { status: 400 });
  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ faixa?: { titulo?: string; url?: string }; videoUrl?: string | null; slides?: Array<{ videoUrl?: string | null }> }>;
  if (!dias[0]) return NextResponse.json({ erro: 'sem-dias' }, { status: 500 });
  dias[0].faixa = { titulo: mood, url };
  dias[0].videoUrl = null; // som mudou → o MP4 antigo (com o som velho) fica desatualizado
  if (dias[0].slides?.[0]) dias[0].slides[0].videoUrl = null;
  const theme = { ...((row.theme as Record<string, unknown>) ?? {}), audioFonte: 'manual' };
  const { error } = await sb.from('carousel_collections').update({ dias, theme }).eq('slug', slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mood, url });
}
