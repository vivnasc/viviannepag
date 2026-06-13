'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Conta = { id: string; nome: string; emoji: string };
type Post = {
  id: string; caption: string; formato: string; data: string; permalink: string; thumbnail?: string;
  gostos: number; comentarios: number; alcance?: number; guardados?: number; partilhas?: number; views?: number; interacoes: number;
};
type FormatoResumo = { formato: string; n: number; mediaAlcance: number; mediaInteracoes: number };
type Resumo = { mediaAlcance: number; mediaInteracoes: number; taxaInteracao: number; porFormato: FormatoResumo[]; melhorFormato?: string };
type Analytics = {
  ok: boolean; username?: string; seguidores?: number; totalPosts?: number;
  insightsDisponiveis: boolean; posts: Post[]; resumo?: Resumo; erro?: string; detalhe?: string; avisoInsights?: string;
};

const nf = (n?: number) => (n == null ? '—' : new Intl.NumberFormat('pt-PT').format(n));
const FORMATO_PT: Record<string, string> = { REELS: 'Reels', CAROUSEL_ALBUM: 'Carrossel', VIDEO: 'Vídeo', IMAGE: 'Imagem', FEED: 'Imagem' };
const fmt = (f: string) => FORMATO_PT[f] ?? f;
const emojiFormato = (f: string) => (f === 'REELS' || f === 'VIDEO' ? '🎬' : f === 'CAROUSEL_ALBUM' ? '🖼️' : '📷');
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// "Caminho a seguir": lê os dados das 2 contas e devolve recomendações concretas.
function caminhoASeguir(a: Analytics | null, b: Analytics | null): string[] {
  const recs: string[] = [];
  const nome = (d: Analytics | null) => (d?.username ? `@${d.username}` : '—');

  // melhor formato de cada conta (Reels vs resto)
  for (const d of [a, b]) {
    if (!d?.ok || !d.resumo) continue;
    const reels = d.resumo.porFormato.find((f) => f.formato === 'REELS' && f.mediaAlcance > 0);
    const outros = d.resumo.porFormato.filter((f) => f.formato !== 'REELS' && f.mediaAlcance > 0);
    const mo = avg(outros.map((o) => o.mediaAlcance));
    if (reels && mo > 0 && reels.mediaAlcance > mo * 1.3) {
      recs.push(`${nome(d)}: os Reels alcançam ~${(reels.mediaAlcance / mo).toFixed(1)}× mais que os outros formatos — aposta mais em Reels.`);
    }
  }

  // quem engaja mais (taxa de interação)
  const ta = a?.resumo?.taxaInteracao, tb = b?.resumo?.taxaInteracao;
  if (ta != null && tb != null && Math.abs(ta - tb) >= 0.3) {
    const aMaior = ta > tb;
    recs.push(`${nome(aMaior ? a : b)} tem maior taxa de interação (${aMaior ? ta : tb}% vs ${aMaior ? tb : ta}%) — o conteúdo ressoa mais. Vê o que resulta aí e leva esse tom para ${nome(aMaior ? b : a)}.`);
  }

  // poucos posts → consistência
  for (const d of [a, b]) {
    if (d?.ok && (d.posts?.length ?? 0) > 0 && d.posts.length < 6) {
      recs.push(`${nome(d)} tem poucos posts recentes — a consistência ajuda o alcance. Mantém um ritmo regular.`);
    }
  }

  // melhor post como referência
  for (const d of [a, b]) {
    if (!d?.ok || !d.posts?.length) continue;
    const top = [...d.posts].sort((x, y) => (y.alcance ?? -1) - (x.alcance ?? -1))[0];
    if (top?.alcance && top.caption) {
      recs.push(`${nome(d)}: o que mais alcançou foi "${top.caption.slice(0, 60)}…" (${nf(top.alcance)} de alcance). Faz mais no mesmo registo.`);
    }
  }

  return recs.slice(0, 5);
}

