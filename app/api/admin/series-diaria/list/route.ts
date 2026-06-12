import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET /api/admin/series-diaria/list?serie= — os dias gerados (formato serie-diaria),
// para a PRODUÇÃO: frase, motion (pool ou carregado), prompt MJ, áudio, estado.
type S0 = { frase?: string; motionUrl?: string | null; videoUrl?: string | null };
type Dia = { palavra?: string; slides?: S0[]; faixa?: { titulo?: string; url?: string }; videoUrl?: string | null };
type Theme = { serie?: string; dia?: string; paleta?: string; agendadoEm?: string; hora?: string; aprovado?: boolean; mjPrompt?: string; motionPath?: string; motionFonte?: string; audioFonte?: string };

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const serie = req.nextUrl.searchParams.get('serie');
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('carousel_collections').select('slug, dias, theme').eq('theme->>formato', 'serie-diaria');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  const dias = (data ?? []).map((c) => {
    const t = (c.theme ?? {}) as Theme;
    const d0 = (Array.isArray(c.dias) ? c.dias[0] : undefined) as Dia | undefined;
    const s0 = d0?.slides?.[0] ?? {};
    return {
      slug: c.slug as string,
      serie: t.serie ?? null, dia: t.dia ?? null, paleta: t.paleta ?? null,
      data: t.agendadoEm ?? null, hora: t.hora ?? null, aprovado: !!t.aprovado,
      frase: s0.frase ?? d0?.palavra ?? '',
      motionUrl: s0.motionUrl ?? null,
      motionFonte: t.motionFonte ?? (t.motionPath ? 'pool' : null),
      mjPrompt: t.mjPrompt ?? '',
      audioMood: d0?.faixa?.titulo ?? null,
      audioUrl: d0?.faixa?.url ?? null,
      audioFonte: t.audioFonte ?? (d0?.faixa?.url ? 'match' : null),
      videoUrl: s0.videoUrl ?? d0?.videoUrl ?? null,
    };
  }).filter((d) => !serie || d.serie === serie)
    .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''));
  return NextResponse.json({ ok: true, dias });
}
