// Método VS · REFERÊNCIAS por véu — o poço fundo que torna o conteúdo "infinito".
//
// FONTE: as CADEIRAS da Vivianne (Pensamento Sistémico · Transpessoal ·
// Psicologia e Espiritualidade · Constelação Familiar), e referências culturais
// REAIS e verificáveis que ilustram cada padrão. NÃO é a voz dela, não inventa
// biografia: é matéria-prima para a IA encontrar ângulos NOVOS sem repetir.
//
// Os 2 livros "A Extraordinária Arte de Tirar o Véu" e "O Véu da Escassez" são
// inspiração externa (NÃO são da autoria dela) e por isso NÃO entram aqui.
//
// Como se usa: conceitos/estudos alimentam o ÂNGULO (a IA usa para pensar, não
// para citar na frase brusca da manhã); autores/livros/filmes servem os formatos
// de PROFUNDIDADE da tarde (exemplos, mecanismo, origem). Tudo separado de
// lib/veu/* — é o motor do método.

import { VeuNome } from './contas';

export interface ReferenciasVeu {
  conceitos: string[]; // conceitos reais do campo (psicológicos/filosóficos/sistémicos)
  autores: string[];   // pensadores reais
  estudos: string[];   // estudos/efeitos reais e verificáveis
  livros: string[];    // título — autor (obras reais)
  filmes: string[];    // título (ano) que ilustra o padrão
}

export const REFERENCIAS: Partial<Record<VeuNome, ReferenciasVeu>> = {
  Turbilhão: {
    conceitos: ['normose', 'ruminação mental', 'causalidade circular do pensamento', 'mente errante', 'neuroticismo (reatividade ansiosa)'],
    autores: ['Hans Eysenck', 'Blaise Pascal'],
    estudos: ['Killingsworth e Gilbert (2010): a mente que vagueia é uma mente infeliz'],
    livros: ['O Poder do Agora — Eckhart Tolle', 'Pensar, Depressa e Devagar — Daniel Kahneman'],
    filmes: ['Soul (2020)', 'A Vida Secreta de Walter Mitty (2013)'],
  },
  Memória: {
    conceitos: ['emaranhamento', 'lealdades invisíveis', 'transmissão geracional', 'padrões transgeracionais', 'memória involuntária'],
    autores: ['Bert Hellinger', 'Murray Bowen', 'Ivan Boszormenyi-Nagy', 'Carl Jung', 'Marcel Proust'],
    estudos: ['linha de investigação sobre trauma transgeracional'],
    livros: ['O Corpo Acusa o Golpe — Bessel van der Kolk', 'Em Busca do Tempo Perdido — Marcel Proust'],
    filmes: ['O Despertar da Mente (Eternal Sunshine, 2004)', 'Encanto (2021)'],
  },
  Esforço: {
    conceitos: ['equilíbrio entre dar e receber', 'necessidade de pertença e estima', 'falso self', 'resposta de apaziguamento (fawn)'],
    autores: ['Bert Hellinger', 'Abraham Maslow', 'Donald Winnicott'],
    estudos: ['esgotamento do cuidador (caregiver burnout)'],
    livros: ['Mulheres que Correm com os Lobos — Clarissa Pinkola Estés', 'A Coragem de Ser Imperfeito — Brené Brown', 'A Árvore Generosa — Shel Silverstein'],
    filmes: ['Espanglês (Spanglish, 2004)', 'Tudo Sobre a Minha Mãe (1999)'],
  },
  Desolação: {
    conceitos: ['desamparo (Hilflosigkeit)', 'a dimensão que emerge no vazio', 'niilismo', 'solidão como questão de saúde'],
    autores: ['Sigmund Freud', 'Viktor Frankl', 'Søren Kierkegaard', 'Albert Camus'],
    estudos: ['Holt-Lunstad: o isolamento social como fator de saúde'],
    livros: ['Em Busca de Sentido — Viktor Frankl', 'O Mito de Sísifo — Albert Camus'],
    filmes: ['O Amor é um Lugar Estranho (Lost in Translation, 2003)', 'Her (2013)'],
  },
  Horizonte: {
    conceitos: ['sentido presente vs. adiado', 'fé condicional vs. incondicional', 'propósito próprio vs. sonho herdado', 'autorrealização adiada'],
    autores: ['Viktor Frankl', 'Abraham Maslow', 'Séneca'],
    estudos: ['a falácia da chegada (a meta que nunca basta)'],
    livros: ['Sobre a Brevidade da Vida — Séneca', 'O Alquimista — Paulo Coelho'],
    filmes: ['Em Nome do Amor (About Time, 2013)', 'Click (2006)'],
  },
  Permanência: {
    conceitos: ['caminho Borboleta vs. Serpente', 'homeostase vs. mudança real (1.ª e 2.ª ordem)', '"estar" vs. "ser"', 'individuação'],
    autores: ['Carl Jung', 'Ken Wilber', 'Heráclito'],
    estudos: ['estados de identidade (James Marcia)'],
    livros: ['As Passagens da Vida — Gail Sheehy', 'A Metamorfose — Franz Kafka'],
    filmes: ['Birdman (2014)', 'Frozen (2013)'],
  },
  Dualidade: {
    conceitos: ['dualismo vs. interligação', 'universalidade (interconexão de tudo)', 'paradigma sistémico vs. cartesiano', 'alteridade', 'Maya e Brahman'],
    autores: ['David Bohm', 'Fritjof Capra', 'Amit Goswami', 'Alan Watts'],
    estudos: [],
    livros: ['O Tao da Física — Fritjof Capra', 'O Livro: Sobre o Tabu de Saber Quem És — Alan Watts'],
    filmes: ['Matrix (1999)', 'A Árvore da Vida (2011)'],
  },
};
