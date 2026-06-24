import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { metodoVSConta } from '@/lib/metodo-vs/marca';

export const runtime = 'nodejs';

// MÉTODO VS · peças já geradas (por conta: prefixo do slug), para /admin/metodo-vs[/conta].
// Devolve TUDO o que o estúdio precisa (espelho do /api/admin/soulab/list): texto,
// destaque, momentos, imagem, clip (motion), som (cena/música), efeito, tipografia,
// tempo por momento, legenda, hashtags e o estado de agendamento.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const cfg = metodoVSConta(new URL(req.url).searchParams.get('conta'));
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, brief, dias, theme, created_at')
    .like('slug', `${cfg.prefixo}-%`)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Slide = {
    texto?: string; conceito?: string; destaque?: string[]; notaVisual?: string | null;
    imageUrl?: string | null; efeito?: string | null; transicao?: string | null;
    tipografia?: { fonte?: string; tamanho?: number; cor?: string; corDestaque?: string } | null;
    segPorMomento?: number | null;
  };
  type Row = {
    slug: string; brief?: string | null;
    dias?: Array<{ videoUrl?: string | null; legenda?: string | null; hashtags?: string[] | null; slides?: Slide[]; vozUrl?: string | null }> | null;
    theme?: {
      agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean;
      metodovs?: { veu?: string; formato?: string };
      soulab?: { clipUrl?: string | null; somUrl?: string | null; somTipo?: string | null; somEstilo?: string | null };
    } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const slides = row.dias?.[0]?.slides ?? [];
    const slide = slides[0];
    const momentos = slides.map((x) => x.texto ?? '').filter(Boolean);
    return {
      slug: row.slug,
      veu: row.theme?.metodovs?.veu ?? null,
      formato: row.theme?.metodovs?.formato ?? null,
      hora: row.theme?.hora ?? null,
      momentos,
      texto: slide?.texto ?? momentos[0] ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      destaque: slide?.destaque ?? [],
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      vozUrl: row.dias?.[0]?.vozUrl ?? null,
      clipUrl: row.theme?.soulab?.clipUrl ?? null,
      somUrl: row.theme?.soulab?.somUrl ?? null,
      somTipo: row.theme?.soulab?.somTipo ?? null,
      somEstilo: row.theme?.soulab?.somEstilo ?? null,
      efeito: slide?.efeito ?? null,
      transicao: slide?.transicao ?? null,
      tipografia: slide?.tipografia ?? null,
      segPorMomento: slide?.segPorMomento ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      hashtags: row.dias?.[0]?.hashtags ?? [],
      fundoPrompt: slide?.notaVisual ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      publicado: !!(row.theme?.igPublicado || row.theme?.publicado),
    };
  });
  return NextResponse.json({ ok: true, pecas });
}
