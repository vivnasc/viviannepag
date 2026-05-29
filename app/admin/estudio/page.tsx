'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  CALENDARIO_30_DIAS,
  PALETAS,
  TIPO_LABELS,
  type ConteudoDia,
  type Slide,
  type Mundo,
} from '@/lib/estudio-conteudo';
import { SlideWithLayout, SlideLayoutGrid, SlideRender, type SlideLayout } from '@/components/admin/SlideRenderer';
import { saveImage } from '@/lib/estudio-imagens-db';
import { Pill, ProgressBar, EstimateCard, Btn, Card } from '@/components/admin/EstudioKit';
import {
  gerarCaptionInstagram,
  gerarCaptionTikTok,
  gerarCaptionWhatsApp,
  gerarMetricoolCSV,
  gerarResumoTexto,
} from '@/lib/estudio-export';

// ─── Helpers ────────────────────────────────────────────

function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="text-[0.68rem] px-2.5 py-1 rounded-md border border-ocre/30 text-ocre/80 hover:border-ambar hover:text-ambar transition-colors"
    >
      {copiado ? 'copiado' : label}
    </button>
  );
}

// ─── Shared helpers (used by ReelPreview) ──────

function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2] opacity-[0.06]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

function PhoneFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 320, maxWidth: '100%' }}>
      <div
        className="rounded-[36px] border-[3px] border-creme-2/20 overflow-hidden"
        style={{ aspectRatio: '9/16', background: '#111' }}
      >
        {children}
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-[5px] rounded-full bg-creme-2/15" />
    </div>
  );
}

