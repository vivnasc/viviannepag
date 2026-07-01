import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// LIMPAR · apaga do crescer os rascunhos que NUNCA foram usados: não publicados E não
// agendados. Protege SEMPRE o que está publicado ou agendado. GET conta; DELETE apaga.
type Row = { slug: string; theme?: { igPublicado?: boolean; publicado?: boolean; agendadoEm?: string | null } | null };

async function classificar(): Promise<{ apagar: string[]; protegidos: number }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'crescer-%');
  if (error) throw new Error(error.message);
  const apagar: string[] = [];
  let protegidos = 0;
  for (const r of (data ?? []) as Row[]) {
    const usado = Boolean(r.theme?.igPublicado || r.theme?.publicado || r.theme?.agendadoEm);
    if (usado) protegidos++; else apagar.push(r.slug);
  }
  return { apagar, protegidos };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  try { const { apagar, protegidos } = await classificar(); return NextResponse.json({ ok: true, aApagar: apagar.length, protegidos }); }
  catch (e) { return NextResponse.json({ erro: 'db', detalhe: String(e) }, { status: 500 }); }
}

export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  try {
    const { apagar, protegidos } = await classificar();
    const supabase = getSupabaseAdmin();
    let apagados = 0;
    for (let i = 0; i < apagar.length; i += 100) {
      const lote = apagar.slice(i, i + 100);
      const { error } = await supabase.from('carousel_collections').delete().in('slug', lote);
      if (error) throw new Error(error.message);
      apagados += lote.length;
    }
    return NextResponse.json({ ok: true, apagados, protegidos });
  } catch (e) { return NextResponse.json({ erro: 'db', detalhe: String(e) }, { status: 500 }); }
}
