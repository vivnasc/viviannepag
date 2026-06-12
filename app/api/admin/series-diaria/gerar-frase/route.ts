import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarFraseSerie } from '@/lib/series/gerarFrase';
import type { Serie } from '@/lib/series/voz';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { serie, dia?, evitar? } — gera UMA frase nova (curta, leitura rápida)
// + legenda longa + prompt MJ. O Claude escolhe (nunca repete), ciente do dia
// da semana + estação. A lógica vive em lib/series/gerarFrase.ts (partilhada
// com o regenerar-por-dia); a VOZ/BREVIDADE em lib/series/voz.ts.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { serie?: Serie; dia?: string; evitar?: string[] };
  const serie: Serie = body.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
  const dia = (body.dia || '').trim();
  const evitar = new Set<string>(Array.isArray(body.evitar) ? body.evitar.map((s) => String(s).trim()).filter(Boolean) : []);

  // dedup: frases já usadas nas coleções desta série
  const supabase = getSupabaseAdmin();
  const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').eq('theme->>formato', 'serie-diaria');
  for (const c of existentes ?? []) {
    const t = (c.theme as { serie?: string } | null) ?? {};
    if (t.serie && t.serie !== serie) continue;
    for (const d of (Array.isArray(c.dias) ? c.dias : []) as Array<{ palavra?: unknown }>) {
      if (typeof d?.palavra === 'string' && d.palavra.trim()) evitar.add(d.palavra.trim());
    }
  }

  try {
    const r = await gerarFraseSerie({ serie, dia, evitar: Array.from(evitar), apiKey });
    return NextResponse.json({ ok: true, ...r, dia });
  } catch (e) {
    return NextResponse.json({ erro: 'claude', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
