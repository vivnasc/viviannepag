'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Conta = { id: string; nome: string; emoji: string };
type Post = {
  id: string; caption: string; tipo: string; formato: string; data: string; permalink: string;
  gostos: number; comentarios: number; alcance?: number; guardados?: number; partilhas?: number; views?: number; interacoes?: number;
};
type Analytics = {
  ok: boolean; username?: string; seguidores?: number; totalPosts?: number;
  insightsDisponiveis: boolean; posts: Post[]; erro?: string; detalhe?: string; avisoInsights?: string;
};

const nf = (n?: number) => (n == null ? '—' : new Intl.NumberFormat('pt-PT').format(n));
const dataCurta = (iso: string) => { try { return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }); } catch { return ''; } };

export default function AnalyticsPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [conta, setConta] = useState<string>('');
  const [data, setData] = useState<Analytics | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [ordenar, setOrdenar] = useState<'alcance' | 'interacoes' | 'data'>('data');

  useEffect(() => {
    fetch('/api/admin/instagram/insights')
      .then((r) => (r.ok ? r.json() : { contas: [] }))
      .then((j) => { setContas(j.contas ?? []); if (j.contas?.[0]) setConta(j.contas[0].id); })
      .catch(() => {});
  }, []);

  const carregar = useCallback(async (id: string) => {
    if (!id) return;
    setCarregando(true); setData(null);
    try {
      const r = await fetch(`/api/admin/instagram/insights?conta=${encodeURIComponent(id)}`);
      setData(await r.json());
    } catch (e) {
      setData({ ok: false, insightsDisponiveis: false, posts: [], erro: String(e) });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { if (conta) carregar(conta); }, [conta, carregar]);

  const posts = [...(data?.posts ?? [])].sort((a, b) => {
    if (ordenar === 'data') return (b.data || '').localeCompare(a.data || '');
    if (ordenar === 'alcance') return (b.alcance ?? -1) - (a.alcance ?? -1);
    return (b.interacoes ?? b.gostos + b.comentarios) - (a.interacoes ?? a.gostos + a.comentarios);
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-stone-100">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-200">← Admin</Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">Analytics · Instagram</h1>
      <p className="mt-1 text-sm text-stone-400">O que funciona em cada conta — alcance, guardados, partilhas, gostos.</p>

      {/* seletor de conta */}
      <div className="mt-6 flex flex-wrap gap-2">
        {contas.map((c) => (
          <button key={c.id} onClick={() => setConta(c.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${conta === c.id ? 'bg-rose-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}>
            {c.emoji} {c.nome}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="mt-8 text-sm text-stone-400">A carregar…</p>
      ) : !data ? null : !data.ok ? (
        <div className="mt-8 rounded-lg bg-amber-950/40 p-4 text-sm text-amber-300">
          Não deu para carregar: {data.detalhe ?? data.erro}
        </div>
      ) : (
        <>
          {/* resumo */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Cartao titulo="Conta" valor={data.username ? `@${data.username}` : '—'} />
            <Cartao titulo="Seguidores" valor={nf(data.seguidores)} />
            <Cartao titulo="Total de posts" valor={nf(data.totalPosts)} />
          </div>

          {!data.insightsDisponiveis && (
            <div className="mt-4 rounded-lg bg-amber-950/40 p-4 text-sm text-amber-300">
              Esta conta mostra gostos e comentários, mas as métricas mais fundas (alcance, guardados, partilhas) precisam da permissão <code>instagram_manage_insights</code>. Volta a gerar o token desta conta com essa permissão e liga-o em <Link href="/admin/instagram" className="underline">/admin/instagram</Link>.
              {data.avisoInsights ? <div className="mt-1 text-xs text-amber-400/70">({data.avisoInsights})</div> : null}
            </div>
          )}

          {/* posts */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-stone-300">Posts recentes</h2>
            <div className="flex gap-1 text-xs">
              {(['data', 'alcance', 'interacoes'] as const).map((o) => (
                <button key={o} onClick={() => setOrdenar(o)}
                  className={`rounded px-2 py-1 ${ordenar === o ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-stone-200'}`}>
                  {o === 'data' ? 'recentes' : o === 'alcance' ? 'mais alcance' : 'mais interação'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-stone-700">
            <table className="w-full text-sm">
              <thead className="bg-stone-900/60 text-left text-xs text-stone-400">
                <tr>
                  <th className="p-2 font-medium">Post</th>
                  <th className="p-2 font-medium">Data</th>
                  <th className="p-2 text-right font-medium">Alcance</th>
                  <th className="p-2 text-right font-medium">Gostos</th>
                  <th className="p-2 text-right font-medium">Coment.</th>
                  <th className="p-2 text-right font-medium">Guard.</th>
                  <th className="p-2 text-right font-medium">Part.</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t border-stone-800">
                    <td className="max-w-xs p-2">
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="text-stone-200 hover:text-rose-300">
                        <span className="text-stone-500">{p.formato === 'REELS' ? '🎬' : p.tipo === 'CAROUSEL_ALBUM' ? '🖼️' : '📷'} </span>
                        {p.caption || '(sem legenda)'}
                      </a>
                    </td>
                    <td className="whitespace-nowrap p-2 text-stone-400">{dataCurta(p.data)}</td>
                    <td className="p-2 text-right">{nf(p.alcance)}</td>
                    <td className="p-2 text-right">{nf(p.gostos)}</td>
                    <td className="p-2 text-right">{nf(p.comentarios)}</td>
                    <td className="p-2 text-right">{nf(p.guardados)}</td>
                    <td className="p-2 text-right">{nf(p.partilhas)}</td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-stone-500">Sem posts.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-stone-700 bg-stone-900/40 p-4">
      <div className="text-xs text-stone-400">{titulo}</div>
      <div className="mt-1 text-lg font-semibold text-white">{valor}</div>
    </div>
  );
}
