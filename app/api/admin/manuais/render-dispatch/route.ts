import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { githubDispatchToken } from '@/lib/github/dispatch-token';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST — dispara o workflow render-manuais.yml (render dos 3 manuais com o bónus
// e upload ao bucket), para o download dos manuais ficar ativo.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = await githubDispatchToken();
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-manuais.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs: {} }),
    },
  );
  if (!res.ok) return NextResponse.json({ erro: 'github-dispatch', status: res.status, detalhe: (await res.text()).slice(0, 300) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
