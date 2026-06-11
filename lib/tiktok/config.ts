// Config PRIVADA do TikTok guardada no Supabase Storage no MESMO bucket privado
// do Instagram ("config-privado"), mas noutro ficheiro ("tiktok.json").
//
// Diferença para o Instagram: aqui há VÁRIAS contas (a Vivianne tem 8). Por
// isso guardamos uma LISTA de contas, cada uma com o seu par de tokens. O
// access_token do TikTok dura só 24h e renova-se com o refresh_token (que dura
// 365 dias) — o cron diário trata disso e reescreve este ficheiro.
//
// A Client Key / Client Secret da APP (não da conta) vêm das env vars do Vercel
// (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET) — são fixas, não se renovam.
//
// NUNCA expor este bucket publicamente. Só o service-role o lê/escreve.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'config-privado';
const PATH = 'tiktok.json';

// Uma conta TikTok ligada (resultado de um login OAuth).
export type TikTokConta = {
  openId: string;            // identificador único da conta no TikTok (open_id)
  displayName?: string;      // nome visível, só para a Vivianne distinguir as 8
  accessToken: string;       // vale 24h
  refreshToken: string;      // vale 365 dias
  accessExpiraEm: string;    // ISO — quando o access_token expira
  refreshExpiraEm: string;   // ISO — quando o refresh_token expira
  scope?: string;            // scopes concedidos
  ligadoEm: string;          // ISO do primeiro login
  renovadoEm?: string;       // ISO da última renovação do access_token
};

export type TikTokConfig = {
  contas: TikTokConta[];
};

async function garantirBucket(): Promise<void> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    await sb.storage.createBucket(BUCKET, { public: false });
  }
}

export async function getTikTokConfig(): Promise<TikTokConfig> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.storage.from(BUCKET).download(PATH);
    if (error || !data) return { contas: [] };
    const txt = await data.text();
    const parsed = JSON.parse(txt) as Partial<TikTokConfig>;
    return { contas: parsed.contas ?? [] };
  } catch {
    return { contas: [] };
  }
}

async function guardar(cfg: TikTokConfig): Promise<void> {
  await garantirBucket();
  const sb = getSupabaseAdmin();
  await sb.storage.from(BUCKET).upload(PATH, JSON.stringify(cfg, null, 2), {
    contentType: 'application/json',
    upsert: true,
  });
}

// Insere ou atualiza uma conta (pela open_id). É assim que um novo login OAuth,
// ou uma renovação de token, fica gravado.
export async function upsertConta(conta: TikTokConta): Promise<void> {
  const cfg = await getTikTokConfig();
  const i = cfg.contas.findIndex((c) => c.openId === conta.openId);
  if (i >= 0) cfg.contas[i] = { ...cfg.contas[i], ...conta };
  else cfg.contas.push(conta);
  await guardar(cfg);
}

export async function removerConta(openId: string): Promise<void> {
  const cfg = await getTikTokConfig();
  cfg.contas = cfg.contas.filter((c) => c.openId !== openId);
  await guardar(cfg);
}

export async function getContas(): Promise<TikTokConta[]> {
  return (await getTikTokConfig()).contas;
}

// Credenciais da APP (não da conta): vêm das env vars do Vercel.
export function getCredenciaisApp(): { clientKey?: string; clientSecret?: string } {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  };
}

// O redirect_uri TEM de ser SEMPRE exatamente igual ao registado no Login Kit
// do TikTok — senão dá erro "redirect_uri". Por isso fixamo-lo a partir de uma
// fonte canónica (env TIKTOK_REDIRECT_URI, senão NEXT_PUBLIC_SITE_URL), e NÃO da
// origem do pedido (que pode variar entre www/apex). O mesmo valor é usado no
// arranque (auth) e na troca de token (callback).
export function getRedirectUri(): string {
  const explicit = process.env.TIKTOK_REDIRECT_URI;
  if (explicit) return explicit.replace(/\/$/, '');
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com').replace(/\/$/, '');
  return `${base}/api/admin/tiktok/callback`;
}

// Envolve um URL do Supabase no proxy do nosso domínio verificado, para o TikTok
// o poder ir buscar (PULL_FROM_URL). Ver app/api/tiktok-media/route.ts.
export function mediaProxyUrl(supabaseUrl: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com').replace(/\/$/, '');
  return `${base}/api/tiktok-media?u=${encodeURIComponent(supabaseUrl)}`;
}
