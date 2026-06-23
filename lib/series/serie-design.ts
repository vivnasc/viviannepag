// Design das séries diárias (seteveus.space), fiel ao escola-veus
// (docs/DESIGN-E-MOTIVOS): rotação editorial do "Hoje, em Mim" (Carta Noturna)
// e as 6 paletas. Partilhado pelo componente (look) e pelo gerador (tema do dia).

export type Ritual = { kicker: string; glifo: string; tema: string };

// chaves = dia da semana em PT (com acentos), como vêm do preview/agenda
export const ROTACAO: Record<string, Ritual> = {
  segunda: { kicker: 'hoje, reparo', glifo: '✶', tema: 'reparar numa verdade pequena que apareceu hoje, devagar' },
  'terça': { kicker: 'hoje, agradeço', glifo: '☉', tema: 'agradecer o que correu bem sem forçar; entrega e fé' },
  quarta: { kicker: 'hoje, solto', glifo: '◌', tema: 'soltar/deixar cair o que magoou ou não é teu para carregar' },
  quinta: { kicker: 'hoje, entendo', glifo: '〜', tema: 'uma verdade sobre ti própria que hoje ficou clara' },
  sexta: { kicker: 'hoje, celebro', glifo: '♢', tema: 'celebrar quem te amou, quem és, pequenas vitórias que ninguém vê' },
  'sábado': { kicker: 'esta noite, deixo', glifo: '◯', tema: 'dar ao corpo licença para parar; descansar sem ter de merecer primeiro' },
  domingo: { kicker: 'amanhã, escolho', glifo: '→', tema: 'intenção: escolher e confiar para amanhã, mesmo sem ver o caminho inteiro' },
};

export const CREME = '#F2E9D8'; // texto (rgb 242,233,216)
export const NOTURNA_BG = '#0E0820'; // fundo/vinheta (rgb 14,8,32)

export type PaletaId = 'carta-noturna' | 'luar-prata' | 'dourado' | 'rosa-incenso' | 'branco-puro' | 'verde-musgo' | 'azul-profundo';
export const PALETAS: Record<PaletaId, { nome: string; highlight: string }> = {
  'carta-noturna': { nome: 'Cobre + indigo', highlight: '#E2B184' }, // clareado p/ contraste (era #C28F60)
  'luar-prata': { nome: 'Luar Prata', highlight: '#CCCCDC' }, // rgb 204,204,220
  'dourado': { nome: 'Dourado Luminoso', highlight: '#D4A853' }, // rgb 212,168,83
  'rosa-incenso': { nome: 'Rosa Incenso', highlight: '#E6B0A0' }, // clareado p/ contraste (era #D4977C)
  'branco-puro': { nome: 'Branco Puro', highlight: '#E8E5DD' }, // rgb 232,229,221
  'verde-musgo': { nome: 'Verde Musgo', highlight: '#A8AF7A' }, // rgb 168,175,122
  'azul-profundo': { nome: 'Azul Profundo', highlight: '#86A6DB' }, // Júpiter, sabedoria
};

// Cada DIA tem o seu regente planetário (origem dos nomes dos dias) e uma paleta
// FIXA com a cor desse regente. A Vivianne é espiritual: a cor acompanha o dia.
export const REGENTE: Record<string, string> = {
  segunda: 'Lua', 'terça': 'Marte', quarta: 'Mercúrio', quinta: 'Júpiter',
  sexta: 'Vénus', 'sábado': 'Saturno', domingo: 'Sol',
};
export const PALETA_DO_DIA: Record<string, PaletaId> = {
  segunda: 'luar-prata',      // Lua — prata, reflexão/intuição
  'terça': 'carta-noturna',   // Marte — cobre quente, gratidão/fogo
  quarta: 'verde-musgo',      // Mercúrio — verde, ar/soltar
  quinta: 'azul-profundo',    // Júpiter — azul, sabedoria/aprender
  sexta: 'rosa-incenso',      // Vénus — rosa, amor/celebrar
  'sábado': 'branco-puro',    // Saturno/Sabbath — branco, descanso/templo
  domingo: 'dourado',         // Sol — dourado, luz/intenção
};
export const paletaDoDia = (dia?: string): PaletaId => (dia && PALETA_DO_DIA[dia]) || 'carta-noturna';

// Hora de publicação por série: a MANHÃ (VC Sabia) às 07h, quando as pessoas
// procuram motivação para começar o dia; a NOITE (Hoje em Mim) fecha o dia.
export const HORA_SERIE: Record<string, string> = { vcsabia: '07:00', hojeemmim: '21:00' };
