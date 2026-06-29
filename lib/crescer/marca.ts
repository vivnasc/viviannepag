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
// LIVRO — "Os 7 Véus do Despertar" (livro-7-veus.json), o livro da Vivianne.
// É o FUNDAMENTO real do gerador (a espinha e as correntes do livro), não âncoras
// inventadas. Serve só de PROFUNDIDADE por baixo: NUNCA nomear véus, autores,
// tradições ou jargão na frase que sai (o que sai é a vida real, na 1.ª pessoa das
// dores e passagens). NÃO é "1 véu por post" nem trazer os véus de volta como
// rótulos (isso foi abolido) — é a fonte de onde vem a fundura.
// ---------------------------------------------------------------------------
export const LIVRO = {
  titulo: 'Os 7 Véus do Despertar',
  // os 7 véus pelo que ENCOBREM → o que REVELAM (o arco do livro).
  veus: [
    { nome: 'Permanência', encobre: 'o "eu" fixo que precisa de ser defendido', revela: 'a identidade é fluxo, somos presença e não forma' },
    { nome: 'Memória', encobre: 'as narrativas do passado que nos definem', revela: 'não somos a narrativa, somos um agora vivo' },
    { nome: 'Turbilhão', encobre: 'a fusão com os pensamentos e as emoções', revela: 'há em nós uma presença que observa sem se prender' },
    { nome: 'Esforço', encobre: 'a crença de que é preciso fazer, conquistar e merecer', revela: 'é no repouso, não na corrida, que a verdade se revela' },
    { nome: 'Desolação', encobre: 'o medo do vazio como ausência', revela: 'o vazio é campo fértil, a noite que gera' },
    { nome: 'Horizonte', encobre: 'a ilusão de uma chegada ou fim', revela: 'não há fim, há fluxo contínuo, presença no agora' },
    { nome: 'Dualidade', encobre: 'a separação entre eu e o mundo, espírito e matéria', revela: 'o centro indiviso: a cura individual é também presença comunitária' },
  ],
  // as correntes que atravessam o livro inteiro (o que dá gravidade a tudo).
  correntes: [
    'Ubuntu, sou porque somos: a dor de um repercute no corpo de todos, a cura de um espalha alívio à volta',
    'a herança involuntária inscrita no corpo, e a ancestralidade como presença contínua (a linha que vem de trás e segue à frente)',
    'o corpo guardião: recorda, retrai-se e diz a verdade que a mente nega; a cura passa pelo corpo',
    'a sombra que se integra em vez de se combater, e o "ego vestido de luz" (a falsa espiritualidade que vira máscara)',
    'a criança interior, o perdão e o autoperdão, o vitimismo que aprisiona',
    'universalista: muitas tradições, uma só luz, sem bandeira nem dogma',
    'a voz do caminho ainda em curso: nunca de púlpito, "não te convido a seguir-me, mas a caminharmos juntos"',
  ],
} as const;

// ---------------------------------------------------------------------------
// TEMÁTICAS — os ângulos de crescimento/evolução, com a base dela por baixo.
// (validadas pela Vivianne). NÃO são os 7 véus.
// ---------------------------------------------------------------------------
export type TematicaId =
  | 'transformacao' | 'raizes' | 'eumaior' | 'sombra' | 'vinculos' | 'sentido' | 'corpo' | 'ciclos' | 'campo';

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
  {
    // RESPONSABILIDADE ESPIRITUAL × CURA ANCESTRAL — do livro "Os 7 Véus do
    // Despertar" (Véu da Dualidade, cap. 26; e Permanência cap. 3). A cura que
    // não fica em ti: expande-se ao redor e solta a linha de trás. NUNCA o clichê
    // da "vibração" solto — sempre o concreto dos vínculos e das gerações.
    id: 'campo', label: 'Não te curas só a ti', emoji: '🪢',
    descricao: 'Responsabilidade espiritual e cura ancestral: o que sara em ti não fica em ti.',
    foco: 'A cura que não fica em ti (do Véu da Dualidade): quando deixas de repetir um padrão, alivias quem vem depois e soltas a linha que vem de trás (a herança involuntária, inscrita no corpo). Expandir é responsabilidade, não vaidade: a dor de um repercute no corpo de todos, a cura de um espalha alívio à volta (sou porque somos). PROIBIDO o clichê "aumenta a tua vibração"; sempre no concreto dos vínculos, da família e das gerações.',
  },
];

