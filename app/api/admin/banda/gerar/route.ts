import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem, ESTILO_DEFAULT, representacaoAleatoria } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { tema, estilo? } — gera UM "Cá em Casa" (formato alto-conversor):
//   capa = UMA ILUSTRAÇÃO forte (Flux, estilo = assinatura visual da série) com
//   a frase-gancho por cima, + slides de ENSINO em texto (sem pessoas) + lição.
// Uma só imagem => sem problema de consistência. Grava em carousel_collections.
const MUNDO = 'synchim'; // paleta relacional (constelação familiar)

const SYSTEM = `És a Vivianne dos Santos (psicologia transpessoal, constelação familiar). Crias "Cá em Casa": um carrossel DIDÁTICO sobre LIMITES no dia a dia. Ensinar, nunca vender.

LÍNGUA (REGRA DURA, não falhar): português europeu, com a ACENTUAÇÃO TODA correta (á, à, â, ã, é, ê, í, ó, ô, õ, ú, ç). NUNCA escrevas uma palavra sem o acento que ela leva (ex.: "é", "há", "ninguém", "vê", "rápido", "também", "atenção", "mãe", "coração"). Segue o ACORDO ORTOGRÁFICO de 1990 (português europeu atual): escreve "ato" (não "acto"), "ação" (não "acção"), "fator", "direção", "afeto", "ótimo". Antes de devolver, relê e confirma que cada palavra tem os acentos certos.

OBJETIVO: parar o scroll, converter seguidores, crescer, SEM sensacionalismo (nada de "3 sinais de...", "o erro que destrói a tua vida"). A força vem do RECONHECIMENTO, não do choque barato.

OS 4 GESTOS (desenha cada post para os provocar, com dignidade):
- PARAR O SCROLL (1 seg): a CAPA é uma CENA concreta do dia a dia onde a pessoa pensa "isto sou eu" (corpo, casa, gesto), com uma micro-tensão. NUNCA um aforismo abstrato na capa (isso fica para a lição).
- GUARDAR: o ensino dá NOME ao padrão (algo que apetece reler) e a lição é uma frase funda que a pessoa quer guardar.
- PARTILHAR: dá PALAVRAS ao que a pessoa nunca conseguiu dizer e fá-la pensar em alguém concreto ("a minha mãe", "a minha irmã"). O que diz o indizível é partilhado.
- GOSTAR: a pessoa tem de se sentir VISTA, com ternura, nunca julgada nem com o dedo apontado.

ENQUADRAMENTO (CRÍTICO, não falhar): NUNCA dês a entender que se deve desvalorizar a família, cortar laços, afastar-se de quem se ama ou "pôr-se em primeiro". O limite com amor HONRA o vínculo: é reciprocidade, presença e inteireza (estar inteiro com o outro, não a meio). O gancho e a lição têm de soar a AMOR e PERTENÇA, nunca a ressentimento ou a egoísmo. Mostrar que cuidar de si faz parte de amar bem a família.

FORMATO (carrossel):
- CAPA (a PORTA): uma frase-gancho curta (PT, máx. ~10 palavras) que é uma CENA concreta e reconhecível do dia a dia onde a pessoa pensa "isto sou eu" (ex.: "Ela liga, e tu já não sabes como desligar."), com micro-tensão. NUNCA um aforismo abstrato aqui. Mais um "imagePrompt" EM INGLÊS (~40-60 palavras) para gerar UMA ILUSTRAÇÃO íntima e quente que CONVERSA com o gancho (cena de casa; mãos, gesto, costas voltadas ou silhueta; rosto nunca colado à câmara; SEM texto na imagem). NÃO descrevas o estilo de desenho (isso é fixo à parte); descreve só a cena/momento/emoção.
- ENSINO: 3 a 4 frases curtas (PT), cada uma um slide, que explicam o padrão em palavras simples e humanas. Reconhecível.
- LIÇÃO (a SALA): a virada/ensinamento final, em tom de amor e pertença. É a frase funda que apetece guardar; aterra AQUI (no fim), nunca na capa.
- NUNCA uses travessões (— nem –). Usa vírgulas, pontos ou parênteses.

DEVOLVE APENAS JSON válido (os valores de texto em português com TODOS os acentos):
{
  "titulo": "título curto (2-5 palavras)",
  "capa": { "gancho": "...", "imagePrompt": "..." },
  "ensino": ["frase 1", "frase 2", "frase 3"],
  "licao": "frase de fecho que ensina/abre reflexão (amor e pertença)",
  "cta": "o gesto a pedir no fecho, CURTO (máx ~5 palavras), começado por um glifo. Este formato dá PALAVRAS ao indizível, por isso o gesto natural é PARTILHAR: usa quase sempre enviar/partilhar com uma pessoa concreta (ex.: '↗ envia a quem precisa', '↗ partilha com quem te veio à cabeça', '↗ manda a quem carrega isto'). De vez em quando, guardar ('↓ guarda para reler'). NUNCA sensacionalista ('marca 3 amigos'). Português europeu com acentos.",
  "legenda": "legenda Instagram em PARÁGRAFOS CURTOS separados por LINHA EM BRANCO (usa \\n\\n entre cada parágrafo — NUNCA um bloco corrido): gancho na 1.ª linha; 2 a 3 parágrafos curtos que explicam o padrão em palavras simples, separados por \\n\\n; fecho à parte: convida a GUARDAR ("guarda para o dia em que precisares") e a PARTILHAR com uma pessoa concreta ("envia a quem também carrega isto"), com dignidade e SEM sensacionalismo (nunca "marca 3 amigos"); podes terminar com um convite suave a reagir ("se te reconheceste, deixa um coração"). NÃO nomeies o formato. SEM vender. Deixa claro que limite com amor honra a família. Português europeu com todos os acentos.",
  "hashtags": ["10-12 hashtags PT, amplas + de nicho, sem repetir"]
}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  if (!replicateToken) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; estilo?: string; slug?: string; conceito?: string };
  const tema = body.tema?.trim();
  const estilo = body.estilo || ESTILO_DEFAULT;
  const conceito = body.conceito?.trim() || undefined; // selo do conceito da semana (capa)
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  // 1) Claude escreve o carrossel (gancho + prompt de imagem + ensino + licao)
  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: `${SYSTEM}\n\n${REGRA_ACENTOS}`, messages: [{ role: 'user', content: `Carrossel "Cá em Casa" sobre: "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) {
    return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 });
  }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { titulo?: string; capa?: { gancho?: string; imagePrompt?: string }; ensino?: string[]; licao?: string; cta?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);
  p = await corrigirAcentos(p, apiKey); // rede de segurança: acentuação correta

  const gancho = p.capa?.gancho?.trim();
  const imagePrompt = p.capa?.imagePrompt?.trim();
  const ensino = (Array.isArray(p.ensino) ? p.ensino : []).map((s) => (s ?? '').trim()).filter(Boolean).slice(0, 4);
  if (!gancho || !imagePrompt) return NextResponse.json({ erro: 'sem-capa', amostra: texto.slice(0, 300) }, { status: 502 });

  const slug = body.slug ?? `banda-${Date.now()}`; // regenerar = mesmo slug

  // 2) Flux gera UMA ilustração (a capa), no estilo escolhido.
  let imageUrl: string | null = null;
  try {
    const replicateUrl = await gerarImagemFlux(imagePrompt, replicateToken, { estilo, tema: 'caemcasa', extra: representacaoAleatoria() });
    try { imageUrl = await guardarImagem(replicateUrl, `banda/${slug}/capa-${Date.now()}.jpg`); } catch { imageUrl = replicateUrl; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e), prompt: imagePrompt }, { status: 502 });
  }

  const slides = [
    { tipo: 'banda', imageUrl, gancho, imagePrompt, capa: true, conceito },
    ...ensino.map((t) => ({ tipo: 'banda', texto: t, capa: false })),
    { tipo: 'banda', licao: (p.licao ?? '').trim(), cta: (p.cta ?? '').trim() || '↗ envia a quem precisa', capa: false },
  ];

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const dias = [{ dia: 1, mundo: MUNDO, palavra: p.titulo ?? tema, slides, faixa, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'banda', mundo: MUNDO, estilo } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
