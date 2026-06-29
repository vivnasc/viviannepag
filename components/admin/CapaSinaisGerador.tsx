'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Gerador da capa de Os 7 Sinais de Desencaixe — TIPOGRÁFICA e clara, desenhada
// em canvas no browser (sem IA, sem fundo escuro). Controlos ao vivo: variante,
// posição do sinal "fora da linha", idioma. Descarrega o PNG e/ou guarda no site.
// O símbolo: 7 sinais em fila, 6 cheios alinhados + 1 fora da linha e vazado.

const W = 1600, H = 2560;

type Variante = 'marfim' | 'noite';
const PALETAS: Record<Variante, { bg: string; ink: string; accent: string; rule: string; sub: string; meta: string; dot: string; odd: string }> = {
  marfim: { bg: '#EFE6D4', ink: '#33304A', accent: '#B5823B', rule: '#B5823B', sub: '#6E6578', meta: '#33304A', dot: '#B5823B', odd: '#C7A36A' },
  noite:  { bg: '#1E2526', ink: '#F2E9D8', accent: '#C29A4D', rule: '#B5823B', sub: '#C7B79C', meta: '#E7DCC8', dot: '#C29A4D', odd: '#8FA08C' },
};

const STR = {
  pt: { t1: 'Os 7 Sinais', t2: 'de Desencaixe', sub: 'O equilíbrio entre pertença e autenticidade', foot: 'IRMÃO DE OS SETE VÉUS' },
  en: { t1: 'The Seven Signs', t2: 'of Not Belonging', sub: 'The balance between belonging and authenticity', foot: 'A COMPANION TO THE SEVEN VEILS' },
};

const AUTHOR = 'VIVIANNE DOS SANTOS';
const SITE = 'VIVIANNEDOSSANTOS.COM';

function tracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  // centra texto com espaçamento entre letras (canvas não tem letter-spacing fiável)
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, x, y); x += widths[i] + spacing; });
  ctx.textAlign = 'center';
}

