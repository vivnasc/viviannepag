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
    dias?: Array<{ videoUrl?: string | null; legenda?: string | null; slides?: Array<{ texto?: string; conceito?: string; imageUrl?: string | null; destaque?: string[] }> }> | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean; soulab?: { tipo?: string; clipUrl?: string | null } } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const slide = row.dias?.[0]?.slides?.[0];
    return {
      slug: row.slug,
      tipo: row.theme?.soulab?.tipo ?? null,
      texto: slide?.texto ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      destaque: slide?.destaque ?? [],
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      clipUrl: row.theme?.soulab?.clipUrl ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      hora: row.theme?.hora ?? null,
      publicado: Boolean(row.theme?.igPublicado || row.theme?.publicado),
      criadoEm: row.created_at ?? null,
    };
  }).sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '')); // mais recentes primeiro

  return NextResponse.json({ ok: true, pecas });
}
