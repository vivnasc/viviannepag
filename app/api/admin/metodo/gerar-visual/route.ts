import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, type ContaId } from '@/lib/metodo/contas';
import { gerarFundoIA } from '@/lib/metodo/ia';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 300;

// FORMATO VISUAL (ex.: @vir.soltar = regressar a ti): UMA cena dramática de luz +
// UMA linha curta e evocativa (pouco texto, a luz é a estrela). Atmosfera imersiva,
// calma, de regresso. Diferente da manhã (frase-dor) e da tarde (motor de beats).
// 1 slide, subtipo 'visual'. Depois: animar (luz a fluir) -> renderizar.

async function fraseVisual(conta: typeof CONTAS[ContaId], apiKey: string, evitar: string[]): Promise<string> {
  const sys = `Escreves UMA linha curta para um reel VISUAL e contemplativo (Método VS, @${conta.handle}). A conta é sobre: ${conta.essencia} — ${conta.depois}. Sensação: ${conta.atmosfera.sensacao}.
A linha é o ÚNICO texto do reel (a luz é a estrela), por isso tem de ser CURTA e ressoar sozinha: máximo 8 palavras, português europeu, fala simples e real (NÃO poesia, NÃO coach, NÃO jargão; nada de "alma", "universo", "véu"). Um convite calmo ao regresso/ao pousar, que alguém sente no corpo. SEM travessões, SEM aspas, SEM hashtags.
${evitar.length ? `NÃO repitas estas: ${evitar.slice(-20).map((e) => `"${e}"`).join('; ')}.` : ''}
Devolve SÓ a linha.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 80, system: sys, messages: [{ role: 'user', content: `Nova linha visual para @${conta.handle}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  return limparTravessoes(t);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const token = process.env.REPLICATE_API_TOKEN;
  if (!apiKey || !token) return NextResponse.json({ erro: 'falta env (ANTHROPIC/REPLICATE)' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  const conta = CONTAS[contaId];
  if (!conta) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  // anti-repetição: linhas visuais já usadas nesta conta.
  const evitar: string[] = [];
  try {
    const { data } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-visual-%');
    for (const r of (data ?? []) as { theme?: { metodo?: { conta?: string } }; dias?: Array<{ slides?: Array<{ texto?: string }> }> }[]) {
      if (r.theme?.metodo?.conta !== contaId) continue;
      const t = r.dias?.[0]?.slides?.[0]?.texto; if (t) evitar.push(t);
    }
  } catch { /* sem memória */ }

  let linha: string;
  try { linha = await fraseVisual(conta, apiKey, evitar); }
  catch (e) { return NextResponse.json({ erro: 'frase', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 }); }

  // cena dramática de luz (a estrela), na cor da conta.
  let bgPrompt = '';
  let bgUrl: string | null = null;
  try {
    bgPrompt = await gerarFundoIA(conta, [], apiKey, linha, 'dramatico');
    for (let t = 0; t < 4 && !bgUrl; t++) {
      try { const u = await gerarImagemFlux(bgPrompt, token, { raw: true }); try { bgUrl = await guardarImagem(u, `metodo/visual-${contaId}/fundo-${Date.now()}.jpg`); } catch { bgUrl = u; } }
      catch (e) { await new Promise((r) => setTimeout(r, /429|throttl/i.test(String(e)) ? 12000 : 1500 * (t + 1))); }
    }
  } catch { /* sem imagem; gera depois */ }

  const hoje = new Date();
  const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const slug = `metodo-visual-${contaId}-${Date.now().toString(36)}`;
  const slides = [{ tipo: 'metodo' as const, texto: linha, destaque: [] as string[], notaVisual: bgPrompt, imageUrl: bgUrl, estilo: 'dramatico', capa: true, conceito: '', contaId }];
  const dias = [{ dia: 1, mundo: 'autora', palavra: linha.slice(0, 48), slides, legenda: `${linha}\n\n@${conta.handle}`, hashtags: [] }];
  const row = {
    slug, title: linha.slice(0, 48), brief: linha, dias,
    theme: { formato: 'reel', subtipo: 'visual', video: true, mundo: 'autora', marca: conta.marca, agendadoEm: data, hora: '19:00', metodo: { conta: contaId, tipo: 'visual' } },
  };
  const { error } = await supabase.from('carousel_collections').upsert([row], { onConflict: 'slug' });
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug, linha, temImagem: !!bgUrl });
}
