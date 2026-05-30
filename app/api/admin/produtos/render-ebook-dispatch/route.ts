import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { slug, mundo } — dispara workflow render-ebook editorial.
// Resultado: produtos/{slug}.pdf em Supabase Storage (publico).

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';

  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  let slug = 'ebook-01-culpa';
  let mundo = 'freeme';
  try {
    const body = await req.json();
    if (typeof body?.slug === 'string') slug = body.slug;
    if (typeof body?.mundo === 'string') mundo = body.mundo;
  } catch {}

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-ebook.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs: { slug, mundo } }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { erro: 'github-dispatch', status: res.status, detalhe: text.substring(0, 300) },
      { status: 500 }
    );
  }

  // URL onde o PDF vai aparecer
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const pdfUrl = `${supabaseUrl}/storage/v1/object/public/viviannepag-assets/produtos/${slug}.pdf`;

  return NextResponse.json({
    ok: true,
    slug,
    mundo,
    pdfUrl,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-ebook.yml`,
  });
}
