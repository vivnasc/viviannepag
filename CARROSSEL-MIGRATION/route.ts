"use client";

import { useEffect, useState } from "react";
import CollectionWorkspace from "@/components/admin/CollectionWorkspace";
import { CAMPANHA, DIAS as DEFAULT_DIAS } from "./content";
import type { Dia } from "@/lib/carousel-types";
import { themeById, type CarouselTheme, DEFAULT_THEME } from "@/lib/carousel-themes";

const STORAGE_DIAS = "carrossel-veus.content";
const STORAGE_THEME = "carrossel-veus.theme";

export default function CarrosselVeusPage() {
  const [dias, setDias] = useState<Dia[]>(DEFAULT_DIAS);
  const [theme, setTheme] = useState<CarouselTheme>(DEFAULT_THEME);

  // Hidratar de localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_DIAS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_DIAS.length) setDias(parsed);
      }
      const tId = localStorage.getItem(STORAGE_THEME);
      if (tId) setTheme(themeById(tId));
    } catch {}
  }, []);

  // Persistir
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DIAS, JSON.stringify(dias));
    } catch {}
  }, [dias]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME, theme.id);
    } catch {}
  }, [theme]);

  return (
    <CollectionWorkspace
      title={`Carrossel · ${CAMPANHA}`}
      campanha={CAMPANHA}
      slug="estacao-veus"
      dias={dias}
      onDiasChange={setDias}
      originalDias={DEFAULT_DIAS}
      theme={theme}
      onThemeChange={setTheme}
      onReset={() => {
        if (confirm("Repor texto original (perde as tuas edições)?")) {
          setDias(DEFAULT_DIAS);
        }
      }}
      description={
        <p>
          42 slides verticais (7 dias × 6) para status do WhatsApp. Edita textos, escolhe tema,
          gera vozes ou marca "sem voz" para ir só com música Ancient Ground.{" "}
          <a
            href="/admin/producao/carrossel-veus/metricool"
            className="text-escola-dourado underline hover:text-escola-creme"
          >
            Exportar CSV Metricool (IG + TikTok)
          </a>
          .
        </p>
      }
    />
  );
}
