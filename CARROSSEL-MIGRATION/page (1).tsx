"use client";

import { useEffect, useState } from "react";
import { Slide } from "@/app/admin/producao/carrossel-veus/Slide";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";
import { buildSlidePrompt, slideAssetId } from "@/lib/carrossel-veus-prompt";

/**
 * Modal de edição de um slide ou de metadados do dia.
 * Usa estado local para os inputs; commit só acontece em "Guardar".
 */
export function EditModal({
  dia,
  slideIdx,
  onClose,
  onSaveDia,
  onSaveSlide,
  onResetToOriginal,
}: {
  dia: Dia;
  slideIdx: number; // -1 = editar dia (veu+subtitulo); >=0 = editar slide
  onClose: () => void;
  onSaveDia: (patch: Partial<Dia>) => void;
  onSaveSlide: (patch: Partial<SlideType>) => void;
  /** Se passado, mostra "↩ repor original" que reverte SÓ este slide ao default. */
  onResetToOriginal?: () => void;
}) {
  const isDia = slideIdx === -1;
  const slide = isDia ? null : dia.slides[slideIdx];

  const [veu, setVeu] = useState(dia.veu);
  const [subtitulo, setSubtitulo] = useState(dia.subtitulo);
  const [linha1, setLinha1] = useState(slide?.tipo === "capa" ? slide.linha1 : "");
  const [linha2, setLinha2] = useState(slide?.tipo === "capa" ? slide.linha2 : "");
  const [titulo, setTitulo] = useState(slide?.tipo === "conteudo" ? slide.titulo ?? "" : "");
  const [texto, setTexto] = useState(slide?.tipo === "conteudo" ? slide.texto : "");
  const [estilo, setEstilo] = useState<"poetico" | "prosa">(
    slide?.tipo === "conteudo" ? slide.estilo : "prosa"
  );
  const [icone, setIcone] = useState(slide?.tipo === "cta" ? slide.icone : "");
  const [recurso, setRecurso] = useState(slide?.tipo === "cta" ? slide.recurso : "");
  const [descricao, setDescricao] = useState(slide?.tipo === "cta" ? slide.descricao : "");
  const [url, setUrl] = useState(slide?.tipo === "cta" ? slide.url : "");
  // Fundo MJ (partilhado por todos os tipos de slide)
  const [fundo, setFundo] = useState(slide?.fundo ?? "");
  const [fundoClaro, setFundoClaro] = useState(slide?.fundoClaro ?? false);
  const [notaVisual, setNotaVisual] = useState(slide?.notaVisual ?? "");

  function save() {
    const fundoPatch: Partial<SlideType> = {
      fundo: fundo || undefined,
      fundoClaro: fundoClaro || undefined,
      notaVisual: notaVisual.trim() || undefined,
    };
    if (isDia) {
      onSaveDia({ veu, subtitulo });
    } else if (slide?.tipo === "capa") {
      onSaveSlide({ tipo: "capa", linha1, linha2, ...fundoPatch });
    } else if (slide?.tipo === "conteudo") {
      onSaveSlide({
        tipo: "conteudo",
        estilo,
        titulo: titulo || undefined,
        texto,
        ...fundoPatch,
      });
    } else if (slide?.tipo === "cta") {
      onSaveSlide({ tipo: "cta", icone, recurso, descricao, url, ...fundoPatch });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-escola-border bg-escola-card p-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg text-escola-creme">
            {isDia ? `Editar Dia ${dia.numero}` : `Editar slide ${slideIdx + 1} · ${dia.veu}`}
          </h3>
          <button onClick={onClose} className="text-escola-creme-50 hover:text-escola-creme">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {isDia && (
            <>
              <Field label="Palavra-tema (maiúsculas, ex: PERMANÊNCIA)">
                <input
                  value={veu}
                  onChange={(e) => setVeu(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Subtítulo (italic, no fim da capa)">
                <input
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "capa" && (
            <>
              <Field label="Linha 1 (abertura)">
                <input
                  value={linha1}
                  onChange={(e) => setLinha1(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Linha 2 (abertura)">
                <input
                  value={linha2}
                  onChange={(e) => setLinha2(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "conteudo" && (
            <>
              <Field label="Estilo">
                <div className="flex gap-2">
                  {(["prosa", "poetico"] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEstilo(e)}
                      className={`rounded border px-3 py-1 text-xs ${
                        estilo === e
                          ? "border-escola-dourado text-escola-dourado"
                          : "border-escola-border text-escola-creme-50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Título pequeno (opcional, ex: HÁBITO DA ESTAÇÃO)">
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="vazio = sem título"
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme placeholder:text-escola-creme-50"
                />
              </Field>
              <Field label="Texto (Enter para quebra de linha em poético)">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={6}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "cta" && (
            <>
              <Field label="Ícone (emoji)">
                <input
                  value={icone}
                  onChange={(e) => setIcone(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Recurso (ex: Os 7 Véus do Despertar)">
                <input
                  value={recurso}
                  onChange={(e) => setRecurso(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Descrição">
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="URL (mostrado em terracota)">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {/* Fundo MJ vive agora INLINE na grelha do CollectionWorkspace
              (só para capa + cta). Não duplicar aqui. */}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          {onResetToOriginal ? (
            <button
              onClick={() => {
                if (confirm("Repor este slide ao texto original? Vais perder a edição.")) {
                  onResetToOriginal();
                  onClose();
                }
              }}
              className="rounded border border-red-700/40 px-3 py-1.5 text-xs text-red-300 hover:border-red-500"
              title="Reverter SÓ este slide ao texto original (não toca nos outros)"
            >
              ↩ repor original
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded bg-escola-dourado/90 px-4 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-escola-creme-50">
        {label}
      </span>
      {children}
    </label>
  );
}

/**
 * Controle inline para o Fundo MJ — pensado para viver directamente na
 * grelha do CollectionWorkspace, sob a capa e o CTA de cada dia.
 *
 * Mostra: id do asset, prompt MJ derivado, botão copiar, dropzone, thumbnail
 * + remover. Sem modal, sem draft — quando arrastas a imagem, o slide é
 * atualizado imediatamente via onChange (que dispara o save automático
 * do parent).
 *
 * Para os slides internos (poetico/prosa) este componente NÃO se renderiza
 * (decisão de UX — só capa+cta precisam de imagem MJ; os internos partilham
 * o ambiente do dia ou ficam sem fundo).
 */
export function InlineFundoControl({
  dia,
  slide,
  slideIdx,
  onChange,
}: {
  dia: Dia;
  slide: SlideType;
  slideIdx: number;
  onChange: (patch: Partial<SlideType>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiou, setCopiou] = useState(false);

  const prompt = buildSlidePrompt(slide, dia);
  const assetId = slideAssetId(dia, slideIdx);
  const fundo = slide.fundo ?? "";
  const fundoClaro = !!slide.fundoClaro;

  async function uploadFiles(files: FileList | File[]) {
    setErro(null);
    const img = Array.from(files).find((f) => /\.(jpe?g|png|webp)$/i.test(f.name));
    if (!img) {
      setErro("Arrasta um ficheiro .jpg / .png / .webp");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", img);
      fd.append("slideId", assetId);
      const r = await fetch("/api/admin/carrossel-veus/upload-fundo", {
        method: "POST",
        body: fd,
      });
      const json = (await r.json()) as { url?: string; erro?: string };
      if (!r.ok || !json.url) throw new Error(json.erro || "Upload falhou");
      onChange({ fundo: json.url } as Partial<SlideType>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files);
  }
  async function copiar() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiou(true);
      setTimeout(() => setCopiou(false), 1500);
    } catch {
      setErro("Não consegui copiar. Usa cmd/ctrl-C manualmente.");
    }
  }

  const role = slide.tipo === "capa" ? "Capa" : slide.tipo === "cta" ? "Fecho (CTA)" : "Slide";

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="rounded-lg border border-escola-border/60 bg-escola-bg/40 p-3 space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-escola-dourado">
          {role} · {assetId}
        </span>
        <label className="flex items-center gap-1 text-[10px] text-escola-creme-50">
          <input
            type="checkbox"
            checked={fundoClaro}
            onChange={(e) => onChange({ fundoClaro: e.target.checked } as Partial<SlideType>)}
          />
          base clara
        </label>
      </div>

      <div className="relative">
        <textarea
          value={prompt}
          readOnly
          rows={3}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] leading-snug text-escola-creme-50"
        />
        <button
          type="button"
          onClick={copiar}
          className="absolute right-1 top-1 rounded bg-escola-card/80 px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light"
        >
          {copiou ? "✓" : "Copiar"}
        </button>
      </div>

      {fundo ? (
        <div className="flex items-center gap-3 rounded bg-escola-card/40 p-2">
          <img
            src={fundo}
            alt={assetId}
            className="h-16 w-9 rounded border border-escola-border object-cover"
          />
          <div className="min-w-0 flex-1 text-[10px] text-escola-creme-50">
            <p className="truncate" title={fundo}>
              {fundo.split("/").pop()?.split("?")[0]}
            </p>
            <p className="mt-0.5 text-[9px] opacity-60">Arrasta nova imagem para substituir</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ fundo: undefined } as Partial<SlideType>)}
            className="rounded border border-red-700/40 px-2 py-1 text-[10px] text-red-300 hover:border-red-500"
          >
            remover
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-escola-border bg-escola-card/40 p-3 text-center text-[11px] text-escola-creme-50 hover:border-escola-dourado/50">
          <span>{busy ? "A carregar…" : "Arrasta JPG/PNG/WebP — ou clica para escolher"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy}
            className="hidden"
          />
        </label>
      )}

      {erro && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[10px] text-red-300">
          {erro}
        </div>
      )}
    </div>
  );
}

/**
 * Secção "Fundo MJ" para o EditModal de um slide.
 * - Mostra o prompt MJ derivado do texto + véu (atualiza enquanto edita).
 * - Permite override via `notaVisual` (texto livre).
 * - Botão de copiar prompt.
 * - Dropzone (drag & drop ou clique) → upload para Supabase via API → URL.
 * - Toggle "base clara" para escolher scrim adequado.
 * - Preview/thumbnail do fundo carregado + botão remover.
 *
 * Padrão de dropzone copiado de components/hoje-em-mim/MotionLibrary.tsx.
 */
function FundoMJSection({
  dia,
  slide,
  slideIdx,
  draftSlide,
  fundo,
  fundoClaro,
  notaVisual,
  onFundoChange,
  onFundoClaroChange,
  onNotaVisualChange,
}: {
  dia: Dia;
  slide: SlideType;
  slideIdx: number;
  draftSlide: SlideType;
  fundo: string;
  fundoClaro: boolean;
  notaVisual: string;
  onFundoChange: (url: string) => void;
  onFundoClaroChange: (v: boolean) => void;
  onNotaVisualChange: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiou, setCopiou] = useState(false);

  // Apaga o eslint warning sobre var não usada — usamos `slide` para o id estável
  // (slideIdx é a posição no array, slide preserva o tipo).
  void slide;

  const prompt = buildSlidePrompt(draftSlide, dia);
  const assetId = slideAssetId(dia, slideIdx);

  async function uploadFiles(files: FileList | File[]) {
    setErro(null);
    const arr = Array.from(files);
    const img = arr.find((f) => /\.(jpe?g|png|webp)$/i.test(f.name));
    if (!img) {
      setErro("Arrasta um ficheiro .jpg/.png/.webp");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", img);
      fd.append("slideId", assetId);
      const r = await fetch("/api/admin/carrossel-veus/upload-fundo", {
        method: "POST",
        body: fd,
      });
      const json = (await r.json()) as { url?: string; erro?: string };
      if (!r.ok || !json.url) throw new Error(json.erro || "Upload falhou");
      onFundoChange(json.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiou(true);
      setTimeout(() => setCopiou(false), 1500);
    } catch {
      setErro("Não consegui copiar — usa cmd/ctrl-C manualmente");
    }
  }

  return (
    <div className="mt-2 space-y-3 rounded border border-escola-border/60 bg-escola-bg/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-escola-dourado">
          Fundo MJ · {assetId}
        </span>
        <label className="flex items-center gap-1 text-[11px] text-escola-creme-50">
          <input
            type="checkbox"
            checked={fundoClaro}
            onChange={(e) => onFundoClaroChange(e.target.checked)}
          />
          base clara
        </label>
      </div>

      <Field label="Nota visual (opcional, força a cena — substitui derivação automática)">
        <input
          value={notaVisual}
          onChange={(e) => onNotaVisualChange(e.target.value)}
          placeholder="ex: dois caminhos paralelos em savana ao amanhecer"
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme placeholder:text-escola-creme-50"
        />
      </Field>

      <Field label="Prompt MJ (derivado)">
        <textarea
          value={prompt}
          readOnly
          rows={4}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[12px] text-escola-creme-50"
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copiar}
          className="rounded border border-escola-border px-3 py-1 text-xs text-escola-creme hover:border-escola-dourado/40"
        >
          {copiou ? "✓ copiado" : "Copiar prompt"}
        </button>
        <label className="cursor-pointer rounded border border-escola-border px-3 py-1 text-xs text-escola-creme hover:border-escola-dourado/40">
          {busy ? "A carregar…" : "Escolher imagem"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy}
            className="hidden"
          />
        </label>
        {fundo && (
          <button
            type="button"
            onClick={() => onFundoChange("")}
            className="rounded border border-red-700/40 px-3 py-1 text-xs text-red-300 hover:border-red-500"
          >
            Remover fundo
          </button>
        )}
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded border-2 border-dashed border-escola-border bg-escola-card/40 p-3 text-center text-xs text-escola-creme-50"
      >
        Arrasta JPG/PNG/WebP para aqui
      </div>

      {fundo && (
        <div className="flex items-center gap-3">
          <img
            src={fundo}
            alt={`fundo ${assetId}`}
            className="h-24 w-14 rounded border border-escola-border object-cover"
          />
          <span className="truncate text-[11px] text-escola-creme-50" title={fundo}>
            {fundo.split("/").pop()?.split("?")[0]}
          </span>
        </div>
      )}

      {erro && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
          {erro}
        </div>
      )}
    </div>
  );
}

/**
 * Mostra um único slide preenchendo o ecrã (mantém aspect 9:16).
 * Útil em mobile para ver o slide grande sem precisar fazer download.
 */
export function FullscreenSlide({
  dia,
  slide,
  indice,
  onClose,
  onDownload,
}: {
  dia: Dia;
  slide: SlideType;
  indice: number;
  onClose: () => void;
  onDownload: () => void;
}) {
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    function fit() {
      const margin = 80;
      const sH = (window.innerHeight - margin) / 1920;
      const sW = (window.innerWidth - 32) / 1080;
      setScale(Math.max(0.15, Math.min(sH, sW)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4">
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={onDownload}
          className="rounded bg-escola-card px-3 py-2 text-xs text-escola-creme hover:bg-escola-bg-light"
        >
          ↓ PNG
        </button>
        <button
          onClick={onClose}
          className="rounded bg-escola-card px-3 py-2 text-xs text-escola-creme hover:bg-escola-bg-light"
        >
          ✕
        </button>
      </div>
      <p className="mb-3 text-center text-xs text-escola-creme-50">
        Dia {dia.numero} · {dia.veu} · slide {indice + 1}/{dia.slides.length}
      </p>
      <div className="overflow-hidden rounded border border-escola-border">
        <Slide dia={dia} slide={slide} indice={indice} scale={scale} />
      </div>
    </div>
  );
}
