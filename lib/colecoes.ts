// As 7 Colecoes do Universo (Vivianne dos Santos)
// Origem: ebooks-plano/universo/00-MAPA-MESTRE.md
// Cada produto e mapeado a uma colecao via slug, sem precisar de migracao na DB.

export type ColecaoId =
  | 'freeme-mae'
  | 'infonte'
  | 'prosperidade'
  | 'amor'
  | 'pertenca'
  | 'forca'
  | 'trabalho';

export type Colecao = {
  id: ColecaoId;
  romano: string;
  nome: string;
  nome_en: string;
  pitch: string;
  pitch_en: string;
  feridas: string;
  feridas_en: string;
  estado: 'producao' | 'banco' | 'em-breve';
  cor: string;       // border accent
  travessia?: string;
};

export const COLECOES: Colecao[] = [
  {
    id: 'freeme-mae',
    romano: 'I',
    nome: 'FreeMe Mãe',
    nome_en: 'FreeMe Mother',
    pitch: 'As feridas da maternidade. Para a mãe que carrega o que nunca foi seu para carregar.',
    pitch_en: 'The wounds of motherhood. For the mother who carries what was never hers to carry.',
    feridas: 'culpa · herança invisível · limites · salvar · dizer basta',
    feridas_en: 'guilt · invisible inheritance · boundaries · saving · saying enough',
    estado: 'producao',
    cor: 'border-bordeaux/40 hover:border-bordeaux',
    travessia: 'https://freeme.viviannedossantos.com',
  },
  {
    id: 'infonte',
    romano: 'II',
    nome: 'Infonte',
    nome_en: 'Infonte',
    pitch: 'As feridas da identidade e do propósito. Para quem persegue o que não é seu.',
    pitch_en: 'The wounds of identity and purpose. For those chasing what isn\'t theirs.',
    feridas: 'substituição · quem és · sentido · voz própria · mente cheia',
    feridas_en: 'substitution · who you are · meaning · own voice · busy mind',
    estado: 'producao',
    cor: 'border-ocre/40 hover:border-ambar',
    travessia: 'https://infonte.viviannedossantos.com',
  },
  {
    id: 'amor',
    romano: 'IV',
    nome: 'SyncHim',
    nome_en: 'SyncHim',
    pitch: 'As feridas da vinculação amorosa. Para casais e para quem ama demais ou de menos.',
    pitch_en: 'The wounds of romantic attachment. For couples and for those who love too much or too little.',
    feridas: 'nó do casal · perguntas antes da discussão · desaparecer no amor',
    feridas_en: 'couple\'s knot · questions before the argument · disappearing in love',
    estado: 'producao',
    cor: 'border-rosa/40 hover:border-rosa',
    travessia: 'https://synchim.viviannedossantos.com',
  },
  {
    id: 'forca',
    romano: 'VI',
    nome: 'Força',
    nome_en: 'Strength',
    pitch: 'As feridas da sobrevivência. Para quem atravessa o escuro ou o luto que ninguém viu.',
    pitch_en: 'The wounds of survival. For those crossing the dark or the grief nobody saw.',
    feridas: 'atravessar o escuro · luto invisível · esgotamento · descansar',
    feridas_en: 'crossing the dark · invisible grief · exhaustion · resting',
    estado: 'producao',
    cor: 'border-lila/40 hover:border-lila',
  },
  {
    id: 'prosperidade',
    romano: 'III',
    nome: 'Prosperidade',
    nome_en: 'Prosperity',
    pitch: 'As feridas da relação com o valor. Para quem paga para pertencer ou tem medo de receber.',
    pitch_en: 'The wounds of the relationship with value. For those who pay to belong or fear receiving.',
    feridas: 'escassez herdada · medo de receber · pagar para pertencer',
    feridas_en: 'inherited scarcity · fear of receiving · paying to belong',
    estado: 'em-breve',
    cor: 'border-ouro/40 hover:border-ouro',
  },
  {
    id: 'pertenca',
    romano: 'V',
    nome: 'Pertença',
    nome_en: 'Belonging',
    pitch: 'As feridas da família, amizade e lugar. Para quem nunca é escolhida primeiro.',
    pitch_en: 'The wounds of family, friendship, and place. For those never chosen first.',
    feridas: 'carregar a família · nunca escolhida · sentir-se de fora',
    feridas_en: 'carrying family · never chosen · feeling outside',
    estado: 'em-breve',
    cor: 'border-salvia/40 hover:border-salvia',
  },
  {
    id: 'trabalho',
    romano: 'VII',
    nome: 'Trabalho e Vocação',
    nome_en: 'Work & Vocation',
    pitch: 'As feridas da vida profissional. Para quem habita ou ocupa o seu tamanho profissional.',
    pitch_en: 'The wounds of professional life. For those who don\'t inhabit or occupy their full size.',
    feridas: 'não ocupar a cadeira · exaustão como mérito · não cobrar',
    feridas_en: 'not occupying the chair · exhaustion as merit · not charging',
    estado: 'em-breve',
    cor: 'border-creme-2/30 hover:border-ocre',
  },
];

// Mapeia slug do produto -> colecao. Sem mexer na DB; fica versionado no codigo.
// Adiciona aqui novos produtos a medida que sao criados.
export function slugToColecao(slug: string): ColecaoId {
  // FreeMe Mae — maternidade
  if (/^ebook-01-culpa|^ebook-02-herdaste|^guia-01-meu|^guia-02-frases/.test(slug)) return 'freeme-mae';
  if (/^ebook-(09|10|11|12)|mae-que|mae-arrependida|mae-solo|mae-que-teme/.test(slug)) return 'freeme-mae';

  // Infonte — identidade e proposito
  if (/^ebook-03-quemes|^ebook-04-sentido|^ebook-07-sonho|^ebook-08-voz/.test(slug)) return 'infonte';
  if (/^guia-03-presenca|^guia-04-mente|^guia-07-teu/.test(slug)) return 'infonte';

  // Amor — casal e vinculacao
  if (/^ebook-06-no-casal|^guia-06-perguntas/.test(slug)) return 'amor';

  // Forca — sobrevivencia, atravessar
  if (/^ebook-05-escuro|^guia-05-luto/.test(slug)) return 'forca';

  // Default — fica em FreeMe Mae como entrada principal
  return 'freeme-mae';
}

export function getColecao(id: ColecaoId): Colecao {
  return COLECOES.find(c => c.id === id) ?? COLECOES[0];
}

export const COLECOES_ATIVAS = COLECOES.filter(c => c.estado !== 'em-breve');
export const COLECOES_EM_BREVE = COLECOES.filter(c => c.estado === 'em-breve');
