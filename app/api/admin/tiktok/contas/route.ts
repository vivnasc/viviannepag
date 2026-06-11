import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getContas } from '@/lib/tiktok/config';

export const runtime = 'nodejs';

// GET /api/admin/tiktok/contas — lista as contas TikTok ligadas (para a Vivianne
// ver/confirmar). NUNCA devolve os tokens: só info segura para identificar a
// conta e perceber o estado.

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ erro: 'auth' }, { status: 401 });

  const contas = await getContas();
  const seguras = contas.map((c) => ({
    openId: c.openId,
    displayName: c.displayName ?? null,
    scope: c.scope ?? null,
    ligadoEm: c.ligadoEm,
    renovadoEm: c.renovadoEm ?? null,
    accessExpiraEm: c.accessExpiraEm,
    refreshExpiraEm: c.refreshExpiraEm,
  }));

  return NextResponse.json({ total: seguras.length, contas: seguras });
}
