import { NextResponse } from 'next/server';
import { CALENDARIO_30_DIAS } from '@/lib/estudio-conteudo';
import { ehReel, linhasFromScript } from '@/lib/estudio-reel';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

// GET ?jobId=...&dias=2,5 — manifest do job de render-reels (lido pelo Action).
// Por dia: { dia, mundo, titulo, linhas[{ idx, intent, texto, ttsTexto }], imageUrl }
// imageUrl = 1a foto MJ deste mundo+dia; fallback para qualquer dia do mesmo mundo.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ erro: 'jobId obrigatorio' }, { status: 400 });

  const diasFiltro = (url.searchParams.get('dias') ?? '')
    .split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

  const supabase = getSupabaseAdmin();

  const cacheDia = new Map<string, string | undefined>();
  const cacheMundo = new Map<string, string | undefined>();

  async function primeiraImagemDia(mundo: string, dia: number): Promise<string | undefined> {
    const k = `${mundo}-${dia}`;
    if (cacheDia.has(k)) return cacheDia.get(k);
    let chosen: string | undefined;
    try {
      const prefix = `estudio/${mundo}/dia-${dia}`;
      const { data } = await supabase.storage.from('viviannepag-assets').list(prefix, { limit: 50 });
      const jpgs = (data ?? []).filter(f => f.name.endsWith('.jpg')).sort((a, b) => b.name.localeCompare(a.name));
      if (jpgs[0]) {
        const p = `${prefix}/${jpgs[0].name}`;
        chosen = supabase.storage.from('viviannepag-assets').getPublicUrl(p).data.publicUrl;
      }
    } catch {}
    cacheDia.set(k, chosen);
    return chosen;
  }

  async function fallbackImagemMundo(mundo: string): Promise<string | undefined> {
    if (cacheMundo.has(mundo)) return cacheMundo.get(mundo);
    let chosen: string | undefined;
    for (const c of CALENDARIO_30_DIAS) {
      if (c.mundo !== mundo) continue;
      const img = await primeiraImagemDia(mundo, c.dia);
      if (img) { chosen = img; break; }
    }
    cacheMundo.set(mundo, chosen);
    return chosen;
  }

  const tarefas: Array<{
    dia: number;
    mundo: string;
    titulo: string;
    linhas: ReturnType<typeof linhasFromScript>;
    imageUrl?: string;
    musica?: string;
  }> = [];

  for (const c of CALENDARIO_30_DIAS) {
    if (!ehReel(c) || !c.reelScript) continue;
    if (diasFiltro.length > 0 && !diasFiltro.includes(c.dia)) continue;

    const linhas = linhasFromScript(c.reelScript);
    let imageUrl = await primeiraImagemDia(c.mundo, c.dia);
    if (!imageUrl) imageUrl = await fallbackImagemMundo(c.mundo);

    tarefas.push({
      dia: c.dia,
      mundo: c.mundo,
      titulo: c.titulo,
      linhas,
      imageUrl,
      musica: c.reelScript.musica,
    });
  }

  return NextResponse.json({
    jobId,
    geradoEm: new Date().toISOString(),
    tarefas,
    total: tarefas.length,
  });
}
