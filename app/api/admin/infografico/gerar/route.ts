import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { listarPoolImagens, imagensUsadas } from '@/lib/carrossel/pool-server';
import { getCurso } from '@/lib/infografico/cursos';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema, curso? } — gera UM infografico DIDATICO (educativo, SEM CTA nem
// produtos). Material das pos-graduacoes / cursos. Grava em carousel_collections
// (formato='infografico') para reaproveitar render/download.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string; curso?: string };
  const tema = body.tema?.trim();
  const curso = getCurso(body.curso ?? 'transpessoal');
  const mundo = curso.mundo;
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  const SYSTEM = `És a Vivianne dos Santos (psicologia transpessoal, constelação familiar; pós-graduada). Crias UM INFOGRÁFICO DIDÁTICO que EXPLICA um conceito de forma clara e educativa, para ENSINAR, nunca para vender. Contexto académico: "${curso.nome}" (${curso.descricao}). Sem jargão (ou explica-o em palavras simples).

REGRAS:
- PURAMENTE DIDÁTICO: SEM CTA, SEM produtos, SEM links, SEM promover nada. Só conhecimento.
- Claro à primeira leitura. Concreto, com exemplos do real.
- Fiel ao conceito académico; honra a profundidade (ex.: Ordens do Amor, substituição de papéis, lealdades invisíveis, níveis de consciência) quando o tema o pedir.
- ENQUADRAMENTO (crítico): NUNCA soar a ensinar egoísmo nem "põe-te primeiro". O custo do padrão é para o AMOR e para a RELAÇÃO (amor construído sobre alguém que desaparece não é amor real; os outros aprendem a amar uma pessoa que não existe). A alternativa não é ego, é INTEIREZA, PRESENÇA e RECIPROCIDADE saudável (estar inteira para poder dar a sério, e também deixar receber). Evita linguagem de autoprioridade que soe egocêntrica; a virada abre uma reflexão, não manda "cuida de ti primeiro".
- NUNCA uses travessões (— nem –). Usa vírgulas, pontos ou parênteses.

CONSISTÊNCIA (importante, para todos os infográficos ficarem com o MESMO peso visual):
- Preenche SEMPRE todos os campos: subtitulo, diagrama (com o número de itens pedido abaixo), custoTi, custoOutros e virada. Nunca deixes campos vazios nem o diagrama curto.
- Cada bloco do diagrama é uma frase concreta (8 a 18 palavras), nem telegráfica nem um parágrafo. Mantém os blocos com extensão semelhante entre si.

DEVOLVE APENAS JSON válido:
{
  "padrao": "nome curto do conceito (2-4 palavras)",
  "subtitulo": "1 linha que o explica",
  "tipoDiagrama": "ciclo | espectro | herdado | camadas | travessia",
  "diagrama": { },
  "custoTi": "1 frase: como isto se manifesta na pessoa (efeito interno)",
  "custoOutros": "1 frase: como afeta a relação, os outros, o sistema",
  "virada": "1 frase de reflexão ou pergunta (abre, não vende)",
  "legenda": "legenda para Instagram, DIDÁTICA: 1.ª linha gancho forte, depois 2 a 4 linhas que explicam o conceito em palavras simples, e fecha com um convite a refletir e 'guarda este post' ou 'partilha com quem precisa'. SEM vender.",
  "hashtags": ["10-12 hashtags relevantes em português, mistura amplas e de nicho (ex.: #constelacaofamiliar #psicologiatranspessoal #autoconhecimento), sem # repetido"]
}

ESCOLHE o tipoDiagrama que MELHOR explica o conceito e preenche "diagrama" com o número de itens indicado (para um peso visual consistente):
- "ciclo" (repete-se em loop) -> { "passos": ["EXATAMENTE 4 passos curtos, <=6 palavras"] }
- "espectro" (entre dois extremos) -> { "poloA": "extremo 1", "poloB": "extremo 2", "equilibrio": "o ponto saudável no meio" }
- "herdado" (o que vem de trás vs o que é teu) -> { "esquerda": { "titulo": "...", "itens": ["3 itens"] }, "direita": { "titulo": "...", "itens": ["3 itens"] } }
- "camadas" (o que se vê vs o que está por baixo) -> { "camadas": [ EXATAMENTE 3 x { "label": "...", "texto": "..." } ] }
- "travessia" (caminho linear) -> { "passos": ["EXATAMENTE 4 etapas curtas"] }

${REGRA_ACENTOS}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 1500, system: SYSTEM, messages: [{ role: 'user', content: `Conceito a explicar (do curso ${curso.nome}): "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { padrao?: string; subtitulo?: string; tipoDiagrama?: string; diagrama?: unknown; custoTi?: string; custoOutros?: string; virada?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p); // a Vivianne nao usa travessoes
  p = await corrigirAcentos(p, apiKey); // rede de segurança: garante acentuação correta

  // fundo do pool (nao-usado primeiro) — so estetica
  let imageUrl: string | undefined;
  try {
    const pool = await listarPoolImagens(mundo);
    const usadas = await imagensUsadas();
    imageUrl = [...pool.filter((u) => !usadas.has(u)), ...pool][0];
  } catch { /* sem pool */ }

  const slug = `infografico-${curso.id}-${Date.now()}`;
  const slide = {
    tipo: 'infografico',
    padrao: p.padrao ?? tema,
    subtitulo: p.subtitulo ?? '',
    tipoDiagrama: p.tipoDiagrama ?? 'ciclo',
    diagrama: p.diagrama ?? {},
    custoTi: p.custoTi ?? '',
    custoOutros: p.custoOutros ?? '',
    virada: p.virada ?? '',
    legenda: p.legenda ?? '',
    hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
    imageUrl,
  };
  const dias = [{ dia: 1, mundo, palavra: p.padrao ?? tema, slides: [slide] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.padrao ?? tema, brief: tema, dias, theme: { formato: 'infografico', mundo, curso: curso.id, video: true } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
