// MÉTODO VS · gerar A HISTÓRIA ANTIGA (mãe). Pega numa cena bíblica + a LEITURA da
// Vivianne (o mecanismo que ela vê) e escreve o reel na voz da REVELAÇÃO: a cena é
// o espelho, o que sai é o método. NUNCA prega, NUNCA cita versículos como
// inspiração, NUNCA nomeia Deus/fé como tese; lê o mecanismo humano que já lá estava.

import { SABER } from '@/lib/metodo/saber';
import { type VeuNome } from '@/lib/metodo/contas';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';
import { limparTravessoes } from '@/lib/texto';
import type { PecaVS } from './gerar';
import type { HistoriaBiblica } from './historias-biblicas';

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());
const lista = (xs?: (string | undefined)[], n = 4) => (xs ?? []).filter(Boolean).slice(0, n).map((x) => `- ${x}`).join('\n');

export async function gerarHistoriaAntiga(h: HistoriaBiblica, apiKey: string, evitar: string[] = []): Promise<PecaVS> {
  const k = SABER[h.veu];
  if (!k) throw new Error(`sem SABER para o véu ${h.veu}`);

  const sys =
`Escreves UMA peça (reel 9:16) da Vivianne dos Santos, criadora do Método VS (Ver e Soltar), na voz da REVELAÇÃO. O formato de hoje é A HISTÓRIA ANTIGA: relês uma cena muito conhecida pela LENTE de um padrão humano, até a história mudar de significado à frente de quem lê.

A CENA DE HOJE: ${h.historia}.
A LEITURA (é da Vivianne, segue-a, é o coração da peça): ${h.leitura}.
O PADRÃO por baixo (só para ti, NUNCA o nomeies): véu ${h.veu}.
MATÉRIA do véu (profundidade, traduz para a vida, nunca teoria):
${lista([k.essencia, ...(k.mecanismos ?? []), k.lentes?.transpessoal])}

O QUE ISTO É (o mais importante):
- A cena é o ESPELHO. Toda a gente conhece a história de uma maneira; tu revelas o mecanismo que ela sempre escondeu, até a pessoa pensar "nunca tinha visto isto assim".
- NÃO é uma conta cristã nem espiritual. NÃO pregas, NÃO dás lição, NÃO citas o versículo como frase de inspiração, NÃO nomeias Deus, fé, milagre, pecado, bênção. Lês o MECANISMO HUMANO, na linguagem da vida real.
- A história é a porta; o sujeito é a pessoa de hoje que vive o MESMO padrão sem saber que ele é tão antigo.

ANATOMIA (4 a 6 momentos, cada um = 1 slide, 1 a 9 palavras):
1. A FACA: abre na cena ou numa frase dela tão certeira que para o scroll (podes usar uma fala da personagem se cortar fundo).
2-4. revela o mecanismo (a leitura), vestido de vida, virando o significado da cena.
5-6. a saída pelo SOLTAR: o que se larga, sem ordem nem moral. Termina no eco, não na lição.

REGRAS DA VOZ (duras):
- Português europeu. SEM travessões (— nem –): vírgulas, pontos ou parênteses.
- 3.ª pessoa ou universal ("há mulheres que…", "chamam-lhe…"), NUNCA "isto és tu".
- PROIBIDO jargão (trauma, mecanismo, padrão, véu, lealdade, sistema, cura, sobrevivência) E proibido jargão religioso (Deus, fé, milagre, pecado, graça, bênção, Senhor como vocativo de prece). Linguagem da vida.
- Descoberta com suavidade, nunca drama nem diagnóstico.
${evitar.length ? `\nJÁ FORAM USADAS (não repitas a frase nem o molde): ${evitar.slice(-20).map((e) => `"${e}"`).join('; ')}.` : ''}

A IMAGEM: a cena ${h.historia} em registo de arte cinematográfica, fine art, evocativa e atemporal (luz antiga, deserto, pedra, água, tecido em movimento conforme a cena), SEM texto, SEM pessoas a posar para a câmara. Devolve SÓ a cena em INGLÊS, sem estilo nem câmara (isso é acrescentado).

Devolve APENAS JSON válido: {"momentos":["...","..."],"destaque":["1 a 2 palavras a realçar (do 1.º momento)"],"conceito":"selo curto","fundoPrompt":"a CENA da imagem em inglês","legenda":"legenda curta do Instagram na mesma voz, sem pregar, termina num convite leve"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `A história antiga: ${h.historia}, véu ${h.veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { momentos?: unknown; destaque?: unknown; conceito?: unknown; fundoPrompt?: unknown; legenda?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }

  const momentos = Array.isArray(o.momentos) ? (o.momentos as unknown[]).map(lp).filter(Boolean).slice(0, 6) : [];
  if (!momentos.length) throw new Error('sem momentos da história');
  return {
    veu: h.veu,
    formato: 'historia' as unknown as PecaVS['formato'], // etiqueta própria (não é formato do calendário)
    momentos,
    destaque: Array.isArray(o.destaque) ? (o.destaque as unknown[]).map(lp).filter(Boolean).slice(0, 2) : [],
    fundoPrompt: lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags: hashtagsMetodo(h.veu),
    conceito: lp(o.conceito) || h.historia,
  };
}
