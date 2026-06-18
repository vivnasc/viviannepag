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
import { REFERENCIAS } from './referencias';
import type { Personagem } from './personagens';
import { getFormatoConta } from './formatos-conta';
import { limparTravessoes } from '@/lib/texto';

export type TipoPeca = 'descoberta' | 'profundidade';

export interface BeatSB { tempo: string; imagem: string; texto: string }
export interface Storyboard { tipo: TipoPeca; beats: BeatSB[]; envio: string }

const lp = (s: unknown) => limparTravessoes(String(s ?? '').replace(/^["«»]+|["«»]+$/g, '').trim());

export async function gerarStoryboard(conta: ContaId, tipo: TipoPeca, veu: VeuNome, personagem: Personagem, apiKey: string, evitar: string[] = [], clarificar = false): Promise<Storyboard> {
  const c = CONTAS[conta];
  const a = c.atmosfera;
  const f = VEU_FACES[veu];
  const fmt = getFormatoConta(conta, tipo);
  const ref = REFERENCIAS[veu];
  const veste = `Símbolos do universo desta conta (usa-os nas imagens, em movimento): ${a.elementos.slice(0, 12).join(' · ')}. Cores/luz: ${a.prompt}.`;

  const sys = `Escreves o STORYBOARD de um reel curto (9:16, ~12-20s) de uma marca de psicologia (Método VS · @${c.handle}). Sem rosto, sem pessoas. A mulher reconhece-se em 1 segundo.

A MECÂNICA (igual em todas as peças): faca partida no 1.º segundo · a imagem começa a mexer ao serviço do gesto · raiz no meio · volta no fim · ENVIO que aponta para UMA pessoa concreta.

O FORMATO PRÓPRIO DESTA CONTA E DESTA PEÇA (${fmt.nome}) — é isto que a distingue das outras contas, segue à risca: ${fmt.registo}

A VESTE (o que distingue esta conta): ${veste}
Cada beat tem uma IMAGEM feita destes símbolos, EM MOVIMENTO (o movimento é o gesto a acontecer, não fundo bonito). A imagem transforma-se ao longo dos beats.

O ASSUNTO de hoje (partilhado por todas as contas; muda só a forma):
- VÉU (o mecanismo, NÃO o nomeies no texto): ${f?.dor ?? veu}
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