export const getTematica = (id: string): Tematica | undefined => TEMATICAS.find((t) => t.id === id);

// ---------------------------------------------------------------------------
// FORMATOS — cada um sai diferente ao olho e na estrutura (validados).
// `multi` = produz vários momentos (carrossel/reel de várias linhas).
// ---------------------------------------------------------------------------
// DECISÃO da Vivianne (jun 2026): manter TODOS os formatos, mas garantir que cada
// um sai DIGNO, na voz e no visual (ver a régua de DIGNIDADE no gerador). Cada
// formato abre sempre com uma FACA e é forte e claro, nunca difuso nem encheção.
export type FormatoId = 'frase' | 'momentos' | 'pergunta' | 'lista' | 'reflexao' | 'cena' | 'ensaio';

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
    descricao: '1 imagem + 1 frase que para o scroll. Para a tua voz, de aproximação.',
    estrutura: 'UMA frase curta (1 a 3 linhas), que para o scroll porque a pessoa se reconhece. Densa, com uma virada. Cabe grande no ecrã.',
  },
  {
    id: 'momentos', label: 'Momentos', emoji: '🎞', multi: true,
    descricao: 'Uma ideia que se desdobra em poucas linhas (reel).',
    estrutura: 'A 1.ª tela é uma FACA (pára o scroll). Depois 3 a 5 linhas curtas que constroem UM arco sobre a mesma ideia (aprofunda, vira, fecha em aberto), cada uma uma respiração.',
  },
  {
    id: 'pergunta', label: 'Pergunta que fica', emoji: '❓', multi: false,
    descricao: 'Abre com uma pergunta-faca, não responde.',
    estrutura: 'UMA pergunta-faca que a pessoa leva consigo o dia todo. Concreta, sobre a vida dela, nunca retórica vazia. Não respondas.',
  },
  {
    id: 'lista', label: 'Lista', emoji: '📍', multi: true,
    descricao: '"3 sinais de…", "o que ninguém te diz sobre…".',
    estrutura: 'CAPA-faca ("3 sinais de que…", "o que ninguém te diz sobre…"). Depois 3 a 5 pontos curtos, concretos e reconhecíveis (cada um uma cena real, todos diferentes). Fecho que abre, não conclui.',
  },
  {
    id: 'reflexao', label: 'Reflexão funda', emoji: '🕯', multi: false,
    descricao: 'Capa-faca + uma reflexão fundamentada na legenda.',
    estrutura: 'Uma frase-CAPA forte (faca) no ecrã; na legenda, 2 a 3 parágrafos com a profundidade dela, sempre concretos e na vida real, nunca aula.',
  },
  {
    id: 'cena', label: 'Cena', emoji: '🎬', multi: false,
    descricao: 'Uma situação que se reconhece, e a seguir o alívio.',
    estrutura: 'DOIS tempos: 1) a cena concreta que a pessoa vive AGORA (uma faca que ela reconhece como a vida dela); 2) o virar que a solta. A imagem mostra a cena, não um símbolo a decifrar.',
  },
  {
    id: 'ensaio', label: 'Carrossel de texto', emoji: '📜', multi: true,
    descricao: 'Capa-faca + um tema desdobrado em verdades concretas + fecho. O formato de alcance.',
    estrutura:
      'Um CARROSSEL sobre UM tema só (ex.: "as armadilhas do ego", "o que a terapia não te conta", "as heranças que carregas sem saber"). A estrutura que aguenta a leitura até ao fim: ' +
      '1) CAPA: um título-faca curto e forte que pára o scroll (ex.: "As armadilhas do ego"); ' +
      '2) ABERTURA: um slide curto que monta o tema (começa por "Para refletir:" e 1 a 2 frases); ' +
      '3) 6 a 11 MANIFESTAÇÕES: cada uma um parágrafo (3 a 6 linhas) que nomeia UMA forma concreta e reconhecível do tema na vida real (uma cena que a pessoa vive), TODAS diferentes, nunca a repetir a mesma ideia; ' +
      '4) FECHO: um slide que reconhece ("todos já caímos nisto") e convida a guardar, partilhar ou rolar. ' +
      'A leitura tem de ser clara e interessante do princípio ao fim (8 fortes valem mais que 13 esticados). Registo afiado mas digno: a faca aponta ao padrão, NUNCA despreza pessoas (proibido "massa histérica", "babaca" e afins).',
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
  // como VARIAR a composição (para não sair sempre a mesma coisa, ex. só caras).
  variar: string;
}

