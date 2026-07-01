import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { PORTAS } from '@/lib/portas/marca';

export const runtime = 'nodejs';

// PORTAS · edita a legenda / hashtags de UMA peca (autonomia: afinar o texto do post).
const PREFIXOS = Object.keys(PORTAS).map((id) => `${id}-`);

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; legenda?: string; hashtags?: string };
  const slug = body.slug?.trim();
  if (!slug || !PREFIXOS.some((p) => slug.startsWith(p))) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (data.dias ?? []) as Array<{ legenda?: string; hashtags?: string[] }>;
  if (!dias[0]) return NextResponse.json({ erro: 'sem-dia' }, { status: 400 });
  if (typeof body.legenda === 'string') dias[0].legenda = limparTravessoes(body.legenda);
  if (typeof body.hashtags === 'string') {
    dias[0].hashtags = body.hashtags.split(/[\s,]+/).map((h) => h.trim()).filter(Boolean).map((h) => (h.startsWith('#') ? h : `#${h}`));
  }
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
