// As CONTAS de Instagram geridas pela ferramenta. Hoje: a didática (veu.a.veu)
// e a LOJA (os 7 Véus). O conteúdo das duas vive na MESMA tabela
// (carousel_collections); distingue-se pelo theme — por isso a marca deteta-se,
// e cada conta tem as suas próprias credenciais (token + IG_USER_ID).

export type ContaId = 'veuaveu' | 'loja';

export const CONTAS: { id: ContaId; nome: string; emoji: string }[] = [
  { id: 'veuaveu', nome: 'Véu a Véu', emoji: '🌿' },
  { id: 'loja', nome: 'Loja · 7 Véus', emoji: '🛍️' },
];

// a que conta/marca pertence um conteúdo (pelo theme + slug).
export function contaDe(theme: { marca?: string; universo?: string; curso?: string } | null | undefined, slug = ''): ContaId {
  if (theme?.marca === 'loja' || theme?.marca === 'veuaveu') return theme.marca as ContaId;
  if (theme?.universo || /^semana-\d+-/.test(slug)) return 'loja';
  return 'veuaveu';
}

export const nomeConta = (id: ContaId) => CONTAS.find((c) => c.id === id)?.nome ?? id;
