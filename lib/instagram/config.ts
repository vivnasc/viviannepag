// Config PRIVADA do Instagram (token de longa duração) guardada no Supabase
// Storage num bucket PRIVADO ("config-privado"). É aqui que o token se
// auto-renova: a env var INSTAGRAM_TOKEN do Vercel é só o arranque (não dá
// para o servidor reescrever uma env var sozinho), por isso, a partir da
// primeira renovação, a verdade passa a estar neste ficheiro privado.
//
// NUNCA expor este bucket publicamente. Só o service-role o lê/escreve.

import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'config-privado';
const PATH = 'instagram.json';

export type IgConfig = {
  token?: string;     // token de longa duração mais recente
  igUserId?: string;  // ID da conta de Instagram
  appId?: string;     // META_APP_ID (guardado para futuras renovações)
  appSecret?: string; // META_APP_SECRET
  renovadoEm?: string; // ISO da última renovação
};

async function garantirBucket(): Promise<void> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    await sb.storage.createBucket(BUCKET, { public: false });
  }
}

export async function getIgConfig(): Promise<IgConfig> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.storage.from(BUCKET).download(PATH);
    if (error || !data) return {};
    const txt = await data.text();
    return JSON.parse(txt) as IgConfig;
  } catch {
    return {};
  }
}

export async function setIgConfig(patch: Partial<IgConfig>): Promise<void> {
  await garantirBucket();
  const atual = await getIgConfig();
  const novo: IgConfig = { ...atual, ...patch };
  const sb = getSupabaseAdmin();
  await sb.storage.from(BUCKET).upload(PATH, JSON.stringify(novo, null, 2), {
    contentType: 'application/json',
    upsert: true,
  });
}

// Credenciais a usar para publicar: primeiro a config privada (token já
// renovado), senão as env vars de arranque do Vercel.
export async function getIgCredenciais(): Promise<{ token?: string; igUserId?: string }> {
  const cfg = await getIgConfig();
  return {
    token: cfg.token || process.env.INSTAGRAM_TOKEN,
    igUserId: cfg.igUserId || process.env.INSTAGRAM_IG_ID,
  };
}
