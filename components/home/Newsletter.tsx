'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Estado = 'idle' | 'pending' | 'ok' | 'jaEstas' | 'erro';

export function Newsletter() {
  const t = useTranslations('newsletter');
  const [estado, setEstado] = useState<Estado>('idle');
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setEstado('pending');
    try {
      const res = await fetch('/api/subscrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, origem: 'site' }),
      });
      if (res.status === 200) setEstado('ok');
      else if (res.status === 409) setEstado('jaEstas');
      else setEstado('erro');
    } catch {
      setEstado('erro');
    }
  }

  const mensagem =
    estado === 'ok' ? t('ok') : estado === 'jaEstas' ? t('jaEstas') : estado === 'erro' ? t('erro') : '';

  return (
    <section className="rv max-w-[540px] mx-auto text-center">
      <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ocre mb-[14px]">
        {t('eyebrow')}
      </p>
      <p className="font-serif italic font-light text-creme text-[clamp(1.05rem,3vw,1.22rem)] leading-[1.55] mb-7 max-w-[480px] mx-auto">
        {t('lead')}
      </p>
      {estado === 'ok' || estado === 'jaEstas' ? (
        <p className="text-ambar font-serif italic text-[1.1rem]">{mensagem}</p>
      ) : (
        <>
          <form
            onSubmit={submit}
            className="flex max-w-[420px] mx-auto max-[460px]:flex-col max-[460px]:gap-2.5"
          >
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t('placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={estado === 'pending'}
              className="flex-1 min-w-0 bg-transparent border border-ocre/45 rounded-l-[14px] py-3.5 px-4.5 text-creme font-sans text-base font-light border-r-0 outline-none placeholder:text-creme/40 placeholder:italic focus:border-ambar transition-colors max-[460px]:rounded-[14px] max-[460px]:border-r"
            />
            <button
              type="submit"
              disabled={estado === 'pending'}
              className="bg-ocre text-terra border border-ocre rounded-r-[14px] py-3.5 px-5 cursor-pointer font-sans text-[0.92rem] font-medium tracking-[0.04em] lowercase hover:bg-ambar transition-colors disabled:opacity-70 max-[460px]:rounded-[14px]"
            >
              {t('botao')}
            </button>
          </form>
          {estado === 'erro' && (
            <p className="text-rosa font-serif italic text-base mt-4">{mensagem}</p>
          )}
        </>
      )}
    </section>
  );
}
