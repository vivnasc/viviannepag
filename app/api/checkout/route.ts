import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = (await req.json()) as { slug?: string; locale?: string };
  if (!body.slug) {
    return NextResponse.json({ erro: 'slug-obrigatorio' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: produto } = await supabase
    .from('produtos')
    .select('*')
    .eq('slug', body.slug)
    .eq('publicado', true)
    .single();

  if (!produto) {
    return NextResponse.json({ erro: 'produto-nao-encontrado' }, { status: 404 });
  }

  const precoNum = parseFloat(
    (produto.preco as string).replace(/[^0-9.,]/g, '').replace(',', '.')
  );
  if (!precoNum || precoNum <= 0) {
    return NextResponse.json({ erro: 'preco-invalido' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
  const locale = body.locale === 'en' ? 'en' : 'pt';
  const lojaPath = locale === 'en' ? '/en/loja' : '/loja';

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(precoNum * 100),
          product_data: {
            name: produto.titulo as string,
            description: (produto.subtitulo as string) || undefined,
            ...(produto.capa
              ? { images: [(produto.capa as string).startsWith('http') ? produto.capa as string : `${url}${produto.capa}`] }
              : {}),
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${url}${lojaPath}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}${lojaPath}/${produto.slug}`,
    metadata: {
      produto_id: produto.id as string,
      slug: produto.slug as string,
    },
  });

  return NextResponse.json({ url: session.url });
}
