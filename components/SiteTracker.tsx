'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Regista cada visualização de página do site público em /api/track (1.ª-parte,
// para o painel /admin/site-analytics). Usa sendBeacon para não atrasar nada.
export function SiteTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      // só conta o domínio REAL — ignora previews .vercel.app, localhost, etc.
      // (senão as visitas de teste poluem as análises)
      if (!/(^|\.)viviannedossantos\.com$/i.test(window.location.hostname)) return;
      const body = JSON.stringify({ path: pathname + (window.location.search || ''), ref: document.referrer || '' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true });
      }
    } catch { /* ignora */ }
  }, [pathname]);
  return null;
}
