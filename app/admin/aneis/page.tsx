'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { toPng } from 'html-to-image';
import { AnelCover } from '@/components/admin/AnelCover';
import { Btn, Card } from '@/components/admin/EstudioKit';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Anéis FIXOS (sem base de dados). Cada um: tema + prompt MJ transcendente.
const ANEIS: { label: string; mj: string }[] = [
  { label: 'Transpessoal', mj: 'ethereal cosmic nebula, deep indigo and violet with soft golden starlight, translucent veils of light, volumetric god rays, transcendent and serene, fine art spiritual photography, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Constelação', mj: 'luminous golden threads and roots of light weaving through deep darkness, an interconnected glowing web, faint sacred geometry, ethereal and quiet, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Espiritualidade', mj: 'soft dawn light breaking through misty veils, a single luminous lotus, golden glow on deep blue, transcendent peaceful, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Desenvolvimento', mj: 'warm soft sunrise over a calm still horizon, gentle golden light, hopeful and serene, minimal fine art landscape, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Glossário', mj: 'a rising translucent veil of golden mist and light against deep indigo, abstract, soft sacred dreamlike, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Padrões', mj: 'luminous concentric circles and a repeating geometric pattern of golden light on deep navy, hypnotic sacred symmetry, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
  { label: 'Sobre', mj: 'warm ethereal golden light through soft fog, gentle luminous glow, abstract sacred calm, deep tones, fine art, ultra detailed, no people, no text, no logo --ar 1:1 --style raw' },
];
const PERFIL = { label: 'Véu a Véu', mj: 'USA A TUA FOTO PROFISSIONAL — rosto visível, sorriso suave, fundo escuro/neutro. As contas que mais crescem têm cara. Arrasta-a aqui em baixo. (Caso prefiras mesmo uma imagem gerada: a single luminous mandala of overlapping translucent veils, radiant gold light at the centre on a deep navy cosmos, sacred and symmetrical, ethereal, fine art, ultra detailed, centered composition, no people, no text, no logo --ar 1:1 --style raw)' };

// redimensiona p/ 1080x1080 e devolve dataURL
function resizeSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const S = 1080; const c = document.createElement('canvas'); c.width = S; c.height = S;
      const ctx = c.getContext('2d'); if (!ctx) return reject(new Error('canvas'));
      const s = Math.max(S / img.width, S / img.height); const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      resolve(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('img')); img.src = URL.createObjectURL(file);
  });
}

function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }} className="text-[0.58rem] px-2 py-1 rounded border border-ambar/40 text-ambar hover:bg-ambar/10">{ok ? '✓' : 'copiar prompt MJ'}</button>;
}

export default function AneisPage() {
  const [imgs, setImgs] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  // guarda em localStorage (persiste no teu aparelho)
  useEffect(() => { try { const s = localStorage.getItem('aneis-imgs'); if (s) setImgs(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('aneis-imgs', JSON.stringify(imgs)); } catch {} }, [imgs]);

  async function arrastar(file: File | undefined, label: string) {
    if (!file) return; setErro(null);
    try { const url = await resizeSquare(file); setImgs((p) => ({ ...p, [label]: url })); }
    catch (e) { setErro(String(e)); }
  }

  // download no browser
  const capRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<{ label: string; mj: string; perfil: boolean; nome: string } | null>(null);
  useEffect(() => {
    if (!cap) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 500));
        const node = capRef.current?.firstElementChild as HTMLElement | null;
        if (node) { const url = await toPng(node, { pixelRatio: 1, cacheBust: true }); const a = document.createElement('a'); a.href = url; a.download = `${cap.nome}.png`; a.click(); }
      } catch (e) { setErro('download: ' + String(e)); }
      setCap(null);
    })();
  }, [cap]);

  const Cartao = ({ a, perfil = false }: { a: { label: string; mj: string }; perfil?: boolean }) => {
    const url = imgs[a.label];
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-[210px]"><AnelCover label={a.label} imageUrl={url} perfil={perfil} mundo="escola" /></div>
        <span className="text-[0.72rem] opacity-80">{perfil ? 'foto de perfil' : a.label}</span>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <CopyButton text={a.mj} />
          <label className="text-[0.58rem] px-2 py-1 rounded border border-ocre/30 text-creme-2/70 hover:border-ambar hover:text-ambar cursor-pointer">arrastar imagem<input type="file" accept="image/*" hidden onChange={(e) => arrastar(e.target.files?.[0], a.label)} /></label>
          {url && <button onClick={() => setCap({ label: a.label, mj: a.mj, perfil, nome: perfil ? 'perfil-veu-a-veu' : `anel-${a.label.toLowerCase().replace(/\s+/g, '-')}` })} className="text-[0.58rem] px-2 py-1 rounded border border-salvia/40 bg-salvia/10 text-salvia">⬇ PNG</button>}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Anéis & Perfil · Véu a Véu</h1>
          <Link href="/admin/infografico" className="text-[0.7rem] opacity-60 hover:opacity-100">Infográficos →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-1">7 destaques (por tema) + foto de perfil. Cada destaque é uma <b>coleção</b> de Stories no IG.</p>
        <p className="text-[0.72rem] opacity-45 mb-6"><b>copia o prompt MJ</b> → gera no MidJourney → <b>arrasta</b> a imagem → <b>descarrega</b> → pões no Instagram.</p>
        {erro && <p className="text-[0.75rem] text-red-300 mb-4">{erro}</p>}

        {cap && (
          <div ref={capRef} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
            <AnelCover label={cap.label} imageUrl={imgs[cap.label]} perfil={cap.perfil} mundo="escola" square />
          </div>
        )}

        <p className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 mb-3">Foto de perfil</p>
        <div className="max-w-[210px] mb-10"><Cartao a={PERFIL} perfil /></div>

        <p className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 mb-3">7 destaques</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {ANEIS.map((a) => <Cartao key={a.label} a={a} />)}
        </div>
      </div>
    </div>
  );
}
