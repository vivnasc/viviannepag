import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'edge';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: { email?: string; origem?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'invalido' }, { status: 400 });
  }

  if (body.website && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const origem = (body.origem ?? 'site').slice(0, 60);

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ erro: 'email-invalido' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('subscribers')
    .insert({ email, source: origem });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ erro: 'ja-subscrito' }, { status: 409 });
    }
    console.error('subscrever erro:', error);
    return NextResponse.json({ erro: 'servidor' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
