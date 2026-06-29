import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST { variante: 'A'|'B' } — dispara o workflow render-anuncio (GitHub Actions),
// que gera o MP4 do anúncio do Amparo (voz + cena + texto + música) e o publica
// em viviannepag-assets/anuncios/. (mesmo padrão de romances/render-dispatch.)
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.GITHUB_DISPATCH_REF ?? 'main';
  if (!token) return NextResponse.json({ erro: 'sem-github-token' }, { status: 500 });

  let variante = 'A';
  let modo = 'continuo';
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; if (b?.modo === 'cortes') modo = 'cortes'; } catch {}

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-anuncio.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, inputs: { variante, modo } }),
    },
  );
  if (!res.ok) {
    return NextResponse.json({ erro: 'github-dispatch', status: res.status, detalhe: (await res.text()).slice(0, 300) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, variante, modo });
}

// GET — lista os anúncios já gerados (para a página os mostrar com player).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage.from('viviannepag-assets').list('anuncios', {
    limit: 50, sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return NextResponse.json({ anuncios: [] });
  const anuncios = (data ?? [])
    .filter((f) => f.name.endsWith('.mp4'))
    .map((f) => ({
      nome: f.name,
      url: sb.storage.from('viviannepag-assets').getPublicUrl(`anuncios/${f.name}`).data.publicUrl,
      criado: (f as { created_at?: string }).created_at ?? null,
    }));
  return NextResponse.json({ anuncios });
}
