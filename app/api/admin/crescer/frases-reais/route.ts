import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// FRASES REAIS · puxa frases que a Vivianne JÁ gerou no crescer (carousel_collections
// com slug crescer-%), cada uma com a sua matéria (theme.crescer.tematica). É a ponte
// para testar o mundo com conteúdo DELA — nunca escrito à mão (regra travada #4).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('brief, dias, theme')
    .like('slug', 'crescer-%')
    .limit(200);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  type Row = { brief?: string; dias?: Array<{ slides?: Array<{ texto?: string }> }>; theme?: { crescer?: { tematica?: string } } };
  const frases: { frase: string; tematica: string }[] = [];
  for (const r of (data ?? []) as Row[]) {
    const frase = (r.brief || r.dias?.[0]?.slides?.[0]?.texto || '').trim();
    if (frase) frases.push({ frase, tematica: r.theme?.crescer?.tematica || '' });
  }
  return NextResponse.json({ ok: true, frases });
}
