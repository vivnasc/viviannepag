import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';

// SOULAB · editar a LEGENDA e/ou as HASHTAGS de uma peça (autonomia: ela mexe no
// texto do post sem depender de mim). Guarda em dias[0] — o mesmo que o cron lê.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; legenda?: string; hashtags?: string[] | string; efeito?: string };
  if (!body.slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', body.slug).single();
  if (error || !row) return NextResponse.json({ erro: 'db', detalhe: error?.message }, { status: 500 });

  const dias = ((row.dias as Array<Record<string, unknown>>) ?? []);
  if (!dias[0]) dias[0] = { dia: 1 };
  if (typeof body.legenda === 'string') dias[0].legenda = limparTravessoes(body.legenda);
  if (body.hashtags !== undefined) {
    const tags = Array.isArray(body.hashtags) ? body.hashtags : String(body.hashtags).split(/[\s,]+/);
    dias[0].hashtags = tags.map((t) => String(t).trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`));
  }
  // o EFEITO do texto vive no slide (o render lê s.efeito).
  if (typeof body.efeito === 'string') {
    const slides = ((dias[0].slides as Array<Record<string, unknown>>) ?? []);
    if (slides[0]) { slides[0].efeito = body.efeito; dias[0].slides = slides; }
  }

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', body.slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, legenda: dias[0].legenda, hashtags: dias[0].hashtags });
}
