import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getPorta } from '@/lib/portas/marca';

export const runtime = 'nodejs';

// PORTAS · estado das pecas ja geradas de uma porta (slug '<porta>-*'), para a
// pagina /admin/portas/<porta> mostrar o que existe (imagem, video, publicado).
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const porta = getPorta(searchParams.get('porta') ?? '');
  if (!porta) return NextResponse.json({ erro: 'porta-invalida' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, brief, dias, theme, created_at')
    .like('slug', `${porta.id}-%`);
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string;
    brief?: string | null;
    dias?: Array<{ videoUrl?: string | null; legenda?: string | null; hashtags?: string[] | null; slides?: Array<{ texto?: string; conceito?: string; imageUrl?: string | null; destaque?: string[]; notaVisual?: string | null }> }> | null;
    theme?: { agendadoEm?: string | null; hora?: string | null; igPublicado?: boolean; publicado?: boolean; porta?: { tipo?: string; formato?: string } } | null;
    created_at?: string;
  };

  const pecas = ((data ?? []) as Row[]).map((row) => {
    const todosSlides = row.dias?.[0]?.slides ?? [];
    const slide = todosSlides[0];
    return {
      slug: row.slug,
      tipo: row.theme?.porta?.tipo ?? null,
      formato: row.theme?.porta?.formato ?? 'frase',
      momentos: todosSlides.length > 1 ? todosSlides.map((x) => x.texto ?? '').filter(Boolean) : null,
      texto: slide?.texto ?? row.brief ?? '',
      conceito: slide?.conceito ?? '',
      destaque: slide?.destaque ?? [],
      imageUrl: slide?.imageUrl ?? null,
      videoUrl: row.dias?.[0]?.videoUrl ?? null,
      legenda: row.dias?.[0]?.legenda ?? null,
      hashtags: row.dias?.[0]?.hashtags ?? [],
      fundoPrompt: slide?.notaVisual ?? null,
      agendadoEm: row.theme?.agendadoEm ?? null,
      hora: row.theme?.hora ?? null,
      publicado: Boolean(row.theme?.igPublicado || row.theme?.publicado),
      criadoEm: row.created_at ?? null,
    };
  }).sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''));

  return NextResponse.json({ ok: true, pecas });
}
