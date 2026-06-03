// Overrides e regras do catalogo para o gerador de carrosseis semanais.
// O catalogo base e auto-derivado (produtos + colecoes + packs); aqui afinamos
// o "quando usar" por universo e regras de marca, sem ter de manter 70+ fichas
// a mao. Acrescenta entradas em OVERRIDES_PRODUTO so para casos especiais.

import type { ColecaoId } from '@/lib/colecoes';

// Mapa universo -> "mundo" visual do Estudio (define a paleta do carrossel).
// Os 7 universos da loja mapeiam para as 5 paletas existentes em PALETAS.
export const UNIVERSO_TO_MUNDO: Record<ColecaoId, 'freeme' | 'infonte' | 'synchim' | 'escola' | 'autora'> = {
  'freeme-mae': 'freeme',
  infonte: 'infonte',
  amor: 'synchim',
  forca: 'escola',
  prosperidade: 'autora',
  pertenca: 'escola',
  trabalho: 'infonte',
};

// "Quando usar" por universo — orienta o Claude a escolher o produto certo
// para o CTA conforme o tema do dia.
export const QUANDO_USAR_UNIVERSO: Record<ColecaoId, string> = {
  'freeme-mae': 'culpa materna, maternidade, lealdades invisiveis, o peso herdado, ser mae e ser ela',
  infonte: 'identidade, proposito, metas que nao sao tuas, a voz que decide o que conta, quem es alem do que fazes',
  amor: 'vinculo amoroso, casal, amar demais ou de menos, dependencia, ferida do apego',
  forca: 'sobrevivencia, luto, atravessar o escuro, dor que ninguem viu, resiliencia',
  prosperidade: 'dinheiro, valor proprio, escassez, heranca financeira, medo de receber, pagar para pertencer',
  pertenca: 'familia, amizade, lugar, nunca ser escolhida primeiro, exclusao, raizes',
  trabalho: 'vida profissional, vocacao, ocupar o teu tamanho, carreira, chamado',
};

// Regras de marca/voz que o gerador deve respeitar sempre.
export const REGRAS_GLOBAIS: string[] = [
  'Voz da Vivianne: portugues europeu, 2a pessoa do singular ("tu"), directo, terapeutico mas firme, sem chavoes nem jargao clinico.',
  'Imagistica concreta (fio, casa, silencio, gesto, mala, heranca). Frases curtas alternadas com reflexivas.',
  'Nunca prometer cura nem usar linguagem de "diagnostico". Falar de reconhecimento, espelho, travessia.',
  'O CTA aponta sempre a UM produto real do ecossistema (usa o nome e o link exactos da lista). Nunca inventes produtos nem URLs.',
  'Termina sempre numa linha curta com peso.',
];

// Overrides pontuais por slug de produto (opcional). Ex.: regra dura, nome
// alternativo, quandoUsar especifico. Vazio por defeito.
export const OVERRIDES_PRODUTO: Record<string, { quandoUsar?: string; regra?: string; nome?: string }> = {
  // 'ebook-01-culpa': { quandoUsar: 'culpa materna especifica, ebook fundador do FreeMe' },
};
