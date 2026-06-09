'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { toPng } from 'html-to-image';
import { BandaSlide, type Painel } from '@/components/admin/BandaSlide';
import { Btn, Card } from '@/components/admin/EstudioKit';
import { type Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type HeroiSlideT = Painel & { tipo: string; capa?: boolean; imageUrl?: string | null; gancho?: string; texto?: string; serie?: string };
type Dia = { dia: number; mundo?: Mundo; slides?: HeroiSlideT[]; videoUrl?: string; legenda?: string; hashtags?: string[] };
type Item = { slug: string; title: string; dias: Dia[]; theme: { mundo?: Mundo }; created_at: string };

// Temas prontos (o arco da série "curar liberta as gerações")
const TEMAS_HEROI = [
  'há dores que não são tuas, só passaram por ti',
  'o peso que carregas e nunca escolheste',
  'aguentar tudo não é ser forte, é repetir o que te ensinaram',
  'o herói não é quem não cai, é quem não passa a dor à frente',
  'quando te curas, a tua filha já nasce mais leve',
  'honrar quem veio antes é transformar a dor, não repeti-la',
  'és onde a dor da linhagem encontra a saída',
  'parar de carregar o que não é teu',
  'curar-te a ti liberta gerações que ainda nem nasceram',
  'não vieste reparar os teus pais, vieste parar o ciclo',
];

export default function HeroiPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tema, setTema] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [zoom, setZoom] = useState<{ it: Item; idx: number } | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/heroi/list');
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('tema'); if (t) setTema(t); }, []);

  async function gerar(temaArg?: string) {
    const t = (temaArg ?? tema).trim();
    if (!t) { setErro('Escreve o tema ou clica num pronto.'); return; }
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/heroi/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tema: t }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      if (!temaArg) setTema('');
      setMsg(`Gerado: ${j.coleccao?.title ?? t}`);
      await carregar();
    } catch (e) { setErro(String(e)); }
    finally { setGerando(false); }
  }

  async function regenerar(it: Item) {
    if (!confirm('Regenerar este I am a Hero? Substitui o atual (mesmo lugar, não duplica).')) return;
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/heroi/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug, tema: it.title }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg('Regenerado no mesmo lugar (acentos corrigidos).');
      await carregar();
    } catch (e) { setErro(String(e)); }
    finally { setGerando(false); }
  }

  async function apagar(slug: string) {
    if (!confirm('Apagar este carrossel?')) return;
    try {
      const r = await fetch('/api/admin/heroi/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) await carregar(); else setErro('apagar falhou');
    } catch (e) { setErro(String(e)); }
  }

  async function gerarVideo(it: Item) {
    setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json();
      if (!r.ok) { setErro('vídeo: ' + (j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg('Render do MP4 disparado (~10 min no GitHub Actions). Recarrega depois para veres o vídeo.');
    } catch (e) { setErro(String(e)); }
  }

  function copiar(it: Item) {
    const d = it.dias?.[0];
    const texto = [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
    if (texto) { navigator.clipboard?.writeText(texto); setMsg('Legenda + hashtags copiadas.'); }
  }

  // download dos slides (PNG zip, no browser)
  const zipRef = useRef<HTMLDivElement>(null);
  const [zipIt, setZipIt] = useState<Item | null>(null);
  useEffect(() => {
    if (!zipIt) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 550));
        const nodes = zipRef.current?.querySelectorAll<HTMLElement>('[data-painel]');
        if (nodes && nodes.length) {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (let i = 0; i < nodes.length; i++) {
            const url = await toPng(nodes[i], { pixelRatio: 1, cacheBust: true });
            zip.file(`slide-${i + 1}.png`, url.split(',')[1], { base64: true });
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${zipIt.slug}.zip`; a.click();
          URL.revokeObjectURL(a.href);
        }
      } catch (e) { setErro('download: ' + String(e)); }
      setZipIt(null);
    })();
  }, [zipIt]);

  const mundoDe = (it: Item) => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'infonte';
  const paineisDe = (it: Item): Painel[] => (it.dias?.[0]?.slides ?? []).map((s) => ({ licao: s.licao, imageUrl: s.imageUrl, gancho: s.gancho, texto: s.texto, serie: s.serie ?? 'I am a Hero' }));
  const imagensDe = (it: Item): string[] => (it.dias?.[0]?.slides ?? []).map((s) => s.imageUrl).filter((u): u is string => !!u);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">I am a Hero · curar liberta as gerações</h1>
          <Link href="/admin/banda" className="text-[0.7rem] opacity-60 hover:opacity-100">Cá em Casa →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-1">Capa ilustrada (dourada, ancestral) + slides de ensino. O herói é quem quebra o ciclo: cura-se e liberta quem vem depois.</p>
        <p className="text-[0.72rem] opacity-45 mb-6">Nunca "salvador" nem desvalorizar a família, honrar é transformar a dor. Descarrega o JPG da capa e os slides em PNG.</p>

        <Card className="p-4 mb-8">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Tema do carrossel</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: curar-te liberta as próximas gerações…" className="flex-1 bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar" />
            <Btn variant="primary" onClick={() => gerar()} disabled={gerando}>{gerando ? 'a gerar…' : 'gerar carrossel'}</Btn>
          </div>
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mt-5 mb-2">Temas prontos (o arco)</p>
          <div className="flex flex-wrap gap-2">
            {TEMAS_HEROI.map((sug) => (
              <button key={sug} onClick={() => gerar(sug)} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/75 hover:border-ambar hover:text-ambar disabled:opacity-40">{sug}</button>
            ))}
          </div>
          {erro && <p className="mt-3 text-[0.75rem] text-red-300">{erro}</p>}
          {msg && <p className="mt-3 text-[0.75rem] text-salvia">{msg}</p>}
        </Card>

        {itens.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[0.72rem] opacity-55 mr-1">Biblioteca · {itens.length}</span>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="procurar…" className="ml-auto bg-black/30 border border-ocre/25 rounded-lg px-3 py-1 text-[0.75rem] outline-none focus:border-ambar" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {itens
            .filter((it) => !busca.trim() || it.title.toLowerCase().includes(busca.trim().toLowerCase()))
            .map((it) => {
              const paineis = paineisDe(it);
              if (!paineis.length) return null;
              const mundo = mundoDe(it);
              const d = it.dias?.[0];
              return (
                <Card key={it.slug} className="p-5">
                  <h3 className="font-serif text-lg mb-3 text-center">{it.title}</h3>
                  <button onClick={() => setZoom({ it, idx: 0 })} className="block w-[58%] mx-auto mb-4 cursor-zoom-in" title="ver os slides">
                    <BandaSlide painel={paineis[0]} mundo={mundo} numero={1} total={paineis.length} capa />
                  </button>
                  {d?.videoUrl && (
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <video src={d.videoUrl} controls playsInline className="w-28 rounded-lg border border-white/10 bg-black" />
                      <a href={d.videoUrl} download className="text-[0.66rem] px-2.5 py-1 rounded border border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar">⬇ MP4</a>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 justify-center">
                    {imagensDe(it).map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noopener" download className="text-[0.7rem] px-2.5 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ imagem (JPG)</a>
                    ))}
                    <button onClick={() => setZipIt(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">⬇ slides (PNG)</button>
                    <button onClick={() => gerarVideo(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">🎬 gerar vídeo MP4</button>
                    <button onClick={() => regenerar(it)} disabled={gerando} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-[#C9B6FA]/40 text-[#C9B6FA] hover:bg-[#C9B6FA]/10 disabled:opacity-40">↻ regenerar</button>
                    <button onClick={() => copiar(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">📋 legenda</button>
                    <button onClick={() => apagar(it.slug)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-rosa/30 text-rosa/80 hover:bg-rosa/10">remover</button>
                  </div>
                </Card>
              );
            })}
        </div>

        {/* host escondido para capturar os slides em PNG */}
        {zipIt && (
          <div ref={zipRef} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
            {paineisDe(zipIt).map((pa, i) => (
              <div key={i} data-painel style={{ width: 1080 }}>
                <BandaSlide painel={pa} mundo={mundoDe(zipIt)} numero={i + 1} total={paineisDe(zipIt).length} capa={i === 0} />
              </div>
            ))}
          </div>
        )}

        {/* zoom */}
        {zoom && (() => {
          const paineis = paineisDe(zoom.it); const mundo = mundoDe(zoom.it);
          const nav = (delta: number) => setZoom((z) => z ? { ...z, idx: (z.idx + delta + paineis.length) % paineis.length } : z);
          return (
            <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center gap-3 sm:gap-6 bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out">
              <button onClick={(e) => { e.stopPropagation(); nav(-1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">‹</button>
              <div className="w-full" style={{ maxWidth: 'min(70vw, 320px)' }} onClick={(e) => e.stopPropagation()}>
                <BandaSlide painel={paineis[zoom.idx]} mundo={mundo} numero={zoom.idx + 1} total={paineis.length} capa={zoom.idx === 0} />
                <p className="text-center text-[0.7rem] opacity-60 mt-3">{zoom.idx + 1} / {paineis.length} · toca fora para fechar</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); nav(1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">›</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