// RÉGUA DE IMAGEM (decisão da Vivianne, jun 2026, reequilibrada): a LIGAÇÃO ao
// texto é o que MAIS importa. O "futurista" NÃO é conteúdo obrigatório (néon,
// sci-fi, cosmos) — é só uma QUALIDADE: luminosa, moderna, elevada, fine-art.
// O estilo serve a mensagem, nunca ao contrário. PROIBIDO escuro, sépia, vintage,
// rústico, doméstico, antiquado, e o cliché néon/cyberpunk quando não serve a frase.
export const FIM_PROMPT =
  'luminous but SOBER, refined and elegant, scroll-stopping, ultra high quality, premium cinematic fine-art, ' +
  'soft radiant natural light, harmonious and RESTRAINED color (muted, sophisticated, tasteful), sharp focus, modern, elegant and timeless. ' +
  'The image CARRIES the meaning of the words; style serves the message. ' +
  'NOT dark, NOT dim, NOT muddy, NOT sepia, NOT vintage, NOT rustic, NOT domestic, NOT antiquated. ' +
  'ABSOLUTELY NO neon, NO cyberpunk, NO garish or oversaturated colors, NO glowing electric / RGB / laser / club lights. ' +
  'no text, no letters, no watermark, no logos --ar 9:16 --style raw';

export const VISUAIS: VisualCrescer[] = [
  {
    id: 'pessoas', label: 'Pessoas futuristas', emoji: '🧑',
    descricao: 'Pessoas reais, visíveis e elegantes (sem silhuetas, sem néon), na cena da frase.',
    promptBase:
      'a real, present human figure CLEARLY VISIBLE and FRONT-LIT, the face and body lit and visible ' +
      '(NEVER a dark or distant silhouette, NEVER backlit, NEVER just an extreme face close-up), graceful and timeless, ' +
      'modern and elegant, soft refined light, cinematic fine-art portrait that carries the feeling of the words, ' + FIM_PROMPT,
    variar:
      'VARIA SEMPRE o enquadramento, NUNCA só rostos em grande plano nem figuras distantes: ora uma figura inteira num cenário que diz a frase, ' +
      'ora uma pessoa de costas a caminhar para a luz, mãos que se estendem, alguém em movimento, duas figuras, um perfil sereno. ' +
      'Pessoas de idades e traços diferentes, sempre REAIS, VISÍVEIS e iluminadas de frente, em luz suave e elegante (nunca néon). A pessoa e o cenário traduzem o SENTIMENTO da frase.',
  },
  {
    id: 'conceptual', label: 'Conceptual / abstrato', emoji: '◍',
    descricao: 'Arte conceptual sóbria: uma metáfora elegante que traduz a frase.',
    promptBase:
      'a refined conceptual fine-art image, ONE elegant luminous metaphor that TRANSLATES THE WORDS, evocative and meaningful, ' +
      'soft radiant light, harmonious restrained color, premium and modern, no people, ' + FIM_PROMPT,
    variar:
      'VARIA SEMPRE a metáfora e os objetos (luz, vidro, água, fio/linha, portas, espelhos, raízes, pedras, sementes, pontes). ' +
      'Nunca repitas o motivo. A metáfora TEM de ser uma tradução visual sóbria do sentimento da frase, não decoração, não sci-fi, não néon.',
  },
  {
    id: 'natureza', label: 'Natureza / cósmico', emoji: '🌌',
    descricao: 'Paisagens luminosas e serenas que espelham a frase.',
    promptBase:
      'a breathtaking luminous and SERENE natural or cosmic scene that MIRRORS THE FEELING OF THE WORDS, elegant and awe-inspiring, no people, ' + FIM_PROMPT,
    variar:
      'VARIA SEMPRE a cena (oceanos de luz, montanhas, florestas radiantes, amanheceres, auroras, nebulosas, desertos, água suspensa). ' +
      'Nunca repitas. A paisagem espelha o sentimento da frase (vastidão, recomeço, travessia, raiz, etc.), não é cosmos por moda.',
  },
  {
    id: 'minimal', label: 'Minimal / tipográfico', emoji: '𝐀',
    descricao: 'Só texto, fundo limpo (sem imagem).',
    promptBase: '',
    variar: '',
  },
];

