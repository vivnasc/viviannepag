// CRESCER · crescimento & evolução — motor de conteúdo para a conta da Vivianne
// (vivianne.dos.santos). NÃO é a veu.a.veu (didática), NÃO é a loja, NÃO é o
// Método VS (véus/baralho) e NÃO é a Soulab (impessoal/contemplativa). É a conta
// DELA a falar de crescimento e evolução, com fundamento nas áreas dela, na
// linguagem das dores e das passagens da vida.
//
// Pipeline próprio (lib/crescer/*). O conteúdo vive na MESMA tabela
// (carousel_collections) com theme.marca='crescer'; aparece em Publicar na conta
// vivianne.dos.santos (ver contaDe em lib/instagram/contas.ts), sem tocar nos
// outros motores.
//
// DECISÕES DA VIVIANNE (jun 2026):
// - VOZ DIRETA: fala COM a pessoa, nomeia a cena que ela vive. É o que o público
//   reage (não o enigma a decifrar). Mas com a profundidade dela por baixo.
// - SAIR DOS VÉUS: nada de "Sou Aquela", nada dos 7 véus, nada de títulos-conceito
//   herméticos (MICÉLIO, SUBSOLO). Isso cansou e custou seguidores.
// - LIBERDADE: ela escolhe vários TEMAS × FORMATOS × VISUAIS de uma vez, ou deixa
//   surpreender. As pessoas futuristas são UMA opção visual, não uma regra.
// - SEM vender a alma (Regra de ouro): zero táticas de "viralizar", zero
//   "testemunha", zero posicionar a dor como espetáculo. Verdade, não isco.

export const CRESCER = {
  id: 'crescer',
  handle: 'vivianne.dos.santos',
  nome: 'Crescimento & Evolução',
  emoji: '🌱',
  posicionamento:
    'A conta da Vivianne sobre crescimento e evolução: o que nos prende, o que nos faz ' +
    'repetir, e o que muda quando finalmente vemos. Dito na cara, sem jargão.',
  // identidade visual (terra/luz, quente e viva; distinta do escuro lunar da Soulab).
  paleta: { bg: '#171310', bg2: '#0C0A08', texto: '#F4ECDD', destaque: '#E0B15A', nome: 'Crescer' },
  hashtagsBase: ['#crescimento', '#evolucao', '#autoconhecimento', '#consciencia', '#desenvolvimentopessoal', '#transformacao'],
  // A VOZ (decisão da Vivianne): DIRETA. Fala com a pessoa, nomeia a vida dela.
  voz:
    'voz direta e próxima: fala COM a pessoa (tu), nomeia a cena que ela vive agora, ' +
    'e a seguir abre a saída. Autoridade do caminho (reconheci primeiro em mim), nunca de púlpito.',
  // ÁREAS dela (as cadeiras): dão FUNDAMENTO por baixo. NUNCA nomeadas no texto.
  areas: [
    'Psicologia Transpessoal',
    'Constelação Familiar Sistémica',
    'Psicologia e Espiritualidade',
    'Desenvolvimento Pessoal e Profissional',
  ],
  // ÂNCORAS de profundidade (só para pensar mais fundo; PROIBIDO nomeá-las ou usar
  // jargão/autores no texto). Dão fundura sem virar aula.
  ancoras: [
    'as lealdades invisíveis e as ordens do amor (o que herdamos do sistema familiar)',
    'a integração da sombra, não o combate',
    'a dimensão maior de nós para lá do ego',
    'o sentido que sustenta a travessia da dor',
    'o corpo como mensageiro do que a mente não admite',
    'a passagem da sobrevivência para a vida',
  ],
} as const;

// ---------------------------------------------------------------------------
// TEMÁTICAS — os ângulos de crescimento/evolução, com a base dela por baixo.
// (validadas pela Vivianne). NÃO são os 7 véus.
// ---------------------------------------------------------------------------
export type TematicaId =
  | 'transformacao' | 'raizes' | 'eumaior' | 'sombra' | 'vinculos' | 'sentido' | 'corpo' | 'ciclos';

export interface Tematica {
  id: TematicaId;
  label: string;
  emoji: string;
  descricao: string;
  // a instrução de geração própria (alimenta o prompt da IA), ancorada nas áreas dela.
  foco: string;
}

