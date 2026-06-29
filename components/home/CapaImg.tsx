'use client';

import { useState } from 'react';

// Imagem de capa que tenta o URL principal (ex.: a capa guardada no Supabase
// pelo gerador do admin) e recua para uma capa local se o principal falhar.
export function CapaImg({
  src, fallback, alt, className, style,
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [cur, setCur] = useState(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cur}
      alt={alt}
      className={className}
      style={style}
      onError={() => { if (fallback && cur !== fallback) setCur(fallback); }}
    />
  );
}