export const getVisual = (id: string): VisualCrescer | undefined => VISUAIS.find((v) => v.id === id);

// reforço de segurança ao gerar/regenerar a imagem por slide: garante a QUALIDADE
// (luminosa, não escura) mesmo em peças antigas com prompt fraco, e que as PESSOAS
// saem visíveis e iluminadas (nunca silhueta escura). NÃO impõe sci-fi.
export function reforcoVisual(id: string): string {
  const visivel = id === 'pessoas' ? 'human figure CLEARLY VISIBLE and front-lit, luminous, not a dark or distant silhouette. ' : '';
  return visivel + FIM_PROMPT;
}

// ---------------------------------------------------------------------------
// VOZ — a Vivianne não é só poética (decisão dela, jun 2026): a escrita poética
// é linda mas trava o alcance. Ela QUER escrever normal, direto, para chegar às
// pessoas, E pode ser as duas vozes. A DIRETA é o default (o alcance); a poética
// é a do livro. O fundamento (o livro) fica por baixo nas duas, só muda o estilo.
// ---------------------------------------------------------------------------
export type VozId = 'direta' | 'poetica';
export interface VozCrescer { id: VozId; label: string; emoji: string; descricao: string; instrucao: string }
export const VOZES: VozCrescer[] = [
  {
    id: 'direta', label: 'Direta', emoji: '🎯', descricao: 'Escrita normal e clara, para chegar e ser partilhada (alcance).',
    instrucao:
      'Escreve NORMALMENTE, como uma pessoa real escreve para ser entendida à primeira e partilhada. Frases claras, diretas, prosa acessível, palavras do dia a dia. ' +
      'PROIBIDO o registo poético/contemplativo de "manual de despertar" (nada de "véu que se desfaz", "o silêncio que sustenta", "sopro", "presença que pulsa", "fluxo", "o ser"). ' +
      'A profundidade está no QUE dizes (a verdade que ninguém diz), não no floreado. É a voz do alcance.',
  },
  {
    id: 'poetica', label: 'Poética', emoji: '🌙', descricao: 'A voz contemplativa do livro: imagem, ritmo, beleza.',
    instrucao:
      'Voz contemplativa e poética, como no livro: imagem, ritmo, beleza, serenidade. Mais identidade, menos alcance. Mesmo assim, clara: a beleza serve o sentido, não o esconde.',
  },
];
export const getVoz = (id: string): VozCrescer | undefined => VOZES.find((v) => v.id === id);

// o mundo (palette key) que o render usa — registado em PALETAS (lib/estudio-conteudo.ts).
export const CRESCER_MUNDO = 'crescer';

// a marca no KineticSlide (rodapé próprio: a conta dela).
export const CRESCER_SLIDE: { selo: string | null; mostrarConceito: boolean; assinatura: string; site: string } = {
  selo: null,
  mostrarConceito: false,
  assinatura: `@${CRESCER.handle}`,
  site: 'viviannedossantos.com',
};
