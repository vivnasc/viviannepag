// MÉTODO VS · os FORMATOS da conta mãe (do zero). Como os "tipos" do Soulab, mas com
// a VOZ DA REVELAÇÃO e organizados por um CALENDÁRIO. Cada formato é um ÂNGULO
// diferente sobre o mesmo véu — para que os posts diários sejam VÁRIOS e diferentes,
// nunca repetitivos. Todos partilham a VOZ (revelar, não explicar); muda o ÂNGULO e a
// FACETA do SABER de onde cada um bebe.

import type { SaberVeu } from '@/lib/metodo/saber';

export type FormatoId = 'nome' | 'heranca' | 'baixo' | 'custo' | 'mito' | 'cena' | 'corpo';

export interface FormatoVS {
  id: FormatoId;
  nome: string;     // como aparece no admin
  emoji: string;
  angulo: string;   // a instrução do ângulo (acima da voz comum da revelação)
  materia: (k: SaberVeu) => string; // a faceta do SABER que este ângulo usa
}

const lista = (arr: string[] | undefined, n = 4) => (arr ?? []).slice(0, n).map((x) => `· ${x}`).join('\n');

export const FORMATOS: Record<FormatoId, FormatoVS> = {
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

// O CALENDÁRIO da mãe: vários posts por dia, formatos diferentes, a rodar pela semana
// (é o que distingue da Soulab: a mãe segue um plano). 2 por dia, manhã e fim de tarde.
// wd: getDay() (0=domingo). A véu roda à parte (1 véu/dia), para variar ainda mais.
export const CALENDARIO: { wd: number; nome: string; hora: string; formato: FormatoId }[] = [
  { wd: 1, nome: 'segunda', hora: '11:00', formato: 'nome' },
  { wd: 1, nome: 'segunda', hora: '19:00', formato: 'cena' },
  { wd: 2, nome: 'terça', hora: '11:00', formato: 'heranca' },
  { wd: 2, nome: 'terça', hora: '19:00', formato: 'baixo' },
  { wd: 3, nome: 'quarta', hora: '11:00', formato: 'mito' },
  { wd: 3, nome: 'quarta', hora: '19:00', formato: 'custo' },
  { wd: 4, nome: 'quinta', hora: '11:00', formato: 'corpo' },
  { wd: 4, nome: 'quinta', hora: '19:00', formato: 'nome' },
  { wd: 5, nome: 'sexta', hora: '11:00', formato: 'cena' },
  { wd: 5, nome: 'sexta', hora: '19:00', formato: 'heranca' },
  { wd: 6, nome: 'sábado', hora: '11:00', formato: 'custo' },
  { wd: 0, nome: 'domingo', hora: '19:00', formato: 'mito' },
];
