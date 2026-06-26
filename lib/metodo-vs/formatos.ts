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
    angulo: 'Uma frase única, nua e serena: o lado do SOLTAR, não o diagnóstico. Uma verdade pequena que liberta, entendida à primeira leitura (o peso que se pode pousar, a permissão de não merecer o cuidado, quem se é por baixo do que se aprendeu a ser). A FORMA muda de dia para dia (constatação serena, permissão direta, imagem do quotidiano, pequena inversão de um adquirido, pergunta leve), nunca o mesmo molde dois dias seguidos.',
    materia: (k) => `Verdades que libertam (a crença que solta):\n${lista(k.crencas?.map((c) => c.verdade))}\nLeitura transpessoal: ${k.lentes.transpessoal}`,
  },
  nome: {
    id: 'nome', nome: 'O nome que te deram', emoji: '🔤',
    angulo: 'O movimento é RENOMEAR. Há uma palavra que a pessoa carrega como se fosse a verdade sobre quem é (um rótulo que lhe deram cedo e ela aceitou). Pega nessa palavra e revela o que ela sempre tapou, vestido de vida, até a palavra deixar de a definir e a história inteira mudar de significado. O peso está na viragem do significado, não em provar nada.',
    materia: (k) => `Essência: ${k.essencia}\nLeitura transpessoal: ${k.lentes.transpessoal}`,
  },
  heranca: {
    id: 'heranca', nome: 'A herança', emoji: '🧬',
    angulo: 'O ângulo do que VEIO DE ANTES: isto não começou nela. Revela, vestido de vida, que o que ela faz hoje já se fazia antes dela, que está a cumprir um acordo que ninguém lhe explicou, a ser leal a alguém que nem conheceu. Mostra-o pela cena e pela linhagem, nunca pela teoria; nunca uses as palavras herança, lealdade ou sistema.',
    materia: (k) => `Leitura sistémica (constelação): ${k.lentes.constelacao}\nDe onde vem:\n${lista(k.origens)}`,
  },
  baixo: {
    id: 'baixo', nome: 'O que está por baixo', emoji: '🌊',
    angulo: 'Pega num gesto tão comum que ninguém repara nele e revela o que ele anda mesmo a proteger, na linguagem da vida (nunca em teoria). Não descreves o gesto nem o explicas: mostras o que ele guarda por baixo, aquilo que a pessoa nunca chamaria pelo nome. A revelação é a distância entre o gesto pequeno e o medo grande que ele esconde.',
    materia: (k) => `O que está por baixo (traduz para a vida, nunca teoria):\n${lista(k.mecanismos)}`,
  },
  custo: {
    id: 'custo', nome: 'O custo invisível', emoji: '🕯️',
    angulo: 'Revela o preço silencioso que este padrão cobra, sem o nomear como custo nem o transformar em aviso. O que se perde sem se dar conta, devagar, ao lado do que parecia uma virtude. Mostra a fatura escondida dentro do que toda a gente elogia. Termina no eco que fica, não na lição.',
    materia: (k) => `Custos (veste-os de vida):\n${lista(k.custos)}`,
  },
  mito: {
    id: 'mito', nome: 'Mito vs verdade', emoji: '🪞',
    angulo: 'Há uma frase que a pessoa repete a si mesma há tanto tempo que já a tem como facto. Pega nessa certeza e abre-lhe uma fenda, com cuidado, até ela deixar de ter o peso de verdade. Não é mito contra verdade em duas colunas secas: é tirar o chão a uma crença antiga e pôr outra coisa no lugar, mais leve. Nunca abras com a palavra talvez.',
    materia: (k) => `Crenças (a comum -> a que liberta):\n${lista(k.crencas?.map((c) => `${c.pensa}  ->  ${c.verdade}`))}`,
  },
  cena: {
    id: 'cena', nome: 'A cena', emoji: '🎬',
    angulo: 'Uma cena pequena do dia a dia, mostrada como quem aponta para ela sem comentar. Não a interpretas (isto significa X): pousas a cena e, ao lado, deixas cair o que ela sempre foi por baixo, numa única viragem. A cena ilumina, não se explica. Em 3.ª pessoa, tão concreta que a pessoa vê a divisão da casa onde acontece.',
    materia: (k) => `Cenas (inspira-te, NÃO copies):\n${lista(k.cenas, 5)}`,
  },
  corpo: {
    id: 'corpo', nome: 'O que fica no corpo', emoji: '🫧',
    angulo: 'O ângulo do corpo: o alarme antigo que continua ligado num presente que já é seguro. O corpo lembra-se de um perigo que a vida já não tem, e continua de guarda por lealdade a um tempo que passou. Revela, sem jargão, que a pessoa está a proteger-se de algo que já não está cá. Mostra-o num gesto físico concreto, não numa explicação.',
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
  // MANHÃ (10h30) = o Sinal da manhã (um frame, uma frase, o soltar) todos os dias.
  // TARDE (16h) = o reel da revelação, ângulo a rodar pela semana. Horas da mãe.
  { wd: 1, nome: 'segunda', hora: '10:30', formato: 'dissolucao' },
  { wd: 1, nome: 'segunda', hora: '16:00', formato: 'nome' },
  { wd: 2, nome: 'terça', hora: '10:30', formato: 'dissolucao' },
  { wd: 2, nome: 'terça', hora: '16:00', formato: 'heranca' },
  { wd: 3, nome: 'quarta', hora: '10:30', formato: 'dissolucao' },
  { wd: 3, nome: 'quarta', hora: '16:00', formato: 'baixo' },
  { wd: 4, nome: 'quinta', hora: '10:30', formato: 'dissolucao' },
  { wd: 4, nome: 'quinta', hora: '16:00', formato: 'mito' },
  { wd: 5, nome: 'sexta', hora: '10:30', formato: 'dissolucao' },
  { wd: 5, nome: 'sexta', hora: '16:00', formato: 'custo' },
  { wd: 6, nome: 'sábado', hora: '10:30', formato: 'dissolucao' },
  { wd: 6, nome: 'sábado', hora: '16:00', formato: 'cena' },
  { wd: 0, nome: 'domingo', hora: '10:30', formato: 'dissolucao' },
  { wd: 0, nome: 'domingo', hora: '16:00', formato: 'corpo' },
];

// ROTAÇÃO DOS ÂNGULOS DA TARDE POR SEMANA (a "espiral" da decisão #9). O véu roda
// 1/dia em ciclo de 7 e fica PRESO ao dia da semana — sem isto, cada véu via sempre
// o MESMO ângulo (o Turbilhão só "mito"/pensar). Aqui o ângulo da tarde avança uma
// casa por semana: dentro de cada semana saem os 7 ângulos à mesma, mas ao longo de
// 7 semanas cada véu passa por TODAS as faces (mito, custo, cena, corpo, origem…).
const ANGULOS_TARDE: FormatoId[] = ['nome', 'heranca', 'baixo', 'mito', 'custo', 'cena', 'corpo'];
const BASE_WD: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
export function formatoTarde(wd: number, segunda: Date): FormatoId {
  const semana = Math.floor(segunda.getTime() / (7 * 864e5)); // nº de semanas desde a época
  const base = BASE_WD[wd] ?? 0;
  return ANGULOS_TARDE[(base + semana) % ANGULOS_TARDE.length];
}
