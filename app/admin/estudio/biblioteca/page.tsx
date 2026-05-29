'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CALENDARIO_30_DIAS, PALETAS } from '@/lib/estudio-conteudo';
import { Pill, Btn } from '@/components/admin/EstudioKit';

type ImagemFonte = {
  path: string;
  url: string;
  mundo: string;
  dia: number;
  slideIdx: number;
  layout: string;
  ts: number;
};

type RenderFinal = {
  path: string;
  url: string;
  jobId: string;
  dia: number;
  slideIdx: number;
  tipo: string;
};

type Job = {
  jobId: string;
  status: string;
  progress?: number;
  total?: number;
  zipUrl?: string;
  iniciadoEm?: string;
  terminadoEm?: string;
  uploaded?: number;
  skipped?: number;
  failed?: number;
};

export default function BibliotecaPage() {
  const [data, setData] = useState<{
    imagensFonte: ImagemFonte[];
    rendersFinais: RenderFinal[];
    jobs: Job[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'campanha' | 'renders' | 'fonte' | 'jobs'>('campanha');
  const [preview, setPreview] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/estudio/biblioteca');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  if (loading || !data) {
    return (
      <main className="max-w-[1400px] mx-auto px-7 py-12">
        <p className="text-creme-2/60">a carregar biblioteca...</p>
      </main>
    );
  }

  const { imagensFonte, rendersFinais, jobs } = data;

  // Agrupar por dia (renders por mais recente jobId)
  const rendersPorDia = new Map<number, RenderFinal[]>();
  for (const r of rendersFinais) {
    if (!rendersPorDia.has(r.dia)) rendersPorDia.set(r.dia, []);
    rendersPorDia.get(r.dia)!.push(r);
  }

  const fontesPorDia = new Map<number, ImagemFonte[]>();
  for (const f of imagensFonte) {
    if (!fontesPorDia.has(f.dia)) fontesPorDia.set(f.dia, []);
    fontesPorDia.get(f.dia)!.push(f);
  }

  return (
    <main className="max-w-[1400px] mx-auto px-7 py-12">
      <header className="mb-8 flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin / estudio</p>
          <h1 className="font-serif font-light text-creme text-3xl">Biblioteca</h1>
          <p className="text-creme-2/60 text-[0.88rem]">
            Todo o trabalho gerado: imagens fonte, renders finais, jobs.
          </p>
        </div>
        <div className="flex-1" />
        <Link href="/admin/estudio" className="text-[0.7rem] text-ocre hover:text-ambar no-underline">
          &larr; voltar ao estudio
        </Link>
        <Btn variant="default" size="md" onClick={carregar}>
          recarregar
        </Btn>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap border-b border-ocre/15 pb-3">
        {([
          { id: 'campanha' as const, label: 'Campanha (30 dias)', count: 30 },
          { id: 'renders' as const, label: 'Renders finais', count: rendersFinais.length },
          { id: 'fonte' as const, label: 'Imagens fonte', count: imagensFonte.length },
          { id: 'jobs' as const, label: 'Jobs', count: jobs.length },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md border text-[0.78rem] transition-colors ${
              tab === t.id
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/20 text-creme-2/60 hover:text-creme-2/80'
            }`}
          >
            {t.label} <span className="opacity-50 ml-1">{t.count}</span>
          </button>
        ))}
      </div>

      {/* CAMPANHA: visao geral por dia */}
      {tab === 'campanha' && (
        <div className="space-y-3">
          {CALENDARIO_30_DIAS.map(c => {
            const renders = rendersPorDia.get(c.dia) ?? [];
            const fontes = fontesPorDia.get(c.dia) ?? [];
            const total = c.slides?.length ?? 0;
            const completo = renders.length >= total && total > 0;
            const pal = PALETAS[c.mundo];
            return (
              <div key={c.dia} className="border border-ocre/15 rounded-[14px] p-4 bg-terra-2/15">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="font-serif text-ambar text-lg w-10 text-center">D{c.dia}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-creme text-[1rem] truncate">{c.titulo}</p>
                    <p className="text-[0.7rem] text-creme-2/50 truncate">{c.descricao}</p>
                  </div>
                  <span className="text-[0.6rem] tracking-[0.12em]" style={{ color: pal.destaque }}>{pal.nome}</span>
                  <Pill variant={completo ? 'feito' : renders.length > 0 ? 'em-curso' : fontes.length > 0 ? 'aviso' : 'pendente'}>
                    {completo
                      ? `✓ ${renders.length}/${total} renders`
                      : renders.length > 0
                      ? `${renders.length}/${total} renders`
                      : fontes.length > 0
                      ? `${fontes.length}/${total} fontes (sem render)`
                      : 'pendente'}
                  </Pill>
                </div>

                {(renders.length > 0 || fontes.length > 0) && (
                  <div className="flex gap-1.5 overflow-x-auto">
                    {[...Array(total).keys()].map(i => {
                      const r = renders.find(x => x.slideIdx === i);
                      const f = fontes.find(x => x.slideIdx === i);
                      const src = r?.url ?? f?.url;
                      const label = r ? 'render' : f ? 'fonte' : '';
                      return src ? (
                        <button
                          key={i}
                          onClick={() => setPreview(src)}
                          className="relative shrink-0 w-[100px] aspect-[4/5] rounded-[6px] overflow-hidden border border-ocre/20 hover:border-ambar transition-colors group"
                          title={label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[0.55rem] px-1.5 py-0.5 rounded-sm">
                            {i + 1}{r ? '✓' : ''}
                          </span>
                        </button>
                      ) : (
                        <div
                          key={i}
                          className="shrink-0 w-[100px] aspect-[4/5] rounded-[6px] border border-dashed border-ocre/15 flex items-center justify-center text-[0.55rem] text-creme-2/30"
                        >
                          slide {i + 1}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RENDERS finais */}
      {tab === 'renders' && (
        <div>
          {rendersFinais.length === 0 ? (
            <p className="text-creme-2/60 italic">Sem renders ainda. Dispara a FASE 4 → Render via GitHub Actions.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {rendersFinais.map(r => (
                <button
                  key={r.path}
                  onClick={() => setPreview(r.url)}
                  className="rounded-[10px] overflow-hidden border border-ocre/20 hover:border-ambar transition-colors text-left"
                >
                  <div className="aspect-[4/5] relative bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[0.7rem] text-creme">D{r.dia} · slide {r.slideIdx + 1}</p>
                    <p className="text-[0.6rem] text-creme-2/40 truncate">{r.tipo}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FONTES */}
      {tab === 'fonte' && (
        <div>
          {imagensFonte.length === 0 ? (
            <p className="text-creme-2/60 italic">Sem imagens fonte. Corre FASE 3 → Producao em massa.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {imagensFonte.map(f => (
                <button
                  key={f.path}
                  onClick={() => setPreview(f.url)}
                  className="rounded-[10px] overflow-hidden border border-ocre/15 hover:border-ambar transition-colors text-left"
                >
                  <div className="aspect-[4/5] relative bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[0.7rem] text-creme">D{f.dia} · slide {f.slideIdx + 1}</p>
                    <p className="text-[0.55rem] text-creme-2/40 truncate">{f.mundo} · {f.layout}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JOBS */}
      {tab === 'jobs' && (
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-creme-2/60 italic">Sem jobs ainda.</p>
          ) : (
            jobs.map(j => (
              <div key={j.jobId} className="border border-ocre/15 rounded-[10px] p-4 bg-terra-2/15">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="font-mono text-[0.7rem] text-creme">{j.jobId}</span>
                  <Pill variant={j.status === 'feito' ? 'feito' : j.status === 'erro' ? 'erro' : 'em-curso'}>
                    {j.status}
                  </Pill>
                  {j.progress != null && j.total != null && (
                    <span className="text-[0.7rem] text-creme-2/60">
                      {j.progress}/{j.total}
                    </span>
                  )}
                  <div className="flex-1" />
                  {j.zipUrl && (
                    <a href={j.zipUrl} target="_blank" rel="noreferrer" className="text-[0.7rem] text-ambar hover:underline">
                      descarregar ZIP
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[0.65rem] text-creme-2/50">
                  {j.uploaded != null && <span>✓ {j.uploaded} renderizados</span>}
                  {j.skipped != null && j.skipped > 0 && <span>↩ {j.skipped} reusados</span>}
                  {j.failed != null && j.failed > 0 && <span className="text-rosa">✗ {j.failed} falharam</span>}
                  {j.iniciadoEm && <span>iniciado: {new Date(j.iniciadoEm).toLocaleString('pt-PT')}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
