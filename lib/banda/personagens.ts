// "Cá em Casa" — a família recorrente da banda desenhada didática (limites no
// dia a dia). 3 gerações: dá para mostrar padrões herdados, lealdades, ordens.
// Avatares ILUSTRADOS (consistentes, sem cara real — a Vivianne não dá cara).

export type EstiloCabelo = 'apanhado' | 'comprido' | 'medio' | 'curto' | 'tufo';

export type Personagem = {
  id: string;
  nome: string;
  papel: string;        // o que representa (para o Claude e para a UI)
  skin: string;         // tom de pele
  cabelo: string;       // cor do cabelo
  estilo: EstiloCabelo; // forma do cabelo
  roupa: string;        // cor da roupa (paleta da marca)
  crianca?: boolean;    // desenha mais pequeno
};

export const FAMILIA: Personagem[] = [
  { id: 'nina', nome: 'Nina', papel: 'adulta — aprende a pôr limites sem culpa. O espelho de quem vê.', skin: '#E8C4A0', cabelo: '#3A2A1E', estilo: 'comprido', roupa: '#7E9B8E' },
  { id: 'alice', nome: 'Avó Alice', papel: 'a voz herdada: "no meu tempo dizia-se sempre que sim". Lealdades invisíveis.', skin: '#E6C2A2', cabelo: '#CFC7BC', estilo: 'apanhado', roupa: '#B89A6E' },
  { id: 'teresa', nome: 'Teresa', papel: 'a mãe, geração-ponte: cuida de todos, esquece-se de si.', skin: '#E8C6A4', cabelo: '#7A4A2E', estilo: 'medio', roupa: '#B05C38' },
  { id: 'rui', nome: 'Rui', papel: 'o par/irmão: o lado do dar e receber, reciprocidade saudável.', skin: '#D8B086', cabelo: '#2E2218', estilo: 'curto', roupa: '#3A4A6A' },
  { id: 'to', nome: 'Tó', papel: 'o miúdo: onde os padrões se plantam; o espelho inocente.', skin: '#EDCBA6', cabelo: '#4A3320', estilo: 'tufo', roupa: '#D8A24A', crianca: true },
];

export function getPersonagem(id: string): Personagem | undefined {
  return FAMILIA.find((p) => p.id === id);
}
