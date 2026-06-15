import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, FUNDO_FAMILIA } from '@/lib/metodo/contas';
import { horaDoMetodo } from '@/lib/metodo/agenda';
import { getPost } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Pipeline NOVO e SEPARADO da veu.a.veu (não toca em app/api/admin/reels/*).
// Gera UM post do Método VS (reconhecimento / revelação / manifesto): UMA linha
// no ecrã, com IDENTIDADE PRÓPRIA da conta (MetodoSlide, @conta, paleta própria,
// SEM assinatura Véu a Véu) e música Ancient Ground. Grava em
// carousel_collections com slide.tipo='metodo' e theme.marca da conta, para
// fluir para /admin/publicar, o render (/render-veu usa o MetodoSlide) e o
// export Metricool já existentes.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try {
      return await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`);
    } catch {
      return url;
    }
  } catch {
    return null;
  }
}

// POST { postId }: id de um post tipado (ex.: 'ver-01', 'ver-01-rev', 'ver-mani').
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { postId?: string };
  const postId = (body.postId ?? '').trim();
  if (!postId) return NextResponse.json({ erro: 'falta postId' }, { status: 400 });

  const post = getPost(postId);
  if (!post) return NextResponse.json({ erro: 'post-desconhecido', postId }, { status: 404 });

  const conta = CONTAS[post.conta];
  const texto = limparTravessoes(post.texto);
  const destaque = limparTravessoes(post.destaque);
  const legenda = limparTravessoes(legendaDoPost(post));
  const hashtags = hashtagsDoPost(post);
  const promptFundo = limparTravessoes(`${post.fundoCena}. ${FUNDO_FAMILIA}`);

  // slug ESTÁVEL por post: regenerar atualiza a mesma coleção (sem duplicar).
  const slug = `metodo-${post.id}`;
  const imageUrl = await fundoImagem(promptFundo, slug);

  const slides = [
    {
      tipo: 'metodo', // <- render-veu usa o MetodoSlide (identidade própria)
      texto,
      destaque,
      notaVisual: promptFundo,
      imageUrl,
      capa: true,
      conceito: post.conceito, // selo editorial (Véu do… / Revelação / Manifesto)
      contaId: post.conta, // o MetodoSlide lê a paleta e o @conta daqui
    },
  ];

  const numeroFaixa = (Math.floor(Date.now() / 1000) % 100) + 1;
  const faixa = {
    numero: numeroFaixa,
    titulo: `Faixa ${String(numeroFaixa).padStart(2, '0')}`,
    url: faixaUrl(numeroFaixa),
  };

  const dias = [
    {
      dia: 1,
      mundo: 'autora', // ignorado pelo MetodoSlide; só para compatibilidade do render
      palavra: texto.slice(0, 48),
      slides,
      faixa,
      legenda,
      hashtags,
    },
  ];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .upsert(
      {
        slug,
        title: texto.slice(0, 48),
        brief: texto,
        dias,
        theme: {
          formato: 'reel',
          subtipo: 'kinetico', // o render trata como typewriter MP4 (conduzido por prog)
          video: true,
          mundo: 'autora',
          marca: conta.marca, // <- distingue a conta no Publicar/export
          hora: horaDoMetodo(post.conta), // frases da manhã (11h); a mãe à tarde (17h)
          metodo: { conta: post.conta, tipo: post.tipo, veu: post.veu ?? null, postId: post.id },
        },
      },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data, slug });
}
