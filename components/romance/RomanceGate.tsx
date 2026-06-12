'use client';

import { useState } from 'react';

export function RomanceGate({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [estado, setEstado] = useState<'inicio' | 'aenviar' | 'pronto' | 'erro'>('inicio');
  const [links, setLinks] = useState<{ pt: string; en: string } | null>(null);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setEstado('aenviar');
    try {
      const res = await fetch('/api/romance-gratis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, website }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || 'erro');
      setLinks({ pt: json.pt, en: json.en });
      setEstado('pronto');
    } catch {
      setEstado('erro');
    }
  }

  if (estado === 'pronto' && links) {
    return (
      <div className="text-center">
        <p className="font-serif italic text-creme text-lg mb-6">
          {isEn ? 'It is yours. Both editions:' : 'É teu. As duas edições:'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={links.pt}
            className="rounded-full bg-ambar text-[#2A1C12] px-7 py-3 text-[0.9rem] font-medium no-underline hover:opacity-90 transition-opacity"
          >
            {isEn ? 'Download (Portuguese)' : 'Descarregar o livro (pt)'}
          </a>
          <a
            href={links.en}
            className="rounded-full border border-ambar/60 text-ambar px-7 py-3 text-[0.9rem] no-underline hover:bg-ambar/10 transition-colors"
          >
            {isEn ? 'Download (English)' : 'Download (English)'}
          </a>
        </div>
        <p className="text-creme-2/50 text-[0.8rem] mt-5 italic font-serif">
          {isEn ? 'The links are also in your inbox.' : 'Os links também seguiram para o teu email.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submeter} className="max-w-[420px] mx-auto text-center">
      <p className="font-serif text-creme text-xl mb-2">
        {isEn ? 'Want the whole novel?' : 'Queres o romance inteiro?'}
      </p>
      <p className="text-creme-2/70 text-[0.9rem] mb-6 font-serif italic">
        {isEn
          ? 'It is a gift from the house. Leave your email and take both editions (pt & en) with you.'
          : 'É oferta da casa. Deixa o teu email e leva as duas edições (pt e en) contigo.'}
      </p>
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isEn ? 'your email' : 'o teu email'}
          className="flex-1 rounded-full bg-transparent border border-ocre/40 px-5 py-3 text-creme text-[0.9rem] placeholder:text-creme-2/40 focus:border-ambar outline-none"
        />
        <button
          type="submit"
          disabled={estado === 'aenviar'}
          className="rounded-full bg-ambar text-[#2A1C12] px-6 py-3 text-[0.9rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {estado === 'aenviar' ? (isEn ? 'sending…' : 'a enviar…') : (isEn ? 'I want it' : 'quero')}
        </button>
      </div>
      {estado === 'erro' && (
        <p className="text-rosa/90 text-[0.8rem] mt-3">
          {isEn ? 'Something went wrong. Try again?' : 'Algo correu mal. Tentas outra vez?'}
        </p>
      )}
      <p className="text-creme-2/40 text-[0.72rem] mt-4">
        {isEn
          ? 'No noise: I only write when there is something true to say.'
          : 'Sem barulho: só escrevo quando há algo verdadeiro para dizer.'}
      </p>
    </form>
  );
}
