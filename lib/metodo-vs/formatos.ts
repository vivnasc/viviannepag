// MÉTODO VS · os FORMATOS da conta mãe (do zero). Como os "tipos" do Soulab, mas com
// a VOZ DA REVELAÇÃO e organizados por um CALENDÁRIO. Cada formato é um ÂNGULO
// diferente sobre o mesmo véu — para que os posts diários sejam VÁRIOS e diferentes,
// nunca repetitivos. Todos partilham a VOZ (revelar, não explicar); muda o ÂNGULO e a
// FACETA do SABER de onde cada um bebe.

import type { SaberVeu } from '@/lib/metodo/saber';
import { CONTAS, type ContaId } from '@/lib/metodo/contas';
import { limparTravessoes } from '@/lib/texto';

export type FormatoId = 'dissolucao' | 'nome' | 'heranca' | 'baixo' | 'custo' | 'mito' | 'cena' | 'corpo';

export interface FormatoVS {
  id: FormatoId;
  nome: string;     // como aparece no admin
  emoji: string;
  angulo: string;   // a instrução do ângulo (acima da voz comum da revelação)
  materia: (k: SaberVeu) => string; // a faceta do SABER que este ângulo usa
}

const lista = (arr: string[] | undefined, n = 4) => (arr ?? []).slice(0, n).map((x) => `· ${x}`).join('\n');

export const FORMATOS: Record<FormatoId, FormatoVS> = {
  // A MANHÃ: NÃO um reel da revelação (isso é a tarde), mas UM frame, UMA frase — o
  // sinal de um véu a dissolver-se. O lado do SOLTAR: nu, sereno, leve. Tratado à parte
  // no gerador (frase única, não momentos).
  dissolucao: {
    id: 'dissolucao', nome: 'Sinal da manhã', emoji: '🌅',
    angulo: 'Uma frase única, nua e serena: o sinal de um véu a dissolver-se. O lado do SOLTAR, não o diagnóstico. Uma verdade pequena que liberta (o peso que se pode pousar, a permissão de não merecer o cuidado, quem se é por baixo do que se aprendeu a ser).',
    materia: (k) => `Verdades que libertam (a crença que solta):\n${lista(k.crencas?.map((c) => c.verdade))}\nLeitura transpessoal: ${k.lentes.transpessoal}`,
  },
  nome: {
    id: 'nome', nome: 'O nome que te deram', emoji: '🔤',
    angulo: 'Pega no NOME COMUM que se dá a este padrão (uma palavra que a pessoa carrega como verdade sobre si) e RENOMEIA-o, vestido de vida. "Chamam-lhe X… mas é Y." A história inteira muda de significado.',
    materia: (k) => `Essência: ${k.essencia}\nLeitura transpessoal: ${k.lentes.transpessoal}`,
  },
  heranca: {
    id: 'heranca', nome: 'A herança', emoji: '🧬',
    angulo: 'O ângulo SISTÉMICO: isto não começou nela. Revela, vestido de vida, que o que ela faz foi uma lealdade antiga, algo que veio de antes. Nunca uses as palavras "herança", "lealdade", "sistema" — mostra-o.',
    materia: (k) => `Leitura sistémica (constelação): ${k.lentes.constelacao}\nDe onde vem:\n${lista(k.origens)}`,
  },
  baixo: {
    id: 'baixo', nome: 'O que está por baixo', emoji: '🌊',
    angulo: 'Pega num gesto comum e revela o que está MESMO por baixo dele, na linguagem da vida (nunca em teoria). Não descreves o gesto: reveles o que ele protege.',
    materia: (k) => `O que está por baixo (traduz para a vida, nunca teoria):\n${lista(k.mecanismos)}`,
  },
  custo: {
    id: 'custo', nome: 'O custo invisível', emoji: '🕯️',
    angulo: 'Revela o preço silencioso que este padrão cobra, sem o nomear como custo. O que se perde sem se dar conta. Termina no eco, não num aviso.',
    materia: (k) => `Custos (veste-os de vida):\n${lista(k.custos)}`,
  },
  mito: {
    id: 'mito', nome: 'Mito vs verdade', emoji: '🪞',
    angulo: 'Pega numa crença comum que a pessoa tem como verdade e vira-a, suavemente ("talvez não fosse bem assim"). Não é "mito: X / verdade: Y" seco — é uma releitura que muda o chão.',
    materia: (k) => `Crenças (a comum -> a que liberta):\n${lista(k.crencas?.map((c) => `${c.pensa}  ->  ${c.verdade}`))}`,
  },
  cena: {
    id: 'cena', nome: 'A cena', emoji: '🎬',
    angulo: 'Uma cena pequena do dia-a-dia que, relida, revela o padrão. Não interpretas a cena ("isto significa X"): mostras a cena e, ao lado, o que ela sempre foi. Em 3.ª pessoa.',
    materia: (k) => `Cenas (inspira-te, NÃO copies):\n${lista(k.cenas, 5)}`,
  },
  corpo: {
    id: 'corpo', nome: 'O que fica no corpo', emoji: '🫧',
    angulo: 'O ângulo do corpo: o alarme antigo que continua ligado num presente que já é seguro. O corpo que não esqueceu. Revela, sem jargão, que a pessoa está leal a uma segurança que já não precisa.',
    materia: (k) => `Leitura transpessoal: ${k.lentes.transpessoal}\nDe onde vem:\n${lista(k.origens, 3)}`,
  },
};

