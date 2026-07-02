'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PORTAS_LISTA } from '@/lib/portas/marca';

// AS 3 PORTAS · vista de desempenho lado a lado. Puxa os insights de Instagram de
// cada conta (por theme.marca / credenciais herdadas) para decidir a qual dar mais
// combustivel. O criterio e a verdade que ressoa, nao a metrica que infla.

type Post = { permalink?: string; thumbnail?: string; interacoes?: number; gostos?: number; comentarios?: number; caption?: string };
type Insights = {
  ok?: boolean; erro?: string; username?: string; seguidores?: number; totalPosts?: number;
  resumo?: { mediaInteracoes?: number; mediaAlcance?: number; taxaInteracao?: number };
  crescimento?: { novos30d?: number; alcanceDescobertaPct?: number };
  posts?: Post[];
};

const nfmt = (n?: number) => (n == null ? 'n/d' : new Intl.NumberFormat('en').format(n));

export default function DesempenhoPortas() {
  const [dados, setDados] = useState<Record<string, Insights | null>>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    Promise.all(PORTAS_LISTA.map((p) =>
      fetch(`/api/admin/instagram/insights?conta=${p.id}&limite=12`)
        .then((r) => (r.ok ? r.json() : { ok: false, erro: 'http' }))
        .catch(() => ({ ok: false, erro: 'rede' }))
        .then((j) => [p.id, j] as const)
    )).then((pares) => {
      if (!vivo) return;
      const m: Record<string, Insights | null> = {};
      for (const [id, j] of pares) m[id] = j;
      setDados(m); setCarregando(false);
    });
    return () => { vivo = false; };
  }, []);

  const taxa = (id: string) => dados[id]?.resumo?.taxaInteracao ?? -1;
  const lider = PORTAS_LISTA
    .map((p) => p.id)
    .filter((id) => dados[id]?.ok && taxa(id) >= 0)
    .sort((a, b) => taxa(b) - taxa(a))[0];

  return (
    <main className="min-h-screen px-4 py-8 md:px-8" style={{ background: '#0F0F10', color: '#EAE4D8', fontFamily: 'Georgia, serif' }}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] opacity-50">Vivianne dos Santos · as tres portas</p>
          <h1 className="text-2xl mt-1" style={{ color: '#C8A86B' }}>Desempenho lado a lado</h1>
          <p className="mt-2 text-[0.82rem] opacity-70 max-w-2xl">Para decidires a qual dar mais combustivel quando uma acelera. O criterio e a verdade que ressoa, nao a metrica que infla.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PORTAS_LISTA.map((p) => (
              <Link key={p.id} href={`/admin/portas/${p.id}`} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10">{p.emoji} {p.nome}</Link>
            ))}
          </div>
        </header>

        {carregando && <p className="text-[0.85rem] opacity-60">A carregar os insights das tres contas...</p>}

        <div className="grid gap-5 md:grid-cols-3">
          {PORTAS_LISTA.map((porta) => {
            const d = dados[porta.id];
            const dz = porta.paleta.destaque;
            const semCred = d && !d.ok;
            const topPost = (d?.posts ?? []).slice().sort((a, b) => (b.interacoes ?? 0) - (a.interacoes ?? 0))[0];
            return (
              <section key={porta.id} className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: lider === porta.id ? dz : 'rgba(255,255,255,0.12)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{porta.emoji}</span>
                  <h2 className="text-[1.02rem]" style={{ color: dz }}>{porta.nome}</h2>
                  {lider === porta.id && <span className="ml-auto text-[0.58rem] uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ borderColor: dz, color: dz }}>a acelerar</span>}
                </div>
                <p className="text-[0.66rem] opacity-45 mt-0.5">@{porta.handle}</p>

                {semCred ? (
                  <p className="mt-4 text-[0.76rem] opacity-70 leading-relaxed">
                    Sem dados ainda. {d?.erro === 'sem-credenciais' ? 'Liga o token desta conta em ' : 'Nao foi possivel ler os insights ('}
                    {d?.erro === 'sem-credenciais' ? <Link href={`/admin/instagram?conta=${porta.id}`} className="underline" style={{ color: dz }}>/admin/instagram</Link> : `${d?.erro})`}
                    {d?.erro === 'sem-credenciais' ? '.' : ''}
                  </p>
                ) : !d ? null : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Stat label="seguidores" valor={nfmt(d.seguidores)} dz={dz} />
                      <Stat label="novos 30d" valor={d.crescimento?.novos30d != null ? `+${nfmt(d.crescimento.novos30d)}` : 'n/d'} dz={dz} />
                      <Stat label="interacoes media" valor={nfmt(d.resumo?.mediaInteracoes)} dz={dz} />
                      <Stat label="taxa interacao" valor={d.resumo?.taxaInteracao != null ? `${d.resumo.taxaInteracao}%` : 'n/d'} dz={dz} />
                      <Stat label="alcance medio" valor={nfmt(d.resumo?.mediaAlcance)} dz={dz} />
                      <Stat label="descoberta" valor={d.crescimento?.alcanceDescobertaPct != null ? `${d.crescimento.alcanceDescobertaPct}%` : 'n/d'} dz={dz} />
                    </div>

                    {topPost && (
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <p className="text-[0.55rem] uppercase tracking-widest opacity-45 mb-2">post que mais ressoou</p>
                        <a href={topPost.permalink || '#'} target="_blank" rel="noreferrer" className="flex gap-3 group">
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/40">
                            {topPost.thumbnail ? <img src={topPost.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[0.72rem] leading-snug line-clamp-2 opacity-85">{topPost.caption?.slice(0, 90) || 'post'}</p>
                            <p className="text-[0.64rem] opacity-55 mt-0.5">{nfmt(topPost.interacoes)} interacoes · {nfmt(topPost.gostos)} gostos</p>
                          </div>
                        </a>
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>

        <p className="mt-6 text-[0.72rem] opacity-45 max-w-2xl">Os dados vêm dos insights de Instagram de cada conta (precisam do token ligado). Uma porta sem token ainda herda as credenciais da conta antiga; assim que publicar, os numeros aparecem aqui.</p>
      </div>
    </main>
  );
}

function Stat({ label, valor, dz }: { label: string; valor: string; dz: string }) {
  return (
    <div>
      <p className="text-[1.15rem] tabular-nums" style={{ color: dz }}>{valor}</p>
      <p className="text-[0.56rem] uppercase tracking-widest opacity-45">{label}</p>
    </div>
  );
}
