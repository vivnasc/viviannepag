import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarMetricoolCSVPublicar, type PublicarCsvDia } from '@/lib/estudio-export';
import { contaDe, nomeConta, type ContaId } from '@/lib/instagram/contas';

export const runtime = 'nodejs';

// GET /api/admin/publicar/exportar-csv?conta=&de=&ate=&plataforma=tiktok|instagram|ambas
// Exporta os posts de UMA conta (nunca mistura) num intervalo de datas, como CSV
// do Metricool — para agendar em massa (sobretudo o TikTok, que não se publica
// sozinho daqui). Só posts com média pronta (vídeo ou imagens). Datas/horas LOCAIS.
type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string | null; imagens?: string[] };
type Theme = { marca?: string; universo?: string; curso?: string; serie?: string; formato?: string; subtipo?: string; agendadoEm?: string | null; hora?: string | null };
type Row = { slug: string; title: string; dias: Dia[]; theme: Theme };

// chave de formato para o filtro do export (igual à do frontend): séries pela
// série (vcsabia/hojeemmim), produto da loja = 'veus', resto pelo formato/subtipo.
function chaveFmt(theme: Theme, slug: string): string {
  if (theme?.formato === 'serie-diaria') return theme?.serie || 'serie';
  if (contaDe(theme, slug) === 'loja') return 'veus';
  return theme?.formato === 'reel' ? (theme?.subtipo || 'reel') : (theme?.formato || '');
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const conta = (sp.get('conta') || 'veuaveu') as ContaId;
  const de = (sp.get('de') || '').trim();
  const ate = (sp.get('ate') || '').trim();
  const formato = (sp.get('formato') || '').trim(); // '' ou 'tudo' = todos
  const p = sp.get('plataforma');
  const plataforma: 'tiktok' | 'instagram' | 'ambas' =
    p === 'instagram' ? 'instagram' : p === 'ambas' ? 'ambas' : 'tiktok';

  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('carousel_collections').select('slug, title, dias, theme');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const dias: PublicarCsvDia[] = ((data ?? []) as Row[])
    .filter((it) => contaDe(it.theme, it.slug) === conta)
    .filter((it) => !formato || formato === 'tudo' || chaveFmt(it.theme, it.slug) === formato)
    .map((it) => {
      const d0 = Array.isArray(it.dias) ? it.dias[0] : undefined;
      const date = it.theme?.agendadoEm ?? '';
      const imagens = (d0?.imagens && d0.imagens.length ? d0.imagens
        : (d0?.slides ?? []).map((s) => s.imageUrl).filter((u): u is string => !!u));
      const caption = [d0?.legenda?.trim(), (d0?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
      return {
        videoUrl: d0?.videoUrl ?? null,
        imagens,
        caption: caption || it.title,
        titulo: it.title,
        date,
        time: it.theme?.hora || '13:00',
      };
    })
    .filter((d) => (!!d.videoUrl || (d.imagens?.length ?? 0) > 0) && d.date)
    .filter((d) => (!de || d.date >= de) && (!ate || d.date <= ate))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const csv = gerarMetricoolCSVPublicar(dias, plataforma);
  const nome = `metricool-${nomeConta(conta).replace(/[^a-z0-9]+/gi, '-')}-${plataforma}.csv`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
    },
  });
}
