// As CONTAS de Instagram geridas pela ferramenta. O conteúdo de todas vive na
// MESMA tabela (carousel_collections); a conta deteta-se pelo theme.marca (ou,
// nas duas originais, por heurística). Cada conta tem as suas credenciais
// próprias (token + IG_USER_ID), ligadas em /admin/instagram.
//
// veu.a.veu = conteúdo gerado aqui. As outras recebem conteúdo sobretudo por
// importação de CSV (Metricool). (sete.ecos fica de fora, no fluxo próprio.)

export type ContaId = string;

// As 5 contas reais (as antigas synchim/freeme/infonte/loranne/ancient/escola
// foram removidas a pedido da Vivianne: já não existem).
export const CONTAS: { id: ContaId; nome: string; emoji: string }[] = [
  { id: 'loja', nome: 'vivianne.dos.santos', emoji: '🛍️' }, // conta-mãe
  { id: 'veuaveu', nome: 'veu.a.veu', emoji: '🌿' }, // didática
  // As 3 portas novas (livros). Método VS foi abolido: ver/vir/viver saíram do
  // Publicar e são substituídos por estas. Motor no molde da Soulab, distinguido
  // por theme.marca. Ver lib/portas/marca.ts.
  { id: 'medo', nome: 'assetefacesdomedo', emoji: '🕯️' }, // As Sete Faces do Medo
  { id: 'sinais', nome: 'os7sinaisdedesencaixe', emoji: '🚪' }, // Os 7 Sinais de Desencaixe
  { id: 'transicao', nome: 'agrandetransicao', emoji: '🌗' }, // A Grande Transição
  // Soulab · laboratório criativo da alma (motor PRÓPRIO, separado dos outros).
  // Conteúdo gerado em /admin/soulab, distinguido por theme.marca. Ver lib/soulab/*.
  { id: 'soulab', nome: 'soulab.studio', emoji: '🧪' },
];

const IDS = new Set(CONTAS.map((c) => c.id));

// a que conta/marca pertence um conteúdo (pelo theme + slug).
export function contaDe(theme: { marca?: string; universo?: string; curso?: string } | null | undefined, slug = ''): ContaId {
  if (theme?.marca && IDS.has(theme.marca)) return theme.marca; // marca explícita (ex.: importado por CSV)
  // Método VS (conta-mãe): publica na conta vivianne.dos.santos (loja), como as séries.
  if (theme?.marca === 'metodovs' || slug.startsWith('metodovs-')) return 'loja';
  // Crescer (crescimento & evolução): conteúdo da Vivianne, publica em vivianne.dos.santos.
  if (theme?.marca === 'crescer' || slug.startsWith('crescer-')) return 'loja';
  if (theme?.universo || /^semana-\d+-/.test(slug)) return 'loja'; // carrosséis 7 Véus
  return 'veuaveu';
}

export const nomeConta = (id: ContaId) => CONTAS.find((c) => c.id === id)?.nome ?? id;
