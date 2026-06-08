// "Cá em Casa" — a família recorrente da banda desenhada didática (limites no
// dia a dia). Avatares ILUSTRADOS com Open Peeps (DiceBear): consistentes por
// construção (as mesmas opções dão sempre a mesma cara), CC0, sem cara real.
//
// Consistência pedida pela Vivianne:
//  - PELE ÚNICA para a família toda (são uma família, não "raças" diferentes).
//    Mexe-se num só sítio (SKIN) para clarear/escurecer/estilizar tudo de uma vez.
//  - Distinguem-se por cabelo + roupa + expressão, não por etnia.

// Tom de pele partilhado por toda a família (um só valor, ajustável aqui).
export const SKIN = '#E4B98E';

// Expressões Open Peeps usadas (há ~30; estas cobrem o tom do Cá em Casa).
export type Expressao =
  | 'calm' | 'smile' | 'explaining' | 'concerned' | 'old' | 'cute'
  | 'serious' | 'solemn' | 'tired' | 'lovingGrin1' | 'cheeky';

// Penteados Open Peeps usados pela família (literais, p/ casar com a API).
export type Penteado = 'long' | 'grayBun' | 'bun' | 'short1' | 'short3';

export type Personagem = {
  id: string;
  nome: string;
  papel: string;        // o que representa (para o Claude e para a UI)
  head: Penteado;       // penteado Open Peeps (silhueta consistente)
  hair: string;         // cor do cabelo (headContrastColor)
  cloth: string;        // cor da roupa (paleta da marca)
  face: Expressao;      // expressão por defeito (quando não há "modo")
  crianca?: boolean;    // desenha mais pequeno
};

export const FAMILIA: Personagem[] = [
  { id: 'nina', nome: 'Nina', papel: 'adulta — aprende a pôr limites sem culpa. O espelho de quem vê.', head: 'long', hair: '#2E2018', cloth: '#7E9B8E', face: 'concerned' },
  { id: 'alice', nome: 'Avó Alice', papel: 'a voz herdada: "no meu tempo dizia-se sempre que sim". Lealdades invisíveis.', head: 'grayBun', hair: '#CFC7BC', cloth: '#B89A6E', face: 'old' },
  { id: 'teresa', nome: 'Teresa', papel: 'a mãe, geração-ponte: cuida de todos, esquece-se de si.', head: 'bun', hair: '#6E4326', cloth: '#B05C38', face: 'explaining' },
  { id: 'rui', nome: 'Rui', papel: 'o par/irmão: o lado do dar e receber, reciprocidade saudável.', head: 'short1', hair: '#2A2018', cloth: '#3A4A6A', face: 'smile' },
  { id: 'to', nome: 'Tó', papel: 'o miúdo (rapaz, criança): onde os padrões se plantam; o espelho inocente.', head: 'short3', hair: '#4A3320', cloth: '#D8A24A', face: 'cute', crianca: true },
];

export function getPersonagem(id: string): Personagem | undefined {
  return FAMILIA.find((p) => p.id === id);
}

// Mapeia o "modo" da fala para uma expressão Open Peeps (a cara acompanha a fala).
export function expressaoDoModo(p: Personagem, modo?: string): Expressao {
  if (modo === 'pensa') return 'concerned';
  if (modo === 'fala') return p.crianca ? 'cute' : 'explaining';
  return p.face;
}
