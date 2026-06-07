import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getColecao, type ColecaoId } from '@/lib/colecoes';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { universo } — sugere padroes PROFUNDOS e FRESCOS (nao basicos), exclui
// os que ja estao na biblioteca. Inclui dinamicas sistemicas (substituicao de
// papeis, parentificacao, lealdades invisiveis...).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const { universo } = (await req.json().catch(() => ({}))) as { universo?: ColecaoId };
  const u = (universo ?? 'freeme-mae') as ColecaoId;
  const col = getColecao(u);

  // ja usados na biblioteca (para nao repetir)
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('title, theme').eq('theme->>formato', 'infografico');
  const usados = (data ?? []).filter((c) => (c.theme as { universo?: string })?.universo === u).map((c) => c.title);

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Sugeres PADROES para infograficos — profundos, especificos e NAO obvios. Vai alem do basico: usa dinamicas sistemicas quando encaixarem (substituicao de papeis, parentificacao "ser mae da tua mae", lealdades invisiveis, identificacao com um excluido, carregar o destino de outro, ordens do amor, exclusao sistemica).
Universo: "${col.nome}" — ${col.pitch}.
JA USADOS (NAO repitas, nem variacoes obvias): ${usados.join('; ') || '(nenhum)'}.
Devolve APENAS JSON: { "padroes": ["nome curto 2-4 palavras", ...] } com 6 padroes frescos e distintos, em portugues europeu com acentos.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 500, system: SYSTEM, messages: [{ role: 'user', content: `Sugere 6 padroes profundos para ${col.nome}, sem repetir os usados.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let padroes: string[] = [];
  try { padroes = (JSON.parse(texto.slice(ini, fim + 1)).padroes ?? []).map(String); } catch { /* vazio */ }
  return NextResponse.json({ padroes });
}
