import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { ROMANCES } from '@/lib/romances';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { slug } — dispara o workflow render-romance (GitHub Actions) para um
// romance, ou "todos". Usa a capa já escolhida no estúdio, compõe a tipografia,
// renderiza o PDF (pt e en, se houver miolo en) e publica no bucket. O trabalho
// é pesado (~30-45 min); por isso corre no Actions, não no Vercel.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';

  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  let slug = 'todos';
  try {
    const body = await req.json();
    if (typeof body?.slug === 'string') slug = body.slug;
  } catch {}

  if (slug !== 'todos' && !ROMANCES.some((r) => r.slug === slug)) {
    return NextResponse.json({ erro: 'slug-desconhecido' }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-romance.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs: { slug } }),
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
    slug,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-romance.yml`,
  });
}
