'use client';

import { useCallback, useEffect, useState } from 'react';

type Variante = { name: string; url: string };
type RomanceItem = {
  slug: string;
  titulo: string;
  sub: string;
  estante: string;
  espelho: string;
  capitulos: number;
  palavras: number;
  variantes: Variante[];
  capaEscolhida: string | null;
  pdfPt: string | null;
  pdfEn: string | null;
};

export function RomancesCapas() {
  const [romances, setRomances] = useState<RomanceItem[] | null>(null);
  const [aGerar, setAGerar] = useState<string | null>(null);
  const [aEscolher, setAEscolher] = useState<string | null>(null);
  const [aRender, setARender] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch('/api/admin/romances');
    if (!res.ok) { setErro('Não consegui carregar os romances.'); return; }
    const json = await res.json();
    setRomances(json.romances);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function gerar(slug: string, estilo: string) {
    setErro(null);
    setAGerar(`${slug}:${estilo}`);
    try {
      const res = await fetch('/api/admin/romances/capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, estilo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setAGerar(null);
    }
  }

  async function apagar(slug: string, name: string) {
    setErro(null);
    setAEscolher(name);
    try {
      const res = await fetch('/api/admin/romances/capa-apagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setAEscolher(null);
    }
  }

  async function renderizar(slug: string) {
    setErro(null);
    setMsg(null);
    setARender(slug);
    try {
      const res = await fetch('/api/admin/romances/render-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      setMsg(
        slug === 'todos'
          ? 'Render de TODOS os romances disparado no GitHub Actions (≈30-45 min). Os PDFs aparecem aqui quando terminar.'
          : 'Render disparado no GitHub Actions (≈30-45 min). O PDF com esta capa aparece aqui quando terminar.',
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setARender(null);
    }
  }

  async function escolher(slug: string, url: string) {
    setErro(null);
    setAEscolher(url);
    try {
      const res = await fetch('/api/admin/romances/capa-escolher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setAEscolher(null);
    }
  }

  if (!romances) {
    return <p className="text-creme-2/60 italic font-serif">a carregar…</p>;
  }

  return (
    <div className="space-y-12">
      {erro && (
        <p className="text-rosa/90 text-[0.85rem] border border-rosa/30 rounded-[10px] px-4 py-3">{erro}</p>
      )}
      {msg && (
        <p className="text-salvia text-[0.85rem] border border-salvia/30 rounded-[10px] px-4 py-3">{msg}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border border-salvia/20 rounded-[12px] px-5 py-4">
        <p className="text-creme-2/70 text-[0.82rem] italic font-serif">
          Escolhe a capa de cada livro e depois renderiza aqui — o PDF é gerado no GitHub Actions e volta sozinho para os botões de download (não gasta deploy).
        </p>
        <button
          onClick={() => renderizar('todos')}
          disabled={aRender !== null}
          className="shrink-0 rounded-full bg-salvia/90 text-terra px-5 py-2 text-[0.82rem] font-semibold hover:bg-salvia transition-colors disabled:opacity-50"
        >
          {aRender === 'todos' ? 'a disparar…' : '📚 renderizar todos (com capa)'}
        </button>
      </div>

      {romances.map((r) => (
        <section key={r.slug} className="border border-ocre/15 rounded-[14px] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div className="min-w-0">
              <h3 className="font-serif text-creme text-[1.2rem]">{r.titulo}</h3>
              <p className="text-creme-2/70 text-[0.85rem] mt-1 italic font-serif">{r.sub}</p>
              <p className="text-creme-2/40 text-[0.72rem] mt-2">
                {r.slug} · {r.capitulos} capítulos · ~{r.palavras.toLocaleString('pt-PT')} palavras · espelho de «{r.espelho}»
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-2">
              {[
                ['vintage', 'vintage desgastado'],
                ['aguarela', 'aguarela literária'],
                ['atmosferica', 'pintura atmosférica'],
                ['gouache', 'gouache'],
              ].map(([estilo, nome]) => (
                <button
                  key={estilo}
                  onClick={() => gerar(r.slug, estilo)}
                  disabled={aGerar !== null}
                  className="rounded-full border border-ambar/50 text-ambar px-4 py-2 text-[0.78rem] hover:bg-ambar/10 transition-colors disabled:opacity-50"
                >
                  {aGerar === `${r.slug}:${estilo}` ? 'a pintar… (≈20s)' : `gerar capa · ${nome}`}
                </button>
              ))}
            </div>
          </div>

          {r.capaEscolhida && (
            <div className="mb-6">
              <p className="text-[0.7rem] tracking-[0.28em] uppercase text-salvia mb-2">capa escolhida</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.capaEscolhida} alt={`Capa escolhida de ${r.titulo}`} className="w-44 rounded-[10px] border border-salvia/40" />
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => renderizar(r.slug)}
                  disabled={aRender !== null}
                  className="rounded-full bg-ambar text-[#2A1F17] px-5 py-2 text-[0.82rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {aRender === r.slug ? 'a disparar…' : '📖 renderizar com esta capa'}
                </button>
                {r.pdfPt && (
                  <a href={r.pdfPt} className="rounded-full border border-salvia/50 text-salvia px-5 py-2 text-[0.82rem] hover:bg-salvia/10 transition-colors no-underline">
                    descarregar livro (pt)
                  </a>
                )}
                {r.pdfEn && (
                  <a href={r.pdfEn} className="rounded-full border border-salvia/50 text-salvia px-5 py-2 text-[0.82rem] hover:bg-salvia/10 transition-colors no-underline">
                    download book (en)
                  </a>
                )}
                {!r.pdfPt && !r.pdfEn && (
                  <p className="text-creme-2/50 text-[0.78rem] italic font-serif">
                    Os PDFs finais com esta capa chegam aqui depois do render (GitHub Actions · Render romance).
                  </p>
                )}
              </div>
            </div>
          )}

          {r.variantes.length === 0 ? (
            <p className="text-creme-2/50 text-[0.85rem] italic font-serif">
              Ainda não há variantes. Gera a primeira: a cena é a do livro (as mãos em concha com a casinha acesa sobre Véspera), no gouache da casa, sem texto.
            </p>
          ) : (
            <div>
              <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-3">variantes ({r.variantes.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {r.variantes.map((v) => (
                  <figure key={v.name} className="group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.url} alt={v.name} className="rounded-[10px] border border-ocre/20 group-hover:border-ambar/50 transition-colors" />
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => escolher(r.slug, v.url)}
                        disabled={aEscolher !== null}
                        className="flex-1 rounded-full border border-salvia/40 text-salvia px-3 py-1.5 text-[0.75rem] hover:bg-salvia/10 transition-colors disabled:opacity-50"
                      >
                        {aEscolher === v.url ? 'a fixar…' : 'usar esta'}
                      </button>
                      <button
                        onClick={() => apagar(r.slug, v.name)}
                        disabled={aEscolher !== null}
                        title="apagar esta variante"
                        className="rounded-full border border-rosa/30 text-rosa/70 px-3 py-1.5 text-[0.75rem] hover:bg-rosa/10 transition-colors disabled:opacity-50"
                      >
                        {aEscolher === v.name ? '…' : 'apagar'}
                      </button>
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
