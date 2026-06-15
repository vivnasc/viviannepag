import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { melhorarFrase } from '@/lib/metodo/ia';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST { slug }: reescreve a frase de UM post para tirar a ambiguidade, mantendo
// a imagem (sem custo de imagem). Atualiza o texto no ecrã, o título, o brief e
// a 1.ª linha da legenda (o gancho). Só posts 'metodo-*'.
type Slide = { texto?: string };
type Dia = { slides?: Slide[]; legenda?: string };

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  const slug = (body.slug ?? '').trim();
  if (!slug || !slug.startsWith('metodo-')) return NextResponse.json({ erro: 'slug-invalido' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('slug, dias').eq('slug', slug).single();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrado' }, { status: 404 });

  const dias = (data.dias ?? []) as Dia[];
  const slide = dias[0]?.slides?.[0];
  const antigo = slide?.texto;
  if (!slide || !antigo) return NextResponse.json({ erro: 'sem-texto' }, { status: 400 });

  let novo: string;
  try { novo = limparTravessoes(await melhorarFrase(antigo, apiKey)); }
  catch (e) { return NextResponse.json({ erro: 'claude', detalhe: String(e) }, { status: 502 }); }

  slide.texto = novo;
  // legenda: troca só o 1.º parágrafo (o gancho), mantém a revelação/CTA.
  const leg = dias[0]?.legenda;
  if (leg) { const i = leg.indexOf('\n\n'); dias[0].legenda = novo + (i >= 0 ? leg.slice(i) : ''); }

  const { error: e2 } = await supabase.from('carousel_collections').update({ dias, title: novo.slice(0, 48), brief: novo }).eq('slug', slug);
  if (e2) return NextResponse.json({ erro: 'db', detalhe: e2.message }, { status: 500 });
  return NextResponse.json({ ok: true, texto: novo, antigo });
}
