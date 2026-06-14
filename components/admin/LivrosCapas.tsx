'use client';

import { useCallback, useEffect, useState } from 'react';

type Variante = { name: string; url: string };
type Livro = {
  slug: string; marca: string; sub: string;
  variantes: Variante[]; capaEscolhida: string | null; capaComposta: string | null;
};

// Painel único das capas dos 4 livros (pilar + 3 manuais). Gera uma variante do
// símbolo de cada livro, escolhe a tua. A tipografia entra no render.
export function LivrosCapas() {
  const [livros, setLivros] = useState<Livro[] | null>(null);
  const [aGerar, setAGerar] = useState<string | null>(null);
  const [aFixar, setAFixar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch('/api/admin/livros');
    if (!res.ok) { setErro('Não consegui carregar as capas.'); return; }
    setLivros((await res.json()).livros);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function gerar(slug: string) {
    setErro(null); setAGerar(slug);
    try {
      const res = await fetch('/api/admin/livros/capa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setAGerar(null); }
  }
  async function escolher(slug: string, url: string) {
    setErro(null); setAFixar(url);
    try {
      const res = await fetch('/api/admin/livros/capa-escolher', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, url }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setAFixar(null); }
  }

  if (!livros) return <p className="text-creme-2/60 italic font-serif">a carregar…</p>;

  return (
    <div className="space-y-10">
      {erro && <p className="text-rosa/90 text-[0.85rem] border border-rosa/30 rounded-[10px] px-4 py-3">{erro}</p>}
      <p className="text-creme-2/60 text-[0.85rem] font-serif italic">
        Mesma família (índigo + ouro, sem pessoas, um símbolo). Gera a capa de cada livro, escolhe a tua. A tipografia entra no render.
      </p>
      {livros.map((l) => (
        <section key={l.slug} className="border border-ocre/15 rounded-[14px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="font-serif text-creme text-[1.15rem]">{l.marca}</h3>
              <p className="text-creme-2/60 text-[0.8rem] italic font-serif">{l.sub}</p>
            </div>
            <button onClick={() => gerar(l.slug)} disabled={aGerar !== null}
              className="rounded-full border border-ambar/50 text-ambar px-4 py-2 text-[0.78rem] hover:bg-ambar/10 transition-colors disabled:opacity-50">
              {aGerar === l.slug ? 'a pintar… (≈20s)' : 'gerar capa'}
            </button>
          </div>

          {(l.capaEscolhida || l.capaComposta) && (
            <div className="flex flex-wrap items-end gap-4 mb-5">
              {l.capaEscolhida && (
                <div>{/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.capaEscolhida} alt="escolhida" className="w-32 rounded-[10px] border border-salvia/40" />
                  <p className="text-creme-2/40 text-[0.66rem] mt-1 text-center">imagem escolhida</p></div>
              )}
              {l.capaComposta && (
                <div>{/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.capaComposta} alt="composta" className="w-32 rounded-[10px] border border-ambar/50" />
                  <p className="text-creme-2/40 text-[0.66rem] mt-1 text-center">capa final</p></div>
              )}
            </div>
          )}

          {l.variantes.length === 0 ? (
            <p className="text-creme-2/45 text-[0.82rem] italic font-serif">Sem variantes. Gera a primeira (o símbolo de {l.marca}, sem texto).</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {l.variantes.map((v) => (
                <figure key={v.name}>{/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.url} alt={v.name} className="rounded-[10px] border border-ocre/20" />
                  <button onClick={() => escolher(l.slug, v.url)} disabled={aFixar !== null}
                    className="w-full mt-1.5 rounded-full border border-salvia/40 text-salvia px-3 py-1.5 text-[0.72rem] hover:bg-salvia/10 transition-colors disabled:opacity-50">
                    {aFixar === v.url ? 'a fixar…' : 'usar esta'}
                  </button>
                </figure>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
