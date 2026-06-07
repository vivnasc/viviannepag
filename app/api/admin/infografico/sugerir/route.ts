import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { curso } — sugere CONCEITOS didaticos profundos do curso, excluindo os
// que ja estao na biblioteca. Sem produtos, so conhecimento.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const { curso: cursoId } = (await req.json().catch(() => ({}))) as { curso?: string };
  const curso = getCurso(cursoId ?? 'transpessoal');

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('title, theme').eq('theme->>formato', 'infografico');
  const usados = (data ?? []).filter((c) => (c.theme as { curso?: string })?.curso === curso.id).map((c) => c.title);

  const SYSTEM = `Es a Vivianne dos Santos (pos-graduada). Sugeres CONCEITOS DIDATICOS para infograficos do curso "${curso.nome}" (${curso.descricao}). Profundos, especificos, fieis a materia — para ensinar, nao vender. Em portugues europeu com acentos.
JA USADOS (NAO repitas, nem variacoes obvias): ${usados.join('; ') || '(nenhum)'}.
Devolve APENAS JSON: { "conceitos": ["nome curto 2-4 palavras", ...] } com 6 conceitos frescos e distintos.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 500, system: SYSTEM, messages: [{ role: 'user', content: `Sugere 6 conceitos profundos de "${curso.nome}", sem repetir os usados.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let padroes: string[] = [];
  try { padroes = (JSON.parse(texto.slice(ini, fim + 1)).conceitos ?? []).map(String); } catch { /* vazio */ }
  return NextResponse.json({ padroes });
}
