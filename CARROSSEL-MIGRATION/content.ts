"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { Slide } from "@/app/admin/producao/carrossel-veus/Slide";
import { EditModal, FullscreenSlide, InlineFundoControl } from "./CarouselEditor";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";
import { audioKey, captionFor, deriveText, tipoLabel } from "@/lib/carousel-helpers";
import { DEFAULT_THEME, type CarouselTheme, THEMES } from "@/lib/carousel-themes";
import { posterFrag } from "@/lib/video-poster";

const PREVIEW_SCALE = 0.18;
const EXPORT_PIXEL_RATIO = 2;
const RESPIRACAO_MS = 1000;

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const AG_MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const AG_TOTAL_TRACKS = 100;
const agTrackUrl = (n: number) =>
  `${AG_MUSIC_BASE}/faixa-${String(n).padStart(2, "0")}.mp3`;

type AudioState = {
  url?: string;
  durationSec?: number;
  generating?: boolean;
  error?: string;
};

type RenderStatus = {
  jobId: string;
  status: "queued" | "running" | "done" | "failed" | "not_found";
  progress?: number;
  phase?: string;
  videos?: Array<{ file: string; url: string; sizeBytes: number }>;
  error?: string;
};

export type CollectionWorkspaceProps = {
  title: string;
  campanha: string;
  slug: string;
  dias: Dia[];
  onDiasChange: (dias: Dia[]) => void;
  originalDias?: Dia[];
  theme?: CarouselTheme;
  onThemeChange?: (theme: CarouselTheme) => void;
  onTitleChange?: (title: string) => void;
  onReset?: () => void;
  regenerateSlideFn?: (diaIdx: number, slideIdx: number, hint?: string) => Promise<SlideType>;
  /** Acções adicionais ao lado do botão "↓ PNGs (ZIP)" (ex: Guardar) */
  extraHeaderActions?: React.ReactNode;
  /** Texto descritivo abaixo do título */
  description?: React.ReactNode;
};

