"use client";

import { useEffect, useRef } from "react";
import type { Dia, Slide as SlideType } from "./content";
import { DEFAULT_THEME, type CarouselTheme } from "@/lib/carousel-themes";

const W = 1080;
const H = 1920;
const PAD = 110;

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

type Props = {
  dia: Dia;
  slide: SlideType;
  indice: number;
  scale?: number;
  theme?: CarouselTheme;
};

export function Slide({ dia, slide, indice, scale = 1, theme = DEFAULT_THEME }: Props) {
  return (
    <div style={{ width: W * scale, height: H * scale, overflow: "hidden", flexShrink: 0 }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <SlideInner dia={dia} slide={slide} indice={indice} theme={theme} />
      </div>
    </div>
  );
}

function SlideInner({ dia, slide, indice, theme }: { dia: Dia; slide: SlideType; indice: number; theme: CarouselTheme }) {
  if (slide.tipo === "capa") return <Capa dia={dia} slide={slide} C={theme} />;
  if (slide.tipo === "conteudo") return <Conteudo dia={dia} slide={slide} indice={indice} C={theme} />;
  return <Cta slide={slide} C={theme} />;
}

const slideBase: React.CSSProperties = {
  position: "relative",
  width: W,
  height: H,
  overflow: "hidden",
  fontFamily: '"Inter", system-ui, sans-serif',
  fontFeatureSettings: '"liga", "kern", "dlig"',
  WebkitFontSmoothing: "antialiased",
  textRendering: "geometricPrecision",
  boxSizing: "border-box",
};

const grainStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: GRAIN_SVG,
  backgroundSize: "400px 400px",
  mixBlendMode: "overlay",
  opacity: 0.45,
};
const grainDarkStyle: React.CSSProperties = {
  ...grainStyle,
  mixBlendMode: "screen",
  opacity: 0.18,
};
const vignetteDark: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(ellipse 80% 60% at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
};
const vignetteLight: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(ellipse 90% 70% at center, transparent 50%, rgba(60, 35, 15, 0.18) 100%)",
};
const glowGold: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(201, 169, 97, 0.10) 0%, transparent 70%)",
};
const glowTerra: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(184, 92, 56, 0.10) 0%, transparent 70%)",
};

/* ─── FUNDO MJ ─────────────────────────────────────────── */
/**
 * Camada de imagem-fundo MJ. Renderiza por baixo dos overlays decorativos
 * (grain/vignette/glow) e do conteúdo. Aplica um scrim para garantir
 * legibilidade do texto: escuro para fundos com base clara,
 * radial-warm para fundos escuros (default).
 */
function FundoLayer({ url, claro }: { url: string; claro?: boolean }) {
  const scrim: React.CSSProperties = claro
    ? {
        // Texto escuro: cobrir centro com ivory denso para garantir leitura.
        background:
          "radial-gradient(ellipse 78% 62% at center, rgba(245,234,213,0.94) 0%, rgba(245,234,213,0.62) 100%)",
      }
    : {
        // Texto claro: escurecer o fundo com warm-dark forte.
        background:
          "radial-gradient(ellipse 72% 58% at center, rgba(15,12,10,0.68) 0%, rgba(15,12,10,0.92) 100%)",
      };
  return (
    <>
      <img
        src={url}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          ...scrim,
        }}
      />
    </>
  );
}

/* ─── ORNAMENTOS ────────────────────────────────────────── */
/**
 * "Véus a levantar" — três hair-lines horizontais empilhadas, decrescentes
 * em comprimento e opacidade. Metáfora literal dos véus que se vão
 * soltando. Exclusivo da marca, não copiado.
 */
function VeusAsLevantar({ color, dir = "down" }: { color: string; dir?: "up" | "down" }) {
  const lines = dir === "down"
    ? [{ w: 320, o: 0.65 }, { w: 200, o: 0.45 }, { w: 100, o: 0.28 }]
    : [{ w: 100, o: 0.28 }, { w: 200, o: 0.45 }, { w: 320, o: 0.65 }];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {lines.map((l, i) => (
        <span
          key={i}
          style={{ width: l.w, height: 1, background: color, opacity: l.o }}
        />
      ))}
    </div>
  );
}

/**
 * Cantoneiras nos 4 cantos do slide — 1px gold, 56px de braço. Frame
 * delicado que desenha o limite do slide sem peso.
 */
