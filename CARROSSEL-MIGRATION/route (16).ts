"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import CollectionWorkspace from "@/components/admin/CollectionWorkspace";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";
import { themeById, type CarouselTheme } from "@/lib/carousel-themes";

type Colecao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: Dia[];
  theme: { id?: string };
  updatedAt: string;
};

export default function ColecaoEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [col, setCol] = useState<Colecao | null>(null);
  const [theme, setThemeState] = useState<CarouselTheme>(themeById(undefined));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/colecoes/${id}`, { cache: "no-store" });
        const data = await r.json();
        if (r.ok) {
          setCol(data);
          setThemeState(themeById(data.theme?.id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!col) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/colecoes/${col.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dias: col.dias,
          title: col.title,
          theme: { id: theme.id },
        }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.erro || `HTTP ${r.status}`);
      }
      setDirty(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha ao guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Auto-save 2s após uma alteração
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col, theme, dirty]);

  async function regenerateSlideFn(diaIdx: number, slideIdx: number, hint?: string): Promise<SlideType> {
    if (!col) throw new Error("colecção não carregada");
    const r = await fetch(`/api/admin/colecoes/${col.id}/regenerate-slide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diaIdx, slideIdx, hint }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
    return data.slide as SlideType;
  }

  const [regenAll, setRegenAll] = useState(false);
  async function regenerateAll() {
    if (!col) return;
    if (
      !confirm(
        "Regerar TODOS os slides desta colecção com o Claude actual?\n\nVai perder edições manuais nos slides. O brief actual da colecção é usado.\nLeva 60-90s."
      )
    ) return;
    setRegenAll(true);
    try {
      const r = await fetch(`/api/admin/colecoes/${col.id}/regenerate-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      // A API já persistiu na DB; actualizar o estado local sem disparar dirty.
      setCol({ ...col, dias: data.dias as Dia[] });
      setDirty(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Regerar falhou: ${msg}`);
    } finally {
      setRegenAll(false);
    }
  }

  const [packaging, setPackaging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  async function packageZip() {
    if (!col) return;
    setPackaging(true);
    setZipUrl(null);
    try {
      // Extrai weekNumber do título se vier do calendário ("...(Sem 22)")
      const m = col.title.match(/\(Sem\s+(\d+)\)\s*$/i);
      const payload: { weekNumber?: number } = {};
      if (m) payload.weekNumber = Number(m[1]);
      const r = await fetch(`/api/admin/colecoes/${col.id}/package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      setZipUrl(data.zipUrl);
      // Auto-download
      try {
        const blobRes = await fetch(data.zipUrl);
        const blob = await blobRes.blob();
        const obj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = obj;
        a.download = `${col.slug}-metricool.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(obj), 5000);
      } catch {
        window.open(data.zipUrl, "_blank");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Pacote falhou: ${msg}`);
    } finally {
      setPackaging(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-escola-creme-50">A carregar…</p>;
  }
  if (!col) {
    return (
      <div>
        <p className="mb-2 text-sm text-red-300">Colecção não encontrada.</p>
        <Link href="/admin/producao/colecoes" className="text-xs text-escola-dourado underline">
          ← voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href="/admin/producao/colecoes" className="hover:text-escola-dourado">
          ← colecções
        </Link>
        <span>/ {col.slug}</span>
        <button
          onClick={packageZip}
          disabled={packaging}
          className="ml-3 rounded border border-emerald-500/40 px-2 py-0.5 text-[11px] text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40"
          title="ZIP com MP4s + captions/ + metricool.csv pronto a importar"
        >
          {packaging ? "a empacotar…" : "📦 Pacote Metricool (ZIP)"}
        </button>
        {zipUrl && (
          <a
            href={zipUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 hover:bg-emerald-500/10"
            title="Re-abrir o ZIP gerado"
          >
            ↓ link
          </a>
        )}
        <span className="ml-auto">
          {saving ? "a guardar…" : dirty ? "alterações por guardar" : "✓ guardado"}
        </span>
      </div>

      <CollectionWorkspace
        title={col.title}
        campanha={col.title}
        slug={col.slug}
        dias={col.dias}
        onDiasChange={(d) => {
          setCol({ ...col, dias: d });
          setDirty(true);
        }}
        onTitleChange={(t) => {
          setCol({ ...col, title: t });
          setDirty(true);
        }}
        theme={theme}
        onThemeChange={(t) => {
          setThemeState(t);
          setDirty(true);
        }}
        regenerateSlideFn={regenerateSlideFn}
        description={<p className="italic">{col.brief}</p>}
        extraHeaderActions={
          <div className="flex gap-2">
            <button
              onClick={regenerateAll}
              disabled={regenAll || saving}
              className="rounded border border-escola-dourado/40 px-3 py-2 text-xs text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-30"
              title="Substitui os 42 slides com geração nova do Claude (usa brief actual). Útil para passar uma colecção antiga ao prompt actualizado."
            >
              {regenAll ? "a regerar… 60-90s" : "✦ regerar tudo (Claude)"}
            </button>
            <button
              onClick={save}
              disabled={!dirty || saving}
              className="rounded border border-escola-border px-3 py-2 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
            >
              {saving ? "…" : "💾 guardar agora"}
            </button>
          </div>
        }
      />
    </div>
  );
}
