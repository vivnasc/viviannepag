import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarSom, somPromptDoDia } from '@/lib/series/som';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { serie, de?, ate?, force? } — GERAR SONS em BULK (par do "gerar som"
// por dia): para cada dia da série no intervalo, gera o ambiente sonoro na
// ElevenLabs a partir da cena do motion (pool: descrição do motion; novo:
// somPrompt par do mjPrompt). Por defeito só os que ainda não têm som GERADO
// (os matches por keyword antigos contam como "por gerar"); force=true refaz
// todos. O som manual (audioFonte='manual') NUNCA é tocado.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { serie?: string; de?: string; ate?: string; force?: boolean };
  const serie = body.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
  const de = (body.de || '').trim(), ate = (body.ate || '').trim();

  const sb = getSupabaseAdmin();
  const { data } = await sb.from('carousel_collections').select('slug, dias, theme').eq('theme->>formato', 'serie-diaria').eq('theme->>serie', serie);
  const alvos = (data ?? []).filter((c) => {
    const t = (c.theme ?? {}) as { agendadoEm?: string; audioFonte?: string };
    const d = t.agendadoEm ?? '';
    if (!d || (de && d < de) || (ate && d > ate)) return false;
    if (t.audioFonte === 'manual') return false; // escolha dela: intocável
    if (!body.force && t.audioFonte === 'gerado') return false; // já gerado
    return true;
  }).sort((a, b) => (((a.theme as { agendadoEm?: string })?.agendadoEm ?? '')).localeCompare(((b.theme as { agendadoEm?: string })?.agendadoEm ?? '')));

  if (!alvos.length) return NextResponse.json({ ok: true, gerados: 0, nota: 'Nada por gerar no intervalo (ou já está tudo gerado — usa force).' });

  let gerados = 0; const erros: string[] = [];
  for (const c of alvos) {
    const t = (c.theme ?? {}) as Record<string, unknown> & { somPrompt?: string; mjPrompt?: string; motionNome?: string | null; motionFonte?: string | null; agendadoEm?: string };
    const prompt = somPromptDoDia(t);
    if (!prompt) { erros.push(`${t.agendadoEm}: sem prompt de som`); continue; }
    try {
      const url = await gerarSom(prompt, c.slug as string);
      const dias = (Array.isArray(c.dias) ? c.dias : []) as Array<{ faixa?: { titulo?: string; url?: string }; videoUrl?: string | null; slides?: Array<{ videoUrl?: string | null }> }>;
      if (!dias[0]) continue;
      dias[0].faixa = { titulo: 'som da cena', url };
      dias[0].videoUrl = null;
      if (dias[0].slides?.[0]) dias[0].slides[0].videoUrl = null;
      const { error } = await sb.from('carousel_collections').update({ dias, theme: { ...t, audioFonte: 'gerado' } }).eq('slug', c.slug);
      if (error) erros.push(`${t.agendadoEm}: ${error.message}`); else gerados++;
    } catch (e) { erros.push(`${t.agendadoEm}: ${e instanceof Error ? e.message : String(e)}`); }
  }

  return NextResponse.json({ ok: true, alvos: alvos.length, gerados, erros: erros.slice(0, 5) });
}
