const cls = 'w-4 h-4 shrink-0';

export function VivianneMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <g fill="none" stroke="#EBAE4A" strokeWidth="22" strokeLinecap="round">
        <path d="M170 130 C170 270 200 340 248 374" />
        <path d="M342 130 C342 270 312 340 264 374" />
      </g>
      <circle cx="256" cy="244" r="22" fill="#F4C56A" />
      <path
        d="M170 400 C200 376 230 420 256 400 C282 380 312 420 342 400"
        fill="none"
        stroke="#F4C56A"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FreeMeMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <path
        d="M256 256 C256 210 220 180 180 180 C130 180 100 220 100 270 C100 340 150 390 220 390 C320 390 380 320 380 220 C380 130 310 70 220 70 C120 70 50 150 50 250 C50 380 150 470 290 470 C345 470 385 455 425 425"
        fill="none"
        stroke="#9A5A43"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InfonteMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <path
        d="M256 116 C198 218 166 282 166 334 A90 90 0 0 0 346 334 C346 282 314 218 256 116 Z"
        fill="none"
        stroke="#EBAE4A"
        strokeWidth="22"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="338" r="34" fill="#F4C56A" />
    </svg>
  );
}

export function SyncHimMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <g transform="translate(256,256)">
        <rect x="-150" y="-150" width="300" height="300" fill="none" stroke="#B8843D" strokeWidth="22" />
        <rect x="-150" y="-150" width="300" height="300" transform="rotate(45)" fill="none" stroke="#B8843D" strokeWidth="22" />
        <circle r="46" fill="#8B2235" />
      </g>
    </svg>
  );
}

export function EscolaMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <g transform="translate(256,256)" fill="none" stroke="#C9B6FA" strokeWidth="22" strokeLinecap="round">
        <ellipse cx="0" cy="-108" rx="34" ry="86" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(51.4)" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(102.8)" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(154.3)" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(205.7)" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(257.1)" />
        <ellipse cx="0" cy="-108" rx="34" ry="86" transform="rotate(308.6)" />
      </g>
      <circle cx="256" cy="256" r="20" fill="#C9B6FA" />
    </svg>
  );
}

export function LoranneMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <g transform="translate(256,256)" fill="none" stroke="#EBAE4A" strokeWidth="22" strokeLinecap="round">
        <path d="M0 -30 C 60 -90 130 -100 160 -50" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(51.4)" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(102.8)" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(154.3)" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(205.7)" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(257.1)" />
        <path d="M0 -30 C 60 -90 130 -100 160 -50" transform="rotate(308.6)" />
      </g>
      <circle cx="256" cy="256" r="14" fill="#F4C56A" />
    </svg>
  );
}

// Marcas dos 3 métodos-filhos (favicons das contas). Cada uma é o símbolo da
// capa do método, reduzido a um sinal: ver = a margem (horizonte + luz);
// vir = o colo (taça que ampara a luz); viver = descalça (a porta de luz).
export function VerSoltarMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <circle cx="256" cy="232" r="40" fill="#F4C56A" />
      <line x1="96" y1="300" x2="416" y2="300" stroke="#EBAE4A" strokeWidth="22" strokeLinecap="round" />
      <g stroke="#F4C56A" strokeWidth="14" strokeLinecap="round" opacity="0.7">
        <line x1="226" y1="340" x2="286" y2="340" />
        <line x1="206" y1="380" x2="306" y2="380" />
      </g>
    </svg>
  );
}

export function VirSoltarMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <circle cx="256" cy="244" r="46" fill="#F4C56A" />
      <path d="M132 250 C132 380 200 430 256 430 C312 430 380 380 380 250"
        fill="none" stroke="#EBAE4A" strokeWidth="22" strokeLinecap="round" />
    </svg>
  );
}

export function ViverSoltarMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden className={cls}>
      <path d="M168 420 L168 232 Q168 132 256 132 Q344 132 344 232 L344 420"
        fill="none" stroke="#EBAE4A" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M236 420 L236 268 Q236 212 256 212 Q276 212 276 268 L276 420 Z" fill="#F4C56A" opacity="0.85" />
    </svg>
  );
}
