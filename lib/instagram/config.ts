// Config PRIVADA do Instagram (token de longa duração) guardada no Supabase
// Storage num bucket PRIVADO ("config-privado"). É aqui que o token se
// auto-renova: a env var INSTAGRAM_TOKEN do Vercel é só o arranque (não dá
// para o servidor reescrever uma env var sozinho), por isso, a partir da
// primeira renovação, a verdade passa a estar neste ficheiro privado.
//
// NUNCA expor este bucket publicamente. Só o service-role o lê/escreve.

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { IG_ID_CONHECIDO, type ContaId } from '@/lib/instagram/contas';

const BUCKET = 'config-privado';
const PATH = 'instagram.json';

export type ContaCfg = { token?: string; igUserId?: string; renovadoEm?: string; consistenteDesde?: string };

export type IgConfig = {
  token?: string;     // (legado) token de longa duração da conta veu.a.veu
  igUserId?: string;  // (legado) ID da conta veu.a.veu
  appId?: string;     // META_APP_ID (guardado para futuras renovações)
  appSecret?: string; // META_APP_SECRET
  renovadoEm?: string; // ISO da última renovação (legado)
  contas?: Partial<Record<ContaId, ContaCfg>>; // credenciais POR conta
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

// Credenciais a usar para publicar NUMA conta. Primeiro a config privada da
// conta (token já renovado); para a veu.a.veu há fallback ao legado/env do
// Vercel (arranque). A loja só funciona depois de colares o token dela.
export async function getIgCredenciais(conta: ContaId = 'veuaveu'): Promise<{ token?: string; igUserId?: string }> {
  const cfg = await getIgConfig();
  const c = cfg.contas?.[conta];
  if (conta === 'veuaveu') {
    return {
      token: c?.token || cfg.token || process.env.INSTAGRAM_TOKEN,
      igUserId: c?.igUserId || cfg.igUserId || process.env.INSTAGRAM_IG_ID,
    };
  }
  return { token: c?.token, igUserId: c?.igUserId || IG_ID_CONHECIDO[conta] };
}

// guarda token/igUserId de UMA conta (sem mexer nas outras).
export async function setContaCredenciais(conta: ContaId, patch: ContaCfg): Promise<void> {
  const cfg = await getIgConfig();
  const contas = { ...(cfg.contas ?? {}) };
  contas[conta] = { ...(contas[conta] ?? {}), ...patch };
  await setIgConfig({ contas });
}

// lê a config (não-secreta) de UMA conta — ex.: consistenteDesde.
export async function getContaCfg(conta: ContaId): Promise<ContaCfg> {
  const cfg = await getIgConfig();
  return cfg.contas?.[conta] ?? {};
}
