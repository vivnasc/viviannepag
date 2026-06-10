// ARENAS (lentes de vida) da veu.a.veu. O CONCEITO da semana (planoEditorial)
// é a espinha universal e fica intacto; a ARENA é ONDE esse conceito aterra: o
// lar, a relação, o trabalho, a maternidade, o corpo. A mesma lei sistémica,
// lida em escalas diferentes da vida. Família é a casa-base; as outras arenas
// entram devagar e só onde o conceito as pede de forma natural.
//
// REGRA DE VOZ (não violar, vale para TODAS as arenas, sobretudo a organizacional):
// a arena é onde o conceito aterra, NUNCA um recado a uma pessoa concreta (chefe,
// sogra, parceiro, colega). Fala-se sempre de PADRÕES e do MEU LUGAR, de dentro
// para fora. Tom de dignidade, pertença e inteireza; nunca vitimismo, ressentimento,
// culpa ou pôr a culpa no outro. Ninguém é vilão, ninguém é vítima. Ensina para
// evoluir, não para acusar.

export type Arena = {
  id: string;
  nome: string;   // nome curto para a UI
  emoji: string;
  cor: string;    // cor da arena (distinta das cores das matérias)
  lente: string;  // COMO o conceito aterra aqui (guia o gerador)
  base?: boolean; // a casa-base (família)
};

export const ARENAS: Arena[] = [
  {
    id: 'pessoal', nome: 'Pessoal / Família', emoji: '🏠', cor: '#D98E73', base: true,
    lente: 'a casa-base: o conceito vivido na origem, no lar e em quem somos. As heranças da família, o lugar de cada um no sistema familiar.',
  },
  {
    id: 'casal', nome: 'Casal / Relação', emoji: '💞', cor: '#C96A8E',
    lente: 'o conceito na relação amorosa: o que circula entre dois, o dar e o receber a par, o lugar de cada um na relação.',
  },
  {
    id: 'organizacional', nome: 'Trabalho / Organizacional', emoji: '💼', cor: '#6E8BB0',
    lente: 'o conceito lido no trabalho e na carreira como sistema (as ordens da pertença, da ordem e do equilíbrio aplicadas à organização). SEMPRE de dentro para fora: o meu lugar, a minha postura, o que é meu carregar e o que pertence à instituição. Nunca um recado a um chefe ou colega; fala-se do padrão, não de pessoas.',
  },
  {
    id: 'maternidade', nome: 'Maternidade', emoji: '🤱', cor: '#B98AC9',
    lente: 'o conceito na maternidade: a dupla pertença, o cuidar sem se perder, a sobrecarga sistémica e a transmissão entre gerações.',
  },
  {
    id: 'saude', nome: 'Saúde / Corpo', emoji: '🌿', cor: '#8FB96B',
    lente: 'o conceito no corpo e na saúde: o sintoma (cansaço, tensão, exaustão) como mensagem e pedido de equilíbrio, nunca como fraqueza.',
  },
];

export function getArena(id: string): Arena {
  return ARENAS.find((a) => a.id === id) ?? ARENAS[0];
}

export const ARENA_BASE = ARENAS.find((a) => a.base) ?? ARENAS[0];
