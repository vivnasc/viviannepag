import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';

// Define a HORA de publicação EM MASSA dos posts de uma conta (a Vivianne quer
// as frases de manhã, às 11h). Não mexe na data nem no texto, só na hora.

type Row = { slug: string; theme?: { hora?: string | null; metodo?: { conta?: string } } | null };

// POST { conta, hora }: põe theme.hora = hora em todos os posts dessa conta.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string; hora?: string };
  const contaId = (body.conta ?? '') as ContaId;
  const hora = (body.hora ?? '').trim();
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return NextResponse.json({ erro: 'hora-invalida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const meus = (data ?? []).filter((r: Row) => r.theme?.metodo?.conta === contaId) as Row[];
  let mudados = 0;
  for (const r of meus) {
    if (r.theme?.hora === hora) continue;
    const theme = { ...(r.theme ?? {}), hora };
    const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', r.slug);
    if (!e2) mudados += 1;
  }
  return NextResponse.json({ ok: true, mudados, hora });
}
