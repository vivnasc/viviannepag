import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { demonstracaoDaSemana } from '@/lib/veu/demonstracoes';
import { gerarVideoDemonstracao } from '@/lib/video/runway';

export const runtime = 'nodejs';
export const maxDuration = 300;

const BUCKET = 'viviannepag-assets';

// veu.a.veu · DEMONSTRAÇÃO física — gera o VÍDEO (Runway Gen-4.5 via Replicate),
// persiste o MP4 no storage e guarda a linha (demo-veu-{semana}). O texto sobrepõe-se
// depois (fase 2). GET = lista o que já existe.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('slug, theme').like('slug', 'demo-veu-%');
  const feitos: Record<number, string> = {};
  for (const r of (data ?? []) as { slug: string; theme?: { demonstracao?: { clipUrl?: string }; semana?: number } }[]) {
    const sem = r.theme?.semana ?? Number(r.slug.replace('demo-veu-', ''));
    const url = r.theme?.demonstracao?.clipUrl;
    if (sem && url) feitos[sem] = url;
  }
  return NextResponse.json({ ok: true, feitos });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { semana?: number; duracao?: 5 | 10 };
  const demo = demonstracaoDaSemana(Number(body.semana));
  if (!demo) return NextResponse.json({ erro: 'sem-demonstracao', detalhe: `não há demonstração para a semana ${body.semana}` }, { status: 400 });

  // 1) gerar o vídeo no Replicate (Runway Gen-4.5)
  let replicateUrl: string;
  try {
    replicateUrl = await gerarVideoDemonstracao(demo.prompt, token, body.duracao ?? 10);
  } catch (e) {
    return NextResponse.json({ erro: 'runway-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  // 2) persistir o MP4 (o URL do Replicate expira)
  const supabase = getSupabaseAdmin();
  let clipUrl = replicateUrl;
  try {
    const buf = Buffer.from(await (await fetch(replicateUrl)).arrayBuffer());
    const path = `veu-demonstracoes/semana-${demo.semana}-${Date.now()}.mp4`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: 'video/mp4', upsert: true });
    if (!upErr) clipUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch { /* fica o URL temporário do Replicate */ }

  // 3) guardar a linha (para a página listar e, na fase 2, compor o texto por cima)
  const row = {
    slug: `demo-veu-${demo.semana}`,
    title: `Demonstração · ${demo.tema}`,
    brief: demo.objeto,
    dias: [{ dia: 1, mundo: 'veu', slides: demo.beats.map((t, i) => ({ texto: t, capa: i === 0 })), legenda: `${demo.legenda}${demo.envio ? `\n\n${demo.envio}` : ''}` }],
    theme: { formato: 'demonstracao', marca: 'veu', semana: demo.semana, demonstracao: { clipUrl, objeto: demo.objeto, tema: demo.tema, beats: demo.beats, envio: demo.envio, legenda: demo.legenda } },
  };
  const { error } = await supabase.from('carousel_collections').upsert(row, { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, semana: demo.semana, clipUrl });
}
