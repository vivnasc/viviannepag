'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { CALENDARIO_ANUAL } from '@/lib/carrossel/calendario';
import { PALETAS_UNIVERSO } from '@/lib/carrossel/paletas';
import { getColecao, type ColecaoId } from '@/lib/colecoes';
import { VeuSlide } from '@/components/admin/VeuSlide';
import { Btn, Card, Pill } from '@/components/admin/EstudioKit';
import { gerarCaptionInstagram, gerarMetricoolCSV } from '@/lib/estudio-export';
import { TIPO_LABELS, PALETAS, type ConteudoDia, type Mundo } from '@/lib/estudio-conteudo';

// Fontes do spec dos 7 Veus
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type Jornada = { entrada?: string; aprofundar?: string; complemento?: string; fio?: string };
type VeuDia = ConteudoDia & { diaSemana?: string; palavra?: string; subtitulo?: string; faixa?: { titulo: string; url?: string } };
type Coleccao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: VeuDia[];
  theme: { mundo: Mundo; universo: ColecaoId; semana?: number | null; territorio?: string; estacao?: string; musica?: string; jornada?: Jornada | null };
  created_at: string;
};

function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CarrosselPage() {
  const [coleccoes, setColeccoes] = useState<Coleccao[]>([]);
  const [gerando, setGerando] = useState<number | null>(null);
  const [sel, setSel] = useState<Coleccao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ dia: VeuDia; index: number } | null>(null);
  const [imgProg, setImgProg] = useState<{ done: number; total: number } | null>(null);

  const zoomSlides = zoom?.dia.slides ?? [];
  const navZoom = useCallback((delta: number) => {
    setZoom((z) => {
      if (!z) return z;
      const total = z.dia.slides?.length ?? 0;
      if (!total) return z;
      return { ...z, index: (z.index + delta + total) % total };
    });
  }, []);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navZoom(1);
      else if (e.key === 'ArrowLeft') navZoom(-1);
      else if (e.key === 'Escape') setZoom(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, navZoom]);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/carrossel/list');
    if (r.ok) setColeccoes((await r.json()).coleccoes ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const colDaSemana = (semana: number) => coleccoes.find((c) => c.theme?.semana === semana);

  async function gerar(semana: number) {
    setGerando(semana); setErro(null);
    try {
      const r = await fetch('/api/admin/carrossel/gerar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ semana }),
      });
      const j = await r.json();
      if (!r.ok) { setErro(j.erro + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      await carregar();
      if (j.coleccao) setSel(j.coleccao);
    } catch (e) { setErro(String(e)); }
    finally { setGerando(null); }
  }

  function exportarMetricool(c: Coleccao) {
    const csv = gerarMetricoolCSV(c.dias, new Date().toISOString().slice(0, 10));
    downloadFile(csv, `${c.slug}-metricool.csv`, 'text/csv');
  }

  // Gera as imagens editoriais (capa + fecho de cada dia) reutilizando o motor
  // Flux existente, guarda os URLs na coleccao e mostra-os nos slides.
  async function gerarImagens(c: Coleccao) {
    const alvos: { di: number; si: number }[] = [];
    c.dias.forEach((d, di) => (d.slides ?? []).forEach((s, si) => {
      if (s.tipo === 'capa' || s.tipo === 'cta') alvos.push({ di, si });
    }));
    if (!alvos.length) return;
    setErro(null);
    setImgProg({ done: 0, total: alvos.length });
    const dias = c.dias.map((d) => ({ ...d, slides: (d.slides ?? []).map((s) => ({ ...s })) }));
    let done = 0;
    for (const a of alvos) {
      const d = dias[a.di];
      const s = d.slides![a.si] as { tipo: string; texto?: string; notaVisual?: string; imageUrl?: string };
      try {
        const r = await fetch('/api/admin/estudio/gerar-imagem', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            texto: s.texto || d.palavra || c.title,
            mundo: d.mundo,
            tipo: s.tipo,
            promptCustom: s.notaVisual || `editorial boho still life evoking "${d.palavra ?? ''}", warm contemplative atmosphere, no text, no people`,
            aspectRatio: '9:16',
            slideKey: `carrossel-${c.slug}-d${d.dia}-s${a.si}`,
          }),
        });
        const j = await r.json();
        if (j.imageUrl) s.imageUrl = j.imageUrl;
      } catch { /* continua */ }
      done++;
      setImgProg({ done, total: alvos.length });
      setSel((prev) => (prev && prev.slug === c.slug ? { ...prev, dias } : prev));
    }
    try {
      await fetch('/api/admin/carrossel/imagens', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: c.slug, dias }),
      });
      await carregar();
    } catch { /* ignore */ }
    setImgProg(null);
  }

  // ── Detalhe de uma coleccao ──
  if (sel) {
    const jornada = sel.theme?.jornada;
    return (
      <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
        {zoom && zoomSlides[zoom.index] && (
          <div
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-50 flex items-center justify-center gap-3 sm:gap-6 bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <button
              onClick={(e) => { e.stopPropagation(); navZoom(-1); }}
              className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-[#F2E8DC] text-xl flex items-center justify-center hover:bg-white/10"
              aria-label="anterior"
            >‹</button>
            <div className="w-full" style={{ maxWidth: 'min(80vw, 460px)' }} onClick={(e) => e.stopPropagation()}>
              <VeuSlide
                slide={zoomSlides[zoom.index]}
                mundo={zoom.dia.mundo}
                palavra={zoom.dia.palavra}
                subtitulo={zoom.dia.subtitulo}
                imageUrl={(zoomSlides[zoom.index] as { imageUrl?: string }).imageUrl}
                numeroDia={zoom.dia.dia}
                slideIndex={zoom.index + 1}
                slideTotal={zoomSlides.length}
              />
              <p className="text-center text-[0.7rem] opacity-70 mt-3">{zoom.index + 1} / {zoomSlides.length} · {zoom.dia.diaSemana ?? `dia ${zoom.dia.dia}`} · toca fora para fechar</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navZoom(1); }}
              className="shrink-0 w-11 h-11 rounded-full border border-white/20 text-[#F2E8DC] text-xl flex items-center justify-center hover:bg-white/10"
              aria-label="seguinte"
            >›</button>
          </div>
        )}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setSel(null)} className="text-[0.7rem] tracking-wide opacity-70 hover:opacity-100">← voltar à grelha</button>
            <div className="flex items-center gap-2">
              {imgProg
                ? <span className="text-[0.7rem] opacity-70">a gerar imagens… {imgProg.done}/{imgProg.total}</span>
                : <Btn variant="default" onClick={() => gerarImagens(sel)}>gerar imagens (capa+fecho)</Btn>}
              <Btn variant="primary" onClick={() => exportarMetricool(sel)}>exportar Metricool (CSV)</Btn>
            </div>
          </div>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] opacity-50 mb-1">Território da semana</p>
          <h1 className="text-2xl font-serif italic mb-2">{sel.theme?.territorio ?? sel.title}</h1>
          <p className="text-[0.72rem] opacity-55 mb-4">{getColecao(sel.theme.universo).nome} · {sel.theme?.estacao ?? ''} {sel.theme?.musica ? `· ♪ ${sel.theme.musica}` : ''}</p>

          {jornada && (jornada.entrada || jornada.fio) && (
            <Card className="mb-6 p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] opacity-60 mb-2">Jornada de loja</p>
              {jornada.fio && <p className="text-[0.85rem] mb-2 italic">{jornada.fio}</p>}
              <div className="flex flex-wrap gap-2 text-[0.7rem]">
                {jornada.entrada && <Pill variant="feito">entrada · {jornada.entrada}</Pill>}
                {jornada.aprofundar && <Pill variant="info">aprofunda · {jornada.aprofundar}</Pill>}
                {jornada.complemento && <Pill variant="aviso">complemento · {jornada.complemento}</Pill>}
              </div>
            </Card>
          )}

          <div className="space-y-8">
            {sel.dias.map((dia) => {
              const tl = TIPO_LABELS[dia.tipo];
              return (
                <Card key={dia.dia} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill variant="info">{dia.diaSemana ?? `Dia ${dia.dia}`}</Pill>
                    {dia.palavra && <span className="font-serif tracking-[0.12em]" style={{ color: PALETAS[dia.mundo].destaque }}>{dia.palavra}</span>}
                    {dia.produtoRelacionado && <Pill variant="feito">→ {dia.produtoRelacionado}</Pill>}
                  </div>
                  {dia.subtitulo && <p className="text-[0.82rem] italic opacity-75 mb-1">{dia.subtitulo}</p>}
                  {dia.faixa?.titulo && <p className="text-[0.68rem] opacity-45 mb-3">♪ Ancient Ground · {dia.faixa.titulo}{dia.faixa.url ? '' : ' (sem url)'}</p>}

                  {dia.slides && dia.slides.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {dia.slides.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setZoom({ dia, index: i })}
                          className="block w-full cursor-zoom-in transition-transform hover:scale-[1.02]"
                          title="ver em tamanho real"
                        >
                          <VeuSlide slide={s} mundo={dia.mundo} palavra={dia.palavra} subtitulo={dia.subtitulo} imageUrl={(s as { imageUrl?: string }).imageUrl} numeroDia={dia.dia} slideIndex={i + 1} slideTotal={dia.slides!.length} />
                        </button>
                      ))}
                    </div>
                  )}

                  {dia.reelScript && (
                    <div className="text-[0.78rem] leading-relaxed bg-black/20 rounded-lg p-3 mb-3">
                      <p className="font-medium mb-1">🎬 {dia.reelScript.gancho}</p>
                      {dia.reelScript.corpo.map((l, i) => <p key={i} className="opacity-85">{l}</p>)}
                      <p className="mt-1 text-[#EBAE4A]">{dia.reelScript.cta}</p>
                      <p className="opacity-50 mt-1">{dia.reelScript.musica} · {dia.reelScript.duracao}</p>
                    </div>
                  )}

                  <details className="text-[0.75rem]">
                    <summary className="cursor-pointer opacity-70">caption Instagram</summary>
                    <pre className="whitespace-pre-wrap mt-2 opacity-90">{gerarCaptionInstagram(dia)}</pre>
                  </details>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Grelha das 52 semanas ──
  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Carrosséis Semanais</h1>
          <Link href="/admin/estudio" className="text-[0.7rem] opacity-60 hover:opacity-100">Estúdio →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-6">Calendário temático de 52 semanas. Cada semana gera uma jornada de carrosséis que combina produtos do teu ecossistema.</p>
        {erro && <div className="mb-4 text-[0.75rem] text-red-300 bg-red-950/40 rounded-lg p-3">{erro}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CALENDARIO_ANUAL.map((w) => {
            const col = colDaSemana(w.semana);
            const pal = PALETAS_UNIVERSO[w.universo];
            const p = PALETAS[pal.mundo];
            return (
              <div key={w.semana} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.bg}22, ${p.bg2}55)` }}>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.6rem] uppercase tracking-[0.15em] opacity-60">Sem. {w.semana} · {w.mes} · {w.estacao}</span>
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: p.destaque + '33', color: p.destaque }}>{getColecao(w.universo).nome}</span>
                  </div>
                  <p className="text-[0.55rem] uppercase tracking-[0.25em] opacity-45 mb-0.5">Território</p>
                  <h3 className="text-base font-serif italic leading-snug mb-1" style={{ color: p.destaque }}>{w.tema}</h3>
                  <p className="text-[0.7rem] italic opacity-70 leading-snug mb-2">{w.subtitulo}</p>
                  <p className="text-[0.6rem] opacity-40 leading-snug mb-3">7 carrosséis · 6 slides · ♪ {w.musica}</p>
                  <div className="flex items-center gap-2">
                    {col ? (
                      <>
                        <Btn variant="primary" size="sm" onClick={() => setSel(col)}>ver ({col.dias.length} dias)</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => gerar(w.semana)} disabled={gerando !== null}>
                          {gerando === w.semana ? '…' : 'regerar'}
                        </Btn>
                      </>
                    ) : (
                      <Btn variant="primary" size="sm" onClick={() => gerar(w.semana)} disabled={gerando !== null}>
                        {gerando === w.semana ? 'a gerar…' : 'gerar'}
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
