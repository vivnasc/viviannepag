'use client';

// MetodoAvatar: foto de perfil (1:1) de cada conta filha do Método VS.
// Identidade própria: paleta da conta + um símbolo abstrato (a margem / o colo /
// descalça) + o movimento. Pensado para ler bem em círculo pequeno (Instagram).

import type { Conta } from '@/lib/metodo/contas';

// símbolo abstrato por conta, desenhado em SVG (sem texto, escala bem)
function Simbolo({ id, accent }: { id: string; accent: string }) {
  if (id === 'vir') {
    // o colo: um arco que acolhe um ponto de luz (a lareira/ninho)
    return (
      <g stroke={accent} strokeWidth={16} fill="none" strokeLinecap="round">
        <path d="M150 250 q150 180 300 0" />
        <circle cx="300" cy="250" r="26" fill={accent} stroke="none" opacity={0.95} />
      </g>
    );
  }
  if (id === 'viver') {
    // descalça: um limiar (arco de porta) com luz a sair
    return (
      <g stroke={accent} strokeWidth={16} fill="none" strokeLinecap="round">
        <path d="M205 330 L205 235 q95 -120 190 0 L395 330" />
        <line x1="300" y1="250" x2="300" y2="320" strokeWidth={10} opacity={0.85} />
      </g>
    );
  }
  // ver: a margem (uma linha de luz no horizonte sobre água calma)
  return (
    <g stroke={accent} strokeLinecap="round" fill="none">
      <line x1="160" y1="270" x2="440" y2="270" strokeWidth={16} />
      <line x1="205" y1="312" x2="395" y2="312" strokeWidth={9} opacity={0.5} />
    </g>
  );
}

export function MetodoAvatar({ conta, size = 320 }: { conta: Conta; size?: number }) {
  const { bg1, bg2, accent } = conta.paleta;
  return (
    <div style={{ width: size, height: size, borderRadius: 16, overflow: 'hidden' }}>
      <svg viewBox="0 0 600 600" width={size} height={size} style={{ display: 'block' }}>
        <defs>
          <radialGradient id={`g-${conta.id}`} cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor={bg1} />
            <stop offset="100%" stopColor={bg2} />
          </radialGradient>
        </defs>
        <rect width="600" height="600" fill={`url(#g-${conta.id})`} />
        <Simbolo id={conta.id} accent={accent} />
        {/* o movimento, discreto, em baixo */}
        <text x="300" y="430" textAnchor="middle" fontFamily='"Cormorant Garamond", Georgia, serif' fontSize="62" fontStyle="italic" fill="#F4ECDD" opacity={0.92}>{conta.movimento}</text>
        <text x="300" y="478" textAnchor="middle" fontFamily='"Inter", system-ui, sans-serif' fontSize="22" letterSpacing="6" fill={accent} opacity={0.85}>MÉTODO VS</text>
      </svg>
    </div>
  );
}
