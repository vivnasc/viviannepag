import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { REGRA_ACENTOS } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — sugere TEMAS de mini-conto "Cá em Casa" (limites no dia a dia),
// excluindo os ja usados. So conhecimento, sem produtos.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('title, theme').eq('theme->>formato', 'banda');
  const usados = (data ?? []).map((c) => c.title);

  const SYSTEM = `Es a Vivianne dos Santos (constelacao familiar, transpessoal). Sugeres TEMAS para mini-contos "Cá em Casa" — banda desenhada didatica sobre LIMITES no dia a dia, com uma familia (avó, mãe, filha adulta, par, criança). Cenas reais e reconheciveis (jantar, telefonema da mae, pedido no trabalho, ajuda recusada...). Para ensinar, nao vender. Portugues europeu com acentos.
JA USADOS (NAO repitas): ${usados.join('; ') || '(nenhum)'}.
Devolve APENAS JSON: { "temas": ["tema curto e concreto", ...] } com 6 temas frescos e distintos.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 600, system: `${SYSTEM}\n\n${REGRA_ACENTOS}`, messages: [{ role: 'user', content: 'Sugere 6 temas de mini-conto "Cá em Casa" sobre limites, sem repetir os usados.' }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let temas: string[] = [];
  try { temas = (JSON.parse(texto.slice(ini, fim + 1)).temas ?? []).map(String); } catch { /* vazio */ }
  return NextResponse.json({ temas });
}
