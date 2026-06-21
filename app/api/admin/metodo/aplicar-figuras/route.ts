import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PERSONAGENS } from '@/lib/metodo/personagens';

export const runtime = 'nodejs';

// Aplica as FIGURAS DEFINITIVAS escolhidas no baralho às cartas "Sou Aquela" JÁ
// geradas (sem gerar imagem nova = sem custo). Para cada carta da mãe não publicada,
// procura a figura escolhida da sua personagem e mete-a em todos os slides.
// (As cartas NOVAS já nascem com a figura; isto trata as ANTIGAS.)
type Row = { slug: string; dias?: Array<{ slides?: Array<{ imageUrl?: string | null; notaVisual?: string }>; videoUrl?: string | null }> | null; theme?: { igPublicado?: boolean; publicado?: boolean; metodo?: { tipo?: string; personagem?: string } } | null };

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const supabase = getSupabaseAdmin();

  const { data: br } = await supabase.from('carousel_collections').select('theme').eq('slug', 'metodo-baralho').maybeSingle();
  const figuras = ((br?.theme as { figuras?: Record<string, string> } | null)?.figuras) ?? {};
  if (!Object.keys(figuras).length) return NextResponse.json({ ok: true, aplicadas: 0, semFiguras: true });

  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-mae-carta-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  let aplicadas = 0;
  for (const r of (data ?? []) as Row[]) {
    if (r.theme?.igPublicado || r.theme?.publicado) continue; // nunca toca em publicados
    if (r.theme?.metodo?.tipo !== 'carta') continue;
    const pid = PERSONAGENS.find((p) => p.nome === r.theme?.metodo?.personagem)?.id;
    const figura = pid ? figuras[pid] : undefined;
    if (!figura) continue;
    const slides = r.dias?.[0]?.slides ?? [];
    if (!slides.length) continue;
    if (slides.every((s) => s.imageUrl === figura)) continue; // já está
    for (const s of slides) { s.imageUrl = figura; s.notaVisual = 'figura definitiva do baralho'; }
    if (r.dias?.[0]) r.dias[0].videoUrl = null; // invalida o MP4 antigo (re-render depois)
    const { error: e2 } = await supabase.from('carousel_collections').update({ dias: r.dias }).eq('slug', r.slug);
    if (!e2) aplicadas += 1;
  }
  return NextResponse.json({ ok: true, aplicadas });
}
