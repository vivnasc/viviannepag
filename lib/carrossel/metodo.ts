// Método VS · a espinha dos Carrosséis dos 7 Véus.
//
// O carrossel sazonal continua (calendário de 52 semanas, território, estação,
// música Ancient Ground), mas agora CORRE PELO MÉTODO VS: o gesto Ver e Soltar,
// as três portas (Ver/Vir/Viver) como fio condutor da semana, e os CTAs
// ancorados nos produtos do próprio método.
//
// Fonte canónica: METODO-VS.md · lib/metodo/contas.ts. Voz: CONTINUIDADE-METODO-VS.md.
// Os URLs apontam para páginas de venda REAIS e vivas (já ligadas no TopNav, na
// home e no diagnóstico): viviannedossantos.com/os-sete-veus · /ver-soltar · etc.

export type Movimento = 'ver' | 'vir' | 'viver' | 'todo';

// A espinha do método, injetada no topo do system prompt do gerador.
export const METODO_ESPINHA = `MÉTODO VS · VER E SOLTAR (a espinha de todo o carrossel):
- A promessa, sempre por baixo: "Vê o que te prende. Solta o que te faz repetir." Tudo o que escreves serve este gesto.
- O mecanismo são dois movimentos: VER (reconhecer o padrão sem te julgares, localizar e não condenar) e SOLTAR (largar o que viste, sem força, abrir só um dedo da mão). Regra de ouro: não há soltar sem ver. A pressa de mudar sem reconhecer é a repetição vestida de boa intenção.
- Os padrões que nos fazem repetir são "véus". Cada carrossel ajuda a pessoa a VER um véu e a SOLTAR um pouco, nunca a arrancá-lo à força.
- Autoridade do caminho: "reconheci primeiro em mim". NUNCA inventes biografia, marcos, anos, clientes nem consultório. Psicologia transpessoal e constelação familiar sistémica, em formação.`;

// Regras de voz invioláveis do método (acrescem às REGRAS_GLOBAIS do carrossel).
export const METODO_VOZ: string[] = [
  'TRAVESSÕES BANIDOS (— e –). Usa vírgulas, dois pontos, parênteses, ponto final. Nunca um travessão, em lado nenhum do texto.',
  'Português europeu, sereno, literário, sem hype, sem urgência artificial, sem pedestal.',
  'Nunca prometas cura nem uses linguagem de diagnóstico. Falas de reconhecimento, de erguer o véu, de ver e soltar.',
];

// As portas do método (Ver/Vir/Viver) e o todo (o 7.º véu, a raiz). Cada porta
// recolhe o seu cacho de véus e tem o seu produto. Canon de lib/metodo/contas.ts.
export interface Porta {
  movimento: Movimento;
  nome: string;
  essencia: string;
  veus: string;
  gesto: string;
  produtoSlug: string;
}

export const PORTAS: Record<Movimento, Porta> = {
  ver: {
    movimento: 'ver',
    nome: 'Ver',
    essencia: 'a consciência',
    veus: 'Turbilhão e Memória',
    gesto: 'sair de dentro da cabeça e ver a tempestade passar de terra',
    produtoSlug: 'ver-soltar',
  },
  vir: {
    movimento: 'vir',
    nome: 'Vir',
    essencia: 'o regresso',
    veus: 'Esforço e Desolação',
    gesto: 'parar de empurrar, regressar a si e deixar-se, enfim, segurar',
    produtoSlug: 'vir-soltar',
  },
  viver: {
    movimento: 'viver',
    nome: 'Viver',
    essencia: 'a integração',
    veus: 'Horizonte e Permanência',
    gesto: 'sair da sala de espera, tirar a armadura dos papéis e entrar na própria vida, agora',
    produtoSlug: 'viver-soltar',
  },
  todo: {
    movimento: 'todo',
    nome: 'O todo',
    essencia: 'a raiz, a Dualidade',
    veus: 'a Dualidade, a separação que está na raiz de todos',
    gesto: 'recolher os sete véus num só olhar, ver o que está sob todos eles',
    produtoSlug: 'os-7-veus',
  },
};

