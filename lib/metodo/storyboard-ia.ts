// Universo VS · gerador de STORYBOARD de uma peça (à mecânica + veste da conta).
//
// Uma peça = um reel curto à ANATOMIA (faca partida no 1.º segundo · a imagem mexe
// ao serviço do gesto · raiz no meio · volta no fim · envio para uma pessoa). A
// MECÂNICA é igual em todas as contas; a VESTE (símbolos + cores) é a do universo
// da conta (contas.ts → atmosfera). Devolve um storyboard: beats { tempo, imagem,
// texto }, mais o envio. SÓ texto/indicações; a imagem gera-se depois.
//
// Dois tipos (2 posts/dia):
//   descoberta (manhã): faca FRAGMENTADA (a frase parte-se em pedaços), rápida,
//     SEM voz (texto no ecrã). Fura para estranhos.
//   profundidade (noite): VOZ-OFF contínua, a imagem transforma-se, raiz/origem
//     mais funda. Retém quem já segue.

import { VeuNome, ContaId, CONTAS } from './contas';
import { VEU_FACES } from './veu-faces';
import { SABER } from './saber';
import { REFERENCIAS } from './referencias';
import type { Personagem } from './personagens';
import { getFormatoConta } from './formatos-conta';
import { VEU_COR } from './universo';
import { limparTravessoes } from '@/lib/texto';

export type TipoPeca = 'descoberta' | 'profundidade';

