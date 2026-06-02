import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { lerLivro } from '@/lib/editora';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug } — cria/atualiza o produto na loja como RASCUNHO (publicado=false)
// e dispara o render-ebook editorial no GitHub Actions. So aparece em /loja
// depois de marcares publicado em /admin/produtos. O render le o markdown da
// ref onde os livros vivem (EDITORA_RENDER_REF).

function mundoDoSlug(slug: string): string {
  if (slug.startsWith('inf-')) return 'infonte';
  return 'freeme';
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const { slug } = (await req.json()) as { slug?: string };
  if (!slug || !/^(mae|inf|pros|syn|per|for|tra)-\d+/.test(slug)) {
    return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });
  }

  const livro = lerLivro(slug);
  if (!livro) return NextResponse.json({ erro: 'livro-nao-existe' }, { status: 404 });

  const mundo = mundoDoSlug(slug);

  // descricao no formato dos produtos ja publicados
  const indice = livro.capitulos
    .map((c, i) => `${i + 1}. ${c.titulo.replace(/^\d+\.\s*/, '')}`)
    .join('\n');
  const descricao = `**Ebook · ${livro.palavras.toLocaleString('pt-PT')} palavras · 8 capítulos · PDF imediato**

${livro.subtitulo}

**O que vais encontrar:**
${indice}

Por Vivianne dos Santos.`;

  // 1. cria/atualiza o produto como rascunho (mesmo padrao do seed: nao
  // assume constraint unica em slug)
  const supabase = getSupabaseAdmin();
  const campos = {
    slug,
    titulo: livro.titulo,
    subtitulo: livro.subtitulo,
    descricao,
    preco: '€7',
    preco_original: '€29',
    badge: 'ebook',
    publicado: false,
    destaque: false,
  };
  const { data: existente } = await supabase.from('produtos').select('id').eq('slug', slug).single();
  let produto: { id?: string } | null = null;
  if (existente) {
    // nao mexe em publicado se ja existia (pode ja estar a venda); so atualiza o conteudo
    const { titulo, subtitulo, descricao: d } = campos;
    const { data, error } = await supabase
      .from('produtos')
      .update({ titulo, subtitulo, descricao: d })
      .eq('slug', slug)
      .select('id')
      .single();
    if (error) return NextResponse.json({ erro: `supabase: ${error.message}` }, { status: 500 });
    produto = data;
  } else {
    const { data, error } = await supabase.from('produtos').insert(campos).select('id').single();
    if (error) return NextResponse.json({ erro: `supabase: ${error.message}` }, { status: 500 });
    produto = data;
  }

  // 2. dispara o render editorial no GitHub Actions
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER ?? 'vivnasc';
  const repo = process.env.GITHUB_REPO_NAME ?? 'viviannepag';
  const ref = process.env.EDITORA_RENDER_REF ?? process.env.GITHUB_DISPATCH_REF ?? 'main';

  let render: { ok: boolean; detalhe?: string } = { ok: false, detalhe: 'sem-github-token' };
  if (token) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-ebook.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref, inputs: { slug, slugs: '', mundo } }),
      },
    );
    render = res.ok
      ? { ok: true }
      : { ok: false, detalhe: `github ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  const pdfUrl = `${supabaseUrl}/storage/v1/object/public/viviannepag-assets/produtos/${slug}.pdf`;

  return NextResponse.json({
    ok: true,
    produtoId: produto?.id,
    publicado: false,
    mundo,
    ref,
    render,
    pdfUrl,
    workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-ebook.yml`,
  });
}
