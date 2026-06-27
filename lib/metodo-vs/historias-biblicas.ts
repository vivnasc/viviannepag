// MÉTODO VS · A HISTÓRIA ANTIGA (mãe). NÃO é uma conta cristã nem versículos de
// inspiração: é reler as histórias mais antigas do mundo pela LENTE dos véus e das
// lealdades de sobrevivência. A cena bíblica é o ESPELHO; o que sai é o método.
//
// REGRA DE OURO: a LEITURA é da Vivianne (o mecanismo que ela vê na cena). O Claude
// NÃO inventa leituras — só o motor que as transforma em reel. Esta lista é a
// CURADORIA dela: cresce aqui, com as leituras dela.
//
// As primeiras são as que ela escreveu (jun 2026, a intuição da conta mãe).

import { type VeuNome } from '@/lib/metodo/contas';

export interface HistoriaBiblica {
  id: string;
  historia: string;   // o nome da cena (ex.: "Marta e Maria")
  veu: VeuNome;       // o véu que a história espelha (escolha dela)
  leitura: string;    // A LEITURA DELA: o mecanismo humano que a cena esconde
  referencia?: string; // a passagem (só profundidade/contexto; NUNCA citada como inspiração)
}

export const HISTORIAS_BIBLICAS: HistoriaBiblica[] = [
  {
    id: 'marta-maria',
    historia: 'Marta e Maria',
    veu: 'Esforço',
    leitura: 'a mulher que acredita que o amor se conquista pelo serviço; "Senhor, não te importas que eu esteja sozinha a servir?"',
    referencia: 'Lucas 10:38-42',
  },
  {
    id: 'filho-prodigo',
    historia: 'O filho pródigo',
    veu: 'Permanência',
    leitura: 'não é só o perdão: é quem sou eu sem o papel que desempenhava; pertencer antes de merecer',
    referencia: 'Lucas 15:11-32',
  },
  {
    id: 'mana-deserto',
    historia: 'O maná no deserto',
    veu: 'Horizonte',
    leitura: 'recolher apenas o suficiente para hoje; a luta contra o "mais tarde", contra guardar para a fome que ainda não veio',
    referencia: 'Êxodo 16',
  },
  {
    id: 'pedro-agua',
    historia: 'Pedro a afundar-se na água',
    veu: 'Turbilhão',
    leitura: 'talvez não seja falta de fé: é o momento exato em que a mente volta a tentar assumir o controlo',
    referencia: 'Mateus 14:22-33',
  },
];

export const getHistoria = (id: string): HistoriaBiblica | undefined => HISTORIAS_BIBLICAS.find((h) => h.id === id);