export const TEMATICAS: Tematica[] = [
  {
    id: 'transformacao', label: 'Transformação', emoji: '🦋',
    descricao: 'Mudar a sério, não só querer mudar.',
    foco: 'A diferença entre querer mudar e mudar mesmo: porque é que repetimos, o que custa largar o que nos é familiar, o que muda quando deixamos de fugir. Concreto, não motivacional.',
  },
  {
    id: 'raizes', label: 'Raízes & herança', emoji: '🌳',
    descricao: 'O que vem do sistema familiar.',
    foco: 'O que herdamos sem escolher: padrões, lealdades, lugares que ocupamos numa família. O que carregamos por amor e que já não é nosso. Sem nomear "constelação" nem jargão.',
  },
  {
    id: 'eumaior', label: 'O eu maior', emoji: '✨',
    descricao: 'Consciência, a dimensão transpessoal.',
    foco: 'A parte de nós maior do que o medo e do que a história pessoal: presença, consciência, o que em nós observa sem se identificar. Aberto e humano, sem misticismo barato nem jargão.',
  },
  {
    id: 'sombra', label: 'Sombra', emoji: '🌑',
    descricao: 'Integrar o que escondemos, não combater.',
    foco: 'O que escondemos de nós (a raiva, a inveja, o desejo, a vergonha) e como isso volta por trás. Integrar em vez de combater. Sem julgamento, com alívio.',
  },
  {
    id: 'vinculos', label: 'Vínculos', emoji: '🤍',
    descricao: 'Relações, dependência, separação.',
    foco: 'Como nos prendemos, o que confundimos com amor, o medo de soltar, a diferença entre ligação e dependência. Nomeia a cena relacional concreta.',
  },
  {
    id: 'sentido', label: 'Sentido', emoji: '🧭',
    descricao: 'Propósito, vocação, o para quê.',
    foco: 'O que dá direção quando a vida perde o chão: propósito, vocação, o para quê que sustenta. Sem clichés de "viva o seu sonho".',
  },
  {
    id: 'corpo', label: 'Corpo & presença', emoji: '🫁',
    descricao: 'Sair da cabeça, habitar o agora.',
    foco: 'O corpo como mensageiro: a tensão, o cansaço, o que sentimos antes de pensar. Sair da cabeça e voltar ao agora. Prático e encarnado.',
  },
  {
    id: 'ciclos', label: 'Ciclos', emoji: '🌗',
    descricao: 'Fins, lutos, recomeços.',
    foco: 'Os fins que não escolhemos, o luto do que acabou, a coragem de recomeçar. O tempo entre o que morreu e o que ainda não nasceu.',
  },
];

export const getTematica = (id: string): Tematica | undefined => TEMATICAS.find((t) => t.id === id);

// ---------------------------------------------------------------------------
// FORMATOS — cada um sai diferente ao olho e na estrutura (validados).
// `multi` = produz vários momentos (carrossel/reel de várias linhas).
// ---------------------------------------------------------------------------
export type FormatoId = 'frase' | 'momentos' | 'pergunta' | 'lista' | 'reflexao' | 'cena';

export interface FormatoCrescer {
  id: FormatoId;
  label: string;
  emoji: string;
  descricao: string;
  multi: boolean;
  // a instrução de estrutura (alimenta o prompt).
  estrutura: string;
}

