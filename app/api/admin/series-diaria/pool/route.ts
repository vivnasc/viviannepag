import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { listarMotions, listarAudios, usosDeMotions, emQuarentena, QUARENTENA_DIAS, type SerieId } from '@/lib/series/pool';

export const runtime = 'nodejs';

// GET /api/admin/series-diaria/pool?serie=hojeemmim — estado da pool reciclada
// (motions + áudios). Mostra também a QUARENTENA: usados há <90 dias estão a
// descansar e não entram na seleção — o que sobra é o que há para usar.
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });
  const serie = (req.nextUrl.searchParams.get('serie') === 'vcsabia' ? 'vcsabia' : 'hojeemmim') as SerieId;
  try {
    const [motions, audios, usos] = await Promise.all([listarMotions(serie), listarAudios(serie), usosDeMotions()]);
    const hoje = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
    const quarentena = motions.filter((m) => emQuarentena(usos[m.path], hoje)).length;
    const novos = motions.filter((m) => !((usos[m.path]?.n ?? 0) > 0)).length;
    return NextResponse.json({
      ok: true,
      serie,
      motions: motions.length,
      novos,
      quarentena,
      disponiveis: motions.length - quarentena,
      quarentenaDias: QUARENTENA_DIAS,
      audios: audios.map((a) => ({ mood: a.mood, n: a.ficheiros.length, ficheiros: a.ficheiros })),
      amostra: motions.slice(0, 5).map((m) => ({ nome: m.nome, categoria: m.categoria ?? null, mood: m.mood ?? null })),
    });
  } catch (e) {
    return NextResponse.json({ erro: 'pool', detalhe: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
