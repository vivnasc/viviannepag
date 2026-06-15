// Método VS · biblioteca de reels (porta → sala): canon de conteúdo
//
// Garimpado dos manuais (VER/VIR/VIVER-SOLTAR-PT.md), fiel ao texto.
// Cada reel obedece à regra de ouro do GLOSSARIO-DOR-METODO-VS.md:
//   entra pela DOR (porta: 1.ª pessoa, reconhecível em 3 segundos)
//   fecha pela REVELAÇÃO (sala: o aforismo, a recompensa, o conceito).
//
// Travessões BANIDOS. Cada reel leva um fundo ÚNICO (família das capas + cena
// própria), nunca repetido, para não achatar o feed.

import { ContaId, VeuNome, FUNDO_FAMILIA } from './contas';

export interface Reel {
  /** id estável: conta + nº. */
  id: string;
  conta: ContaId;
  veu: VeuNome;
  /** A porta: a dor na 1.ª pessoa (o gancho). */
  porta: string;
  /** A sala: a revelação/aforismo (a recompensa, no fim). */
  sala: string;
  /** A cena única do fundo (combina-se com FUNDO_FAMILIA). */
  fundoCena: string;
  /** Citação de origem (manual + linha aproximada). */
  fonte: string;
  /** Palavras da sala a realçar a ouro. Se vazio, usa DESTAQUE_POR_REEL. */
  destaque?: string[];
  /** Aforismo forte o suficiente para ser post de revelação por si só (30%). */
  revelacaoForte?: boolean;
}

/** Prompt completo do fundo deste reel (cena própria + família comum). */
export function fundoPrompt(reel: Reel): string {
  return `${reel.fundoCena}. ${FUNDO_FAMILIA}`;
}

