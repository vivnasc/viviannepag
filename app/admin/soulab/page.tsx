'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { KineticSlide } from '@/components/admin/KineticSlide';
import type { Mundo } from '@/lib/estudio-conteudo';
import { SOULAB, TIPOS_SOULAB, SOULAB_MUNDO, type TipoSoulabId } from '@/lib/soulab/marca';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

const MUNDO = SOULAB_MUNDO as Mundo; // a paleta 'soulab' vive em PALETAS (Record<string>)

type Peca = {
  slug: string; tipo: string | null; texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; legenda: string | null;
  agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null;
};

export default function SoulabPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [tipo, setTipo] = useState<TipoSoulabId>('frase');
  const [tema, setTema] = useState('');
  const [quantos, setQuantos] = useState(1);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/soulab/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setErro(null);
    setMsg('A explorar no laboratório (texto + imagem)… pode demorar até 1 min por peça. Volta e recarrega se fechares.');
    try {
      const r = await fetch('/api/admin/soulab/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo, quantos, tema: tema.trim() || undefined }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} peça(s) gerada(s).${j.detalhe ? ` (aviso: ${j.detalhe})` : ''} Revê em baixo, regenera a imagem se quiseres, e renderiza.`);
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(false); }
  }, [busy, tipo, quantos, tema, recarregar]);

  const novaImagem = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A regenerar a imagem (Flux)…');
    try {
      const r = await fetch('/api/admin/soulab/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Imagem nova gerada. Se gostares, renderiza.'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const renderizar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A disparar o render (GitHub Actions)…');
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg('Render disparado. O MP4 demora alguns minutos a aparecer. Recarrega daqui a pouco.');
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug]);

  const descartar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar esta peça?')) return;
    try {
      const r = await fetch('/api/admin/soulab/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) recarregar(); else { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  return (
    <main className={`${FONTS} min-h-screen px-4 py-8 md:px-8`} style={{ background: SOULAB.paleta.bg2, color: SOULAB.paleta.texto }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: SOULAB.paleta.bg }}>
          <h1 className="text-2xl flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant), serif', color: SOULAB.paleta.destaque }}>
            <span>{SOULAB.emoji}</span> @{SOULAB.handle} <span className="opacity-70 text-base" style={{ color: SOULAB.paleta.texto }}>· {SOULAB.nome}</span>
          </h1>
          <p className="mt-2 text-[0.92rem] italic opacity-90" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{SOULAB.posicionamento}</p>
          <p className="mt-2 text-[0.8rem] opacity-70">{SOULAB.missao}</p>
          <p className="mt-2 text-[0.7rem] opacity-55">Tom: {SOULAB.tom.join(' · ')}</p>
          <Link href={`/admin/publicar?conta=${SOULAB.id}`} className="mt-3 inline-block px-3 py-1.5 rounded-lg border border-white/20 text-[0.74rem] hover:bg-white/10">abrir no Publicar →</Link>
        </header>

        {/* gerar */}
        <section className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">nova experiência</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {TIPOS_SOULAB.map((t) => (
              <button key={t.id} onClick={() => setTipo(t.id)} title={t.descricao}
                className="px-3 py-1.5 rounded-lg border text-[0.78rem]"
                style={tipo === t.id
                  ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }
                  : { borderColor: 'rgba(255,255,255,0.18)', color: SOULAB.paleta.texto }}>
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
          <p className="text-[0.72rem] opacity-60 mb-3">{TIPOS_SOULAB.find((t) => t.id === tipo)?.descricao}</p>
          <div className="flex flex-wrap items-center gap-2">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="tema/semente (opcional): ex. o limiar, a memória da água…"
              className="flex-1 min-w-[220px] text-[0.82rem] px-3 py-2 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
            <label className="inline-flex items-center gap-1.5 text-[0.74rem] opacity-80">
              quantas:
              <select value={quantos} onChange={(e) => setQuantos(Number(e.target.value))} className="bg-black/20 border border-white/15 rounded-md px-2 py-1.5 [color-scheme:dark]">
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button onClick={gerar} disabled={busy} className="px-4 py-2 rounded-lg border disabled:opacity-50 text-[0.84rem]"
              style={{ borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }}>
              {busy ? 'a explorar…' : '🧪 gerar'}
            </button>
          </div>
        </section>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {/* peças geradas */}
        <section>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">peças <span className="opacity-40">· {pecas.length}</span></h2>
          {pecas.length === 0 && <p className="text-[0.78rem] opacity-50">Ainda nada. Escolhe um ângulo e carrega &quot;gerar&quot;.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pecas.map((p) => (
              <div key={p.slug} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="relative">
                  <KineticSlide texto={p.texto} destaque={p.destaque} imageUrl={p.imageUrl ?? undefined} mundo={MUNDO} prog={1} conceito={p.conceito || undefined} />
                  <span className="absolute top-1 left-1 text-[0.5rem] px-1 py-0.5 rounded bg-black/60">{p.tipo ?? 'soulab'}</span>
                  {p.publicado
                    ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5">✓ publicado</span>
                    : p.videoUrl
                      ? <span className="absolute top-1 right-1 text-[0.5rem] bg-sky-600/80 text-white rounded px-1 py-0.5">MP4</span>
                      : <span className="absolute top-1 right-1 text-[0.5rem] bg-amber-600/80 text-white rounded px-1 py-0.5">sem MP4</span>}
                </div>
                <div className="p-2 flex flex-wrap gap-1 text-[0.62rem]">
                  <button onClick={() => novaImagem(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">imagem</button>
                  <button onClick={() => renderizar(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">render</button>
                  {!p.publicado && <button onClick={() => descartar(p.slug)} className="px-2 py-1 rounded border border-rose-400/40 text-rose-300">descartar</button>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
