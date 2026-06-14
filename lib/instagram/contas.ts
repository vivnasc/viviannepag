// As CONTAS de Instagram geridas pela ferramenta. O conteúdo de todas vive na
// MESMA tabela (carousel_collections); a conta deteta-se pelo theme.marca (ou,
// nas duas originais, por heurística). Cada conta tem as suas credenciais
// próprias (token + IG_USER_ID), ligadas em /admin/instagram.
//
// veu.a.veu = conteúdo gerado aqui. As outras recebem conteúdo sobretudo por
// importação de CSV (Metricool). (sete.ecos fica de fora, no fluxo próprio.)

export type ContaId = string;

export const CONTAS: { id: ContaId; nome: string; emoji: string }[] = [
  { id: 'veuaveu', nome: 'Véu a Véu', emoji: '🌿' },
  { id: 'loja', nome: 'vivianne.dos.santos', emoji: '🛍️' },
  { id: 'synchim', nome: 'synchim.app', emoji: '🔄' },
  { id: 'freeme', nome: 'freeme_app', emoji: '🕊️' },
  { id: 'infonte', nome: 'infonte.app', emoji: '💧' },
  { id: 'loranne', nome: 'loranne_music', emoji: '🎵' },
  { id: 'ancient', nome: 'ancient.ground', emoji: '🌑' },
  { id: 'escola', nome: 'escola_dos_veus', emoji: '📿' },
  // Método VS · as 3 portas (Ver, Vir, Viver). Conteúdo gerado em /admin/metodo,
  // distinguido por theme.marca. Ver lib/metodo/contas.ts.
  { id: 'versoltar', nome: 'ver.soltar', emoji: '🕯️' },
  { id: 'virsoltar', nome: 'vir.soltar', emoji: '🕯️' },
  { id: 'viversoltar', nome: 'viver.soltar', emoji: '🕯️' },
];

const IDS = new Set(CONTAS.map((c) => c.id));

// a que conta/marca pertence um conteúdo (pelo theme + slug).
export function contaDe(theme: { marca?: string; universo?: string; curso?: string } | null | undefined, slug = ''): ContaId {
  if (theme?.marca && IDS.has(theme.marca)) return theme.marca; // marca explícita (ex.: importado por CSV)
  if (theme?.universo || /^semana-\d+-/.test(slug)) return 'loja'; // carrosséis 7 Véus
  return 'veuaveu';
}

export const nomeConta = (id: ContaId) => CONTAS.find((c) => c.id === id)?.nome ?? id;
