import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    email?: string;
    produto_slug?: string;
    produto_titulo?: string;
    preco?: string;
    paypal_order_id?: string;
  };

  if (!body.email || !body.produto_slug) {
    return NextResponse.json({ erro: 'campos-obrigatorios' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('compras').insert({
    email: body.email.trim().toLowerCase(),
    produto_slug: body.produto_slug,
    produto_titulo: body.produto_titulo ?? '',
    preco: body.preco ?? '',
    paypal_order_id: body.paypal_order_id ?? null,
  }).select().single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, compra: data });
}
