'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { toPng } from 'html-to-image';
import { ReelSlide, type ReelFrame } from '@/components/admin/ReelSlide';
import { Btn, Card } from '@/components/admin/EstudioKit';
import { CURSOS, getCurso } from '@/lib/infografico/cursos';
import { FORMATOS, getFormato } from '@/lib/reels/formatos';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type ReelSlideT = { tipo: string; kicker?: string; texto: string; nota?: string; capa?: boolean };
type Dia = { dia: number; mundo?: Mundo; slides?: ReelSlideT[]; videoUrl?: string; roteiro?: string[]; legenda?: string; hashtags?: string[]; faixa?: { titulo?: string } };
type Item = { slug: string; title: string; dias: Dia[]; theme: { formato?: string; subtipo?: string; curso?: string; mundo?: Mundo; video?: boolean }; created_at: string };

export default function ReelsPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tema, setTema] = useState('');
  const [formato, setFormato] = useState('sinais');
  const [curso, setCurso] = useState('transpessoal');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [sugMap, setSugMap] = useState<Record<string, string[]>>({});
  const [sugLoading, setSugLoading] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [zoom, setZoom] = useState<{ it: Item; idx: number } | null>(null);

  const fmt = getFormato(formato);
  const sugKey = `${formato}:${curso}`;

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/reels/list');
    if (r.ok) setItens((await r.json()).reels ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function gerar(temaArg?: string) {
    const t = (temaArg ?? tema).trim();
    if (!t) { setErro('Escreve o tema ou clica numa sugestão.'); return; }
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/reels/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tema: t, formato, curso }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      if (!temaArg) setTema('');
      setMsg(`Gerado: ${j.coleccao?.title ?? t}`);
      await carregar();
    } catch (e) { setErro(String(e)); }
    finally { setGerando(false); }
  }

  async function pedirSugestoes() {
    setErro(null); setSugLoading(true);
    try {
      const r = await fetch('/api/admin/reels/sugerir', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ curso, formato }) });
      const j = await r.json();
      if (!r.ok) { setErro('sugestões: ' + (j.erro ?? '')); return; }
      setSugMap((prev) => ({ ...prev, [sugKey]: [...(prev[sugKey] ?? []), ...(j.temas ?? [])] }));
    } catch (e) { setErro(String(e)); }
    finally { setSugLoading(false); }
  }

  async function apagar(slug: string) {
    if (!confirm('Apagar este reel?')) return;
    try {
      const r = await fetch('/api/admin/reels/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) await carregar(); else setErro('apagar falhou');
    } catch (e) { setErro(String(e)); }
  }

  async function gerarVideo(it: Item) {
    setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json();
      if (!r.ok) { setErro('vídeo: ' + (j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg('Render do MP4 disparado (~10 min no GitHub Actions). Recarrega a página depois para veres o vídeo.');
    } catch (e) { setErro(String(e)); }
  }

  function copiar(it: Item) {
    const d = it.dias?.[0];
    const texto = [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
    if (texto) { navigator.clipboard?.writeText(texto); setMsg('Legenda + hashtags copiadas.'); }
  }
  function copiarGuiao(it: Item) {
    const r = it.dias?.[0]?.roteiro ?? [];
    if (r.length) { navigator.clipboard?.writeText(r.join('\n')); setMsg('Guião copiado.'); }
  }

  // ── download de frames (PNG, no browser) ──
  const zipRef = useRef<HTMLDivElement>(null);
  const [zipIt, setZipIt] = useState<Item | null>(null);
  useEffect(() => {
    if (!zipIt) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 500));
        const nodes = zipRef.current?.querySelectorAll<HTMLElement>('[data-frame]');
        if (nodes && nodes.length) {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          for (let i = 0; i < nodes.length; i++) {
            const url = await toPng(nodes[i], { pixelRatio: 1, cacheBust: true });
            zip.file(`frame-${i + 1}.png`, url.split(',')[1], { base64: true });
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
  const framesDe = (it: Item): ReelFrame[] => (it.dias?.[0]?.slides ?? []).map((s) => ({ kicker: s.kicker, texto: s.texto, nota: s.nota }));

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Reels · Véu a Véu</h1>
          <Link href="/admin/infografico" className="text-[0.7rem] opacity-60 hover:opacity-100">Infográficos →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-6">O motor de crescimento: reels curtos que trazem gente nova. Didático, sem CTA. Sai com a tua assinatura.</p>

        <Card className="p-4 mb-8">
          {/* escolher formato */}
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Formato</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {FORMATOS.map((f) => (
              <button key={f.id} onClick={() => setFormato(f.id)} className={`text-[0.72rem] px-3 py-1.5 rounded-full border ${formato === f.id ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{f.emoji} {f.nome}</button>
            ))}
          </div>
          <p className="text-[0.72rem] opacity-55 mb-4">{fmt.descricao} {!fmt.video && <span className="text-ambar">· dá-te o guião; o vídeo gravas tu</span>}</p>

          {/* tema + curso */}
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Tema</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: parentificação, dar e receber, a sombra…" className="flex-1 bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar" />
            <select value={curso} onChange={(e) => setCurso(e.target.value)} className="bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem]">
              {CURSOS.map((c) => <option key={c.id} value={c.id} className="bg-[#0F0F1A]">{c.nome}</option>)}
            </select>
            <Btn variant="primary" onClick={() => gerar()} disabled={gerando}>{gerando ? 'a gerar…' : 'gerar'}</Btn>
          </div>

          {/* sugestões */}
          <div className="flex items-center gap-2 mt-5 mb-2">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50">Ou clica uma sugestão (gera logo)</p>
            <button onClick={pedirSugestoes} disabled={sugLoading} className="text-[0.6rem] px-2 py-0.5 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10">{sugLoading ? '…' : '↻ IA'}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(sugMap[sugKey] ?? []).length === 0 && <span className="text-[0.7rem] opacity-40">carrega em ↻ IA para sugestões deste formato + curso</span>}
            {(sugMap[sugKey] ?? []).map((sug) => (
              <button key={sug} onClick={() => gerar(sug)} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/75 hover:border-ambar hover:text-ambar disabled:opacity-40">{sug}</button>
            ))}
          </div>
          {erro && <p className="mt-3 text-[0.75rem] text-red-300">{erro}</p>}
          {msg && <p className="mt-3 text-[0.75rem] text-salvia">{msg}</p>}
        </Card>

        {/* biblioteca */}
        {itens.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[0.72rem] opacity-55 mr-1">Biblioteca · {itens.length}</span>
            <button onClick={() => setFiltro('todos')} className={`text-[0.66rem] px-2.5 py-1 rounded-full border ${filtro === 'todos' ? 'border-ambar text-ambar' : 'border-ocre/25 text-creme-2/65'}`}>todos ({itens.length})</button>
            {FORMATOS.map((f) => {
              const n = itens.filter((it) => it.theme?.subtipo === f.id).length;
              if (!n) return null;
              return <button key={f.id} onClick={() => setFiltro(f.id)} className={`text-[0.66rem] px-2.5 py-1 rounded-full border ${filtro === f.id ? 'border-ambar text-ambar' : 'border-ocre/25 text-creme-2/65'}`}>{f.emoji} {f.nome} ({n})</button>;
            })}
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="procurar…" className="ml-auto bg-black/30 border border-ocre/25 rounded-lg px-3 py-1 text-[0.75rem] outline-none focus:border-ambar" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {itens
            .filter((it) => filtro === 'todos' || it.theme?.subtipo === filtro)
            .filter((it) => !busca.trim() || it.title.toLowerCase().includes(busca.trim().toLowerCase()))
            .map((it) => {
              const d = it.dias?.[0];
              const frames = framesDe(it);
              if (!frames.length) return null;
              const mundo = mundoDe(it);
              const f = getFormato(it.theme?.subtipo ?? 'sinais');
              const ehVideo = it.theme?.video !== false;
              return (
                <Card key={it.slug} className="p-5">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[0.62rem] px-2 py-0.5 rounded-full" style={{ background: PALETAS[mundo].destaque + '22', color: PALETAS[mundo].destaque }}>{f.emoji} {f.nome}</span>
                    <span className="text-[0.62rem] opacity-50">{getCurso(it.theme?.curso ?? 'transpessoal').nome.split(' ')[0]}</span>
                  </div>
                  <h3 className="font-serif text-lg mb-3 text-center">{it.title}</h3>

                  <button onClick={() => setZoom({ it, idx: 0 })} className="block w-[58%] mx-auto mb-4 cursor-zoom-in" title="ver os frames">
                    <ReelSlide frame={frames[0]} mundo={mundo} numero={1} total={frames.length} capa />
                  </button>

                  {d?.videoUrl && (
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <video src={d.videoUrl} controls playsInline className="w-28 rounded-lg border border-white/10 bg-black" />
                      <a href={d.videoUrl} download className="text-[0.66rem] px-2.5 py-1 rounded border border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar">⬇ MP4</a>
                    </div>
                  )}

                  {!ehVideo && (d?.roteiro?.length ?? 0) > 0 && (
                    <div className="mb-3 rounded-lg bg-black/25 p-3 text-[0.78rem] leading-relaxed">
                      <p className="text-[0.58rem] uppercase tracking-[0.2em] opacity-50 mb-2">Guião (lê enquanto gravas)</p>
                      {d!.roteiro!.map((l, i) => <p key={i} className={i === 0 ? 'font-medium mb-1' : 'opacity-85'}>{l}</p>)}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 justify-center">
                    <button onClick={() => setZipIt(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ frames (PNG)</button>
                    {ehVideo && <button onClick={() => gerarVideo(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">🎬 gerar vídeo MP4</button>}
                    <button onClick={() => copiar(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">📋 legenda</button>
                    {!ehVideo && <button onClick={() => copiarGuiao(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">📋 guião</button>}
                    <button onClick={() => apagar(it.slug)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-rosa/30 text-rosa/80 hover:bg-rosa/10">remover</button>
                  </div>
                </Card>
              );
            })}
        </div>

        {/* host escondido para capturar os frames em PNG */}
        {zipIt && (
          <div ref={zipRef} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
            {framesDe(zipIt).map((fr, i) => (
              <div key={i} data-frame style={{ width: 1080 }}>
                <ReelSlide frame={fr} mundo={mundoDe(zipIt)} numero={i + 1} total={framesDe(zipIt).length} capa={i === 0} />
              </div>
            ))}
          </div>
        )}

        {/* zoom: navegar pelos frames */}
        {zoom && (() => {
          const frames = framesDe(zoom.it); const mundo = mundoDe(zoom.it);
          const nav = (delta: number) => setZoom((z) => z ? { ...z, idx: (z.idx + delta + frames.length) % frames.length } : z);
          return (
            <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center gap-3 sm:gap-6 bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out">
              <button onClick={(e) => { e.stopPropagation(); nav(-1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">‹</button>
              <div className="w-full" style={{ maxWidth: 'min(70vw, 320px)' }} onClick={(e) => e.stopPropagation()}>
                <ReelSlide frame={frames[zoom.idx]} mundo={mundo} numero={zoom.idx + 1} total={frames.length} capa={zoom.idx === 0} />
                <p className="text-center text-[0.7rem] opacity-60 mt-3">{zoom.idx + 1} / {frames.length} · toca fora para fechar</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); nav(1); }} className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-xl flex items-center justify-center hover:bg-white/10">›</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
