import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST — dispara o workflow GitHub Actions de render bulk
// Body opcional: { dias: "1" } ou { dias: "1,2,3" } ou {} para todos

export async function POST(req: Request) {
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

  let dias = '';
  try {
    const body = await req.json();
    dias = typeof body?.dias === 'string' ? body.dias : '';
  } catch {}

  const jobId = `render-${dias ? `d${dias.replace(/,/g, '-')}-` : ''}${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viviannepag.vercel.app';

  const inputs: Record<string, string> = { jobId, siteUrl };
  if (dias) inputs.dias = dias;

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
      body: JSON.stringify({ ref, inputs }),
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
    dias,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-slides.yml`,
  });
}
