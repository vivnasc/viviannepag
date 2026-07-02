import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// ARQUIVAR em massa (NAO apaga) · marca os rascunhos que nunca foram usados (nao
// publicados, nao agendados, nao ja arquivados) com theme.arquivado=true. Ficam
// guardados na aba "arquivados". GET conta; DELETE (mantido por compat) arquiva.
type Theme = { igPublicado?: boolean; publicado?: boolean; agendadoEm?: string | null; arquivado?: boolean } | null;
type Row = { slug: string; theme?: Theme };

async function porArquivar(): Promise<{ alvos: Row[]; protegidos: number }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'crescer-%');
  if (error) throw new Error(error.message);
  const alvos: Row[] = [];
  let protegidos = 0;
  for (const r of (data ?? []) as Row[]) {
    const t = r.theme || {};
    if (t.arquivado) continue; // ja arquivada, nao conta
    if (t.igPublicado || t.publicado || t.agendadoEm) { protegidos++; continue; }
    alvos.push(r);
  }
  return { alvos, protegidos };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  try { const { alvos, protegidos } = await porArquivar(); return NextResponse.json({ ok: true, aArquivar: alvos.length, protegidos }); }
  catch (e) { return NextResponse.json({ erro: 'db', detalhe: String(e) }, { status: 500 }); }
}

export async function DELETE() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  try {
    const { alvos, protegidos } = await porArquivar();
    const supabase = getSupabaseAdmin();
    let arquivados = 0;
    for (const r of alvos) {
      const theme = { ...(r.theme || {}), arquivado: true };
      const { error } = await supabase.from('carousel_collections').update({ theme }).eq('slug', r.slug);
      if (!error) arquivados++;
    }
    return NextResponse.json({ ok: true, arquivados, protegidos });
  } catch (e) { return NextResponse.json({ erro: 'db', detalhe: String(e) }, { status: 500 }); }
}
