import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { FAMILIA } from '@/lib/banda/personagens';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST { tema } — gera UM mini-conto "Cá em Casa" (banda desenhada didática
// sobre limites no dia a dia, com a família recorrente). Sem CTA. Grava em
// carousel_collections (formato='banda') -> render em carrossel + MP4.
const MUNDO = 'synchim'; // paleta relacional (constelação familiar)

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { tema?: string };
  const tema = body.tema?.trim();
  if (!tema) return NextResponse.json({ erro: 'falta tema' }, { status: 400 });

  const elenco = FAMILIA.map((p) => `- ${p.id} (${p.nome}): ${p.papel}`).join('\n');

  const SYSTEM = `Es a Vivianne dos Santos (psicologia transpessoal, constelacao familiar). Crias "Cá em Casa": uma mini-banda desenhada DIDATICA sobre LIMITES no dia a dia, com uma familia recorrente. Ensinar pela cena, nunca vender. Portugues europeu COM acentos.

A FAMILIA (usa SO estes ids):
${elenco}

REGRAS:
- 4 a 6 paineis. O ULTIMO painel e a LICAO (so "licao", sem personagens): a virada/ensinamento.
- Cada painel (menos a licao): "cenario" curto (onde estao) + 1 a 2 personagens com "fala" CURTA (max ~12 palavras, cabe num balao).
- "modo": "fala" (normal), "pensa" (pensamento), "herdada" (a voz herdada/interior que aperta — ex.: a Avó Alice ou uma frase antiga que ainda manda).
- Mostra um limite real do dia a dia (dizer nao sem culpa, deixar o outro dar, nao carregar o que nao e teu...).
- ENQUADRAMENTO (critico): NUNCA soar a ensinar egoismo nem "poe-te primeiro". O limite com amor nao e rejeicao, e INTEIREZA, PRESENCA e RECIPROCIDADE. A licao abre reflexao, nao manda "cuida de ti primeiro".
- NUNCA uses travessoes (— nem –). Usa virgulas, pontos ou parenteses.
- Calorosa, humana, com profundidade. Reconhecivel ("isto sou eu").

DEVOLVE APENAS JSON valido:
{
  "titulo": "titulo curto do conto (2-5 palavras)",
  "paineis": [
    { "cenario": "...", "personagens": [ { "id": "nina", "fala": "...", "modo": "fala" } ] },
    { "licao": "frase de fecho que ensina/abre reflexao" }
  ],
  "legenda": "legenda Instagram: 1.a linha gancho, depois 2-4 linhas que explicam o padrao do conto em palavras simples, fecha com convite a refletir + 'guarda este post' ou 'partilha com quem precisa'. SEM vender. Portugues europeu com acentos.",
  "hashtags": ["10-12 hashtags em portugues, amplas + de nicho, sem repetir"]
}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-opus-4-7', max_tokens: 2000, system: SYSTEM, messages: [{ role: 'user', content: `Conto "Cá em Casa" sobre: "${tema}".` }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  type Fala = { id?: string; fala?: string; modo?: string };
  type Painel = { cenario?: string; personagens?: Fala[]; licao?: string };
  let p: { titulo?: string; paineis?: Painel[]; legenda?: string; hashtags?: string[] };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p); // a Vivianne nao usa travessoes

  const ids = new Set(FAMILIA.map((x) => x.id));
  const paineisIn = (Array.isArray(p.paineis) ? p.paineis : []).filter((pa) => pa && (pa.licao || (pa.personagens && pa.personagens.length)));
  if (!paineisIn.length) return NextResponse.json({ erro: 'sem-paineis', amostra: texto.slice(0, 300) }, { status: 502 });

  const slides = paineisIn.map((pa, i) => ({
    tipo: 'banda',
    cenario: (pa.cenario ?? '').trim(),
    licao: (pa.licao ?? '').trim(),
    personagens: (pa.personagens ?? [])
      .filter((f) => f.fala && f.id && ids.has(f.id))
      .slice(0, 2)
      .map((f) => ({ id: f.id, fala: (f.fala ?? '').trim(), modo: (['fala', 'pensa', 'herdada'].includes(f.modo ?? '') ? f.modo : 'fala') })),
    capa: i === 0,
  }));

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = { numero: numeroFaixa, titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`, url: faixaUrl(numeroFaixa) };

  const slug = `banda-${Date.now()}`;
  const dias = [{ dia: 1, mundo: MUNDO, palavra: p.titulo ?? tema, slides, faixa, legenda: p.legenda ?? '', hashtags: Array.isArray(p.hashtags) ? p.hashtags : [] }];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert({ slug, title: p.titulo ?? tema, brief: tema, dias, theme: { formato: 'banda', mundo: MUNDO } }, { onConflict: 'slug' })
    .select().single();
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data });
}
