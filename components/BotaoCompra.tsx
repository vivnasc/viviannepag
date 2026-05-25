'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

export function BotaoCompra({
  slug,
  locale,
  titulo,
  preco,
  checkoutUrl,
}: {
  slug: string;
  locale: string;
  titulo: string;
  preco: string;
  checkoutUrl?: string | null;
}) {
  const [pago, setPago] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPt = locale === 'pt';

  const precoNum = parseFloat(preco.replace(/[^0-9.,]/g, '').replace(',', '.'));

  if (checkoutUrl) {
    return (
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-ambar text-terra font-sans text-[0.95rem] font-medium tracking-[0.04em] rounded-[14px] px-8 py-4 hover:bg-ocre transition-colors no-underline"
      >
        {isPt ? 'Começar a travessia' : 'Start the journey'}
      </a>
    );
  }

  if (!clientId || !precoNum) {
    return (
      <p className="text-creme-2/60 italic font-serif text-sm">
        {isPt ? 'Pagamento em configuração.' : 'Payment being configured.'}
      </p>
    );
  }

  if (pago) {
    return (
      <div className="bg-ambar/10 border border-ambar/40 rounded-[14px] p-6 text-center">
        <p className="text-ambar font-serif text-[1.2rem] mb-2">
          {isPt ? 'Obrigada!' : 'Thank you!'}
        </p>
        <p className="text-creme-2 text-sm">
          {isPt
            ? 'Pagamento confirmado. Vais receber um email com o acesso ao teu conteúdo.'
            : 'Payment confirmed. You will receive an email with access to your content.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[420px]">
      <PayPalScriptProvider
        options={{
          clientId,
          currency: 'EUR',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay',
            height: 50,
          }}
          createOrder={(_data, actions) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: titulo,
                  amount: {
                    currency_code: 'EUR',
                    value: precoNum.toFixed(2),
                  },
                  custom_id: slug,
                },
              ],
            });
          }}
          onApprove={async (_data, actions) => {
            if (actions.order) {
              await actions.order.capture();
            }
            setPago(true);
          }}
          onError={() => {
            setErro(isPt ? 'Algo correu mal. Tenta de novo.' : 'Something went wrong. Try again.');
          }}
        />
      </PayPalScriptProvider>
      {erro && <p className="text-rosa text-sm mt-3 italic font-serif">{erro}</p>}
    </div>
  );
}
