// Produtos/ofertas ANTERIORES da Vivianne — o ecossistema que ja existia antes
// da loja. Expandir nao e cortar: os carrosseis usam ESTES (com os seus links
// proprios) E os produtos novos da loja. Links confirmados na homepage
// (components/home/Mundos.tsx) e nos CTAs reais dos 7 Veus.
//
// >>> Se algum link/nome mudar, edita aqui.

export type OfertaAnterior = {
  nome: string;
  tipo: string;
  descricao: string;
  quandoUsar: string;
  url: string;
};

export const OFERTAS_ANTERIORES: OfertaAnterior[] = [
  {
    nome: 'LUMINA — espelho gratuito',
    tipo: 'recurso gratuito',
    descricao: '7 perguntas, 2 minutos. Não para te diagnosticar, para te devolver a ti.',
    quandoUsar: 'CTA generoso e não-vendedor, auto-reflexão, porta de entrada suave',
    url: 'https://app.seteecos.com/lumina',
  },
  {
    nome: 'Loranne — música contemplativa',
    tipo: 'música',
    descricao: 'Música, som e silêncio como forma de estar no mundo. A prática da presença.',
    quandoUsar: 'temas de presença, descanso, corpo, silêncio, água, repouso',
    url: 'https://music.seteveus.space',
  },
  {
    nome: 'Sete Ecos — comunidade',
    tipo: 'comunidade',
    descricao: 'Uma comunidade de mulheres que continuam. Sem máscara, sem prova, sem certeza.',
    quandoUsar: 'pertença, continuidade, caminho acompanhado, não estar só',
    url: 'https://app.seteecos.com',
  },
  {
    nome: 'Os 7 Véus do Despertar — livro',
    tipo: 'livro',
    descricao: 'O livro que nomeia o que está a gestar em ti. Sete véus, sete despertares, ao teu ritmo.',
    quandoUsar: 'gestação, despertar, jornada interior longa, mistério',
    url: 'https://seteveus.space/livro-fisico',
  },
  {
    nome: 'Escola dos Véus',
    tipo: 'formação',
    descricao: 'Formação e aprofundamento nos sete véus, para quem quer estudar a fundo.',
    quandoUsar: 'quem quer ir mais fundo, estudo, processo longo',
    url: 'https://escoladosveus.space',
  },
];

export function ofertasAnterioresPrompt(): string {
  return OFERTAS_ANTERIORES
    .map((o) => `- [${o.tipo}] ${o.nome} — ${o.descricao} Quando usar: ${o.quandoUsar}. Link: ${o.url}`)
    .join('\n');
}
