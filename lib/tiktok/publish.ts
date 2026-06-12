// Publicação no TikTok via Content Posting API v2 (oficial).
//
// Diferenças face ao Instagram (importante perceber):
//  - O TikTok publica o vídeo por PULL_FROM_URL: damos-lhe um URL HTTPS público
//    do MP4 (os nossos estão no Supabase Storage público, tal como os Reels).
//    ATENÇÃO: o PULL_FROM_URL exige verificar o DOMÍNIO/PREFIXO do URL no portal
//    de programador do TikTok (URL properties). Sem isso, recusa.
//  - Dois modos de publicação:
//      'rascunho' (inbox) — vai para a caixa de entrada/rascunhos da conta; a
//        Vivianne acaba à mão na app. FUNCIONA SEM AUDITORIA. Scope video.upload.
//      'direto' — publica logo no perfil. Só com app AUDITADA pode ser PÚBLICO;
//        sem auditoria só permite privacidade SELF_ONLY. Scope video.publish.
//  - OAuth por conta: access_token dura 24h, refresh_token 365 dias. O cron
//    diário renova com renovarToken().
//
// Fluxo de um vídeo: init (devolve publish_id) -> sondar status até concluir.

const OAUTH = 'https://open.tiktokapis.com/v2/oauth/token/';
const API = 'https://open.tiktokapis.com/v2';
const AUTORIZAR = 'https://www.tiktok.com/v2/auth/authorize/';

// Scopes que pedimos no login. video.upload basta para rascunho; video.publish
// é preciso para publicação direta (pós-auditoria). Pedimos ambos já.
export const SCOPES = ['user.info.basic', 'video.upload', 'video.publish'];

export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scope: string;
  expiresIn: number;        // segundos do access_token (~86400)
  refreshExpiresIn: number; // segundos do refresh_token (~31536000)
};

// ── OAuth ───────────────────────────────────────────────────────────────────

// URL para onde mandamos o browser autorizar UMA conta. O `state` protege de
// CSRF (validamos no callback).
export function urlAutorizacao(opts: { clientKey: string; redirectUri: string; state: string }): string {
  const p = new URLSearchParams({
    client_key: opts.clientKey,
    scope: SCOPES.join(','),
    response_type: 'code',
    redirect_uri: opts.redirectUri,
    state: opts.state,
  });
  return `${AUTORIZAR}?${p.toString()}`;
}

type OAuthResp = {
  access_token?: string;
  refresh_token?: string;
  open_id?: string;
  scope?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  error?: string;
  error_description?: string;
};

function tokenSetDe(j: OAuthResp): TokenSet {
  return {
    accessToken: j.access_token!,
    refreshToken: j.refresh_token!,
    openId: j.open_id!,
    scope: j.scope ?? '',
    expiresIn: j.expires_in ?? 86400,
    refreshExpiresIn: j.refresh_expires_in ?? 31536000,
  };
}