export default function CollectionWorkspace(props: CollectionWorkspaceProps) {
  const {
    title,
    campanha,
    slug,
    dias,
    onDiasChange,
    originalDias,
    theme = DEFAULT_THEME,
    onThemeChange,
    onTitleChange,
    onReset,
    regenerateSlideFn,
    extraHeaderActions,
    description,
  } = props;

  const totalDias = dias.length;
  const totalSlides = dias.reduce((a, d) => a + d.slides.length, 0);

  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [editing, setEditing] = useState<{ diaIdx: number; slideIdx: number } | null>(null);
  const [regenBusy, setRegenBusy] = useState<string | null>(null);

  // Vozes
  const [jobId, setJobId] = useState<string>("");
  const [audios, setAudios] = useState<Record<string, AudioState>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  // Vídeo
  const [musicTrack, setMusicTrack] = useState<number>(1);
  const [musicVolume, setMusicVolume] = useState<number>(0.4);
  const [withoutVoice, setWithoutVoice] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(8);
  const [previewDia, setPreviewDia] = useState<number | null>(null);
  const [fullscreenSlide, setFullscreenSlide] = useState<{
    dia: Dia;
    slide: SlideType;
    indice: number;
  } | null>(null);
  const [renderJob, setRenderJob] = useState<RenderStatus | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState<string | null>(null);
  const [historicalJobs, setHistoricalJobs] = useState<RenderStatus[]>([]);

  const JOBS_KEY = `carrossel.jobs.${slug}`;

  // Persiste jobId após submit (lista por colecção, max 20 mais recentes)
  function persistJobId(id: string) {
    try {
      const raw = localStorage.getItem(JOBS_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      if (!arr.includes(id)) arr.push(id);
      localStorage.setItem(JOBS_KEY, JSON.stringify(arr.slice(-20)));
    } catch {}
  }

  // Ao montar: carrega histórico de jobs do localStorage e poll status
  useEffect(() => {
    try {
      const raw = localStorage.getItem(JOBS_KEY);
      if (!raw) return;
      const ids: string[] = JSON.parse(raw);
      if (!Array.isArray(ids) || ids.length === 0) return;
      Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fetch(
              `/api/admin/carrossel-veus/render-status?jobId=${encodeURIComponent(id)}`,
              { cache: "no-store" }
            );
            if (r.ok) return (await r.json()) as RenderStatus;
          } catch {}
          return null;
        })
      ).then((results) => {
        setHistoricalJobs(
          results.filter((r): r is RenderStatus => !!r && (r.status === "done" || r.status === "failed"))
        );
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const allAudiosReady = useMemo(() => {
    for (const dia of dias) {
      for (let i = 0; i < dia.slides.length; i++) {
        if (!audios[audioKey(dia.numero, i + 1)]?.url) return false;
      }
    }
    return true;
  }, [audios, dias]);

  const audiosCount = useMemo(
    () => Object.values(audios).filter((a) => a.url).length,
    [audios]
  );

  // Quais dias já têm vídeo gerado (cruza historicalJobs)
  const completedDays = useMemo(() => {
    const set = new Set<number>();
    for (const job of historicalJobs) {
      for (const v of job.videos || []) {
        const m = v.file.match(/dia-(\d+)/);
        if (m) set.add(Number(m[1]));
      }
    }
    return set;
  }, [historicalJobs]);

  // Dias que ainda faltam render
  const missingDays = useMemo(
    () => dias.map((d) => d.numero).filter((n) => !completedDays.has(n)),
    [dias, completedDays]
  );

  // Polling do job — quando "done", junta ao histórico para ficarem visíveis
  // imediatamente em "Vídeos gerados" sem precisar refresh
  useEffect(() => {
    if (!renderJob?.jobId) return;
    if (renderJob.status === "done" || renderJob.status === "failed") {
      if (renderJob.status === "done" && (renderJob.videos?.length ?? 0) > 0) {
        setHistoricalJobs((prev) => {
          const filtered = prev.filter((j) => j.jobId !== renderJob.jobId);
          return [renderJob, ...filtered];
        });
      }
      return;
    }
    const id = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/admin/carrossel-veus/render-status?jobId=${encodeURIComponent(renderJob.jobId)}`,
          { cache: "no-store" }
        );
        if (r.ok) setRenderJob((await r.json()) as RenderStatus);
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [renderJob?.jobId, renderJob?.status, renderJob?.videos?.length]);

  function setRef(key: string, el: HTMLDivElement | null) {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  }

  function updateSlide(diaIdx: number, slideIdx: number, patch: Partial<SlideType>) {
    const next = dias.map((d, di) => {
      if (di !== diaIdx) return d;
      return {
        ...d,
        slides: d.slides.map((s, si) =>
          si === slideIdx ? ({ ...s, ...patch } as SlideType) : s
        ),
      };
    });
    onDiasChange(next);
  }

  function updateDia(diaIdx: number, patch: Partial<Dia>) {
    onDiasChange(dias.map((d, di) => (di === diaIdx ? { ...d, ...patch } : d)));
  }

  // ─── Vozes ──────────────────────────────────────
  async function generateVoice(dia: Dia, slideIndex: number, currentJobId: string) {
    const slide = dia.slides[slideIndex];
    const slideNum = slideIndex + 1;
    const k = audioKey(dia.numero, slideNum);
    const text = deriveText(dia, slide);

    setAudios((prev) => ({ ...prev, [k]: { ...prev[k], generating: true, error: undefined } }));

    try {
      const r = await fetch("/api/admin/carrossel-veus/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentJobId, dia: dia.numero, slide: slideNum, text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      setAudios((prev) => ({
        ...prev,
        [k]: { url: data.audioUrl, durationSec: data.durationSec, generating: false },
      }));
      return data.audioUrl as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAudios((prev) => ({ ...prev, [k]: { ...prev[k], generating: false, error: msg } }));
      throw err;
    }
  }

  async function generateAllVoices() {
    const newJobId = jobId || `${slug}-${Date.now()}`;
    setJobId(newJobId);
    setGeneratingAll(true);
    let done = 0;
    setProgress({ done, total: totalSlides });
    try {
      for (const dia of dias) {
        for (let i = 0; i < dia.slides.length; i++) {
          const k = audioKey(dia.numero, i + 1);
          if (audios[k]?.url) {
            done++;
            setProgress({ done, total: totalSlides });
            continue;
          }
          await generateVoice(dia, i, newJobId);
          done++;
          setProgress({ done, total: totalSlides });
        }
      }
    } finally {
      setGeneratingAll(false);
      setProgress(null);
    }
  }

  async function regenerateOneVoice(dia: Dia, slideIndex: number) {
    const newJobId = jobId || `${slug}-${Date.now()}`;
    setJobId(newJobId);
    try {
      await generateVoice(dia, slideIndex, newJobId);
    } catch {}
  }

  // ─── Render submit ──────────────────────────────
  async function submitRender(opts?: { dias?: number[]; withoutVoiceOverride?: boolean }) {
    const targetDiasNumbers = opts?.dias;
    const baseNoVoice = opts?.withoutVoiceOverride ?? withoutVoice;

    const targetDias = targetDiasNumbers
      ? dias.filter((d) => targetDiasNumbers.includes(d.numero))
      : dias;

    let effectiveNoVoice = baseNoVoice;
    if (!effectiveNoVoice) {
      let missing = false;
      outer: for (const dia of targetDias) {
        for (let i = 0; i < dia.slides.length; i++) {
          if (!audios[audioKey(dia.numero, i + 1)]?.url) {
            missing = true;
            break outer;
          }
        }
      }
      if (missing) {
        const ok = confirm(
          targetDias.length === 1
            ? `Não há vozes geradas para o Dia ${targetDias[0].numero}. Gerar só com música Ancient Ground?`
            : `Faltam vozes. Gerar todos os vídeos só com música Ancient Ground (sem narração)?`
        );
        if (!ok) return;
        effectiveNoVoice = true;
      }
    }

    const busyKey = targetDiasNumbers ? `submit-${targetDiasNumbers.join(",")}` : "submit-render";
    setBusy(busyKey);
    try {
      const currentJobId = jobId || `${slug}-${Date.now()}`;
      if (!jobId) setJobId(currentJobId);

      const audiosList = effectiveNoVoice
        ? []
        : targetDias.flatMap((dia) =>
            dia.slides.map((_, i) => ({
              dia: dia.numero,
              slide: i + 1,
              url: audios[audioKey(dia.numero, i + 1)]!.url!,
            }))
          );

      const contentChanged =
        !!originalDias && JSON.stringify(dias) !== JSON.stringify(originalDias);
      // Para colecções dinâmicas (sem originalDias) enviamos sempre o content.
      // Para colecções fixas (com originalDias), enviamos sempre também — assim
      // o manifest tem dias[] e a página de vídeos consegue gerar legendas.
      const sendContent = true;
      void contentChanged;

      const r = await fetch("/api/admin/carrossel-veus/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: currentJobId,
          audios: audiosList,
          musicUrl: agTrackUrl(musicTrack),
          musicVolume,
          withoutVoice: effectiveNoVoice,
          slideDuration,
          dias: targetDiasNumbers ?? null,
          content: sendContent ? { campanha, dias } : undefined,
          theme,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      setRenderJob({ jobId: data.jobId, status: "queued" });
      setWorkflowUrl(data.workflowRunUrl || null);
      persistJobId(data.jobId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha ao submeter: ${msg}`);
    } finally {
      setBusy(null);
    }
  }

  // ─── PNG downloads ──────────────────────────────
  async function nodeToPng(node: HTMLElement) {
    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: EXPORT_PIXEL_RATIO,
      width: 1080,
      height: 1920,
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function downloadSlide(dia: Dia, slideIdx: number) {
    const k = audioKey(dia.numero, slideIdx + 1);
    const node = refs.current.get(k);
    const real = node?.firstElementChild as HTMLElement | null;
    if (!real) return;
    setBusy(k);
    try {
      const blob = await nodeToPng(real);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-dia-${dia.numero}-slide-${slideIdx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function downloadAllZip() {
    setBusy("all");
    setProgress({ done: 0, total: totalSlides });
    try {
      const zip = new JSZip();
      let done = 0;
      for (const dia of dias) {
        const folder = zip.folder(`dia-${dia.numero}`)!;
        for (let i = 0; i < dia.slides.length; i++) {
          const k = audioKey(dia.numero, i + 1);
          const node = refs.current.get(k);
          const real = node?.firstElementChild as HTMLElement | null;
          if (!real) continue;
          const blob = await nodeToPng(real);
          folder.file(`slide-${i + 1}.png`, blob);
          done++;
          setProgress({ done, total: totalSlides });
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function regenerateSlideClick(diaIdx: number, slideIdx: number) {
    if (!regenerateSlideFn) return;
    const hint = prompt("Instrução extra para Claude (opcional):", "");
    if (hint === null) return;
    const key = `regen-${diaIdx}-${slideIdx}`;
    setRegenBusy(key);
    try {
      const newSlide = await regenerateSlideFn(diaIdx, slideIdx, hint || undefined);
      updateSlide(diaIdx, slideIdx, newSlide);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falhou: ${msg}`);
    } finally {
      setRegenBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {onTitleChange ? (
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="mb-2 w-full bg-transparent font-serif text-2xl font-semibold text-escola-creme focus:outline-none"
            />
          ) : (
            <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">{title}</h2>
          )}
          {description && <div className="text-sm text-escola-creme-50">{description}</div>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {onThemeChange && (
            <label className="flex items-center gap-2 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme-50">
              🎨 Paleta:
              <select
                value={theme.id}
                onChange={(e) => {
                  const t = THEMES.find((x) => x.id === e.target.value);
                  if (t) onThemeChange(t);
                }}
                className="bg-transparent text-escola-creme focus:outline-none"
                title="Cor visual dos slides — não muda o conteúdo"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="rounded border border-escola-border px-3 py-2 text-xs text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
            >
              ↺ repor texto
            </button>
          )}
          <button
            onClick={() => {
              if (missingDays.length === 0) {
                if (!confirm(`Todos os ${totalDias} vídeos já existem. Regerar tudo (substitui)?`)) return;
                submitRender();
              } else if (missingDays.length === totalDias) {
                submitRender();
              } else {
                submitRender({ dias: missingDays });
              }
            }}
            disabled={
              busy === "submit-render" ||
              (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
            }
            className="rounded bg-escola-violeta/80 px-4 py-2 text-sm font-semibold text-escola-creme hover:bg-escola-violeta disabled:opacity-40"
            title={
              missingDays.length === totalDias
                ? `Gera os ${totalDias} vídeos da colecção`
                : missingDays.length === 0
                ? `Todos os vídeos já existem — clicar regenera tudo`
                : `Só gera os ${missingDays.length} que faltam (dias ${missingDays.join(", ")}); ${completedDays.size} já existem`
            }
          >
            {busy === "submit-render"
              ? "A submeter…"
              : missingDays.length === 0
              ? `↻ Regerar ${totalDias} vídeos`
              : missingDays.length === totalDias
              ? `▶ Gerar ${totalDias} vídeos (toda a colecção)`
              : `▶ Gerar os ${missingDays.length} que faltam (de ${totalDias})`}
          </button>
          <button
            onClick={downloadAllZip}
            disabled={busy !== null}
            className="rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
          >
            {busy === "all" ? `${progress?.done ?? 0}/${progress?.total ?? totalSlides}` : "↓ PNGs (ZIP)"}
          </button>
          {extraHeaderActions}
        </div>
      </div>

      {/* ─── VÍDEOS GERADOS ─────────────── */}
      {historicalJobs.length > 0 && (() => {
        const doneJobs = historicalJobs.filter((j) => j.status === "done" && j.videos?.length);
        if (doneJobs.length === 0) return null;
        const latest = doneJobs[0];
        const older = doneJobs.slice(1);
        return (
        <section className="mb-10 rounded-lg border border-escola-border bg-escola-card p-5">
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg text-escola-creme">Vídeos (versão actual)</h3>
              <p className="text-xs text-escola-creme-50">
                {latest.videos?.length ?? 0} MP4 · job {latest.jobId?.slice(0, 20)}…
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Limpar histórico desta colecção? Os MP4 continuam no Supabase, só ficas sem o atalho aqui.")) {
                  try { localStorage.removeItem(JOBS_KEY); } catch {}
                  setHistoricalJobs([]);
                }
              }}
              className="text-[11px] text-escola-creme-50 hover:text-red-300"
              title="Limpar lista (não apaga os MP4)"
            >
              limpar lista
            </button>
          </header>
          <div className="space-y-6">
            {(latest.videos ?? []).map((v) => {
              const m = v.file.match(/dia-(\d+)/);
              const diaNum = m ? Number(m[1]) : 0;
              const dia = dias.find((d) => d.numero === diaNum);
              return (
                <VideoResultCard
                  key={`${latest.jobId}-${v.file}`}
                  file={v.file}
                  url={v.url}
                  sizeBytes={v.sizeBytes}
                  dia={dia}
                  totalDias={totalDias}
                />
              );
            })}
          </div>
          {older.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-[11px] text-escola-creme-50 hover:text-escola-creme">
                {older.length} versão(ões) anterior(es) · clica para ver
              </summary>
              <div className="mt-3 space-y-6 border-t border-escola-border/40 pt-3">
                {older.flatMap((job) =>
                  (job.videos ?? []).map((v) => {
                    const m2 = v.file.match(/dia-(\d+)/);
                    const diaNum2 = m2 ? Number(m2[1]) : 0;
                    const dia2 = dias.find((d) => d.numero === diaNum2);
                    return (
                      <VideoResultCard
                        key={`${job.jobId}-${v.file}`}
                        file={v.file}
                        url={v.url}
                        sizeBytes={v.sizeBytes}
                        dia={dia2}
                        totalDias={totalDias}
                      />
                    );
                  })
                )}
              </div>
            </details>
          )}
        </section>
        );
      })()}

      {/* ─── VOZES ──────────────────────────────────── */}
      {/* Colapsado por defeito — só interessa quando vai gerar vídeo.
          A leitora vê slides primeiro; abre vozes quando precisar. */}
      <details className="mb-10 rounded-lg border border-escola-border bg-escola-card">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3 text-sm text-escola-creme hover:bg-escola-bg-light">
          <span className="font-serif text-base">Vozes (ElevenLabs)</span>
          <span className="text-xs text-escola-creme-50">
            {withoutVoice
              ? "modo sem voz activo"
              : `${audiosCount}/${totalSlides} geradas — clica para expandir`}
          </span>
        </summary>
        <div className="border-t border-escola-border px-5 py-4">
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-escola-creme-50">
              {withoutVoice ? (
                <>
                  <span className="text-escola-dourado">Modo sem voz activo</span> — vídeos vão sair só com música Ancient Ground.
                </>
              ) : (
                <>
                  Clica <span className="text-escola-dourado">▶</span> em cada slide para gerar a voz. Ou marca "sem voz" para vídeos só com música.
                </>
              )}
              {audiosCount > 0 && ` · ${audiosCount}/${totalSlides} vozes`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme">
              <input
                type="checkbox"
                checked={withoutVoice}
                onChange={(e) => setWithoutVoice(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Sem voz (só música AG)
            </label>
            {!withoutVoice && (
              <button
                onClick={generateAllVoices}
                disabled={generatingAll}
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme disabled:opacity-40"
                title="Gera todas as vozes que ainda faltam, em sequência"
              >
                {generatingAll
                  ? `${progress?.done ?? 0}/${progress?.total ?? totalSlides}`
                  : "↻ gerar todas as vozes que faltam"}
              </button>
            )}
            {withoutVoice && (
              <button
                disabled
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme-50 opacity-40"
                title="Desmarca 'Sem voz' acima para gerar narrações"
              >
                ↻ gerar todas as vozes (sem voz activo)
              </button>
            )}
          </div>
        </header>

        <div className="space-y-4">
          {dias.map((dia) => (
            <details key={dia.numero} className="rounded border border-escola-border bg-escola-bg" open>
              <summary className="cursor-pointer list-none px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-escola-creme">Dia {dia.numero}</span>
                    <span className="text-escola-dourado">{dia.veu}</span>
                    {completedDays.has(dia.numero) && (
                      <span className="rounded bg-green-700/30 px-2 py-0.5 text-[10px] text-green-300">
                        ✓ vídeo pronto
                      </span>
                    )}
                    {!withoutVoice && (
                      <span className="text-xs text-escola-creme-50">
                        {dia.slides.filter((_, i) => audios[audioKey(dia.numero, i + 1)]?.url).length}/{dia.slides.length} vozes
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewDia(dia.numero);
                      }}
                      className="rounded bg-escola-dourado/20 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/30"
                    >
                      ▶ Preview
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (completedDays.has(dia.numero)) {
                          if (!confirm(`Dia ${dia.numero} já tem vídeo. Regerar (substitui)?`)) return;
                        }
                        submitRender({ dias: [dia.numero] });
                      }}
                      disabled={
                        busy?.startsWith("submit-") ||
                        (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
                      }
                      className="rounded bg-escola-violeta/30 px-3 py-1 text-xs font-semibold text-escola-creme hover:bg-escola-violeta/50 disabled:opacity-30"
                    >
                      {completedDays.has(dia.numero) ? "↻ Regerar este dia" : "▶ Gerar vídeo deste dia"}
                    </button>
                  </div>
                </div>
              </summary>
              {!withoutVoice && (
                <ul className="space-y-2 px-4 pb-4">
                  {dia.slides.map((slide, i) => {
                    const k = audioKey(dia.numero, i + 1);
                    const a = audios[k];
                    const text = deriveText(dia, slide);
                    return (
                      <li key={k} className="flex items-start gap-3 rounded border border-escola-border bg-escola-card p-3">
                        <div className="w-12 shrink-0 text-xs text-escola-creme-50">
                          {String(i + 1).padStart(2, "0")} ·{" "}
                          <span className="text-escola-dourado">{tipoLabel(slide)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-2 text-xs italic text-escola-creme-50">{text}</p>
                          {a?.url ? (
                            <audio controls src={a.url} className="h-8 w-full" preload="none" />
                          ) : a?.error ? (
                            <p className="text-xs text-red-300">erro: {a.error}</p>
                          ) : a?.generating ? (
                            <p className="text-xs text-escola-dourado">a gerar…</p>
                          ) : (
                            <p className="text-xs text-escola-creme-50">
                              <em>por gerar — clica ▶ à direita</em>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => regenerateOneVoice(dia, i)}
                          disabled={a?.generating || generatingAll}
                          className="shrink-0 rounded border border-escola-border px-3 py-1 text-sm text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
                          title={a?.url ? "Regerar esta voz" : "Gerar esta voz"}
                        >
                          {a?.generating ? "…" : a?.url ? "↻" : "▶"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </details>
          ))}
        </div>
        </div>
      </details>

      {/* ─── SLIDES ─────────────────────────────────── */}
      <section className="mb-10">
        <h3 className="mb-4 font-serif text-lg text-escola-creme">Slides (PNG individuais)</h3>
        <div className="space-y-8">
          {dias.map((dia, diaIdx) => (
            <div key={dia.numero}>
              <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-escola-border pb-2 text-sm text-escola-creme-50">
                <span>
                  Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span> ·{" "}
                  <em>{dia.subtitulo}</em>
                </span>
                <button
                  onClick={() => setEditing({ diaIdx, slideIdx: -1 })}
                  className="text-xs text-escola-creme-50 hover:text-escola-dourado"
                  title="Editar nome do tema / subtítulo"
                >
                  ✏ editar dia
                </button>
              </header>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {dia.slides.map((slide, i) => {
                  const k = audioKey(dia.numero, i + 1);
                  const regenKey = `regen-${diaIdx}-${i}`;
                  return (
                    <div key={k} className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFullscreenSlide({ dia, slide, indice: i })}
                        className="overflow-hidden rounded border border-escola-border bg-black hover:border-escola-dourado/60"
                      >
                        <div ref={(el) => setRef(k, el)}>
                          <Slide dia={dia} slide={slide} indice={i} scale={PREVIEW_SCALE} theme={theme} />
                        </div>
                      </button>
                      <div className="flex w-full items-center justify-between gap-1 px-1">
                        <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                          {tipoLabel(slide)}
                        </span>
                        <div className="flex gap-1">
                          {regenerateSlideFn && (
                            <button
                              onClick={() => regenerateSlideClick(diaIdx, i)}
                              disabled={regenBusy === regenKey}
                              className="rounded bg-escola-violeta/30 px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-violeta/50 disabled:opacity-40"
                              title="Regenerar este slide com Claude"
                            >
                              {regenBusy === regenKey ? "…" : "✦"}
                            </button>
                          )}
                          <button
                            onClick={() => setEditing({ diaIdx, slideIdx: i })}
                            className="rounded bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light"
                          >
                            ✏
                          </button>
                          <button
                            onClick={() => downloadSlide(dia, i)}
                            disabled={busy !== null}
                            className="rounded bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light disabled:opacity-40"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Imagens MJ — só capa + fecho. Slides internos partilham o
                  ambiente do dia ou ficam sem fundo. */}
              {(() => {
                const capaIdx = dia.slides.findIndex((s) => s.tipo === "capa");
                const ctaIdx = dia.slides.findIndex((s) => s.tipo === "cta");
                if (capaIdx < 0 && ctaIdx < 0) return null;
                return (
                  <div className="mt-4 rounded-lg border border-escola-border/40 bg-escola-bg/30 p-3">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-escola-creme-50">
                      Imagens MJ deste dia · só capa + fecho
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {capaIdx >= 0 && (
                        <InlineFundoControl
                          dia={dia}
                          slide={dia.slides[capaIdx]}
                          slideIdx={capaIdx}
                          onChange={(patch) => updateSlide(diaIdx, capaIdx, patch)}
                        />
                      )}
                      {ctaIdx >= 0 && (
                        <InlineFundoControl
                          dia={dia}
                          slide={dia.slides[ctaIdx]}
                          slideIdx={ctaIdx}
                          onChange={(patch) => updateSlide(diaIdx, ctaIdx, patch)}
                        />
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </section>

      {/* ─── VÍDEOS ─────────────────────────────────── */}
      <section className="rounded-lg border border-escola-border bg-escola-card p-5">
        <h3 className="mb-2 font-serif text-lg text-escola-creme">3. Vídeos finais (MP4)</h3>
        <p className="mb-4 text-xs text-escola-creme-50">
          {totalDias} MP4 verticais. Renderizados numa GitHub Action (~10-25 min) com música
          Ancient Ground por baixo.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-xs text-escola-creme-50">
            Faixa Ancient Ground (1–{AG_TOTAL_TRACKS})
            <input
              type="number"
              min={1}
              max={AG_TOTAL_TRACKS}
              value={musicTrack}
              onChange={(e) =>
                setMusicTrack(Math.max(1, Math.min(AG_TOTAL_TRACKS, Number(e.target.value) || 1)))
              }
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
            />
          </label>
          <label className="block text-xs text-escola-creme-50">
            Volume da música ({musicVolume.toFixed(2)})
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
          {withoutVoice ? (
            <label className="block text-xs text-escola-creme-50">
              Duração por slide ({slideDuration}s)
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={slideDuration}
                onChange={(e) => setSlideDuration(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </label>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={() => submitRender()}
            disabled={
              busy === "submit-render" ||
              (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
            }
            className="w-full rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40 sm:w-auto"
          >
            {busy === "submit-render"
              ? "A submeter…"
              : withoutVoice
              ? `▶ Gerar ${totalDias} vídeo${totalDias === 1 ? "" : "s"} (sem voz)`
              : !allAudiosReady
              ? `▶ Gerar vídeos (vai pedir confirmação se faltarem vozes)`
              : `▶ Gerar ${totalDias} vídeo${totalDias === 1 ? "" : "s"} com voz`}
          </button>
        </div>

        {renderJob && (
          <div className="mt-5 rounded border border-escola-border bg-escola-bg p-4 text-xs">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-escola-creme-50">Job:</span>{" "}
                <code className="text-escola-dourado">{renderJob.jobId}</code>
              </div>
              <span
                className={
                  renderJob.status === "done"
                    ? "rounded bg-green-700/30 px-2 py-0.5 text-green-300"
                    : renderJob.status === "failed"
                    ? "rounded bg-red-700/30 px-2 py-0.5 text-red-300"
                    : "rounded bg-escola-dourado/20 px-2 py-0.5 text-escola-dourado"
                }
              >
                {renderJob.status}
                {renderJob.phase ? ` · ${renderJob.phase}` : ""}
              </span>
            </div>
            {workflowUrl && (
              <p className="mb-2 text-escola-creme-50">
                Logs:{" "}
                <a className="text-escola-dourado underline" href={workflowUrl} target="_blank" rel="noreferrer">
                  GitHub Actions
                </a>
              </p>
            )}
            {renderJob.error && <p className="mb-2 text-red-300">Erro: {renderJob.error}</p>}
            {renderJob.status === "done" && renderJob.videos && renderJob.videos.length > 0 && (
              <div className="mt-3 space-y-6">
                <p className="font-semibold text-escola-creme">Vídeos prontos:</p>
                {renderJob.videos.map((v) => {
                  const m = v.file.match(/dia-(\d+)/);
                  const diaNum = m ? Number(m[1]) : 0;
                  const dia = dias.find((d) => d.numero === diaNum);
                  return (
                    <VideoResultCard
                      key={v.file}
                      file={v.file}
                      url={v.url}
                      sizeBytes={v.sizeBytes}
                      dia={dia}
                      totalDias={totalDias}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {previewDia !== null && (
        <PreviewModal
          dia={dias.find((d) => d.numero === previewDia)!}
          audios={audios}
          musicUrl={agTrackUrl(musicTrack)}
          musicVolume={musicVolume}
          slideDuration={slideDuration}
          theme={theme}
          onClose={() => setPreviewDia(null)}
        />
      )}

      {fullscreenSlide && (
        <FullscreenSlide
          dia={fullscreenSlide.dia}
          slide={fullscreenSlide.slide}
          indice={fullscreenSlide.indice}
          onClose={() => setFullscreenSlide(null)}
          onDownload={() => downloadSlide(fullscreenSlide.dia, fullscreenSlide.indice)}
        />
      )}

      {editing && (
        <EditModal
          dia={dias[editing.diaIdx]}
          slideIdx={editing.slideIdx}
          onClose={() => setEditing(null)}
          onSaveDia={(patch) => updateDia(editing.diaIdx, patch)}
          onSaveSlide={(patch) =>
            editing.slideIdx >= 0 && updateSlide(editing.diaIdx, editing.slideIdx, patch)
          }
          onResetToOriginal={
            originalDias && originalDias[editing.diaIdx]
              ? () => {
                  const orig = originalDias[editing.diaIdx];
                  if (editing.slideIdx === -1) {
                    // Repor metadados do dia (veu + subtitulo) ao original
                    updateDia(editing.diaIdx, { veu: orig.veu, subtitulo: orig.subtitulo });
                  } else {
                    const origSlide = orig.slides[editing.slideIdx];
                    if (origSlide) {
                      // Substituir o slide inteiro pelo original
                      const next = dias.map((d, di) => {
                        if (di !== editing.diaIdx) return d;
                        return {
                          ...d,
                          slides: d.slides.map((s, si) =>
                            si === editing.slideIdx ? origSlide : s
                          ),
                        };
                      });
                      onDiasChange(next);
                    }
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

/* ─── PreviewModal ───────────────────────────────────
   Slides em sequência, voz se existir, senão timer. Música sempre.
*/
function PreviewModal({
  dia,
  audios,
  musicUrl,
  musicVolume,
  slideDuration,
  theme,
  onClose,
}: {
  dia: Dia;
  audios: Record<string, AudioState>;
  musicUrl: string;
  musicVolume: number;
  slideDuration: number;
  theme: CarouselTheme;
  onClose: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const noVoiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = dia.slides[slideIdx];
  const voiceUrl = audios[audioKey(dia.numero, slideIdx + 1)]?.url;

  function clearNoVoiceTimer() {
    if (noVoiceTimerRef.current) {
      clearTimeout(noVoiceTimerRef.current);
      noVoiceTimerRef.current = null;
    }
  }
  function advance() {
    if (slideIdx >= dia.slides.length - 1) {
      setPlaying(false);
      return;
    }
    setTimeout(() => setSlideIdx((i) => i + 1), RESPIRACAO_MS);
  }

  useEffect(() => {
    clearNoVoiceTimer();
    if (!playing) return;
    if (voiceUrl) {
      if (voiceRef.current) {
        voiceRef.current.src = voiceUrl;
        voiceRef.current.load();
        voiceRef.current.play().catch(() => {});
      }
    } else {
      noVoiceTimerRef.current = setTimeout(advance, slideDuration * 1000);
    }
    return clearNoVoiceTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceUrl, slideIdx, playing, slideDuration]);

  useEffect(() => {
    const a = musicAudioRef.current;
    if (!a) return;
    a.volume = musicVolume;
    a.loop = true;
    if (playing) a.play().catch(() => {});
    else a.pause();
  }, [playing, musicVolume]);

  function onVoiceEnded() { advance(); }
  function start() { setSlideIdx(0); setPlaying(true); }
  function stop() {
    setPlaying(false);
    clearNoVoiceTimer();
    voiceRef.current?.pause();
    musicAudioRef.current?.pause();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6">
      <button
        onClick={() => { stop(); onClose(); }}
        className="absolute right-6 top-6 rounded bg-escola-card px-3 py-2 text-sm text-escola-creme hover:bg-escola-bg-light"
      >
        ✕ Fechar
      </button>
      <div className="mb-3 text-center">
        <p className="font-serif text-xl text-escola-creme">
          Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span>
        </p>
        <p className="text-xs text-escola-creme-50">
          slide {slideIdx + 1}/{dia.slides.length}
        </p>
      </div>
      <div className="overflow-hidden rounded border border-escola-border bg-black">
        <Slide dia={dia} slide={slide} indice={slideIdx} scale={0.45} theme={theme} />
      </div>
      <div className="mt-4 flex items-center gap-3">
        {!playing ? (
          <button onClick={start} className="rounded bg-escola-dourado/90 px-5 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado">
            ▶ Tocar
          </button>
        ) : (
          <button onClick={stop} className="rounded bg-escola-card px-5 py-2 text-sm font-semibold text-escola-creme hover:bg-escola-bg-light">
            ⏸ Pausar
          </button>
        )}
        <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0} className="rounded border border-escola-border px-3 py-2 text-sm text-escola-creme disabled:opacity-30">‹</button>
        <button onClick={() => setSlideIdx((i) => Math.min(dia.slides.length - 1, i + 1))} disabled={slideIdx === dia.slides.length - 1} className="rounded border border-escola-border px-3 py-2 text-sm text-escola-creme disabled:opacity-30">›</button>
      </div>
      <audio ref={voiceRef} onEnded={onVoiceEnded} className="mt-3 w-80" controls />
      <audio ref={musicAudioRef} src={musicUrl} preload="auto" />
    </div>
  );
}

function VideoResultCard({
  file,
  url,
  sizeBytes,
  dia,
  totalDias,
}: {
  file: string;
  url: string;
  sizeBytes: number;
  dia?: Dia;
  totalDias: number;
}) {
  const [caption, setCaption] = useState(dia ? captionFor(dia, totalDias) : "");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Não consegui copiar — selecciona e copia à mão.");
    }
  }

  return (
    <div className="rounded border border-escola-border bg-escola-card p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm text-escola-creme">
          {dia ? (
            <>Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span></>
          ) : (
            file
          )}
        </p>
        <span className="text-[10px] text-escola-creme-50">
          {(sizeBytes / 1024 / 1024).toFixed(1)} MB
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
        <video
          src={posterFrag(url)}
          controls
          playsInline
          preload="metadata"
          className="aspect-[9/16] w-full rounded border border-escola-border bg-black"
        />
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-wider text-escola-creme-50">
            Legenda (editável)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            className="w-full rounded border border-escola-border bg-escola-bg p-2 text-xs text-escola-creme"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copy}
              className="rounded bg-escola-dourado/90 px-3 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado"
            >
              {copied ? "✓ copiada" : "⧉ copiar legenda"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
            >
              ↓ MP4
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
