import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';

// Define a HORA de publicação EM MASSA dos posts de uma conta (a Vivianne quer
// as frases de manhã, às 11h). Não mexe na data nem no texto, só na hora.

// POST { conta, hora } OU { conta, auto:true }.
//  - hora: põe essa hora em todos os posts da conta.
//  - auto: ARRUMA por período — manhã (2 faces) às 11h, tarde (motor 'nbeats') às 17h.
type RowT = { slug: string; theme?: { hora?: string | null; subtipo?: string | null; metodo?: { conta?: string } } | null };
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string; hora?: string; auto?: boolean };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const hora = (body.hora ?? '').trim();
  if (!body.auto && !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return NextResponse.json({ erro: 'hora-invalida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const meus = (data ?? []).filter((r: RowT) => r.theme?.metodo?.conta === contaId) as RowT[];
  let mudados = 0;
  for (const r of meus) {
    const alvo = body.auto ? (r.theme?.subtipo === 'nbeats' ? '17:00' : '11:00') : hora;
    if (r.theme?.hora === alvo) continue;
    const theme = { ...(r.theme ?? {}), hora: alvo };
    const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', r.slug);
    if (!e2) mudados += 1;
  }
  return NextResponse.json({ ok: true, mudados, hora: body.auto ? 'auto (manhã 11h · tarde 17h)' : hora });
}
