import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarMetricoolCSVSeries, type SerieCsvDia } from '@/lib/estudio-export';
import { HORA_SERIE } from '@/lib/series/serie-design';

export const runtime = 'nodejs';

// GET /api/admin/series-diaria/csv?serie=&de=&ate=&plataforma=tiktok|instagram|ambas
// CSV do Metricool das séries diárias: só os dias JÁ renderizados (têm MP4).
// Por defeito TikTok (que ela não consegue agendar de outra forma); pode pedir
// Instagram (Reel) ou ambas. Datas/horas vêm do theme (agendadoEm/hora local).
type S0 = { frase?: string; videoUrl?: string | null };
type Dia = { palavra?: string; slides?: S0[]; legenda?: string; videoUrl?: string | null };
type Theme = { serie?: string; dia?: string; agendadoEm?: string; hora?: string };

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const serie = sp.get('serie');
  const de = (sp.get('de') || '').trim();
  const ate = (sp.get('ate') || '').trim();
  const p = sp.get('plataforma');
  const plataforma: 'tiktok' | 'instagram' | 'ambas' =
    p === 'instagram' ? 'instagram' : p === 'ambas' ? 'ambas' : 'tiktok';

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('carousel_collections').select('dias, theme').eq('theme->>formato', 'serie-diaria');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const dias: SerieCsvDia[] = (data ?? [])
    .map((c) => {
      const t = (c.theme ?? {}) as Theme;
      const d0 = (Array.isArray(c.dias) ? c.dias[0] : undefined) as Dia | undefined;
      const s0 = d0?.slides?.[0] ?? {};
      const frase = s0.frase ?? d0?.palavra ?? '';
      const videoUrl = s0.videoUrl ?? d0?.videoUrl ?? '';
      const date = t.agendadoEm ?? '';
      const horaPadrao = t.serie === 'vcsabia' ? HORA_SERIE.vcsabia : HORA_SERIE.hojeemmim;
      return {
        serie: t.serie ?? '',
        videoUrl: videoUrl || '',
        caption: (d0?.legenda || frase || '').trim(),
        titulo: frase,
        date,
        time: t.hora || horaPadrao,
      };
    })
    .filter((d) => d.videoUrl && d.date)
    .filter((d) => !serie || d.serie === serie)
    .filter((d) => (!de || d.date >= de) && (!ate || d.date <= ate))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const csv = gerarMetricoolCSVSeries(dias, plataforma);
  const nome = `metricool-series-${serie || 'todas'}-${plataforma}.csv`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
    },
  });
}
