'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useCart, precoNum } from '@/lib/cart';
import { upsellsParaCarrinho, packBySlug } from '@/lib/packs';

type Entrega = { slug: string; titulo: string; url: string | null };

function PayPalLoader({ isPt }: { isPt: boolean }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isPending) return <p className="text-creme-2/60 text-sm italic text-center py-3">{isPt ? 'A carregar PayPal…' : 'Loading PayPal…'}</p>;
  if (isRejected) return <p className="text-rosa text-sm italic text-center py-3">{isPt ? 'Erro ao carregar PayPal.' : 'Error loading PayPal.'}</p>;
  return null;
}

export function CartWidget() {
  const { itens, count, total, aberto, abrir, fechar, remove, add, clear, hidratado } = useCart();
  const locale = useLocale();
  const isPt = locale !== 'en';
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const [email, setEmail] = useState('');
  const [emailValido, setEmailValido] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [vista, setVista] = useState<'carrinho' | 'pago'>('carrinho');
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [packsPagos, setPacksPagos] = useState<{ titulo: string; zipUrl: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const upsells = useMemo(() => {
    if (vista === 'pago') return [];
    return upsellsParaCarrinho(itens.map((i) => i.slug)).map((u) => {
      const soma = u.substitui.reduce((s, slug) => {
        const it = itens.find((x) => x.slug === slug);
        return s + precoNum(it?.preco);
      }, 0);
      return { ...u, soma };
    }).filter((u) => precoNum(u.pack.preco) < u.soma);
  }, [itens, vista]);

  function validarEmail(v: string) {
    setEmail(v);
    setEmailValido(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
  }

  function aplicarUpsell(packSlug: string, substitui: string[]) {
    const pack = packBySlug(packSlug);
    if (!pack) return;
    substitui.forEach((s) => remove(s));
    add({ slug: pack.slug, titulo: isPt ? pack.titulo : pack.titulo_en, preco: pack.preco, capa: pack.capa, badge: 'pack' });
  }

  async function processarCompra(orderId?: string) {
    setProcessando(true);
    const mail = email.trim().toLowerCase();
    const lang = isPt ? 'pt' : 'en';
    const sufixoEn = isPt ? '' : '&lang=en';
    const lista = [...itens];
    const out: Entrega[] = [];
    const packs: { titulo: string; zipUrl: string }[] = [];
    // URL same-origin (anexo) por ficheiro: descarrega de imediato sem abrir
    // separador vazio (about:blank), seja produto avulso ou item de pack.
    const linkDirecto = (s: string) => `/api/download-directo?slug=${s}&email=${encodeURIComponent(mail)}${sufixoEn}`;
    for (const it of lista) {
      try {
        await fetch('/api/compra', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: mail, produto_slug: it.slug, produto_titulo: it.titulo, preco: it.preco, paypal_order_id: orderId }),
        });
      } catch {}
      if (it.incluidos && it.incluidos.length) {
        // Pack montado pela pessoa: entrega pela lista de livros escolhidos.
        const slugs = it.incluidos.map((f) => f.slug).join(',');
        packs.push({ titulo: it.titulo, zipUrl: `/api/download-zip?slugs=${slugs}&email=${encodeURIComponent(mail)}${sufixoEn}` });
        for (const f of it.incluidos) out.push({ slug: f.slug, titulo: f.titulo, url: linkDirecto(f.slug) });
      } else if (it.slug.startsWith('pack-')) {
        packs.push({ titulo: it.titulo, zipUrl: `/api/download-zip?slug=${it.slug}&email=${encodeURIComponent(mail)}${sufixoEn}` });
        try {
          const r = await fetch('/api/download-pack', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug, lang }) });
          const j = await r.json();
          if (r.ok && Array.isArray(j.ficheiros) && j.ficheiros.length) {
            for (const f of j.ficheiros) out.push({ slug: f.slug, titulo: f.titulo, url: f.url ? linkDirecto(f.slug) : null });
          } else { out.push({ slug: it.slug, titulo: it.titulo, url: null }); }
        } catch { out.push({ slug: it.slug, titulo: it.titulo, url: null }); }
      } else {
        out.push({ slug: it.slug, titulo: it.titulo, url: linkDirecto(it.slug) });
      }
      try {
        await fetch('/api/email-compra', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: mail, slug: it.slug, titulo: it.titulo, lang }) });
      } catch {}
    }
    setPacksPagos(packs);
    setEntregas(out);
    setProcessando(false);
    setVista('pago');
    clear();
  }

  // Botao flutuante — so quando ha itens (e depois de hidratar para evitar mismatch SSR).
  const mostrarBotao = hidratado && count > 0 && !aberto;

  return (
    <>
      {mostrarBotao && (
        <button
          onClick={abrir}
          aria-label={isPt ? 'Abrir carrinho' : 'Open cart'}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-ambar text-terra rounded-full pl-4 pr-5 py-3 shadow-lg hover:bg-ocre transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="font-sans text-[0.85rem] font-semibold">{count}</span>
        </button>
      )}

      {aberto && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={fechar} />
          <aside className="relative w-full max-w-[440px] h-full bg-terra border-l border-ocre/25 flex flex-col shadow-2xl">
            <header className="flex items-center justify-between px-6 py-5 border-b border-ocre/20 shrink-0">
              <div>
                <p className="text-[0.68rem] tracking-[0.22em] uppercase text-ocre/80">{isPt ? 'carrinho' : 'cart'}</p>
                <h2 className="font-serif text-creme text-xl">{vista === 'pago' ? (isPt ? 'Compra concluída' : 'Order complete') : (isPt ? `${count} ${count === 1 ? 'título' : 'títulos'}` : `${count} ${count === 1 ? 'item' : 'items'}`)}</h2>
              </div>
              <button onClick={fechar} className="text-creme-2/60 hover:text-creme text-2xl leading-none">×</button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {vista === 'pago' ? (
                <div>
                  <div className="bg-ambar/10 border border-ambar/40 rounded-[14px] p-5 mb-5 text-center">
                    <p className="text-ambar font-serif text-[1.25rem] mb-1">{isPt ? 'Obrigada!' : 'Thank you!'}</p>
                    <p className="text-creme-2 text-sm">{isPt ? 'Pagamento confirmado. Os teus ficheiros estão abaixo e também vão para o teu email.' : 'Payment confirmed. Your files are below and were also sent to your email.'}</p>
                    <p className="text-creme-2/60 text-xs mt-2">{email}</p>
                  </div>
                  {packsPagos.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {packsPagos.map((pk, i) => (
                        <a
                          key={i}
                          href={pk.zipUrl}
                          download
                          className="flex items-center justify-center gap-2 bg-ambar text-terra font-sans text-[0.88rem] font-semibold rounded-[12px] px-4 py-3 hover:bg-ocre transition-colors no-underline"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {isPt ? 'Descarregar tudo (ZIP)' : 'Download all (ZIP)'}
                        </a>
                      ))}
                      <p className="text-creme-2/55 text-[0.75rem] text-center">{isPt ? 'ou ficheiro a ficheiro:' : 'or file by file:'}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {entregas.map((f) => (
                      f.url ? (
                        <a key={f.slug} href={f.url} download className="block bg-terra-2/50 hover:bg-ambar/20 rounded-[10px] px-4 py-2.5 text-creme-2 text-[0.85rem] no-underline transition-colors">↓ {f.titulo}</a>
                      ) : (
                        <span key={f.slug} className="block bg-terra-2/30 rounded-[10px] px-4 py-2.5 text-creme-2/50 text-[0.85rem] italic">{f.titulo} {isPt ? '(chega por email)' : '(coming by email)'}</span>
                      )
                    ))}
                  </div>
                  <p className="mt-5 text-creme-2/50 text-xs text-center">
                    {isPt ? 'Problema com o download? ' : 'Problem with the download? '}
                    <a href="https://wa.me/258845243875" target="_blank" rel="noopener noreferrer" className="text-ocre hover:text-ambar no-underline">WhatsApp</a>
                  </p>
                </div>
              ) : count === 0 ? (
                <p className="text-creme-2/60 italic font-serif text-center py-10">{isPt ? 'O teu carrinho está vazio.' : 'Your cart is empty.'}</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-6">
                    {itens.map((it) => (
                      <div key={it.slug} className="flex items-center gap-3">
                        {it.capa ? <img src={it.capa} alt="" className="w-11 h-14 object-cover rounded-md border border-ocre/25 shrink-0" /> : <div className="w-11 h-14 rounded-md bg-terra-2/60 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-creme text-[0.92rem] font-serif leading-tight truncate">{it.titulo}</p>
                          <p className="text-ambar text-[0.82rem]">{it.preco}</p>
                        </div>
                        <button onClick={() => remove(it.slug)} className="text-rosa/60 hover:text-rosa text-xs shrink-0">{isPt ? 'remover' : 'remove'}</button>
                      </div>
                    ))}
                  </div>

                  {upsells.length > 0 && (
                    <div className="mb-6 space-y-2.5">
                      {upsells.map((u) => (
                        <button
                          key={u.pack.slug}
                          onClick={() => aplicarUpsell(u.pack.slug, u.substitui)}
                          className="w-full text-left bg-ouro/10 border border-ouro/40 rounded-[12px] px-4 py-3 hover:bg-ouro/20 transition-colors"
                        >
                          <p className="text-ambar text-[0.82rem] font-medium">
                            {isPt ? `Leva o pack ${isPt ? u.pack.titulo : u.pack.titulo_en} por ${u.pack.preco}` : `Get the ${u.pack.titulo_en} for ${u.pack.preco}`}
                          </p>
                          <p className="text-creme-2/70 text-[0.74rem] mt-0.5">
                            {isPt
                              ? `Tens ${u.substitui.length} títulos deste universo (${u.soma.toFixed(0)}€). Troca pelo pack completo e poupa ${(u.soma - precoNum(u.pack.preco)).toFixed(0)}€.`
                              : `You have ${u.substitui.length} titles from this world (€${u.soma.toFixed(0)}). Swap for the full pack and save €${(u.soma - precoNum(u.pack.preco)).toFixed(0)}.`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-ocre/20 pt-4 mb-5 flex items-baseline justify-between">
                    <span className="text-creme-2/70 text-sm">{isPt ? 'Total' : 'Total'}</span>
                    <span className="text-ambar font-serif text-[1.4rem]">€{total.toFixed(2)}</span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[0.7rem] tracking-[0.16em] uppercase text-ocre/80 mb-2">{isPt ? 'o teu email' : 'your email'}</label>
                    <input
                      type="email" value={email} onChange={(e) => validarEmail(e.target.value)}
                      placeholder={isPt ? 'para onde enviar o acesso' : 'where to send access'}
                      className="w-full bg-transparent border border-ocre/45 rounded-[12px] py-3 px-4 text-creme font-sans text-base outline-none placeholder:text-creme/40 placeholder:italic focus:border-ambar transition-colors"
                    />
                    {email && !emailValido && <p className="text-rosa/70 text-xs mt-1.5 italic">{isPt ? 'Email inválido' : 'Invalid email'}</p>}
                  </div>

                  {processando ? (
                    <p className="text-ambar text-sm italic text-center py-4">{isPt ? 'A preparar os teus ficheiros…' : 'Preparing your files…'}</p>
                  ) : !clientId ? (
                    <p className="text-creme-2/60 italic text-sm text-center py-3">{isPt ? 'Pagamento em configuração.' : 'Payment being configured.'}</p>
                  ) : emailValido ? (
                    <PayPalScriptProvider options={{ clientId: clientId!, currency: 'EUR', intent: 'capture' }}>
                      <PayPalLoader isPt={isPt} />
                      <PayPalButtons
                        forceReRender={[total]}
                        style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 }}
                        createOrder={(_d, actions) => actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [{
                            description: isPt ? `${count} títulos · Vivianne dos Santos` : `${count} items · Vivianne dos Santos`,
                            amount: { currency_code: 'EUR', value: total.toFixed(2) },
                            custom_id: 'carrinho',
                          }],
                        })}
                        onApprove={async (_d, actions) => {
                          let orderId: string | undefined;
                          if (actions.order) { const det = await actions.order.capture(); orderId = det.id; }
                          await processarCompra(orderId);
                        }}
                        onError={(e) => { console.error('PayPal error:', e); setErro(isPt ? 'Algo correu mal. Tenta de novo.' : 'Something went wrong. Try again.'); }}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <div className="border border-ocre/20 rounded-[12px] p-4 text-center">
                      <p className="text-creme-2/50 text-sm italic font-serif">{isPt ? 'Introduz o teu email para pagar' : 'Enter your email to pay'}</p>
                    </div>
                  )}
                  {erro && <p className="text-rosa text-sm mt-3 italic font-serif">{erro}</p>}
                  <p className="mt-4 text-creme-2/45 text-[0.72rem] text-center leading-relaxed">
                    {isPt ? 'Pagamento seguro via PayPal (cartão também aceite). Entrega imediata em PDF.' : 'Secure payment via PayPal (card also accepted). Immediate PDF delivery.'}
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
