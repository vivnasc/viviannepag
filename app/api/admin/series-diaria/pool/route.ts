import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { listarMotions, listarAudios, usosDeMotions, type SerieId } from '@/lib/series/pool';

export const runtime = 'nodejs';

// GET /api/admin/series-diaria/pool?serie=hojeemmim — estado da pool reciclada
// da escola-veus (motions + áudios), para a página mostrar que está ligada.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const serie = (req.nextUrl.searchParams.get('serie') === 'vcsabia' ? 'vcsabia' : 'hojeemmim') as SerieId;
  try {
    const [motions, audios, usos] = await Promise.all([listarMotions(serie), listarAudios(serie), usosDeMotions()]);
    const novos = motions.filter((m) => !(usos[m.path] > 0)).length;
    return NextResponse.json({
      ok: true,
      serie,
      motions: motions.length,
      novos,
      audios: audios.map((a) => ({ mood: a.mood, n: a.ficheiros.length })),
      amostra: motions.slice(0, 5).map((m) => ({ nome: m.nome, categoria: m.categoria ?? null, mood: m.mood ?? null })),
    });
  } catch (e) {
    return NextResponse.json({ erro: 'pool', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
