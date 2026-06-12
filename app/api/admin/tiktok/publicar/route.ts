import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getContas } from '@/lib/tiktok/config';
import { publicarVideo, esperarPublicacao, type Privacidade } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — publicação DIRETA (compliant) no perfil da conta escolhida.
// Body: { openId, slug?|videoUrl?, titulo, privacidade, disableComment, disableDuet, disableStitch }
// O vídeo vai pelo URL DIRETO do Supabase (domínio já verificado no portal).

type Dia = { videoUrl?: string; legenda?: string; hashtags?: string[] };
type Row = { dias: Dia[] };
const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    openId?: string; slug?: string; videoUrl?: string; titulo?: string;
    privacidade?: Privacidade; disableComment?: boolean; disableDuet?: boolean; disableStitch?: boolean;
  };

  const contas = await getContas();
  const conta = body.openId ? contas.find((c) => c.openId === body.openId) : contas[0];
  if (!conta) return NextResponse.json({ erro: 'sem-conta' }, { status: 409 });
  if (!body.privacidade) return NextResponse.json({ erro: 'privacidade', detalhe: 'escolhe a privacidade' }, { status: 400 });

  // resolve o vídeo
  let videoUrl = body.videoUrl || '';
  let titulo = body.titulo ?? '';
  if (!videoUrl && body.slug) {
    const sb = getSupabaseAdmin();
    const { data } = await sb.from('carousel_collections').select('dias').eq('slug', body.slug).single();
    const d = (data as Row | null)?.dias?.[0];
    if (d?.videoUrl) {
      videoUrl = d.videoUrl;
      if (!titulo) titulo = [d.legenda?.trim(), (d.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
    }
  }
  if (!videoUrl) return NextResponse.json({ erro: 'sem-video' }, { status: 409 });
  if (videoUrl.startsWith(SUPA)) videoUrl += (videoUrl.includes('?') ? '&' : '?') + 'v=' + Date.now();

  const r = await publicarVideo({
    accessToken: conta.accessToken,
    videoUrl,
    titulo: titulo || 'veu.a.veu',
    modo: 'direto',
    privacidade: body.privacidade,
    disableComment: body.disableComment,
    disableDuet: body.disableDuet,
    disableStitch: body.disableStitch,
  });
  if (!r.ok || !r.publishId) return NextResponse.json({ erro: 'init', detalhe: r.erro }, { status: 502 });

  const estado = await esperarPublicacao(conta.accessToken, r.publishId, 20000);
  const aindaProcessa = !estado.ok && !estado.failReason && estado.erro?.includes('a tempo');
  return NextResponse.json({
    ok: estado.ok,
    publishId: r.publishId,
    status: estado.status,
    failReason: estado.failReason,
    erro: aindaProcessa ? undefined : estado.erro,
    detalhe: estado.ok ? 'Publicado no perfil.' : aindaProcessa ? 'Ainda a processar no TikTok (vê o perfil daqui a pouco).' : 'não concluiu',
  });
}
