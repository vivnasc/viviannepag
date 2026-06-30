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
  | 'transformacao' | 'raizes' | 'eumaior' | 'sombra' | 'vinculos' | 'sentido' | 'corpo' | 'ciclos' | 'campo'
  | 'desencaixe' | 'consciencia';

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
  {
    // FONTE: o livro "Os 7 Sinais de Desencaixe" (a base de conhecimento dela).
    id: 'desencaixe', label: 'Desencaixe (7 Sinais)', emoji: '🧩',
    descricao: 'Pertencer sem deixar de se ser inteiro.',
    foco: 'A dor de deixar de caber num lugar que já foi bom, sem que ninguém tenha feito nada de errado. Parte de UM destes sinais de cada vez e traz a cena concreta de quem o vive: estar presente sem se sentir pertencente; diminuir-se para caber; a saudade de algo que nunca se viveu; oscilar entre adaptar-se de mais e isolar-se; o corpo a rejeitar certos ambientes; confundir paz com ausência de pessoas; perceber que o problema nunca foi pertencer, foi o preço da pertença. NUNCA nomeies o sinal nem digas "desencaixe"; nomeia a cena.',
  },
  {
    // FONTE: o glossário das Ciências da Consciência Emergente (a base dela).
    id: 'consciencia', label: 'Consciência emergente', emoji: '🌀',
    descricao: 'A vida vista para além da sobrevivência.',
    foco: 'O que se vê quando a sobrevivência deixa de mandar: a identidade construída sobre a falta, a vigilância herdada que continua a varrer o ambiente muito depois de o perigo passar, a vida gerida como defesa, e o que se abre quando se larga isso. Parte de UM destes mecanismos e traz a cena concreta de quem o vive, sempre em linguagem de vida real. PROIBIDO nomear conceitos, domínios ou termos técnicos; só a vida.',
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
export type FormatoId = 'frase' | 'momentos' | 'pergunta' | 'lista' | 'reflexao' | 'cena' | 'ensaio' | 'pordetras';

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
  {
    id: 'pordetras', label: 'O que está por detrás', emoji: '🪞', multi: true,
    descricao: 'Série: um comportamento do dia a dia → o que está mesmo por baixo.',
    estrutura:
      'Uma SÉRIE que pega num comportamento ou desejo concreto e reconhecível do dia a dia e revela o que está MESMO por baixo (a necessidade, a ferida, o mecanismo herdado), com alívio e sem julgamento. ' +
      '1) CAPA-faca: começa por "O que está por detrás de" + UMA cena concreta, específica e quotidiana (ex.: a tua vontade de agradar, a tua raiva pelo vizinho, a roupa cara que usas, chegares sempre atrasado, dizeres sempre que sim, arrumares quando estás ansiosa). Escolhe uma inesperada, nunca abstrata; ' +
      '2) a explicação fácil, a que damos a nós próprios (a da superfície); ' +
      '3) a CAMADA por baixo: o que aquilo está mesmo a proteger ou a pedir (a necessidade real, o medo, a herança), em linguagem de vida, NUNCA o conceito nem o nome técnico; ' +
      '4) o ALÍVIO: o que muda quando se vê isto, sem ordem nem "deixa de" (mais "quando vês, já não te comanda às escuras"). ' +
      'Tom: revela, não acusa; a pessoa sente-se compreendida, nunca apanhada. Cada tela uma respiração, todas diferentes, sem travessões.',
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
  // ARQUÉTIPOS de cena distintos — rodam por peça para as imagens NÃO repetirem
  // (ex.: não saírem todas o mesmo desfiladeiro verde). [] = sem rotação.
  arquetipos: string[];
}

// MUNDO VISUAL · PÓS-SOBREVIVÊNCIA (decisão e manifesto da Vivianne, jun 2026).
// NÃO é o futuro tecnológico (néon, cyberpunk, 5D, videojogo) — é o futuro
// ANTROPOLÓGICO: uma civilização humana que saiu da consciência de SOBREVIVÊNCIA
// e entrou na consciência de CRIAÇÃO. Evoluído, não avançado. A tensão entre o
// mundo antigo (pesado, industrial, o encaixe forçado) e o que emerge (orgânico,
// luminoso, escala impossível) É, em imagem, o trabalho dos véus: ver, depois soltar.
// REGRA DE OURO: a imagem mostra o LIMIAR e a tensão; nunca a chegada como
// instrução. O novo mundo vislumbra-se ao longe / por uma fenda / no horizonte.
export const FIM_PROMPT =
  'an image like a memory from the future of a POST-SURVIVAL human civilization: not advanced technology but advanced CONSCIOUSNESS ' +
  'made visible in this world (evolved, not merely advanced); organic and luminous, GROWN not built. ' +
  'SCALE IS ONE REGISTER, NOT THE RULE: sometimes vast (living architecture, suspended gardens, rivers in the sky), but JUST AS OFTEN CLOSE, INTIMATE AND ALIVE — a single object of that world, a LIVING BEING (a bird, an animal, an insect, a creature, a flowering or unfurling plant), a pair of hands, a face softly lit, food, cloth, water, a small detail full of life and texture. A different world from ours, but a WORLD that is lived in, not only contemplated from afar. ' +
  'INVISIBLE technology (no screens, robots, ships, gadgets); light emitted by the matter itself, abundant and luminous; nature and life and architecture fused; physics gently set free. ' +
  'BRIGHT, sunlit and LUMINOUS, crystal-clear ultra-high resolution, razor-sharp fine detail, deep clarity and dimension. ' +
  'Palette: luminous and clear, warm whites and soft golds with RADIANT SKY BLUES, lush living GREENS, turquoise water and champagne light, rich and beautiful NATURAL color (vivid yet natural, never neon, never washed-out, never muted). ' +
  'Feeling: absolute safety, expansion, possibility, mystery and awe, the end of the old world and the birth of a new human paradigm. ' +
  'The awe of Dune and Interstellar AND the intimate organic life of Avatar and Moebius, BUT much brighter, more colourful, sharper and higher-resolution than those films. ' +
  'VARY THE SUBJECT AND SCALE WIDELY across images and LEAN CLOSE: often a single object, a living being, a plant, an animal, hands, a face, a small alive detail — not always a wide vista. Avoid making most images vast and empty of life. ' +
  'Do NOT default to archways, arches, doorways, portals or arched stone openings framing the view; that composition is overused, avoid it unless truly needed. ' +
  'ABSOLUTELY NO haze, NO fog, NO mist, NO heavy shadows, NO murky penumbra, NO dim or desaturated look. ' +
  'NEVER neon, NEVER cyberpunk, no robots, no spaceships, no screens or holograms, no crystals, no chakras, no esoteric symbols, ' +
  'no post-apocalyptic decay, no dried flowers, no family corridors, no family trees, no blurry grandmothers, no literal therapy metaphors, not a plain everyday photo. ' +
  'no text, no letters, no watermark, no logos --ar 9:16 --style raw';

export const VISUAIS: VisualCrescer[] = [
  {
    id: 'pessoas', label: 'Pessoas (escala)', emoji: '🧑',
    descricao: 'Uma figura humana minúscula perante uma estrutura colossal: a pessoa diante do que herdou e ainda não largou.',
    promptBase:
      'a human presence in the post-survival world, clearly visible and softly lit (never a dark silhouette), present and dignified — ' +
      'SOMETIMES tiny before a colossal structure (the awe of scale), but JUST AS OFTEN CLOSE: a calm face, a pair of hands, a person resting or tending a living thing; ' +
      'the image carries the feeling of the words. ' + FIM_PROMPT,
    variar:
      'VARIA a estrutura colossal e o enquadramento: uma cidade de milhares de camadas transparentes de cidades antigas suspensas; uma ponte de luz entre megacidades ' +
      '(à frente, arquitetura orgânica luminosa; atrás, uma estrutura monumental de pedra e aço); uma estrutura circular gigante no céu com milhões de lugares iluminados e um só vazio; ' +
      'uma muralha industrial colossal com a figura de costas a olhar jardins suspensos ao longe; uma planície vasta sob um céu enorme; uma estrada de luz que nasce só uns metros à frente dos passos. ' +
      'A figura é sempre minúscula perante a escala; a tensão entre o mundo antigo (pesado) e o que emerge (orgânico, luminoso) traduz o sentimento da frase.',
    arquetipos: [
      'a figure tiny atop a city of thousands of transparent layers of ancient cities suspended over one another',
      'a figure crossing a bridge of light between two megacities (organic luminous architecture ahead, monumental stone-and-steel behind)',
      'a tiny figure before a giant circular structure in the sky with millions of lit places and a single empty one',
      'a figure with their back to a colossal industrial wall, looking at suspended gardens far in the distance',
      'a single figure at the centre of a vast silent plain under an enormous sky, no structures',
      'a figure on a road of light that builds itself only a few metres ahead of their steps',
      'a tiny figure inside an immense floating library of volumes of light',
      'a figure climbing a vast stairway that ends in the clouds',
      'a person resting calmly inside a warm luminous organic home, soft daylight, gardens beyond the wide window',
      'a person at a sunlit table in an interior of grown living architecture, plants and light around them',
      'two people in quiet company in a warm radiant room open to a green horizon',
      'a person standing close at a vast open window, the new luminous world spread softly below',
      'a CLOSE-UP of a calm face softly lit by the warm light of the new world',
      'a pair of open hands holding a small living light or a luminous seed, very close',
      'a person seen close, resting, a luminous plant or a small gentle creature beside them',
    ],
  },
  {
    id: 'conceptual', label: 'Os dois mundos', emoji: '◍',
    descricao: 'A tensão entre o mundo antigo (pesado) e o que emerge (orgânico, luminoso), em escala monumental, sem pessoas.',
    promptBase:
      'a monumental post-survival scene with NO people that holds the TENSION of two worlds as ONE image translating the words: ' +
      'the old heavy world (industrial, built to survive) and the world that emerges (organic, luminous, impossible scale); ' +
      'show the threshold / a crack of warm light / the horizon, never the arrival fully inhabited. ' + FIM_PROMPT,
    variar:
      'VARIA a metáfora em escala E o ponto de vista: uma cidade escura e densa de engrenagens vista de muito longe, bela e exausta; um interior monumental que passa de sem luz própria a inundado pela luz quente do outro mundo; ' +
      'oceanos verticais, bibliotecas flutuantes, árvores do tamanho de continentes, um interior íntimo onde os dois mundos se tocam. Mostra a TENSÃO dos dois mundos; nem sempre um portal nem sempre só de fora.',
    arquetipos: [
      'a vast dark dense city of gears and buttresses seen from very far, beautiful and exhausted',
      'a monumental interior shifting from no light of its own to being flooded with warm light from the other world',
      'colossal vertical oceans of suspended water catching the light',
      'an intimate warm interior where the heavy old world and the luminous new one meet in one room',
      'continent-sized living trees rising over an old world',
      'bridges of light between inhabited floating mountains',
      'a luminous organic interior growing out of cracked industrial stone, life reclaiming it',
      'a CLOSE-UP of a single luminous seed sprouting from cold grey machinery',
      'a close object of the new world resting on cracked industrial stone, two worlds in one small thing',
      'a close detail of living moss and light spreading over an old iron beam',
    ],
  },
  {
    id: 'natureza', label: 'O mundo que emerge', emoji: '🌌',
    descricao: 'Vislumbre do mundo orgânico e luminoso que nasce depois da sobrevivência (ao longe, por uma fenda).',
    promptBase:
      'the WORLD THAT EMERGES after survival: organic luminous architecture and landscape at impossible scale ' +
      '(suspended gardens, rivers in the sky, bridges of light, continent-sized trees, vertical oceans, light that is the matter itself). ' +
      'VARY THE VANTAGE: sometimes glimpsed from afar / on the horizon, sometimes seen FROM WITHIN as a warm inhabited interior, sometimes an intimate human-scale corner of that world; it mirrors the feeling of the words. ' + FIM_PROMPT,
    variar:
      'VARIA a paisagem E o ponto de vista do novo mundo: ora ao longe (jardins suspensos, rios no céu, pontes de luz, montanhas habitadas, escadas nas nuvens), ora POR DENTRO ' +
      '(o interior luminoso de uma casa aberta para os jardins, um atelier cheio de luz, um quarto quente e sereno, uma estufa, uma sala de encontro). Espelha o sentimento da frase (expansão, recomeço, pertença), sempre com segurança, mistério e admiração.',
    arquetipos: [
      'endless suspended gardens cascading with greenery and light',
      'rivers in the sky falling as cascades of luminous water',
      'inhabited crystalline mountains glowing softly',
      'a sunrise over a vast ocean of light',
      'the warm luminous INTERIOR of an organic home opening onto suspended gardens',
      'an artist\'s sunlit atelier inside the living architecture, plants and light everywhere',
      'a serene warm bedroom of grown organic walls, soft daylight, open to a green horizon',
      'a calm communal gathering hall bathed in golden light, no crowd, just warmth',
      'a luminous greenhouse interior overflowing with green life',
      'a quiet reading nook of light high inside a continent-sized tree',
      'a CLOSE-UP of an unfamiliar luminous flower unfurling, dew and light on its petals',
      'a small glowing bird of this world perched close, alive and curious',
      'a close still life of strange beautiful fruit, bread and water on a table of light',
      'cupped hands holding luminous water, very close, warm light',
      'a gentle unknown animal resting in warm sunlit grass, close and alive',
    ],
  },
  {
    id: 'minimal', label: 'Minimal / tipográfico', emoji: '𝐀',
    descricao: 'Só texto, fundo limpo (sem imagem).',
    promptBase: '',
    variar: '',
    arquetipos: [],
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