export default function AnalyticsPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [dataA, setDataA] = useState<Analytics | null>(null);
  const [dataB, setDataB] = useState<Analytics | null>(null);
  const [loadA, setLoadA] = useState(false);
  const [loadB, setLoadB] = useState(false);

  useEffect(() => {
    fetch('/api/admin/instagram/insights')
      .then((r) => (r.ok ? r.json() : { contas: [] }))
      .then((j: { contas?: Conta[] }) => {
        const cs = j.contas ?? [];
        setContas(cs);
        if (cs[0]) setA(cs[0].id);
        if (cs[1]) setB(cs[1].id);
      })
      .catch(() => {});
  }, []);

  const carregar = useCallback(async (id: string, set: (d: Analytics | null) => void, setLoad: (b: boolean) => void) => {
    if (!id) { set(null); return; }
    setLoad(true); set(null);
    try {
      const r = await fetch(`/api/admin/instagram/insights?conta=${encodeURIComponent(id)}`);
      set(await r.json());
    } catch (e) { set({ ok: false, insightsDisponiveis: false, posts: [], erro: String(e) }); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { carregar(a, setDataA, setLoadA); }, [a, carregar]);
  useEffect(() => { carregar(b, setDataB, setLoadB); }, [b, carregar]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-stone-100">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-200">← Admin</Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">Analytics · Instagram</h1>
      <p className="mt-1 text-sm text-stone-400">As tuas contas lado a lado — o que funciona, e onde apostar.</p>

      {/* seletores */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Seletor label="Conta A" contas={contas} valor={a} onChange={setA} cor="rose" />
        <Seletor label="Conta B" contas={contas} valor={b} onChange={setB} cor="emerald" />
      </div>

      {/* comparação topo */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-700">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center bg-stone-900/60 text-xs text-stone-400">
          <div className="p-3">Métrica</div>
          <div className="p-3 text-center text-rose-300">{dataA?.username ? `@${dataA.username}` : '—'}</div>
          <div className="p-3 text-center text-emerald-300">{dataB?.username ? `@${dataB.username}` : '—'}</div>
        </div>
        <LinhaComp label="Seguidores" a={dataA?.seguidores} b={dataB?.seguidores} />
        <LinhaComp label="Média de alcance" a={dataA?.resumo?.mediaAlcance} b={dataB?.resumo?.mediaAlcance} />
        <LinhaComp label="Média de interações" a={dataA?.resumo?.mediaInteracoes} b={dataB?.resumo?.mediaInteracoes} />
        <LinhaComp label="Taxa de interação" a={dataA?.resumo?.taxaInteracao} b={dataB?.resumo?.taxaInteracao} sufixo="%" />
        <LinhaTexto label="Melhor formato" a={dataA?.resumo?.melhorFormato ? fmt(dataA.resumo.melhorFormato) : '—'} b={dataB?.resumo?.melhorFormato ? fmt(dataB.resumo.melhorFormato) : '—'} />
      </div>

      {/* caminho a seguir */}
      {(() => {
        const recs = caminhoASeguir(dataA, dataB);
        if (!recs.length) return null;
        return (
          <div className="mt-6 rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5">
            <div className="text-sm font-semibold text-amber-300">🧭 Caminho a seguir</div>
            <ul className="mt-3 space-y-2 text-sm text-stone-200">
              {recs.map((r, i) => <li key={i} className="flex gap-2"><span className="text-amber-400">→</span><span>{r}</span></li>)}
            </ul>
          </div>
        );
      })()}

      {/* colunas detalhadas */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Coluna data={dataA} carregando={loadA} cor="rose" />
        <Coluna data={dataB} carregando={loadB} cor="emerald" />
      </div>
    </main>
  );
}

function Seletor({ label, contas, valor, onChange, cor }: { label: string; contas: Conta[]; valor: string; onChange: (v: string) => void; cor: string }) {
  return (
    <div>
      <label className={`block text-xs ${cor === 'rose' ? 'text-rose-300' : 'text-emerald-300'}`}>{label}</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900">
        {contas.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
      </select>
    </div>
  );
}

function melhor(a?: number, b?: number): 'a' | 'b' | null {
  if (a == null || b == null) return null;
  if (a === b) return null;
  return a > b ? 'a' : 'b';
}
function LinhaComp({ label, a, b, sufixo = '' }: { label: string; a?: number; b?: number; sufixo?: string }) {
  const m = melhor(a, b);
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center border-t border-stone-800 text-sm">
      <div className="p-3 text-stone-400">{label}</div>
      <div className={`p-3 text-center ${m === 'a' ? 'font-semibold text-rose-300' : 'text-stone-200'}`}>{nf(a)}{a != null && sufixo}{m === 'a' && ' ↑'}</div>
      <div className={`p-3 text-center ${m === 'b' ? 'font-semibold text-emerald-300' : 'text-stone-200'}`}>{nf(b)}{b != null && sufixo}{m === 'b' && ' ↑'}</div>
    </div>
  );
}
function LinhaTexto({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_1fr] items-center border-t border-stone-800 text-sm">
      <div className="p-3 text-stone-400">{label}</div>
      <div className="p-3 text-center text-stone-200">{a}</div>
      <div className="p-3 text-center text-stone-200">{b}</div>
    </div>
  );
}

function Coluna({ data, carregando, cor }: { data: Analytics | null; carregando: boolean; cor: string }) {
  const acc = cor === 'rose' ? 'text-rose-300' : 'text-emerald-300';
  if (carregando) return <div className="rounded-2xl border border-stone-700 p-6 text-sm text-stone-400">A carregar…</div>;
  if (!data) return <div className="rounded-2xl border border-stone-800 p-6 text-sm text-stone-600">Escolhe uma conta.</div>;
  if (!data.ok) return <div className="rounded-2xl border border-amber-900 bg-amber-950/30 p-6 text-sm text-amber-300">Não deu para carregar: {data.detalhe ?? data.erro}</div>;

  const maxAlc = Math.max(1, ...(data.resumo?.porFormato ?? []).map((f) => f.mediaAlcance));
  const top = [...data.posts].sort((x, y) => (y.alcance ?? -1) - (x.alcance ?? -1)).slice(0, 4);

  return (
    <div className="rounded-2xl border border-stone-700 p-5">
      <div className={`text-lg font-semibold ${acc}`}>@{data.username}</div>
      <div className="text-xs text-stone-400">{nf(data.seguidores)} seguidores · {nf(data.totalPosts)} posts</div>

      {!data.insightsDisponiveis && (
        <div className="mt-3 rounded-lg bg-amber-950/40 p-3 text-xs text-amber-300">
          Só gostos/comentários — falta a permissão <code>instagram_manage_insights</code> nesta conta. Religa o token em <Link href="/admin/instagram" className="underline">instagram · ligar token</Link>.
        </div>
      )}

      {/* por formato */}
      <div className="mt-5">
        <div className="text-xs font-medium text-stone-300">O que funciona por formato</div>
        <div className="mt-2 space-y-2">
          {(data.resumo?.porFormato ?? []).map((f) => (
            <div key={f.formato} className="text-xs">
              <div className="flex justify-between text-stone-400">
                <span>{emojiFormato(f.formato)} {fmt(f.formato)} <span className="text-stone-600">({f.n})</span></span>
                <span className="text-stone-300">{nf(f.mediaAlcance)} alc. · {nf(f.mediaInteracoes)} int.</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-stone-800">
                <div className={`h-1.5 rounded-full ${cor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.round((f.mediaAlcance / maxAlc) * 100)}%` }} />
              </div>
            </div>
          ))}
          {(data.resumo?.porFormato?.length ?? 0) === 0 && <div className="text-xs text-stone-600">Sem dados.</div>}
        </div>
      </div>

      {/* melhores posts */}
      <div className="mt-5">
        <div className="text-xs font-medium text-stone-300">Melhores posts (por alcance)</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {top.map((p) => (
            <a key={p.id} href={p.permalink} target="_blank" rel="noreferrer" className="group rounded-lg border border-stone-800 p-2 hover:border-stone-600">
              {p.thumbnail ? (
                <img src={p.thumbnail} alt="" className="aspect-square w-full rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded bg-stone-800 text-2xl">{emojiFormato(p.formato)}</div>
              )}
              <div className="mt-1 line-clamp-2 text-[0.7rem] text-stone-400">{p.caption || '(sem legenda)'}</div>
              <div className="mt-1 text-[0.7rem] text-stone-300">👁 {nf(p.alcance)} · ❤ {nf(p.gostos)} · 🔖 {nf(p.guardados)}</div>
            </a>
          ))}
          {top.length === 0 && <div className="col-span-2 text-xs text-stone-600">Sem posts.</div>}
        </div>
      </div>
    </div>
  );
}
