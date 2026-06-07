import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getCatalogoProdutos, amostraEcossistema, ecossistemaPrompt } from '@/lib/carrossel/catalogo';
import { ofertasAnterioresPrompt } from '@/lib/carrossel/ofertas';
import { UNIVERSO_TO_MUNDO } from '@/lib/carrossel/overrides';
import { listarPoolImagens, imagensUsadas } from '@/lib/carrossel/pool-server';
import { getColecao, type ColecaoId } from '@/lib/colecoes';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, universo? } — gera UM infografico de padrao+limitacao e grava em
// carousel_collections (formato='infografico') para reaproveitar render/download.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; universo?: ColecaoId };
  const tema = body.tema?.trim();
  const universo = (body.universo ?? 'freeme-mae') as ColecaoId;
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  const mundo = UNIVERSO_TO_MUNDO[universo];
  const col = getColecao(universo);
  const catalogo = await getCatalogoProdutos();
  const ecossistema = `${ecossistemaPrompt(amostraEcossistema(catalogo, universo, 2))}\n\nOFERTAS ANTERIORES:\n${ofertasAnterioresPrompt()}`;

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Crias UM INFOGRAFICO que explica um PADRAO (psicologico/relacional/familiar) e a sua LIMITACAO, claro e concreto — qualquer pessoa entende a primeira leitura. Portugues europeu COM acentos. Sem jargao.

${ecossistema}

DEVOLVE APENAS JSON valido:
{
  "padrao": "nome curto do padrao (2-4 palavras)",
  "subtitulo": "1 linha que o descreve",
  "tipoDiagrama": "ciclo | espectro | herdado | camadas | travessia",
  "diagrama": { },
  "custoTi": "1 frase concreta: o que te custa A TI",
  "custoOutros": "1 frase concreta: o que custa AOS OUTROS (parceiro, filhos, familia)",
  "virada": "1 frase curta de abertura (uma pergunta)",
  "produtoRelacionado": "slug-ou-link-exacto-do-ecossistema"
}

ESCOLHE o tipoDiagrama que MELHOR explica este padrao e preenche "diagrama" na forma certa:
- "ciclo" (o padrao repete-se em loop) -> { "passos": ["3-4 passos curtos, <=5 palavras"] }
- "espectro" (vives entre dois extremos) -> { "poloA": "extremo 1", "poloB": "extremo 2", "equilibrio": "o ponto saudavel no meio" }
- "herdado" (o que vem de tras vs o que e teu) -> { "esquerda": { "titulo": "Herdado", "itens": ["...","..."] }, "direita": { "titulo": "Teu", "itens": ["...","..."] } }
- "camadas" (o que se ve por fora vs o que esta por baixo) -> { "camadas": [ { "label": "O que se ve", "texto": "..." }, { "label": "Por baixo", "texto": "..." } ] }
- "travessia" (um caminho linear, nao um loop) -> { "passos": ["3-4 etapas curtas"] }
Ex.: "dar e receber" -> espectro (poloA "dar demais", poloB "receber de menos", equilibrio "presenca que fica"). Usa nome/link EXACTOS do ecossistema.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 1500, system: SYSTEM, messages: [{ role: 'user', content: `Tema/padrao: "${tema}". Universo: ${col.nome}.` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { padrao?: string; subtitulo?: string; tipoDiagrama?: string; diagrama?: unknown; custoTi?: string; custoOutros?: string; virada?: string; produtoRelacionado?: string };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }

  // resolve URL do produto (slug -> /loja/slug, ou link directo)
  const ref = p.produtoRelacionado ?? '';
  const item = catalogo.find((i) => i.id === ref);
  const url = ref.startsWith('http') ? ref : item ? `viviannedossantos.com${item.url}` : ref ? `viviannedossantos.com/loja/${ref}` : 'viviannedossantos.com/loja';

  // fundo do pool (nao-usado primeiro)
  let imageUrl: string | undefined;
  try {
    const pool = await listarPoolImagens(mundo);
    const usadas = await imagensUsadas();
    imageUrl = [...pool.filter((u) => !usadas.has(u)), ...pool][0];
  } catch { /* sem pool */ }

  const slug = `infografico-${universo}-${Date.now()}`;
  const slide = {
    tipo: 'infografico',
    padrao: p.padrao ?? tema,
    subtitulo: p.subtitulo ?? '',
    tipoDiagrama: p.tipoDiagrama ?? 'ciclo',
    diagrama: p.diagrama ?? {},
    custoTi: p.custoTi ?? '',
    custoOutros: p.custoOutros ?? '',
    virada: p.virada ?? '',
    url,
    produtoRelacionado: ref,
    imageUrl,
  };
  const dias = [{ dia: 1, mundo, palavra: p.padrao ?? tema, slides: [slide] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.padrao ?? tema, brief: tema, dias, theme: { formato: 'infografico', mundo, universo } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
