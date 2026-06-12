// Gera UMA frase de série (curta, leitura rápida) + legenda longa + prompt MJ.
// Partilhado por: gerar-frase (preview), dia/regenerar (refazer SÓ um dia).
// A VOZ/BREVIDADE/LEGENDA vivem em voz.ts (fonte única).

import { limparTravessoes, corrigirAcentos, REGRA_ACENTOS } from '@/lib/texto';
import { ROTACAO } from '@/lib/series/serie-design';
import { VOZ, PORTA_SALA, REFLEXO_PARTILHA, BREVIDADE, LEGENDA_LONGA, SOM_PROMPT, LUZ, estacaoPt, type Serie } from '@/lib/series/voz';

export async function gerarFraseSerie(opts: { serie: Serie; dia?: string; evitar: string[]; apiKey: string }): Promise<{ frase: string; mjPrompt: string; legenda: string; somPrompt: string }> {
  const { serie, apiKey } = opts;
  const dia = (opts.dia || '').trim();
  const hoje = new Date();
  const ritual = serie === 'hojeemmim' && dia ? ROTACAO[dia] : undefined;

  const SYSTEM = `És a voz da Vivianne dos Santos (psicologia transpessoal, constelação familiar; viviannedossantos.com). Escreves frases diárias para Instagram, didáticas e com alma, NUNCA para vender.
${VOZ[serie]}
${ritual ? `RITUAL DO DIA (${dia}): a frase serve o foco "${ritual.kicker}" — ${ritual.tema}. Na 1.ª pessoa.` : ''}

CONTEXTO: ${dia ? `dia da semana: ${dia}. ` : ''}época do ano: ${estacaoPt(hoje)} (hoje, ${hoje.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}). A frase encaixa no momento com SUBTILEZA, nunca nomeando a data.

${BREVIDADE[serie]}

${PORTA_SALA}

${REFLEXO_PARTILHA}

${LEGENDA_LONGA}

${SOM_PROMPT}

NUNCA repitas nenhuma destas frases já usadas, nem versões quase iguais:
${opts.evitar.length ? opts.evitar.map((p) => `- ${p}`).join('\n') : '(nenhuma ainda)'}

${LUZ[serie]}

Devolve APENAS JSON válido:
{
  "frase": "a frase CURTA da imagem, na voz certa",
  "legenda": "a versão longa (2-4 frases, parágrafos com \\n\\n, fecho digno)",
  "mjPrompt": "prompt MidJourney em INGLÊS para o FUNDO em MOVIMENTO (metáfora visual da frase; contemplativo, fine-art, cinematográfico; SEM pessoas, SEM texto). Termina com --ar 9:16",
  "somPrompt": "o ambiente sonoro da MESMA cena, em inglês, a terminar com seamless loop, no music, no voices"
}

${REGRA_ACENTOS}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: SYSTEM, messages: [{ role: 'user', content: 'Gera UMA frase nova (com legenda e prompt), sem repetir nenhuma das proibidas.' }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const texto: string = (await res.json())?.content?.[0]?.text ?? '';
  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini < 0 || fim <= ini) throw new Error('sem-json: ' + texto.slice(0, 150));
  let p: { frase?: string; legenda?: string; mjPrompt?: string; somPrompt?: string };
  try { p = JSON.parse(texto.slice(ini, fim + 1)); } catch { throw new Error('json-invalido: ' + texto.slice(0, 150)); }
  p = limparTravessoes(p);
  p = await corrigirAcentos(p, apiKey);
  const frase = (p.frase ?? '').trim();
  if (!frase) throw new Error('sem-frase');
  return { frase, mjPrompt: (p.mjPrompt ?? '').trim(), legenda: (p.legenda ?? '').trim() || frase, somPrompt: (p.somPrompt ?? '').trim() };
}
