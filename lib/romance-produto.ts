// Os romances da Biblioteca de Véspera como produtos da loja.
// Amparo (rom-01-amparo) é OFERTA (RomanceGate); os outros 11 são pagos e
// entregues na hora pelo mesmo fluxo de toda a loja. Esta é a fonte única da
// ficha de loja de cada romance (PT e EN), partilhada pelo seed de produtos,
// pela página /loja/[slug] e pela CTA das landings dos romances.
import { ROMANCES, type Romance } from '@/lib/romances';

export const PRECO_ROMANCE = '€12';
export const ROMANCE_BADGE = 'romance';

// Os 11 pagos (tudo menos o Amparo grátis).
export const ROMANCES_PAGOS: Romance[] = ROMANCES.filter((r) => r.slug !== 'rom-01-amparo');

// rom-slug -> rota pública da landing (sem prefixo de locale).
export const ROMANCE_ROTA: Record<string, string> = {
  'rom-01-amparo': '/amparo',
  'rom-tradutora': '/a-tradutora',
  'rom-sentinela': '/a-sentinela',
  'rom-ferrolho': '/o-ferrolho',
  'rom-irma': '/nome-da-irma',
  'rom-estrada': '/a-estrada-nova',
  'rom-portas': '/as-portas-baixas',
  'rom-caderno': '/caderno-das-dividas',
  'rom-cheias': '/homem-das-cheias',
  'rom-incomodo': '/nenhum-incomodo',
  'rom-frio': '/mulher-que-nunca-teve-frio',
  'rom-fabrica': '/enquanto-a-fabrica-dorme',
  'rom-despensa': '/a-despensa-cheia',
  'rom-presente': '/o-presente-por-abrir',
  'rom-casa-acabar': '/a-casa-por-acabar',
  'rom-trovoada': '/a-trovoada',
};

export function isRomanceSlug(slug: string): boolean {
  return slug.startsWith('rom-') && slug !== 'rom-01-amparo';
}

// rota pública (sem barra) -> rom-slug. Para as landings saberem o seu produto.
export const ROTA_PARA_ROM: Record<string, string> = Object.fromEntries(
  Object.entries(ROMANCE_ROTA).map(([rom, rota]) => [rota.replace(/^\//, ''), rom]),
);

// Subtítulo de loja (linha de categoria; a venda real é feita na landing, com a
// amostra). O `sub` já traz "um romance de Véspera · Estante X · ...".
export function romanceSubtituloPt(r: Romance): string {
  return r.sub.replace(/^um romance/, 'Um romance');
}
export function romanceSubtituloEn(r: Romance): string {
  return `A novel of Véspera · Shelf ${r.estante.split(' · ')[0]}`;
}

export function romanceDescricaoPt(r: Romance): string {
  return `**Romance da Biblioteca de Véspera · ${r.capitulos} capítulos · ~${r.palavras.toLocaleString('pt-PT')} palavras · PDF imediato**

${romanceSubtituloPt(r)}

Um romance inteiro de Véspera, a vila onde cada história é uma travessia. Lê o primeiro capítulo na página do livro antes de levares o resto.

Por Vivianne dos Santos.`;
}

export function romanceDescricaoEn(r: Romance): string {
  return `**A novel from the Véspera Library · ${r.capitulos} chapters · ~${r.palavras.toLocaleString('en-US')} words · Immediate PDF**

${romanceSubtituloEn(r)}

A whole novel of Véspera, the village where every story is a crossing. Read the first chapter on the book's page before you take the rest.

By Vivianne dos Santos.`;
}

// Sobreposição EN para a página /loja/[slug] (a DB guarda só PT).
export function romanceProdutoEn(r: Romance): { titulo: string; subtitulo: string; descricao: string } {
  return {
    titulo: r.tituloEn,
    subtitulo: romanceSubtituloEn(r),
    descricao: romanceDescricaoEn(r),
  };
}
