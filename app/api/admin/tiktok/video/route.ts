import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/video?slug=... — devolve o URL do MP4 (e a legenda) de
// uma coleção, para a página de publicação mostrar a PRÉ-VISUALIZAÇÃO do vídeo.

type Dia = { videoUrl?: string; legenda?: string; hashtags?: string[] };

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data } = await sb.from('carousel_collections').select('dias, title').eq('slug', slug).single();
  const d = (data?.dias as Dia[] | undefined)?.[0];
  const legenda = d ? [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n') : '';
  return NextResponse.json({ videoUrl: d?.videoUrl ?? null, legenda, title: data?.title ?? null });
}
