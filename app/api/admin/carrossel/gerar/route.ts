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
    tema?: string;
    brief?: string;
    numDias?: number;
  };

  const seed = body.semana ? semanaSeed(body.semana) : undefined;
  const universo = (body.universo ?? seed?.universo) as ColecaoId | undefined;
  const brief = body.brief ?? seed?.brief;
  const estacao = seed?.estacao ?? 'inverno';
  const musica = seed?.musica ?? 'instrumental contemplativo (estilo Ancient Ground)';
  const tema = body.tema ?? seed?.tema ?? seed?.palavra;
  if (!universo || !tema || !brief) {
    return NextResponse.json({ erro: 'falta semana ou universo/tema/brief' }, { status: 400 });
  }

  const DIAS_SEMANA = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const numDias = body.numDias ?? 7;
  const mundo = UNIVERSO_TO_MUNDO[universo];
  const col = getColecao(universo);

  // Catalogo ciente dos produtos: top-N relevantes ao brief deste universo.
  const catalogo = await getCatalogoProdutos();
  const relevantes = produtosRelevantes(catalogo, { universo, brief, n: 14 });
  const ecossistema = ecossistemaPrompt(relevantes);

  // Palavras-destaque JA usadas em qualquer coleccao — nunca repetir (regra
  // dela: as palavras nao se repetem entre dias, semanas ou carrosseis).
  const supabaseRead = getSupabaseAdmin();
  const { data: existentes } = await supabaseRead.from('carousel_collections').select('dias');
  const usadas = new Set<string>();
  for (const c of existentes ?? []) {
    for (const d of (Array.isArray(c.dias) ? c.dias : []) as Array<{ palavra?: unknown }>) {
      if (typeof d?.palavra === 'string' && d.palavra.trim()) usadas.add(d.palavra.trim().toUpperCase());
    }
  }
  const palavrasUsadas = Array.from(usadas);

  const SYSTEM = `Es a voz dos Carrosseis dos 7 Veus da Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Conteudo contemplativo, partilhavel, que segue o ano (estacoes e datas).
REGRAS DE VOZ:
${REGRAS_GLOBAIS.map((r) => `- ${r}`).join('\n')}
- Tom generoso e NAO-vendedor: "nao para te diagnosticar, para te devolver a ti". CADA DIA tem a sua propria palavra-destaque unica.
- ACENTUACAO OBRIGATORIA: escreve em portugues europeu com TODOS os acentos correctos e completos (á, à, ã, â, ç, é, ê, í, ó, ô, õ, ú). A palavra-capa tambem acentuada (ex.: "GESTAÇÃO", nunca "GESTACAO"; "FÉ", nunca "FE"). Texto sem acentos e ERRADO.

${ecossistema}

${directivaImagem(universo)}

ESTRUTURA DA SEMANA (formato 7 Veus, ${numDias} dias = ${numDias} carrosseis):
TERRITORIO da semana: "${tema}" — ${brief}. Universo: ${col.nome}. Estacao: ${estacao}. Musica instrumental: ${musica}.
NAO ha palavra de semana: cada DIA e um carrossel proprio com a SUA palavra-destaque unica.

PALAVRA-DESTAQUE (a regra mais importante para ela):
- Cada dia tem UMA palavra-destaque: 1 so palavra, substantivo forte, em MAIUSCULAS e ACENTUADA (ex.: TRAVESSIA, REPOUSO, MISTERIO->MISTÉRIO, RAIZ, FÉ), mais um subtitulo poetico curto em minusculas que a desdobra (ex.: "o escuro que ensina o que a luz nao alcanca").
- As palavras NUNCA se repetem: nem entre os dias desta semana, nem com qualquer palavra ja usada antes.
- PALAVRAS JA USADAS (PROIBIDAS, nunca repitas nenhuma): ${palavrasUsadas.join(', ') || '(nenhuma ainda)'}.
- As palavras do dia orbitam o territorio da semana por angulos diferentes; cada uma fresca e unica.

SLIDES DE CADA DIA (6 slides, nesta ordem):
1) 'capa': a palavra-destaque do dia (texto = a palavra em maiusculas; titulo = o subtitulo poetico). Fundo escuro/editorial.
2) 'conteudo' PROSA: reflexao em prosa curta, intima (titulo = "PROSA"). Base clara.
3) 'conteudo' POETICO: frase poetica espacada com quebras de linha (titulo = "POÉTICO"). Base clara.
4) 'conteudo' PRATICA: um convite ou pergunta pratica (titulo = "PRÁTICA" ou "HÁBITO DA SEMANA"). Base clara.
5) 'conteudo' POETICO: fecho poetico que volta a palavra (titulo = "POÉTICO"). Base clara.
6) 'cta': fecho GENEROSO numa oferta (titulo = nome da oferta; texto = convite; destaque = tagline curta). Fundo escuro/editorial.

CTA — roda entre estas ofertas conforme o tema (nunca anuncio, sempre convite):
- "Espelho gratuito" — 7 perguntas, 2 minutos; nao para te diagnosticar, para te devolver a ti.
- "Musica contemplativa" — para ficar contigo, sem pressa, so presenca.
- "Comunidade" — mulheres que continuam, sem mascara, sem prova.
- Um PRODUTO da loja (ebook/pack do ecossistema, slug/link exactos) — SO quando o tema o pede mesmo, como passo seguinte natural.
No MAXIMO 1-2 dias da semana fecham num produto da loja; os restantes fecham em ofertas generosas/gratuitas.

DEVOLVE APENAS JSON valido, sem texto a volta:
{
  "jornada": { "entrada": "slug", "aprofundar": "slug", "complemento": "slug-ou-vazio", "fio": "1 frase que liga os produtos pelo mesmo nervo" },
  "dias": [
    {
      "dia": 1,
      "diaSemana": "segunda",
      "palavra": "PALAVRA-DESTAQUE-UNICA-DO-DIA",
      "subtitulo": "subtitulo poetico do dia (minusculas)",
      "tipo": "citacao-visual",
      "plataforma": "ambas",
      "titulo": "o angulo do dia",
      "descricao": "1 frase",
      "hashtags": ["#..."],
      "produtoRelacionado": "slug-ou-vazio",
      "horario": "11:30",
      "slides": [
        { "tipo": "capa|conteudo|cta", "titulo": "PROSA|POÉTICO|PRÁTICA|nome-da-oferta", "texto": "...", "destaque": "so cta: tagline curta", "notaVisual": "SO em capa e cta: EN editorial boho contemplativo, SEM pessoas/rostos/texto" }
      ]
    }
  ]
}
Notas: 6 slides por dia. notaVisual APENAS nos slides 'capa' e 'cta' (os do meio sao base clara, sem imagem — deixa notaVisual vazio). Nos slides do meio mantem o texto curto. A palavra-destaque do dia aparece na capa e da coesao ao carrossel.`;

  const userPrompt = `Territorio da semana: "${tema}" — ${brief}. Universo: ${col.nome}. Estacao: ${estacao}.\nGera ${numDias} dias (carrosseis), cada um com a sua palavra-destaque UNICA — nunca repetidas entre si nem com a lista de proibidas. Agora.`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 16000,
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
      palavra: typeof dia.palavra === 'string' ? (dia.palavra as string).toUpperCase() : undefined,
      subtitulo: typeof dia.subtitulo === 'string' ? dia.subtitulo : undefined,
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
      { slug, title: tema, brief, dias, theme: { mundo, universo, semana: body.semana ?? null, territorio: tema, estacao, musica, jornada: parsed.jornada ?? null } },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message, coleccao: { slug, title: tema, dias } }, { status: 500 });

  return NextResponse.json({ ok: true, coleccao: data });
}
