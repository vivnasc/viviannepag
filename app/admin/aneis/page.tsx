'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { toPng } from 'html-to-image';
import { AnelCover } from '@/components/admin/AnelCover';
import { Btn, Card } from '@/components/admin/EstudioKit';
import type { Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

type AnelSlide = { tipo: string; label?: string; perfil?: boolean; imageUrl?: string };
type Dia = { dia: number; mundo?: Mundo; imagens?: string[]; slides?: AnelSlide[] };
type Item = { slug: string; title: string; dias: Dia[]; theme: { mundo?: Mundo } };

export default function AneisPage() {
  const [item, setItem] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/aneis/list');
    if (r.ok) setItem((await r.json()).aneis?.[0] ?? null);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function criar() {
    setBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/aneis/gerar', { method: 'POST' });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      await carregar();
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  }

  // download instantaneo no browser (1080x1080)
  const capRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<{ label: string; perfil: boolean; mundo: Mundo; nome: string } | null>(null);
  useEffect(() => {
    if (!cap) return;
    (async () => {
      try {
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 450));
        const node = capRef.current?.firstElementChild as HTMLElement | null;
        if (node) { const dataUrl = await toPng(node, { pixelRatio: 1, cacheBust: true }); const a = document.createElement('a'); a.href = dataUrl; a.download = `${cap.nome}.png`; a.click(); }
      } catch (e) { setErro('download: ' + String(e)); }
      setCap(null);
    })();
  }, [cap]);
  function baixar(d: Dia) {
    const s = d.slides?.[0]; if (!s) return;
    setCap({ label: s.label ?? '', perfil: !!s.perfil, mundo: d.mundo ?? item?.theme?.mundo ?? 'escola', nome: s.perfil ? 'perfil-veu-a-veu' : `anel-${(s.label ?? '').toLowerCase().replace(/\s+/g, '-')}` });
  }

  const perfil = item?.dias.find((d) => d.slides?.[0]?.perfil);
  const aneis = item?.dias.filter((d) => !d.slides?.[0]?.perfil) ?? [];

  const Cartao = ({ d }: { d: Dia }) => {
    const s = d.slides?.[0];
    if (!s) return null;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-[210px]"><AnelCover label={s.label ?? ''} mundo={d.mundo ?? item?.theme?.mundo ?? 'escola'} perfil={!!s.perfil} /></div>
        <span className="text-[0.72rem] opacity-80">{s.perfil ? 'foto de perfil' : s.label}</span>
        <button onClick={() => baixar(d)} className="text-[0.62rem] px-2.5 py-1 rounded border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20">⬇ descarregar</button>
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
        <p className="text-[0.8rem] opacity-65 mb-1">Imagens transcendentes (mandala de luz) para os destaques e a foto de perfil.</p>
        <p className="text-[0.72rem] opacity-45 mb-6">Descarregas aqui e pões no Instagram à mão (o IG não deixa nenhuma ferramenta definir perfil/destaques automaticamente).</p>

        <Card className="p-4 mb-8 flex flex-wrap items-center gap-3">
          <Btn variant="primary" onClick={criar} disabled={busy}>{busy ? 'a criar…' : item ? 'recriar' : 'criar'}</Btn>
          {erro && <span className="text-[0.75rem] text-red-300">{erro}</span>}
          {msg && <span className="text-[0.75rem] text-salvia">{msg}</span>}
        </Card>

        {cap && (
          <div ref={capRef} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
            <AnelCover label={cap.label} mundo={cap.mundo} perfil={cap.perfil} square />
          </div>
        )}

        {perfil && (
          <div className="mb-10">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 mb-3">Foto de perfil</p>
            <div className="max-w-[210px]"><Cartao d={perfil} /></div>
          </div>
        )}
        {aneis.length > 0 && (
          <>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] opacity-50 mb-3">7 destaques</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {aneis.map((d) => <Cartao key={d.dia} d={d} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
