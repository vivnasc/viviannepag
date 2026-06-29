import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { githubDispatchToken } from '@/lib/github/dispatch-token';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { slug, mundo } — dispara workflow render-ebook editorial.
// Resultado: produtos/{slug}.pdf em Supabase Storage (publico).

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }

  const token = await githubDispatchToken();
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';

  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  let slug = 'ALL';
  let slugs = '';
  let mundo = 'auto';
  let colecao = '';
  let lang = 'pt';
  try {
    const body = await req.json();
    if (typeof body?.slug === 'string') slug = body.slug;
    if (typeof body?.mundo === 'string') mundo = body.mundo;
    if (typeof body?.colecao === 'string') colecao = body.colecao;
    if (body?.lang === 'en') lang = 'en';
    if (Array.isArray(body?.slugs)) slugs = body.slugs.filter((s: unknown) => typeof s === 'string').join(',');
    else if (typeof body?.slugs === 'string') slugs = body.slugs;
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
      body: JSON.stringify({ ref, inputs: { slug, slugs, mundo, colecao, lang } }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { erro: 'github-dispatch', status: res.status, detalhe: text.substring(0, 300) },
      { status: 500 }
    );
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const ehBulk = Boolean(colecao) || slug === 'ALL' || (slugs && slugs.includes(','));
  const slugUnico = !ehBulk && slug !== 'ALL' ? slug : (slugs.split(',')[0] || slug);
  const pdfUrl = ehBulk
    ? null
    : `${supabaseUrl}/storage/v1/object/public/viviannepag-assets/produtos/${slugUnico}.pdf`;

  return NextResponse.json({
    ok: true,
    slug,
    slugs,
    mundo,
    colecao,
    bulk: ehBulk,
    pdfUrl,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-ebook.yml`,
  });
}
