'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CALENDARIO_30_DIAS, PALETAS, TIPO_LABELS } from '@/lib/estudio-conteudo';
import { ehReel } from '@/lib/estudio-reel';
import { Pill, Btn } from '@/components/admin/EstudioKit';

type RenderFinal = {
  url: string;
  jobId: string;
  dia: number;
  slideIdx: number;
  tipo: string;
};

type Job = {
  jobId: string;
  status: string;
  zipUrl?: string;
  iniciadoEm?: string;
};

type Filtro = 'rendered' | 'parcial' | 'pendente' | 'todos';

const START_DATE_DEFAULT = '2026-06-01';

function formatPubDate(dia: number, horario: string, startDate: string): string {
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + dia - 1);
  const iso = d.toISOString().split('T')[0];
  return `${iso} ${horario}`;
}

function inicioSemana(dia: number, startDate: string): string {
  const semana = Math.floor((dia - 1) / 7);
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + semana * 7);
  return d.toISOString().split('T')[0];
}

export default function RenderizadosPage() {
  const [data, setData] = useState<{ rendersFinais: RenderFinal[]; jobs: Job[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [startDate, setStartDate] = useState(START_DATE_DEFAULT);
  const [preview, setPreview] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/estudio/renders-fast');
      const json = await res.json();
      setData({ rendersFinais: json.renders ?? [], jobs: json.jobs ?? [] });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  // Renders mais recentes por (dia, slideIdx): jobs ordenados desc, primeiro a aparecer ganha
  const rendersPorDia = useMemo(() => {
    const map = new Map<number, RenderFinal[]>();
    if (!data) return map;
    const jobIdsDesc = Array.from(new Set(data.rendersFinais.map(r => r.jobId))).sort().reverse();
    for (const c of CALENDARIO_30_DIAS) {
      const lista: RenderFinal[] = [];
      const slidesVistos = new Set<number>();
      for (const jobId of jobIdsDesc) {
        for (const r of data.rendersFinais) {
          if (r.jobId !== jobId || r.dia !== c.dia) continue;
          if (slidesVistos.has(r.slideIdx)) continue;
          lista.push(r);
          slidesVistos.add(r.slideIdx);
        }
      }
      lista.sort((a, b) => a.slideIdx - b.slideIdx);
      map.set(c.dia, lista);
    }
    return map;
  }, [data]);

  function videoReelDe(dia: number): RenderFinal | undefined {
    return (rendersPorDia.get(dia) ?? []).find(r => r.tipo === 'reel-video');
  }

  function statusDe(dia: number): 'rendered' | 'parcial' | 'pendente' {
    const c = CALENDARIO_30_DIAS.find(x => x.dia === dia);
    if (!c) return 'pendente';
    if (ehReel(c)) return videoReelDe(dia) ? 'rendered' : 'pendente';
    const total = c.slides?.length ?? 0;
    const renders = (rendersPorDia.get(dia) ?? []).filter(r => r.tipo !== 'reel-video');
    if (total === 0) return 'pendente';
    if (renders.length >= total) return 'rendered';
    if (renders.length > 0) return 'parcial';
    return 'pendente';
  }

  async function dispararReel(dia: number) {
    const ok = confirm(`Gerar video do reel do dia ${dia}? Vai correr no GitHub Actions (~3-5min).`);
    if (!ok) return;
    try {
      const res = await fetch('/api/admin/estudio/render-reels-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias: String(dia) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(`Erro: ${json.erro ?? res.status}`);
        return;
      }
      alert(`Disparado. jobId=${json.jobId}\nVer: ${json.workflowRunUrl}`);
    } catch (e) {
      alert(`Erro: ${String(e)}`);
    }
  }

  async function dispararBulkReels() {
    const totalReels = CALENDARIO_30_DIAS.filter(c => ehReel(c)).length;
    const ok = confirm(`Gerar TODOS os ${totalReels} reels em bulk? ~20-30min no GitHub Actions. Reels ja com MP4 sao skipados (resume seguro).`);
    if (!ok) return;
    try {
      const res = await fetch('/api/admin/estudio/render-reels-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(`Erro: ${json.erro ?? res.status}`);
        return;
      }
      alert(`Bulk disparado. jobId=${json.jobId}\nVer: ${json.workflowRunUrl}`);
    } catch (e) {
      alert(`Erro: ${String(e)}`);
    }
  }

  const contagem = useMemo(() => {
    let rendered = 0, parcial = 0, pendente = 0;
    for (const c of CALENDARIO_30_DIAS) {
      const s = statusDe(c.dia);
      if (s === 'rendered') rendered++;
      else if (s === 'parcial') parcial++;
      else pendente++;
    }
    return { rendered, parcial, pendente, todos: CALENDARIO_30_DIAS.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendersPorDia]);

  const diasFiltrados = CALENDARIO_30_DIAS.filter(c => {
    if (filtro === 'todos') return true;
    return statusDe(c.dia) === filtro;
  });

  // Agrupar por semana
  const semanas = useMemo(() => {
    const map = new Map<number, typeof CALENDARIO_30_DIAS>();
    for (const c of diasFiltrados) {
      const wk = Math.floor((c.dia - 1) / 7);
      if (!map.has(wk)) map.set(wk, []);
      map.get(wk)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasFiltrados]);

  if (loading || !data) {
    return (
      <main className="max-w-[1400px] mx-auto px-7 py-12">
        <p className="text-creme-2/60">a carregar renderizados...</p>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-7 py-12">
      <header className="mb-6 flex items-start gap-4 flex-wrap">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin / estudio</p>
          <h1 className="font-serif font-light text-creme text-3xl mb-1">Carrosseis renderizados</h1>
          <p className="text-creme-2/60 text-[0.88rem]">
            PNGs finais compostos (Puppeteer + template). Diferente da{' '}
            <Link href="/admin/estudio/biblioteca" className="text-ambar hover:underline">biblioteca</Link>{' '}
            que mostra as imagens fonte (Replicate).
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <label className="text-[0.65rem] text-creme-2/40">início:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border border-ocre/30 rounded-[8px] px-2 py-1 text-[0.7rem] text-creme outline-none focus:border-ambar"
          />
        </div>
        <Btn variant="default" size="md" onClick={carregar}>recarregar</Btn>
        <Link href="/admin/estudio" className="text-[0.7rem] text-ocre hover:text-ambar no-underline">&larr; voltar ao estudio</Link>
      </header>

      {/* Painel reels: voz ElevenLabs + ffmpeg */}
      <div className="mb-6 p-4 rounded-[12px] border border-ambar/25 bg-ambar/5 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <p className="text-[0.78rem] text-creme">🎬 reels (video sem filmagem)</p>
          <p className="text-[0.68rem] text-creme-2/55 mt-0.5">
            TTS ElevenLabs + foto MJ + legendas. Cache reusa MP3s entre runs.
          </p>
        </div>
        <button
          onClick={() => dispararReel(2)}
          className="text-[0.74rem] px-4 py-2 rounded-[8px] border border-creme-2/30 text-creme hover:border-ambar transition-colors"
          title="Gera apenas o reel do dia 2 — para testar a voz antes do bulk"
        >
          teste de voz (dia 2)
        </button>
        <button
          onClick={dispararBulkReels}
          className="text-[0.78rem] px-5 py-2 rounded-[8px] bg-ambar text-terra-2 font-medium hover:bg-ambar/90 transition-colors"
          title="Gera todos os reels do calendario. Cache + skip-existing tornam reruns seguros."
        >
          🎬 gerar TODOS os reels
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {([
          { id: 'rendered' as const, label: 'rendered', count: contagem.rendered, cor: 'border-feito/40 text-feito bg-feito/10' },
          { id: 'parcial' as const, label: 'parcial', count: contagem.parcial, cor: 'border-ambar/40 text-ambar bg-ambar/10' },
          { id: 'pendente' as const, label: 'pendente', count: contagem.pendente, cor: 'border-creme-2/30 text-creme-2/50 bg-creme-2/5' },
          { id: 'todos' as const, label: 'todos', count: contagem.todos, cor: 'border-ocre/40 text-creme bg-ocre/10' },
        ]).map(p => (
          <button
            key={p.id}
            onClick={() => setFiltro(p.id)}
            className={`text-[0.72rem] px-3 py-1.5 rounded-[10px] border transition-opacity ${p.cor} ${
              filtro === p.id ? '' : 'opacity-40 hover:opacity-70'
            }`}
          >
            {p.label} · {p.count}
          </button>
        ))}
      </div>

      {/* Semanas */}
      {semanas.length === 0 && (
        <p className="text-creme-2/50 italic">Nada para mostrar com este filtro.</p>
      )}

      {semanas.map(([wk, dias]) => (
        <section key={wk} className="mb-10">
          <h2 className="font-serif text-creme text-lg mb-4">
            Semana de {inicioSemana(dias[0].dia, startDate)}
            <span className="text-creme-2/40 text-[0.8rem] ml-2">· {dias.length}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dias.map(c => {
              const renders = rendersPorDia.get(c.dia) ?? [];
              const ehReelDia = ehReel(c);
              const videoReel = ehReelDia ? videoReelDe(c.dia) : undefined;
              const slidesRenders = renders.filter(r => r.tipo !== 'reel-video');
              const total = c.slides?.length ?? 0;
              const status = statusDe(c.dia);
              const capa = slidesRenders.find(r => r.slideIdx === 0) ?? slidesRenders[0];
              const code = `VS-${String(c.dia).padStart(2, '0')}`;
              const dataPub = formatPubDate(c.dia, c.horario, startDate);
              const jobIdCapa = capa?.jobId;
              const zipUrl = jobIdCapa ? data.jobs.find(j => j.jobId === jobIdCapa)?.zipUrl : undefined;
              const pal = PALETAS[c.mundo];
              const tipoLabel = TIPO_LABELS[c.tipo]?.label ?? c.tipo;

              return (
                <div
                  key={c.dia}
                  className="rounded-[14px] overflow-hidden border border-ocre/15 bg-terra-2/15 flex flex-col"
                >
                  {/* Big preview (capa ou video) */}
                  {ehReelDia ? (
                    <div className="aspect-[9/16] block w-full bg-black relative overflow-hidden">
                      {videoReel?.url ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                          src={videoReel.url}
                          controls
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-creme-2/30 text-[0.7rem]">
                          sem video — clica em "gerar video"
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => capa && setPreview(capa.url)}
                      disabled={!capa}
                      className="aspect-[4/5] block w-full bg-black relative overflow-hidden disabled:cursor-default"
                    >
                      {capa?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={capa.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-creme-2/30 text-[0.7rem]">
                          sem render
                        </div>
                      )}
                    </button>
                  )}

                  {/* Footer */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[0.68rem] text-creme-2/50">{code}</span>
                      <Pill variant={status === 'rendered' ? 'feito' : status === 'parcial' ? 'em-curso' : 'pendente'}>
                        {status}
                      </Pill>
                    </div>

                    <div className="min-h-[3rem]">
                      <p className="font-serif text-creme text-[0.95rem] leading-snug line-clamp-2">{c.titulo}</p>
                      <p className="text-[0.62rem] text-creme-2/40 mt-1">
                        {dataPub} · <span style={{ color: pal.destaque }}>{tipoLabel}</span>
                      </p>
                    </div>

                    {/* Slide thumbs strip (so carrosseis) */}
                    {!ehReelDia && total > 0 && (
                      <div className="flex gap-1 overflow-hidden">
                        {Array.from({ length: total }, (_, i) => {
                          const r = slidesRenders.find(x => x.slideIdx === i);
                          return (
                            <button
                              key={i}
                              onClick={() => r && setPreview(r.url)}
                              disabled={!r}
                              className={`flex-1 aspect-[4/5] rounded-[4px] overflow-hidden border transition-colors ${
                                r
                                  ? 'border-ocre/30 hover:border-ambar bg-black'
                                  : 'border-dashed border-ocre/15 bg-transparent cursor-default'
                              }`}
                              title={`slide ${i + 1}`}
                            >
                              {r?.url && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={r.url} alt="" className="w-full h-full object-cover" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Acções */}
                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={`/admin/estudio#dia-${c.dia}`}
                        className="flex-1 text-center text-[0.72rem] py-2 rounded-[8px] border border-ocre/30 text-creme hover:border-ambar no-underline transition-colors"
                      >
                        abrir editor
                      </Link>
                      {ehReelDia ? (
                        <button
                          onClick={() => dispararReel(c.dia)}
                          className="text-[0.72rem] px-3 py-2 rounded-[8px] border border-ambar/40 text-ambar hover:bg-ambar/10 transition-colors"
                          title="dispara o GitHub Action de TTS+FFmpeg para este reel"
                        >
                          🎬 {videoReel ? 're-gerar' : 'gerar video'}
                        </button>
                      ) : zipUrl ? (
                        <a
                          href={zipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.72rem] px-3 py-2 rounded-[8px] border border-ambar/40 text-ambar hover:bg-ambar/10 no-underline transition-colors"
                        >
                          ↓ ZIP
                        </a>
                      ) : (
                        <span className="text-[0.72rem] px-3 py-2 rounded-[8px] border border-ocre/15 text-creme-2/25">
                          ↓ ZIP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-[10px]" />
          <button
            onClick={() => setPreview(null)}
            className="fixed top-4 right-4 w-10 h-10 rounded-full border border-creme-2/30 text-creme-2 text-sm bg-terra/80 hover:border-ambar"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
