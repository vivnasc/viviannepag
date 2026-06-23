// Método VS · MÃE autoridade — gerador LEVE (à maneira do Soulab: pouca instrução,
// frases CURTAS, "momentos" que desdobram UMA ideia). Cada formato dá um ARCO; o
// modelo devolve 3-6 linhas curtas + o envio. NADA hardcoded: sai do SABER do véu.
//
// A lição (jun 2026): o gerador pesado (essência + 6 regras + campos nomeados num só
// pedido) afogava o modelo e saía texto denso/partido. Aqui é mínimo e legível.

import { VeuNome } from './contas';
import { SABER, type SaberVeu } from './saber';
import { limparTravessoes } from '@/lib/texto';
import { type FormatoAutoridadeId } from './formatos-autoridade';

export interface StoryboardAut { beats: { texto: string; imagem: string }[]; envio: string; porque: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());
const alguns = (arr?: string[], n = 5) => (arr ?? []).slice(0, n).map((x) => `· ${x}`).join('\n');

// A LEITURA (a matéria de PROFUNDIDADE de onde sai a renomeação): as lentes da
// constelação e transpessoal + as origens. NUNCA se copia nem se nomeia no texto;
// serve só para o modelo PERCEBER o padrão e o vestir de vida.
function materiaDaLeitura(k: SaberVeu): string {
  return [
    `Essência (só para TI; nunca a nomeies no texto): ${k.essencia}`,
    `A leitura sistémica (constelação): ${k.lentes.constelacao}`,
    `A leitura transpessoal: ${k.lentes.transpessoal}`,
    `De onde vem (para vestires de vida, nunca como diagnóstico):`,
    alguns(k.origens, 4),
  ].join('\n');
}

const ANATOMIA =
  `ANATOMIA (segue esta forma, sempre com palavras NOVAS, nunca as do material):\n` +
  `1. O nome comum, o rótulo que o mundo dá a isto. ("Chamam-lhe ansiedade." / "Chamaram-te madura.")\n` +
  `2. A dúvida que abre a porta. ("Mas há pessoas que não estão ansiosas." / "Mas talvez essa não fosse a palavra certa.")\n` +
  `3. O nome VERDADEIRO, vestido de vida (a revelação, cedo). ("Estão de vigia." / "a maneira bonita de dizer: precisávamos de ti.")\n` +
  `4. A textura, curta e sensorial, em 3.ª pessoa (o tom, o silêncio, a demora). Opcional.\n` +
  `5. O que ficou, sem o nomear (o corpo que não esqueceu, o presente que já é seguro).\n` +
  `Acaba no eco que arrepia, nunca num conselho nem num apelo.`;

const REGRAS =
  `O QUE ISTO É: revelas um padrão humano invisível. NÃO explicas, NÃO interpretas um caso, NÃO descreves comportamentos. Dás um NOME NOVO a algo que a pessoa viveu a vida inteira, e o significado da história dela muda. (Como a carta da filha mais velha: não explica nada, muda o significado.)\n` +
  `PROIBIDO EXPLICAR: nada de "isto acontece porque…", "é uma estratégia de sobrevivência", "porque foste…". A leitura MOSTRA-SE vestida de vida, nunca se rotula. Em vez de "é sobrevivência", escreve "reparar primeiro era mais seguro do que ser surpreendida".\n` +
  `PROIBIDAS as palavras de terapeuta e o jargão: trauma, mecanismo, padrão, parentificação, sobrevivência, estratégia, hipervigilância, regulação, defesa, ego, consciência, energia, cura, jornada, véu. Linguagem da vida, sempre.\n` +
  `3.ª PESSOA: "há pessoas que…", "chamam-lhe…", "chamaram-te…". NUNCA "tu fazes isto" nem "tu és". O reconhecimento nasce de dentro de quem lê; não se aponta o dedo.\n` +
  `A SEMENTE é um RÓTULO que a pessoa carrega como verdade sobre si (ansiedade, ser madura, ser forte, ser responsável, não depender de ninguém, não saber descansar). O post RENOMEIA esse rótulo.\n` +
  `DESCOBERTA antes da explicação (na verdade, EM VEZ da explicação): a virada abre o post. Suavidade e "talvez", nunca a certeza fria de um diagnóstico. Tira a vergonha: nunca é drama nem defeito.\n` +
  `RITMO: linhas curtíssimas, cada uma uma respiração (1 a 8 palavras). Fragmentário, que assenta. 6 a 10 linhas.\n` +
  `O TESTE: se a peça pudesse estar numa conta qualquer de ansiedade, psicologia ou desenvolvimento pessoal, está ERRADA. Tem de ter a virada que só esta leitura dá. Português europeu, sem travessões, sem aspas.`;

