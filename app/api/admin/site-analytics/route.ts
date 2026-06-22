import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// SQL para criar a tabela (corre 1x no Supabase → SQL Editor). Devolvido se faltar.
const SQL_TABELA = `create table if not exists site_views (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  path text,
  source text,
  referrer text,
  pais text
);
create index if not exists site_views_ts_idx on site_views (ts desc);`;

// GET /api/admin/site-analytics?dias=30 — agrega as visitas ao site.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const dias = Math.min(365, Math.max(1, Number(req.nextUrl.searchParams.get('dias')) || 30));
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from('site_views')
    .select('ts, path, source')
    .gte('ts', desde)
    .order('ts', { ascending: false })
    .limit(20000);

  if (error) {
    // tabela ainda não existe → diz como criar
    if (/relation|does not exist|schema cache|find the table/i.test(error.message)) {
      return NextResponse.json({ erro: 'sem-tabela', sql: SQL_TABELA });
    }
    return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as { ts: string; path: string | null; source: string | null }[];

  const ehInterno = (s: string | null) => !s || s === 'Interno' || s === 'Outro' || /vercel/i.test(s);
  const total = rows.length;

  const porDia = new Map<string, number>();
  const porFonte = new Map<string, number>();
  const porPagina = new Map<string, number>();
  for (const r of rows) {
    const dia = (r.ts || '').slice(0, 10);
    if (dia) porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
    // "de onde vêm" = só fontes EXTERNAS reais (sem Interno/Outro/vercel = ruído)
    if (!ehInterno(r.source)) { const f = r.source as string; porFonte.set(f, (porFonte.get(f) ?? 0) + 1); }
    const p = r.path || '/'; porPagina.set(p, (porPagina.get(p) ?? 0) + 1);
  }

  // série diária completa (com zeros) para o gráfico
  const serie: { dia: string; n: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    serie.push({ dia: d, n: porDia.get(d) ?? 0 });
  }
  const ordenar = (m: Map<string, number>) => [...m.entries()].map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n);

  const hojeStr = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    ok: true,
    dias,
    total,
    hoje: porDia.get(hojeStr) ?? 0,
    serie,
    fontes: ordenar(porFonte),
    paginas: ordenar(porPagina).slice(0, 12),
  });
}

// POST — apaga o lixo já gravado (visitas de teste dos previews .vercel.app).
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const { error, count } = await sb
    .from('site_views')
    .delete({ count: 'exact' })
    .or('source.ilike.%vercel%,referrer.ilike.%vercel%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, apagadas: count ?? 0 });
}
