import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// CRESCER · estado das peças geradas (slug 'crescer-*'), achatado para a página
// /admin/crescer. O motion/som (rotas genéricas) gravam em theme.soulab.*, por
// isso lê-se daí o clip/som; a temática/formato/visual vivem em theme.crescer.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, brief, dias, theme, created_at')
    .like('slug', 'crescer-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string;
    brief?: string | null;
    dias?: Array<{ videoUrl?: string | null; imagens?: string[] | null; legenda?: string | null; hashtags?: string[] | null; slides?: Array<{ texto?: string; conceito?: string; imageUrl?: string | null; destaque?: string[]; notaVisual?: string | null; efeito?: string | null; tipografia?: Record<string, unknown> | null; segPorMomento?: number | null }> }> | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean; crescer?: { tematica?: string; formato?: string; visual?: string; reel?: boolean }; soulab?: { clipUrl?: string | null; somUrl?: string | null; somTipo?: string | null; somEstilo?: string | null } } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const todosSlides = row.dias?.[0]?.slides ?? [];
    const slide = todosSlides[0];
    return {
      tematica: row.theme?.crescer?.tematica ?? null,
      formato: row.theme?.crescer?.formato ?? 'frase',
      visual: row.theme?.crescer?.visual ?? null,
      reel: row.theme?.crescer?.reel ?? false, // peça nova = sai sempre como reel
      momentos: todosSlides.length > 1 ? todosSlides.map((x) => x.texto ?? '').filter(Boolean) : null,
      slidesImgs: todosSlides.map((x) => x.imageUrl ?? null),
      slidesTip: todosSlides.map((x) => x.tipografia ?? null),
      slug: row.slug,
      texto: slide?.texto ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      destaque: slide?.destaque ?? [],
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      imagens: row.dias?.[0]?.imagens ?? null,
      clipUrl: row.theme?.soulab?.clipUrl ?? null,
      somUrl: row.theme?.soulab?.somUrl ?? null,
      somTipo: row.theme?.soulab?.somTipo ?? null,
      somEstilo: row.theme?.soulab?.somEstilo ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      hashtags: row.dias?.[0]?.hashtags ?? [],
      fundoPrompt: slide?.notaVisual ?? null,
      efeito: slide?.efeito ?? null,
      tipografia: slide?.tipografia ?? null,
      segPorMomento: slide?.segPorMomento ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      hora: row.theme?.hora ?? null,
      publicado: Boolean(row.theme?.igPublicado || row.theme?.publicado),
      criadoEm: row.created_at ?? null,
    };
  }).sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''));

  return NextResponse.json({ ok: true, pecas });
}
