"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import type { Dia } from "@/lib/carousel-types";
import { captionFor } from "@/lib/carousel-helpers";
import { posterFrag } from "@/lib/video-poster";

type Video = { file: string; url: string; sizeBytes: number };
type Job = {
  jobId: string;
  status: string;
  videos: Video[];
  completedAt?: string;
  campanha?: string;
  dias?: Dia[]; // se foi um collection com content override
};

function slugFromJobId(jobId: string) {
  return jobId.replace(/-\d+$/, "");
}

function diaForVideo(job: Job, file: string): Dia | undefined {
  const m = file.match(/dia-(\d+)/);
  if (!m || !job.dias) return undefined;
  const num = Number(m[1]);
  return job.dias.find((d) => d.numero === num);
}

function captionForJob(job: Job, file: string): string {
  const dia = diaForVideo(job, file);
  if (dia) return captionFor(dia, job.dias?.length ?? 7);

  // Fallback para vídeos antigos sem manifest enriquecido — usa slug + nº dia
  const slug = slugFromJobId(job.jobId).replace(/-/g, " ");
  const m = file.match(/dia-(\d+)/);
  const dayLabel = m ? `Dia ${m[1]}/7` : file.replace(".mp4", "");
  return [
    "Olá.",
    "",
    `Hoje vamos falar de ${slug}.`,
    "",
    `E tu — como te relacionas com este tema?`,
    "",
    dayLabel,
    "",
    "seteveus.space",
  ].join("\n");
}

