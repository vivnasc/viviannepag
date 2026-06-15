import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';

// Guarda a LEGENDA editada à mão de UM post (a Vivianne quer corrigir o texto da
// publicação manualmente). Só mexe na legenda; não toca no resto.

type Dia = { legenda?: string };
type Row = { slug: string; dias?: Dia[] | null };

// POST { slug, legenda }: grava dias[0].legenda.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; legenda?: string };
  const slug = (body.slug ?? '').trim();
  if (!slug) return NextResponse.json({ erro: 'sem-slug' }, { status: 400 });
  if (typeof body.legenda !== 'string') return NextResponse.json({ erro: 'sem-legenda' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias').eq('slug', slug).maybeSingle();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const row = data as Row | null;
  if (!row?.dias?.[0]) return NextResponse.json({ erro: 'post-desconhecido' }, { status: 404 });

  row.dias[0].legenda = limparTravessoes(body.legenda);
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias: row.dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db-update', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
