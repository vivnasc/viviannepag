import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET: estado dos reels do Método VS já gerados (slug 'metodo-*').
// Devolve um mapa reelId -> { slug, videoUrl, agendadoEm, publicado } para a
// página /admin/metodo mostrar o que já existe e o que falta.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, dias, theme, created_at')
    .like('slug', 'metodo-%');

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string;
    brief?: string | null;
    dias?: { videoUrl?: string | null; legenda?: string | null; slides?: { texto?: string; conceito?: string; imageUrl?: string | null }[] }[] | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; metodo?: { postId?: string; conta?: string; tipo?: string } } | null;
    created_at?: string;
  };

  const estado: Record<string, { slug: string; conta: string | null; tipo: string | null; texto: string; conceito: string; imageUrl: string | null; videoUrl: string | null; legenda: string | null; agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null }> = {};
  for (const row of (data ?? []) as Row[]) {
    const postId = row.theme?.metodo?.postId ?? row.slug.replace(/^metodo-/, '');
    const slide = row.dias?.[0]?.slides?.[0];
    estado[postId] = {
      slug: row.slug,
      conta: row.theme?.metodo?.conta ?? null,
      tipo: row.theme?.metodo?.tipo ?? null,
      texto: slide?.texto ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      hora: row.theme?.hora ?? null,
      publicado: Boolean(row.theme?.igPublicado),
      criadoEm: row.created_at ?? null,
    };
  }

  return NextResponse.json({ ok: true, estado });
}
