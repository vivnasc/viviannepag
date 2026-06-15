import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { CONTAS, ContaId } from '@/lib/metodo/contas';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Preenche a IMAGEM (Flux) dos posts do método que ainda não têm, SEM reescrever
// o texto. Usa o prompt já guardado (slide.notaVisual). Corre no servidor (pode
// sair/fechar). Em paralelo por blocos.

async function fundoImagem(prompt: string, slug: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || !prompt) return null;
  try {
    const url = await gerarImagemFlux(prompt, token, { raw: true });
    try { return await guardarImagem(url, `metodo/${slug}/fundo-${Date.now()}.jpg`); } catch { return url; }
  } catch { return null; }
}

type Slide = { imageUrl?: string | null; notaVisual?: string };
type Dia = { slides?: Slide[] };
type Row = { slug: string; dias?: Dia[] | null; theme?: { metodo?: { conta?: string } } | null };

// POST { conta }: gera a imagem dos posts dessa conta que estão sem imagem.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { conta?: string };
  const contaId = (body.conta ?? '') as ContaId;
  if (!CONTAS[contaId]) return NextResponse.json({ erro: 'conta-desconhecida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias, theme').like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  const semImagem = (data ?? []).filter((r: Row) => (r.theme?.metodo?.conta === contaId) && !r.dias?.[0]?.slides?.[0]?.imageUrl && !!r.dias?.[0]?.slides?.[0]?.notaVisual) as Row[];
  if (!semImagem.length) return NextResponse.json({ ok: true, feitas: 0 });

  let feitas = 0;
  for (let c = 0; c < semImagem.length; c += 5) {
    const bloco = semImagem.slice(c, c + 5);
    await Promise.all(bloco.map(async (r) => {
      const slide = r.dias![0].slides![0];
      const img = await fundoImagem(slide.notaVisual ?? '', r.slug);
      if (!img) return;
      slide.imageUrl = img;
      const { error: e2 } = await supabase.from('carousel_collections').update({ dias: r.dias }).eq('slug', r.slug);
      if (!e2) feitas += 1;
    }));
  }
  return NextResponse.json({ ok: true, feitas, total: semImagem.length });
}
