import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { ROTACAO } from '@/lib/series/serie-design';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { serie, dia?, evitar? } — gera UMA frase nova (e o prompt MidJourney do
// fundo em movimento) para as séries diárias seteveus.space. O Claude escolhe a
// frase (a Vivianne não a escolhe), NUNCA repete (dedup com as já usadas + as
// que estão a ser evitadas nesta sessão), e respeita o dia da semana + a estação.
type Serie = 'vcsabia' | 'hojeemmim';

const VOZ: Record<Serie, string> = {
  vcsabia:
    'Série "VC Sabia" (abre com "Sabias que…"), de MANHÃ: tom esperançoso e luminoso. Padrão preferido: uma verdade serena da natureza ou do dia a dia + uma ponte para a pessoa ("Tu também…"). Ex.: "Uma planta não cresce mais depressa por receber mais água do que precisa. Tu também floresces melhor quando respeitas os teus limites." A analogia da natureza requadra uma LUTA real (pressa, exigência, culpa) em força serena, e vira um PRESENTE que apetece enviar a quem precisa de o ouvir hoje. Doce, com lastro, nunca foleiro.',
  hojeemmim:
    'Série "Hoje em Mim" (estilo "Hoje aprendi que…"), de NOITE: contemplativo, na PRIMEIRA pessoa, íntimo. Uma aprendizagem sobre si própria (silêncio, limites, pertença, herança). Ex.: "Hoje aprendi que o meu silêncio é, muitas vezes, a resposta mais honesta." Uma verdade na 1.ª pessoa tão PRECISA que a pessoa a sente como SUA e a põe na sua story como quem diz "sou eu". O dia da semana colore o tom (ex.: domingo mais repouso, segunda mais recomeço, sexta mais balanço), com subtileza.',
};

function estacaoPt(d: Date): string {
  const m = d.getMonth() + 1; // Portugal (hemisfério norte)
  if (m === 12 || m <= 2) return 'inverno';
  if (m <= 5) return 'primavera';
  if (m <= 8) return 'verão';
  return 'outono';
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { serie?: Serie; dia?: string; evitar?: string[] };
  const serie: Serie = body.serie === 'vcsabia' ? 'vcsabia' : 'hojeemmim';
  const dia = (body.dia || '').trim();
  const evitar = Array.isArray(body.evitar) ? body.evitar.map((s) => String(s).trim()).filter(Boolean) : [];

  // dedup: frases já usadas nas coleções desta série + as desta sessão a evitar
  const supabase = getSupabaseAdmin();
  const { data: existentes } = await supabase.from('carousel_collections').select('dias, theme').eq('theme->>formato', 'serie-diaria');
  const usadas = new Set<string>(evitar);
  for (const c of existentes ?? []) {
    const t = (c.theme as { serie?: string } | null) ?? {};
    if (t.serie && t.serie !== serie) continue;
    for (const d of (Array.isArray(c.dias) ? c.dias : []) as Array<{ palavra?: unknown }>) {
      if (typeof d?.palavra === 'string' && d.palavra.trim()) usadas.add(d.palavra.trim());
    }
  }
  const proibidas = Array.from(usadas);

  const hoje = new Date();
  const estacao = estacaoPt(hoje);
  const dataPt = hoje.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
  const ritual = serie === 'hojeemmim' && dia ? ROTACAO[dia] : undefined;

  const SYSTEM = `És a voz da Vivianne dos Santos (psicologia transpessoal, constelação familiar; viviannedossantos.com). Escreves frases diárias para Instagram, didáticas e com alma, NUNCA para vender.
${VOZ[serie]}
${ritual ? `RITUAL DO DIA (${dia}): a frase serve o foco "${ritual.kicker}" — ${ritual.tema}. A frase deve encaixar neste ritual, na 1.ª pessoa.` : ''}

CONTEXTO: ${dia ? `dia da semana: ${dia}. ` : ''}época do ano: ${estacao} (hoje, ${dataPt}). A frase encaixa no momento (dia da semana + estação) com SUBTILEZA, nunca à força nem nomeando a data.

PORTA->SALA: quando a frase funda for fechada para um estranho, abre por um reconhecimento concreto e fecha na frase funda. Concreto e sensorial, NUNCA genérico/autoajuda. Uma só ideia, ritmo poético. Português europeu com TODOS os acentos. SEM travessões (usa vírgulas/pontos).

REFLEXO DE PARTILHA (o objetivo destes posts é SEREM PARTILHADOS): escreve para a pessoa ler e, sem pensar, sentir "isto sou eu" OU "tenho de mandar isto a alguém". Para isso:
- nomeia um sentimento PRECISO e universal que quase ninguém consegue pôr em palavras (dás voz ao indizível);
- dá RECONHECIMENTO ou PERMISSÃO que apetece passar a outra pessoa (descansar, dizer não, ir devagar, parar de carregar o que não é teu);
- tão verdadeira que apeteça GUARDAR e ENVIAR a alguém concreto (a mãe, a irmã, a amiga cansada);
- a partilha nasce do RECONHECIMENTO e da BELEZA, NUNCA do choque, alarme ou clickbait. Nada de "3 sinais", "o erro que…", nem promessas. Dignidade sempre.

NUNCA repitas nenhuma destas frases já usadas, nem versões quase iguais:
${proibidas.length ? proibidas.map((p) => `- ${p}`).join('\n') : '(nenhuma ainda)'}

Devolve APENAS JSON válido:
{
  "frase": "a frase da série, na voz certa, pronta a publicar",
  "mjPrompt": "prompt MidJourney em INGLÊS para o FUNDO em MOVIMENTO (metáfora visual da frase; estética contemplativa, fine-art, cinematográfica, luz natural suave/noturna, profundidade; SEM pessoas, SEM texto, SEM letras). Termina com --ar 9:16"
}

${REGRA_ACENTOS}`;

  let texto = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, system: SYSTEM, messages: [{ role: 'user', content: 'Gera UMA frase nova (e o prompt de imagem), sem repetir nenhuma das proibidas.' }] }),
    });
    if (!res.ok) return NextResponse.json({ erro: 'claude', detalhe: await res.text() }, { status: 502 });
    texto = (await res.json())?.content?.[0]?.text ?? '';
  } catch (e) { return NextResponse.json({ erro: 'claude-fetch', detalhe: String(e) }, { status: 502 }); }

  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) return NextResponse.json({ erro: 'sem-json', amostra: texto.slice(0, 300) }, { status: 502 });
  let p: { frase?: string; mjPrompt?: string };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { return NextResponse.json({ erro: 'json-invalido', amostra: texto.slice(0, 300) }, { status: 502 }); }
  p = limparTravessoes(p);
  p = await corrigirAcentos(p, apiKey); // rede de segurança: acentuação correta

  const frase = (p.frase ?? '').trim();
  const mjPrompt = (p.mjPrompt ?? '').trim();
  if (!frase) return NextResponse.json({ erro: 'sem-frase', amostra: texto.slice(0, 300) }, { status: 502 });
  return NextResponse.json({ ok: true, frase, mjPrompt, estacao, dia });
}
