import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { lerManifesto } from '@/lib/anuncio/manifest';

export const runtime = 'nodejs';

// Estado das peças JÁ geradas de uma variante (para a página mostrar as cenas/o
// motion que ela já fez, mesmo depois de atualizar). Lê o manifesto no Storage.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const v = (req.nextUrl.searchParams.get('variante') === 'B' ? 'B' : 'A') as 'A' | 'B';
  try {
    const man = await lerManifesto(getSupabaseAdmin(), v);
    return NextResponse.json({ ok: true, cenas: man.cenas ?? [], voz: man.voz ? { url: man.voz.url } : null });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}
