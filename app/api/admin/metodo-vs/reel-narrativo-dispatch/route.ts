import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { githubDispatchToken } from '@/lib/github/dispatch-token';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { slug, nClips?, dur? } — dispara o workflow do PROTÓTIPO de reel narrativo
// (clips Kling encadeados num vídeo contínuo). Espelha o carrossel/render-dispatch.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const token = await githubDispatchToken();
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { slug?: string; nClips?: number; dur?: number };
  if (!body.slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com';
  const inputs: Record<string, string> = {
    slug: body.slug,
    siteUrl,
    nClips: String(Math.max(2, Math.min(8, body.nClips ?? 4))),
    dur: String(body.dur === 5 ? 5 : 10),
  };

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-reel-narrativo.yml/dispatches`,
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
  if (!res.ok) {
    return NextResponse.json({ erro: 'github-dispatch', status: res.status, detalhe: (await res.text()).slice(0, 300) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, slug: body.slug });
}
