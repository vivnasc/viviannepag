// A GRANDE TRANSIÇÃO — o conceito que INTEGRA toda a biblioteca das Ciências da
// Consciência Emergente (knowledge/ONTOLOGIA.md). É a ESPINHA da conta crescer (a mãe):
// a passagem entre dois modos de organizar a experiência — a Humanidade da Sobrevivência
// e a Humanidade da Emergência. NÃO é um antes/depois no calendário: os dois modos
// convivem dentro da MESMA pessoa, e a transição é a coluna nova deixar de ser excepção
// rara e começar a poder organizar a vida.
//
// Antes, a geração misturava 4 fontes ao mesmo tempo (livro dos 7 movimentos + 7 Sinais
// + domínios + veia) e DILUÍA tudo numa papa genérica — e a Grande Transição, que é a
// espinha, nunca entrava sequer no prompt. Daí "gerei 20 posts e não senti nada da grande
// transição". Esta lente dá a CADA peça UM movimento concreto (um par de pólos), para o
// conhecimento dar a DIREÇÃO e o livro dar a VOZ vivida, juntos e focados, não diluídos.
//
// NUNCA nomear "Grande Transição" nem os pólos no texto que sai (sai em linguagem de vida).

export interface PoloTransicao { de: string; para: string; gancho: string }

export const GRANDE_TRANSICAO_TESE =
  'Grande parte daquilo a que chamamos "ser assim" é adaptação a milhares de anos de sobrevivência, escassez e ameaça. ' +
  'A próxima mudança humana não é biológica nem tecnológica: é a consciência reorganizar-se à volta da criação, da interdependência e do sentido. ' +
  'Os dois modos convivem dentro da mesma pessoa; a passagem é o modo novo deixar de ser excepção rara e começar a poder organizar a vida.';

// Os SEIS movimentos da transição (knowledge/ONTOLOGIA.md, "os dois pólos"): da coluna
// da Sobrevivência (de) para a coluna da Emergência (para). O gancho é a cena de vida
// real onde o pólo antigo ainda agarra — para a peça DRAMATIZAR, não teorizar.
export const POLOS_TRANSICAO: PoloTransicao[] = [
  { de: 'escassez', para: 'criação', gancho: 'viver como se nunca houvesse o bastante, mesmo quando já há, em vez de criar a partir do que há' },
  { de: 'esforço', para: 'cooperação', gancho: 'provar o valor pelo cansaço e sozinha, em vez de receber e construir com outros' },
  { de: 'controlo', para: 'exploração', gancho: 'agarrar o conhecido por medo, em vez de poder abrir mão e descobrir' },
  { de: 'acumulação', para: 'consciência', gancho: 'juntar mais (coisas, certezas, papéis) para se sentir segura, em vez de habitar o que já é' },
  { de: 'identidade rígida', para: 'significado', gancho: 'segurar-se a um "eu sou assim" fixo, mesmo quando já não serve, em vez do que faz sentido agora' },
  { de: 'pertença tribal', para: 'interdependência', gancho: 'caber no grupo ao preço de si, em vez de pertencer inteira entre iguais' },
];

export function poloDaTransicao(seed = 0): PoloTransicao {
  const L = POLOS_TRANSICAO.length;
  return POLOS_TRANSICAO[(((Math.floor(seed) % L) + L) % L)];
}

// Bloco pronto a injetar na geração: a TESE + UM movimento concreto (o pólo desta peça).
// A peça tem de FAZER SENTIR a mão antiga a agarrar e a frincha do modo novo a abrir,
// em cena de vida real, sem nomear pólos nem teoria.
export function lenteDaTransicao(seed = 0): string {
  const p = poloDaTransicao(seed);
  return `${GRANDE_TRANSICAO_TESE}\nO MOVIMENTO DESTA PEÇA (a passagem a fazer sentir, NUNCA a nomear): da ${p.de} para a ${p.para} — ${p.gancho}. ` +
    `Mostra a mão antiga (a ${p.de}) ainda a agarrar, e a frincha do modo novo (a ${p.para}) a abrir-se; em cena de vida real, sem teoria, sem nomear os pólos.`;
}
