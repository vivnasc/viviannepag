// Analytics do Instagram via Graph API oficial. Para cada conta (token +
// IG_USER_ID) buscamos: dados do perfil (seguidores), os posts recentes com
// gostos/comentários (campos básicos — NÃO precisam de insights), e, quando o
// token tem a permissão instagram_manage_insights, métricas mais fundas por post
// (alcance, guardados, partilhas, views). Degrada com elegância: se faltar a
// permissão, mostramos o básico e avisamos.

const GRAPH = 'https://graph.facebook.com/v21.0';

async function gget(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GRAPH}/${path}?${qs}`);
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function erroDe(j: Record<string, unknown>): string | undefined {
  const e = j?.error as { message?: string; code?: number } | undefined;
  return e?.message ? `${e.message}${e.code ? ` (${e.code})` : ''}` : undefined;
}

export type PostAnalytics = {
  id: string;
  caption: string;
  tipo: string;            // IMAGE | VIDEO | CAROUSEL_ALBUM
  formato: string;         // FEED | REELS | ...
  data: string;            // timestamp ISO
  permalink: string;
  gostos: number;
  comentarios: number;
  alcance?: number;        // insights (se permitido)
  guardados?: number;
  partilhas?: number;
  views?: number;
  interacoes?: number;     // gostos+comentários+guardados+partilhas
};

export type ContaAnalytics = {
  ok: boolean;
  username?: string;
  seguidores?: number;
  totalPosts?: number;
  insightsDisponiveis: boolean;  // o token tem instagram_manage_insights?
  posts: PostAnalytics[];
  erro?: string;
  avisoInsights?: string;        // mensagem se as métricas fundas falharam
};

type MediaRaw = {
  id: string; caption?: string; media_type?: string; media_product_type?: string;
  timestamp?: string; permalink?: string; like_count?: number; comments_count?: number;
};

// métricas de insights por post, conforme o formato. 'views' só faz sentido em vídeo/reel.
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

export async function getContaAnalytics(token: string, igUserId: string, limite = 12): Promise<ContaAnalytics> {
  if (!token || !igUserId) return { ok: false, insightsDisponiveis: false, posts: [], erro: 'conta sem token/ID' };

  // perfil
  const perfil = await gget(igUserId, { fields: 'username,followers_count,media_count', access_token: token });
  const erroPerfil = erroDe(perfil);
  if (erroPerfil) return { ok: false, insightsDisponiveis: false, posts: [], erro: erroPerfil };

  // posts recentes (campos básicos — sem insights)
  const mediaResp = await gget(`${igUserId}/media`, {
    fields: 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count',
    limit: String(limite),
    access_token: token,
  });
  const media = (mediaResp.data as MediaRaw[] | undefined) ?? [];

  // insights por post (em paralelo). Se o 1º falhar por permissão, marcamos como indisponível.
  let insightsDisponiveis = true;
  let avisoInsights: string | undefined;

  const posts: PostAnalytics[] = await Promise.all(media.map(async (m) => {
    const formato = m.media_product_type ?? m.media_type ?? 'FEED';
    const base: PostAnalytics = {
      id: m.id,
      caption: (m.caption ?? '').slice(0, 140),
      tipo: m.media_type ?? '—',
      formato,
      data: m.timestamp ?? '',
      permalink: m.permalink ?? '',
      gostos: m.like_count ?? 0,
      comentarios: m.comments_count ?? 0,
    };
    const ins = await insightsDoPost(m.id, formato, token);
    if (ins.erro) {
      insightsDisponiveis = false;
      if (!avisoInsights) avisoInsights = ins.erro;
      return base;
    }
    return {
      ...base,
      alcance: ins.vals.reach,
      guardados: ins.vals.saved,
      partilhas: ins.vals.shares,
      views: ins.vals.views,
      interacoes: ins.vals.total_interactions,
    };
  }));

  return {
    ok: true,
    username: perfil.username as string | undefined,
    seguidores: perfil.followers_count as number | undefined,
    totalPosts: perfil.media_count as number | undefined,
    insightsDisponiveis,
    avisoInsights: insightsDisponiveis ? undefined : avisoInsights,
    posts,
  };
}
