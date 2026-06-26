import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { definirCena } from '@/lib/anuncio/manifest';

export const runtime = 'nodejs';

// ESCOLHER da biblioteca: atribui um clip JÁ existente (url) a um plano, sem gerar
// nada. NÃO apaga o ficheiro (pode estar a ser usado noutro plano/variante).
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  let variante = 'A', idx = 0, url = '';
  try { const b = await req.json(); if (b?.variante === 'B') variante = 'B'; if (Number.isInteger(b?.idx)) idx = b.idx; if (typeof b?.url === 'string') url = b.url; } catch {}
  if (!url) return NextResponse.json({ erro: 'falta-url' }, { status: 400 });
  try {
    await definirCena(getSupabaseAdmin(), variante, idx, { motionUrl: url, cenaUrl: undefined });
    return NextResponse.json({ ok: true, url, idx });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
