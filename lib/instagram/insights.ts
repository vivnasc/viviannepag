// Analytics do Instagram via Graph API oficial. Para cada conta (token +
// IG_USER_ID): perfil (seguidores) + posts recentes com gostos/comentários
// (campos básicos) e, quando o token tem instagram_manage_insights, métricas
// fundas por post (alcance, guardados, partilhas, views). Calcula ainda um
// RESUMO (médias, taxa de interação, desempenho por formato) para o painel de
// comparação. Degrada com elegância se faltar a permissão.

const GRAPH = 'https://graph.facebook.com/v21.0';

async function gget(path: string, params: Record<string, string>, tentativa = 0): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GRAPH}/${path}?${qs}`);
  const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const code = (j?.error as { code?: number } | undefined)?.code;
  if ((code === 1 || code === 2) && tentativa < 2) {
    await new Promise((r) => setTimeout(r, 800 * (tentativa + 1)));
    return gget(path, params, tentativa + 1);
  }
  return j;
}

function erroDe(j: Record<string, unknown>): string | undefined {
  const e = j?.error as { message?: string; code?: number; error_subcode?: number; type?: string } | undefined;
  if (!e) return undefined;
  const partes = [e.message ?? 'erro'];
  if (e.code != null) partes.push(`code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''}`);
  if (e.type) partes.push(e.type);
  return partes.join(' · ');
}

// nome amigável do formato
export function nomeFormato(f: string): string {
  if (f === 'REELS') return 'Reels';
  if (f === 'CAROUSEL_ALBUM') return 'Carrossel';
  if (f === 'VIDEO') return 'Vídeo';
  if (f === 'IMAGE' || f === 'FEED') return 'Imagem';
  return f;
}

export type PostAnalytics = {
  id: string;
  caption: string;
  tipo: string;
  formato: string;        // REELS | CAROUSEL_ALBUM | IMAGE | ...
  data: string;
  permalink: string;
  thumbnail?: string;
  gostos: number;
  comentarios: number;
  alcance?: number;
  guardados?: number;
  partilhas?: number;
  views?: number;
  interacoes: number;     // total (insights ou soma dos básicos)
};

export type FormatoResumo = { formato: string; n: number; mediaAlcance: number; mediaInteracoes: number };

export type Resumo = {
  mediaAlcance: number;
  mediaInteracoes: number;
  taxaInteracao: number;   // % interações / alcance
  porFormato: FormatoResumo[];
  melhorFormato?: string;
};

export type Crescimento = {
  novos30d?: number;             // novos seguidores ganhos nos últimos ~30 dias
  porSemana?: number;            // média de novos seguidores por semana
  alcanceDescobertaPct?: number; // % do alcance que foi a NÃO-seguidores (descoberta)
  alcance30d?: number;           // contas alcançadas (28d)
  visualizacoes30d?: number;     // visualizações (28d)
  alcanceVarPct?: number;        // variação do alcance vs 28 dias anteriores (%)
};

export type ContaAnalytics = {
  ok: boolean;
  username?: string;
  seguidores?: number;
  totalPosts?: number;
  insightsDisponiveis: boolean;
  posts: PostAnalytics[];
  resumo?: Resumo;
  crescimento?: Crescimento;
  demografia?: Demografia;
  erro?: string;
  avisoInsights?: string;
};

export type ParItem = { k: string; n: number };
export type Demografia = { idade?: ParItem[]; genero?: ParItem[]; pais?: ParItem[]; fonte?: string };

// DEMOGRAFIA de QUEM TE VÊ (contas alcançadas), não dos seguidores. Tenta, por
// ordem: alcançadas → que interagem → seguidores (fallback). Idade, género, país.
// Só com volume suficiente (100+); senão devolve undefined.
async function getDemografia(token: string, igUserId: string): Promise<Demografia | undefined> {
  const umBreakdown = async (metric: string, dim: string): Promise<ParItem[] | undefined> => {
    try {
      const j = await gget(`${igUserId}/insights`, { metric, period: 'lifetime', metric_type: 'total_value', timeframe: 'last_30_days', breakdown: dim, access_token: token });
      if (erroDe(j)) return undefined;
      const results = ((j.data as { total_value?: { breakdowns?: { results?: { dimension_values?: string[]; value?: number }[] }[] } }[] | undefined)?.[0]?.total_value?.breakdowns?.[0]?.results) ?? [];
      const arr = results.map((r) => ({ k: r.dimension_values?.[0] ?? '?', n: r.value ?? 0 })).sort((a, b) => b.n - a.n);
      return arr.length ? arr : undefined;
    } catch { return undefined; }
  };
  const tentar: { metric: string; fonte: string }[] = [
    { metric: 'reached_audience_demographics', fonte: 'quem te vê (alcançadas)' },
    { metric: 'engaged_audience_demographics', fonte: 'quem interage' },
    { metric: 'follower_demographics', fonte: 'seguidores' },
  ];
  for (const { metric, fonte } of tentar) {
    const [idade, genero, pais] = await Promise.all([umBreakdown(metric, 'age'), umBreakdown(metric, 'gender'), umBreakdown(metric, 'country')]);
    if (idade || genero || pais) return { idade, genero, pais: pais?.slice(0, 6), fonte };
  }
  return undefined;
}

// métricas de CONTA (crescimento): novos seguidores (30d) + alcance a não-seguidores.
// Cada parte é best-effort (degrada se a API recusar uma delas).
async function getCrescimento(token: string, igUserId: string): Promise<Crescimento> {
  const cres: Crescimento = {};
  // novos seguidores nos últimos 30 dias
  try {
    const until = Math.floor(Date.now() / 1000);
    const since = until - 30 * 86400;
    const j = await gget(`${igUserId}/insights`, { metric: 'follower_count', period: 'day', since: String(since), until: String(until), access_token: token });
    const vals = ((j.data as { values?: { value?: number }[] }[] | undefined)?.[0]?.values) ?? [];
    if (vals.length) {
      const soma = vals.reduce((a, v) => a + (v.value ?? 0), 0);
      cres.novos30d = soma;
      cres.porSemana = Math.round(soma / Math.max(1, vals.length / 7));
    }
  } catch { /* sem dados de seguidores */ }
  // alcance: % a não-seguidores (descoberta)
  try {
    const j = await gget(`${igUserId}/insights`, { metric: 'reach', period: 'days_28', metric_type: 'total_value', breakdown: 'follow_type', access_token: token });
    const results = ((j.data as { total_value?: { breakdowns?: { results?: { dimension_values?: string[]; value?: number }[] }[] } }[] | undefined)?.[0]?.total_value?.breakdowns?.[0]?.results) ?? [];
    let f = 0, nf = 0;
    for (const r of results) { const dim = r.dimension_values?.[0]; if (dim === 'follower') f = r.value ?? 0; else if (dim === 'non_follower') nf = r.value ?? 0; }
    if (f + nf > 0) cres.alcanceDescobertaPct = Math.round((nf / (f + nf)) * 1000) / 10;
  } catch { /* sem breakdown de alcance */ }
  // contas alcançadas (28d) — o número grande
  try {
    const j = await gget(`${igUserId}/insights`, { metric: 'reach', period: 'days_28', metric_type: 'total_value', access_token: token });
    const v = ((j.data as { total_value?: { value?: number } }[] | undefined)?.[0]?.total_value?.value);
    if (typeof v === 'number') cres.alcance30d = v;
  } catch { /* sem alcance de conta */ }
  // visualizações (28d)
  try {
    const j = await gget(`${igUserId}/insights`, { metric: 'views', period: 'days_28', metric_type: 'total_value', access_token: token });
    const v = ((j.data as { total_value?: { value?: number } }[] | undefined)?.[0]?.total_value?.value);
    if (typeof v === 'number') cres.visualizacoes30d = v;
  } catch { /* sem visualizações */ }
  // variação do alcance vs 28 dias anteriores (best-effort)
  try {
    const dia = 86400, until = Math.floor(Date.now() / 1000);
    const a = await gget(`${igUserId}/insights`, { metric: 'reach', metric_type: 'total_value', period: 'day', since: String(until - 28 * dia), until: String(until), access_token: token });
    const b = await gget(`${igUserId}/insights`, { metric: 'reach', metric_type: 'total_value', period: 'day', since: String(until - 56 * dia), until: String(until - 28 * dia), access_token: token });
    const va = ((a.data as { total_value?: { value?: number } }[] | undefined)?.[0]?.total_value?.value);
    const vb = ((b.data as { total_value?: { value?: number } }[] | undefined)?.[0]?.total_value?.value);
    if (typeof va === 'number' && typeof vb === 'number' && vb > 0) cres.alcanceVarPct = Math.round(((va - vb) / vb) * 1000) / 10;
  } catch { /* sem variação */ }
  return cres;
}

type Child = { media_url?: string; thumbnail_url?: string };
type MediaRaw = {
  id: string; caption?: string; media_type?: string; media_product_type?: string;
  timestamp?: string; permalink?: string; like_count?: number; comments_count?: number;
  media_url?: string; thumbnail_url?: string; children?: { data?: Child[] };
};

function metricasDe(formato: string): string[] {
  const base = ['reach', 'saved', 'shares', 'total_interactions'];
  if (formato === 'REELS' || formato === 'VIDEO') base.push('views');
  return base;
}

async function insightsDoPost(id: string, formato: string, token: string): Promise<{ vals: Record<string, number>; erro?: string }> {
  const j = await gget(`${id}/insights`, { metric: metricasDe(formato).join(','), access_token: token });
  const erro = erroDe(j);
  if (erro) return { vals: {}, erro };
  const vals: Record<string, number> = {};
  for (const item of (j.data as { name: string; values?: { value?: number }[] }[] | undefined) ?? []) {
    vals[item.name] = item.values?.[0]?.value ?? 0;
  }
  return { vals };
}

function thumbDe(m: MediaRaw): string | undefined {
  return m.thumbnail_url || m.media_url || m.children?.data?.[0]?.thumbnail_url || m.children?.data?.[0]?.media_url;
}

const media = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

function calcResumo(posts: PostAnalytics[]): Resumo | undefined {
  const comAlcance = posts.filter((p) => p.alcance != null) as (PostAnalytics & { alcance: number })[];
  const mediaAlcance = media(comAlcance.map((p) => p.alcance));
  const mediaInteracoes = media(posts.map((p) => p.interacoes));
  const somaAlc = comAlcance.reduce((a, p) => a + p.alcance, 0);
  const somaInt = comAlcance.reduce((a, p) => a + p.interacoes, 0);
  const taxaInteracao = somaAlc > 0 ? Math.round((somaInt / somaAlc) * 1000) / 10 : 0;

  const grupos = new Map<string, PostAnalytics[]>();
  for (const p of posts) {
    const arr = grupos.get(p.formato) ?? [];
    arr.push(p); grupos.set(p.formato, arr);
  }
  const porFormato: FormatoResumo[] = [...grupos.entries()].map(([formato, ps]) => ({
    formato,
    n: ps.length,
    mediaAlcance: media(ps.filter((p) => p.alcance != null).map((p) => p.alcance as number)),
    mediaInteracoes: media(ps.map((p) => p.interacoes)),
  })).sort((a, b) => b.mediaAlcance - a.mediaAlcance);

  const melhorFormato = porFormato.find((f) => f.mediaAlcance > 0)?.formato ?? porFormato[0]?.formato;
  return { mediaAlcance, mediaInteracoes, taxaInteracao, porFormato, melhorFormato };
}

export async function getContaAnalytics(token: string, igUserId: string, limite = 18): Promise<ContaAnalytics> {
  if (!token || !igUserId) return { ok: false, insightsDisponiveis: false, posts: [], erro: 'conta sem token/ID' };

  const perfil = await gget(igUserId, { fields: 'username,followers_count,media_count', access_token: token });
  const erroPerfil = erroDe(perfil);
  if (erroPerfil) return { ok: false, insightsDisponiveis: false, posts: [], erro: erroPerfil };

  const mediaResp = await gget(`${igUserId}/media`, {
    fields: 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count,media_url,thumbnail_url,children{media_url,thumbnail_url}',
    limit: String(limite),
    access_token: token,
  });
  const lista = (mediaResp.data as MediaRaw[] | undefined) ?? [];

  let insightsDisponiveis = true;
  let avisoInsights: string | undefined;

  const posts: PostAnalytics[] = await Promise.all(lista.map(async (m) => {
    const formato = m.media_product_type ?? m.media_type ?? 'IMAGE';
    const gostos = m.like_count ?? 0;
    const comentarios = m.comments_count ?? 0;
    const base: PostAnalytics = {
      id: m.id, caption: (m.caption ?? '').slice(0, 140), tipo: m.media_type ?? '—', formato,
      data: m.timestamp ?? '', permalink: m.permalink ?? '', thumbnail: thumbDe(m),
      gostos, comentarios, interacoes: gostos + comentarios,
    };
    const ins = await insightsDoPost(m.id, formato, token);
    if (ins.erro) {
      insightsDisponiveis = false;
      if (!avisoInsights) avisoInsights = ins.erro;
      return base;
    }
    const guardados = ins.vals.saved ?? 0;
    const partilhas = ins.vals.shares ?? 0;
    return {
      ...base,
      alcance: ins.vals.reach,
      guardados, partilhas, views: ins.vals.views,
      interacoes: ins.vals.total_interactions ?? (gostos + comentarios + guardados + partilhas),
    };
  }));

  const crescimento = await getCrescimento(token, igUserId);
  // demografia só a partir de 100 seguidores (limite do Instagram) — evita chamadas inúteis
  const seguidores = perfil.followers_count as number | undefined;
  const demografia = (seguidores ?? 0) >= 100 ? await getDemografia(token, igUserId) : undefined;

  return {
    ok: true,
    username: perfil.username as string | undefined,
    seguidores,
    totalPosts: perfil.media_count as number | undefined,
    insightsDisponiveis,
    avisoInsights: insightsDisponiveis ? undefined : avisoInsights,
    posts,
    resumo: calcResumo(posts),
    crescimento,
    demografia,
  };
}
