'use client';

import { useCallback, useEffect, useState } from 'react';

type Variante = { name: string; url: string };
type Pilar = {
  slug: string;
  titulo: string;
  sub: string;
  selo: string;
  palavras: number;
  variantes: Variante[];
  capaEscolhida: string | null;
  capaComposta: string | null;
  pdf: string | null;
};

const ESTILOS: [string, string][] = [
  ['renascentista', 'renascentista do véu'],
  ['etereo', 'etéreo / luz'],
  ['dourado', 'dourado contemplativo'],
  ['simbolico', 'simbólico minimal'],
];

export function LivroPilarCapas() {
  const [livro, setLivro] = useState<Pilar | null>(null);
  const [aGerar, setAGerar] = useState<string | null>(null);
  const [aFixar, setAFixar] = useState<string | null>(null);
  const [aRender, setARender] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch('/api/admin/livro-pilar');
    if (!res.ok) { setErro('Não consegui carregar o livro.'); return; }
    setLivro(await res.json());
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function gerar(estilo: string) {
    setErro(null); setAGerar(estilo);
    try {
      const res = await fetch('/api/admin/livro-pilar/capa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estilo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally { setAGerar(null); }
  }

  async function escolher(url: string) {
    setErro(null); setAFixar(url);
    try {
      const res = await fetch('/api/admin/livro-pilar/capa-escolher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally { setAFixar(null); }
  }

  async function apagar(name: string) {
    setErro(null); setAFixar(name);
    try {
      const res = await fetch('/api/admin/livro-pilar/capa-apagar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally { setAFixar(null); }
  }

  async function renderizar() {
    setErro(null); setAviso(null); setARender(true);
    try {
      const res = await fetch('/api/admin/livro-pilar/render-dispatch', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      setAviso('Render disparado (GitHub Actions · Render livro-pilar, ≈3 min). O botão de descarregar aparece aqui quando terminar; recarrega a página.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally { setARender(false); }
  }

  if (!livro) return <p className="text-creme-2/60 italic font-serif">a carregar…</p>;

  return (
    <div className="space-y-8">
      {erro && <p className="text-rosa/90 text-[0.85rem] border border-rosa/30 rounded-[10px] px-4 py-3">{erro}</p>}
      {aviso && <p className="text-salvia text-[0.85rem] border border-salvia/30 rounded-[10px] px-4 py-3">{aviso}</p>}

      <section className="border border-ocre/15 rounded-[14px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="font-serif text-creme text-[1.2rem]">{livro.titulo}</h3>
            <p className="text-creme-2/70 text-[0.85rem] mt-1 italic font-serif">{livro.sub}</p>
            <p className="text-creme-2/40 text-[0.72rem] mt-2">
              {livro.selo} · ~{livro.palavras.toLocaleString('pt-PT')} palavras
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-2">
            {ESTILOS.map(([estilo, nome]) => (
              <button
                key={estilo}
                onClick={() => gerar(estilo)}
                disabled={aGerar !== null}
                className="rounded-full border border-ambar/50 text-ambar px-4 py-2 text-[0.78rem] hover:bg-ambar/10 transition-colors disabled:opacity-50"
              >
                {aGerar === estilo ? 'a pintar… (≈20s)' : `gerar capa · ${nome}`}
              </button>
            ))}
          </div>
        </div>

        {livro.capaEscolhida && (
          <div className="mb-6">
            <p className="text-[0.7rem] tracking-[0.28em] uppercase text-salvia mb-2">capa escolhida</p>
            <div className="flex flex-wrap items-end gap-5">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={livro.capaEscolhida} alt="Capa escolhida (sem texto)" className="w-40 rounded-[10px] border border-salvia/40" />
                <p className="text-creme-2/40 text-[0.68rem] mt-1.5 text-center">imagem (sem texto)</p>
              </div>
              {livro.capaComposta && (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={livro.capaComposta} alt="Capa composta (com tipografia)" className="w-40 rounded-[10px] border border-ambar/50" />
                  <p className="text-creme-2/40 text-[0.68rem] mt-1.5 text-center">capa final (com texto)</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={renderizar}
                disabled={aRender}
                className="rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-5 py-2 text-[0.82rem] hover:bg-ambar/20 transition-colors disabled:opacity-50"
              >
                {aRender ? 'a disparar…' : 'renderizar PDF (capa + miolo)'}
              </button>
              {livro.pdf && (
                <a href={livro.pdf} className="rounded-full border border-salvia/50 text-salvia px-5 py-2 text-[0.82rem] hover:bg-salvia/10 transition-colors no-underline">
                  descarregar PDF
                </a>
              )}
            </div>
          </div>
        )}

        {livro.variantes.length === 0 ? (
          <p className="text-creme-2/50 text-[0.85rem] italic font-serif">
            Ainda não há variantes. Gera a primeira: a cena é a do véu (uma figura serena por trás de véus translúcidos, luz dourada), sem texto. Depois escolhes a tua e a tipografia entra na composição.
          </p>
        ) : (
          <div>
            <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-3">variantes ({livro.variantes.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {livro.variantes.map((v) => (
                <figure key={v.name} className="group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.url} alt={v.name} className="rounded-[10px] border border-ocre/20 group-hover:border-ambar/50 transition-colors" />
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => escolher(v.url)}
                      disabled={aFixar !== null}
                      className="flex-1 rounded-full border border-salvia/40 text-salvia px-3 py-1.5 text-[0.75rem] hover:bg-salvia/10 transition-colors disabled:opacity-50"
                    >
                      {aFixar === v.url ? 'a fixar…' : 'usar esta'}
                    </button>
                    <button
                      onClick={() => apagar(v.name)}
                      disabled={aFixar !== null}
                      title="apagar esta variante"
                      className="rounded-full border border-rosa/30 text-rosa/70 px-3 py-1.5 text-[0.75rem] hover:bg-rosa/10 transition-colors disabled:opacity-50"
                    >
                      {aFixar === v.name ? '…' : 'apagar'}
                    </button>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
