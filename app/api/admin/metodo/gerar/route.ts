import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { faixaUrl } from '@/lib/carrossel/musica';
import { limparTravessoes } from '@/lib/texto';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS } from '@/lib/metodo/contas';
import { fraseDoReel, destaqueDe, fundoPrompt } from '@/lib/metodo/reels';
import { legendaDoReel, hashtagsDoReel } from '@/lib/metodo/legenda';
import { resolverReel, ehManifesto, legendaManifesto } from '@/lib/metodo/abertura';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Pipeline NOVO e SEPARADO da veu.a.veu (não toca em app/api/admin/reels/*).
// Gera UM reel de uma porta do Método VS: cinético (frase com motion) com a
// porta (dor) seguida da sala (revelação a ouro), fundo Flux próprio e música
// Ancient Ground. Grava em carousel_collections com theme.marca da conta, para
// fluir para /admin/publicar e o export Metricool já existentes.

// Gera a imagem de fundo (Flux) e devolve o URL público (ou null se falhar).
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

// POST { reelId }: reelId pode ser de manifesto (ver-00) ou da biblioteca (ver-01...).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { reelId?: string };
  const reelId = (body.reelId ?? '').trim();
  if (!reelId) return NextResponse.json({ erro: 'falta reelId' }, { status: 400 });

  const reel = resolverReel(reelId);
  if (!reel) return NextResponse.json({ erro: 'reel-desconhecido', reelId }, { status: 404 });

  const conta = CONTAS[reel.conta];
  const frase = limparTravessoes(fraseDoReel(reel));
  const destaque = limparTravessoes(destaqueDe(reel));
  const legenda = limparTravessoes(
    ehManifesto(reel.id) ? legendaManifesto(reel.conta) : legendaDoReel(reel, conta),
  );
  const hashtags = hashtagsDoReel(reel);
  const promptFundo = limparTravessoes(fundoPrompt(reel));

  // slug ESTÁVEL por reel: regenerar atualiza a mesma coleção (sem duplicar).
  const slug = `metodo-${reel.id}`;
  const imageUrl = await fundoImagem(promptFundo, slug);

  const slides = [
    {
      tipo: 'kinetico',
      texto: frase,
      destaque,
      notaVisual: promptFundo,
      imageUrl,
      capa: true,
      conceito: conta.movimento, // selo de marca (Ver/Vir/Viver), discreto
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
      mundo: 'autora', // paleta de acento dourado (família das capas do método)
      palavra: reel.porta.slice(0, 48),
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
        title: reel.porta.slice(0, 48),
        brief: frase,
        dias,
        theme: {
          formato: 'reel',
          subtipo: 'kinetico',
          video: true,
          mundo: 'autora',
          curso: 'transpessoal',
          marca: conta.marca, // <- distingue a conta no Publicar/export
          metodo: { conta: reel.conta, veu: reel.veu, reelId: reel.id },
        },
      },
      { onConflict: 'slug' },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coleccao: data, slug });
}
