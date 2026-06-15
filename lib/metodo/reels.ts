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

  // ───────────────────────── DUALIDADE · só da conta-mãe ─────────────────────────
  // O 7.º véu (Os Sete Véus, Véu 7), a raiz comum: a separação, o vidro, a
  // solidão que nenhuma companhia cura. As portas não o cobrem, é território da mãe.
  {
    id: 'dual-01',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Estou rodeada de gente e, mesmo assim, sinto-me só.',
    sala: 'Esta solidão não é falta de companhia. É a sensação de estar sempre do lado de fora, separada por um vidro fino que ninguém vê.',
    fundoCena: 'a lit window seen from outside at dusk, warm life within glass, one figureless room, contemplative',
    fonte: 'OS-7-VEUS-v2.md l.304',
    destaque: ['um vidro fino'],
    revelacaoForte: true,
  },
  {
    id: 'dual-02',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Tenho tudo e ainda assim sinto uma solidão de fundo que nada preenche.',
    sala: 'Não falta gente à volta. Falta a experiência de pertencer, e essa não se resolve juntando mais pessoas à ilha.',
    fundoCena: 'a small island of warm light in a vast calm dark sea, seen from afar, serene',
    fonte: 'OS-7-VEUS-v2.md l.304',
    destaque: ['pertencer'],
  },
  {
    id: 'dual-03',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Vivo as relações a fazer contas: quanto dei, quanto recebi, quem ficou a dever.',
    sala: 'Quando te sentes separada, o outro é ameaça ou recurso. Quando o véu afrouxa, passa a ser outra forma da mesma vida que também és tu.',
    fundoCena: 'two streams of warm light merging into one in deep shadow, symbolic, calm',
    fonte: 'OS-7-VEUS-v2.md l.316',
    destaque: ['a mesma vida'],
  },
  {
    id: 'dual-04',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Sinto o mundo como algo que me acontece de fora, contra o qual me defendo.',
    sala: 'Procura a fronteira onde acabas tu e começa o mundo. Quanto mais a procuras, menos a encontras, porque ela nunca existiu a não ser como ideia.',
    fundoCena: 'a soft horizon where dark sea dissolves into pale sky with no clear line between them',
    fonte: 'OS-7-VEUS-v2.md l.312',
    destaque: ['nunca existiu'],
  },
  {
    id: 'dual-05',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Ao pé do mar ou na natureza sinto uma paz que não sei explicar.',
    sala: 'É a separação a afrouxar. Por instantes, tu e a vida não são duas coisas que se encontram, mas uma só que nunca se chegou a dividir.',
    fundoCena: 'gentle morning light over a still vast sea, one luminous calm expanse, breath of gold',
    fonte: 'OS-7-VEUS-v2.md l.314',
    destaque: ['nunca se chegou a dividir'],
  },
  {
    id: 'dual-06',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'No fundo de tudo, sinto que estou sozinha contra a vida.',
    sala: 'Eu sou porque nós somos. Nunca estiveste à parte. Eras já, antes de teres nome, pura pertença.',
    fundoCena: 'countless points of warm light woven into one quiet constellation in deep blue dark',
    fonte: 'OS-7-VEUS-v2.md l.314',
    destaque: ['pura pertença'],
    revelacaoForte: true,
  },
  {
    id: 'dual-07',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Tenho um medo de fundo que está sempre lá, mesmo sem motivo.',
    sala: 'Só teme de verdade quem se julga sozinho e à parte. Quando te lembras de que pertences, o medo perde o chão onde assentava.',
    fundoCena: 'dark clouds parting to reveal a calm warm sky behind them, the ground steady below',
    fonte: 'OS-7-VEUS-v2.md l.316',
    destaque: ['perde o chão'],
    revelacaoForte: true,
  },
  {
    id: 'dual-08',
    conta: 'mae',
    veu: 'Dualidade',
    porta: 'Falta-me sempre qualquer coisa que não sei nomear, e já desisti de a procurar.',
    sala: 'O que procuras não é uma meta lá à frente. É a casa por baixo de todos os véus, e que nunca deixaste verdadeiramente de habitar.',
    fundoCena: 'an open doorway from a dim room onto warm radiant light, a threshold home, cinematic',
    fonte: 'OS-7-VEUS-v2.md l.322',
    destaque: ['nunca deixaste'],
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

// Palavras da PORTA (a dor) a realçar a ouro. Antes deixávamos a dor "limpa",
// mas a Vivianne quer realce SEMPRE: a frase no ecrã tem de ter um ponto de
// aterragem. Aqui cai sobre a ferida (a palavra que dói), não sobre a resposta.
export const DESTAQUE_PORTA: Record<string, string[]> = {
  'ver-01': ['não desliga'],
  'ver-02': ['ainda nem chegou'],
  'ver-03': ['negligente'],
  'ver-04': ['fico pior'],
  'ver-05': ['um filme antigo'],
  'ver-06': ['sempre a mesma coisa'],
  'ver-07': ['nunca chegou'],
  'ver-08': ['trair'],
  'vir-01': ['acorda na mesma'],
  'vir-02': ['culpa surda'],
  'vir-03': ['receber'],
  'vir-04': ['quem me segure a mim'],
  'vir-05': ['silêncio'],
  'vir-06': ['não encontre nada'],
  'vir-07': ['o vazio'],
  'vir-08': ['ninguém ajuda'],
  'viver-01': ['nunca chega'],
  'viver-02': ['nunca bebo mesmo o café'],
  'viver-03': ['a ânsia da próxima'],
  'viver-04': ['trinta anos'],
  'viver-05': ['quem seria eu'],
  'viver-06': ['entretanto mudou'],
  'viver-07': ['nos dias bons'],
  'viver-08': ['mudei de ideias'],
  'dual-01': ['só'],
  'dual-02': ['solidão de fundo'],
  'dual-03': ['contas'],
  'dual-04': ['me defendo'],
  'dual-05': ['não sei explicar'],
  'dual-06': ['sozinha contra a vida'],
  'dual-07': ['sempre lá'],
  'dual-08': ['não sei nomear'],
};

/** Destaque da porta (a dor no ecrã): curado, com recurso ao heurístico. */
export function destaquePortaDe(reel: Reel): string[] {
  const cur = DESTAQUE_PORTA[reel.id];
  if (cur && cur.length) return cur;
  return realceAuto(reel.porta);
}

// Heurístico de realce (fallback p/ linhas geradas pela IA ou novas): escolhe a
// "aterragem" da frase, a última expressão com peso (1 a 3 palavras), saltando
// pontuação e palavras-função no fim. Garante que NUNCA fica sem realce.
const PALAVRAS_FUNCAO = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'e', 'ou', 'que', 'se', 'me', 'te', 'lhe', 'nos',
  'por', 'para', 'com', 'sem', 'ao', 'aos', 'à', 'às', 'mais', 'já', 'mas', 'como',
  'eu', 'tu', 'ela', 'ele', 'minha', 'meu', 'tua', 'teu', 'sua', 'seu', 'isto', 'isso',
]);
export function realceAuto(texto: string): string[] {
  const limpo = texto.replace(/[«»"“”]/g, '').trim();
  const tokens = limpo.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const ehFuncao = (w: string) => PALAVRAS_FUNCAO.has(w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, ''));
  // recua até à última palavra "cheia" (não-função, sem pontuação terminal forte).
  let fim = tokens.length - 1;
  while (fim > 0 && ehFuncao(tokens[fim].replace(/[.,;:!?]+$/, ''))) fim -= 1;
  // junta até 2 palavras anteriores se também forem cheias (uma expressão).
  let ini = fim;
  while (ini > 0 && fim - ini < 2 && !ehFuncao(tokens[ini - 1].replace(/[.,;:!?]+$/, '')) && !/[.,;:!?]$/.test(tokens[ini - 1])) ini -= 1;
  const frase = tokens.slice(ini, fim + 1).join(' ').replace(/[.,;:!?]+$/, '');
  return frase ? [frase] : [];
}

/** Texto no ecrã: a dor entre aspas (a voz dela, 1.ª pessoa) e, a seguir, a
 *  revelação (a resposta). As aspas marcam a mudança de voz para não confundir;
 *  o typewriter revela a dor primeiro e a sala depois (que aterra a ouro). */
export function fraseDoReel(reel: Reel): string {
  return `«${reel.porta}» ${reel.sala}`;
}

export function reelsDaConta(conta: ContaId): Reel[] {
  if (conta === 'mae') {
    // a mãe é o PILAR transversal: fala de TODOS os 7 véus. INTERCALA os véus
    // (um véu diferente por post) para a semana mostrar a largura do método e
    // NÃO sair de um véu só (nem duplicar a semana de uma porta). A Dualidade
    // vem à cabeça (é a assinatura dela, território que nenhuma porta cobre).
    const ordem = ['Dualidade', 'Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência'];
    const porVeu = ordem.map((v) => REELS.filter((r) => r.veu === v));
    const out: Reel[] = [];
    for (let i = 0, vivos = true; vivos; i++) {
      vivos = false;
      for (const arr of porVeu) if (i < arr.length) { out.push(arr[i]); vivos = true; }
    }
    return out;
  }
  return REELS.filter((r) => r.conta === conta);
}

export function getReel(id: string): Reel | undefined {
  return REELS.find((r) => r.id === id);
}
