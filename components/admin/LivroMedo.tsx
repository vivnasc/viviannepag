'use client';

import { useState } from 'react';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const BUCKET = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-medo`;

export function LivroMedo() {
  const [vers, setVers] = useState<Record<string, number>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [aCarregar, setACarregar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const chaveDe = (lg: 'pt' | 'en') => (lg === 'en' ? 'capa-propria-en' : 'capa-propria');
  const urlCapa = (lg: 'pt' | 'en') => {
    const chave = chaveDe(lg);
    return urls[chave] ?? `${BUCKET}/${chave}.png${vers[chave] ? `?v=${vers[chave]}` : ''}`;
  };

  async function carregarCapa(file: File, lang: 'pt' | 'en') {
    setErro(null);
    setAviso(null);
    setACarregar(lang);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('lang', lang);
      const res = await fetch('/api/admin/livro-medo/upload-capa', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      const chave = chaveDe(lang);
      if (json.url) setUrls((u) => ({ ...u, [chave]: json.url as string }));
      setVers((v) => ({ ...v, [chave]: Date.now() }));
      setAviso(lang === 'en' ? 'Capa inglesa carregada.' : 'Capa portuguesa carregada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setACarregar(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {erro && <p className="text-[0.85rem] text-rose-300 bg-rose-900/20 border border-rose-500/30 rounded-lg px-4 py-2">{erro}</p>}
      {aviso && <p className="text-[0.85rem] text-ambar bg-ambar/10 border border-ambar/30 rounded-lg px-4 py-2">{aviso}</p>}

      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Capas</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Carrega a capa que fizeste: uma para o livro português («As Sete Faces do Medo») e outra
          para o inglês («The Seven Faces of Fear»). Ficam guardadas e são usadas pela landing, pela
          loja e pelo render do PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(['pt', 'en'] as const).map((lg) => (
            <div key={lg} className="flex flex-col gap-3">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-[12px] border border-ocre/20 bg-[#100d09] grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlCapa(lg)}
                  alt={lg === 'en' ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              </div>
              <label className="inline-flex items-center justify-center gap-2 cursor-pointer bg-ambar text-terra font-sans text-[0.82rem] font-medium rounded-[12px] px-4 py-2.5 hover:bg-ocre transition-colors whitespace-nowrap">
                {aCarregar === lg ? 'a carregar…' : lg === 'en' ? 'capa · inglês' : 'capa · português'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) carregarCapa(f, lg);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
