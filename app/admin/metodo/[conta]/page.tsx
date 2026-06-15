'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { MetodoSlide } from '@/components/admin/MetodoSlide';
import { getConta, Conta } from '@/lib/metodo/contas';
import { Post, postsDaConta, sequenciaMix } from '@/lib/metodo/posts';
import { legendaDoPost, hashtagsDoPost } from '@/lib/metodo/legenda';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type EstadoPost = { slug: string; conta: string | null; tipo: string | null; texto: string; conceito: string; videoUrl: string | null; agendadoEm: string | null; publicado: boolean; criadoEm: string | null };

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };

// Pré-visualização animada (loop), com a identidade própria da conta.
function MetodoPreview({ texto, destaque, conta, conceito }: { texto: string; destaque?: string[]; conta: Conta; conceito?: string }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    let raf = 0; let t0 = 0; const CICLO = 11000;
    const tick = (t: number) => { if (!t0) t0 = t; const e = ((t - t0) % CICLO) / CICLO; setProg(Math.min(1, e / 0.85)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, []);
  return <MetodoSlide texto={texto} destaque={destaque} conta={conta} conceito={conceito} prog={prog} />;
}

export default function MetodoContaPage() {
  const params = useParams<{ conta: string }>();
  const conta = getConta(params.conta);
  const [estado, setEstado] = useState<Record<string, EstadoPost>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [lote, setLote] = useState<{ feito: number; total: number } | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/list').then((r) => (r.ok ? r.json() : { estado: {} })).then((j) => setEstado(j.estado ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async (postId: string) => {
    setBusy(postId); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ postId }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg(`Gerado: ${j.slug}. Vai a Publicar para agendar, renderizar o MP4 e exportar.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [recarregar]);

  const gerarLista = useCallback(async (posts: Post[]) => {
    for (const p of posts) { await gerar(p.id); }
  }, [gerar]);

  // gerar em lote (default 30) NO SERVIDOR: um pedido só, corre sozinho mesmo que
  // saias ou feches a página. Cria com o fundo de cor da conta (gradiente); a
  // imagem pintada é opcional (botão regenerar por post).
  const gerarLote = useCallback(async (n = 30) => {
    if (!conta || lote) return;
    setErro(null); setLote({ feito: 0, total: n });
    setMsg('A gerar no servidor. Podes sair ou fechar a página, que ele termina sozinho. Volta daqui a um minuto e recarrega.');
    try {
      const r = await fetch('/api/admin/metodo/gerar-lote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, n }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`Lote gerado: ${j.gerados} posts. Revê-os em baixo e renderiza os que aprovares (o vídeo sai com o @conta).`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setLote(null); recarregar(); }
  }, [conta, lote, recarregar]);

  // dispara o render (GitHub Actions) de UM slug. O MP4 sai com o @conta.
  const [renderBusy, setRenderBusy] = useState(false);
  const renderOne = useCallback(async (slug: string) => {
    const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
  }, []);

  // renderiza todos os posts gerados desta conta que ainda não têm vídeo.
  const renderFaltam = useCallback(async (faltam: EstadoPost[]) => {
    if (renderBusy || !faltam.length) return;
    setRenderBusy(true); setErro(null); setMsg(null);
    let n = 0;
    for (const e of faltam) { try { await renderOne(e.slug); n += 1; } catch (err) { setErro(String(err)); break; } }
    setRenderBusy(false);
    setMsg(`${n} renders disparados. Cada vídeo demora alguns minutos a aparecer (GitHub Actions). Recarrega daqui a pouco.`);
  }, [renderBusy, renderOne]);

  if (!conta) {
    return <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-8`}>
      <p>Conta desconhecida. <Link className="underline" href="/admin/metodo">Voltar</Link></p>
    </main>;
  }

  const posts = postsDaConta(conta.id);
  // tudo o que já foi gerado para esta conta (inclui os do lote/IA), para feedback e render.
  const geradosConta = Object.values(estado).filter((e) => e.conta === conta.id);
  const faltamRender = geradosConta.filter((e) => !e.videoUrl);
  const grupos: { tipo: string; itens: Post[] }[] = [
    { tipo: 'reconhecimento', itens: posts.filter((p) => p.tipo === 'reconhecimento') },
    { tipo: 'revelacao', itens: posts.filter((p) => p.tipo === 'revelacao') },
    { tipo: 'manifesto', itens: posts.filter((p) => p.tipo === 'manifesto') },
  ];

  const PostCard = ({ p }: { p: Post }) => {
    const st = estado[p.id];
    const gerado = Boolean(st);
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col md:flex-row gap-4 p-4">
        <div className="w-full md:w-[210px] shrink-0">
          <MetodoPreview texto={p.texto} destaque={p.destaque} conta={conta} conceito={p.conceito} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-[0.68rem] uppercase tracking-wider opacity-70">
            <span className="px-2 py-0.5 rounded-full" style={{ background: `${conta.cor}33`, color: conta.cor }}>{TIPO_LABEL[p.tipo]}</span>
            {p.veu && <span className="px-2 py-0.5 rounded-full bg-white/10">{p.conceito}</span>}
            <span className="opacity-40 normal-case tracking-normal">{p.fonte}</span>
          </div>
          <p className="mt-2 text-[1.1rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{p.texto}</p>
          <details className="mt-2 text-[0.78rem] opacity-80">
            <summary className="cursor-pointer opacity-70">legenda + hashtags</summary>
            <pre className="whitespace-pre-wrap mt-1 text-[0.74rem] opacity-90">{legendaDoPost(p)}</pre>
            <p className="mt-1 text-[0.72rem] opacity-70">{hashtagsDoPost(p).join(' ')}</p>
          </details>
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[0.72rem]">
            <button onClick={() => gerar(p.id)} disabled={busy === p.id} className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: `${conta.cor}88`, color: conta.cor }}>
              {busy === p.id ? 'a gerar…' : gerado ? 'regenerar' : 'gerar'}
            </button>
            {gerado && !st?.videoUrl && <button onClick={() => renderOne(st!.slug).then(() => setMsg('Render disparado. O vídeo aparece daqui a alguns minutos.')).catch((e) => setErro(String(e)))} className="px-3 py-1.5 rounded-lg border border-white/25">renderizar</button>}
            {gerado && <span className="text-emerald-300/80">gerado{st?.videoUrl ? ' · MP4 pronto' : ' · falta render'}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: `${conta.paleta.bg1}` }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>
            @{conta.handle} <span className="opacity-70 text-base text-[#F2E8DC]">· {conta.movimento}, {conta.essencia}</span>
          </h1>
          <p className="mt-2 text-[0.9rem] opacity-90">{conta.depois}</p>
          <p className="mt-1 text-[0.78rem] opacity-70">Símbolo: {conta.simbolo} · Véus: {conta.veus.join(' + ')} · Vende: {conta.manualNome} (€{conta.manualPrecoEur})</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem]">
            <button onClick={() => gerarLote(30)} disabled={!!lote} className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: conta.cor, color: '#0F0F1A', background: conta.cor }}>gerar lote (30)</button>
            <button onClick={() => gerarLista(sequenciaMix(conta.id))} disabled={!!lote} className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: `${conta.cor}88`, color: conta.cor }}>gerar a sequência (60/30/10)</button>
            <Link href="/admin/publicar" className="px-3 py-1.5 rounded-lg border border-white/20">abrir no Publicar →</Link>
            {lote && <span className="opacity-80">a gerar… {lote.feito}/{lote.total}</span>}
          </div>
          <p className="mt-1 text-[0.68rem] opacity-50">O lote demora alguns minutos (gera imagem por post). O progresso aparece aqui ao lado. Podes deixar a correr.</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem] border-t border-white/10 pt-3">
            <span className="opacity-80">Gerados nesta conta: <b style={{ color: conta.cor }}>{geradosConta.length}</b> · com vídeo: {geradosConta.length - faltamRender.length}</span>
            <button onClick={() => renderFaltam(faltamRender)} disabled={renderBusy || !faltamRender.length} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">
              {renderBusy ? 'a disparar render…' : `renderizar os que faltam (${faltamRender.length})`}
            </button>
            <span className="opacity-50">o vídeo (com o @conta) sai do render, demora alguns minutos.</span>
          </div>
        </header>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {geradosConta.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">Gerados · revê antes de renderizar <span className="opacity-40">· {geradosConta.length}</span></h2>
            <div className="grid gap-3 md:grid-cols-2">
              {geradosConta.map((e) => (
                <div key={e.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex gap-3">
                  <div className="w-[150px] shrink-0"><MetodoSlide texto={e.texto} conta={conta} conceito={e.conceito} prog={1} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[0.64rem] uppercase tracking-wider opacity-70">
                      <span className="px-2 py-0.5 rounded-full" style={{ background: `${conta.cor}33`, color: conta.cor }}>{TIPO_LABEL[e.tipo ?? ''] ?? e.tipo}</span>
                    </div>
                    <p className="mt-1.5 text-[0.95rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>{e.texto}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap text-[0.7rem]">
                      {e.videoUrl
                        ? <a href={e.videoUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg border border-emerald-400/40 text-emerald-300">ver MP4</a>
                        : <button onClick={() => renderOne(e.slug).then(() => setMsg('Render disparado. O vídeo aparece daqui a alguns minutos.')).catch((err) => setErro(String(err)))} className="px-2.5 py-1 rounded-lg border border-white/25">renderizar</button>}
                      <span className="opacity-50">{e.videoUrl ? 'MP4 pronto' : 'falta render'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {grupos.map((g) => g.itens.length > 0 && (
          <section key={g.tipo} className="mb-8">
            <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">{TIPO_LABEL[g.tipo]} <span className="opacity-40">· {g.itens.length}</span></h2>
            <div className="space-y-3">
              {g.itens.map((p) => <PostCard key={p.id} p={p} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
