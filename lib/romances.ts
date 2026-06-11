// Os romances da Biblioteca de Véspera — aba Romances da Editora.
// Registo estático (sem fs em runtime): o texto vive em ficcao-plano/ e os
// PDFs finais são compostos fora do site; aqui gere-se a CAPA (Replicate) e
// a ficha de cada romance.

export type Romance = {
  slug: string;
  titulo: string;
  tituloEn: string;
  sub: string;
  estante: string;
  espelho: string;       // o ebook irmão de autoconhecimento
  capitulos: number;
  palavras: number;      // aproximado, edição pt
  // Cena da capa (sem texto na imagem; a tipografia entra na composição).
  cena: string;
};

// Estilo de capa dos romances: o gouache/storybook da casa (lib/banda/flux.ts)
// com paleta própria de Véspera.
export const ROMANCE_CAPA_ESTILO =
  'distinctive editorial illustration, soft gouache painting with visible brush texture and paper grain, hand-painted organic shapes, storybook-for-adults feel';
export const ROMANCE_CAPA_PALETA =
  'warm terracotta, sand, cream, sage green and deep dusk-blue palette';

export const ROMANCES: Romance[] = [
  {
    slug: 'rom-01-amparo',
    titulo: 'As Mãos de Amparo',
    tituloEn: "Amparo's Hands",
    sub: 'um romance de Véspera · Estante I · As Casas de Família',
    estante: 'I · As Casas de Família',
    espelho: 'A mãe que salva',
    capitulos: 12,
    palavras: 30000,
    cena: `book cover illustration, vertical composition: a pair of weathered older mother's hands gently cupped together, holding a tiny house with one warmly lit window, rising from the bottom of the frame; behind and above, at blue dusk, a small village of terracotta rooftops with thin chimney smoke between soft green mountains and a quiet river, warm lit windows; a low full moon, a few swallows; generous calm sky with empty space at the top third for a title; intimate, tender, quietly epic`,
  },
];

export function getRomance(slug: string): Romance | undefined {
  return ROMANCES.find((r) => r.slug === slug);
}
