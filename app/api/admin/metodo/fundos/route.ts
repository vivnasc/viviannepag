import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

// GET ?conta= : FUNDOS já guardados — as imagens das imagens já geradas no
// método, para reaproveitar num reel de frase rápido (sem gerar imagem nova,
// sem gastar Replicate). Sem `conta` devolve os fundos de todas as contas.
// É a galeria que a Vivianne pediu para não perder as imagens lindas (ver.soltar).
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const conta = new URL(req.url).searchParams.get('conta') ?? '';

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('carousel_collections')
    .select('slug, dias, theme, created_at')
    .like('slug', 'metodo-%');
  if (error) return NextResponse.json({ erro: 'db', detalhe: error.message }, { status: 500 });

  type Row = {
    slug: string;
    dias?: { slides?: { imageUrl?: string | null }[] }[] | null;
    theme?: { metodo?: { conta?: string } } | null;
    created_at?: string;
  };

  const vistos = new Set<string>();
  const fundos: { url: string; conta: string | null; slug: string; criadoEm: string | null }[] = [];
  for (const r of (data ?? []) as Row[]) {
    const c = r.theme?.metodo?.conta ?? null;
    if (conta && c !== conta) continue;
    for (const s of r.dias?.[0]?.slides ?? []) {
      const u = s.imageUrl;
      if (u && !vistos.has(u)) {
        vistos.add(u);
        fundos.push({ url: u, conta: c, slug: r.slug, criadoEm: r.created_at ?? null });
      }
    }
  }
  fundos.sort((a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''));
  return NextResponse.json({ ok: true, fundos });
}
