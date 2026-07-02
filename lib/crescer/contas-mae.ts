// As DUAS contas-mãe: a pessoal PT (@vivianne.dos.santos) e o selo internacional EN
// (@viviannewrites, página "Sete Ecos"). Mesmo motor, conteúdos nas duas línguas.
// O igBusinessId serve a PUBLICAÇÃO (Instagram Graph API) da conta EN.
export type Lingua = 'pt' | 'en';
export interface ContaMae { lingua: Lingua; handle: string; site?: string; igBusinessId?: string; pagina?: string }

export const CONTAS_MAE: Record<Lingua, ContaMae> = {
  pt: { lingua: 'pt', handle: '@vivianne.dos.santos', site: 'viviannedossantos.com' },
  en: { lingua: 'en', handle: '@viviannewrites', site: 'viviannedossantos.com', igBusinessId: '17841480220138511', pagina: 'Sete Ecos' },
};

export const contaMae = (lingua?: string): ContaMae => CONTAS_MAE[lingua === 'en' ? 'en' : 'pt'];
