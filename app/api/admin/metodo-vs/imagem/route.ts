import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { gerarImagemFlux, guardarImagem } from '@/lib/banda/flux';
import { promptImagemVS, gerarCenaImagem } from '@/lib/metodo-vs/gerar';
import { METODOVS_CONTAS_LISTA } from '@/lib/metodo-vs/marca';

// a conta a partir do prefixo do slug (para o REGISTO visual da conta na imagem).
const contaDoSlug = (slug: string) => METODOVS_CONTAS_LISTA.find((c) => slug.startsWith(`${c.prefixo}-`))?.id ?? 'mae';

export const runtime = 'nodejs';
export const maxDuration = 120;

// MÉTODO VS · TROCAR A IMAGEM de UMA peça (autonomia): re-corre o Flux com o prompt
// guardado (notaVisual) e dá uma variação nova, usada em todos os momentos do reel.
// Limpa o vídeo (tem de se renderizar de novo). NÃO mexe no texto.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return NextResponse.json({ erro: 'falta REPLICATE_API_TOKEN' }, { status: 500 });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: row, error } = await supabase.from('carousel_collections').select('dias').eq('slug', slug).maybeSingle();
  if (error || !row) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (Array.isArray(row.dias) ? row.dias : []) as Array<{ slides?: Array<{ texto?: string; notaVisual?: string; imageUrl?: string | null; videoUrl?: string | null; clipUrl?: string | null }>; videoUrl?: string | null }>;
  const slides = dias[0]?.slides ?? [];
  const texto = slides.map((s) => (s.texto ?? '').trim()).filter(Boolean).join('. ');

  // INVENTA uma cena NOVA a partir do texto (modelo barato), para escapar à cena guardada
  // (peças antigas têm cenas de tecido lá dentro) e dar variedade. Sem Claude (sem chave),
  // cai para a cena guardada. O estilo + banimentos entram sempre no promptImagemVS.
  let cena = slides.find((s) => s.notaVisual)?.notaVisual ?? texto;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && texto) {
    try { cena = await gerarCenaImagem(texto, apiKey, cena ? [cena] : []); } catch { /* fica a cena guardada */ }
  }
  if (!cena) return NextResponse.json({ erro: 'sem-texto', detalhe: 'esta peça não tem texto nem prompt para a imagem' }, { status: 409 });

  let url: string;
  try {
    const raw = await gerarImagemFlux(promptImagemVS(cena, contaDoSlug(slug)), token, { raw: true });
    try { url = await guardarImagem(raw, `metodovs/${slug}/fundo-${Date.now()}.jpg`); } catch { url = raw; }
  } catch (e) {
    return NextResponse.json({ erro: 'flux-falhou', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  // guarda a cena NOVA como notaVisual (a partir de agora a peça tem uma cena limpa).
  for (const s of slides) { s.imageUrl = url; s.clipUrl = null; s.videoUrl = null; s.notaVisual = cena; }
  if (dias[0]) dias[0].videoUrl = null; // a imagem mudou: tem de renderizar de novo
  const { error: e2 } = await supabase.from('carousel_collections').update({ dias }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, imageUrl: url });
}