export function CapaSinaisGerador() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [variante, setVariante] = useState<Variante>('marfim');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [foraIdx, setForaIdx] = useState(4); // qual dos 7 sinais fica fora da linha (0..6)
  const [pronto, setPronto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState('');

  const desenhar = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const v = PALETAS[variante]; const s = STR[lang];

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = v.bg; ctx.fillRect(0, 0, W, H);

    // keyline fina
    ctx.strokeStyle = v.accent; ctx.globalAlpha = 0.28; ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, W - 108, H - 108); ctx.globalAlpha = 1;

    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    // autora (topo)
    ctx.fillStyle = v.meta; ctx.font = '400 31px Outfit, sans-serif';
    tracked(ctx, AUTHOR, W / 2, 250, 12);

    // símbolo: 7 sinais em fila
    const gap = 92, r = 17, baseY = 1060, n = 7;
    const startX = W / 2 - (gap * (n - 1)) / 2;
    for (let i = 0; i < n; i++) {
      const x = startX + i * gap;
      if (i === foraIdx) {
        ctx.beginPath(); ctx.arc(x, baseY - 40, r, 0, Math.PI * 2);
        ctx.strokeStyle = v.odd; ctx.lineWidth = 3.4; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(x, baseY, r, 0, Math.PI * 2);
        ctx.fillStyle = v.dot; ctx.fill();
      }
    }

    // título (2 linhas)
    ctx.fillStyle = v.ink; ctx.font = '340 122px Fraunces, serif';
    ctx.fillText(s.t1, W / 2, 1310);
    ctx.fillText(s.t2, W / 2, 1440);

    // rule
    ctx.strokeStyle = v.rule; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(W / 2 - 60, 1530); ctx.lineTo(W / 2 + 60, 1530); ctx.stroke();
    ctx.globalAlpha = 1;

    // subtítulo (itálico)
    ctx.fillStyle = v.sub; ctx.font = 'italic 400 46px Fraunces, serif';
    ctx.fillText(s.sub, W / 2, 1640);

    // rodapé
    ctx.fillStyle = v.meta; ctx.globalAlpha = 0.85; ctx.font = '400 28px Outfit, sans-serif';
    tracked(ctx, s.foot, W / 2, H - 206, 9); ctx.globalAlpha = 1;
    ctx.fillStyle = v.meta; ctx.globalAlpha = 0.5; ctx.font = '300 25px Outfit, sans-serif';
    tracked(ctx, SITE, W / 2, H - 150, 7); ctx.globalAlpha = 1;
  }, [variante, lang, foraIdx]);

  // garante fontes carregadas antes de desenhar
  useEffect(() => {
    let vivo = true;
    const fonts = ['340 122px Fraunces', 'italic 400 46px Fraunces', '400 31px Outfit', '300 25px Outfit'];
    Promise.all(fonts.map((f) => (document as Document & { fonts: FontFaceSet }).fonts.load(f)))
      .then(() => (document as Document & { fonts: FontFaceSet }).fonts.ready)
      .then(() => { if (vivo) { setPronto(true); desenhar(); } })
      .catch(() => { if (vivo) { setPronto(true); desenhar(); } });
    return () => { vivo = false; };
  }, [desenhar]);

  useEffect(() => { if (pronto) desenhar(); }, [pronto, desenhar]);

  const descarregar = () => {
    const cv = ref.current; if (!cv) return;
    cv.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url; a.download = `os-7-sinais-capa-${variante}${lang === 'en' ? '-en' : ''}.png`;
      a.click(); URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const guardarNoSite = () => {
    const cv = ref.current; if (!cv) return;
    setGuardando(true); setMsg('');
    cv.toBlob(async (b) => {
      if (!b) { setGuardando(false); return; }
      try {
        const fd = new FormData();
        fd.append('ficheiro', b, 'capa.png');
        fd.append('lang', lang);
        const res = await fetch('/api/admin/capa-sinais', { method: 'POST', body: fd });
        const j = await res.json();
        setMsg(res.ok ? 'guardada no site ✓' : `erro: ${j.erro ?? res.status}`);
      } catch (e) {
        setMsg(`erro: ${(e as Error).message}`);
      } finally { setGuardando(false); }
    }, 'image/png');
  };

  const btn = 'rounded-full px-5 py-2 text-[0.85rem] font-sans transition-colors';
  const chip = (on: boolean) => `${btn} ${on ? 'bg-ambar text-[#2A1C12]' : 'bg-creme/[0.06] text-creme-2 hover:bg-creme/[0.1]'}`;

  return (
    <section className="grid grid-cols-[1fr_320px] gap-8 max-[780px]:grid-cols-1">
      <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-center">
        <canvas ref={ref} width={W} height={H} className="w-full h-auto max-w-[420px] rounded-[8px] shadow-2xl" />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-2">variante</p>
          <div className="flex gap-2">
            <button className={chip(variante === 'marfim')} onClick={() => setVariante('marfim')}>marfim (claro)</button>
            <button className={chip(variante === 'noite')} onClick={() => setVariante('noite')}>noite</button>
          </div>
        </div>

        <div>
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-2">idioma</p>
          <div className="flex gap-2">
            <button className={chip(lang === 'pt')} onClick={() => setLang('pt')}>PT</button>
            <button className={chip(lang === 'en')} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>

        <div>
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-ocre mb-2">sinal fora da linha</p>
          <div className="flex gap-1.5 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <button key={i} className={chip(foraIdx === i)} onClick={() => setForaIdx(i)}>{i + 1}</button>
            ))}
          </div>
          <p className="text-creme-2/50 text-[0.78rem] mt-2 font-serif italic">qual dos 7 sinais não encaixa na fila</p>
        </div>

        <div className="border-t border-ocre/15 pt-5 flex flex-col gap-3">
          <button className={`${btn} bg-ambar text-[#2A1C12] hover:bg-ocre`} onClick={descarregar}>descarregar PNG</button>
          <button className={`${btn} bg-creme/[0.06] text-creme-2 hover:bg-creme/[0.1] disabled:opacity-50`} onClick={guardarNoSite} disabled={guardando}>
            {guardando ? 'a guardar…' : 'usar no site'}
          </button>
          {msg && <p className="text-[0.82rem] text-salvia">{msg}</p>}
        </div>
      </div>
    </section>
  );
}
