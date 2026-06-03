'use client';

import { useState } from 'react';
import { useCart, precoNum } from '@/lib/cart';

// 'Monta o teu pack': a pessoa escolhe os livros que quer (de um ou varios
// universos) e leva-os em pack. Regra simples e igual aos packs nomeados:
// cada livro custa PRECO_LIVRO, com um minimo de MIN livros e um teto (nunca
// paga mais do que a biblioteca completa).
const PRECO_LIVRO = 2.5;
const MIN = 3;
const TETO = 99;

type Livro = { slug: string; titulo: string; preco: string; capa: string | null; badge: string | null };
type Universo = { id: string; nome: string; livros: Livro[] };

function hashSlugs(slugs: string[]): string {
  const base = [...slugs].sort().join('|');
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function MontaPack({ universos, isPt }: { universos: Universo[]; isPt: boolean }) {
  const { add, abrir } = useCart();
  const [sel, setSel] = useState<Record<string, Livro>>({});
  const [aberto, setAberto] = useState(false);

  const escolhidos = Object.values(sel);
  const n = escolhidos.length;
  const avulso = escolhidos.reduce((s, l) => s + precoNum(l.preco), 0);
  const preco = Math.min(TETO, n * PRECO_LIVRO);
  const poupa = Math.max(0, avulso - preco);
  const podeAdicionar = n >= MIN;

  function toggle(l: Livro) {
    setSel((prev) => {
      const next = { ...prev };
      if (next[l.slug]) delete next[l.slug];
      else next[l.slug] = l;
      return next;
    });
  }

  function adicionar() {
    if (!podeAdicionar) return;
    const slugs = escolhidos.map((l) => l.slug);
    add({
      slug: `pack-feito-${hashSlugs(slugs)}`,
      titulo: isPt ? `O teu pack · ${n} livros` : `Your pack · ${n} books`,
      preco: `€${preco.toFixed(preco % 1 === 0 ? 0 : 2)}`,
      capa: escolhidos[0]?.capa ?? null,
      badge: 'pack',
      incluidos: escolhidos.map((l) => ({ slug: l.slug, titulo: l.titulo })),
    });
    setSel({});
    setAberto(false);
    abrir();
  }

  return (
    <section className="mb-16">
      <div className="rounded-[20px] border border-ouro/35 bg-ouro/[0.06] overflow-hidden">
        <button
          onClick={() => setAberto((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-ouro/[0.04] transition-colors"
        >
          <div>
            <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ouro mb-1">{isPt ? 'à tua medida' : 'made to measure'}</p>
            <h2 className="font-serif font-light text-creme text-[1.5rem] leading-tight">{isPt ? 'Monta o teu pack' : 'Build your own pack'}</h2>
            <p className="text-creme-2/75 text-[0.9rem] mt-1 max-w-[560px]">
              {isPt
                ? 'Escolhe só os temas que te interessam. Cada livro €2,5 em pack (mínimo 3).'
                : 'Pick only the topics you want. Each book €2.5 in a pack (minimum 3).'}
            </p>
          </div>
          <span className={`text-ouro text-2xl shrink-0 transition-transform ${aberto ? 'rotate-45' : ''}`}>+</span>
        </button>

        {aberto && (
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-6 max-h-[420px] overflow-y-auto pr-1">
              {universos.map((u) => (
                <div key={u.id}>
                  <p className="text-ocre text-[0.72rem] tracking-[0.16em] uppercase mb-2">{u.nome}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {u.livros.map((l) => {
                      const on = Boolean(sel[l.slug]);
                      return (
                        <button
                          key={l.slug}
                          onClick={() => toggle(l)}
                          className={`flex items-center gap-3 text-left rounded-[10px] px-3 py-2.5 border transition-colors ${on ? 'border-ambar bg-ambar/15' : 'border-ocre/20 bg-terra-2/40 hover:border-ocre/45'}`}
                        >
                          <span className={`w-4 h-4 rounded-[5px] border shrink-0 flex items-center justify-center text-[0.7rem] ${on ? 'bg-ambar border-ambar text-terra' : 'border-ocre/50'}`}>{on ? '✓' : ''}</span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-creme text-[0.85rem] leading-tight truncate">{l.titulo}</span>
                            <span className="block text-creme-2/55 text-[0.72rem]">{l.badge ?? ''} · {l.preco}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-ouro/25 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-creme text-[0.95rem]">
                  {n > 0
                    ? (isPt ? `${n} ${n === 1 ? 'livro' : 'livros'} · ` : `${n} ${n === 1 ? 'book' : 'books'} · `)
                    : (isPt ? 'Nenhum escolhido ainda. ' : 'Nothing selected yet. ')}
                  {n > 0 && <span className="text-ambar font-serif text-[1.15rem]">€{preco.toFixed(preco % 1 === 0 ? 0 : 2)}</span>}
                  {poupa > 0 && <span className="text-ouro text-[0.78rem] ml-2">{isPt ? `poupas €${poupa.toFixed(0)}` : `save €${poupa.toFixed(0)}`}</span>}
                </p>
                {!podeAdicionar && (
                  <p className="text-creme-2/55 text-[0.78rem] mt-0.5">{isPt ? `Escolhe pelo menos ${MIN} para formar um pack.` : `Pick at least ${MIN} to form a pack.`}</p>
                )}
              </div>
              <button
                onClick={adicionar}
                disabled={!podeAdicionar}
                className={`font-sans text-[0.9rem] font-semibold rounded-[12px] px-6 py-3 transition-colors ${podeAdicionar ? 'bg-ambar text-terra hover:bg-ocre' : 'bg-terra-2/60 text-creme-2/40 cursor-not-allowed'}`}
              >
                {isPt ? 'Adicionar ao carrinho' : 'Add to cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
