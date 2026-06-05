import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { semanaSeed } from '@/lib/carrossel/calendario';
import { getCatalogoProdutos, amostraEcossistema, ecossistemaPrompt } from '@/lib/carrossel/catalogo';
import { REGRAS_GLOBAIS, UNIVERSO_TO_MUNDO } from '@/lib/carrossel/overrides';
import { directivaImagem } from '@/lib/carrossel/paletas';
import { faixaParaCarrossel } from '@/lib/carrossel/musica';
import { ofertasAnterioresPrompt } from '@/lib/carrossel/ofertas';
import { listarPoolImagens, atribuirPool } from '@/lib/carrossel/pool-server';
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
  const amostra = amostraEcossistema(catalogo, universo, 2);
  const ecossistema = `${ecossistemaPrompt(amostra)}\n\nOFERTAS ANTERIORES (o ecossistema que ja existia — usa-as tambem nos CTAs, com os links proprios):\n${ofertasAnterioresPrompt()}`;

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
- CLAREZA ACIMA DE TUDO: cada carrossel diz UMA coisa concreta que qualquer pessoa entende a primeira leitura. Fala de situacoes reais do dia a dia (a culpa ao deitar, o sim que devia ser nao, a chamada que nao fizeste). Usa a imagem poetica para ILUMINAR a mensagem, nunca para a esconder. Proibido: linguagem hermetica, abstracao a mais, frases que so a autora entende. Se uma frase precisa de ser decifrada, reescreve-a simples.
- ACENTUACAO OBRIGATORIA: escreve em portugues europeu com TODOS os acentos correctos e completos (á, à, ã, â, ç, é, ê, í, ó, ô, õ, ú). A palavra-capa tambem acentuada (ex.: "GESTAÇÃO", nunca "GESTACAO"; "FÉ", nunca "FE"). Texto sem acentos e ERRADO.
- LINKS (expandir nao e cortar): os produtos da LOJA apontam para viviannedossantos.com/loja/<slug>; as OFERTAS ANTERIORES (LUMINA, Loranne, Sete Ecos, livro, Escola) mantem os seus links proprios da lista. Usa o ecossistema TODO. Nunca inventes links — usa sempre os exactos das listas.

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
1) 'capa': a palavra-destaque do dia (texto = a palavra em maiusculas; titulo = o subtitulo poetico; destaque = uma frase curta de abertura, 1-2 linhas, que entra no tema, ex.: "Ha um escuro que nao e ausencia. E o inicio de tudo."). Fundo escuro/editorial.
2) 'conteudo' PROSA: reflexao em prosa curta, intima (titulo = "PROSA"). Base clara.
3) 'conteudo' POETICO: frase poetica espacada com quebras de linha (titulo = "POÉTICO"). Base clara.
4) 'conteudo' PRATICA: um convite ou pergunta pratica (titulo = "PRÁTICA" ou "HÁBITO DA SEMANA"). Base clara.
5) 'conteudo' POETICO: fecho poetico que volta a palavra (titulo = "POÉTICO"). Base clara.
6) 'cta': fecho com UM PRODUTO/oferta (titulo = nome do produto; texto = convite curto; destaque = a URL exacta). Fundo escuro/editorial.

CTA — CADA DIA FECHA SEMPRE COM UM PRODUTO. O CTA e o lugar onde exploras o ecossistema. Ao longo dos 7 dias, VARIA o produto:
- uns dias um ebook/guia/pack de um dos 7 UNIVERSOS da loja (URL: viviannedossantos.com/loja/<slug>);
- outros dias uma OFERTA ANTERIOR (LUMINA, Loranne, Sete Ecos, "Os 7 Veus do Despertar", Escola dos Veus) com o seu link proprio.
Regras: nao repitas o mesmo produto na mesma semana; explora universos diferentes (nao fiques so no universo do territorio); o produto escolhido deve tocar o tema do dia; usa nome e link/URL EXACTOS de cada um (no campo destaque do slide cta poe a URL).

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
        { "tipo": "capa|conteudo|cta", "titulo": "PROSA|POÉTICO|PRÁTICA|subtitulo-da-capa|nome-da-oferta", "texto": "...", "destaque": "na CAPA = frase de abertura; no CTA = a URL exacta", "notaVisual": "SO em capa e cta: um PROMPT MidJourney COMPLETO em ingles, pronto a colar — natureza-morta editorial contemplativa (objetos, texturas, luz, botanicos do universo), SEM pessoas, SEM rostos, SEM texto. Termina com ' --ar 9:16'" }
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
  const semNum = body.semana ?? 1;
  const dias = (Array.isArray(parsed.dias) ? parsed.dias : []).map((d, i) => {
    const dia = d as Record<string, unknown>;
    const diaNum = typeof dia.dia === 'number' ? dia.dia : i + 1;
    const faixa = faixaParaCarrossel(semNum, diaNum, estacao);
    return {
      ...dia,
      dia: diaNum,
      diaSemana: typeof dia.diaSemana === 'string' ? dia.diaSemana : DIAS_SEMANA[i % 7],
      palavra: typeof dia.palavra === 'string' ? (dia.palavra as string).toUpperCase() : undefined,
      subtitulo: typeof dia.subtitulo === 'string' ? dia.subtitulo : undefined,
      mundo,
      plataforma: dia.plataforma ?? 'ambas',
      horario: dia.horario ?? '11:30',
      hashtags: Array.isArray(dia.hashtags) ? dia.hashtags : [],
      faixa: { titulo: faixa.titulo, url: faixa.url ?? '' },
      musicaSugerida: `Ancient Ground · ${faixa.titulo}`,
    };
  });

  if (dias.length === 0) {
    return NextResponse.json({ erro: 'sem-dias' }, { status: 502 });
  }

  // Pool global: reaproveita imagens ja geradas no Estudio (estudio/{mundo}) para
  // os fundos capa+fecho, sem gerar novas.
  let diasFinal: typeof dias = dias;
  try {
    const pool = await listarPoolImagens(mundo);
    diasFinal = atribuirPool(dias as unknown as Record<string, unknown>[], pool) as unknown as typeof dias;
  } catch { /* sem pool, segue sem imagens */ }

  const slug = body.semana ? `semana-${body.semana}-${universo}` : `${universo}-${Date.now()}`;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert(
      { slug, title: tema, brief, dias: diasFinal, theme: { mundo, universo, semana: body.semana ?? null, territorio: tema, estacao, musica, jornada: parsed.jornada ?? null } },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message, coleccao: { slug, title: tema, dias } }, { status: 500 });

  return NextResponse.json({ ok: true, coleccao: data });
}