// O EIXO da semana: os 7 dias atravessam Ver -> Vir -> Viver e fecham no todo.
// Dois dias por movimento (a travessia respira), domingo é a raiz (o pilar).
export const EIXO_SEMANA: Movimento[] = ['ver', 'ver', 'vir', 'vir', 'viver', 'viver', 'todo'];

export const movimentoDoDia = (diaNum: number): Movimento =>
  EIXO_SEMANA[(diaNum - 1) % EIXO_SEMANA.length] ?? 'ver';

// As ofertas do método, com URLs reais. O pilar é a casa; os manuais são as
// portas. Ancoram os CTAs (o produto da loja entra como aprofundamento do tema).
export interface OfertaMetodo {
  slug: string;
  nome: string;
  preco: string;
  url: string;
  quandoUsar: string;
}

const DOMINIO = 'https://viviannedossantos.com';

export const METODO_OFERTAS: Record<string, OfertaMetodo> = {
  'os-7-veus': {
    slug: 'os-7-veus',
    nome: 'Os Sete Véus',
    preco: '€19',
    url: `${DOMINIO}/os-sete-veus`,
    quandoUsar: 'o mapa inteiro, o domingo/o todo, a raiz comum (Dualidade), quem quer ver os sete véus de uma vez',
  },
  'ver-soltar': {
    slug: 'ver-soltar',
    nome: 'ver.soltar',
    preco: '€9',
    url: `${DOMINIO}/ver-soltar`,
    quandoUsar: 'dias de VER: a cabeça que não pára, ansiedade, ruminação, viver preso a uma história antiga (Turbilhão, Memória)',
  },
  'vir-soltar': {
    slug: 'vir-soltar',
    nome: 'vir.soltar',
    preco: '€9',
    url: `${DOMINIO}/vir-soltar`,
    quandoUsar: 'dias de VIR: carregar tudo, culpa de descansar, medo do vazio e da solidão (Esforço, Desolação)',
  },
  'viver-soltar': {
    slug: 'viver-soltar',
    nome: 'viver.soltar',
    preco: '€9',
    url: `${DOMINIO}/viver-soltar`,
    quandoUsar: 'dias de VIVER: viver à espera de um quando, defender quem já não se é, medo de mudar (Horizonte, Permanência)',
  },
};

export const ofertaDoMovimento = (m: Movimento): OfertaMetodo =>
  METODO_OFERTAS[PORTAS[m].produtoSlug];

// Bloco de ofertas do método para o system prompt (a espinha dos CTAs).
export function metodoOfertasPrompt(): string {
  return Object.values(METODO_OFERTAS)
    .map((o) => `- [método] ${o.nome} (${o.preco}) — ${o.quandoUsar}. Link: ${o.url}`)
    .join('\n');
}

// Bloco que descreve o arco Ver->Vir->Viver->o todo desta semana, dia a dia,
// para o gerador costurar a semana e ancorar os CTAs. `numDias` por defeito 7.
export function eixoSemanaPrompt(numDias = 7): string {
  const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  const linhas = Array.from({ length: numDias }, (_, i) => {
    const m = movimentoDoDia(i + 1);
    const p = PORTAS[m];
    const of = ofertaDoMovimento(m);
    return `- ${DIAS[i] ?? `dia ${i + 1}`} · ${p.nome} (${p.essencia}): ler o território por este movimento, ${p.gesto}. Véus: ${p.veus}. CTA-âncora possível: ${of.nome} (${of.url}).`;
  });
  return `EIXO DA SEMANA (Método VS · as três portas como fio condutor):
A semana é uma travessia: os dias movem-se de VER (sair da tempestade) para VIR (regressar a si) para VIVER (entrar na própria vida), e fecham no TODO (a raiz, a Dualidade, o pilar). O território sazonal mantém-se; cada dia lê-o através do seu movimento (não achatar, é uma camada a mais, não a substituir).
${linhas.join('\n')}
O "fio" da jornada nomeia este arco Ver->Vir->Viver->o todo.`;
}
