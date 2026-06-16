'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Conta = { id: string; nome: string; emoji: string };
type Post = {
  id: string; caption: string; formato: string; data: string; permalink: string; thumbnail?: string;
  gostos: number; comentarios: number; alcance?: number; guardados?: number; partilhas?: number; views?: number; interacoes: number;
};
type FormatoResumo = { formato: string; n: number; mediaAlcance: number; mediaInteracoes: number };
type Resumo = { mediaAlcance: number; mediaInteracoes: number; taxaInteracao: number; porFormato: FormatoResumo[]; melhorFormato?: string };
type Crescimento = { novos30d?: number; porSemana?: number; alcanceDescobertaPct?: number; alcance30d?: number; visualizacoes30d?: number; alcanceVarPct?: number };
type Analytics = {
  ok: boolean; username?: string; seguidores?: number; totalPosts?: number;
  insightsDisponiveis: boolean; posts: Post[]; resumo?: Resumo; crescimento?: Crescimento; erro?: string; detalhe?: string; avisoInsights?: string;
  consistenteDesde?: string | null;
};

const nf = (n?: number) => (n == null ? '—' : new Intl.NumberFormat('pt-PT').format(n));
const FORMATO_PT: Record<string, string> = { REELS: 'Reels', CAROUSEL_ALBUM: 'Carrossel', VIDEO: 'Vídeo', IMAGE: 'Imagem', FEED: 'Imagem' };
const fmt = (f: string) => FORMATO_PT[f] ?? f;
const emojiFormato = (f: string) => (f === 'REELS' || f === 'VIDEO' ? '🎬' : f === 'CAROUSEL_ALBUM' ? '🖼️' : '📷');
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function diasDesde(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso); if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}
function idadeLabel(iso?: string | null): string {
  const dias = diasDesde(iso);
  if (dias == null) return '—';
  if (dias < 14) return `há ${dias} dia${dias === 1 ? '' : 's'}`;
  return `há ${Math.round(dias / 7)} sem.`;
}
const NOVA_DIAS = 14; // abaixo disto, conta "nova" — cedo para comparar

const ACCENTS = [
  { text: 'text-rose-300', bar: 'bg-rose-500' },
  { text: 'text-emerald-300', bar: 'bg-emerald-500' },
  { text: 'text-amber-300', bar: 'bg-amber-500' },
  { text: 'text-sky-300', bar: 'bg-sky-500' },
  { text: 'text-violet-300', bar: 'bg-violet-500' },
  { text: 'text-pink-300', bar: 'bg-pink-500' },
];

