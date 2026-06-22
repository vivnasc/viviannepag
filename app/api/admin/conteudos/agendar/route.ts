import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// POST { slug, agendadoEm?, publicado?, aprovado?, hora? } — guarda o estado de
// agendamento/aprovação no theme. aprovado=true é a TRAVA: só posts aprovados é
// que o cron publica sozinho (gerar ≠ publicar). hora = 'HH:MM' override opcional.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; agendadoEm?: string | null; publicado?: boolean; aprovado?: boolean; hora?: string | null; igStatus?: string | null };
  if (!body.slug) return NextResponse.json({ erro: 'falta slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error: e1 } = await supabase.from('carousel_collections').select('theme').eq('slug', body.slug).single();
  if (e1) return NextResponse.json({ erro: 'db', detalhe: e1.message }, { status: 500 });

  const theme = { ...((row?.theme as Record<string, unknown>) ?? {}) };
  if ('agendadoEm' in body) theme.agendadoEm = body.agendadoEm || null;
  if ('publicado' in body) theme.publicado = !!body.publicado;
  if ('aprovado' in body) theme.aprovado = !!body.aprovado;
  if ('hora' in body) theme.hora = body.hora || null;
  if ('igStatus' in body) theme.igStatus = body.igStatus || null;
  // SELF-HEAL: re-agendar/aprovar um post que FALHOU (igStatus 'erro…') limpa o erro
  // — senão ficava preso em "erro" e não havia como o pôr de novo na fila. Uma nova
  // marcação/aprovação = uma nova tentativa. (Não toca em quem já publicou.)
  const reagenda = (('agendadoEm' in body) && body.agendadoEm) || (('aprovado' in body) && body.aprovado) || (('hora' in body) && body.hora);
  if (reagenda && typeof theme.igStatus === 'string' && theme.igStatus.startsWith('erro') && !theme.igPublicado) {
    theme.igStatus = null;
  }

  const { error } = await supabase.from('carousel_collections').update({ theme }).eq('slug', body.slug);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, theme });
}
