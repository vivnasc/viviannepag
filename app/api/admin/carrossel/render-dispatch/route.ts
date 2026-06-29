import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { githubDispatchToken } from '@/lib/github/dispatch-token';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { slug, dias? } — dispara o workflow render-carrossel-veus (Puppeteer + ffmpeg)
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const token = await githubDispatchToken();
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { slug?: string; dias?: string; modo?: string };
  if (!body.slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannedossantos.com';
  const inputs: Record<string, string> = { slug: body.slug, siteUrl };
  if (body.dias) inputs.dias = body.dias;
  if (body.modo) inputs.modo = body.modo; // 'carrossel' = imagens 4:5 (sem MP4)

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-carrossel-veus.yml/dispatches`,
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
  return NextResponse.json({ ok: true, slug: body.slug, siteUrl });
}
