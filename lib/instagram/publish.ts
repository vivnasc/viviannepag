// Publicação no Instagram via Graph API oficial (conta Business ligada a uma
// Página do Facebook). Suporta IMAGEM única, CARROSSEL (várias imagens) e REEL
// (vídeo MP4). Fluxo em 2 passos da Meta: criar "container" -> publicar.
//
// Precisa de:
//   INSTAGRAM_TOKEN   — token de acesso de longa duração (60 dias)
//   INSTAGRAM_IG_ID   — ID da conta de Instagram (IG user id)
// As media (image_url / video_url) TÊM de ser URLs HTTPS públicas (as nossas
// estão no Supabase Storage público).

const GRAPH = 'https://graph.facebook.com/v21.0';

type PublishOpts = {
  token: string;
  igUserId: string;
  caption: string;
  tipo: 'imagem' | 'carrossel' | 'reel';
  imageUrls?: string[]; // imagem/carrossel
  videoUrl?: string;    // reel
};

type PublishResult = { ok: boolean; id?: string; erro?: string };

async function graphPost(path: string, params: Record<string, string>): Promise<{ ok: boolean; json: Record<string, unknown> }> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}/${path}`, { method: 'POST', body });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, json };
}

async function graphGet(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GRAPH}/${path}?${qs}`);
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

function erroDe(json: Record<string, unknown>): string {
  const e = json?.error as { message?: string; code?: number } | undefined;
  return e?.message ? `${e.message}${e.code ? ` (cod ${e.code})` : ''}` : JSON.stringify(json).slice(0, 200);
}

// Espera o container de vídeo/reel ficar pronto (a Meta processa o MP4).
async function esperarContainer(token: string, containerId: string, maxMs = 5 * 60 * 1000): Promise<boolean> {
  const ini = Date.now();
  while (Date.now() - ini < maxMs) {
    const j = await graphGet(containerId, { fields: 'status_code', access_token: token });
    const status = j?.status_code as string | undefined;
    if (status === 'FINISHED') return true;
    if (status === 'ERROR') return false;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return false;
}

export async function publicarInstagram(opts: PublishOpts): Promise<PublishResult> {
  const { token, igUserId, caption } = opts;
  if (!token || !igUserId) return { ok: false, erro: 'falta INSTAGRAM_TOKEN ou INSTAGRAM_IG_ID' };

  try {
    let creationId: string | undefined;

    // ── REEL (vídeo) ──
    if (opts.tipo === 'reel') {
      if (!opts.videoUrl) return { ok: false, erro: 'reel sem videoUrl' };
      const c = await graphPost(`${igUserId}/media`, { media_type: 'REELS', video_url: opts.videoUrl, caption, access_token: token, share_to_feed: 'true' });
      if (!c.ok || !c.json.id) return { ok: false, erro: 'container reel: ' + erroDe(c.json) };
      creationId = c.json.id as string;
      const pronto = await esperarContainer(token, creationId);
      if (!pronto) return { ok: false, erro: 'o Instagram não acabou de processar o vídeo a tempo' };
    }

    // ── IMAGEM única ──
    else if (opts.tipo === 'imagem') {
      const url = opts.imageUrls?.[0];
      if (!url) return { ok: false, erro: 'imagem sem URL' };
      const c = await graphPost(`${igUserId}/media`, { image_url: url, caption, access_token: token });
      if (!c.ok || !c.json.id) return { ok: false, erro: 'container imagem: ' + erroDe(c.json) };
      creationId = c.json.id as string;
      await esperarContainer(token, creationId, 60 * 1000); // deixa a imagem processar
    }

    // ── CARROSSEL (várias imagens) ──
    else {
      const urls = (opts.imageUrls ?? []).slice(0, 10); // Instagram aceita até 10 (ou 20 em alguns casos)
      if (urls.length < 2) return { ok: false, erro: 'carrossel precisa de pelo menos 2 imagens' };
      const childIds: string[] = [];
      for (const url of urls) {
        const ch = await graphPost(`${igUserId}/media`, { image_url: url, is_carousel_item: 'true', access_token: token });
        if (!ch.ok || !ch.json.id) return { ok: false, erro: 'item do carrossel: ' + erroDe(ch.json) };
        const cid = ch.json.id as string;
        await esperarContainer(token, cid, 60 * 1000); // cada imagem tem de estar pronta
        childIds.push(cid);
      }
      const c = await graphPost(`${igUserId}/media`, { media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: token });
      if (!c.ok || !c.json.id) return { ok: false, erro: 'container carrossel: ' + erroDe(c.json) };
      creationId = c.json.id as string;
      await esperarContainer(token, creationId, 120 * 1000); // o contentor do carrossel também
    }

    // ── PUBLICAR (com re-tentativa: a Meta às vezes ainda diz "not available", cod 9007) ──
    let pub = await graphPost(`${igUserId}/media_publish`, { creation_id: creationId!, access_token: token });
    let tentativas = 0;
    while ((!pub.ok || !pub.json.id) && tentativas < 5) {
      const err = erroDe(pub.json);
      if (!/9007|not available|not ready|media id is not/i.test(err)) break; // erro não-transitório: desiste já
      await new Promise((r) => setTimeout(r, 6000));
      pub = await graphPost(`${igUserId}/media_publish`, { creation_id: creationId!, access_token: token });
      tentativas++;
    }
    if (!pub.ok || !pub.json.id) return { ok: false, erro: 'publicar: ' + erroDe(pub.json) };
    return { ok: true, id: pub.json.id as string };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}

// Renova o token de longa duração (válido ~60 dias; renovar antes de expirar).
export async function renovarToken(token: string, appId: string, appSecret: string): Promise<string | null> {
  try {
    const j = await graphGet('oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: token,
    });
    return (j?.access_token as string) ?? null;
  } catch { return null; }
}