export const FORMATOS_LISTA = Object.values(FORMATOS);

// ─────────────────────────────────────────────────────────────────────────────
// A ÂNCORA DE CADA FILHA (ver · vir · viver)
//
// O que distingue a MÃE das FILHAS (decisão de produto, ver CLAUDE.md):
//  - a MÃE percorre os 7 véus e vários ângulos (roaming) — sem âncora.
//  - cada FILHA tem UMA voz recorrente: TODO o post ancora a revelação na sua
//    fraseMae e nas suas sensações. A pessoa reconhece sempre a mesma confissão,
//    dita de formas diferentes. O véu/ângulo varia; a dor volta sempre à fraseMae.
//  - o fecho/soltar de cada filha aponta para a sua CHEGADA
//    (ver=testemunhar · vir=regressar · viver=participar).
//
// Isto é um BLOCO injetado no system prompt da geração (gerar.ts), por cima da
// matéria do formato e da voz comum da revelação. NÃO substitui a voz: ancora-a.

const lpx = (s: string) => limparTravessoes(s);

/** O bloco-âncora da filha para o reel da revelação (a tarde). Vazio para a mãe. */
export function ancoraConta(conta: ContaId): string {
  if (conta === 'mae') return '';
  const c = CONTAS[conta];
  return lpx(
`A VOZ DESTA CONTA (a âncora · inviolável): esta é a conta "${c.movimento}" (@${c.handle}). Tudo o que escreves, seja qual for o véu ou o ângulo de hoje, tem de fazer a pessoa reconhecer SEMPRE a MESMA confissão recorrente, dita de uma forma nova:

A CONFISSÃO-MÃE (a dor que volta sempre, nunca a cites à letra, encarna-a): "${c.fraseMae}"

As SENSAÇÕES que se repetem nesta conta (a textura emocional; a dor da peça nasce daqui):
${(c.sensacoes ?? []).map((s) => `· ${s}`).join('\n')}

O FECHO (a chegada desta conta): o último movimento da peça aponta para ${c.chegada}. Não como ordem nem promessa; como a direção do alívio, suave.

Importante: o véu e o ângulo de hoje DÃO A IMAGEM E O ENQUADRAMENTO, mas a DOR reconhece-se sempre na confissão-mãe acima. Se a peça pudesse pertencer a outra das contas (Ver, Vir ou Viver), está ERRADA: tem de ser inconfundivelmente a voz de "${c.movimento}".`);
}

/** O bloco-âncora da filha para o sinal da manhã (frase única). Vazio para a mãe. */
export function ancoraContaManha(conta: ContaId): string {
  if (conta === 'mae') return '';
  const c = CONTAS[conta];
  return lpx(
`A VOZ DESTA CONTA (a âncora): esta é a conta "${c.movimento}" (@${c.handle}). A frase única da manhã é o lado do SOLTAR desta dor recorrente:

A CONFISSÃO-MÃE (não a cites à letra; é o que se solta): "${c.fraseMae}"
A CHEGADA desta conta (para onde a frase aponta, em silêncio): ${c.chegada}.

A frase é a permissão pequena que liberta ESTA dor, e só esta. Inconfundivelmente a voz de "${c.movimento}".`);
}

// O CALENDÁRIO da mãe: vários posts por dia, formatos diferentes, a rodar pela semana
// (é o que distingue da Soulab: a mãe segue um plano). 2 por dia, manhã e fim de tarde.
// wd: getDay() (0=domingo). A véu roda à parte (1 véu/dia), para variar ainda mais.
export const CALENDARIO: { wd: number; nome: string; hora: string; formato: FormatoId }[] = [
  // MANHÃ (11h) = o Sinal da manhã (um frame, uma frase, o soltar) todos os dias.
  // FIM DE TARDE (19h) = o reel da revelação, ângulo a rodar pela semana.
  { wd: 1, nome: 'segunda', hora: '11:00', formato: 'dissolucao' },
  { wd: 1, nome: 'segunda', hora: '19:00', formato: 'nome' },
  { wd: 2, nome: 'terça', hora: '11:00', formato: 'dissolucao' },
  { wd: 2, nome: 'terça', hora: '19:00', formato: 'heranca' },
  { wd: 3, nome: 'quarta', hora: '11:00', formato: 'dissolucao' },
  { wd: 3, nome: 'quarta', hora: '19:00', formato: 'baixo' },
  { wd: 4, nome: 'quinta', hora: '11:00', formato: 'dissolucao' },
  { wd: 4, nome: 'quinta', hora: '19:00', formato: 'mito' },
  { wd: 5, nome: 'sexta', hora: '11:00', formato: 'dissolucao' },
  { wd: 5, nome: 'sexta', hora: '19:00', formato: 'custo' },
  { wd: 6, nome: 'sábado', hora: '11:00', formato: 'dissolucao' },
  { wd: 6, nome: 'sábado', hora: '19:00', formato: 'cena' },
  { wd: 0, nome: 'domingo', hora: '11:00', formato: 'dissolucao' },
  { wd: 0, nome: 'domingo', hora: '19:00', formato: 'corpo' },
];
