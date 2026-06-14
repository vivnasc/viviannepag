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
    dias?: { videoUrl?: string | null }[] | null;
    theme?: { agendadoEm?: string | null; igPublicado?: boolean; metodo?: { reelId?: string } } | null;
    created_at?: string;
  };

  const estado: Record<string, { slug: string; videoUrl: string | null; agendadoEm: string | null; publicado: boolean; criadoEm: string | null }> = {};
  for (const row of (data ?? []) as Row[]) {
    const reelId = row.theme?.metodo?.reelId ?? row.slug.replace(/^metodo-/, '');
    estado[reelId] = {
      slug: row.slug,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      publicado: Boolean(row.theme?.igPublicado),
      criadoEm: row.created_at ?? null,
    };
  }

  return NextResponse.json({ ok: true, estado });
}
