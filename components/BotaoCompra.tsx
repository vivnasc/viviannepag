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
  pack = false,
}: {
  slug: string;
  locale: string;
  titulo: string;
  preco: string;
  checkoutUrl?: string | null;
  pack?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [licenca, setLicenca] = useState<string | null>(null);
  const [emailValido, setEmailValido] = useState(false);
  const [pago, setPago] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<{ slug: string; titulo: string; url: string | null }[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPt = locale === 'pt';

  const precoNum = parseFloat(preco.replace(/[^0-9.,]/g, '').replace(',', '.'));

  function validarEmail(v: string) {
    setEmail(v);
    setEmailValido(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
  }

  async function registarCompra(orderId?: string) {
    const res = await fetch('/api/compra', {
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
    try {
      const json = await res.json();
      if (json.licenca) setLicenca(json.licenca);
    } catch {}
  }

  const lang = isPt ? 'pt' : 'en';
  const sufixoEn = isPt ? '' : '&lang=en';

  async function enviarEmail() {
    try {
      await fetch('/api/email-compra', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), slug, titulo, lang }),
      });
    } catch {}
  }

  async function obterDownload() {
    if (pack) {
      try {
        const res = await fetch('/api/download-pack', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slug, lang }),
        });
        const json = await res.json();
        if (res.ok && Array.isArray(json.ficheiros) && json.ficheiros.length) {
          setDownloads(json.ficheiros);
          return;
        }
      } catch {}
      // Sem ficheiros prontos: o email leva o acesso. Deixa downloads vazio.
      setDownloads([]);
      return;
    }
    // Same-origin (anexo) para a descarga ser imediata, sem abrir separador vazio.
    setDownloadUrl(`/api/download-directo?slug=${slug}&email=${encodeURIComponent(email.trim().toLowerCase())}${sufixoEn}`);
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
      <p className="text-creme-2/60 italic font-serif text-sm">
        {isPt ? 'Pagamento em configuração.' : 'Payment being configured.'}
      </p>
    );
  }

  if (pago) {
    return (
      <div className="bg-ambar/10 border border-ambar/40 rounded-[14px] p-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gratidao-sucesso.png" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-28 rounded-[12px] object-cover mb-3 border border-ambar/30" />
        <p className="text-ambar font-serif text-[1.2rem] mb-2">
          {isPt ? 'Obrigada!' : 'Thank you!'}
        </p>
        <p className="text-creme-2 text-sm mb-2">
          {isPt ? 'Pagamento confirmado.' : 'Payment confirmed.'}
        </p>
        <p className="text-creme-2/70 text-xs mb-3">
          {email}
        </p>
        {licenca && (
          <div className="bg-terra-2/60 rounded-[10px] px-4 py-3 mb-5">
            <p className="text-[0.65rem] tracking-[0.15em] uppercase text-ocre/60 mb-1">
              {isPt ? 'licenca de uso pessoal' : 'personal use license'}
            </p>
            <p className="font-mono text-ambar text-[0.9rem] tracking-[0.1em]">{licenca}</p>
          </div>
        )}
        {pack ? (
          downloads && downloads.length ? (
            <div className="text-left">
              <a
                href={`/api/download-zip?slug=${slug}&email=${encodeURIComponent(email.trim().toLowerCase())}${sufixoEn}`}
                download
                className="flex items-center justify-center gap-2 bg-ambar text-terra font-sans text-[0.9rem] font-semibold rounded-[12px] px-5 py-3 mb-3 hover:bg-ocre transition-colors no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {isPt ? 'Descarregar tudo (ZIP)' : 'Download all (ZIP)'}
              </a>
              <p className="text-creme-2/70 text-xs mb-2 text-center">
                {isPt ? `ou ficheiro a ficheiro — ${downloads.length} incluídos:` : `or file by file — ${downloads.length} included:`}
              </p>
              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-1.5">
                {downloads.map((f) => (
                  f.url ? (
                    <a
                      key={f.slug}
                      href={`/api/download-directo?slug=${f.slug}&email=${encodeURIComponent(email.trim().toLowerCase())}${sufixoEn}`}
                      download
                      className="block bg-terra-2/50 hover:bg-ambar/20 rounded-[8px] px-3 py-2 text-creme-2 text-[0.82rem] no-underline transition-colors"
                    >
                      ↓ {f.titulo}
                    </a>
                  ) : (
                    <span key={f.slug} className="block bg-terra-2/30 rounded-[8px] px-3 py-2 text-creme-2/50 text-[0.82rem] italic">
                      {f.titulo} {isPt ? '(em breve por email)' : '(coming by email)'}
                    </span>
                  )
                ))}
              </div>
            </div>
          ) : (
            <p className="text-creme-2/70 text-sm italic">{isPt ? 'Vais receber todos os ficheiros no teu email.' : 'You will receive all the files in your email.'}</p>
          )
        ) : downloadUrl ? <a
          href={downloadUrl}
          download
          className="inline-block bg-ambar text-terra font-sans text-[0.92rem] font-medium tracking-[0.04em] rounded-[14px] px-6 py-3 hover:bg-ocre transition-colors no-underline"
        >
          {isPt ? 'Descarregar agora' : 'Download now'}
        </a> : <p className="text-creme-2/70 text-sm italic">{isPt ? 'Vais receber o link de download no teu email.' : 'You will receive the download link in your email.'}</p>}
        <p className="mt-4 text-creme-2/50 text-xs">
          {isPt ? 'Problema com o download?' : 'Problem with the download?'}
          {' '}
          <a href="https://wa.me/258845243875" target="_blank" rel="noopener noreferrer" className="text-ocre hover:text-ambar no-underline">
            {isPt ? 'Contacta-me no WhatsApp' : 'Contact me on WhatsApp'}
          </a>
        </p>
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
              enviarEmail();
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
