'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { toPng } from 'html-to-image';
import { ReelSlide, type ReelFrame } from '@/components/admin/ReelSlide';
import { KineticSlide } from '@/components/admin/KineticSlide';
import { Btn, Card } from '@/components/admin/EstudioKit';
import { CURSOS, getCurso } from '@/lib/infografico/cursos';
import { FORMATOS, getFormato } from '@/lib/reels/formatos';
import { topicosReels } from '@/lib/reels/topicos';
import { PALETAS, type Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type ReelSlideT = { tipo: string; kicker?: string; texto: string; nota?: string; titulo?: string; pontos?: string[]; motivo?: string; selo?: string; pal?: string; variante?: string; capa?: boolean; destaque?: string[]; imageUrl?: string; notaVisual?: string };
type Dia = { dia: number; mundo?: Mundo; slides?: ReelSlideT[]; videoUrl?: string; roteiro?: string[]; legenda?: string; hashtags?: string[]; faixa?: { titulo?: string } };
type Item = { slug: string; title: string; dias: Dia[]; theme: { formato?: string; subtipo?: string; curso?: string; mundo?: Mundo; video?: boolean }; created_at: string };

// pré-visualização animada do cinético (loop suave)
function KineticPreview({ texto, destaque, imageUrl, mundo, variante }: { texto: string; destaque?: string[]; imageUrl?: string; mundo?: Mundo; variante?: string }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    let raf = 0; let t0 = 0; const CICLO = 6500;
    const tick = (t: number) => { if (!t0) t0 = t; const e = ((t - t0) % CICLO) / CICLO; setProg(Math.min(1, e / 0.75)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, []);
  return <KineticSlide texto={texto} destaque={destaque} imageUrl={imageUrl} mundo={mundo} prog={prog} variante={variante} />;
}

export default function ReelsPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tema, setTema] = useState('');
  const [formato, setFormato] = useState('sinais');
  const [curso, setCurso] = useState('transpessoal');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [capaBusy, setCapaBusy] = useState(false);
  // capas-assinatura por série (resolvidas à hora de mostrar, valem p/ todos os posts)
  const [capasSerie, setCapasSerie] = useState<Record<string, string>>({});
  const capaUrl = capasSerie[formato] ?? null;

  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapasSerie(j.capas ?? {})).catch(() => {}); }, []);

  async function gerarCapaSerie() {
    setCapaBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/reels/capa-serie', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie: formato }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setCapasSerie(j.capas ?? {});
      setMsg('Capa-assinatura gerada e fixada. Vale para TODOS os posts desta série (antigos e novos). Não gostas? gera outra.');
    } catch (e) { setErro(String(e)); }
    finally { setCapaBusy(false); }
  }
  // modo "frase exata" (sem IA) — cinético
  const [manFrase, setManFrase] = useState('');
  const [manDest, setManDest] = useState('');
  const [manLeg, setManLeg] = useState('');
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
  // pré-preenche tema/formato vindos do Calendário (?tema=&formato=)
  useEffect(() => { const p = new URLSearchParams(window.location.search); const t = p.get('tema'); if (t) setTema(t); const f = p.get('formato'); if (f) setFormato(f); }, []);

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

  async function criarManual() {
    const frase = manFrase.trim();
    if (!frase) { setErro('Escreve a frase exata.'); return; }
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/reels/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manual: true, formato, curso, frase, destaque: manDest, legenda: manLeg }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setManFrase(''); setManDest(''); setManLeg('');
      setMsg('Post criado. Agora copia o prompt do fundo, gera no MJ e arrasta a imagem na biblioteca em baixo.');
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

  async function novoFundo(it: Item) {
    setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/reels/novo-fundo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg('Fundo novo gerado automaticamente.');
      await carregar();
    } catch (e) { setErro(String(e)); }
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
  function copiarTexto(t: string, aviso = 'Copiado.') {
    if (t) { navigator.clipboard?.writeText(t); setMsg(aviso); }
  }

  // arrasta/escolhe a imagem de fundo do cinético (1080x1920)
  function resizeFundo(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const W = 1080, H = 1920; const c = document.createElement('canvas'); c.width = W; c.height = H;
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
      const fd = new FormData(); fd.append('file', jpeg, 'fundo.jpg'); fd.append('slug', it.slug); fd.append('dia', '1'); fd.append('idx', '0');
      const r = await fetch('/api/admin/carrossel/upload-fundo', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setErro('fundo: ' + (j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setMsg('Fundo aplicado.'); await carregar();
    } catch (e) { setErro('fundo: ' + String(e)); }
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

  // ── download da imagem do cinético (PNG, frase completa) ──
  const capRef = useRef<HTMLDivElement>(null);
  const [capKin, setCapKin] = useState<Item | null>(null);
  useEffect(() => {
    if (!capKin) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 300));
        const node = capRef.current?.firstElementChild as HTMLElement | null;
        const imgs = Array.from(capRef.current?.querySelectorAll('img') ?? []);
        await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })));
        await new Promise((r) => setTimeout(r, 200));
        if (node) { await toPng(node, { pixelRatio: 1 }).catch(() => {}); const url = await toPng(node, { pixelRatio: 1 }); const a = document.createElement('a'); a.href = url; a.download = `${capKin.slug}.png`; a.click(); }
      } catch (e) { setErro('download: ' + String(e)); }
      setCapKin(null);
    })();
  }, [capKin]);

  const mundoDe = (it: Item) => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'escola';
  const framesDe = (it: Item): ReelFrame[] => {
    const capaSerie = capasSerie[it.theme?.subtipo ?? '']; // capa-assinatura da série (vale p/ todos)
    return (it.dias?.[0]?.slides ?? []).map((s, i) => ({ kicker: s.kicker, texto: s.texto, nota: s.nota, titulo: s.titulo, pontos: s.pontos, motivo: s.motivo, selo: s.selo, pal: s.pal, imageUrl: (i === 0 ? (s.imageUrl ?? capaSerie) : s.imageUrl) }));
  };
  const kinDe = (it: Item) => it.dias?.[0]?.slides?.[0];
  const it_kinetic = (it: Item) => it.theme?.subtipo === 'kinetico' || it.theme?.subtipo === 'domingo';

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

          {/* capa-assinatura fixa da série, gerada por Flux (carvão + creme) */}
          {['ninguem', 'sinais', 'pensador'].includes(formato) && (
            <div className="mb-4 rounded-xl border border-ocre/20 bg-black/20 p-3.5 flex items-center gap-3 flex-wrap">
              {capaUrl ? <img src={capaUrl} alt="" className="w-14 h-20 object-cover rounded-md border border-white/10" /> : <div className="w-14 h-20 rounded-md border border-white/10 grid place-items-center text-lg">{fmt.emoji}</div>}
              <div className="flex-1 min-w-0">
                <p className="text-[0.72rem] mb-0.5">Capa-assinatura de «{fmt.nome}»</p>
                <p className="text-[0.64rem] opacity-55 leading-snug">Gera UMA vez; fica fixa em todas as capas desta série. Capa em carvão; conteúdo em creme.</p>
              </div>
              <button onClick={gerarCapaSerie} disabled={capaBusy} className="text-[0.68rem] px-3 py-1.5 rounded-full border border-ambar/45 text-ambar hover:bg-ambar/10 disabled:opacity-40">{capaBusy ? 'a gerar… (~30s)' : `${fmt.emoji} gerar capa-assinatura`}</button>
            </div>
          )}

          {/* tema + curso */}
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Tema</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: parentificação, dar e receber, a sombra…" className="flex-1 bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar" />
            <select value={curso} onChange={(e) => setCurso(e.target.value)} className="bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem]">
              {CURSOS.map((c) => <option key={c.id} value={c.id} className="bg-[#0F0F1A]">{c.nome}</option>)}
            </select>
            <Btn variant="primary" onClick={() => gerar()} disabled={gerando}>{gerando ? 'a gerar…' : 'gerar'}</Btn>
          </div>

          {/* frase exata (sem IA) — só no cinético */}
          {(formato === 'kinetico' || formato === 'domingo') && (
            <div className="mt-4 rounded-xl border border-ambar/25 bg-ambar/[0.04] p-3.5">
              <p className="text-[0.62rem] uppercase tracking-[0.15em] text-ambar mb-2">✍️ Ou escreve a frase exata (sem IA)</p>
              <input value={manFrase} onChange={(e) => setManFrase(e.target.value)} placeholder="Frase exata. Ex.: Nem tudo o que sentes é teu." className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar mb-2" />
              <input value={manDest} onChange={(e) => setManDest(e.target.value)} placeholder="Palavra(s) a ouro, separadas por vírgula. Ex.: teu" className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.8rem] outline-none focus:border-ambar mb-2" />
              <textarea value={manLeg} onChange={(e) => setManLeg(e.target.value)} placeholder="Legenda completa (com hashtags). Opcional." rows={4} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.8rem] outline-none focus:border-ambar mb-2" />
              <div className="flex items-center gap-3">
                <Btn variant="primary" onClick={criarManual} disabled={gerando}>{gerando ? 'a criar…' : 'criar post'}</Btn>
                <span className="text-[0.68rem] opacity-50">cria o post com o teu texto. Depois arrastas a imagem de fundo na biblioteca.</span>
              </div>
            </div>
          )}

          {/* pool pronta de temas — escolhe e gera */}
          {(() => {
            const pool = Array.from(new Set([...topicosReels(formato), ...(sugMap[sugKey] ?? [])]));
            return (
              <>
                <div className="flex items-center gap-2 mt-5 mb-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50">Escolhe um tema (gera logo) · {pool.length} prontos</p>
                  <button onClick={pedirSugestoes} disabled={sugLoading} className="text-[0.6rem] px-2 py-0.5 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10">{sugLoading ? '…' : '↻ mais com IA'}</button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                  {pool.map((sug) => (
                    <button key={sug} onClick={() => gerar(sug)} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/75 hover:border-ambar hover:text-ambar disabled:opacity-40">{sug}</button>
                  ))}
                </div>
              </>
            );
          })()}
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
              const mundo = mundoDe(it);
              const f = getFormato(it.theme?.subtipo ?? 'sinais');
              const ehKin = it.theme?.subtipo === 'kinetico' || it.theme?.subtipo === 'domingo';
              const header = (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-[0.62rem] px-2 py-0.5 rounded-full" style={{ background: PALETAS[mundo].destaque + '22', color: PALETAS[mundo].destaque }}>{f.emoji} {f.nome}</span>
                    <span className="text-[0.62rem] opacity-50">{getCurso(it.theme?.curso ?? 'transpessoal').nome.split(' ')[0]}</span>
                  </div>
                  <h3 className="font-serif text-lg mb-3 text-center">{it.title}</h3>
                </>
              );

              // ── CINÉTICO: imagem + frase com motion ──
              if (ehKin) {
                const ks = kinDe(it);
                if (!ks) return null;
                return (
                  <Card key={it.slug} className="p-5">
                    {header}
                    <button onClick={() => setZoom({ it, idx: 0 })} className="block w-[58%] mx-auto mb-3 cursor-zoom-in" title="ver em grande (animado)">
                      <KineticPreview texto={ks.texto} destaque={ks.destaque} imageUrl={ks.imageUrl} mundo={mundo} variante={ks.variante} />
                    </button>

                    {/* fundo: prompt MJ + arrastar */}
                    {!ks.imageUrl && ks.notaVisual && (
                      <div className="mb-3 rounded-lg bg-black/25 p-3">
                        <p className="text-[0.58rem] uppercase tracking-[0.2em] opacity-50 mb-1">Fundo: copia o prompt → gera no MJ → arrasta</p>
                        <p className="text-[0.66rem] opacity-80 leading-snug mb-2">{ks.notaVisual}</p>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => copiarTexto(ks.notaVisual ?? '', 'Prompt MJ copiado.')} className="text-[0.62rem] px-2 py-1 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">copiar prompt MJ</button>
                          <label className="text-[0.62rem] px-2 py-1 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar cursor-pointer">arrastar imagem<input type="file" accept="image/*" hidden onChange={(e) => uploadFundo(e.target.files?.[0], it)} /></label>
                        </div>
                      </div>
                    )}

                    {d?.videoUrl && (
                      <div className="mb-3 flex items-center justify-center gap-3">
                        <video src={d.videoUrl} controls playsInline className="w-28 rounded-lg border border-white/10 bg-black" />
                        <a href={d.videoUrl} download className="text-[0.66rem] px-2.5 py-1 rounded border border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar">⬇ MP4</a>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 justify-center">
                      {ks.imageUrl && <label className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar cursor-pointer">trocar fundo<input type="file" accept="image/*" hidden onChange={(e) => uploadFundo(e.target.files?.[0], it)} /></label>}
                      <button onClick={() => novoFundo(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">↻ novo fundo</button>
                      <button onClick={() => setCapKin(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ imagem (PNG)</button>
                      <button onClick={() => gerarVideo(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">🎬 gerar vídeo MP4</button>
                      <button onClick={() => copiar(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">📋 legenda</button>
                      <button onClick={() => apagar(it.slug)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-rosa/30 text-rosa/80 hover:bg-rosa/10">remover</button>
                    </div>
                  </Card>
                );
              }

              // ── REEL normal (frames) ──
              const frames = framesDe(it);
              if (!frames.length) return null;
              return (
                <Card key={it.slug} className="p-5">
                  {header}
                  <button onClick={() => setZoom({ it, idx: 0 })} className="block w-[58%] mx-auto mb-4 cursor-zoom-in" title="ver os frames">
                    <ReelSlide frame={frames[0]} mundo={mundo} numero={1} total={frames.length} capa />
                  </button>

                  {d?.videoUrl && (
                    <div className="mb-3 flex items-center justify-center gap-3">
                      <video src={d.videoUrl} controls playsInline className="w-28 rounded-lg border border-white/10 bg-black" />
                      <a href={d.videoUrl} download className="text-[0.66rem] px-2.5 py-1 rounded border border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar">⬇ MP4</a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 justify-center">
                    <button onClick={() => setZipIt(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ frames (PNG)</button>
                    <button onClick={() => gerarVideo(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">🎬 gerar vídeo MP4</button>
                    <button onClick={() => copiar(it)} className="text-[0.7rem] px-2.5 py-1.5 rounded border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar">📋 legenda</button>
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

        {/* host escondido para capturar a imagem do cinético */}
        {capKin && (() => { const ks = kinDe(capKin); return ks ? (
          <div ref={capRef} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
            <KineticSlide texto={ks.texto} destaque={ks.destaque} imageUrl={ks.imageUrl} mundo={mundoDe(capKin)} prog={1} variante={ks.variante} />
          </div>
        ) : null; })()}

        {/* zoom */}
        {zoom && it_kinetic(zoom.it) ? (() => {
          const ks = kinDe(zoom.it); const mundo = mundoDe(zoom.it);
          return (
            <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out">
              <div className="w-full" style={{ maxWidth: 'min(70vw, 320px)' }} onClick={(e) => e.stopPropagation()}>
                {ks && <KineticPreview texto={ks.texto} destaque={ks.destaque} imageUrl={ks.imageUrl} mundo={mundo} variante={ks.variante} />}
                <p className="text-center text-[0.7rem] opacity-60 mt-3">toca fora para fechar</p>
              </div>
            </div>
          );
        })() : zoom && (() => {
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
