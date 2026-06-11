import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getContas, mediaProxyUrl } from '@/lib/tiktok/config';
import { publicarVideo, esperarPublicacao, type Privacidade } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';
export const maxDuration = 300;

// GET /api/admin/tiktok/testar — publica UM vídeo de teste na 1ª conta ligada,
// para a Vivianne ver a integração a funcionar (e gravar o demo video da
// auditoria). Por defeito vai em RASCUNHO (inbox) — aparece nos rascunhos da
// app do TikTok, ela acaba à mão. Seguro e sem nada público.
//
// Parâmetros (todos opcionais):
//   ?modo=rascunho|direto   (default rascunho)
//   ?privacidade=SELF_ONLY  (só no modo direto; default SELF_ONLY)
//   ?slug=<slug>            (usar o vídeo desta coleção)
//   ?videoUrl=<url>         (usar este MP4 diretamente)
// Sem slug/videoUrl, procura a coleção mais recente que tenha um vídeo pronto.

type Dia = { videoUrl?: string; legenda?: string; hashtags?: string[] };
type Row = { slug: string; title: string; dias: Dia[] };

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

function legendaDe(d?: Dia, fallback = 'Teste veu.a.veu'): string {
  if (!d) return fallback;
  return [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n') || fallback;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const contas = await getContas();
  if (!contas.length) return NextResponse.json({ erro: 'sem-conta', detalhe: 'liga primeiro uma conta TikTok' }, { status: 409 });
  const conta = contas[0];

  const sp = req.nextUrl.searchParams;
  const modo = (sp.get('modo') === 'direto' ? 'direto' : 'rascunho') as 'rascunho' | 'direto';
  const privacidade = (sp.get('privacidade') as Privacidade) || 'SELF_ONLY';

  // ── achar o vídeo ──
  let videoUrl = sp.get('videoUrl') || '';
  let titulo = 'Teste veu.a.veu 🌿';
  const supabase = getSupabaseAdmin();

  if (!videoUrl) {
    const slug = sp.get('slug');
    if (slug) {
      const { data } = await supabase.from('carousel_collections').select('slug, title, dias').eq('slug', slug).single();
      const d = (data as Row | null)?.dias?.[0];
      if (d?.videoUrl) { videoUrl = d.videoUrl; titulo = legendaDe(d); }
    } else {
      const { data } = await supabase.from('carousel_collections').select('slug, title, dias').limit(100);
      for (const row of (data as Row[] | null) ?? []) {
        const d = row.dias?.[0];
        if (d?.videoUrl) { videoUrl = d.videoUrl; titulo = legendaDe(d); break; }
      }
    }
  }

  if (!videoUrl) return NextResponse.json({ erro: 'sem-video', detalhe: 'não encontrei nenhum MP4 pronto. Passa ?videoUrl= ou ?slug=' }, { status: 409 });

  // fura a cache do CDN do Supabase (um re-render fica no MESMO URL e o CDN podia
  // servir a versão ANTIGA ~1h — o TikTok apanharia o MP4 sem faststart).
  if (videoUrl.startsWith(SUPA)) {
    videoUrl += (videoUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();
  }
  // se o vídeo está no Supabase, serve-o pelo nosso domínio verificado
  const urlParaTikTok = videoUrl.startsWith(SUPA) ? mediaProxyUrl(videoUrl) : videoUrl;

  // ── publicar ──
  const r = await publicarVideo({ accessToken: conta.accessToken, videoUrl: urlParaTikTok, titulo, modo, privacidade });
  if (!r.ok || !r.publishId) return NextResponse.json({ erro: 'init', detalhe: r.erro, urlParaTikTok }, { status: 502 });

  const estado = await esperarPublicacao(conta.accessToken, r.publishId);
  return NextResponse.json({
    ok: estado.ok,
    modo,
    conta: conta.displayName ?? conta.openId.slice(0, 8),
    publishId: r.publishId,
    status: estado.status,
    failReason: estado.failReason,
    urlParaTikTok,
    erro: estado.erro,
    detalhe: estado.ok
      ? (modo === 'rascunho' ? 'Vai à app do TikTok → Caixa de entrada/Rascunhos para veres o vídeo.' : 'Publicado como privado (SELF_ONLY) no perfil.')
      : 'não concluiu — vê o erro/status',
  });
}