async function fetchAsBlob(url: string): Promise<Blob> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch ${url} → ${r.status}`);
  return r.blob();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function VideosPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [editedCaptions, setEditedCaptions] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/colecoes/videos/list", { cache: "no-store" });
        if (r.ok) {
          const data = await r.json();
          setJobs(data.items || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function captionKey(jobId: string, file: string) {
    return `${jobId}::${file}`;
  }
  function getCaption(job: Job, file: string) {
    const k = captionKey(job.jobId, file);
    return editedCaptions[k] ?? captionForJob(job, file);
  }

  async function copyCaption(job: Job, file: string) {
    const text = getCaption(job, file);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(captionKey(job.jobId, file));
      setTimeout(() => setCopied(null), 1800);
    } catch {
      alert("Não consegui copiar — selecciona à mão.");
    }
  }

  async function downloadVideoAndCaption(job: Job, video: Video) {
    const k = captionKey(job.jobId, video.file);
    setDownloading(k);
    try {
      const slug = slugFromJobId(job.jobId);
      const baseName = `${slug}-${video.file.replace(".mp4", "")}`;
      // 1. mp4
      const mp4 = await fetchAsBlob(video.url);
      triggerDownload(mp4, `${baseName}.mp4`);
      // 2. legenda .txt
      const txt = new Blob([getCaption(job, video.file)], { type: "text/plain;charset=utf-8" });
      triggerDownload(txt, `${baseName}.txt`);
    } catch (e) {
      alert(`Falhou: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDownloading(null);
    }
  }

  async function deleteVideo(jobId: string, file: string) {
    if (!confirm(`Apagar ${file} (do job ${jobId})? Não dá para recuperar.`)) return;
    const k = `del-${jobId}-${file}`;
    setDownloading(k);
    try {
      const r = await fetch("/api/admin/colecoes/videos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, file }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.erro || `HTTP ${r.status}`);
      }
      // Remove do estado
      setJobs((prev) =>
        prev
          .map((j) =>
            j.jobId === jobId ? { ...j, videos: j.videos.filter((v) => v.file !== file) } : j
          )
          .filter((j) => j.videos.length > 0)
      );
    } catch (e) {
      alert(`Falhou: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDownloading(null);
    }
  }

  async function downloadCollectionZip(slug: string, items: Array<{ file: string; url: string; sizeBytes: number; sourceJob: Job }>) {
    const k = `zip-${slug}`;
    setDownloading(k);
    try {
      const zip = new JSZip();
      const folder = zip.folder(slug)!;
      for (const v of items) {
        const baseName = v.file.replace(".mp4", "");
        const mp4 = await fetchAsBlob(v.url);
        folder.file(`${baseName}.mp4`, mp4);
        folder.file(`${baseName}.txt`, getCaption(v.sourceJob, v.file));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      triggerDownload(blob, `${slug}.zip`);
    } catch (e) {
      alert(`ZIP falhou: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDownloading(null);
    }
  }

  const filtered = filter
    ? jobs.filter(
        (j) =>
          j.jobId.toLowerCase().includes(filter.toLowerCase()) ||
          (j.campanha || "").toLowerCase().includes(filter.toLowerCase())
      )
    : jobs;

  // Agrupa por slug (= colecção). Vídeo do mesmo dia em jobs diferentes:
  // mantém o mais recente (último na ordem).
  type CollectedVideo = Video & { sourceJob: Job };
  const bySlug = new Map<string, { campanha: string; videos: CollectedVideo[]; latestAt?: string }>();
  for (const job of filtered) {
    const slug = slugFromJobId(job.jobId);
    if (!bySlug.has(slug)) {
      bySlug.set(slug, { campanha: job.campanha || slug, videos: [], latestAt: job.completedAt });
    }
    const entry = bySlug.get(slug)!;
    if (job.completedAt && (!entry.latestAt || job.completedAt > entry.latestAt)) {
      entry.latestAt = job.completedAt;
    }
    if (job.campanha) entry.campanha = job.campanha;
    for (const v of job.videos || []) {
      const idx = entry.videos.findIndex((x) => x.file === v.file);
      const enriched: CollectedVideo = { ...v, sourceJob: job };
      if (idx >= 0) entry.videos[idx] = enriched;
      else entry.videos.push(enriched);
    }
  }
  // Ordena vídeos por dia número
  for (const entry of bySlug.values()) {
    entry.videos.sort((a, b) => {
      const na = Number(a.file.match(/dia-(\d+)/)?.[1] ?? 0);
      const nb = Number(b.file.match(/dia-(\d+)/)?.[1] ?? 0);
      return na - nb;
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href="/admin/producao/colecoes" className="hover:text-escola-dourado">
          ← carrosséis
        </Link>
        <span>/ vídeos prontos</span>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
          Vídeos prontos (MP4)
        </h2>
        <p className="text-sm text-escola-creme-50">
          Todos os carrosséis em vídeo gerados pela Action — agregados do Supabase, qualquer
          browser. Cada vídeo traz a legenda sugerida (editável). Descarrega vídeo + legenda
          juntos ou a colecção inteira em ZIP.
        </p>
        <input
          type="text"
          placeholder="filtrar por nome / job"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50"
        />
      </div>

      {loading ? (
        <p className="text-sm text-escola-creme-50">A carregar do Supabase…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-escola-border p-8 text-center">
          <p className="text-sm text-escola-creme-50">
            Ainda não há vídeos. Vai a uma colecção, gera um e ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Array.from(bySlug.entries()).map(([slug, entry]) => {
            const totalSize = entry.videos.reduce((a, v) => a + v.sizeBytes, 0);
            return (
              <section key={slug} className="rounded-lg border border-escola-border bg-escola-card p-4">
                <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-escola-border pb-2">
                  <div className="min-w-0">
                    <p className="font-serif text-base text-escola-creme">
                      {entry.campanha}
                    </p>
                    <p className="text-[10px] text-escola-creme-50">
                      {entry.videos.length} vídeo{entry.videos.length === 1 ? "" : "s"} ·{" "}
                      {(totalSize / 1024 / 1024).toFixed(1)} MB ·{" "}
                      último: {entry.latestAt && new Date(entry.latestAt).toLocaleString("pt-PT")}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadCollectionZip(slug, entry.videos)}
                    disabled={!!downloading}
                    className="rounded bg-escola-dourado/90 px-3 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
                  >
                    {downloading === `zip-${slug}`
                      ? "a gerar ZIP…"
                      : `↓ ZIP (${entry.videos.length} vídeos + legendas)`}
                  </button>
                </header>

                <div className="space-y-4">
                  {entry.videos.map((v) => {
                    const job = v.sourceJob;
                    const k = captionKey(job.jobId, v.file);
                    const dia = diaForVideo(job, v.file);
                    return (
                      <div key={v.file} className="rounded border border-escola-border bg-escola-bg p-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
                          <video
                            src={posterFrag(v.url)}
                            controls
                            playsInline
                            preload="metadata"
                            className="aspect-[9/16] w-full rounded border border-escola-border bg-black"
                          />
                          <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-sm text-escola-creme">
                                {dia ? (
                                  <>
                                    Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span>
                                  </>
                                ) : (
                                  v.file.replace(".mp4", "")
                                )}
                              </p>
                              <span className="text-[10px] text-escola-creme-50">
                                {(v.sizeBytes / 1024 / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            <textarea
                              value={getCaption(job, v.file)}
                              onChange={(e) =>
                                setEditedCaptions((prev) => ({ ...prev, [k]: e.target.value }))
                              }
                              rows={6}
                              className="w-full rounded border border-escola-border bg-escola-card p-2 text-xs text-escola-creme"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => copyCaption(job, v.file)}
                                className="rounded bg-escola-dourado/90 px-3 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado"
                              >
                                {copied === k ? "✓ copiada" : "⧉ copiar legenda"}
                              </button>
                              <button
                                onClick={() => downloadVideoAndCaption(job, v)}
                                disabled={!!downloading}
                                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
                              >
                                {downloading === k ? "a descarregar…" : "↓ Vídeo + legenda"}
                              </button>
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
                              >
                                ↓ Só MP4
                              </a>
                              <button
                                onClick={() => deleteVideo(job.jobId, v.file)}
                                disabled={!!downloading}
                                className="ml-auto rounded border border-red-700/40 px-3 py-1.5 text-xs text-red-300 hover:border-red-500 hover:bg-red-900/20 disabled:opacity-30"
                                title="Apagar este vídeo do Supabase (irreversível)"
                              >
                                {downloading === `del-${job.jobId}-${v.file}` ? "a apagar…" : "🗑 Apagar"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
