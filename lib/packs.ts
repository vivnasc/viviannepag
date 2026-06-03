import { slugToColecao, type ColecaoId } from './colecoes';

// Packs = bundles de pagamento unico. Conteudo dinamico: um pack inclui todos
// os produtos publicados do seu universo (via slugToColecao). O pack 'tudo'
// inclui o catalogo inteiro. Assim, novos produtos entram no pack sozinhos.

export type Pack = {
  slug: string;                       // pack-prosperidade, pack-tudo
  colecao: ColecaoId | 'all';
  titulo: string;
  titulo_en: string;
  subtitulo: string;
  subtitulo_en: string;
  descricao: string;
  descricao_en: string;
  preco: string;                      // '€29'
  preco_original: string;             // valor avulso aproximado
  capa: string;                       // reusa imagem do universo (troca depois)
  badge: string;
};

export const PACKS: Pack[] = [
  {
    slug: 'pack-freeme-mae', colecao: 'freeme-mae',
    titulo: 'FreeMe Mãe · coleção completa', titulo_en: 'FreeMe Mother · complete collection',
    subtitulo: 'Tudo sobre a culpa, a herança e o que carregas que não é teu.',
    subtitulo_en: 'Everything on guilt, inheritance and what you carry that isn\'t yours.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo FreeMe Mãe num só acesso. Sobre a maternidade, a culpa que não tem origem e o peso que pousas quando percebes o que é teu.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the FreeMe Mother world in one access. On motherhood, the guilt that has no origin, and the weight you set down once you see what is yours.',
    preco: '€29', preco_original: '€106', capa: '/produtos/ebook-01-culpa-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-infonte', colecao: 'infonte',
    titulo: 'Infonte · coleção completa', titulo_en: 'Infonte · complete collection',
    subtitulo: 'Identidade e propósito: quem és para além do que fazes.',
    subtitulo_en: 'Identity and purpose: who you are beyond what you do.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo Infonte num só acesso. Sobre a voz que decide o que conta, as metas que não são tuas, e o que emerge quando o ruído pára.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Infonte world in one access. On the voice that decides what counts, the goals that aren\'t yours, and what emerges when the noise stops.',
    preco: '€29', preco_original: '€90', capa: '/produtos/ebook-03-quemes-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-amor', colecao: 'amor',
    titulo: 'SyncHim · coleção completa', titulo_en: 'SyncHim · complete collection',
    subtitulo: 'Casal e vínculo: o que se repete por baixo do que dizem.',
    subtitulo_en: 'Couple and bond: what repeats beneath what you say.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo SyncHim num só acesso. Sobre o nó invisível do casal, a diferença entre amor e intensidade, e o que te faz perder-te quando amas.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Love world in one access. On the invisible knot in the couple, the difference between love and intensity, and what makes you lose yourself when you love.',
    preco: '€29', preco_original: '€66', capa: '/produtos/ebook-06-no-casal-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-forca', colecao: 'forca',
    titulo: 'Força · coleção completa', titulo_en: 'Strength · complete collection',
    subtitulo: 'Atravessar o escuro e pousar a armadura que já não precisas.',
    subtitulo_en: 'Crossing the dark and setting down the armour you no longer need.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo Força num só acesso. Sobre as crises como passagem, o luto que ninguém vê, e baixar a guarda em segurança.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Strength world in one access. On crises as passage, the grief nobody sees, and lowering your guard safely.',
    preco: '€29', preco_original: '€59', capa: '/produtos/ebook-05-escuro-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-prosperidade', colecao: 'prosperidade',
    titulo: 'Prosperidade · coleção completa', titulo_en: 'Prosperity · complete collection',
    subtitulo: 'Receber, merecer e deixar entrar o que já é teu.',
    subtitulo_en: 'Receiving, deserving, and letting in what is already yours.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo Prosperidade num só acesso. Sobre a escassez herdada, o reflexo de devolver, e aprender a receber.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Prosperity world in one access. On inherited scarcity, the reflex to give back, and learning to receive.',
    preco: '€29', preco_original: '€54', capa: '/produtos/guia-10-receber-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-pertenca', colecao: 'pertenca',
    titulo: 'Pertença · coleção completa', titulo_en: 'Belonging · complete collection',
    subtitulo: 'O teu lugar entre os outros, ocupado sem pedir licença.',
    subtitulo_en: 'Your place among others, taken without asking permission.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo Pertença num só acesso. Sobre o que carregas pela família, a ponte que fazes entre todos, e ocupares o teu lugar à mesa.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Belonging world in one access. On what you carry for the family, the bridge you build between everyone, and taking your place at the table.',
    preco: '€29', preco_original: '€54', capa: '/produtos/guia-12-lugar-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-trabalho', colecao: 'trabalho',
    titulo: 'Trabalho e Vocação · coleção completa', titulo_en: 'Work & Vocation · complete collection',
    subtitulo: 'Separar o teu valor daquilo que produzes.',
    subtitulo_en: 'Separating your worth from what you produce.',
    descricao: '**Pack · PDF imediato**\n\nTodos os ebooks e guias do universo Trabalho e Vocação num só acesso. Sobre a indispensabilidade, a cadeira que ocupas, e quem és quando paras.',
    descricao_en: '**Bundle · Immediate PDF**\n\nEvery ebook and guide from the Work & Vocation world in one access. On indispensability, the chair you occupy, and who you are when you stop.',
    preco: '€29', preco_original: '€47', capa: '/produtos/guia-14-parar-capa.png', badge: 'pack',
  },
  {
    slug: 'pack-tudo', colecao: 'all',
    titulo: 'A biblioteca completa', titulo_en: 'The complete library',
    subtitulo: 'Os sete universos. Todos os ebooks e guias num só acesso.',
    subtitulo_en: 'All seven worlds. Every ebook and guide in one access.',
    descricao: '**Pack mestre · PDF imediato**\n\nO catálogo inteiro: os sete universos, todos os ebooks e todos os guias. A travessia completa, do que carregas ao que finalmente pousas.',
    descricao_en: '**Master bundle · Immediate PDF**\n\nThe entire catalogue: all seven worlds, every ebook and every guide. The complete crossing, from what you carry to what you finally set down.',
    preco: '€99', preco_original: '€476', capa: '/produtos/ebook-01-culpa-capa.png', badge: 'pack · tudo',
  },
];