// recomendações globais, considerando a IDADE (contas novas não entram nos superlativos)
function caminhoASeguir(contas: Conta[], dados: Record<string, Analytics>): string[] {
  const todas = contas.map((c) => ({ c, d: dados[c.id] })).filter((x) => x.d?.ok && x.d.resumo);
  if (todas.length === 0) return [];
  const nome = (c: Conta) => `@${dados[c.id]?.username ?? c.nome}`;
  const ehNova = (id: string) => { const dd = diasDesde(dados[id]?.consistenteDesde); return dd != null && dd < NOVA_DIAS; };
  const maduras = todas.filter((x) => !ehNova(x.c.id));
  const base = maduras.length ? maduras : todas; // se nenhuma "madura", usa todas
  const recs: string[] = [];

  const porTaxa = [...base].sort((a, b) => b.d.resumo!.taxaInteracao - a.d.resumo!.taxaInteracao);
  if (porTaxa[0]?.d.resumo!.taxaInteracao > 0) recs.push(`${nome(porTaxa[0].c)} é a que mais engaja (${porTaxa[0].d.resumo!.taxaInteracao}% de interação) — vê o que resulta aí e leva esse tom para as outras.`);

  const porAlc = [...base].sort((a, b) => b.d.resumo!.mediaAlcance - a.d.resumo!.mediaAlcance);
  if (porAlc[0]?.d.resumo!.mediaAlcance > 0) recs.push(`${nome(porAlc[0].c)} tem o maior alcance médio (${nf(porAlc[0].d.resumo!.mediaAlcance)}).`);

  const porNovos = [...base].sort((a, b) => (b.d.crescimento?.novos30d ?? 0) - (a.d.crescimento?.novos30d ?? 0));
  if ((porNovos[0]?.d.crescimento?.novos30d ?? 0) > 0) recs.push(`${nome(porNovos[0].c)} é a que mais cresce (+${nf(porNovos[0].d.crescimento!.novos30d!)} seguidores em 30 dias).`);

  const porDesc = [...base].filter((x) => x.d.crescimento?.alcanceDescobertaPct != null).sort((a, b) => (b.d.crescimento!.alcanceDescobertaPct!) - (a.d.crescimento!.alcanceDescobertaPct!));
  if (porDesc[0]) recs.push(`${nome(porDesc[0].c)} chega a ${porDesc[0].d.crescimento!.alcanceDescobertaPct}% de não-seguidores (descoberta) — é o teu maior motor de gente nova; vê o que lá resulta e repete.`);

  const todosPosts = base.flatMap((x) => x.d.posts);
  const reels = todosPosts.filter((p) => p.formato === 'REELS' && p.alcance != null);
  const outros = todosPosts.filter((p) => p.formato !== 'REELS' && p.alcance != null);
  const mr = avg(reels.map((p) => p.alcance as number)); const mo = avg(outros.map((p) => p.alcance as number));
  if (mr > 0 && mo > 0 && mr > mo * 1.3) recs.push(`No geral, os Reels alcançam ~${(mr / mo).toFixed(1)}× mais que os outros formatos — aposta em Reels.`);

  const novas = todas.filter((x) => ehNova(x.c.id)).map((x) => `${nome(x.c)} (${idadeLabel(dados[x.c.id]?.consistenteDesde)})`);
  if (novas.length) recs.push(`${novas.join(', ')} ${novas.length === 1 ? 'é recente' : 'são recentes'} — ainda é cedo para comparar com as antigas. Dá-lhes tempo e consistência; mede daqui a umas semanas.`);

  return recs.slice(0, 6);
}