export const REELS: Reel[] = [
  // ───────────────────────────── VER · a consciência ─────────────────────────────
  {
    id: 'ver-01',
    conta: 'ver',
    veu: 'Turbilhão',
    porta: 'A minha cabeça não desliga, sobretudo à noite.',
    sala:
      'A mente produz pensamentos como o estômago produz sumo gástrico. O problema nunca foi teres pensamentos: é estares lá dentro.',
    fundoCena:
      'a dark bedroom window at night, a faint warm glow far beyond the glass, deep stillness',
    fonte: 'VER-SOLTAR-PT.md l.27',
    revelacaoForte: true,
  },
  {
    id: 'ver-02',
    conta: 'ver',
    veu: 'Turbilhão',
    porta:
      'Defendo-me de ataques que ninguém me fez e resolvo dez vezes um problema que ainda nem chegou.',
    sala: 'Tinha sofrido tudo, exceto o que de facto aconteceu.',
    fundoCena: 'a still dark lake before dawn, mist over the water, one thin band of gold',
    fonte: 'VER-SOLTAR-PT.md l.53',
  },
  {
    id: 'ver-03',
    conta: 'ver',
    veu: 'Turbilhão',
    porta: 'Acho que, se me deixasse de ralar, estaria a ser negligente.',
    sala:
      'O amor verdadeiro não é a preocupação que te tira o sono. É a presença que está, inteira, com quem está à tua frente agora.',
    fundoCena: 'a single warm candle flame held in a vast dark room, soft halo of gold',
    fonte: 'VER-SOLTAR-PT.md l.59',
  },
  {
    id: 'ver-04',
    conta: 'ver',
    veu: 'Turbilhão',
    porta: 'Tento parar a cabeça à força e fico pior.',
    sala:
      'Não és a tempestade. És o céu por onde ela passa. As nuvens passam, o céu fica.',
    fundoCena: 'a wide night sky with slow clouds passing, calm, a break of warm light behind them',
    fonte: 'VER-SOLTAR-PT.md l.65',
    revelacaoForte: true,
  },
  {
    id: 'ver-05',
    conta: 'ver',
    veu: 'Memória',
    porta:
      'Alguém demora a responder e eu já vivi a tarde inteira dentro de um filme antigo.',
    sala: 'Não te lembras do que aconteceu. Lembras-te da última vez que te lembraste.',
    fundoCena: 'an old empty theatre with a dim warm stage light, dust in the air, deep shadow',
    fonte: 'VER-SOLTAR-PT.md l.77',
    revelacaoForte: true,
  },
  {
    id: 'ver-06',
    conta: 'ver',
    veu: 'Memória',
    porta: 'Sou péssima a escolher homens, comigo é sempre a mesma coisa.',
    sala: 'Não era um diagnóstico. Era um feitiço que ela própria renovava em cada relação.',
    fundoCena: 'a still antique mirror reflecting a single candle flame, warm gold on dark glass',
    fonte: 'VER-SOLTAR-PT.md l.81',
  },
  {
    id: 'ver-07',
    conta: 'ver',
    veu: 'Memória',
    porta: 'Vivo em alerta por um perigo que, quando olho para a minha vida, nunca chegou.',
    sala:
      'Carregas a vigia de uma sentinela de outra geração, num posto onde a guerra já acabou há muito.',
    fundoCena: 'an empty stone watchtower at first light, calm fields below, warm dawn',
    fonte: 'VER-SOLTAR-PT.md l.99',
  },
  {
    id: 'ver-08',
    conta: 'ver',
    veu: 'Memória',
    porta: 'Sinto que largar o meu sofrimento seria trair quem o viveu comigo.',
    sala: 'Pertencer à minha família não me obriga a herdar a sua tristeza.',
    fundoCena: 'a single ancient tree with deep visible roots, warm gold light through the branches',
    fonte: 'VER-SOLTAR-PT.md l.83',
  },

  // ───────────────────────────── VIR · o regresso ─────────────────────────────
  {
    id: 'vir-01',
    conta: 'vir',
    veu: 'Esforço',
    porta: 'Tenho um cansaço que dorme oito horas e acorda na mesma.',
    sala:
      'Não era o cansaço de quem trabalhou muito. Era o peso de me sentir responsável pela felicidade de toda a gente.',
    fundoCena: 'an unmade bed at dawn, soft grey and gold light through a window, quiet',
    fonte: 'VIR-SOLTAR-PT.md l.53',
    revelacaoForte: true,
  },
  {
    id: 'vir-02',
    conta: 'vir',
    veu: 'Esforço',
    porta:
      'Se me sento sem nada para fazer, sobe-me uma culpa surda, como se o descanso fosse uma dívida a pagar com juros.',
    sala: 'O fazer é a fuga mais aplaudida do mundo.',
    fundoCena: 'a single empty chair in a warm pool of light, surrounded by deep shadow',
    fonte: 'VIR-SOLTAR-PT.md l.13',
    revelacaoForte: true,
  },
  {
    id: 'vir-03',
    conta: 'vir',
    veu: 'Esforço',
    porta: 'É-me mais fácil dar do que receber: um elogio deixa-me sem saber onde me pôr.',
    sala:
      'Receber implicava acreditar numa coisa que me assusta: que eu era suficiente sem nada oferecer em troca.',
    fundoCena: 'a simple empty bowl filling with warm golden light, dark tender background',
    fonte: 'VIR-SOLTAR-PT.md l.49',
  },
  {
    id: 'vir-04',
    conta: 'vir',
    veu: 'Esforço',
    porta: 'Carrego a mágoa de ser sempre eu a segurar, e quase nunca ter quem me segure a mim.',
    sala:
      'As mãos que toda a vida apanharam os outros antes da queda podem pousar, enfim, sobre o teu próprio colo.',
    fundoCena: 'a soft cupped hollow of warm golden light cradled in deep shadow, like a held nest',
    fonte: 'VIR-SOLTAR-PT.md l.37',
  },
  {
    id: 'vir-05',
    conta: 'vir',
    veu: 'Desolação',
    porta: 'Mal o silêncio se instala, corro a tapá-lo antes mesmo de o sentir por inteiro.',
    sala: 'O que conheces não é o silêncio, é o pânico de o anteceder.',
    fundoCena: 'a quiet dark room with one unlit lamp, a thin sliver of warm light under a door',
    fonte: 'VIR-SOLTAR-PT.md l.71',
  },
  {
    id: 'vir-06',
    conta: 'vir',
    veu: 'Desolação',
    porta: 'Tenho medo de que, se parar e olhar para dentro, não encontre nada.',
    sala: 'O que te parece falta é, tantas vezes, espaço para algo teu que ainda não nasceu.',
    fundoCena: 'dark fertile soil cradling a single seed, a faint warm glow within the earth',
    fonte: 'VIR-SOLTAR-PT.md l.75',
    revelacaoForte: true,
  },
  {
    id: 'vir-07',
    conta: 'vir',
    veu: 'Desolação',
    porta: 'Fico em relações que já não me fazem bem só para não enfrentar o vazio depois delas.',
    sala:
      'É só quem aprende a estar bem sozinha que deixa de se agarrar às relações por medo, e passa a estar nelas por escolha.',
    fundoCena: 'a still deep well seen from above, calm water below holding a circle of warm light',
    fonte: 'VIR-SOLTAR-PT.md l.77',
  },
  {
    id: 'vir-08',
    conta: 'vir',
    veu: 'Esforço',
    porta: 'Organizo tudo e depois queixo-me, exausta, de que ninguém ajuda.',
    sala:
      'Treinaste toda a gente a não te ajudar, porque ninguém faz tão bem nem tão depressa como tu.',
    fundoCena: 'a long table laid for many, warm candlelight, all the chairs empty',
    fonte: 'VIR-SOLTAR-PT.md l.55',
  },

  // ───────────────────────────── VIVER · a integração ─────────────────────────────
  {
    id: 'viver-01',
    conta: 'viver',
    veu: 'Horizonte',
    porta: 'Estou sempre de mala feita à porta de um comboio que nunca chega.',
    sala: 'A sala de espera era a viagem.',
    fundoCena: 'an empty railway platform at dawn, warm light along the tracks, no train',
    fonte: 'VIVER-SOLTAR-PT.md l.53',
    revelacaoForte: true,
  },
  {
    id: 'viver-02',
    conta: 'viver',
    veu: 'Horizonte',
    porta: 'Bebo o café já a pensar no que vou fazer a seguir, e por isso nunca bebo mesmo o café.',
    sala: 'Vives uma vida inteira de momentos atravessados, nenhum deles vivido por completo.',
    fundoCena: 'a single steaming cup of coffee on a table by a window, soft morning gold',
    fonte: 'VIVER-SOLTAR-PT.md l.63',
  },
  {
    id: 'viver-03',
    conta: 'viver',
    veu: 'Horizonte',
    porta: 'Chego a uma meta e, em vez de paz, sinto um vazio breve e logo a ânsia da próxima.',
    sala:
      'O "lá" é um lugar onde não se chega, como a linha onde o céu toca o mar e que recua a cada passo que damos na sua direção.',
    fundoCena: 'a far horizon where dark sea meets sky, a single thin line of warm gold light',
    fonte: 'VIVER-SOLTAR-PT.md l.55',
    revelacaoForte: true,
  },
  {
    id: 'viver-04',
    conta: 'viver',
    veu: 'Horizonte',
    porta: 'Digo "para o ano" há trinta anos, com toda a sinceridade, todos os anos.',
    sala: 'A vida toda esteve sempre a acontecer no único tempo de que andavas ausente.',
    fundoCena: 'old calendar pages turning in warm dim light, deep shadow around them',
    fonte: 'VIVER-SOLTAR-PT.md l.39',
  },
  {
    id: 'viver-05',
    conta: 'viver',
    veu: 'Permanência',
    porta: 'Seguro essa frase sobre mim com as duas mãos, porque quem seria eu sem ela.',
    sala: 'Tu não és as folhas. És o que permanece quando elas caem.',
    fundoCena: 'a tall tree letting golden leaves fall in still autumn air, calm, warm light',
    fonte: 'VIVER-SOLTAR-PT.md l.83',
    revelacaoForte: true,
  },
  {
    id: 'viver-06',
    conta: 'viver',
    veu: 'Permanência',
    porta: 'A frase que repito sobre mim já me aperta como roupa de um corpo que entretanto mudou.',
    sala:
      'A árvore não tem medo do outono. Deixa cair, fica nua, descansa, e na primavera dá folhas novas.',
    fundoCena: 'a soft garment resting over the back of a chair, warm shadow, quiet room',
    fonte: 'VIVER-SOLTAR-PT.md l.83',
  },
  {
    id: 'viver-07',
    conta: 'viver',
    veu: 'Permanência',
    porta: 'Sou a forte, a que aguenta, a que não desaba, e ninguém me procura nos dias bons.',
    sala: 'A armadura era para um perigo que já passou.',
    fundoCena: 'an empty suit of armour standing in a dim hall, one warm shaft of light',
    fonte: 'VIVER-SOLTAR-PT.md l.117',
  },
  {
    id: 'viver-08',
    conta: 'viver',
    veu: 'Permanência',
    porta: 'Prefiro manter-me igual a vida toda a admitir que mudei de ideias.',
    sala:
      'Deixas de ser uma estátua empenhada em manter-se igual e voltas a ser um rio, capaz de mudar de curso sem deixar de ser água.',
    fundoCena: 'a calm river bending through dark land, the bend holding a long reflection of gold',
    fonte: 'VIVER-SOLTAR-PT.md l.183',
  },
];

