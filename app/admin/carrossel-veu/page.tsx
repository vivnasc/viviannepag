'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { toPng } from 'html-to-image';
import { KineticSlide } from '@/components/admin/KineticSlide';
import { Btn, Card } from '@/components/admin/EstudioKit';
import { CURSOS } from '@/lib/infografico/cursos';
import { type Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type SlideT = { tipo: string; texto: string; destaque?: string[]; imageUrl?: string; notaVisual?: string; capa?: boolean };
type Dia = { dia: number; mundo?: Mundo; slides?: SlideT[]; legenda?: string; hashtags?: string[]; fundoPrompt?: string };
type Item = { slug: string; title: string; dias: Dia[]; theme: { modo?: string; mundo?: Mundo; curso?: string }; created_at: string };

const POOL = [
  'As Ordens do Amor (resumo)',
  'O que é a parentificação',
  'Dar e receber em equilíbrio',
  'Lealdades invisíveis',
  'O que carregas que não é teu',
  'Sinais de que vives a vida dos teus pais',
  'A sombra, segundo Jung',
  'Como pôr limites sem culpa',
  'O sintoma como amor',
  'O direito de pertencer',
];

export default function CarrosselVeuPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tema, setTema] = useState('');
  const [slidesN, setSlidesN] = useState(5);
  const [curso, setCurso] = useState('transpessoal');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [zoom, setZoom] = useState<{ it: Item; idx: number } | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/carrossel-veu/list');
    if (r.ok) setItens((await r.json()).carrosseis ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function gerar(opts: { tema?: string; modo?: string; termos?: string[] }) {
    const t = (opts.tema ?? tema).trim();
    const ehGlossComTermos = opts.modo === 'glossario' && (opts.termos?.length ?? 0) > 0;
    if (opts.modo !== 'sobre' && !ehGlossComTermos && opts.modo !== 'glossario' && !t) { setErro('Escreve o tema ou clica numa sugestão.'); return; }
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel-veu/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tema: t, slides: slidesN, curso, modo: opts.modo ?? 'tema', termos: opts.termos }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      if (!opts.tema && opts.modo !== 'sobre') setTema('');
      setMsg(`Carrossel criado: ${j.coleccao?.title ?? t}. Agora arrasta UMA imagem de fundo.`);
      await carregar();
    } catch (e) { setErro(String(e)); }
    finally { setGerando(false); }
  }

  async function apagar(slug: string) {
    if (!confirm('Apagar este carrossel?')) return;
    try {
      const r = await fetch('/api/admin/carrossel-veu/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) await carregar(); else setErro('apagar falhou');
    } catch (e) { setErro(String(e)); }
  }

  async function resetGlossario() {
    if (!confirm('Apagar todos os glossários e recomeçar a sequência do início (A psique, Ego, Self…)? Não toca no Sobre nem nos outros carrosséis.')) return;
    setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel-veu/reset-glossario', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) { setErro('reset: ' + (j.erro ?? '')); return; }
      setMsg(`Glossários apagados (${j.apagados}). A sequência recomeça em "A psique".`);
      await carregar();
    } catch (e) { setErro(String(e)); }
  }

  function copiar(it: Item) {
    const d = it.dias?.[0];
    const t = [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
    if (t) { navigator.clipboard?.writeText(t); setMsg('Legenda + hashtags copiadas.'); }
  }
  function copiarPrompt(it: Item) {
    const pr = it.dias?.[0]?.fundoPrompt ?? it.dias?.[0]?.slides?.[0]?.notaVisual ?? '';
    if (pr) { navigator.clipboard?.writeText(pr); setMsg('Prompt MJ do fundo copiado.'); }
  }

  // UMA imagem de fundo para TODOS os slides
  function resizeFundo(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const W = 1080, H = 1350; const c = document.createElement('canvas'); c.width = W; c.height = H;
        const ctx = c.getContext('2d'); if (!ctx) return reject(new Error('canvas'));
        const s = Math.max(W / img.width, H / img.height); const w = img.width * s, h = img.height * s;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.9);
      };
      img.onerror = () => reject(new Error('img')); img.src = URL.createObjectURL(file);
    });
  }
  async function uploadFundo(file: File | undefined, it: Item) {
    if (!file) return; setErro(null);
    try {
      const jpeg = await resizeFundo(file);
      const fd = new FormData(); fd.append('file', jpeg, 'fundo.jpg'); fd.append('slug', it.slug);
      const r = await fetch('/api/admin/carrossel-veu/fundo', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setErro('fundo: ' + (j.erro ?? '')); return; }
      setMsg('Fundo aplicado a todos os slides.'); await carregar();
    } catch (e) { setErro('fundo: ' + String(e)); }
  }

  // imagem DIFERENTE por slide (arrasta no detalhe)
  async function uploadFundoSlide(file: File | undefined, it: Item, idx: number) {
    if (!file) return; setErro(null);
    try {
      const jpeg = await resizeFundo(file);
      const fd = new FormData(); fd.append('file', jpeg, 'fundo.jpg'); fd.append('slug', it.slug); fd.append('dia', '1'); fd.append('idx', String(idx));
      const r = await fetch('/api/admin/carrossel/upload-fundo', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setErro('fundo: ' + (j.erro ?? '')); return; }
      await carregar();
      if (j.coleccao) setZoom((z) => z ? { ...z, it: j.coleccao as Item } : z);
      setMsg(`Imagem aplicada ao slide ${idx + 1}.`);
    } catch (e) { setErro('fundo: ' + String(e)); }
  }

  // ⬇ carrossel inteiro (zip de PNGs), no browser
  const zipRef = useRef<HTMLDivElement>(null);
  const [zipIt, setZipIt] = useState<Item | null>(null);
  useEffect(() => {
    if (!zipIt) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 300));
        const host = zipRef.current;
        // esperar que TODAS as imagens carreguem (senao o 1.o slide sai sem fundo)
        const imgs = Array.from(host?.querySelectorAll('img') ?? []);
        await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })));
        await new Promise((r) => setTimeout(r, 250));
        const nodes = host?.querySelectorAll<HTMLElement>('[data-slide]');
        if (nodes && nodes.length) {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          // aquecimento: a 1.a captura costuma falir imagens/fontes
          await toPng(nodes[0], { pixelRatio: 1 }).catch(() => {});
          for (let i = 0; i < nodes.length; i++) {
            const url = await toPng(nodes[i], { pixelRatio: 1 });
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

  const mundoDe = (it: Item) => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'escola';
  const slidesDe = (it: Item): SlideT[] => it.dias?.[0]?.slides ?? [];

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Carrosséis · Véu a Véu</h1>
          <Link href="/admin/reels" className="text-[0.7rem] opacity-60 hover:opacity-100">Reels →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-6">Gera o carrossel todo de uma vez. Depois arrastas <b>uma</b> imagem (aplica-se a todos os slides) e descarregas o conjunto. Sem fazer slide a slide.</p>

        <Card className="p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Tema do carrossel. Ex.: as Ordens do Amor" className="flex-1 bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar" />
            <select value={slidesN} onChange={(e) => setSlidesN(Number(e.target.value))} className="bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem]">
              {[3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n} className="bg-[#0F0F1A]">{n} slides</option>)}
            </select>
            <select value={curso} onChange={(e) => setCurso(e.target.value)} className="bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem]">
              {CURSOS.map((c) => <option key={c.id} value={c.id} className="bg-[#0F0F1A]">{c.nome}</option>)}
            </select>
            <Btn variant="primary" onClick={() => gerar({})} disabled={gerando}>{gerando ? 'a gerar…' : 'gerar'}</Btn>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button onClick={() => gerar({ modo: 'sobre' })} disabled={gerando} className="text-[0.72rem] px-3 py-1.5 rounded-full border border-[#C9B6FA]/50 text-[#C9B6FA] hover:bg-[#C9B6FA]/10">★ Sobre (apresentação da conta)</button>
            <button onClick={() => gerar({ modo: 'glossario' })} disabled={gerando} className="text-[0.72rem] px-3 py-1.5 rounded-full border border-[#C9B6FA]/50 text-[#C9B6FA] hover:bg-[#C9B6FA]/10">★ Glossário (do teu universo)</button>
            <button onClick={resetGlossario} disabled={gerando} className="text-[0.66rem] px-2.5 py-1.5 rounded-full border border-rosa/30 text-rosa/80 hover:bg-rosa/10">↺ recomeçar glossário do início</button>
            <span className="text-[0.62rem] opacity-40">presets prontos. O glossário avança na sequência, sem repetir.</span>
          </div>

          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mt-5 mb-2">Ou um tema pronto (gera logo)</p>
          <div className="flex flex-wrap gap-2">
            {POOL.map((t) => (
              <button key={t} onClick={() => gerar({ tema: t })} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/75 hover:border-ambar hover:text-ambar disabled:opacity-40">{t}</button>
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
              const slides = slidesDe(it);
              if (!slides.length) return null;
              const mundo = mundoDe(it);
              const temFundo = !!slides[0]?.imageUrl;
              return (
                <Card key={it.slug} className="p-5">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {it.theme?.modo === 'sobre' && <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[#C9B6FA]/15 text-[#C9B6FA]">apresentação</span>}
                    <span className="text-[0.62rem] opacity-50">{slides.length} slides</span>
                  </div>
                  <h3 className="font-serif text-lg mb-3 text-center">{it.title}</h3>
                  {/* todos os slides à vista (filmstrip) */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {slides.map((s, i) => (
                      <button key={i} onClick={() => setZoom({ it, idx: i })} className="shrink-0 w-[92px] cursor-zoom-in" title={`slide ${i + 1}`}>
                        <KineticSlide texto={s.texto} destaque={s.destaque} imageUrl={s.imageUrl} mundo={mundo} prog={1} ratio="4:5" />
                        <p className="text-center text-[0.55rem] opacity-45 mt-1">{i + 1}{s.imageUrl ? '' : ' ·sem img'}</p>
                      </button>
                    ))}
                  </div>

                  {/* FUNDO: uma imagem para todos os slides (o caminho simples) */}
                  <div className="mb-3 rounded-lg bg-black/25 p-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="w-full text-center text-[0.58rem] uppercase tracking-[0.2em] opacity-50 mb-1">Fundo</span>
                    <button onClick={() => copiarPrompt(it)} className="text-[0.66rem] px-2.5 py-1 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">copiar prompt MJ</button>
                    <label className="text-[0.66rem] px-2.5 py-1 rounded border border-salvia/50 bg-salvia/10 text-salvia hover:bg-salvia/20 cursor-pointer">⬆ {temFundo ? 'trocar' : 'pôr'} 1 imagem para TODOS os slides<input type="file" accept="image/*" hidden onChange={(e) => uploadFundo(e.target.files?.[0], it)} /></label>
                    <span className="w-full text-center text-[0.56rem] opacity-40 mt-1">para uma imagem diferente por slide, abre um slide (clica na miniatura) e arrasta lá</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center">
                    <button onClick={() => setZipIt(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ carrossel (PNG)</button>
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
            {slidesDe(zipIt).map((s, i) => (
              <div key={i} data-slide style={{ width: 1080 }}>
                <KineticSlide texto={s.texto} destaque={s.destaque} imageUrl={s.imageUrl} mundo={mundoDe(zipIt)} prog={1} ratio="4:5" />
              </div>
            ))}
          </div>
        )}

        {/* zoom: navegar pelos slides */}
        {zoom && (() => {
          const slides = slidesDe(zoom.it); const mundo = mundoDe(zoom.it);
          const nav = (delta: number) => setZoom((z) => z ? { ...z, idx: (z.idx + delta + slides.length) % slides.length } : z);
          return (
            <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center gap-3 sm:gap-6 bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out">
              <button onClick={(e) => { e.stopPropagation(); nav(-1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">‹</button>
              <div className="w-full" style={{ maxWidth: 'min(78vw, 380px)' }} onClick={(e) => e.stopPropagation()}>
                <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); uploadFundoSlide(e.dataTransfer.files?.[0], zoom.it, zoom.idx); }}>
                  <KineticSlide texto={slides[zoom.idx].texto} destaque={slides[zoom.idx].destaque} imageUrl={slides[zoom.idx].imageUrl} mundo={mundo} prog={1} ratio="4:5" />
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <label className="text-[0.66rem] px-3 py-1.5 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10 cursor-pointer">⬆ imagem para o slide {zoom.idx + 1}<input type="file" accept="image/*" hidden onChange={(e) => uploadFundoSlide(e.target.files?.[0], zoom.it, zoom.idx)} /></label>
                </div>
                <p className="text-center text-[0.7rem] opacity-60 mt-2">{zoom.idx + 1} / {slides.length} · arrasta a imagem para o slide · toca fora para fechar</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); nav(1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">›</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
