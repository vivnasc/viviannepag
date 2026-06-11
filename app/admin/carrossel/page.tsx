'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { CALENDARIO_ANUAL, intervaloDatas, semanaAtual } from '@/lib/carrossel/calendario';
import { faixaParaCarrossel } from '@/lib/carrossel/musica';
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
type VeuDia = ConteudoDia & { diaSemana?: string; palavra?: string; subtitulo?: string; faixa?: { titulo: string; url?: string }; videoUrl?: string; imagens?: string[] };
type Coleccao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: VeuDia[];
  theme: { mundo: Mundo; universo: ColecaoId; semana?: number | null; territorio?: string; estacao?: string; musica?: string; jornada?: Jornada | null; historico?: Array<{ dias: unknown; em: string }> };
  created_at: string;
};

function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Redimensiona qualquer imagem para 1080x1920 JPEG (cover) — fica leve e passa
// sempre no upload, e fica na proporcao do slide.
function resizeToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = 1080, H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas')); return; }
      const s = Math.max(W / img.width, H / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.9);
    };
    img.onerror = () => reject(new Error('img'));
    img.src = URL.createObjectURL(file);
  });
}

function proximaSegunda(): string {
  const d = new Date();
  const day = d.getDay(); // 0 Dom .. 6 Sab
  const diff = day === 1 ? 0 : ((8 - day) % 7) || 7; // próxima segunda >= hoje
  d.setDate(d.getDate() + diff);
  // data LOCAL (não toISOString, que converte para UTC e podia recuar um dia)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="shrink-0 text-[0.58rem] px-2 py-1 rounded border border-ocre/30 text-creme-2/70 hover:border-ambar hover:text-ambar"
    >{ok ? '✓ copiado' : 'copiar'}</button>
  );
}