// Palavras da "sala" a realçar a ouro (o pagamento da revelação, no fim).
// Mantém-se curto: 1 a 3 expressões por reel, sempre da frase-revelação.
export const DESTAQUE_POR_REEL: Record<string, string[]> = {
  'ver-01': ['lá dentro'],
  'ver-02': ['exceto'],
  'ver-03': ['presença'],
  'ver-04': ['o céu fica'],
  'ver-05': ['lembraste'],
  'ver-06': ['feitiço'],
  'ver-07': ['sentinela'],
  'ver-08': ['herdar'],
  'vir-01': ['responsável'],
  'vir-02': ['fuga', 'aplaudida'],
  'vir-03': ['suficiente'],
  'vir-04': ['o teu próprio colo'],
  'vir-05': ['pânico'],
  'vir-06': ['ainda não nasceu'],
  'vir-07': ['por escolha'],
  'vir-08': ['Treinaste'],
  'viver-01': ['a viagem'],
  'viver-02': ['atravessados'],
  'viver-03': ['recua'],
  'viver-04': ['ausente'],
  'viver-05': ['quando elas caem'],
  'viver-06': ['não tem medo do outono'],
  'viver-07': ['já passou'],
  'viver-08': ['um rio'],
};

export function destaqueDoReel(id: string): string[] {
  return DESTAQUE_POR_REEL[id] ?? [];
}

/** Destaque de um reel: o próprio (se definido) ou o do mapa. */
export function destaqueDe(reel: Reel): string[] {
  return reel.destaque ?? DESTAQUE_POR_REEL[reel.id] ?? [];
}

/** Texto no ecrã: a dor entre aspas (a voz dela, 1.ª pessoa) e, a seguir, a
 *  revelação (a resposta). As aspas marcam a mudança de voz para não confundir;
 *  o typewriter revela a dor primeiro e a sala depois (que aterra a ouro). */
export function fraseDoReel(reel: Reel): string {
  return `«${reel.porta}» ${reel.sala}`;
}

export function reelsDaConta(conta: ContaId): Reel[] {
  if (conta === 'mae') return REELS; // a mãe é transversal: todos os véus
  return REELS.filter((r) => r.conta === conta);
}

export function getReel(id: string): Reel | undefined {
  return REELS.find((r) => r.id === id);
}