function Cantoneiras({ color }: { color: string }) {
  const ARM = 56;
  const INSET = 60;
  const stroke = 1;
  const common: React.CSSProperties = {
    position: "absolute",
    background: color,
    opacity: 0.55,
    pointerEvents: "none",
    zIndex: 3,
  };
  return (
    <>
      {/* top-left */}
      <span style={{ ...common, top: INSET, left: INSET, width: ARM, height: stroke }} />
      <span style={{ ...common, top: INSET, left: INSET, width: stroke, height: ARM }} />
      {/* top-right */}
      <span style={{ ...common, top: INSET, right: INSET, width: ARM, height: stroke }} />
      <span style={{ ...common, top: INSET, right: INSET, width: stroke, height: ARM }} />
      {/* bottom-left */}
      <span style={{ ...common, bottom: INSET, left: INSET, width: ARM, height: stroke }} />
      <span style={{ ...common, bottom: INSET, left: INSET, width: stroke, height: ARM }} />
      {/* bottom-right */}
      <span style={{ ...common, bottom: INSET, right: INSET, width: ARM, height: stroke }} />
      <span style={{ ...common, bottom: INSET, right: INSET, width: stroke, height: ARM }} />
    </>
  );
}

/* ─── CAPA ─────────────────────────────────────────── */

function Capa({ dia, slide, C }: { dia: Dia; slide: Extract<SlideType, { tipo: "capa" }>; C: CarouselTheme }) {
  const veuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = veuRef.current;
    if (!el) return;
    const apply = () => {
      const max = 860;
      let size = 180;
      el.style.fontSize = `${size}px`;
      let g = 80;
      while (el.scrollWidth > max && size > 110 && g-- > 0) {
        size -= 4;
        el.style.fontSize = `${size}px`;
      }
    };
    if (document.fonts?.ready) document.fonts.ready.then(apply);
    else apply();
  }, [dia.veu]);

  const fundoUrl = slide.fundo ?? dia.fundo;
  // Modo luz: capa fica ivory (em vez de deep). Texto fica ink.
  const luz = C.mode === "luz";
  const bg = luz
    ? `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.ivory} 0%, ${C.parchmentDark} 70%)`
    : `radial-gradient(ellipse 70% 50% at 50% 35%, ${C.deepWarm} 0%, ${C.deep} 70%)`;
  const txt = luz ? C.ink : C.ivory;
  return (
    <div
      style={{
        ...slideBase,
        background: bg,
        color: txt,
      }}
    >
      {fundoUrl && <FundoLayer url={fundoUrl} claro={luz || slide.fundoClaro} />}
      <div style={luz ? grainStyle : grainDarkStyle} />
      <div style={luz ? vignetteLight : vignetteDark} />
      <div style={glowGold} />
      <Cantoneiras color={C.gold} />
      <div
        style={{
          position: "absolute",
          top: 280,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: 720,
          lineHeight: 1,
          color: "rgba(201, 169, 97, 0.05)",
          letterSpacing: "-0.05em",
          userSelect: "none",
          zIndex: 1,
        }}
      >
        {dia.numero}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: `150px ${PAD}px 200px`,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
          <VeusAsLevantar color={C.gold} dir="down" />
          <div
            ref={veuRef}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 180,
              lineHeight: 0.95,
              textAlign: "center",
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
              textShadow: fundoUrl
                ? (luz
                    ? "0 1px 6px rgba(245,234,213,0.85), 0 0 14px rgba(245,234,213,0.55)"
                    : "0 1px 6px rgba(15,12,10,0.85), 0 0 14px rgba(15,12,10,0.55)")
                : "none",
            }}
          >
            {dia.veu}
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 28,
              color: C.gold,
              letterSpacing: "1.2em",
              opacity: 0.8,
            }}
          >
            ◇ ◇ ◇
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 38,
              lineHeight: 1.35,
              textAlign: "center",
              color: C.mist,
              maxWidth: 720,
            }}
          >
            {dia.subtitulo}
          </div>
        </div>

        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontSize: 56,
            lineHeight: 1.4,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {slide.linha1}
          <br />
          {slide.linha2}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <span style={{ width: 80, height: 1, background: C.gold, opacity: 0.55 }} />
          <span
            style={{
              fontWeight: 300,
              fontSize: 18,
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              color: C.gold,
              opacity: 0.7,
            }}
          >
            os sete véus
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── CONTEÚDO ─────────────────────────────────────────── */

