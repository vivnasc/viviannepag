import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';

// MOVER no tempo os posts de DIAS QUE JÁ PASSARAM (não publicados) para a frente,
// para não perder o trabalho já feito/revisto. Empurra por N SEMANAS inteiras
// (deltaSemanas * 7 dias): assim o DIA-DA-SEMANA mantém-se (logo o véu do dia
// continua certo) e a hora não muda. Re-data `theme.agendadoEm` E re-chaveia o
// slug (acaba na data), inserindo o novo e apagando o antigo. NUNCA toca em
// publicados nem clobbera um slug-alvo que já exista.

type Row = { slug: string; title?: string | null; brief?: string | null; dias?: unknown; theme?: { agendadoEm?: string | null; igPublicado?: boolean; publicado?: boolean; metodo?: { conta?: string } } | null };

function somaDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + dias);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// POST { conta, deltaSemanas }: move os passados não publicados +deltaSemanas semanas.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string; deltaSemanas?: number };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });
  const delta = Math.round(body.deltaSemanas ?? 0);
  if (!delta || delta < 1 || delta > 52) return NextResponse.json({ erro: 'delta-invalido', detalhe: 'deltaSemanas tem de ser 1..52' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, title, brief, dias, theme').like('slug', `metodo-${contaId}-%`);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const ag = new Date();
  const hojeStr = `${ag.getFullYear()}-${String(ag.getMonth() + 1).padStart(2, '0')}-${String(ag.getDate()).padStart(2, '0')}`;
  const rows = (data ?? []) as Row[];
  const existentes = new Set(rows.map((r) => r.slug));

  let movidos = 0;
  let saltados = 0;
  for (const r of rows) {
    if (r.theme?.metodo?.conta !== contaId) continue;
    if (r.theme?.igPublicado || r.theme?.publicado) continue; // nunca toca em publicados
    const dataAnt = r.theme?.agendadoEm ?? '';
    if (!dataAnt || dataAnt >= hojeStr) continue; // só os que já passaram
    const novaData = somaDias(dataAnt, delta * 7);
    const novoSlug = r.slug.replace(/\d{4}-\d{2}-\d{2}$/, novaData);
    if (novoSlug === r.slug) continue;
    if (existentes.has(novoSlug)) { saltados += 1; continue; } // não clobbera o que já lá está

    const theme = { ...(r.theme ?? {}), agendadoEm: novaData };
    const { error: eIns } = await supabase.from('carousel_collections').insert({ slug: novoSlug, title: r.title ?? '', brief: r.brief ?? '', dias: r.dias, theme });
    if (eIns) { saltados += 1; continue; }
    await supabase.from('carousel_collections').delete().eq('slug', r.slug);
    existentes.add(novoSlug);
    movidos += 1;
  }

  return NextResponse.json({ ok: true, movidos, saltados });
}