// Gera UMA peça da conta-mãe (a VOZ DA REVELAÇÃO) para um véu. O `formato` já não muda
// a voz (as 8 molduras foram abolidas): a mãe tem uma só voz, a da revelação.
export async function gerarAutoridade(_formato: FormatoAutoridadeId, veu: VeuNome, apiKey: string, evitar: string[] = []): Promise<StoryboardAut> {
  const k = SABER[veu];
  if (!k) throw new Error(`sem SABER para o véu ${veu} (preenche lib/metodo/saber.ts primeiro)`);

  const sys =
    `Escreves o TEXTO de um reel curto (9:16) da Vivianne dos Santos (Método VS), na voz da REVELAÇÃO.\n\n` +
    `${materiaDaLeitura(k)}\n\n${ANATOMIA}\n\n${REGRAS}\n` +
    (evitar.length ? `\nNÃO repitas estes arranques já usados: ${evitar.slice(-8).map((e) => `"${e}"`).join('; ')}.\n` : '') +
    `\nLEGENDA (campo "porque"): 1 a 2 frases que aprofundam a MESMA leitura, na mesma voz da revelação, sem explicar, sem jargão, sem travessões.\n` +
    `\nDevolve APENAS JSON válido, sem texto à volta: {"momentos":["linha 1 (o nome comum)","linha 2","…"],"envio":"convite leve e curto (guardar, ou marcar quem isto arrepiou), nunca uma ordem nem uma explicação","porque":"a frase da legenda"}. As linhas seguem a ANATOMIA, curtíssimas, uma respiração cada.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 700, system: sys, messages: [{ role: 'user', content: `A voz da revelação para o véu ${veu}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { momentos?: unknown; envio?: unknown; porque?: unknown } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }

  const momentos = Array.isArray(o.momentos) ? o.momentos.map((x) => lp(x)).filter(Boolean) : [];
  if (!momentos.length) throw new Error('sem storyboard de autoridade');
  const beats = momentos.map((texto) => ({ texto, imagem: '' }));
  return { beats, envio: lp(o.envio), porque: lp(o.porque) };
}

// IMAGEM (gerador NOVO, à maneira do Soulab) — substitui o gerarFundoIA antigo, que
// enfiava velas/halos/sagrado (o ar do conteúdo abolido). Arte conceptual premium que
// ENCARNA a frase concreta, luminosa e legível, com um elemento que se move (para
// animar), e PROÍBE explicitamente o ar antigo. Devolve o prompt em inglês.
export async function gerarFundoAutoridade(frase: string, apiKey: string, evitar: string[] = []): Promise<string> {
  const evita = evitar.length ? `Evita repetir estes assuntos já usados: ${evitar.slice(-12).map((e) => `"${e}"`).join('; ')}.` : '';
  const sys =
    `És diretor de arte. Escreves UM prompt de imagem (em INGLÊS, uma linha) para o fundo de um reel 9:16 do Método VS.\n` +
    `A FRASE do post é: «${frase}». A imagem ENCARNA a SITUAÇÃO concreta da frase (o sítio, o objeto, o momento da vida real de hoje), nunca um fundo decorativo desligado.\n` +
    `ESTÉTICA (premium, editorial, como a Soulab): fotografia de arte conceptual de GAMA ALTA, nítida e marcante, contemporânea. CLARA E AREJADA, com luz de DIA abundante e tons claros e suaves, atmosfera leve. Parece uma foto editorial premium de revista, não um fundo escuro de stock.\n` +
    `PROIBIDO (o ar do conteúdo abolido): NADA de escuro, soturno, nocturno, penumbra, quase-preto, sombrio nem atmosfera pesada ou amadora. NADA de velas, chamas, halos, auréolas, santos, ícones religiosos, mandalas, iconografia sagrada ou bizantina, roupa medieval, pinturas antigas ou renascentistas. Sem pessoas a posar, sem rostos, sem texto, sem letras, sem marca de água, sem logótipo.\n` +
    `MOVIMENTO (a imagem vai ser animada depois): inclui um elemento que se mova sozinho de forma natural e contínua (água a ondular, fumo ou vapor a subir, névoa a derivar, cortina ou tecido ao vento, pó num raio de luz, reflexos a tremer, folhagem ao vento). NUNCA uses chama nem vela para isso.\n` +
    `${evita}\n` +
    `Termina com: bright airy editorial fine-art photography, abundant natural daylight, soft light tones, premium and clean, NOT dark, vertical 9:16. Devolve SÓ o prompt, numa linha, em inglês, sem aspas.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 320, system: sys, messages: [{ role: 'user', content: 'Escreve o prompt da imagem, claramente diferente dos já usados.' }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  let t = ((await res.json())?.content?.[0]?.text ?? '').trim().replace(/^["«»]+|["«»]+$/g, '');
  if (!t) throw new Error('vazio');
  if (!/9:16/.test(t)) t += ', vertical 9:16';
  return limparTravessoes(t);
}