export function packBySlug(slug: string): Pack | undefined {
  return PACKS.find((p) => p.slug === slug);
}

export function isPackSlug(slug: string): boolean {
  return slug.startsWith('pack-') && PACKS.some((p) => p.slug === slug);
}

// Um produto pertence ao pack se o pack for 'all' ou se a colecao do produto
// coincidir com a do pack.
export function packIncluiProduto(pack: Pack, produtoSlug: string): boolean {
  if (pack.colecao === 'all') return true;
  return slugToColecao(produtoSlug) === pack.colecao;
}

// Upsell no checkout: se o carrinho tem >=2 titulos avulsos do mesmo universo
// e ainda nao tem o pack desse universo, sugere trocar pelos packs (poupanca).
// Devolve os slugs que o pack substitui, para o checkout trocar e calcular a poupanca.
export function upsellsParaCarrinho(slugsNoCarrinho: string[]): { pack: Pack; substitui: string[] }[] {
  const avulsos = slugsNoCarrinho.filter((s) => !s.startsWith('pack-'));
  const packsNoCarrinho = new Set(slugsNoCarrinho.filter((s) => s.startsWith('pack-')));
  const res: { pack: Pack; substitui: string[] }[] = [];
  for (const pack of PACKS) {
    if (pack.colecao === 'all') continue;
    if (packsNoCarrinho.has(pack.slug)) continue;
    const incluidos = avulsos.filter((s) => packIncluiProduto(pack, s));
    if (incluidos.length >= 2) res.push({ pack, substitui: incluidos });
  }
  return res;
}
