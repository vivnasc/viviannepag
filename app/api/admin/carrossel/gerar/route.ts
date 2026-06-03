import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { semanaSeed } from '@/lib/carrossel/calendario';
import { getCatalogoProdutos, produtosRelevantes, ecossistemaPrompt } from '@/lib/carrossel/catalogo';
import { REGRAS_GLOBAIS, UNIVERSO_TO_MUNDO } from '@/lib/carrossel/overrides';
import { directivaImagem } from '@/lib/carrossel/paletas';
import { getColecao, type ColecaoId } from '@/lib/colecoes';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST /api/admin/carrossel/gerar { semana }  (ou titulo/brief/universo manuais)
// Gera uma semana de carrosseis no formato ConteudoDia[] que o motor do Estudio
// ja sabe desenhar, com CTAs apontados a produtos reais do ecossistema. Grava
// em carousel_collections (slug = semana-N-universo) e devolve a coleccao.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as {
    semana?: number;
    universo?: ColecaoId;
    palavra?: string;
    subtitulo?: string;
    brief?: string;
    numDias?: number;
  };

  const seed = body.semana ? semanaSeed(body.semana) : undefined;
  const universo = (body.universo ?? seed?.universo) as ColecaoId | undefined;
  const palavra = body.palavra ?? seed?.palavra;
  const subtitulo = body.subtitulo ?? seed?.subtitulo ?? '';
  const brief = body.brief ?? seed?.brief;
  const estacao = seed?.estacao ?? 'inverno';
  const musica = seed?.musica ?? 'instrumental contemplativo (estilo Ancient Ground)';
  const tema = seed?.tema ?? palavra;
  if (!universo || !palavra || !brief) {
    return NextResponse.json({ erro: 'falta semana ou universo/palavra/brief' }, { status: 400 });
  }

  const DIAS_SEMANA = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const numDias = body.numDias ?? 7;
  const mundo = UNIVERSO_TO_MUNDO[universo];
  const col = getColecao(universo);

  // Catalogo ciente dos produtos: top-N relevantes ao brief deste universo.
  const catalogo = await getCatalogoProdutos();
  const relevantes = produtosRelevantes(catalogo, { universo, brief, n: 14 });
  const ecossistema = ecossistemaPrompt(relevantes);

  const SYSTEM = `Es a voz dos Carrosseis dos 7 Veus da Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Conteudo contemplativo, partilhavel, que segue o ano (estacoes e datas).
REGRAS DE VOZ:
${REGRAS_GLOBAIS.map((r) => `- ${r}`).join('\n')}
- Tom generoso e NAO-vendedor: "nao para te diagnosticar, para te devolver a ti". A palavra da semana lidera tudo.

${ecossistema}

${directivaImagem(universo)}

ESTRUTURA DA SEMANA (formato 7 Veus, ${numDias} dias, segunda a domingo):
PALAVRA da semana: "${palavra}" · subtitulo: "${subtitulo}" · estacao: ${estacao} · musica instrumental: ${musica}.
Cada dia e um carrossel curto e contemplativo que toca a PALAVRA por um angulo diferente. Slides por dia (4-6):
- 'capa': a PALAVRA em destaque (texto = a palavra "${palavra}" em maiusculas; titulo = o subtitulo poetico).
- 'conteudo' PROSA: reflexao em prosa curta (titulo do slide = "PROSA").
- 'conteudo' POETICO: frase poetica e espacada (titulo = "POETICO").
- 'conteudo' PRATICA: um convite ou pergunta pratica (titulo = "PRATICA").
- 'citacao' "Sabias que...": uma micro-sabedoria (titulo = "Sabias que...").
- 'cta': fecho GENEROSO — convida a um gesto interior. So quando o tema o pedir mesmo, aponta com leveza a UM produto do ecossistema como passo seguinte natural (nunca anuncio).

COMBINA A LOJA COM ALMA:
- O conteudo entrega valor a serio; o produto e o passo seguinte para quem quer aprofundar.
- No MAXIMO 1-2 dias por semana mencionam produto, sempre no fecho. Os restantes sao puro valor.
- Pensa a semana como jornada subtil: ebook de entrada -> pack que aprofunda. Usa slugs/links EXACTOS do ecossistema, nunca inventes.

DEVOLVE APENAS JSON valido, sem texto a volta:
{
  "jornada": { "entrada": "slug", "aprofundar": "slug", "complemento": "slug-ou-vazio", "fio": "1 frase que liga os produtos pelo mesmo nervo" },
  "dias": [
    {
      "dia": 1,
      "diaSemana": "segunda",
      "tipo": "citacao-visual | carrossel-educativo | carrossel-dica | carrossel-produto | reel-gancho",
      "plataforma": "instagram | tiktok | ambas",
      "titulo": "o angulo do dia",
      "descricao": "1 frase",
      "hashtags": ["#..."],
      "produtoRelacionado": "slug-ou-vazio",
      "horario": "11:30",
      "slides": [
        { "tipo": "capa|conteudo|citacao|cta", "titulo": "PROSA|POETICO|PRATICA|Sabias que...|subtitulo", "texto": "...", "destaque": "so citacao/cta", "notaVisual": "EN editorial boho contemplativo, SEM pessoas/rostos/texto", "fundoClaro": true }
      ],
      "reelScript": { "gancho": "...", "corpo": ["..."], "cta": "...", "musica": "${musica}", "duracao": "30-45s" }
    }
  ]
}
Notas: a maioria sao carrosseis contemplativos; inclui pelo menos 1 'reel-gancho' (com reelScript, sem slides). A capa de cada dia mantem a coesao da PALAVRA. A musica de cada dia = a musica da semana.`;

  const userPrompt = `Palavra da semana: "${palavra}" (${subtitulo}). Universo: ${col.nome}. Brief: ${brief}\nGera os ${numDias} dias (segunda a domingo) agora.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 8192,
        system: SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    }
    const j = await res.json();
    texto = j?.content?.[0]?.text ?? '';
  } catch (e) {
    return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 });
  }

  // Extrai o JSON (primeiro '{' ate ultimo '}').
  const ini = texto.indexOf('{');
  const fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) {
    return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  }
  let parsed: { dias?: unknown[]; jornada?: unknown };
  try {
    parsed = JSON.parse(texto.slice(ini, fim + 1));
  } catch {
    return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 });
  }

  // Normaliza: garante mundo, dia sequencial, defaults.
  const dias = (Array.isArray(parsed.dias) ? parsed.dias : []).map((d, i) => {
    const dia = d as Record<string, unknown>;
    return {
      ...dia,
      dia: typeof dia.dia === 'number' ? dia.dia : i + 1,
      diaSemana: typeof dia.diaSemana === 'string' ? dia.diaSemana : DIAS_SEMANA[i % 7],
      mundo,
      plataforma: dia.plataforma ?? 'ambas',
      horario: dia.horario ?? '11:30',
      hashtags: Array.isArray(dia.hashtags) ? dia.hashtags : [],
      musicaSugerida: dia.musicaSugerida ?? musica,
    };
  });

  if (dias.length === 0) {
    return NextResponse.json({ erro: 'sem-dias' }, { status: 502 });
  }

  const slug = body.semana ? `semana-${body.semana}-${universo}` : `${universo}-${Date.now()}`;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert(
      { slug, title: tema, brief, dias, theme: { mundo, universo, semana: body.semana ?? null, palavra, subtitulo, estacao, musica, jornada: parsed.jornada ?? null } },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message, coleccao: { slug, title: tema, dias } }, { status: 500 });

  return NextResponse.json({ ok: true, coleccao: data });
}