export default function AnalyticsPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [dados, setDados] = useState<Record<string, Analytics>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/admin/instagram/insights')
      .then((r) => (r.ok ? r.json() : { contas: [] }))
      .then((j: { contas?: Conta[] }) => {
        const cs = j.contas ?? [];
        setContas(cs);
        for (const c of cs) {
          setLoading((l) => ({ ...l, [c.id]: true }));
          fetch(`/api/admin/instagram/insights?conta=${encodeURIComponent(c.id)}&limite=10`)
            .then((r) => r.json())
            .then((d: Analytics) => setDados((prev) => ({ ...prev, [c.id]: d })))
            .catch(() => setDados((prev) => ({ ...prev, [c.id]: { ok: false, insightsDisponiveis: false, posts: [], erro: 'falhou' } })))
            .finally(() => setLoading((l) => ({ ...l, [c.id]: false })));
        }
      })
      .catch(() => {});
  }, []);

  async function salvarMarco(id: string, valor: string) {
    setDados((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { ok: false, insightsDisponiveis: false, posts: [] }), consistenteDesde: valor || null } }));
    try {
      await fetch('/api/admin/instagram/marco', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: id, consistenteDesde: valor || undefined }) });
    } catch { /* ignora */ }
  }

  const oks = contas.filter((c) => dados[c.id]?.ok);
  const maxSeg = Math.max(0, ...oks.map((c) => dados[c.id]?.seguidores ?? 0));
  const maxAlc = Math.max(0, ...oks.map((c) => dados[c.id]?.resumo?.mediaAlcance ?? 0));
  const maxTaxa = Math.max(0, ...oks.map((c) => dados[c.id]?.resumo?.taxaInteracao ?? 0));
  const maxNovos = Math.max(0, ...oks.map((c) => dados[c.id]?.crescimento?.novos30d ?? 0));
  const recs = caminhoASeguir(contas, dados);
  // conta principal (mais seguidores) — para o destaque do topo
  const principal = oks.map((c) => dados[c.id]).sort((a, b) => (b.seguidores ?? 0) - (a.seguidores ?? 0))[0];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-stone-100">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-200">← Admin</Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">Analytics · Instagram</h1>
      <p className="mt-1 text-sm text-stone-400">Todas as contas de uma vez — com a idade de cada uma em conta, para comparar com justiça.</p>

      {/* destaque da conta principal (últimos 30 dias) */}
      {principal?.crescimento && (
        <div className="mt-6 rounded-2xl border border-stone-700 bg-stone-900/40 p-5">
          <div className="text-xs text-stone-400">@{principal.username} · últimos 30 dias</div>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Hero big={nf(principal.crescimento.alcance30d)} label="Contas alcançadas"
              extra={principal.crescimento.alcanceVarPct != null ? `${principal.crescimento.alcanceVarPct >= 0 ? '▲' : '▼'} ${Math.abs(principal.crescimento.alcanceVarPct)}%` : undefined}
              up={(principal.crescimento.alcanceVarPct ?? 0) >= 0} />
            <Hero big={nf(principal.crescimento.visualizacoes30d)} label="Visualizações" />
            <Hero big={principal.crescimento.novos30d != null ? `+${nf(principal.crescimento.novos30d)}` : '—'} label="Novos seguidores" />
            <Hero big={principal.crescimento.alcanceDescobertaPct != null ? `${principal.crescimento.alcanceDescobertaPct}%` : '—'} label="A não-seguidores" />
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-700">
        <table className="w-full text-sm">
          <thead className="bg-stone-900/60 text-left text-xs text-stone-400">
            <tr>
              <th className="p-3 font-medium">Conta</th>
              <th className="p-3 text-right font-medium">Seguidores</th>
              <th className="p-3 text-right font-medium">Novos (30d)</th>
              <th className="p-3 text-right font-medium">Média alcance</th>
              <th className="p-3 text-right font-medium">Taxa interação</th>
              <th className="p-3 text-right font-medium">Descoberta</th>
              <th className="p-3 font-medium">Melhor formato</th>
              <th className="p-3 font-medium">Consistente desde</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c) => {
              const d = dados[c.id];
              const carregando = loading[c.id] && !d;
              const dataInput = (
                <input type="date" value={(d?.consistenteDesde ?? '').slice(0, 10)} onChange={(e) => salvarMarco(c.id, e.target.value)}
                  className="rounded border border-stone-600 bg-stone-900 px-1.5 py-0.5 text-xs text-stone-200" />
              );
              return (
                <tr key={c.id} className="border-t border-stone-800">
                  <td className="p-3 whitespace-nowrap">{c.emoji} {d?.ok && d.username ? `@${d.username}` : c.nome}</td>
                  {carregando ? (
                    <td colSpan={7} className="p-3 text-stone-500">a carregar…</td>
                  ) : !d?.ok ? (
                    <td colSpan={7} className="p-3 text-stone-500">{d?.erro === 'sem-credenciais' ? 'não ligado — liga o token' : `sem dados${d?.detalhe ? ' · ' + d.detalhe : d?.erro ? ' · ' + d.erro : ''}`}</td>
                  ) : (
                    <>
                      <td className={`p-3 text-right ${(d.seguidores ?? 0) === maxSeg && maxSeg > 0 ? 'font-semibold text-amber-300' : 'text-stone-200'}`}>{nf(d.seguidores)}</td>
                      <td className={`p-3 text-right ${(d.crescimento?.novos30d ?? 0) === maxNovos && maxNovos > 0 ? 'font-semibold text-amber-300' : 'text-stone-200'}`}>{d.crescimento?.novos30d != null ? `+${nf(d.crescimento.novos30d)}` : '—'}</td>
                      <td className={`p-3 text-right ${(d.resumo?.mediaAlcance ?? 0) === maxAlc && maxAlc > 0 ? 'font-semibold text-amber-300' : 'text-stone-200'}`}>{nf(d.resumo?.mediaAlcance)}</td>
                      <td className={`p-3 text-right ${(d.resumo?.taxaInteracao ?? 0) === maxTaxa && maxTaxa > 0 ? 'font-semibold text-amber-300' : 'text-stone-200'}`}>{d.resumo?.taxaInteracao ?? 0}%</td>
                      <td className="p-3 text-right text-stone-200">{d.crescimento?.alcanceDescobertaPct != null ? `${d.crescimento.alcanceDescobertaPct}%` : '—'}</td>
                      <td className="p-3 text-stone-300">{d.resumo?.melhorFormato ? `${emojiFormato(d.resumo.melhorFormato)} ${fmt(d.resumo.melhorFormato)}` : '—'}</td>
                      <td className="p-3 whitespace-nowrap">{dataInput} <span className="ml-1 text-xs text-stone-400">{d.consistenteDesde ? idadeLabel(d.consistenteDesde) : ''}</span></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-stone-500">Define o <b>&quot;consistente desde&quot;</b> de cada conta (a data em que começaste a publicar a sério). O Instagram não dá a data de criação, mas com isto o painel compara com justiça.</p>

      {recs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5">
          <div className="text-sm font-semibold text-amber-300">🧭 Caminho a seguir</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-200">
            {recs.map((r, i) => <li key={i} className="flex gap-2"><span className="text-amber-400">→</span><span>{r}</span></li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {contas.filter((c) => dados[c.id]?.ok).map((c, i) => (
          <Coluna key={c.id} data={dados[c.id]} accent={ACCENTS[i % ACCENTS.length]} />
        ))}
      </div>
    </main>
  );
}

function Hero({ big, label, extra, up }: { big: string; label: string; extra?: string; up?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{big}</span>
        {extra && <span className={`text-xs font-medium ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{extra}</span>}
      </div>
      <div className="text-xs text-stone-400">{label}</div>
    </div>
  );
}

function Coluna({ data, accent }: { data: Analytics; accent: { text: string; bar: string } }) {
  const maxAlc = Math.max(1, ...(data.resumo?.porFormato ?? []).map((f) => f.mediaAlcance));
  const top = [...data.posts].sort((x, y) => (y.alcance ?? -1) - (x.alcance ?? -1)).slice(0, 4);
  const nova = (() => { const dd = diasDesde(data.consistenteDesde); return dd != null && dd < NOVA_DIAS; })();
  return (
    <div className="rounded-2xl border border-stone-700 p-5">
      <div className="flex items-center gap-2">
        <div className={`text-lg font-semibold ${accent.text}`}>@{data.username}</div>
        {data.consistenteDesde && <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${nova ? 'bg-amber-900/40 text-amber-300' : 'bg-stone-800 text-stone-400'}`}>consistente {idadeLabel(data.consistenteDesde)}{nova ? ' · nova' : ''}</span>}
      </div>
      <div className="text-xs text-stone-400">{nf(data.seguidores)} seguidores · {nf(data.totalPosts)} posts · {data.resumo?.taxaInteracao ?? 0}% interação</div>
      {data.crescimento && (data.crescimento.alcance30d != null || data.crescimento.visualizacoes30d != null) && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {data.crescimento.alcance30d != null && <span className="rounded-lg bg-stone-800/60 px-2 py-1 text-stone-200">🌍 {nf(data.crescimento.alcance30d)} alcançadas (30d){data.crescimento.alcanceVarPct != null ? ` · ${data.crescimento.alcanceVarPct >= 0 ? '▲' : '▼'}${Math.abs(data.crescimento.alcanceVarPct)}%` : ''}</span>}
          {data.crescimento.visualizacoes30d != null && <span className="rounded-lg bg-stone-800/60 px-2 py-1 text-stone-200">👁 {nf(data.crescimento.visualizacoes30d)} visualizações</span>}
        </div>
      )}
      {data.crescimento && (data.crescimento.novos30d != null || data.crescimento.alcanceDescobertaPct != null) && (
        <div className="mt-1 text-xs text-stone-300">
          {data.crescimento.novos30d != null && <span>📈 +{nf(data.crescimento.novos30d)} seg. (30d){data.crescimento.porSemana != null ? ` · ~${nf(data.crescimento.porSemana)}/sem` : ''}</span>}
          {data.crescimento.alcanceDescobertaPct != null && <span className="ml-2">🧲 {data.crescimento.alcanceDescobertaPct}% a não-seguidores</span>}
        </div>
      )}

      {!data.insightsDisponiveis && (
        <div className="mt-3 rounded-lg bg-amber-950/40 p-3 text-xs text-amber-300">
          Só gostos/comentários — falta a permissão <code>instagram_manage_insights</code>. Religa o token em <Link href="/admin/instagram" className="underline">instagram · ligar token</Link>.
        </div>
      )}

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
                <div className={`h-1.5 rounded-full ${accent.bar}`} style={{ width: `${Math.round((f.mediaAlcance / maxAlc) * 100)}%` }} />
              </div>
            </div>
          ))}
          {(data.resumo?.porFormato?.length ?? 0) === 0 && <div className="text-xs text-stone-600">Sem dados.</div>}
        </div>
      </div>

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
