import { NextResponse } from 'next/server';
import { verifyPassword, setAdminCookie } from '@/lib/admin-auth';

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'invalido' }, { status: 400 });
  }
  if (!body.password || !verifyPassword(body.password)) {
    return NextResponse.json({ erro: 'auth' }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
