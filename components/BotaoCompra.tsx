'use client';

import { useState } from 'react';

export function BotaoCompra({
  slug,
  locale,
  label,
  checkoutUrl,
}: {
  slug: string;
  locale: string;
  label: string;
  checkoutUrl?: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function comprar() {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    setLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, locale }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.url) {
      window.location.href = json.url;
    }
  }

  return (
    <button
      onClick={comprar}
      disabled={loading}
      className="inline-block bg-ambar text-terra font-sans text-[0.95rem] font-medium tracking-[0.04em] rounded-[14px] px-8 py-4 hover:bg-ocre transition-colors disabled:opacity-70 cursor-pointer"
    >
      {loading ? (locale === 'pt' ? 'a processar…' : 'processing…') : label}
    </button>
  );
}