export const FORMATOS: FormatoCrescer[] = [
  {
    id: 'frase', label: 'Frase única', emoji: '✶', multi: false,
    descricao: '1 imagem forte + 1 frase que para o scroll.',
    estrutura: 'UMA frase curta (1 a 3 linhas), direta, que para o scroll porque a pessoa se reconhece. Densa, com uma virada. Cabe grande num reel 9:16.',
  },
  {
    id: 'momentos', label: 'Momentos', emoji: '🎞', multi: true,
    descricao: 'Várias linhas num arco (reel/carrossel).',
    estrutura: '3 a 5 linhas curtas que constroem UM arco (abre com uma faca que para o scroll, aprofunda, vira, fecha em aberto). Aparecem uma a uma sobre a mesma cena.',
  },
  {
    id: 'pergunta', label: 'Pergunta que fica', emoji: '❓', multi: false,
    descricao: 'Abre com uma pergunta, não responde.',
    estrutura: 'UMA pergunta que a pessoa leva consigo o dia todo. Não respondas. Concreta, sobre a vida dela, nunca retórica vazia.',
  },
  {
    id: 'lista', label: 'Lista', emoji: '📍', multi: true,
    descricao: '"3 sinais de…", "o que ninguém te diz sobre…".',
    estrutura: 'Uma capa-faca ("3 sinais de que…", "o que ninguém te diz sobre…") seguida de 3 a 4 pontos curtos, concretos e reconhecíveis. Cada ponto numa linha. Fecha com uma linha que abre, não que conclui.',
  },
  {
    id: 'reflexao', label: 'Reflexão funda', emoji: '🕯', multi: false,
    descricao: 'Texto mais longo, fundamentado (a tua autoridade).',
    estrutura: 'Uma frase-capa forte para o ecrã, e na legenda uma reflexão mais longa (2 a 3 parágrafos) com a profundidade dela, sempre concreta e na vida real, nunca aula.',
  },
  {
    id: 'cena', label: 'Cena', emoji: '🎬', multi: false,
    descricao: 'Uma situação que se reconhece, e a seguir o alívio.',
    estrutura: 'DOIS tempos: 1) a cena concreta que a pessoa vive AGORA (uma faca que ela reconhece como a vida dela); 2) o virar que a solta. A imagem mostra a cena, não um símbolo a decifrar.',
  },
];

export const getFormato = (id: string): FormatoCrescer | undefined => FORMATOS.find((f) => f.id === id);

// ---------------------------------------------------------------------------
// VISUAIS — o estilo da imagem. As "pessoas futuristas" são a assinatura dela,
// mas UMA opção, não uma regra (decisão da Vivianne). 'minimal' = sem imagem.
// ---------------------------------------------------------------------------
export type VisualId = 'pessoas' | 'conceptual' | 'natureza' | 'minimal';

export interface VisualCrescer {
  id: VisualId;
  label: string;
  emoji: string;
  descricao: string;
  // base do prompt da imagem (inglês). '' = sem imagem (fundo tipográfico).
  promptBase: string;
}

const FIM_PROMPT = 'cinematic, fine art photography, evocative, depth, no text, no letters, no watermark, no logos --ar 9:16 --style raw';

export const VISUAIS: VisualCrescer[] = [
  {
    id: 'pessoas', label: 'Pessoas futuristas', emoji: '🧑‍🚀',
    descricao: 'A assinatura dela: figuras humanas, etéreas, futuristas.',
    promptBase:
      'a solitary ethereal futuristic human figure (androgynous, serene, timeless), soft volumetric light, ' +
      'subtle iridescent and earth tones, a quiet emotional scene that embodies the idea, painterly and otherworldly, ' + FIM_PROMPT,
  },
  {
    id: 'conceptual', label: 'Conceptual / abstrato', emoji: '◍',
    descricao: 'Arte conceptual, simbólica, sem figuras.',
    promptBase:
      'conceptual abstract fine-art image, a single evocative metaphor for the idea, symbolic, minimal, ' +
      'soft light and shadow, earth and gold tones, no people, ' + FIM_PROMPT,
  },
  {
    id: 'natureza', label: 'Natureza / cósmico', emoji: '🌌',
    descricao: 'Água, neblina, céu, raízes, constelações.',
    promptBase:
      'natural or cosmic fine-art scene (water, mist, sky, stone, roots, seeds, constellations, dawn light), ' +
      'vast and intimate at once, warm earth and gold palette, no people, ' + FIM_PROMPT,
  },
  {
    id: 'minimal', label: 'Minimal / tipográfico', emoji: '𝐀',
    descricao: 'Só texto, fundo limpo (sem imagem).',
    promptBase: '',
  },
];

export const getVisual = (id: string): VisualCrescer | undefined => VISUAIS.find((v) => v.id === id);

// o mundo (palette key) que o render usa — registado em PALETAS (lib/estudio-conteudo.ts).
export const CRESCER_MUNDO = 'crescer';

// a marca no KineticSlide (rodapé próprio: a conta dela).
export const CRESCER_SLIDE: { selo: string | null; mostrarConceito: boolean; assinatura: string; site: string } = {
  selo: null,
  mostrarConceito: false,
  assinatura: `@${CRESCER.handle}`,
  site: 'viviannedossantos.com',
};