export interface BeatSB { tempo: string; imagem: string; texto: string }
export interface Storyboard { tipo: TipoPeca; beats: BeatSB[]; envio: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

// O METAMODELO do método (a teoria por baixo de tudo: "Estratégias de
// Sobrevivência"). Cada véu/padrão NÃO é um defeito: foi, na origem, uma
// estratégia que te protegeu (lealdade, segurança, pertença). Por isso o SOLTAR
// não é lutar contra o padrão, é HONRAR a estratégia (reconhecer que te serviu,
// agradecer) e largá-la sem força, porque o presente já não a pede. Regra de
// ouro: não há soltar sem ver. Esta lente atravessa TODAS as contas e dá o tom
// da raiz e da volta (sem culpa, sem combate).
const METAMODELO =
  'O METAMODELO (a teoria por baixo, NUNCA a nomeies no texto): este padrão não ' +
  'é um defeito. Foi, na origem, uma estratégia de sobrevivência que te protegeu ' +
  '(era lealdade, segurança, pertença). Por isso a VOLTA nunca luta contra o ' +
  'padrão nem o julga: reconhece que te serviu, honra-o, agradece em silêncio, e ' +
  'só então o solta, sem força, porque o presente já não o pede. Não há soltar ' +
  'sem ver. A raiz mostra-se sem culpa; a saída é largar, não vencer.';

export async function gerarStoryboard(conta: ContaId, tipo: TipoPeca, veu: VeuNome, personagem: Personagem, apiKey: string, evitar: string[] = [], clarificar = false): Promise<Storyboard> {
  const c = CONTAS[conta];
  const a = c.atmosfera;
  const f = VEU_FACES[veu];
  const fmt = getFormatoConta(conta, tipo);
  const ref = REFERENCIAS[veu];
  const k = SABER[veu];
  // SABER = a fonte-chave (a área de estudo dela): muitas faces da dor por véu.
  // É o que dá ângulos concretos e infinitos. Alimenta o motor sempre.
  const materia = k
    ? `comportamentos: ${k.comportamentos.slice(0, 5).join(' · ')}; cenas do dia a dia: ${k.cenas.slice(0, 4).join(' · ')}; custos: ${k.custos.slice(0, 3).join(' · ')}; mecanismos: ${k.mecanismos.slice(0, 3).join(' · ')}; origens: ${k.origens.slice(0, 3).join(' · ')}`
    : (f?.dor ?? veu);
  // A COR é SÓ a do VÉU do dia (sequência dos chakras). NÃO existe paleta de cor
  // por conta (foi banida): a cor da imagem é sempre a do véu. A conta entra com
  // os SÍMBOLOS e o MOOD (a sensação, sem cor). Veste a IMAGEM, nunca o texto.
  const cor = VEU_COR[veu];
  const veste = `A COR é a do VÉU de hoje e SÓ essa (não existe paleta de cor por conta, foi banida): ${cor.pt} (${cor.prompt}). Toda a imagem segue esta cor. Os SÍMBOLOS do universo desta conta (é o que distingue a conta, junto com o formato; rende-os NESTA cor do véu, em movimento): ${a.elementos.slice(0, 12).join(' · ')}. O MOOD da conta (a sensação, nunca a cor): ${a.sensacao}; ${a.fraseVisual}. Textura: painterly, fine grain, em movimento.`;
  // A VOZ própria da conta = o que define o CONTEÚDO (não a cor). A confissão
  // recorrente (fraseMae), as sensações que se repetem e o verbo de chegada são a
  // identidade SENTIDA em qualquer post da porta. A mãe é a vista panorâmica (não
  // tem fraseMae): aí a voz é o método inteiro, em 1.ª pessoa.
  const voz = c.fraseMae
    ? `A VOZ desta conta (é ISTO, não a cor, que define o conteúdo): a confissão recorrente que tem de ressoar em QUALQUER post desta porta é "${c.fraseMae}". As sensações que se repetem: ${(c.sensacoes ?? []).join(' · ')}. O movimento de chegada (o fim a que esta porta leva): ${c.chegada ?? ''}. Toda a peça reforça esta mesma voz, em qualquer ordem.`
    : `A VOZ desta conta (a mãe): a vista panorâmica do método inteiro, em 1.ª pessoa, quem nomeia o padrão com clareza serena. É a voz, não a cor, que define o conteúdo.`;

  const sys = `Escreves o STORYBOARD de um reel curto (9:16, ~12-20s) de uma marca de psicologia (Método VS · @${c.handle}). Sem rosto, sem pessoas. A mulher reconhece-se em 1 segundo.

A MECÂNICA (igual em todas as peças): faca partida no 1.º segundo · a imagem começa a mexer ao serviço do gesto · raiz no meio · volta no fim · ENVIO que aponta para UMA pessoa concreta.

${METAMODELO}

O FORMATO PRÓPRIO DESTA CONTA E DESTA PEÇA (${fmt.nome}) — é isto que a distingue das outras contas, segue à risca: ${fmt.registo}

${voz}

A VESTE (só veste a IMAGEM, NUNCA define o conteúdo do texto): ${veste}
Cada beat tem uma IMAGEM feita destes símbolos, EM MOVIMENTO (o movimento é o gesto a acontecer, não fundo bonito). A imagem transforma-se ao longo dos beats.

O ASSUNTO de hoje (partilhado por todas as contas; muda só a forma):
- VÉU (o mecanismo, NÃO o nomeies no texto): ${f?.dor ?? veu}
- MATÉRIA-PRIMA do SABER (a área de estudo dela — a fonte-chave; usa para encontrar um ângulo concreto e NOVO, NÃO copies à letra): ${materia}
- A pessoa que se reconhece: ${personagem.nome}. Diz coisas como: ${personagem.frases.map((x) => `"${x}"`).join('; ')}. A sombra: ${personagem.sombra}
- A origem/raiz (para a profundidade): ${f?.fuga ?? ''} ${f?.culpa ?? ''}
- A saída/volta (a direção concreta): ${f?.saida ?? ''}

${ref?.conceitos?.length ? `CAMPO DE ESTUDO (conceitos reais das cadeiras/pós-graduações dela, SÓ para TU pensares mais fundo; NUNCA os nomeies nem uses jargão/autores no texto): ${ref.conceitos.join(' · ')}${ref.estudos?.length ? ` · ${ref.estudos.join(' · ')}` : ''}.` : ''}

REGRAS DE VOZ (duras): português europeu, concreto, do dia a dia (carga mental de 2026). SEM metáforas no texto (nada de alma, universo, água, tempestade). SEM testemunho ("fui eu") nem biografia. Fala na 2.ª pessoa ou descreve em 3.ª. SEM travessões. SEM aspas. SEM hashtags. Cada frase tem de fazer sentido SOZINHA (sem pronomes ambíguos: evita "isso", "aquilo", "ela", "ele" sem dizer a quê/a quem).
O ENVIO é implícito ou aponta para uma pessoa concreta ("Marca a que…" / "Já sabes em quem pensaste").
${clarificar ? 'CLARIFICA: reescreve mais claro e direto, tirando qualquer ambiguidade, sem perder a dor.' : ''}
${evitar.length ? `NÃO repitas estes ângulos/frases já usados (encontra outro): ${evitar.slice(-12).map((e) => `"${e}"`).join('; ')}.` : ''}

Devolve SÓ JSON válido: {"beats":[{"tempo":"0-1s","imagem":"o que se vê (na veste, em movimento)","texto":"o que aparece no ecrã ou a voz-off"}, ...],"envio":"..."} com ${fmt.beats} beats.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 900, system: sys, messages: [{ role: 'user', content: `Storyboard ${tipo} para @${c.handle}, véu ${veu}, ${personagem.nome}.` }] }),
  });
  if (!res.ok) throw new Error(`claude ${res.status}`);
  const txt = ((await res.json())?.content?.[0]?.text ?? '').trim();
  let o: { beats?: Array<{ tempo?: string; imagem?: string; texto?: string }>; envio?: string } = {};
  try { const m = txt.match(/\{[\s\S]*\}/); o = JSON.parse(m ? m[0] : txt); } catch { /* fallback */ }
  const beats: BeatSB[] = (o.beats ?? []).map((b) => ({ tempo: lp(b.tempo), imagem: lp(b.imagem), texto: lp(b.texto) })).filter((b) => b.texto || b.imagem);
  if (!beats.length) throw new Error('sem storyboard');
  return { tipo, beats, envio: lp(o.envio) };
}
