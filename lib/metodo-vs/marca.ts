// MÉTODO VS · identidade da marca para o render kinético (espelho do SOULAB_SLIDE).
// A peça renderiza com a MESMA moldura limpa do Soulab, mas assinada pela Vivianne.

import { CONTAS, type ContaId } from '@/lib/metodo/contas';

export const METODOVS_MARCA = 'metodovs';
export const METODOVS_MUNDO = 'autora'; // a paleta da Vivianne (ouro), em PALETAS.

// props que o KineticSlide recebe para assinar como Método VS (não Soulab, não veu.a.veu).
// Rodapé: o NOME da conta (@handle) em cima, o SITE por baixo — nunca "Ancorar/Véu a Véu".
export const METODOVS_SLIDE: { selo: string | null; mostrarConceito: boolean; assinatura: string; site: string } = {
  selo: null,
  mostrarConceito: true,
  assinatura: '@vivianne.dos.santos',
  site: 'viviannedossantos.com',
};

// A MÃE + as 3 FILHAS partilham o MESMO motor e o MESMO estúdio. O que muda por conta:
//  - a MARCA (theme.marca) -> a conta de Instagram em que publica (lib/instagram/contas).
//  - o PREFIXO do slug -> isola as peças de cada conta (list/apagar/anti-repetição).
//  - a ASSINATURA do render (@handle de cada filha).
// A geração ancora-se à voz de cada conta (ver formatos.ts / gerar.ts).

export type MetodoVSContaId = ContaId; // 'mae' | 'ver' | 'vir' | 'viver'

export interface MetodoVSContaCfg {
  id: MetodoVSContaId;
  /** marca gravada em theme.marca (mãe = 'metodovs' -> loja; filhas = versoltar/…). */
  marca: string;
  /** prefixo dos slugs desta conta (isola as peças). */
  prefixo: string;
  /** nome no admin + emoji. */
  nome: string;
  emoji: string;
  /** assinatura do slide no render (o @handle de cada conta). */
  slide: typeof METODOVS_SLIDE;
  /** cor de acento do admin (= paleta.accent da conta). */
  cor: string;
}

// a assinatura do render por conta: o mesmo formato do METODOVS_SLIDE, mas com o
// @handle de cada filha (a mãe fica como está). A paleta visual continua 'autora'.
function slideDe(id: MetodoVSContaId): typeof METODOVS_SLIDE {
  if (id === 'mae') return METODOVS_SLIDE;
  const c = CONTAS[id];
  return { selo: null, mostrarConceito: true, assinatura: `@${c.handle}`, site: 'viviannedossantos.com' };
}

export const METODOVS_CONTAS: Record<MetodoVSContaId, MetodoVSContaCfg> = {
  mae: { id: 'mae', marca: METODOVS_MARCA, prefixo: 'metodovs', nome: 'a mãe', emoji: '✨', slide: slideDe('mae'), cor: CONTAS.mae.cor },
  ver: { id: 'ver', marca: CONTAS.ver.marca, prefixo: 'versoltar', nome: 'ver', emoji: CONTAS.ver.emoji, slide: slideDe('ver'), cor: CONTAS.ver.cor },
  vir: { id: 'vir', marca: CONTAS.vir.marca, prefixo: 'virsoltar', nome: 'vir', emoji: CONTAS.vir.emoji, slide: slideDe('vir'), cor: CONTAS.vir.cor },
  viver: { id: 'viver', marca: CONTAS.viver.marca, prefixo: 'viversoltar', nome: 'viver', emoji: CONTAS.viver.emoji, slide: slideDe('viver'), cor: CONTAS.viver.cor },
};

export const METODOVS_CONTAS_LISTA = [METODOVS_CONTAS.mae, METODOVS_CONTAS.ver, METODOVS_CONTAS.vir, METODOVS_CONTAS.viver];

export function metodoVSConta(id: string | null | undefined): MetodoVSContaCfg {
  return (id && (METODOVS_CONTAS as Record<string, MetodoVSContaCfg>)[id]) || METODOVS_CONTAS.mae;
}

// a assinatura do render para uma peça já gravada: pela marca da peça (mãe=metodovs,
// filhas=versoltar/…). Usada pelo render-veu para assinar cada conta com o seu @handle.
export function slideDaMarca(marca: string | null | undefined): typeof METODOVS_SLIDE {
  const c = METODOVS_CONTAS_LISTA.find((x) => x.marca === marca);
  return c ? c.slide : METODOVS_SLIDE;
}

// é uma marca do Método VS (mãe ou filha)? (para o render escolher a assinatura certa)
export function ehMarcaMetodoVS(marca: string | null | undefined): boolean {
  return !!marca && METODOVS_CONTAS_LISTA.some((x) => x.marca === marca);
}
