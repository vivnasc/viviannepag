import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { githubDispatchToken } from '@/lib/github/dispatch-token';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { serie?, slugs?, force? } — dispara o workflow render-series.yml (Puppeteer
// + ffmpeg) que compõe a moldura sobre o motion e produz os MP4 das séries.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = await githubDispatchToken();
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { serie?: string; slugs?: string; force?: boolean };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com';
  const inputs: Record<string, string> = { siteUrl };
  if (body.serie) inputs.serie = body.serie;
  if (body.slugs) inputs.slugs = body.slugs;
  if (body.force) inputs.force = '1';

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-series.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs }),
    },
  );
  if (!res.ok) return NextResponse.json({ erro: 'github-dispatch', status: res.status, detalhe: (await res.text()).slice(0, 300) }, { status: 500 });
  return NextResponse.json({ ok: true, serie: body.serie ?? 'todas' });
}
