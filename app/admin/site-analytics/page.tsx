'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Item = { k: string; n: number };
type Dados = {
  ok?: boolean; erro?: string; sql?: string; detalhe?: string;
  dias?: number; total?: number; hoje?: number;
  serie?: { dia: string; n: number }[];
  fontes?: Item[]; paginas?: Item[];
};

const nf = (n?: number) => (n == null ? '—' : new Intl.NumberFormat('pt-PT').format(n));
const emojiFonte = (f: string) => ({ Instagram: '📸', TikTok: '🎬', Google: '🔍', Facebook: '📘', Direto: '🔗', Interno: '↪️', YouTube: '▶️', Linktree: '🌳', WhatsApp: '💬', X: '✖️' } as Record<string, string>)[f] ?? '🌐';

export default function SiteAnalyticsPage() {
  const [dias, setDias] = useState(30);
  const [d, setD] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [limpando, setLimpando] = useState(false);

  function carregar() {
    setCarregando(true);
    fetch(`/api/admin/site-analytics?dias=${dias}`)
      .then((r) => r.json())
      .then((j) => setD(j))
      .catch((e) => setD({ erro: String(e) }))
      .finally(() => setCarregando(false));
  }
  useEffect(() => { carregar(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [dias]);

  async function limparRuido() {
    if (limpando || !window.confirm('Apagar as visitas de teste (previews .vercel.app)? Não toca nas visitas reais.')) return;
    setLimpando(true);
    try {
      const r = await fetch('/api/admin/site-analytics', { method: 'POST' });
      const j = await r.json();
      if (j.ok) { carregar(); alert(`Limpo: ${j.apagadas} visita(s) de teste apagada(s).`); }
    } catch { /* ignora */ } finally { setLimpando(false); }
  }

  const maxDia = Math.max(1, ...((d?.serie ?? []).map((s) => s.n)));
  const maxFonte = Math.max(1, ...((d?.fontes ?? []).map((f) => f.n)));

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-stone-100">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-200">← Admin</Link>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics · Site</h1>
          <p className="mt-1 text-sm text-stone-400">Visitas a viviannedossantos.com — e de onde vêm (Instagram, TikTok…).</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={limparRuido} disabled={limpando} className="rounded-lg border border-stone-600 px-3 py-2 text-xs text-stone-300 hover:bg-stone-800 disabled:opacity-40">{limpando ? 'a limpar…' : '🗑️ limpar ruído de testes'}</button>
          <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900">
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </div>
      </div>

      {carregando ? (
        <p className="mt-8 text-sm text-stone-400">A carregar…</p>
      ) : d?.erro === 'sem-tabela' ? (
        <div className="mt-8 rounded-2xl border border-amber-700/40 bg-amber-950/20 p-5 text-sm text-amber-200">
          <p className="font-semibold text-amber-300">Falta criar a tabela (1 vez só).</p>
          <p className="mt-2">Vai ao <b>Supabase → SQL Editor → New query</b>, cola isto e carrega em <b>Run</b>:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-stone-200">{d.sql}</pre>
          <p className="mt-2 text-amber-300/80">Depois recarrega esta página. A partir daí, cada visita ao site fica registada.</p>
        </div>
      ) : !d?.ok ? (
        <p className="mt-8 text-sm text-rose-300">Não deu para carregar: {d?.detalhe ?? d?.erro}</p>
      ) : (
        <>
          {/* destaque */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Cartao big={nf(d.total)} label={`Visitas (${d.dias} dias)`} />
            <Cartao big={nf(d.hoje)} label="Visitas hoje" />
            <Cartao big={d.fontes?.[0] ? `${emojiFonte(d.fontes[0].k)} ${d.fontes[0].k}` : '—'} label="Maior fonte" />
          </div>

          {/* gráfico diário */}
          <div className="mt-6 rounded-2xl border border-stone-700 p-5">
            <div className="text-xs font-medium text-stone-300">Visitas por dia</div>
            <div className="mt-3 flex h-32 items-end gap-0.5">
              {(d.serie ?? []).map((s) => (
                <div key={s.dia} className="flex-1 rounded-t bg-emerald-500/70 hover:bg-emerald-400" style={{ height: `${Math.max(2, Math.round((s.n / maxDia) * 100))}%` }} title={`${s.dia}: ${s.n}`} />
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* fontes */}
            <div className="rounded-2xl border border-stone-700 p-5">
              <div className="text-xs font-medium text-stone-300">De onde vêm (fontes)</div>
              <div className="mt-3 space-y-2">
                {(d.fontes ?? []).map((f) => (
                  <div key={f.k} className="text-sm">
                    <div className="flex justify-between text-stone-300"><span>{emojiFonte(f.k)} {f.k}</span><span>{nf(f.n)}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-stone-800"><div className="h-1.5 rounded-full bg-rose-500" style={{ width: `${Math.round((f.n / maxFonte) * 100)}%` }} /></div>
                  </div>
                ))}
                {(d.fontes?.length ?? 0) === 0 && <div className="text-xs text-stone-600">Sem visitas ainda.</div>}
              </div>
            </div>

            {/* páginas */}
            <div className="rounded-2xl border border-stone-700 p-5">
              <div className="text-xs font-medium text-stone-300">Páginas mais vistas</div>
              <div className="mt-3 space-y-1 text-sm">
                {(d.paginas ?? []).map((p) => (
                  <div key={p.k} className="flex justify-between gap-3 text-stone-300">
                    <span className="truncate">{p.k}</span><span className="shrink-0 text-stone-400">{nf(p.n)}</span>
                  </div>
                ))}
                {(d.paginas?.length ?? 0) === 0 && <div className="text-xs text-stone-600">Sem visitas ainda.</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function Cartao({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-2xl border border-stone-700 bg-stone-900/40 p-4">
      <div className="text-2xl font-semibold text-white">{big}</div>
      <div className="mt-1 text-xs text-stone-400">{label}</div>
    </div>
  );
}
