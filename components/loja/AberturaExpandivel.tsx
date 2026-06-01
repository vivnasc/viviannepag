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
        <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre/60 mb-3">
          {titulo}
        </p>
      )}
      {teaser && (
        <p className="font-serif text-creme text-[1.05rem] leading-[1.55] italic mb-3">
          {teaser}
        </p>
      )}
      {temFull && (
        <>
          <button
            onClick={() => setAberto(!aberto)}
            className="text-[0.74rem] text-ouro hover:text-ambar underline-offset-4 hover:underline transition-colors"
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
