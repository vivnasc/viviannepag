import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { limparTravessoes } from '@/lib/texto';
import { SOULAB_MUNDO, soulabHandle } from '@/lib/soulab/marca';
import { traduzirPecaSoulab } from '@/lib/soulab/gerar-ia';

export const runtime = 'nodejs';
export const maxDuration = 120;

// SOULAB · TRADUZIR uma peça JÁ EXISTENTE (PT → EN) para a conta internacional.
// NÃO gera conteúdo novo: clona a peça, verte o TEXTO para inglês e REAPROVEITA a
// imagem, o movimento (clip) e o som (é o MESMO conteúdo, só noutra língua). A peça
// EN nasce por agendar/renderizar (o MP4 é próprio, porque o texto é diferente). A
// Vivianne agenda-a como qualquer outra (a agenda já existe).

type Slide = {
  tipo?: string; texto?: string; destaque?: string[]; notaVisual?: string | null;
  imageUrl?: string | null; capa?: boolean; conceito?: string;
  efeito?: string | null; tipografia?: Record<string, unknown> | null; segPorMomento?: number | null;
};
type Dia = { dia?: number; mundo?: string; palavra?: string; slides?: Slide[]; faixa?: unknown; legenda?: string; hashtags?: string[] };
type Theme = {
  marca?: string; soulab?: {
    tipo?: string; formato?: string; lingua?: 'pt' | 'en';
    clipUrl?: string | null; somUrl?: string | null; somTipo?: string | null; somEstilo?: string | null;
    veiaId?: string; veiaTitulo?: string; veiaLivro?: string;
  } | null;
};

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: 'sem-api-key' }, { status: 500 });

  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, title, brief, dias, theme')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'db', detalhe: error?.message ?? 'não encontrado' }, { status: 404 });

  const theme = (data.theme ?? {}) as Theme;
  const sl = theme.soulab ?? {};
  // só faz sentido a partir de uma peça PT (a EN já está em inglês).
  if (sl.lingua === 'en' || slug.startsWith('soulab-en-')) {
    return NextResponse.json({ erro: 'ja-en', detalhe: 'Esta peça já é a versão inglesa.' }, { status: 400 });
  }

  const dia = (data.dias as Dia[] | undefined)?.[0];
  const slides = dia?.slides ?? [];
  const s0 = slides[0];
  const frasePT = s0?.texto ?? (data.brief as string | undefined) ?? '';
  if (!frasePT) return NextResponse.json({ erro: 'sem-texto', detalhe: 'A peça não tem texto para traduzir.' }, { status: 400 });
  const momentosPT = slides.length > 1 ? slides.map((x) => x.texto ?? '').filter(Boolean) : undefined;

  // TRADUZIR (texto real da peça → inglês, mesma voz, mesmos momentos).
  const t = await traduzirPecaSoulab(apiKey, {
    frase: frasePT,
    momentos: momentosPT,
    conceito: s0?.conceito,
    legenda: dia?.legenda,
    hashtags: dia?.hashtags,
    destaque: s0?.destaque,
  }).catch((e) => { throw e; });

  // as linhas EN: se a peça-fonte tinha vários momentos, usamos os traduzidos (com
  // fallback à contagem original para não perder slides); senão, uma frase só.
  const linhas = t.momentos && t.momentos.length > 1
    ? t.momentos
    : (momentosPT ? momentosPT.map((_, i) => t.momentos?.[i] ?? (i === 0 ? t.frase : '')).filter(Boolean) : [t.frase]);

  // clona os slides REAPROVEITANDO o visual (imagem, tipografia, efeito, ritmo) e
  // trocando só o texto. A imagem é a MESMA (conteúdo idêntico, só a língua muda).
  const novoSlides: Slide[] = linhas.map((texto, idx) => {
    const fonte = slides[idx] ?? s0 ?? {};
    return {
      tipo: 'kinetico',
      texto,
      destaque: idx === 0 ? t.destaque : [],
      notaVisual: fonte.notaVisual ?? s0?.notaVisual ?? null,
      imageUrl: fonte.imageUrl ?? s0?.imageUrl ?? null,
      capa: idx === 0,
      conceito: idx === 0 ? t.conceito : undefined,
      ...(fonte.efeito ?? s0?.efeito ? { efeito: (fonte.efeito ?? s0?.efeito) as string } : {}),
      ...(fonte.tipografia ?? s0?.tipografia ? { tipografia: (fonte.tipografia ?? s0?.tipografia) as Record<string, unknown> } : {}),
      ...(idx === 0 && (s0?.segPorMomento != null) ? { segPorMomento: s0.segPorMomento } : {}),
    };
  });

  const tipoId = sl.tipo ?? 'frase';
  const novoSlug = `soulab-en-${tipoId}-${Date.now()}`;
  const legenda = limparTravessoes(`${t.legenda ?? ''}\n\nSoulab · @${soulabHandle('en')}`);
  // NOTA: NÃO reaproveitamos o videoUrl (o MP4 tem o texto PT queimado); a EN
  // renderiza o seu. O clip (movimento sem texto) e o som SÃO reaproveitados.
  const novoDia: Dia = {
    dia: 1, mundo: SOULAB_MUNDO, palavra: t.frase.slice(0, 48),
    slides: novoSlides, faixa: dia?.faixa, legenda, hashtags: t.hashtags ?? [],
  };
  const novoTheme = {
    formato: 'reel', subtipo: 'kinetico', video: true, mundo: SOULAB_MUNDO, marca: 'soulab',
    soulab: {
      tipo: tipoId, formato: momentosPT ? 'momentos' : 'frase', lingua: 'en' as const,
      traduzidoDe: slug, // a peça PT de onde veio (rastreio)
      ...(sl.clipUrl ? { clipUrl: sl.clipUrl } : {}),
      ...(sl.somUrl ? { somUrl: sl.somUrl, somTipo: sl.somTipo, somEstilo: sl.somEstilo } : {}),
      ...(sl.veiaId ? { veiaId: sl.veiaId, veiaTitulo: sl.veiaTitulo, veiaLivro: sl.veiaLivro } : {}),
    },
  };

  const { error: upErr } = await supabase.from('carousel_collections').insert({
    slug: novoSlug,
    title: (t.frase.slice(0, 60)) || (data.title as string | undefined) || novoSlug,
    brief: t.frase,
    dias: [novoDia],
    theme: novoTheme,
  });
  if (upErr) return NextResponse.json({ erro: 'db', detalhe: upErr.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug: novoSlug });
}
