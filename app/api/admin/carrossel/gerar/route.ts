import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { semanaSeed } from '@/lib/carrossel/calendario';
import { getCatalogoProdutos, produtosRelevantes, ecossistemaPrompt } from '@/lib/carrossel/catalogo';
import { REGRAS_GLOBAIS, UNIVERSO_TO_MUNDO } from '@/lib/carrossel/overrides';
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
    veus?: string[];
    numDias?: number;
  };

  const seed = body.semana ? semanaSeed(body.semana) : undefined;
  const universo = (body.universo ?? seed?.universo) as ColecaoId | undefined;
  const tema = body.tema ?? seed?.tema;
  const brief = body.brief ?? seed?.brief;
  const veus = body.veus ?? seed?.veus ?? [];
  if (!universo || !tema || !brief) {
    return NextResponse.json({ erro: 'falta semana ou universo/tema/brief' }, { status: 400 });
  }

  const numDias = body.numDias ?? 5;
  const mundo = UNIVERSO_TO_MUNDO[universo];
  const col = getColecao(universo);

  // Catalogo ciente dos produtos: top-N relevantes ao brief deste universo.
  const catalogo = await getCatalogoProdutos();
  const relevantes = produtosRelevantes(catalogo, { universo, brief, n: 14 });
  const ecossistema = ecossistemaPrompt(relevantes);

  const SYSTEM = `Es a estratega de conteudo da Vivianne dos Santos (psicologia transpessoal, constelacao familiar).
REGRAS:
${REGRAS_GLOBAIS.map((r) => `- ${r}`).join('\n')}

${ecossistema}

Vais planear UMA SEMANA de ${numDias} dias de conteudo para Instagram/TikTok sobre o tema dado, no universo "${col.nome}" (${col.pitch}).
Mistura formatos ao longo da semana: pelo menos 1 'carrossel-educativo', 1 'reel-gancho', 1 'citacao-visual', e 1 'carrossel-produto' (este ultimo com CTA mais directo a um produto).

DEVOLVE APENAS JSON valido, sem texto a volta, neste formato exacto:
{
  "dias": [
    {
      "dia": 1,
      "tipo": "carrossel-educativo | carrossel-dica | carrossel-produto | reel-gancho | reel-bastidores | citacao-visual",
      "plataforma": "instagram | tiktok | ambas",
      "titulo": "string",
      "descricao": "1 frase do que e o conteudo",
      "hashtags": ["#..."],
      "produtoRelacionado": "slug-ou-id-exacto-do-ecossistema",
      "horario": "11:30",
      "slides": [
        { "tipo": "capa|conteudo|citacao|cta", "texto": "...", "bold": ["trechos a negrito"], "destaque": "so em citacao/cta", "notaVisual": "EN, descricao de imagem editorial sem pessoas/rostos/texto", "fundoClaro": true }
      ],
      "reelScript": { "gancho": "...", "corpo": ["...", "..."], "cta": "...", "musica": "...", "duracao": "30-45s" }
    }
  ]
}
Notas: carrosseis tem 6-8 slides (capa + 4-6 conteudo + 1 cta). reels tem reelScript (sem slides). citacao-visual tem 1 slide tipo 'citacao'. Usa os "veus" como angulos dos dias: ${veus.join(', ')}.`;

  const userPrompt = `Tema da semana: "${tema}". Brief: ${brief}\nGera os ${numDias} dias agora.`;

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
  let parsed: { dias?: unknown[] };
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
      mundo,
      plataforma: dia.plataforma ?? 'ambas',
      horario: dia.horario ?? '11:30',
      hashtags: Array.isArray(dia.hashtags) ? dia.hashtags : [],
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
      { slug, title: tema, brief, dias, theme: { mundo, universo, semana: body.semana ?? null } },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message, coleccao: { slug, title: tema, dias } }, { status: 500 });

  return NextResponse.json({ ok: true, coleccao: data });
}