function Conteudo({
  dia,
  slide,
  indice,
  C,
}: {
  dia: Dia;
  slide: Extract<SlideType, { tipo: "conteudo" }>;
  indice: number;
  C: CarouselTheme;
}) {
  const num = String(indice + 1).padStart(2, "0");
  const ePoetico = slide.estilo === "poetico";
  const longo = slide.texto.length > 200;
  const fundoUrl = slide.fundo ?? dia.fundo;
  const sombra = C.mode === "sombra";
  const luz = C.mode === "luz";
  // Conteúdo: default base clara. Modo sombra força fundo escuro + texto claro.
  const fundoClaro = sombra ? !!slide.fundoClaro : slide.fundoClaro ?? true;
  const bg = sombra
    ? `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 100%)`
    : `radial-gradient(ellipse 80% 70% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 100%)`;
  const txt = sombra ? C.ivory : C.ink;
  void luz;

  return (
    <div
      style={{
        ...slideBase,
        background: bg,
        color: txt,
      }}
    >
      {fundoUrl && <FundoLayer url={fundoUrl} claro={fundoClaro} />}
      <div style={sombra ? grainDarkStyle : grainStyle} />
      <div style={sombra ? vignetteDark : vignetteLight} />
      <Cantoneiras color={sombra ? C.gold : C.terracotta} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: `${PAD}px ${PAD}px`,
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontWeight: 400,
            fontSize: 18,
            letterSpacing: "0.45em",
            color: "rgba(26,22,20,0.4)",
            textTransform: "uppercase",
          }}
        >
          <span>os sete véus</span>
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 32,
              letterSpacing: 0,
              color: "rgba(184, 92, 56, 0.55)",
              textTransform: "none",
            }}
          >
            {num} / 06
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            textAlign: "center",
            gap: 44,
            padding: "0 20px",
          }}
        >
          {ePoetico && (
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: 56,
                color: C.terracotta,
                opacity: 0.7,
                lineHeight: 1,
              }}
            >
              ~
            </div>
          )}

          {!ePoetico && slide.titulo && (
            <div
              style={{
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: C.terracotta,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <span style={{ height: 1, width: 64, background: C.terracotta, opacity: 0.5 }} />
              {slide.titulo}
              <span style={{ height: 1, width: 64, background: C.terracotta, opacity: 0.5 }} />
            </div>
          )}

          <div
            style={
              ePoetico
                ? {
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: 72,
                    lineHeight: 1.3,
                    color: C.ink,
                    whiteSpace: "pre-line",
                    maxWidth: 820,
                    letterSpacing: "-0.005em",
                  }
                : {
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 400,
                    fontSize: longo ? 44 : 50,
                    lineHeight: 1.42,
                    color: C.ink,
                    whiteSpace: "pre-line",
                    maxWidth: 800,
                    letterSpacing: "-0.005em",
                  }
            }
          >
            {slide.texto}
          </div>

          {ePoetico && (
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontStyle: "italic",
                fontSize: 56,
                color: C.terracotta,
                opacity: 0.7,
                lineHeight: 1,
              }}
            >
              ~
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontSize: 24,
              color: C.terracotta,
              letterSpacing: "0.8em",
              opacity: 0.6,
            }}
          >
            ◇ ◇ ◇
          </span>
          <span
            style={{
              fontWeight: 300,
              fontSize: 16,
              letterSpacing: "0.6em",
              textTransform: "uppercase",
              color: "rgba(26,22,20,0.35)",
            }}
          >
            {dia.veu.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── CTA ─────────────────────────────────────────── */

function Cta({ slide, C }: { slide: Extract<SlideType, { tipo: "cta" }>; C: CarouselTheme }) {
  const recursoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = recursoRef.current;
    if (!el) return;
    const apply = () => {
      const max = 820;
      let size = 78;
      el.style.fontSize = `${size}px`;
      let g = 60;
      while (el.scrollWidth > max && size > 50 && g-- > 0) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    };
    if (document.fonts?.ready) document.fonts.ready.then(apply);
    else apply();
  }, [slide.recurso]);

  const fundoUrl = slide.fundo;
  const luz = C.mode === "luz";
  const bg = luz
    ? `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.ivory} 0%, ${C.parchmentDark} 80%)`
    : `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.deepWarm} 0%, ${C.deep} 80%)`;
  const txt = luz ? C.ink : C.ivory;
  return (
    <div
      style={{
        ...slideBase,
        background: bg,
        color: txt,
      }}
    >
      {fundoUrl && <FundoLayer url={fundoUrl} claro={luz || slide.fundoClaro} />}
      <div style={luz ? grainStyle : grainDarkStyle} />
      <div style={luz ? vignetteLight : vignetteDark} />
      <div style={glowTerra} />
      <Cantoneiras color={C.gold} />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          right: -120,
          fontSize: 600,
          lineHeight: 1,
          color: C.gold,
          opacity: 0.04,
          zIndex: 1,
          userSelect: "none",
        }}
      >
        🌀
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: `180px ${PAD}px 180px`,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1px solid ${C.gold}`,
              opacity: 0.35,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: 16,
              borderRadius: "50%",
              border: `1px solid ${C.gold}`,
              opacity: 0.18,
            }}
          />
          <span style={{ fontSize: 96, lineHeight: 1 }}>{slide.icone}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center", maxWidth: 800 }}>
          <div
            ref={recursoRef}
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 78,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {slide.recurso}
          </div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 38,
              lineHeight: 1.45,
              color: C.mist,
              maxWidth: 720,
            }}
          >
            {slide.descricao}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", maxWidth: 720 }}>
          <span style={{ width: "100%", height: 1, background: C.gold, opacity: 0.55 }} />
          <span
            style={{
              fontFamily: '"JetBrains Mono", "Inter", monospace',
              fontWeight: 400,
              fontSize: 30,
              color: C.terracotta,
              letterSpacing: "0.04em",
            }}
          >
            {slide.url}
          </span>
          <span style={{ width: "100%", height: 1, background: C.gold, opacity: 0.55 }} />
        </div>
      </div>
    </div>
  );
}
