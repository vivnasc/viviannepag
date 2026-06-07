// Os cursos (pos-graduacoes) da Vivianne — dimensao DIDATICA dos infograficos
// (substitui os universos da loja nesta linha; sem CTA, so conhecimento).
import type { Mundo } from '@/lib/estudio-conteudo';

export type Curso = {
  id: string;
  nome: string;
  descricao: string;
  mundo: Mundo;       // paleta visual
  conceitos: string[]; // conceitos didaticos sugeridos (das disciplinas)
};

export const CURSOS: Curso[] = [
  {
    id: 'transpessoal',
    nome: 'Psicologia Transpessoal',
    descricao: 'Bio · psíquico · social · espiritual. Oriente e Ocidente em diálogo.',
    mundo: 'escola',
    conceitos: [
      'Bio-psico-social-espiritual',
      'Oriente encontra Ocidente',
      'Arquétipos e símbolos (Jung)',
      'Regressão e memória',
      'A mandala como mapa interno',
      'Estados ampliados de consciência',
      'O Self transpessoal',
    ],
  },
  {
    id: 'constelacao',
    nome: 'Constelação Familiar Sistémica',
    descricao: 'Bert Hellinger e as Ordens do Amor. A pessoa dentro dos seus sistemas.',
    mundo: 'synchim',
    conceitos: [
      'As Ordens do Amor',
      'O direito de pertencer',
      'A ordem: quem veio primeiro',
      'Dar e receber em equilíbrio',
      'Lealdades invisíveis',
      'Substituição de papéis',
      'Identificar-se com um excluído',
      'O campo morfogenético',
    ],
  },
  {
    id: 'espiritualidade',
    nome: 'Psicologia e Espiritualidade',
    descricao: 'Espiritualidade como sentido, propósito e qualidade de vida.',
    mundo: 'autora',
    conceitos: [
      'Espiritualidade não é religião',
      'Sentido e propósito (Frankl)',
      'Niilismo e o vazio',
      'Bem-estar espiritual',
      'Espiritualidade na clínica',
      'Emoções e autoconhecimento',
    ],
  },
  {
    id: 'desenvolvimento',
    nome: 'Desenvolvimento Pessoal e Profissional',
    descricao: 'Cadeira comum aos 3: carreira, comunicação e saúde do cuidador.',
    mundo: 'infonte',
    conceitos: [
      'Inteligência emocional',
      'Burnout do cuidador',
      'Comunicar com presença',
      'Saúde mental de quem cuida',
      'Liderança que cuida',
    ],
  },
];

export function getCurso(id: string): Curso {
  return CURSOS.find((c) => c.id === id) ?? CURSOS[0];
}
