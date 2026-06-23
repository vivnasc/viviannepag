import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// MÉTODO VS · peças já geradas (slug 'metodovs-*'), para a página /admin/metodo-vs.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, brief, dias, theme, created_at')
    .like('slug', 'metodovs-%')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string; brief?: string | null;
    dias?: Array<{ videoUrl?: string | null; legenda?: string | null; slides?: Array<{ texto?: string; conceito?: string; imageUrl?: string | null }> }> | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean; metodovs?: { veu?: string; formato?: string } } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const slides = row.dias?.[0]?.slides ?? [];
    return {
      slug: row.slug,
      veu: row.theme?.metodovs?.veu ?? null,
      formato: row.theme?.metodovs?.formato ?? null,
      hora: row.theme?.hora ?? null,
      momentos: slides.map((x) => x.texto ?? '').filter(Boolean),
      conceito: slides[0]?.conceito ?? '',
      imageUrl: slides[0]?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      publicado: !!(row.theme?.igPublicado || row.theme?.publicado),
    };
  });
  return NextResponse.json({ ok: true, pecas });
}
