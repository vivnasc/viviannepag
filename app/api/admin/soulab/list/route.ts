import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// SOULAB · estado das peças já geradas (slug 'soulab-*'), para a página
// /admin/soulab mostrar o que existe e o que falta (imagem · vídeo · publicado).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, brief, dias, theme, created_at')
    .like('slug', 'soulab-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string;
    brief?: string | null;
    dias?: Array<{ videoUrl?: string | null; legenda?: string | null; hashtags?: string[] | null; slides?: Array<{ texto?: string; conceito?: string; imageUrl?: string | null; destaque?: string[]; notaVisual?: string | null; efeito?: string | null; tipografia?: { fonte?: string; tamanho?: number; cor?: string; corDestaque?: string } | null; segPorMomento?: number | null }> }> | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean; soulab?: { tipo?: string; lingua?: 'pt' | 'en'; clipUrl?: string | null; somUrl?: string | null; somTipo?: string | null; somEstilo?: string | null; formato?: string; parteDe?: string | null; parte?: number | null; veiaTitulo?: string | null; veiaLivro?: string | null; motionPredId?: string | null } } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const todosSlides = row.dias?.[0]?.slides ?? [];
    const slide = todosSlides[0];
    return {
      formato: row.theme?.soulab?.formato ?? 'frase',
      momentos: todosSlides.length > 1 ? todosSlides.map((x) => x.texto ?? '').filter(Boolean) : null,
      slug: row.slug,
      tipo: row.theme?.soulab?.tipo ?? null,
      // língua da peça (pt = @soulab.studio · en = conta internacional). Fallback pelo slug.
      lingua: (row.theme?.soulab?.lingua ?? (row.slug.startsWith('soulab-en-') ? 'en' : 'pt')) as 'pt' | 'en',
      texto: slide?.texto ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      destaque: slide?.destaque ?? [],
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
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
      parteDe: row.theme?.soulab?.parteDe ?? null, // série: o slug da parte anterior
      parte: row.theme?.soulab?.parte ?? null,     // número da parte no fio (2, 3…)
      veiaTitulo: row.theme?.soulab?.veiaTitulo ?? null, // de que secção do livro foi minerada
      veiaLivro: row.theme?.soulab?.veiaLivro ?? null,
      motionPendente: !!row.theme?.soulab?.motionPredId, // movimento a gerar (verifica-se sozinho)
      agendadoEm: row.theme?.agendadoEm ?? null,
      hora: row.theme?.hora ?? null,
      publicado: Boolean(row.theme?.igPublicado || row.theme?.publicado),
      criadoEm: row.created_at ?? null,
    };
  }).sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '')); // mais recentes primeiro

  return NextResponse.json({ ok: true, pecas });
}