export default function CarrosselPage() {
  const [coleccoes, setColeccoes] = useState<Coleccao[]>([]);
  const [gerando, setGerando] = useState<number | null>(null);
  const [sel, setSel] = useState<Coleccao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ dia: VeuDia; index: number } | null>(null);
  const [videoMsg, setVideoMsg] = useState<string | null>(null);
  const [aba, setAba] = useState<'calendario' | 'gerados'>('calendario');
  const anoAtual = new Date().getFullYear();

  async function puxarPool(c: Coleccao) {
    setErro(null); setVideoMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/pool-assign', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: c.slug }),
      });
      const j = await r.json();
      if (j.erro === 'pool-vazio') { setErro(j.detalhe ?? 'pool vazio'); return; }
      if (!r.ok) { setErro('pool: ' + (j.erro ?? '')); return; }
      if (j.coleccao) setSel(j.coleccao);
      await carregar();
      setVideoMsg(`Imagens do pool aplicadas às capas e fechos (${j.usadas} no pool).`);
    } catch (e) { setErro(String(e)); }
  }

  async function restaurar(c: Coleccao) {
    setErro(null); setVideoMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/restaurar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: c.slug }),
      });
      const j = await r.json();
      if (j.erro === 'sem-historico') { setErro(j.detalhe ?? 'sem versão anterior'); return; }
      if (!r.ok) { setErro('restaurar: ' + (j.erro ?? '')); return; }
      if (j.coleccao) setSel(j.coleccao);
      await carregar();
      setVideoMsg('Versão anterior restaurada.');
    } catch (e) { setErro(String(e)); }
  }

  async function descarregarCarrossel(dia: VeuDia) {
    const urls = dia.imagens ?? [];
    if (!urls.length || !sel) { setErro('Ainda não há imagens deste dia — corre "gerar carrossel" primeiro.'); return; }
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < urls.length; i++) {
        const r = await fetch(urls[i]);
        zip.file(`slide-${i + 1}.png`, await r.blob());
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${sel.slug}-dia-${dia.dia}.zip`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setErro('zip: ' + String(e)); }
  }

  async function gerarVideos(c: Coleccao) {
    setErro(null); setVideoMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: c.slug }),
      });
      const j = await r.json();
      if (!r.ok) { setErro('vídeos: ' + (j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setVideoMsg('Render dos MP4 disparado no GitHub Actions (~10 min). Recarrega a semana depois para veres os vídeos.');
    } catch (e) { setErro(String(e)); }
  }

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
    // Este produto é em VÍDEO (MP4 com música): publica-se como Reel, não como
    // carrossel de imagens. Exporta os MP4 de cada dia.
    const videosPorDia = new Map<number, string>();
    for (const d of c.dias) if (d.videoUrl) videosPorDia.set(d.dia, d.videoUrl);
    if (videosPorDia.size === 0) {
      setErro('Este produto é em vídeo. Carrega "gerar carrossel + vídeo" primeiro para teres os MP4 e depois exporta.');
      return;
    }
    // Agenda a partir da PRÓXIMA segunda-feira (nunca no passado) e às 13h.
    const inicio = proximaSegunda();
    const dias13 = c.dias.map((d) => ({ ...d, horario: '13:00' }));
    const csv = gerarMetricoolCSV(dias13, inicio, undefined, videosPorDia);
    downloadFile(csv, `${c.slug}-metricool.csv`, 'text/csv');
  }

  // Gera as imagens editoriais (capa + fecho de cada dia) reutilizando o motor
  // Flux existente, guarda os URLs na coleccao e mostra-os nos slides.
  // Arrasta/escolhe uma imagem MJ como fundo de um slide (capa/fecho).
  async function uploadFundo(file: File | undefined, diaNum: number, idx: number) {
    if (!sel || !file) return;
    setErro(null); setVideoMsg(null);
    try {
      const jpeg = await resizeToJpeg(file);
      const fd = new FormData();
      fd.append('file', jpeg, 'fundo.jpg');
      fd.append('slug', sel.slug);
      fd.append('dia', String(diaNum));
      fd.append('idx', String(idx));
      const r = await fetch('/api/admin/carrossel/upload-fundo', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) { setErro('fundo: ' + (j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      if (j.coleccao) setSel(j.coleccao);
      setVideoMsg(`Fundo carregado no dia ${diaNum}.`);
    } catch (e) { setErro('fundo: ' + String(e)); }
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
              <Btn variant="default" onClick={() => puxarPool(sel)}>imagens do pool</Btn>
              {(sel.theme?.historico?.length ?? 0) > 0 && <Btn variant="default" onClick={() => restaurar(sel)}>↺ restaurar anterior</Btn>}
              <Btn variant="primary" onClick={() => gerarVideos(sel)}>gerar carrossel + vídeo</Btn>
              <Btn variant="primary" onClick={() => exportarMetricool(sel)}>exportar Metricool (CSV)</Btn>
            </div>
          </div>
          {videoMsg && <div className="mb-4 text-[0.72rem] text-salvia bg-salvia/10 rounded-lg p-3">{videoMsg}</div>}
          {erro && <div className="mb-4 text-[0.72rem] text-red-300 bg-red-950/40 rounded-lg p-3">{erro}</div>}
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
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-[0.68rem] opacity-45">♪ Ancient Ground · {dia.faixa?.titulo ?? faixaParaCarrossel(sel.theme?.semana ?? 1, dia.dia).titulo}</p>
                    {(dia.imagens?.length ?? 0) > 0 && (
                      <button onClick={() => descarregarCarrossel(dia)} className="text-[0.66rem] px-2.5 py-1 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ descarregar carrossel ({dia.imagens!.length} imagens)</button>
                    )}
                  </div>
                  {dia.videoUrl && (
                    <div className="mb-3 flex items-center gap-3">
                      <video src={dia.videoUrl} controls playsInline className="w-36 rounded-lg border border-white/10 bg-black" />
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[0.62rem] text-salvia">✓ vídeo pronto</span>
                        <a href={dia.videoUrl} download className="text-[0.66rem] px-2.5 py-1 rounded border border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar">⬇ descarregar MP4</a>
                      </div>
                    </div>
                  )}

                  {dia.slides && dia.slides.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {dia.slides.map((s, i) => {
                        const ehFundo = s.tipo === 'capa' || s.tipo === 'cta';
                        return (
                          <div key={i}>
                            <button
                              type="button"
                              onClick={() => setZoom({ dia, index: i })}
                              onDragOver={ehFundo ? (e) => e.preventDefault() : undefined}
                              onDrop={ehFundo ? (e) => { e.preventDefault(); uploadFundo(e.dataTransfer.files?.[0], dia.dia, i); } : undefined}
                              className="block w-full cursor-zoom-in transition-transform hover:scale-[1.02]"
                              title={ehFundo ? 'ver / arrastar imagem MJ para fundo' : 'ver em tamanho real'}
                            >
                              <VeuSlide slide={s} mundo={dia.mundo} palavra={dia.palavra} subtitulo={dia.subtitulo} imageUrl={(s as { imageUrl?: string }).imageUrl} numeroDia={dia.dia} slideIndex={i + 1} slideTotal={dia.slides!.length} />
                            </button>
                            {ehFundo && (
                              <label className="mt-1 block text-center text-[0.6rem] opacity-55 hover:opacity-90 cursor-pointer">
                                ⬆ arrastar/escolher fundo MJ
                                <input type="file" accept="image/*" hidden onChange={(e) => uploadFundo(e.target.files?.[0], dia.dia, i)} />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {dia.slides?.some((s) => (s.tipo === 'capa' || s.tipo === 'cta') && s.notaVisual) && (
                    <div className="mb-3 rounded-lg bg-black/20 p-3">
                      <p className="text-[0.58rem] uppercase tracking-[0.2em] opacity-50 mb-2">Prompts MidJourney · capa + fecho (copia → gera no MJ → arrasta a imagem)</p>
                      <div className="space-y-2">
                        {dia.slides.map((s, i) => (s.tipo === 'capa' || s.tipo === 'cta') && s.notaVisual ? (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[0.55rem] tracking-wide opacity-50 mt-1 w-10 shrink-0">{s.tipo === 'capa' ? 'CAPA' : 'FECHO'}</span>
                            <p className="text-[0.66rem] opacity-80 flex-1 leading-snug">{s.notaVisual}</p>
                            <CopyButton text={s.notaVisual} />
                          </div>
                        ) : null)}
                      </div>
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
        <p className="text-[0.8rem] opacity-65 mb-4">Calendário temático de 52 semanas. Cada semana gera uma jornada de carrosséis que combina produtos do teu ecossistema.</p>

        {/* DESTAQUE: a semana EM CURSO — leva-te direto a ela, sem caçar na grelha */}
        {(() => {
          const semAtual = semanaAtual(anoAtual);
          const wAtual = CALENDARIO_ANUAL.find((w) => w.semana === semAtual);
          if (!wAtual) return null;
          const colAtual = colDaSemana(semAtual);
          const palU = PALETAS_UNIVERSO[wAtual.universo];
          const pA = PALETAS[palU.mundo];
          return (
            <div className="rounded-2xl border-2 mb-6 p-4 sm:p-5" style={{ borderColor: pA.destaque + '88', background: `linear-gradient(135deg, ${pA.bg}33, ${pA.bg2}66)` }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.3em] mb-1" style={{ color: pA.destaque }}>● Esta semana · Sem. {semAtual} · {intervaloDatas(semAtual, anoAtual)}</p>
                  <h2 className="text-xl font-serif italic leading-snug" style={{ color: pA.destaque }}>{wAtual.tema}</h2>
                  <p className="text-[0.74rem] italic opacity-75 leading-snug">{wAtual.subtitulo}</p>
                  <p className="text-[0.62rem] opacity-50 mt-1">{getColecao(wAtual.universo).nome} · {wAtual.estacao}{colAtual ? '' : ' · ainda não gerada'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {colAtual ? (
                    <Btn variant="primary" onClick={() => setSel(colAtual)}>abrir esta semana →</Btn>
                  ) : (
                    <Btn variant="primary" onClick={() => gerar(semAtual)} disabled={gerando !== null}>{gerando === semAtual ? 'a gerar…' : 'gerar esta semana'}</Btn>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* abas: calendário completo vs. só os já gerados */}
        {(() => {
          const nGerados = CALENDARIO_ANUAL.filter((w) => colDaSemana(w.semana)).length;
          return (
            <div className="flex gap-2 mb-6">
              <button onClick={() => setAba('calendario')} className={`text-[0.74rem] px-4 py-1.5 rounded-full border ${aba === 'calendario' ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>Calendário · 52</button>
              <button onClick={() => setAba('gerados')} className={`text-[0.74rem] px-4 py-1.5 rounded-full border ${aba === 'gerados' ? 'border-salvia text-salvia bg-salvia/10' : 'border-ocre/25 text-creme-2/70 hover:border-salvia'}`}>Já gerados · {nGerados}</button>
            </div>
          );
        })()}
        {erro && <div className="mb-4 text-[0.75rem] text-red-300 bg-red-950/40 rounded-lg p-3">{erro}</div>}

        {aba === 'gerados' && CALENDARIO_ANUAL.every((w) => !colDaSemana(w.semana)) && (
          <p className="text-[0.8rem] opacity-50 text-center py-10">Ainda não geraste nenhuma semana. Vai ao <b>Calendário</b> e carrega "gerar" numa semana.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CALENDARIO_ANUAL.filter((w) => aba === 'calendario' || colDaSemana(w.semana)).map((w) => {
            const col = colDaSemana(w.semana);
            const pal = PALETAS_UNIVERSO[w.universo];
            const p = PALETAS[pal.mundo];
            const ehAtual = w.semana === semanaAtual(anoAtual);
            return (
              <div key={w.semana} className={`rounded-xl overflow-hidden ${ehAtual ? 'border-2' : 'border border-white/10'}`} style={{ background: `linear-gradient(135deg, ${p.bg}22, ${p.bg2}55)`, borderColor: ehAtual ? p.destaque + 'aa' : undefined }}>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.6rem] uppercase tracking-[0.15em] opacity-60">Sem. {w.semana} · {intervaloDatas(w.semana, anoAtual)} · {w.estacao}</span>
                    {ehAtual && <span className="text-[0.55rem] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: p.destaque + '33', color: p.destaque }}>● esta semana</span>}
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
