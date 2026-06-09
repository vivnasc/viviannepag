import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem, representacaoAleatoria } from '@/lib/banda/flux';

export const runtime = 'nodejs';
export const maxDuration = 300;

// POST { tema } — gera UM "I am a Hero": capa ILUSTRADA dourada/ancestral (Flux)
// com a frase-gancho + slides de ENSINO em texto (numerados) + afirmação final.
// Tema: curares-te liberta as próximas gerações (quebrar o ciclo), SEM cair no
// "salvador". Grava em carousel_collections (formato='heroi'). Paleta dourada.
const MUNDO = 'infonte'; // âmbar/dourado
const SERIE = 'I am a Hero';

const SYSTEM = `És a Vivianne dos Santos (psicologia transpessoal, constelação familiar). Crias "I am a Hero": um carrossel DIDÁTICO sobre CURAR-SE para LIBERTAR as próximas gerações (quebrar o ciclo das dores herdadas). Ensinar, nunca vender.

LÍNGUA (REGRA DURA, não falhar): português europeu, com a ACENTUAÇÃO TODA correta (á, à, â, ã, é, ê, í, ó, ô, õ, ú, ç). NUNCA escrevas uma palavra sem o acento que ela leva (ex.: "é", "há", "ninguém", "vê", "rápido", "também", "herança", "geração", "vínculo"). Segue o ACORDO ORTOGRÁFICO de 1990 (português europeu atual): "ato" (não "acto"), "ação" (não "acção"), "fator", "afeto". Relê antes de devolver.

CONCEITO (o coração): o herói da família é quem QUEBRA O CICLO. Sente a dor que foi passada de geração em geração, encara-a e transforma-a, em vez de a repetir e passar à frente. Curares-te a ti liberta quem vem depois e honra quem veio antes.

NUANCE (CRÍTICA, não achatar): herói NÃO é salvador. NUNCA dês a entender que se deve aguentar tudo, carregar a família, reparar os pais, ou parentalizar-se (isso é emaranhamento). O ato heroico é o oposto: SENTIR e PARAR de passar a dor à frente. Liga ao tema dos limites (não carregar o que não é teu). Tom de AMOR, DIGNIDADE e PERTENÇA, nunca de ressentimento, culpa ou egoísmo. Honrar quem veio antes é transformar a dor, não repeti-la.

FORMATO (carrossel):
- CAPA: uma frase-gancho curta (PT, máx. ~10 palavras), forte e identitária + um "imagePrompt" EM INGLÊS (~40-60 palavras) para gerar UMA ILUSTRAÇÃO luminosa e ancestral que CONVERSA com o gancho (linhagem, gerações, mãos entre gerações, uma figura voltada para a luz, silhuetas; SEM texto na imagem). NÃO descrevas o estilo de desenho (é fixo à parte); descreve só a cena/emoção.
- ENSINO: 3 a 4 frases curtas (PT), cada uma um slide, que explicam em palavras simples e humanas como curar-se interrompe o padrão e liberta os que vêm depois.
- AFIRMAÇÃO: a frase final, identitária e luminosa (ex.: "Eu sou quem quebra o ciclo.").
- NUNCA uses travessões (— nem –). Usa vírgulas, pontos ou parênteses.

DEVOLVE APENAS JSON válido (texto em português com TODOS os acentos):
{
  "titulo": "título curto (2-5 palavras)",
  "capa": { "gancho": "...", "imagePrompt": "..." },
  "ensino": ["frase 1", "frase 2", "frase 3"],
  "licao": "afirmação final identitária e luminosa",
  "legenda": "legenda Instagram: 1.ª linha gancho, depois 2-4 linhas que explicam (curar-se liberta as gerações, sem salvar ninguém), fecha com convite a refletir + 'guarda este post' ou 'partilha com quem precisa'. SEM vender. Português europeu com todos os acentos.",
  "hashtags": ["10-12 hashtags PT, amplas + de nicho (constelação familiar, heranças, curar, gerações), sem repetir"]
}`;

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });
  if (!replicateToken) return NextResponse.json({ erro: 'sem-replicate-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string };
  const tema = body.tema?.trim();
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: `${SYSTEM}\n\n${REGRA_ACENTOS}`, messages: [{ role: 'user', content: `Carrossel "I am a Hero" sobre: "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) {
    return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 });
  }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { titulo?: string; capa?: { gancho?: string; imagePrompt?: string }; ensino?: string[]; licao?: string; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);
  p = await corrigirAcentos(p, apiKey); // rede de segurança: acentuação correta

  const gancho = p.capa?.gancho?.trim();
  const imagePrompt = p.capa?.imagePrompt?.trim();
  const ensino = (Array.isArray(p.ensino) ? p.ensino : []).map((s) => (s ?? '').trim()).filter(Boolean).slice(0, 4);
  if (!gancho || !imagePrompt) return NextResponse.json({ erro: 'sem-capa', amostra: texto.slice(0, 300) }, { status: 502 });

  const slug = `heroi-${Date.now()}`;

  let imageUrl: string | null = null;
  try {
    const replicateUrl = await gerarImagemFlux(imagePrompt, replicateToken, { estilo: 'gouache', tema: 'heroi', extra: representacaoAleatoria() });
    try { imageUrl = await guardarImagem(replicateUrl, `heroi/${slug}/capa-${Date.now()}.jpg`); } catch { imageUrl = replicateUrl; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux', detalhe: e instanceof Error ? e.message : String(e), prompt: imagePrompt }, { status: 502 });
  }

  const slides = [
    { tipo: 'banda', serie: SERIE, imageUrl, gancho, imagePrompt, capa: true },
    ...ensino.map((t) => ({ tipo: 'banda', serie: SERIE, texto: t, capa: false })),
    { tipo: 'banda', serie: SERIE, licao: (p.licao ?? '').trim(), capa: false },
  ];

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };
  const dias = [{ dia: 1, mundo: MUNDO, palavra: p.titulo ?? tema, slides, faixa, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'heroi', mundo: MUNDO, serie: SERIE } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
