import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCurso } from '@/lib/infografico/cursos';
import { getFormato } from '@/lib/reels/formatos';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { curso, formato } — sugere TEMAS de reel para um formato+curso,
// excluindo os ja usados. So conhecimento, sem produtos.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const { curso: cursoId, formato: formatoId } = (await req.json().catch(() => ({}))) as { curso?: string; formato?: string };
  const curso = getCurso(cursoId ?? 'transpessoal');
  const formato = getFormato(formatoId ?? 'sinais');

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('carousel_collections').select('title, theme').eq('theme->>formato', 'reel');
  const usados = (data ?? []).filter((c) => { const t = c.theme as { curso?: string; subtipo?: string }; return t?.curso === curso.id && t?.subtipo === formato.id; }).map((c) => c.title);

  const SYSTEM = `Es a Vivianne dos Santos (pos-graduada). Sugeres TEMAS para reels do formato "${formato.nome}" (${formato.descricao}) no curso "${curso.nome}" (${curso.descricao}). Especificos, com gancho, fieis a materia — para ensinar e atrair, nao vender. Portugues europeu com acentos.
JA USADOS (NAO repitas): ${usados.join('; ') || '(nenhum)'}.
Devolve APENAS JSON: { "temas": ["tema curto e cativante", ...] } com 6 temas frescos e distintos, prontos a virar reel deste formato.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 600, system: SYSTEM, messages: [{ role: 'user', content: `Sugere 6 temas para reels "${formato.nome}" de "${curso.nome}", sem repetir os usados.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let temas: string[] = [];
  try { temas = (JSON.parse(texto.slice(ini, fim + 1)).temas ?? []).map(String); } catch { /* vazio */ }
  return NextResponse.json({ temas });
}