function ReelPreview({ conteudo }: { conteudo: ConteudoDia }) {
  const p = PALETAS[conteudo.mundo];
  const script = conteudo.reelScript!;

  return (
    <div
      className="w-full h-full flex flex-col justify-end px-6 py-8 relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${p.bg2}44, ${p.bg2})` }}
    >
      <GrainOverlay />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${p.bg}, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.6rem] font-medium" style={{ background: p.destaque + '25', color: p.destaque }}>
            V
          </div>
          <div>
            <p className="text-[0.72rem] font-medium" style={{ color: p.texto }}>vivianne.dos.santos</p>
            <p className="text-[0.55rem]" style={{ color: p.texto + '70' }}>Reel &middot; {script.duracao}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[0.55rem] tracking-[0.2em] uppercase mb-1.5" style={{ color: p.destaque, opacity: 0.6 }}>
            gancho (3s)
          </p>
          <p className="font-serif text-[0.85rem] leading-[1.5]" style={{ color: p.texto }}>
            {script.gancho}
          </p>
        </div>

        <div className="border-l-2 pl-3 mb-4" style={{ borderColor: p.destaque + '35' }}>
          {script.corpo.map((linha, i) => (
            <p key={i} className="text-[0.72rem] leading-[1.5] mb-1.5" style={{ color: p.texto + 'bb' }}>
              {linha}
            </p>
          ))}
        </div>

        <p className="text-[0.72rem] font-medium mb-2" style={{ color: p.destaque }}>
          {script.cta}
        </p>

        {script.musica && (
          <div className="flex items-center gap-1.5 mt-3 py-1.5 px-2.5 rounded-full" style={{ background: p.texto + '08' }}>
            <span className="text-[0.55rem]">&#9835;</span>
            <p className="text-[0.55rem]" style={{ color: p.texto + '55' }}>{script.musica}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Carousel with multi-layout + export ────────────────

function CarrosselNavigavel({ conteudo }: { conteudo: ConteudoDia }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const slides = conteudo.slides ?? [];
  const total = slides.length;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main slide with layout selector */}
      <SlideWithLayout
        slide={slides[slideAtual]}
        mundo={conteudo.mundo}
        slideKey={`dia-${conteudo.dia}-slide-${slideAtual}`}
        defaultLayout={slides[slideAtual].fundoClaro ? 'claro' : slides[slideAtual].tipo === 'cta' ? 'cta' : slides[slideAtual].tipo === 'capa' ? 'foto-fundo' : 'statement'}
      />

      {/* Slide navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))}
          disabled={slideAtual === 0}
          className="w-8 h-8 rounded-full border border-ocre/30 text-creme-2/80 text-sm hover:border-ambar hover:text-ambar disabled:opacity-30 transition-colors"
        >
          &larr;
        </button>
        <span className="text-[0.72rem] text-creme-2/60 tracking-[0.1em]">
          {slideAtual + 1} / {total}
        </span>
        <button
          onClick={() => setSlideAtual(Math.min(total - 1, slideAtual + 1))}
          disabled={slideAtual === total - 1}
          className="w-8 h-8 rounded-full border border-ocre/30 text-creme-2/80 text-sm hover:border-ambar hover:text-ambar disabled:opacity-30 transition-colors"
        >
          &rarr;
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`ml-2 text-[0.6rem] px-2.5 py-1 rounded-md border transition-colors ${
            showGrid ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/25 text-creme-2/50 hover:text-creme-2/70'
          }`}
        >
          7 layouts
        </button>
      </div>

      {/* All 7 layouts grid */}
      {showGrid && (
        <div className="mt-2 p-3 rounded-[12px] border border-ocre/15 bg-terra-2/20">
          <SlideLayoutGrid slide={slides[slideAtual]} mundo={conteudo.mundo} slideKey={`dia-${conteudo.dia}-slide-${slideAtual}`} />
        </div>
      )}
    </div>
  );
}

// ─── Captions panel ─────────────────────────────────────

function CaptionsPanel({ conteudo }: { conteudo: ConteudoDia }) {
  const [tab, setTab] = useState<'instagram' | 'tiktok' | 'whatsapp'>('instagram');

  const captions = {
    instagram: gerarCaptionInstagram(conteudo),
    tiktok: gerarCaptionTikTok(conteudo),
    whatsapp: gerarCaptionWhatsApp(conteudo),
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70">Captions</p>
        <div className="flex-1" />
        {(['instagram', 'tiktok', 'whatsapp'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[0.62rem] px-2.5 py-1 rounded-md border transition-colors ${
              tab === t
                ? 'border-ambar/50 text-ambar bg-ambar/8'
                : 'border-ocre/20 text-creme-2/50 hover:text-creme-2/70'
            }`}
          >
            {t === 'instagram' ? 'IG' : t === 'tiktok' ? 'TT' : 'WA'}
          </button>
        ))}
      </div>
      <div className="bg-terra-2/40 rounded-[12px] border border-ocre/10 p-4">
        <pre className="text-creme-2/80 text-[0.78rem] leading-relaxed whitespace-pre-wrap font-sans">
          {captions[tab]}
        </pre>
        <div className="flex gap-2 mt-3">
          <CopyButton text={captions[tab]} label="copiar caption" />
          <CopyButton text={conteudo.hashtags.join(' ')} label="copiar hashtags" />
        </div>
      </div>
    </div>
  );
}

// ─── MJ Prompt Generator ────────────────────────────────

function PromptMJPanel({ conteudo, slideIdx }: { conteudo: ConteudoDia; slideIdx?: number }) {
  const [prompts, setPrompts] = useState<Record<number, string>>({});
  const [gerando, setGerando] = useState<number | null>(null);
  const [ar, setAr] = useState('4:5');

  const slides = conteudo.slides ?? [];
  const slidesComFundo = slideIdx !== undefined
    ? [{ slide: slides[slideIdx], idx: slideIdx }]
    : slides.map((s, i) => ({ slide: s, idx: i })).filter(s => s.slide.tipo === 'capa' || s.slide.tipo === 'citacao' || s.slide.notaVisual);

  async function gerar(slide: Slide, idx: number) {
    setGerando(idx);
    try {
      const res = await fetch('/api/admin/estudio/gerar-prompt-mj', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          texto: slide.texto,
          mundo: conteudo.mundo,
          tipo: slide.tipo,
          notaVisual: slide.notaVisual,
          titulo: conteudo.titulo,
          aspectRatio: ar,
        }),
      });
      const json = await res.json();
      if (json.prompt) {
        setPrompts(prev => ({ ...prev, [idx]: json.prompt }));
      }
    } catch (e) {
      console.error(e);
    }
    setGerando(null);
  }

  async function gerarTodos() {
    for (const { slide, idx } of slidesComFundo) {
      await gerar(slide, idx);
    }
  }

  if (slidesComFundo.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70">Prompts Midjourney</p>
        <div className="flex-1" />
        <select
          value={ar}
          onChange={e => setAr(e.target.value)}
          className="bg-transparent border border-ocre/25 rounded-md px-2 py-1 text-[0.65rem] text-creme-2/70 outline-none"
        >
          <option value="4:5">4:5 (IG post)</option>
          <option value="9:16">9:16 (story/reel)</option>
          <option value="1:1">1:1 (quadrado)</option>
        </select>
        <button
          onClick={gerarTodos}
          disabled={gerando !== null}
          className="text-[0.65rem] px-3 py-1.5 rounded-md border border-lila/40 text-lila hover:bg-lila/10 disabled:opacity-40 transition-colors"
        >
          {gerando !== null ? 'a gerar...' : `gerar ${slidesComFundo.length === 1 ? 'prompt' : 'todos'}`}
        </button>
      </div>

      <div className="space-y-2">
        {slidesComFundo.map(({ slide, idx }) => (
          <div key={idx} className="bg-terra-2/40 rounded-[10px] border border-ocre/10 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[0.55rem] tracking-[0.15em] uppercase text-ocre/50">
                Slide {idx + 1} &middot; {slide.tipo}
              </p>
              <div className="flex gap-2">
                {!prompts[idx] && (
                  <button
                    onClick={() => gerar(slide, idx)}
                    disabled={gerando !== null}
                    className="text-[0.6rem] px-2 py-0.5 rounded border border-ocre/25 text-ocre/70 hover:text-ambar hover:border-ambar disabled:opacity-40 transition-colors"
                  >
                    {gerando === idx ? 'a gerar...' : 'gerar MJ'}
                  </button>
                )}
                {prompts[idx] && <CopyButton text={prompts[idx]} label="copiar prompt" />}
              </div>
            </div>
            {slide.notaVisual && (
              <p className="text-creme-2/50 text-[0.7rem] italic mb-1.5">{slide.notaVisual}</p>
            )}
            {prompts[idx] && (
              <p className="text-creme-2/80 text-[0.75rem] leading-relaxed font-mono bg-terra-2/50 rounded-md p-2 mt-1.5">
                {prompts[idx]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gerador Automatico de Imagens (Claude + Replicate) ──

// ─── Bulk Producao (gera N dias em sequencia) ──────────

function BulkProducaoPanel() {
  const [nDias, setNDias] = useState<3 | 7 | 15 | 30>(3);
  const [modelo, setModelo] = useState<'flux-1.1-pro' | 'flux-1.1-pro-ultra'>('flux-1.1-pro');
  const [ativo, setAtivo] = useState(false);
  const [diaActual, setDiaActual] = useState<number | null>(null);
  const [slideActual, setSlideActual] = useState<{ feito: number; total: number }>({ feito: 0, total: 0 });
  const [statusDias, setStatusDias] = useState<Record<number, { feito: number; total: number; erro?: string }>>({});
  const [resumirDe, setResumirDe] = useState<number | null>(null);

  const diasParaProcessar = CALENDARIO_30_DIAS
    .filter(c => c.slides && c.slides.length > 0)
    .slice(0, nDias);

  const totalImagens = diasParaProcessar.reduce((acc, dia) => {
    return acc + (dia.slides ?? []).filter(s => s.tipo === 'capa' || s.tipo === 'conteudo' || s.tipo === 'citacao').length;
  }, 0);

  const custoPorImagem = modelo === 'flux-1.1-pro-ultra' ? 0.06 : 0.04;
  const custoTotal = (totalImagens * custoPorImagem).toFixed(2);
  const tempoMin = Math.ceil((totalImagens * 30) / 60);

  const totalFeitas = Object.values(statusDias).reduce((acc, s) => acc + s.feito, 0);

  async function gerarUmSlide(conteudo: ConteudoDia, slide: Slide, slideIdx: number): Promise<'feito' | 'skip' | 'erro'> {
    const slideKey = `dia-${conteudo.dia}-slide-${slideIdx}-foto-fundo`;
    const res = await fetch('/api/admin/estudio/gerar-imagem', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slideKey,
        texto: slide.texto,
        mundo: conteudo.mundo,
        tipo: slide.tipo,
        notaVisual: slide.notaVisual,
        titulo: conteudo.titulo,
        aspectRatio: '4:5',
        modelo,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detalhe ?? json.erro ?? 'falha');
    if (json.skip) return 'skip';
    if (!json.imageUrl) return 'erro';

    // Guardar em IndexedDB tambem
    try {
      const imgRes = await fetch(json.imageUrl);
      const blob = await imgRes.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      await saveImage(slideKey, dataUrl);
    } catch {}

    return 'feito';
  }

  async function arrancar(diaInicio = 0) {
    setAtivo(true);
    setResumirDe(null);

    for (let i = diaInicio; i < diasParaProcessar.length; i++) {
      const conteudo = diasParaProcessar[i];
      const slides = (conteudo.slides ?? []).filter(s => s.tipo === 'capa' || s.tipo === 'conteudo' || s.tipo === 'citacao');
      setDiaActual(conteudo.dia);
      setSlideActual({ feito: 0, total: slides.length });

      const slidesAll = conteudo.slides ?? [];
      for (let j = 0; j < slidesAll.length; j++) {
        const s = slidesAll[j];
        if (s.tipo !== 'capa' && s.tipo !== 'conteudo' && s.tipo !== 'citacao') continue;
        try {
          await gerarUmSlide(conteudo, s, j);
          setSlideActual(prev => ({ feito: prev.feito + 1, total: prev.total }));
          setStatusDias(prev => ({
            ...prev,
            [conteudo.dia]: {
              feito: (prev[conteudo.dia]?.feito ?? 0) + 1,
              total: slides.length,
            },
          }));
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'erro';
          setStatusDias(prev => ({ ...prev, [conteudo.dia]: { ...(prev[conteudo.dia] ?? { feito: 0, total: slides.length }), erro: msg } }));
          setResumirDe(i);
          setAtivo(false);
          return;
        }
      }
    }

    setAtivo(false);
    setDiaActual(null);
  }

  return (
    <Card elevado className="mb-8">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ambar">&#127922; Producao em massa</p>
        <div className="flex-1" />
        <select
          value={nDias}
          onChange={e => setNDias(Number(e.target.value) as 3 | 7 | 15 | 30)}
          disabled={ativo}
          className="bg-transparent border border-ocre/25 rounded-md px-2 py-1 text-[0.7rem] text-creme-2/80 outline-none"
        >
          <option value="3">3 dias (teste)</option>
          <option value="7">7 dias (1 semana)</option>
          <option value="15">15 dias (2 semanas)</option>
          <option value="30">30 dias (tudo)</option>
        </select>
        <select
          value={modelo}
          onChange={e => setModelo(e.target.value as 'flux-1.1-pro' | 'flux-1.1-pro-ultra')}
          disabled={ativo}
          className="bg-transparent border border-ocre/25 rounded-md px-2 py-1 text-[0.7rem] text-creme-2/80 outline-none"
        >
          <option value="flux-1.1-pro">Flux Pro $0.04</option>
          <option value="flux-1.1-pro-ultra">Flux Pro Ultra $0.06</option>
        </select>
      </div>

      <EstimateCard
        items={diasParaProcessar.length}
        assets={totalImagens}
        custoUsd={custoTotal}
        minutos={tempoMin}
        nota={`Gera sequencialmente todas as imagens de ${diasParaProcessar.length} dias. Claude decide quais slides precisam de imagem (alguns ficam so com texto).`}
      />

      {ativo && (
        <div className="space-y-2 mb-4">
          <ProgressBar
            current={totalFeitas}
            total={totalImagens}
            label={`Global: ${totalFeitas} de ${totalImagens} imagens`}
            variant="ouro-folha"
          />
          {diaActual !== null && (
            <ProgressBar
              current={slideActual.feito}
              total={slideActual.total}
              label={`Dia ${diaActual}: slide ${slideActual.feito} de ${slideActual.total}`}
              variant="ouro"
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {resumirDe !== null ? (
          <Btn variant="primary" size="md" onClick={() => arrancar(resumirDe)}>
            Retomar do dia {diasParaProcessar[resumirDe]?.dia}
          </Btn>
        ) : (
          <Btn variant="primary" size="md" onClick={() => arrancar(0)} disabled={ativo}>
            {ativo ? 'a gerar...' : `Arrancar (~$${custoTotal})`}
          </Btn>
        )}
        {Object.keys(statusDias).length > 0 && (
          <span className="text-[0.65rem] text-creme-2/60">
            Concluido: {Object.values(statusDias).filter(s => s.feito === s.total && !s.erro).length} / {diasParaProcessar.length} dias
          </span>
        )}
      </div>

      {Object.keys(statusDias).length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {diasParaProcessar.map(dia => {
            const st = statusDias[dia.dia];
            const variant: 'pendente' | 'em-curso' | 'feito' | 'erro' =
              !st ? 'pendente' : st.erro ? 'erro' : st.feito === st.total ? 'feito' : 'em-curso';
            return (
              <Pill key={dia.dia} variant={variant}>
                D{dia.dia} {st ? `${st.feito}/${st.total}` : ''}
              </Pill>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Bulk Render PNG (renderiza todos os slides como PNGs num ZIP) ──

function BulkRenderPanel() {
  const [ativo, setAtivo] = useState(false);
  const [progress, setProgress] = useState({ feito: 0, total: 0 });
  const [diaActual, setDiaActual] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const offscreenRef = useRef<HTMLDivElement>(null);

  const diasComSlides = CALENDARIO_30_DIAS.filter(c => c.slides && c.slides.length > 0);
  const totalSlides = diasComSlides.reduce((acc, c) => acc + (c.slides ?? []).length, 0);

  function defaultLayoutFor(slide: Slide): SlideLayout {
    if (slide.fundoClaro) return 'claro';
    if (slide.tipo === 'cta') return 'cta';
    if (slide.tipo === 'capa') return 'foto-fundo';
    return 'statement';
  }

  async function renderTodos() {
    setAtivo(true);
    setErro(null);
    setProgress({ feito: 0, total: totalSlides });

    try {
      const { default: JSZip } = await import('jszip');
      const { toPng } = await import('html-to-image');
      const zip = new JSZip();
      const root = offscreenRef.current;
      if (!root) throw new Error('Container nao encontrado');

      const { createRoot } = await import('react-dom/client');

      for (const conteudo of diasComSlides) {
        setDiaActual(conteudo.dia);
        const diaFolder = zip.folder(`dia-${String(conteudo.dia).padStart(2, '0')}`);
        if (!diaFolder) continue;

        const slides = conteudo.slides ?? [];
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const layout = defaultLayoutFor(slide);
          const slideKey = `dia-${conteudo.dia}-slide-${i}`;

          // Cria container temporario 1080x1350
          const wrapper = document.createElement('div');
          wrapper.style.position = 'fixed';
          wrapper.style.left = '-9999px';
          wrapper.style.top = '0';
          wrapper.style.width = '1080px';
          wrapper.style.height = '1350px';
          wrapper.style.background = '#000';
          root.appendChild(wrapper);

          const reactRoot = createRoot(wrapper);
          await new Promise<void>((resolve) => {
            reactRoot.render(
              <SlideRender
                slide={slide}
                mundo={conteudo.mundo}
                layout={layout}
                slideKey={slideKey}
              />
            );
            // Esperar render + carregamento de imagem
            setTimeout(resolve, 800);
          });

          try {
            const dataUrl = await toPng(wrapper, {
              width: 1080,
              height: 1350,
              pixelRatio: 1,
              backgroundColor: '#111',
              cacheBust: true,
            });
            const base64 = dataUrl.split(',')[1];
            const filename = `slide-${String(i + 1).padStart(2, '0')}-${slide.tipo}.png`;
            diaFolder.file(filename, base64, { base64: true });
          } catch (e) {
            console.error(`Erro slide ${i + 1} dia ${conteudo.dia}:`, e);
          }

          reactRoot.unmount();
          root.removeChild(wrapper);

          setProgress(prev => ({ feito: prev.feito + 1, total: prev.total }));
        }
      }

      setDiaActual(null);
      const blob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        // Pode adicionar progresso de compressao se quiseres
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viviannepag-30dias-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'erro desconhecido');
    }

    setAtivo(false);
  }

  return (
    <Card elevado className="mb-8">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ambar">&#127906; Render final PNG (ZIP)</p>
        <div className="flex-1" />
        <span className="text-[0.65rem] text-creme-2/60">
          {totalSlides} slides &middot; 1080&times;1350
        </span>
      </div>

      <p className="text-[0.7rem] text-creme-2/50 italic mb-3">
        Renderiza todos os slides finais (com imagem + texto + marca) e descarrega um ZIP organizado por dia.
        Requer que as imagens ja tenham sido geradas (FASE 3).
      </p>

      {ativo && (
        <div className="space-y-2 mb-3">
          <ProgressBar
            current={progress.feito}
            total={progress.total}
            label={`A renderizar PNGs ${diaActual ? `(dia ${diaActual})` : ''}`}
            variant="ouro-folha"
          />
        </div>
      )}

      {erro && (
        <p className="text-[0.7rem] text-rosa mb-2">Erro: {erro}</p>
      )}

      <Btn variant="primary" size="md" onClick={renderTodos} disabled={ativo}>
        {ativo ? 'a renderizar...' : 'render todos PNG'}
      </Btn>

      {/* container off-screen para render */}
      <div ref={offscreenRef} aria-hidden style={{ position: 'fixed', left: '-9999px', top: '0' }} />
    </Card>
  );
}

function GeradorImagensPanel({ conteudo }: { conteudo: ConteudoDia }) {
  const [estado, setEstado] = useState<Record<number, 'pendente' | 'a-gerar' | 'feito' | 'skip' | 'erro'>>({});
  const [erros, setErros] = useState<Record<number, string>>({});
  const [justificacoes, setJustificacoes] = useState<Record<number, string>>({});
  const [batchAtivo, setBatchAtivo] = useState(false);
  const [modelo, setModelo] = useState<'flux-1.1-pro' | 'flux-1.1-pro-ultra'>('flux-1.1-pro');

  const slides = conteudo.slides ?? [];
  const slidesGeraveis = slides
    .map((s, i) => ({ slide: s, idx: i }))
    .filter(({ slide }) => slide.tipo === 'capa' || slide.tipo === 'conteudo' || slide.tipo === 'citacao');

  // Rehydrate state from Supabase bucket on mount: any image already in bucket = 'feito'
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/estudio/listar-imagens-dia?mundo=${conteudo.mundo}&dia=${conteudo.dia}`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled || !Array.isArray(json.images)) return;
        const map: Record<number, 'feito'> = {};
        for (const img of json.images as Array<{ slideIdx: number }>) {
          map[img.slideIdx] = 'feito';
        }
        // user actions in prev win over rehydration
        setEstado(prev => {
          const merged: typeof prev = { ...map };
          for (const [k, v] of Object.entries(prev)) merged[Number(k)] = v;
          return merged;
        });
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [conteudo.mundo, conteudo.dia]);

  async function gerarUm(slide: Slide, idx: number, forcarImagem = false) {
    setEstado(prev => ({ ...prev, [idx]: 'a-gerar' }));
    setErros(prev => { const n = { ...prev }; delete n[idx]; return n; });
    try {
      const slideKey = `dia-${conteudo.dia}-slide-${idx}-foto-fundo`;
      const res = await fetch('/api/admin/estudio/gerar-imagem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slideKey,
          texto: slide.texto,
          mundo: conteudo.mundo,
          tipo: slide.tipo,
          notaVisual: slide.notaVisual,
          titulo: conteudo.titulo,
          aspectRatio: '4:5',
          modelo,
          forcarImagem,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detalhe ?? json.erro ?? 'falha');

      if (json.skip) {
        if (json.justificacao) {
          setJustificacoes(prev => ({ ...prev, [idx]: json.justificacao }));
        }
        setEstado(prev => ({ ...prev, [idx]: 'skip' }));
        return;
      }

      if (!json.imageUrl) throw new Error('sem imagem');
      if (json.justificacao) {
        setJustificacoes(prev => ({ ...prev, [idx]: json.justificacao }));
      }

      const imgRes = await fetch(json.imageUrl);
      const blob = await imgRes.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await saveImage(slideKey, dataUrl);

      setEstado(prev => ({ ...prev, [idx]: 'feito' }));
    } catch (e) {
      setErros(prev => ({ ...prev, [idx]: e instanceof Error ? e.message : 'erro' }));
      setEstado(prev => ({ ...prev, [idx]: 'erro' }));
    }
  }

  async function gerarBatch(limite?: number) {
    setBatchAtivo(true);
    const items = (limite ? slidesGeraveis.slice(0, limite) : slidesGeraveis)
      .filter(({ idx }) => estado[idx] !== 'feito' && estado[idx] !== 'skip' && estado[idx] !== 'a-gerar');
    for (const { slide, idx } of items) {
      await gerarUm(slide, idx);
    }
    setBatchAtivo(false);
  }


  if (slidesGeraveis.length === 0) return null;

  const totalFeitos = Object.values(estado).filter(s => s === 'feito').length;
  const algumAGerar = Object.values(estado).some(s => s === 'a-gerar') || batchAtivo;
  const custoPorImagem = modelo === 'flux-1.1-pro-ultra' ? 0.06 : 0.04;
  const slidesPendentes = slidesGeraveis.filter(({ idx }) => estado[idx] !== 'feito' && estado[idx] !== 'skip').length;
  const custoTotal = (slidesPendentes * custoPorImagem).toFixed(2);
  const tempoEstimado = Math.ceil((slidesPendentes * 30) / 60);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ambar">&#10024; Gerar Imagens Auto</p>
        <div className="flex-1" />
        <select
          value={modelo}
          onChange={e => setModelo(e.target.value as 'flux-1.1-pro' | 'flux-1.1-pro-ultra')}
          disabled={algumAGerar}
          className="bg-transparent border border-ocre/25 rounded-md px-2 py-1 text-[0.62rem] text-creme-2/70 outline-none"
        >
          <option value="flux-1.1-pro">Flux Pro · $0.04</option>
          <option value="flux-1.1-pro-ultra">Flux Pro Ultra · $0.06</option>
        </select>
      </div>

      {slidesPendentes > 0 && (
        <EstimateCard
          items={slidesGeraveis.length}
          assets={slidesPendentes}
          custoUsd={custoTotal}
          minutos={tempoEstimado}
          nota="Comeca por 'testar 3' para validar qualidade antes de gerar tudo."
        />
      )}

      {algumAGerar && (
        <div className="mb-3">
          <ProgressBar
            current={totalFeitos}
            total={slidesGeraveis.length}
            label="A gerar imagens (Claude + Replicate)"
            variant="ouro-folha"
            subLabel={`${slidesPendentes} pendentes`}
          />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Btn
          variant="default"
          size="md"
          onClick={() => gerarBatch(3)}
          disabled={algumAGerar}
          title="Gera 3 imagens primeiro para validar qualidade"
        >
          testar 3
        </Btn>
        <Btn
          variant="primary"
          size="md"
          onClick={() => gerarBatch()}
          disabled={algumAGerar || slidesPendentes === 0}
        >
          {algumAGerar ? 'a gerar...' : slidesPendentes === 0 ? 'tudo feito ✓' : `gerar todas (~$${custoTotal})`}
        </Btn>
        <div className="flex-1" />
        <span className="text-[0.6rem] text-creme-2/40">
          {totalFeitos}/{slidesGeraveis.length} feito
        </span>
      </div>
      <div className="space-y-1.5">
        {slidesGeraveis.map(({ slide, idx }) => {
          const s = estado[idx] ?? 'pendente';
          const just = justificacoes[idx];
          return (
            <div key={idx} className="bg-terra-2/30 rounded-[8px] border border-ocre/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] text-ocre/50 w-12">Slide {idx + 1}</span>
                <span className="text-[0.7rem] text-creme-2/70 flex-1 truncate">
                  {slide.texto.substring(0, 60)}...
                </span>
                <Pill
                  variant={
                    s === 'feito' ? 'feito' :
                    s === 'a-gerar' ? 'em-curso' :
                    s === 'skip' ? 'skip' :
                    s === 'erro' ? 'erro' :
                    'pendente'
                  }
                >
                  {s === 'feito' ? '✓ feito' : s === 'a-gerar' ? 'a gerar' : s === 'skip' ? 'só texto' : s === 'erro' ? 'erro' : 'pendente'}
                </Pill>
                <Btn
                  variant="default"
                  size="sm"
                  onClick={() => gerarUm(slide, idx, s === 'skip')}
                  disabled={algumAGerar}
                >
                  {s === 'a-gerar' ? '...' : s === 'feito' ? 'refazer' : s === 'skip' ? 'forçar' : 'gerar'}
                </Btn>
              </div>
              {just && (
                <p className="text-[0.6rem] text-creme-2/40 italic mt-1 pl-14">{just}</p>
              )}
            </div>
          );
        })}
      </div>
      {Object.entries(erros).map(([idx, msg]) => (
        <p key={idx} className="text-[0.65rem] text-rosa mt-1">Slide {Number(idx) + 1}: {msg}</p>
      ))}
    </div>
  );
}

// ─── Detail modal (major upgrade) ──────────────────────

function DetalheConteudo({ conteudo, onFechar, onPrev, onNext, posicao }: {
  conteudo: ConteudoDia;
  onFechar: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  posicao?: { actual: number; total: number };
}) {
  const p = PALETAS[conteudo.mundo];
  const tipo = TIPO_LABELS[conteudo.tipo];
  const temSlides = conteudo.slides && conteudo.slides.length > 0;
  const temReel = conteudo.reelScript;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'Escape') onFechar();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onPrev, onNext, onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      {/* Setas de navegacao laterais (fixed para sempre visiveis) */}
      {onPrev && (
        <button
          onClick={onPrev}
          aria-label="Dia anterior"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 rounded-full border border-ocre/30 bg-terra/80 backdrop-blur text-creme-2/70 text-base hover:border-ambar hover:text-ambar transition-colors flex items-center justify-center"
        >
          &larr;
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          aria-label="Dia seguinte"
          className="fixed right-3 top-1/2 -translate-y-1/2 z-[60] w-11 h-11 rounded-full border border-ocre/30 bg-terra/80 backdrop-blur text-creme-2/70 text-base hover:border-ambar hover:text-ambar transition-colors flex items-center justify-center"
        >
          &rarr;
        </button>
      )}

      <div className="w-full max-w-[1100px] rounded-[20px] border border-ocre/20 overflow-hidden" style={{ background: '#1a1410' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ocre/15">
          <div className="flex items-center gap-3">
            <span className="text-lg">{tipo.emoji}</span>
            <div>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: tipo.cor }}>
                {tipo.label} &middot; Dia {conteudo.dia} &middot; {p.nome}
              </p>
              <h2 className="font-serif font-light text-creme text-lg">{conteudo.titulo}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {posicao && (
              <span className="text-[0.65rem] text-creme-2/50 tracking-[0.1em]">
                {posicao.actual} / {posicao.total}
              </span>
            )}
            <button
              onClick={onFechar}
              className="w-9 h-9 rounded-full border border-ocre/30 text-creme-2/70 text-sm hover:border-ambar hover:text-ambar transition-colors"
              aria-label="Fechar"
            >
              &#10005;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left: Preview */}
          <div>
            {temSlides && <CarrosselNavigavel conteudo={conteudo} />}
            {temReel && (
              <PhoneFrame>
                <ReelPreview conteudo={conteudo} />
              </PhoneFrame>
            )}
          </div>

          {/* Right: Info + Captions */}
          <div className="space-y-6">
            {/* Meta info */}
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-2">Descricao</p>
              <p className="text-creme-2/80 text-[0.85rem] leading-relaxed">{conteudo.descricao}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.55rem] tracking-[0.2em] uppercase text-ocre/50 mb-1">Plataforma</p>
                <p className="text-creme text-[0.8rem]">
                  {conteudo.plataforma === 'ambas' ? 'IG + TT' : conteudo.plataforma === 'instagram' ? 'Instagram' : 'TikTok'}
                </p>
              </div>
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.55rem] tracking-[0.2em] uppercase text-ocre/50 mb-1">Horario</p>
                <p className="text-creme text-[0.8rem]">{conteudo.horario}</p>
              </div>
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.55rem] tracking-[0.2em] uppercase text-ocre/50 mb-1">Formato</p>
                <p className="text-creme text-[0.8rem]">
                  {temSlides ? `${conteudo.slides!.length} slides` : temReel ? conteudo.reelScript!.duracao : '—'}
                </p>
              </div>
            </div>

            {conteudo.produtoRelacionado && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-ocre/15">
                <span className="text-[0.55rem] tracking-[0.2em] uppercase text-ocre/50">Produto:</span>
                <span className="text-ambar text-[0.8rem]">{conteudo.produtoRelacionado}</span>
                <a
                  href={`/loja/${conteudo.produtoRelacionado}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.6rem] text-ocre/50 hover:text-ambar ml-auto"
                >
                  ver &rarr;
                </a>
              </div>
            )}

            {/* ─── 1. Imagens (so para slides) ─── */}
            {temSlides && (
              <>
                <div className="flex items-center gap-2 -mb-2">
                  <span className="w-5 h-5 rounded-full bg-ambar/15 border border-ambar/30 flex items-center justify-center text-ambar text-[0.65rem] font-serif">1</span>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Gerar imagens</p>
                </div>
                <GeradorImagensPanel conteudo={conteudo} />
              </>
            )}

            {/* ─── 2. Captions ─── */}
            <div className="flex items-center gap-2 -mb-2">
              <span className="w-5 h-5 rounded-full bg-ambar/15 border border-ambar/30 flex items-center justify-center text-ambar text-[0.65rem] font-serif">{temSlides ? 2 : 1}</span>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Captions</p>
            </div>
            <CaptionsPanel conteudo={conteudo} />

            {/* ─── 3. Prompts MJ (manual, opcional) ─── */}
            {temSlides && (
              <>
                <div className="flex items-center gap-2 -mb-2">
                  <span className="w-5 h-5 rounded-full bg-ambar/15 border border-ambar/30 flex items-center justify-center text-ambar text-[0.65rem] font-serif">3</span>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Prompts Midjourney (manual)</p>
                </div>
                <PromptMJPanel conteudo={conteudo} />
              </>
            )}

            {/* Script completo (reels) */}
            {temReel && conteudo.reelScript && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-ambar/15 border border-ambar/30 flex items-center justify-center text-ambar text-[0.65rem] font-serif">1</span>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Script reel</p>
                </div>
                <div className="bg-terra-2/40 rounded-[12px] p-4 border border-ocre/15 space-y-3">
                  <div>
                    <p className="text-[0.55rem] tracking-[0.15em] uppercase text-ambar/60 mb-1">Gancho (3s)</p>
                    <p className="text-creme font-serif text-[0.88rem] leading-relaxed">{conteudo.reelScript.gancho}</p>
                  </div>
                  <div>
                    <p className="text-[0.55rem] tracking-[0.15em] uppercase text-ambar/60 mb-1">Corpo</p>
                    {conteudo.reelScript.corpo.map((l, i) => (
                      <p key={i} className="text-creme-2/80 text-[0.82rem] leading-relaxed mb-1">&bull; {l}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[0.55rem] tracking-[0.15em] uppercase text-ambar/60 mb-1">CTA</p>
                    <p className="text-creme text-[0.82rem]">{conteudo.reelScript.cta}</p>
                  </div>
                  {conteudo.reelScript.musica && (
                    <p className="text-creme-2/40 text-[0.72rem]">&#9835; {conteudo.reelScript.musica} &middot; {conteudo.reelScript.duracao}</p>
                  )}
                </div>
                <div className="mt-2">
                  <CopyButton
                    text={[
                      conteudo.reelScript.gancho,
                      '',
                      ...conteudo.reelScript.corpo,
                      '',
                      conteudo.reelScript.cta,
                    ].join('\n')}
                    label="copiar script"
                  />
                </div>
              </div>
            )}

            {/* Musica sugerida (citacao-visual ou reels) */}
            {(conteudo.musicaSugerida || conteudo.reelScript?.musica) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-rosa/15 border border-rosa/30 flex items-center justify-center text-rosa text-[0.65rem]">&#9835;</span>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Musica sugerida (Metricool/Instagram)</p>
                </div>
                <div className="bg-terra-2/40 rounded-[12px] p-4 border border-rosa/15">
                  <p className="text-creme text-[0.82rem] leading-relaxed mb-2">
                    {conteudo.musicaSugerida ?? conteudo.reelScript?.musica}
                  </p>
                  <p className="text-creme-2/50 text-[0.68rem] italic">
                    TikTok Auto Music sera activado automaticamente no CSV. Para Instagram Reels, adiciona no Metricool ao agendar (procura por &quot;trending&quot; com este vibe).
                  </p>
                </div>
              </div>
            )}

            {/* Textos dos slides */}
            {temSlides && conteudo.slides && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-creme-2/10 border border-creme-2/20 flex items-center justify-center text-creme-2/60 text-[0.65rem] font-serif">i</span>
                  <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Textos dos slides (referencia)</p>
                </div>
                <div className="space-y-2">
                  {conteudo.slides.map((s, i) => (
                    <div key={i} className="bg-terra-2/40 rounded-[10px] p-3 border border-ocre/10 group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[0.55rem] tracking-[0.15em] uppercase text-ocre/50">
                          Slide {i + 1} &middot; {s.tipo}{s.titulo ? ` &middot; ${s.titulo}` : ''}
                        </p>
                        <CopyButton text={s.texto} label="copiar" />
                      </div>
                      <p className="text-creme-2/75 text-[0.78rem] leading-relaxed whitespace-pre-line">{s.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-creme-2/10 border border-creme-2/20 flex items-center justify-center text-creme-2/60 text-[0.65rem] font-serif">i</span>
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/60">Hashtags</p>
                <CopyButton text={conteudo.hashtags.join(' ')} label="copiar" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conteudo.hashtags.map((h) => (
                  <span key={h} className="text-[0.68rem] px-2 py-1 rounded-md bg-terra-2/50 text-ocre/70">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini slide preview (calendar grid) ─────────────────

function MiniSlidePreview({ conteudo }: { conteudo: ConteudoDia }) {
  const p = PALETAS[conteudo.mundo];
  const firstSlide = conteudo.slides?.[0];

  if (conteudo.reelScript) {
    return (
      <div
        className="w-full rounded-[8px] overflow-hidden flex items-end p-2 relative"
        style={{
          aspectRatio: '9/16',
          maxHeight: 80,
          background: `linear-gradient(160deg, ${p.bg2}, ${p.bg})`,
        }}
      >
        <p className="text-[0.45rem] leading-tight line-clamp-3 relative z-10" style={{ color: p.texto + 'cc' }}>
          {conteudo.reelScript.gancho}
        </p>
      </div>
    );
  }

  if (firstSlide) {
    return (
      <div
        className="w-full rounded-[8px] overflow-hidden flex items-center justify-center p-2 text-center relative"
        style={{
          aspectRatio: '1/1',
          maxHeight: 60,
          background: `linear-gradient(160deg, ${p.bg}, ${p.bg2})`,
        }}
      >
        <p className="text-[0.42rem] leading-tight line-clamp-3 font-serif relative z-10" style={{ color: p.texto + 'cc' }}>
          {firstSlide.texto}
        </p>
      </div>
    );
  }

  return null;
}

// ─── Slides filmstrip (all slides at a glance) ─────────

function SlidesFilmstrip({ conteudo, onClickSlide }: { conteudo: ConteudoDia; onClickSlide: () => void }) {
  const slides = conteudo.slides ?? [];
  if (slides.length === 0) return null;

  return (
    <div className="flex gap-1 overflow-x-auto py-1">
      {slides.map((s, i) => {
        const p = PALETAS[conteudo.mundo];
        return (
          <button
            key={i}
            onClick={onClickSlide}
            className="shrink-0 w-8 h-8 rounded-[4px] overflow-hidden flex items-center justify-center text-[0.3rem] text-center hover:ring-1 ring-ambar/50 transition-all"
            style={{
              background: s.tipo === 'capa'
                ? `linear-gradient(160deg, ${p.bg}, ${p.bg2})`
                : s.tipo === 'citacao'
                ? `linear-gradient(160deg, ${p.bg2}, ${p.bg})`
                : s.tipo === 'cta'
                ? `linear-gradient(160deg, ${p.bg}, ${p.destaque}15)`
                : p.bg2,
              color: p.texto + '88',
            }}
          >
            {s.tipo === 'capa' ? 'C' : s.tipo === 'cta' ? '↗' : s.tipo === 'citacao' ? '"' : i}
          </button>
        );
      })}
    </div>
  );
}

// ─── Diagnostico panel ──────────────────────────────────

type DiagProvider = 'claude' | 'replicate' | 'supabase';
type DiagResult = { ok: boolean; latencyMs?: number; raw?: unknown; testing: boolean; lastClick?: number };

function DiagnosticoPanel() {
  const [resultados, setResultados] = useState<Record<DiagProvider, DiagResult>>({
    claude: { ok: false, testing: false },
    replicate: { ok: false, testing: false },
    supabase: { ok: false, testing: false },
  });

  async function testar(provider: DiagProvider) {
    const last = resultados[provider].lastClick;
    if (last && Date.now() - last < 5000) return; // debounce 5s
    setResultados(prev => ({ ...prev, [provider]: { ...prev[provider], testing: true, lastClick: Date.now() } }));
    try {
      const res = await fetch(`/api/admin/test-${provider}`);
      const json = await res.json();
      setResultados(prev => ({ ...prev, [provider]: { ok: !!json.ok, latencyMs: json.latencyMs, raw: json, testing: false, lastClick: Date.now() } }));
    } catch (e) {
      setResultados(prev => ({ ...prev, [provider]: { ok: false, raw: { erro: String(e) }, testing: false, lastClick: Date.now() } }));
    }
  }

  return (
    <section className="border border-ocre/15 rounded-[14px] p-4 mb-6 bg-terra-2/20">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70">Diagnostico</p>
        <p className="text-[0.6rem] text-creme-2/40 ml-2">Testa as ligacoes antes de gerar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['claude', 'replicate', 'supabase'] as const).map(p => {
          const r = resultados[p];
          const dotColor = r.testing ? 'bg-lila animate-pulse' : r.ok ? 'bg-ambar' : r.raw ? 'bg-rosa' : 'bg-creme-2/20';
          return (
            <div key={p} className="border border-ocre/10 rounded-[10px] p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                <p className="text-[0.78rem] text-creme">{p}</p>
                {r.latencyMs && <span className="text-[0.6rem] text-creme-2/40 ml-auto">{r.latencyMs}ms</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => testar(p)}
                  disabled={r.testing}
                  className="text-[0.62rem] px-2.5 py-1 rounded-md border border-ocre/30 text-ocre/80 hover:border-ambar hover:text-ambar disabled:opacity-40 transition-colors"
                >
                  {r.testing ? '...' : 'testar'}
                </button>
                {r.raw != null && (
                  <CopyButton text={JSON.stringify(r.raw, null, 2)} label="copiar JSON" />
                )}
              </div>
              {!r.ok && r.raw != null && typeof (r.raw as { erro?: string }).erro === 'string' && (
                <p className="text-[0.6rem] text-rosa mt-1.5">{(r.raw as { erro: string }).erro}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Main page ──────────────────────────────────────────

type Vista = 'calendario' | 'lista' | 'tipos';
type FiltroMundo = Mundo | 'todos';

// ─── Phase header (visual divider with number) ──────────

function PhaseHeader({ num, titulo, descricao, status, action }: {
  num: number;
  titulo: string;
  descricao?: string;
  status?: 'pendente' | 'em-curso' | 'completo';
  action?: React.ReactNode;
}) {
  const statusColor = status === 'completo' ? 'text-ambar' : status === 'em-curso' ? 'text-lila' : 'text-creme-2/40';
  const statusLabel = status === 'completo' ? '✓ completo' : status === 'em-curso' ? 'em curso' : '';
  return (
    <div className="flex items-center gap-3 mb-4 mt-10 first:mt-0">
      <div className="w-8 h-8 rounded-full border border-ambar/40 bg-ambar/8 flex items-center justify-center shrink-0">
        <span className="font-serif text-ambar text-[0.95rem]">{num}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-serif font-light text-creme text-[1.15rem] leading-tight">
          {titulo}
        </h2>
        {descricao && <p className="text-creme-2/50 text-[0.72rem] mt-0.5">{descricao}</p>}
      </div>
      {status && statusLabel && (
        <span className={`text-[0.62rem] tracking-[0.12em] uppercase ${statusColor}`}>
          {statusLabel}
        </span>
      )}
      {action}
    </div>
  );
}

function Collapsible({ title, defaultOpen = false, children }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-ocre/15 rounded-[14px] mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-terra-2/20 transition-colors"
      >
        <span className="text-[0.78rem] text-creme-2/80 tracking-[0.04em]">{title}</span>
        <span className="text-creme-2/50 text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

export default function EstudioPage() {
  const [selecionado, setSelecionado] = useState<ConteudoDia | null>(null);
  const [vista, setVista] = useState<Vista>('calendario');
  const [filtroMundo, setFiltroMundo] = useState<FiltroMundo>('todos');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const conteudosFiltrados = filtroMundo === 'todos'
    ? CALENDARIO_30_DIAS
    : CALENDARIO_30_DIAS.filter(c => c.mundo === filtroMundo);

  const semanas: ConteudoDia[][] = [];
  for (let i = 0; i < 30; i += 7) {
    semanas.push(CALENDARIO_30_DIAS.slice(i, i + 7));
  }

  const estatisticas = {
    total: CALENDARIO_30_DIAS.length,
    carrosseis: CALENDARIO_30_DIAS.filter(c => c.tipo.startsWith('carrossel')).length,
    reels: CALENDARIO_30_DIAS.filter(c => c.tipo.startsWith('reel')).length,
    citacoes: CALENDARIO_30_DIAS.filter(c => c.tipo === 'citacao-visual').length,
    ambas: CALENDARIO_30_DIAS.filter(c => c.plataforma === 'ambas').length,
    soInsta: CALENDARIO_30_DIAS.filter(c => c.plataforma === 'instagram').length,
  };

  const porMundo: Record<string, number> = {};
  for (const c of CALENDARIO_30_DIAS) {
    porMundo[c.mundo] = (porMundo[c.mundo] ?? 0) + 1;
  }

  const porTipo: Record<string, ConteudoDia[]> = {};
  for (const c of conteudosFiltrados) {
    if (!porTipo[c.tipo]) porTipo[c.tipo] = [];
    porTipo[c.tipo].push(c);
  }

  return (
    <main className="max-w-[1200px] mx-auto px-7 py-12">
      {/* Header */}
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl mb-2">Estudio de Conteudo</h1>
        <p className="text-creme-2/60 text-[0.88rem]">
          Calendario de 30 dias &middot; Instagram + TikTok &middot; Carrosseis, Reels e Citacoes
        </p>
      </header>

      {/* ═══ FASE 1: DIAGNOSTICO ═══ */}
      <PhaseHeader
        num={1}
        titulo="Diagnostico"
        descricao="Testa as ligacoes antes de produzir. Faz isto uma vez por sessao."
      />
      <DiagnosticoPanel />

      {/* ═══ FASE 2: PLANEAR ═══ */}
      <PhaseHeader
        num={2}
        titulo="Planear"
        descricao="Visao geral do calendario. Filtra por mundo e vista."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { val: estatisticas.total, label: 'conteudos' },
          { val: estatisticas.carrosseis, label: 'carrosseis' },
          { val: estatisticas.reels, label: 'reels' },
          { val: estatisticas.citacoes, label: 'citacoes' },
          { val: estatisticas.ambas, label: 'insta+tiktok' },
          { val: estatisticas.soInsta, label: 'so instagram' },
        ].map(s => (
          <div key={s.label} className="border border-ocre/20 rounded-[14px] p-4 text-center">
            <p className="text-ambar text-2xl font-serif">{s.val}</p>
            <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/50 mr-2">Mundo:</p>
        {(['todos', 'freeme', 'infonte', 'synchim', 'escola', 'autora'] as const).map(m => (
          <button
            key={m}
            onClick={() => setFiltroMundo(m)}
            className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-[0.08em] border transition-colors ${
              filtroMundo === m
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/25 text-creme-2/60 hover:border-ocre/50 hover:text-creme-2/80'
            }`}
          >
            {m === 'todos' ? 'todos' : PALETAS[m].nome}
            {m !== 'todos' && (
              <span className="ml-1.5 text-[0.6rem] opacity-60">{porMundo[m] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-8">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/50 mr-2">Vista:</p>
        {([
          { id: 'calendario' as Vista, label: 'Calendario' },
          { id: 'lista' as Vista, label: 'Lista' },
          { id: 'tipos' as Vista, label: 'Por Tipo' },
        ]).map(v => (
          <button
            key={v.id}
            onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-[0.08em] border transition-colors ${
              vista === v.id
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/25 text-creme-2/60 hover:border-ocre/50'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ═══ FASE 3: PRODUZIR ═══ */}
      <PhaseHeader
        num={3}
        titulo="Produzir"
        descricao="Gera imagens em massa (bulk) ou clica num dia para detalhe individual."
      />

      <BulkProducaoPanel />

      {/* CALENDAR VIEW */}
      {vista === 'calendario' && (
        <div className="space-y-6">
          {semanas.map((semana, si) => (
            <div key={si}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-serif font-light text-creme text-lg">Semana {si + 1}</h3>
                <div className="flex-1 h-px bg-ocre/15" />
                <span className="text-[0.65rem] tracking-[0.14em] uppercase text-ocre/50">
                  Dias {si * 7 + 1}&ndash;{Math.min((si + 1) * 7, 30)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {semana.map(c => {
                  const tipo = TIPO_LABELS[c.tipo];
                  const pal = PALETAS[c.mundo];
                  const isFiltered = filtroMundo !== 'todos' && c.mundo !== filtroMundo;

                  return (
                    <button
                      key={c.dia}
                      onClick={() => setSelecionado(c)}
                      className={`text-left rounded-[14px] border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                        isFiltered ? 'opacity-20 pointer-events-none' : ''
                      }`}
                      style={{
                        borderColor: pal.destaque + '30',
                        background: `linear-gradient(160deg, ${pal.bg}22, transparent)`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[0.65rem] font-medium" style={{ color: pal.destaque }}>
                          Dia {c.dia}
                        </span>
                        <span className="text-xs">{tipo.emoji}</span>
                      </div>
                      <MiniSlidePreview conteudo={c} />
                      <p className="font-serif text-creme text-[0.72rem] leading-tight mt-2 line-clamp-2">
                        {c.titulo}
                      </p>
                      <SlidesFilmstrip conteudo={c} onClickSlide={() => setSelecionado(c)} />
                      <p className="text-[0.55rem] tracking-[0.1em] uppercase mt-1.5" style={{ color: tipo.cor + 'aa' }}>
                        {tipo.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[0.5rem] text-creme-2/40">{c.horario}</span>
                        <span className="text-[0.5rem] text-creme-2/30">&middot;</span>
                        <span className="text-[0.5rem] text-creme-2/40">
                          {c.plataforma === 'ambas' ? 'IG+TT' : c.plataforma === 'instagram' ? 'IG' : 'TT'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {vista === 'lista' && (
        <div className="space-y-2">
          {conteudosFiltrados.map(c => {
            const tipo = TIPO_LABELS[c.tipo];
            const pal = PALETAS[c.mundo];
            return (
              <button
                key={c.dia}
                onClick={() => setSelecionado(c)}
                className="w-full text-left flex items-center gap-4 py-3 px-4 rounded-[12px] border border-ocre/10 hover:border-ocre/30 transition-colors group"
                style={{ background: `linear-gradient(90deg, ${pal.bg}11, transparent)` }}
              >
                <span className="text-ambar font-serif text-lg w-8 text-center shrink-0">
                  {c.dia}
                </span>
                <span className="text-lg shrink-0">{tipo.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-creme text-[0.92rem] group-hover:text-ambar transition-colors truncate">
                    {c.titulo}
                  </p>
                  <p className="text-creme-2/50 text-[0.72rem] truncate">{c.descricao}</p>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <SlidesFilmstrip conteudo={c} onClickSlide={() => setSelecionado(c)} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.6rem] tracking-[0.12em] uppercase" style={{ color: tipo.cor }}>
                    {tipo.label}
                  </p>
                  <p className="text-[0.6rem] text-creme-2/40">
                    {c.horario} &middot; {pal.nome}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* BY-TYPE VIEW */}
      {vista === 'tipos' && (
        <div className="space-y-10">
          {Object.entries(porTipo).map(([tipoKey, items]) => {
            const tipo = TIPO_LABELS[tipoKey as keyof typeof TIPO_LABELS];
            return (
              <section key={tipoKey}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{tipo.emoji}</span>
                  <h3 className="font-serif font-light text-creme text-xl">{tipo.label}</h3>
                  <div className="flex-1 h-px bg-ocre/15" />
                  <span className="text-[0.65rem] tracking-[0.14em] uppercase" style={{ color: tipo.cor }}>
                    {items.length} posts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(c => {
                    const pal = PALETAS[c.mundo];
                    return (
                      <button
                        key={c.dia}
                        onClick={() => setSelecionado(c)}
                        className="text-left rounded-[14px] border p-4 transition-all hover:-translate-y-0.5 group"
                        style={{ borderColor: pal.destaque + '25', background: `linear-gradient(160deg, ${pal.bg}18, transparent)` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[0.65rem] font-medium" style={{ color: pal.destaque }}>
                            Dia {c.dia} &middot; {pal.nome}
                          </span>
                          <span className="text-[0.6rem] text-creme-2/40">{c.horario}</span>
                        </div>
                        <p className="font-serif text-creme text-[0.92rem] leading-tight group-hover:text-ambar transition-colors mb-1.5">
                          {c.titulo}
                        </p>
                        <p className="text-creme-2/50 text-[0.72rem] line-clamp-2 mb-2">{c.descricao}</p>
                        <SlidesFilmstrip conteudo={c} onClickSlide={() => setSelecionado(c)} />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ═══ FASE 4: EXPORTAR ═══ */}
      <PhaseHeader
        num={4}
        titulo="Exportar"
        descricao="Renderiza PNGs finais, exporta CSV para o Metricool e captions."
      />

      <BulkRenderPanel />

      <div className="flex items-center gap-3 mb-10 flex-wrap p-4 rounded-[14px] border border-ocre/15 bg-terra-2/20">
        <div className="flex items-center gap-2">
          <label className="text-[0.68rem] text-creme-2/50">Data inicio:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border border-ocre/30 rounded-[8px] px-2 py-1 text-[0.72rem] text-creme outline-none focus:border-ambar"
          />
        </div>
        <button
          onClick={() => {
            const csv = gerarMetricoolCSV(CALENDARIO_30_DIAS, startDate);
            downloadFile(csv, `metricool-30dias-${startDate}.csv`, 'text/csv');
          }}
          className="text-[0.72rem] px-4 py-2 rounded-[10px] border border-ambar/40 text-ambar hover:bg-ambar/10 transition-colors"
        >
          CSV Metricool
        </button>
        <button
          onClick={() => {
            const txt = gerarResumoTexto(CALENDARIO_30_DIAS);
            downloadFile(txt, `calendario-30dias-${startDate}.txt`);
          }}
          className="text-[0.72rem] px-4 py-2 rounded-[10px] border border-ocre/30 text-creme-2/70 hover:border-ambar hover:text-ambar transition-colors"
        >
          Resumo TXT
        </button>
        <button
          onClick={() => {
            const captions = CALENDARIO_30_DIAS.map(c => {
              const ig = gerarCaptionInstagram(c);
              const tt = gerarCaptionTikTok(c);
              return `${'='.repeat(50)}\nDIA ${c.dia}: ${c.titulo}\n${'='.repeat(50)}\n\n--- INSTAGRAM ---\n${ig}\n\n--- TIKTOK ---\n${tt}\n`;
            }).join('\n\n');
            downloadFile(captions, `captions-30dias.txt`);
          }}
          className="text-[0.72rem] px-4 py-2 rounded-[10px] border border-ocre/30 text-creme-2/70 hover:border-ambar hover:text-ambar transition-colors"
        >
          Todas as Captions
        </button>
      </div>

      {/* Limpeza local (apos testes) */}
      <div className="flex items-center gap-3 mb-10 flex-wrap p-3 rounded-[12px] border border-ocre/10 bg-terra-2/10">
        <p className="text-[0.6rem] tracking-[0.15em] uppercase text-creme-2/40 mr-1">Limpeza local:</p>
        <Btn
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (!confirm('Apagar todas as imagens em cache local (IndexedDB)? As imagens no Supabase ficam.')) return;
            try {
              indexedDB.deleteDatabase('estudio-imagens');
              alert('Cache local apagada. Recarrega a pagina.');
            } catch (e) {
              alert('Erro: ' + e);
            }
          }}
        >
          apagar cache IndexedDB
        </Btn>
        <span className="text-[0.6rem] text-creme-2/30 italic">
          util apos testes — limpa apenas o browser, nao o Supabase
        </span>
      </div>

      {/* ═══ MANUAL (colapsivel, opcional) ═══ */}
      <PhaseHeader
        num={5}
        titulo="Manual"
        descricao="Referencias, estrategia e paletas. So precisas de consultar uma vez."
      />

      <Collapsible title="Estrategia de Conteudo">
      <section className="border-0">
        <h2 className="font-serif font-light text-creme text-xl mb-4 hidden">Estrategia de Conteudo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[0.85rem] text-creme-2/80 leading-relaxed">
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Ritmo Semanal</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Seg+Sab:</span> Carrossel educativo (autoridade)</li>
              <li><span className="text-ocre">Ter+Qui:</span> Reel gancho + Carrossel dica (alcance + valor)</li>
              <li><span className="text-ocre">Qua:</span> Citacao visual (saves + partilhas)</li>
              <li><span className="text-ocre">Sex:</span> Reel bastidores (conexao pessoal)</li>
              <li><span className="text-ocre">Dom:</span> Carrossel produto (conversao suave)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Principios</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Gancho forte:</span> 3 primeiros segundos decidem tudo</li>
              <li><span className="text-ocre">Formato didactico:</span> explicar sem ser academico</li>
              <li><span className="text-ocre">CTA suave:</span> nunca vender, sempre oferecer</li>
              <li><span className="text-ocre">Autenticidade:</span> partilhar a jornada, nao so o resultado</li>
              <li><span className="text-ocre">Consistencia:</span> mesmo horario, mesma paleta, mesma voz</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Tendencias Redes 2026</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Carrosseis:</span> formato com mais saves e partilhas no IG</li>
              <li><span className="text-ocre">Reels curtos:</span> 15-30s com gancho nos 3s</li>
              <li><span className="text-ocre">Texto no ecra:</span> 80% ve sem som, legendas obrigatorias</li>
              <li><span className="text-ocre">Vulnerabilidade:</span> conteudo pessoal supera polido</li>
              <li><span className="text-ocre">Micro-nicho:</span> terapia + maternidade + sistemica</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Paletas por Mundo</h3>
            <div className="space-y-2">
              {Object.entries(PALETAS).map(([key, pal]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded" style={{ background: pal.bg }} />
                    <div className="w-5 h-5 rounded" style={{ background: pal.bg2 }} />
                    <div className="w-5 h-5 rounded" style={{ background: pal.destaque }} />
                  </div>
                  <span className="text-creme-2/70 text-[0.78rem]">{pal.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </Collapsible>

      <Collapsible title="Referencias e Competicao">
      <section className="border-0">
        <h2 className="font-serif font-light text-creme text-xl mb-4 hidden">Referencias e Competicao</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[0.85rem] text-creme-2/80 leading-relaxed">
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">O que funciona no nicho</h3>
            <ul className="space-y-1.5">
              <li>Carrosseis com frases curtas + fundo escuro</li>
              <li>Reels a falar directamente para a camara</li>
              <li>Conteudo &ldquo;eu tambem senti isto&rdquo; (identificacao)</li>
              <li>Exercicios praticos com resultado imediato</li>
              <li>Citacoes sobre fundo texturado (nao Canva generico)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Design diferenciador</h3>
            <ul className="space-y-1.5">
              <li>Paleta terra/organica (vs. tons pastel genericos)</li>
              <li>Tipografia Fraunces (serif elegante, nunca Canva)</li>
              <li>Pouco texto por slide (maximo 5-6 linhas)</li>
              <li>Espaco negativo generoso</li>
              <li>Sem emojis excessivos nos slides</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Ganchos que convertem</h3>
            <ul className="space-y-1.5">
              <li>&ldquo;Tu sabes do que estou a falar.&rdquo;</li>
              <li>&ldquo;Ninguem te disse isto mas...&rdquo;</li>
              <li>&ldquo;Se sentes X, isto e para ti.&rdquo;</li>
              <li>&ldquo;3 sinais de que...&rdquo; (lista)</li>
              <li>Pergunta directa ao publico</li>
            </ul>
          </div>
        </div>
      </section>
      </Collapsible>

      {/* Detail modal */}
      {selecionado && (
        <DetalheConteudo
          conteudo={selecionado}
          onFechar={() => setSelecionado(null)}
          posicao={(() => {
            const idx = conteudosFiltrados.findIndex(c => c.dia === selecionado.dia);
            return { actual: idx + 1, total: conteudosFiltrados.length };
          })()}
          onPrev={(() => {
            const idx = conteudosFiltrados.findIndex(c => c.dia === selecionado.dia);
            if (idx <= 0) return undefined;
            return () => setSelecionado(conteudosFiltrados[idx - 1]);
          })()}
          onNext={(() => {
            const idx = conteudosFiltrados.findIndex(c => c.dia === selecionado.dia);
            if (idx === -1 || idx >= conteudosFiltrados.length - 1) return undefined;
            return () => setSelecionado(conteudosFiltrados[idx + 1]);
          })()}
        />
      )}
    </main>
  );
}
