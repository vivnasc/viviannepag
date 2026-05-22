type Props = { className?: string; stroke?: number };

export function GotaAssina({ className = 'w-[76px] h-[76px]', stroke = 9 }: Props) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
      <g fill="none" stroke="#EBAE4A" strokeWidth={stroke} strokeLinecap="round">
        <path d="M150 120 C150 270 188 345 244 378" />
        <path d="M362 120 C362 270 324 345 268 378" />
        <path d="M206 116 C206 250 224 335 250 366" opacity="0.5" />
        <path d="M306 116 C306 250 288 335 262 366" opacity="0.5" />
      </g>
      <circle cx="256" cy="246" r="18" fill="#F4C56A" />
      <path
        d="M168 392 C200 366 224 414 256 392 C288 370 312 414 344 392"
        fill="none"
        stroke="#F4C56A"
        strokeWidth={Math.max(8, stroke + 3)}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GotaMini({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
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
