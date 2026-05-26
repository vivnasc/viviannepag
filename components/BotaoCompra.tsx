'use client';

import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';

function PayPalLoader({ isPt }: { isPt: boolean }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isPending) return <p className="text-creme-2/60 text-sm italic text-center py-4">A carregar PayPal...</p>;
  if (isRejected) return <p className="text-rosa text-sm italic text-center py-4">{isPt ? 'Erro ao carregar PayPal. Verifica a ligacao.' : 'Error loading PayPal. Check your connection.'}</p>;
  return null;
}

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
  const [email, setEmail] = useState('');
  const [emailValido, setEmailValido] = useState(false);
  const [pago, setPago] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPt = locale === 'pt';

  const precoNum = parseFloat(preco.replace(/[^0-9.,]/g, '').replace(',', '.'));

  function validarEmail(v: string) {
    setEmail(v);
    setEmailValido(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
  }

  async function registarCompra(orderId?: string) {
    await fetch('/api/compra', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        produto_slug: slug,
        produto_titulo: titulo,
        preco,
        paypal_order_id: orderId,
      }),
    });
  }

  async function obterDownload() {
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (res.ok && json.url) { setDownloadUrl(json.url); return; }
    } catch {}
    setDownloadUrl(`/produtos/${slug}.pdf`);
  }

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
      <div className="text-sm">
        <p className="text-creme-2/60 italic font-serif">
          {isPt ? 'Pagamento em configuração.' : 'Payment being configured.'}
        </p>
        <p className="text-rosa/50 text-xs mt-2">
          PayPal ID: {clientId ? 'sim' : 'NAO'} | Preco: {preco} = {precoNum || 'ERRO'}
        </p>
      </div>
    );
  }

  if (pago) {
    return (
      <div className="bg-ambar/10 border border-ambar/40 rounded-[14px] p-6 text-center">
        <p className="text-ambar font-serif text-[1.2rem] mb-2">
          {isPt ? 'Obrigada!' : 'Thank you!'}
        </p>
        <p className="text-creme-2 text-sm mb-2">
          {isPt ? 'Pagamento confirmado.' : 'Payment confirmed.'}
        </p>
        <p className="text-creme-2/70 text-xs mb-5">
          {email}
        </p>
        <a
          href={downloadUrl || `/produtos/${slug}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-ambar text-terra font-sans text-[0.92rem] font-medium tracking-[0.04em] rounded-[14px] px-6 py-3 hover:bg-ocre transition-colors no-underline"
        >
          {isPt ? 'Descarregar agora' : 'Download now'}
        </a>
      </div>
    );
  }

  const inputCls = 'w-full bg-transparent border border-ocre/45 rounded-[14px] py-3.5 px-4.5 text-creme font-sans text-base outline-none placeholder:text-creme/40 placeholder:italic focus:border-ambar transition-colors';

  return (
    <div className="max-w-[420px]">
      <div className="mb-5">
        <label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">
          {isPt ? 'o teu email' : 'your email'}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => validarEmail(e.target.value)}
          placeholder={isPt ? 'para onde enviar o acesso' : 'where to send access'}
          className={inputCls}
        />
        {email && !emailValido && (
          <p className="text-rosa/70 text-xs mt-1.5 italic">
            {isPt ? 'Email inválido' : 'Invalid email'}
          </p>
        )}
      </div>

      {emailValido ? (
        <div>
          <PayPalScriptProvider
            options={{
              clientId: clientId!,
              currency: 'EUR',
              intent: 'capture',
            }}
          >
            <PayPalLoader isPt={isPt} />
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
              let orderId: string | undefined;
              if (actions.order) {
                const details = await actions.order.capture();
                orderId = details.id;
              }
              await registarCompra(orderId);
              setPago(true);
              obterDownload();
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              setErro(isPt ? 'Algo correu mal. Tenta de novo.' : 'Something went wrong. Try again.');
            }}
          />
          </PayPalScriptProvider>
          <a
            href={`https://www.paypal.com/paypalme/viviannedossantos/${precoNum}EUR`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-ocre/60 text-[0.75rem] hover:text-ambar transition-colors no-underline"
          >
            {isPt ? 'Problema com o botao? Paga directamente via PayPal.me' : 'Button not working? Pay directly via PayPal.me'}
          </a>
        </div>
      ) : (
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-creme-2/50 text-sm italic font-serif">
            {isPt ? 'Introduz o teu email para ver as opções de pagamento' : 'Enter your email to see payment options'}
          </p>
        </div>
      )}
      {erro && <p className="text-rosa text-sm mt-3 italic font-serif">{erro}</p>}
    </div>
  );
}
