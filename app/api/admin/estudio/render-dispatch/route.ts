import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST — dispara o workflow GitHub Actions de render bulk

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';

  if (!token) {
    return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });
  }

  const jobId = `render-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannepag.vercel.app';

  // workflow_dispatch
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-slides.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref,
        inputs: {
          jobId,
          siteUrl,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { erro: 'github-dispatch', status: res.status, detalhe: text.substring(0, 300) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    jobId,
    siteUrl,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-slides.yml`,
  });
}
