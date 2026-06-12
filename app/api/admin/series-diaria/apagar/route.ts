import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST — APAGAR dias das séries (individual E em bloco, como tudo aqui):
//   { slug }                  → apaga UM dia
//   { serie, de?, ate? }      → apaga os dias da série no intervalo (vazio = todos)
// Segurança: só toca em coleções formato='serie-diaria' (nunca noutros conteúdos).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; serie?: string; de?: string; ate?: string };
  const sb = getSupabaseAdmin();

  if (body.slug) {
    const { data: row } = await sb.from('carousel_collections').select('theme').eq('slug', body.slug).single();
    if (!row || (row.theme as { formato?: string } | null)?.formato !== 'serie-diaria') {
      return NextResponse.json({ erro: 'nao-e-serie-diaria' }, { status: 400 });
    }
    const { error } = await sb.from('carousel_collections').delete().eq('slug', body.slug);
    if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, apagados: 1 });
  }

  const serie = body.serie === 'vcsabia' ? 'vcsabia' : body.serie === 'hojeemmim' ? 'hojeemmim' : null;
  if (!serie) return NextResponse.json({ erro: 'falta slug ou serie' }, { status: 400 });
  const { data, error: e1 } = await sb.from('carousel_collections').select('slug, theme').eq('theme->>formato', 'serie-diaria').eq('theme->>serie', serie);
  if (e1) return NextResponse.json({ erro: 'db', detalhe: e1.message }, { status: 500 });
  const de = (body.de || '').trim(), ate = (body.ate || '').trim();
  const alvos = (data ?? []).filter((c) => {
    const d = ((c.theme as { agendadoEm?: string } | null)?.agendadoEm ?? '');
    return d && (!de || d >= de) && (!ate || d <= ate);
  }).map((c) => c.slug as string);
  if (!alvos.length) return NextResponse.json({ ok: true, apagados: 0 });
  const { error } = await sb.from('carousel_collections').delete().in('slug', alvos);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, apagados: alvos.length });
}
