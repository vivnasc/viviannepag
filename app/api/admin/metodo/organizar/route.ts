import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CONTAS, ContaId } from '@/lib/metodo/contas';
import { planoSemana } from '@/lib/metodo/semana';
import { PostTipo } from '@/lib/metodo/posts';

export const runtime = 'nodejs';

// Dá DATA aos posts do método que ainda não têm (os gerados antes do dating),
// encaixando-os no plano por TIPO: reconhecimento nos dias de reconhecimento,
// etc. Assim ficam organizados por dia (segunda/quinta...). Não publica nada;
// é só o plano (rascunho).

// datas do plano para um tipo, ao longo de várias semanas (quantas precisar).
function datasPorTipo(conta: ContaId, tipo: PostTipo, n: number): { data: string; hora: string }[] {
  const out: { data: string; hora: string }[] = [];
  for (let w = 0; out.length < n && w < 30; w++) {
    for (const d of planoSemana(conta, w)) if (d.tipo === tipo) out.push({ data: d.data, hora: d.hora });
  }
  return out;
}

type Row = { slug: string; theme?: { agendadoEm?: string | null; metodo?: { conta?: string; tipo?: string } } | null };

// POST { conta }: data os posts sem data, por tipo->dia.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const semData = (data ?? []).filter((r: Row) => r.theme?.metodo?.conta === contaId && !r.theme?.agendadoEm) as Row[];
  if (!semData.length) return NextResponse.json({ ok: true, datados: 0 });

  // agrupa por tipo e atribui as datas do plano desse tipo, por ordem.
  const porTipo: Record<string, Row[]> = {};
  for (const r of semData) { const t = r.theme?.metodo?.tipo ?? 'reconhecimento'; (porTipo[t] ??= []).push(r); }

  let datados = 0;
  for (const [tipo, lista] of Object.entries(porTipo)) {
    const datas = datasPorTipo(contaId, tipo as PostTipo, lista.length);
    for (let i = 0; i < lista.length; i++) {
      const slot = datas[i]; if (!slot) break;
      const r = lista[i];
      const theme = { ...(r.theme ?? {}), agendadoEm: slot.data, hora: slot.hora };
      const { error: e2 } = await supabase.from('carousel_collections').update({ theme }).eq('slug', r.slug);
      if (!e2) datados += 1;
    }
  }
  return NextResponse.json({ ok: true, datados });
}
