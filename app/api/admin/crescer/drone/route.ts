import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { droneDoTema, droneUrl, type DroneId, DRONES } from '@/lib/soulab/drones';

export const runtime = 'nodejs';
export const maxDuration = 120;

// DRONE por baixo da voz (antes do render, regra da Vivianne). POST { slug, droneId? }
// aplica o drone da biblioteca (por defeito o do tema) e guarda em theme.soulab.somUrl
// para ela OUVIR. POST { slug, remover:true } tira. O render mistura-o baixinho.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slug?: string; droneId?: string; remover?: boolean };
  if (!body.slug) return NextResponse.json({ erro: 'slug' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('carousel_collections').select('theme').eq('slug', body.slug).maybeSingle();
  if (error || !data) return NextResponse.json({ erro: 'nao-encontrada' }, { status: 404 });

  type Theme = { crescer?: { tematica?: string }; soulab?: Record<string, unknown> } & Record<string, unknown>;
  const theme = (data.theme ?? {}) as Theme;
  const soulab = { ...(theme.soulab ?? {}) } as Record<string, unknown>;

  if (body.remover) {
    soulab.somUrl = null; soulab.somTipo = null; soulab.somEstilo = null;
    await supabase.from('carousel_collections').update({ theme: { ...theme, soulab } }).eq('slug', body.slug);
    return NextResponse.json({ ok: true, somUrl: null });
  }

  const droneId: DroneId = (body.droneId && DRONES.some((d) => d.id === body.droneId) ? body.droneId : droneDoTema(theme.crescer?.tematica)) as DroneId;
  try {
    const url = await droneUrl(droneId);
    soulab.somUrl = url; soulab.somTipo = 'drone'; soulab.somEstilo = droneId;
    await supabase.from('carousel_collections').update({ theme: { ...theme, soulab } }).eq('slug', body.slug);
    return NextResponse.json({ ok: true, somUrl: url, droneId });
  } catch (e) {
    return NextResponse.json({ erro: 'drone', detalhe: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }
}
