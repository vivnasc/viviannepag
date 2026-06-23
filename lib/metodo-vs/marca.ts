// MÉTODO VS · identidade da marca para o render kinético (espelho do SOULAB_SLIDE).
// A peça renderiza com a MESMA moldura limpa do Soulab, mas assinada pela Vivianne.

export const METODOVS_MARCA = 'metodovs';
export const METODOVS_MUNDO = 'autora'; // a paleta da Vivianne (ouro), em PALETAS.

// props que o KineticSlide recebe para assinar como Método VS (não Soulab, não veu.a.veu).
export const METODOVS_SLIDE: { selo: string | null; mostrarConceito: boolean; assinatura: string; site: string } = {
  selo: null,
  mostrarConceito: true,
  assinatura: '@vivianne.dos.santos',
  site: 'Ver e Soltar',
};
