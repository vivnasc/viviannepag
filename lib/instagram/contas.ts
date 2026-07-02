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
  { id: 'loja', nome: 'vivianne.dos.santos', emoji: '🛍️' }, // conta-mãe (PT)
  { id: 'viviannewrites', nome: 'viviannewrites', emoji: '🕯️' }, // selo internacional (EN): a mãe em inglês
  { id: 'veuaveu', nome: 'veu.a.veu', emoji: '🌿' }, // didática
  // Método VS · as 3 portas (Ver, Vir, Viver). Conteúdo gerado em /admin/metodo,
  // distinguido por theme.marca. Ver lib/metodo/contas.ts.
  { id: 'versoltar', nome: 'ver.soltar', emoji: '🌊' }, // a margem
  { id: 'virsoltar', nome: 'vir.soltar', emoji: '🤲' }, // o colo
  { id: 'viversoltar', nome: 'viver.soltar', emoji: '🌅' }, // descalça (o limiar)
  // Soulab · laboratório criativo da alma (motor PRÓPRIO, separado dos outros).
  // Conteúdo gerado em /admin/soulab, distinguido por theme.marca. Ver lib/soulab/*.
  { id: 'soulab', nome: 'soulab.studio', emoji: '🧪' },
  // Soulab EN · o mesmo laboratório em inglês, noutra conta (como @viviannewrites
  // é a mãe em inglês). Detecta-se pelo slug 'soulab-en-'. O @ real fica em
  // lib/soulab/marca.ts (SOULAB_EN.handle); liga o token em /admin/instagram.
  { id: 'soulaben', nome: 'soulab_en', emoji: '🧪' },
];

const IDS = new Set(CONTAS.map((c) => c.id));

// IG_USER_ID já conhecidos por conta — para PRÉ-PREENCHER o campo em /admin/instagram
// (a Vivianne só cola o token) e como rede de segurança na publicação. A verdade
// final vive na config privada depois de a conta ser ligada.
// NOTA soulab_en: o 1106738169200002 era o ID da PÁGINA do Facebook, não da conta de
// Instagram (dava erro nº100 ao publicar). O ID certo do IG descobre-se no "testar"
// da página /admin/instagram (botão "usar este ID"); por isso já não se pré-preenche.
export const IG_ID_CONHECIDO: Partial<Record<ContaId, string>> = {};

// a que conta/marca pertence um conteúdo (pelo theme + slug).
export function contaDe(theme: { marca?: string; universo?: string; curso?: string } | null | undefined, slug = ''): ContaId {
  // Soulab EN (@ internacional): tem de vir ANTES da marca explícita — a marca é
  // 'soulab' (=conta id da PT) nas duas línguas, por isso é o slug que distingue.
  if (slug.startsWith('soulab-en-')) return 'soulaben';
  if (theme?.marca && IDS.has(theme.marca)) return theme.marca; // marca explícita (ex.: importado por CSV)
  // Método VS (conta-mãe): publica na conta vivianne.dos.santos (loja), como as séries.
  if (theme?.marca === 'metodovs' || slug.startsWith('metodovs-')) return 'loja';
  // Crescer (crescimento & evolução): PT publica em vivianne.dos.santos; EN (@viviannewrites)
  // detecta-se pelo slug 'crescer-en-' (a geração prefixa a língua).
  if (slug.startsWith('crescer-en-')) return 'viviannewrites';
  if (theme?.marca === 'crescer' || slug.startsWith('crescer-')) return 'loja';
  if (theme?.universo || /^semana-\d+-/.test(slug)) return 'loja'; // carrosséis 7 Véus
  return 'veuaveu';
}

export const nomeConta = (id: ContaId) => CONTAS.find((c) => c.id === id)?.nome ?? id;
