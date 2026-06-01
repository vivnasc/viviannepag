'use client';

import { useState } from 'react';

export function AberturaExpandivel({
  titulo,
  teaser,
  texto,
  assinatura,
  align = 'left',
}: {
  titulo?: string;
  teaser?: string;
  texto?: string;
  assinatura?: string;
  align?: 'left' | 'center';
}) {
  const [aberto, setAberto] = useState(false);
  const temFull = !!texto;
  const alinhamento = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`max-w-[680px] ${align === 'center' ? 'mx-auto' : ''} ${alinhamento}`}>
      {titulo && (
        <p className="text-[0.72rem] tracking-[0.28em] uppercase text-ocre mb-3">
          {titulo}
        </p>
      )}
      {teaser && (
        <p className="font-serif text-creme text-[1.08rem] leading-[1.55] italic mb-3">
          {teaser}
        </p>
      )}
      {temFull && (
        <>
          <button
            onClick={() => setAberto(!aberto)}
            className="text-[0.8rem] text-ambar hover:text-ouro underline-offset-4 hover:underline transition-colors font-medium"
          >
            {aberto ? '← fechar' : 'ler abertura completa →'}
          </button>
          {aberto && (
            <div className="mt-5 font-serif text-creme-2 text-[0.96rem] leading-[1.78] italic space-y-4 text-left">
              {texto.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {assinatura && (
                <p className="font-serif italic text-ambar/80 text-[0.88rem] mt-4">
                  {assinatura}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
