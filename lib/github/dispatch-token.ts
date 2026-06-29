// TOKEN para disparar os workflows de render (GitHub Actions).
//
// FIX DE FUNDO (jun 2026): os disparos de render passam a usar um GitHub APP
// dedicado, em vez do PAT pessoal da Vivianne. Antes todos os `workflow_dispatch`
// (cron + botões de render) contavam no limite da CONTA dela (user 61882995) e
// estouravam o rate limit secundário. Um GitHub App tem a SUA própria quota, por
// isso liberta a conta pessoal e levanta o teto.
//
// Como ligar (uma vez, do lado da Vivianne):
//   1. Criar um GitHub App na org/conta, com permissão "Actions: Read and write".
//   2. Instalá-lo no repositório viviannepag.
//   3. Pôr 3 secrets (Vercel + GitHub Actions): GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID
//      e GITHUB_APP_PRIVATE_KEY (o .pem inteiro; \n literais são tratados).
//
// Enquanto os secrets do App não existirem, faz FALLBACK ao GITHUB_DISPATCH_TOKEN
// (o token atual) — nada parte; só não há ganho até o App estar configurado.

import crypto from 'crypto';

const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');

// cache do token de instalação (vale ~1h; renova-se com margem). Persiste enquanto
// a instância serverless estiver quente; numa fria, mint-a de novo.
let cache: { token: string; exp: number } | null = null;

async function appInstallationToken(): Promise<string | null> {
  const appId = process.env.GITHUB_APP_ID;
  const pk = process.env.GITHUB_APP_PRIVATE_KEY;
  const inst = process.env.GITHUB_APP_INSTALLATION_ID;
  if (!appId || !pk || !inst) return null; // App não configurado -> fallback
  if (cache && cache.exp > Date.now() + 60_000) return cache.token;
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({ iat: now - 30, exp: now + 540, iss: appId }));
    const data = `${header}.${payload}`;
    const key = pk.includes('\\n') ? pk.replace(/\\n/g, '\n') : pk; // env guarda \n literais
    const sig = b64url(crypto.sign('RSA-SHA256', Buffer.from(data), key));
    const jwt = `${data}.${sig}`;
    const res = await fetch(`https://api.github.com/app/installations/${inst}/access_tokens`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { token?: string; expires_at?: string };
    if (!j.token) return null;
    cache = { token: j.token, exp: j.expires_at ? new Date(j.expires_at).getTime() : Date.now() + 30 * 60_000 };
    return j.token;
  } catch {
    return null;
  }
}

// O token a usar nos disparos: o do GitHub App (se configurado), senão o PAT atual.
export async function githubDispatchToken(): Promise<string | undefined> {
  return (await appInstallationToken()) ?? process.env.GITHUB_DISPATCH_TOKEN;
}
