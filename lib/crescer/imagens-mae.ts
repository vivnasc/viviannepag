// BANCO DE IMAGENS DA MÃE — a Vivianne só ARRASTA as imagens para o cesto da família;
// o sistema NOMEIA (timestamp) e CATEGORIZA (família → temas + modo) sozinho.
// Famílias = o gémeo fotográfico da geometria VDS (ver docs/referencias/IMAGENS-POR-TEMA.md).
// modo 'cena' = imagem inteira (full-bleed + véu); 'acento' = elemento em preto à direita (screen).

export type ModoImagem = 'cena' | 'acento';
export interface FamiliaImagem {
  id: string;        // slug do cesto (pasta no storage)
  nome: string;      // nome legível
  emoji: string;
  modo: ModoImagem;
  temas: string[];   // temas da mãe que esta família serve (ids de marca.ts)
  dica: string;      // o que arrastar para aqui
}

export const FAMILIAS: FamiliaImagem[] = [
  { id: 'portais', nome: 'Portais & limiar', emoji: '🚪', modo: 'cena', temas: ['emergencia', 'eumaior'], dica: 'portas/portais de luz, sol meio-submerso (a imagem-coroa do limiar)' },
  { id: 'agua', nome: 'Água & reflexos', emoji: '🌊', modo: 'cena', temas: ['campo', 'consciencia', 'sentido'], dica: 'água escura, reflexos âmbar, ondas' },
  { id: 'constelacao', nome: 'Constelação', emoji: '✷', modo: 'cena', temas: ['campo'], dica: 'redes de nós de luz (linhas finas)' },
  { id: 'vesica', nome: 'Círculos (vesica)', emoji: '⭕', modo: 'cena', temas: ['vinculos'], dica: 'dois círculos luminosos que se cruzam' },
  { id: 'orbita', nome: 'Órbita', emoji: '🪐', modo: 'cena', temas: ['sentido', 'ciclos'], dica: 'órbita luminosa com um nó' },
  { id: 'espiral', nome: 'Espiral (foto)', emoji: '🌀', modo: 'cena', temas: ['transformacao', 'ciclos'], dica: 'espiral dourada fotográfica (a desenhada continua abolida)' },
  { id: 'feixe', nome: 'Feixe de luz', emoji: '🔆', modo: 'cena', temas: ['sentido', 'consciencia'], dica: 'coluna/feixe de luz âmbar a emergir do escuro' },
  { id: 'poeira', nome: 'Poeira dourada', emoji: '✨', modo: 'cena', temas: ['consciencia'], dica: 'poeira/partículas douradas num raio' },
  { id: 'nevoa', nome: 'Névoa & fenda', emoji: '🌫️', modo: 'cena', temas: ['sombra', 'transformacao'], dica: 'névoa âmbar, fenda de luz a cortar a escuridão' },
  { id: 'luas', nome: 'Luas & eclipse', emoji: '🌑', modo: 'cena', temas: ['sombra', 'ciclos'], dica: 'luas, eclipse sobre água' },
  { id: 'interior', nome: 'Interiores quietos', emoji: '🪟', modo: 'cena', temas: ['corpo', 'desencaixe'], dica: 'cortinas de linho, janela, vaso, luz quente' },
  { id: 'folhas', nome: 'Folhas (em preto)', emoji: '🍂', modo: 'acento', temas: ['raizes', 'transformacao'], dica: 'ramo de folhas isolado em PRETO puro' },
  { id: 'flores', nome: 'Flores (em preto)', emoji: '🌸', modo: 'acento', temas: ['vinculos', 'raizes'], dica: 'flores isoladas em PRETO puro' },
  { id: 'raizes-ramos', nome: 'Raízes & ramos (em preto)', emoji: '🌿', modo: 'acento', temas: ['raizes'], dica: 'raízes, ramos secos, trigo em PRETO puro' },
];

export const familiaDe = (id: string): FamiliaImagem | undefined => FAMILIAS.find((f) => f.id === id);
export const familiasDoTema = (tema: string): FamiliaImagem[] => FAMILIAS.filter((f) => f.temas.includes(tema));

const hash = (s: string): number => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

// escolhe UMA imagem para uma peça (tema+seed), dado o BANCO real (família -> urls).
// devolve { url, modo } ou null (aí a peça sai em geometria). Determinístico por seed.
export function imagemDoTema(
  tema: string,
  seed: string,
  banco: Record<string, string[]>,
): { url: string; modo: ModoImagem; familia: string } | null {
  const fams = familiasDoTema(tema).filter((f) => (banco[f.id]?.length ?? 0) > 0);
  if (!fams.length) return null;
  const h = hash(String(seed || tema));
  const fam = fams[h % fams.length];
  const imgs = banco[fam.id];
  const url = imgs[h % imgs.length];
  return { url, modo: fam.modo, familia: fam.id };
}
