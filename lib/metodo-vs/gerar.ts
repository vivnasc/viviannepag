// MÉTODO VS · gerador NOVO, do zero, espelho do Soulab — a VOZ DA REVELAÇÃO.
//
// Uma peça = um reel 9:16 kinético (a mesma moldura limpa do Soulab): uma imagem
// conceptual clara + as linhas da revelação que se revelam uma a uma. NÃO descreve
// comportamentos, NÃO explica: RENOMEIA um padrão humano invisível e muda o
// significado da história. A pessoa pensa "nunca tinha visto isto assim".
//
// Lê SÓ a matéria da Vivianne (o SABER: lentes + origens). Zero código do motor velho.

import { SABER } from '@/lib/metodo/saber';
import { type VeuNome } from '@/lib/metodo/contas';
import { hashtagsMetodo } from '@/lib/metodo/hashtags';
import { limparTravessoes } from '@/lib/texto';

// os véus que têm matéria (lê do próprio SABER, não de listas paralelas).
export const VEUS_VS = Object.keys(SABER) as VeuNome[];

export interface PecaVS {
  veu: VeuNome;
  momentos: string[];   // as linhas da revelação (a 1.ª é "Chamam-lhe X")
  destaque: string[];   // palavras a realçar
  fundoPrompt: string;  // imagem conceptual (Flux), em inglês
  legenda: string;      // legenda do Instagram
  hashtags: string[];
  conceito: string;     // selo curto
}

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarPecaVS(veu: VeuNome, apiKey: string, evitar: string[] = []): Promise<PecaVS> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu}`);

  const sys =
`Escreves UMA peça (reel 9:16) da Vivianne dos Santos, criadora do Método VS (Ver e Soltar). A voz é a da REVELAÇÃO.

A MATÉRIA (só para TI perceberes o padrão; NUNCA a nomeies nem a copies no texto):
Essência: ${k.essencia}
Leitura sistémica (constelação): ${k.lentes.constelacao}
Leitura transpessoal: ${k.lentes.transpessoal}
De onde vem:
${k.origens.slice(0, 4).map((o) => `· ${o}`).join('\n')}

O QUE ISTO É (o mais importante): revelas um padrão humano invisível. NÃO descreves comportamentos ("releste a mensagem"), NÃO interpretas um episódio, NÃO explicas ("é uma estratégia de sobrevivência"). Pegas no NOME COMUM que se dá a algo (ansiedade, ser madura, ser forte, não depender de ninguém, não saber descansar) e RENOMEIA-lo, vestido de vida, até a história inteira mudar de significado. A pessoa pensa "nunca tinha visto isto assim", nunca "isto acontece-me".

ANATOMIA (com palavras NOVAS, nunca as da matéria):
1. O nome comum, o rótulo. ("Chamam-lhe ansiedade." / "Chamaram-te madura.")
2. A dúvida que abre a porta. ("Mas há pessoas que não estão ansiosas." / "Mas talvez essa não fosse a palavra certa.")
3. O nome verdadeiro, vestido de vida, cedo. ("Estão de vigia." / "a maneira bonita de dizer: precisávamos de ti.")
4. A textura, curta e sensorial, em 3.ª pessoa (o tom, o silêncio, a demora). Opcional.
5. O que ficou, sem o nomear (o corpo que não esqueceu, o presente que já é seguro).
Acaba no eco que arrepia, nunca num conselho.

REGRAS:
- 3.ª PESSOA ("há pessoas que…", "chamam-lhe…", "chamaram-te…"), NUNCA "tu fazes". O reconhecimento nasce de dentro de quem lê.
- DESCOBERTA em vez de explicação. "Talvez", suavidade. Tira a vergonha: nunca é drama nem defeito.
- PROIBIDO o jargão de terapeuta: trauma, mecanismo, padrão, parentificação, sobrevivência, estratégia, hipervigilância, regulação, ego, consciência, cura, jornada, véu. Linguagem da vida, sempre.
- Ritmo de RESPIRAÇÃO: linhas de 1 a 8 palavras. 6 a 10 linhas.
- Português europeu, sem travessões, sem aspas.
- TESTE: se a peça pudesse estar numa conta qualquer de ansiedade, psicologia ou desenvolvimento, está ERRADA.

IMAGEM (campo "fundoPrompt", em INGLÊS): arte conceptual fotográfica de gama alta, CLARA E AREJADA, com luz de dia, contemporânea e premium (como uma foto editorial de revista), que evoca o SENTIDO da peça sem o ilustrar à letra. PROIBIDO: velas, chamas, halos, auréolas, santos, ícones religiosos, sagrado, escuro ou soturno, pessoas a posar, rostos, texto. Termina com: bright airy editorial fine-art photography, natural daylight, premium, vertical 9:16.
${evitar.length ? `\nNÃO repitas estes arranques já usados: ${evitar.slice(-10).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve APENAS JSON válido, sem texto à volta: {"momentos":["Chamam-lhe …","linha 2","…"],"destaque":["1 a 3 palavras-chave a realçar"],"conceito":"selo curto, 1 a 3 palavras","fundoPrompt":"prompt da imagem em inglês","legenda":"legenda do Instagram em parágrafos curtos separados por linha em branco, na mesma voz da revelação, sem explicar nem usar jargão; termina com um convite leve (guardar, partilhar com quem isto arrepiou)"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `Uma peça da revelação para o véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { momentos?: unknown; destaque?: unknown; conceito?: unknown; fundoPrompt?: unknown; legenda?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback abaixo */ }

  const momentos = Array.isArray(o.momentos) ? o.momentos.map(lp).filter(Boolean) : [];
  if (!momentos.length) throw new Error('sem momentos da revelação');
  const destaque = Array.isArray(o.destaque) ? o.destaque.map(lp).filter(Boolean).slice(0, 3) : [];
  return {
    veu,
    momentos,
    destaque,
    fundoPrompt: lp(o.fundoPrompt),
    legenda: lp(o.legenda),
    hashtags: hashtagsMetodo(veu),
    conceito: lp(o.conceito),
  };
}