// Troca o `code` do callback por tokens (primeiro login de uma conta).
export async function trocarCodigo(opts: { clientKey: string; clientSecret: string; code: string; redirectUri: string }): Promise<{ ok: boolean; tokens?: TokenSet; erro?: string }> {
  try {
    const body = new URLSearchParams({
      client_key: opts.clientKey,
      client_secret: opts.clientSecret,
      code: opts.code,
      grant_type: 'authorization_code',
      redirect_uri: opts.redirectUri,
    });
    const res = await fetch(OAUTH, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const j = (await res.json().catch(() => ({}))) as OAuthResp;
    if (!j.access_token || !j.open_id) return { ok: false, erro: j.error_description || j.error || 'sem access_token' };
    return { ok: true, tokens: tokenSetDe(j) };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}

// Renova o access_token usando o refresh_token (cron diário). O TikTok devolve
// também um refresh_token novo — guardamos sempre o mais recente.
export async function renovarToken(opts: { clientKey: string; clientSecret: string; refreshToken: string }): Promise<{ ok: boolean; tokens?: TokenSet; erro?: string }> {
  try {
    const body = new URLSearchParams({
      client_key: opts.clientKey,
      client_secret: opts.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: opts.refreshToken,
    });
    const res = await fetch(OAUTH, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const j = (await res.json().catch(() => ({}))) as OAuthResp;
    if (!j.access_token) return { ok: false, erro: j.error_description || j.error || 'sem access_token' };
    return { ok: true, tokens: tokenSetDe(j) };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}

// ── Content Posting ───────────────────────────────────────────────────────────

type ApiResp = { data?: Record<string, unknown>; error?: { code?: string; message?: string; log_id?: string } };

async function apiPost(path: string, accessToken: string, payload: Record<string, unknown>): Promise<{ ok: boolean; json: ApiResp }> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
  });
  const json = (await res.json().catch(() => ({}))) as ApiResp;
  const erroCode = json?.error?.code;
  const ok = res.ok && (!erroCode || erroCode === 'ok');
  return { ok, json };
}

function erroDe(json: ApiResp): string {
  const e = json?.error;
  return e?.message ? `${e.message}${e.code ? ` (${e.code})` : ''}` : JSON.stringify(json).slice(0, 200);
}

// Antes de uma publicação DIRETA é obrigatório consultar o creator_info (a UX da
// auditoria exige mostrar as opções de privacidade reais da conta). Devolve,
// entre outros, as privacy_level_options permitidas.
export async function consultarCreatorInfo(accessToken: string): Promise<{ ok: boolean; data?: Record<string, unknown>; erro?: string }> {
  const r = await apiPost('/post/publish/creator_info/query/', accessToken, {});
  if (!r.ok) return { ok: false, erro: erroDe(r.json) };
  return { ok: true, data: r.json.data };
}

export type Privacidade = 'PUBLIC_TO_EVERYONE' | 'SELF_ONLY' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR';

type PublicarVideoOpts = {
  accessToken: string;
  videoUrl: string;        // URL HTTPS público do MP4 (domínio verificado no portal)
  titulo: string;          // legenda + hashtags
  modo: 'rascunho' | 'direto';
  privacidade?: Privacidade; // só usado no modo 'direto' (default SELF_ONLY até auditoria)
  disableComment?: boolean;  // interação (respeitar o creator_info)
  disableDuet?: boolean;
  disableStitch?: boolean;
};

// Inicia a publicação de um vídeo. Devolve o publish_id para sondar o estado.
export async function publicarVideo(opts: PublicarVideoOpts): Promise<{ ok: boolean; publishId?: string; erro?: string }> {
  const source_info = { source: 'PULL_FROM_URL', video_url: opts.videoUrl };

  // RASCUNHO → caixa de entrada (sem auditoria). Não leva post_info: a Vivianne
  // escolhe legenda/privacidade na app ao publicar à mão.
  if (opts.modo === 'rascunho') {
    const r = await apiPost('/post/publish/inbox/video/init/', opts.accessToken, { source_info });
    if (!r.ok) return { ok: false, erro: erroDe(r.json) };
    return { ok: true, publishId: r.json.data?.publish_id as string };
  }

  // DIRETO → publica no perfil. privacy_level obrigatório; SELF_ONLY enquanto a
  // app não estiver auditada (público só pós-auditoria).
  const post_info = {
    title: opts.titulo,
    privacy_level: opts.privacidade ?? 'SELF_ONLY',
    disable_comment: opts.disableComment ?? false,
    disable_duet: opts.disableDuet ?? false,
    disable_stitch: opts.disableStitch ?? false,
  };
  const r = await apiPost('/post/publish/video/init/', opts.accessToken, { post_info, source_info });
  if (!r.ok) return { ok: false, erro: erroDe(r.json) };
  return { ok: true, publishId: r.json.data?.publish_id as string };
}

// Estado de uma publicação: PROCESSING_* / PUBLISH_COMPLETE / FAILED.
// Em caso de falha, o TikTok devolve fail_reason — devolvemo-lo para diagnóstico.
export async function estadoPublicacao(accessToken: string, publishId: string): Promise<{ ok: boolean; status?: string; failReason?: string; erro?: string }> {
  const r = await apiPost('/post/publish/status/fetch/', accessToken, { publish_id: publishId });
  if (!r.ok) return { ok: false, erro: erroDe(r.json) };
  const d = (r.json.data ?? {}) as Record<string, unknown>;
  return { ok: true, status: d.status as string, failReason: d.fail_reason as string | undefined };
}

// Sonda o estado até concluir (ou falhar / esgotar o tempo). O TikTok faz o
// download e processamento do MP4, por isso pode demorar.
export async function esperarPublicacao(accessToken: string, publishId: string, maxMs = 5 * 60 * 1000): Promise<{ ok: boolean; status?: string; failReason?: string; erro?: string }> {
  const ini = Date.now();
  while (Date.now() - ini < maxMs) {
    const e = await estadoPublicacao(accessToken, publishId);
    if (!e.ok) return e;
    if (e.status === 'PUBLISH_COMPLETE') return { ok: true, status: e.status };
    if (e.status === 'FAILED') return { ok: false, status: e.status, failReason: e.failReason, erro: `FAILED${e.failReason ? `: ${e.failReason}` : ''}` };
    await new Promise((r) => setTimeout(r, 5000));
  }
  return { ok: false, erro: 'o TikTok não acabou de processar o vídeo a tempo' };
}
