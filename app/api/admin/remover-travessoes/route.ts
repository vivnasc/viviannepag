import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const TRAVESSOES = /[—–]/g;

function limpar(s: string | null): string | null {
  if (!s) return s;
  return s.replace(/\s*[—–]\s*/g, '. ').replace(/\.\s*\./g, '.').trim();
}

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: escritos } = await supabase
    .from('escritos')
    .select('id, titulo, resumo, conteudo');
  if (!escritos) return NextResponse.json({ erro: 'sem-escritos' }, { status: 500 });

  let alterados = 0;
  const detalhes: string[] = [];

  for (const e of escritos as Array<{ id: string; titulo: string; resumo: string; conteudo: string }>) {
    const temNoTitulo = TRAVESSOES.test(e.titulo);
    TRAVESSOES.lastIndex = 0;
    const temNoResumo = TRAVESSOES.test(e.resumo ?? '');
    TRAVESSOES.lastIndex = 0;
    const temNoConteudo = TRAVESSOES.test(e.conteudo ?? '');
    TRAVESSOES.lastIndex = 0;

    if (!temNoTitulo && !temNoResumo && !temNoConteudo) continue;

    const update: Record<string, string | null> = {};
    if (temNoTitulo) update.titulo = limpar(e.titulo) ?? e.titulo;
    if (temNoResumo) update.resumo = limpar(e.resumo) ?? e.resumo;
    if (temNoConteudo) update.conteudo = limpar(e.conteudo) ?? e.conteudo;
    update.updated_at = new Date().toISOString();

    await supabase.from('escritos').update(update).eq('id', e.id);
    alterados++;
    detalhes.push(`✓ ${e.titulo.slice(0, 60)}`);
  }

  return NextResponse.json({ ok: true, alterados, total: escritos.length, detalhes });
}
