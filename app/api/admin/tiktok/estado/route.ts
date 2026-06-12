import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getContas } from '@/lib/tiktok/config';
import { estadoPublicacao } from '@/lib/tiktok/publish';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/estado?publishId=... — consulta o estado de uma
// publicação na 1ª conta ligada. Útil para ver o resultado sem ficar à espera
// (o /testar agora devolve rápido com o publishId; depois sonda-se aqui).

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const publishId = req.nextUrl.searchParams.get('publishId');
  if (!publishId) return NextResponse.json({ erro: 'publishId' }, { status: 400 });

  const contas = await getContas();
  if (!contas.length) return NextResponse.json({ erro: 'sem-conta' }, { status: 409 });

  const e = await estadoPublicacao(contas[0].accessToken, publishId);
  return NextResponse.json(e);
}
