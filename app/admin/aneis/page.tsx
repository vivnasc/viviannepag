'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
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

  async function gerarImagens() {
    if (!item) return;
    setErro(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: item.slug }) });
      const j = await r.json();
      if (!r.ok) { setErro('imagens: ' + (j.erro ?? '')); return; }
      setMsg('Render disparado (~3 min). Recarrega depois para descarregar cada anel.');
    } catch (e) { setErro(String(e)); }
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Anéis & Perfil · Véu a Véu</h1>
          <Link href="/admin/infografico" className="text-[0.7rem] opacity-60 hover:opacity-100">Infográficos →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-6">Capas de destaque (7) + foto de perfil, com imagens transcendentes do teu pool.</p>

        <Card className="p-4 mb-8 flex flex-wrap items-center gap-3">
          <Btn variant="primary" onClick={criar} disabled={busy}>{busy ? 'a criar…' : item ? 'recriar (novas imagens)' : 'criar anéis + perfil'}</Btn>
          {item && <Btn variant="default" onClick={gerarImagens}>gerar imagens (PNG)</Btn>}
          {erro && <span className="text-[0.75rem] text-red-300">{erro}</span>}
          {msg && <span className="text-[0.75rem] text-salvia">{msg}</span>}
        </Card>

        {item && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {item.dias.map((d) => {
              const s = d.slides?.[0]; const img = d.imagens?.[0];
              if (!s) return null;
              return (
                <div key={d.dia} className="flex flex-col items-center gap-2">
                  <div className="w-full max-w-[200px]">
                    <AnelCover label={s.label ?? ''} imageUrl={s.imageUrl} mundo={d.mundo ?? item.theme?.mundo ?? 'escola'} perfil={!!s.perfil} />
                  </div>
                  <span className="text-[0.7rem] opacity-70">{s.perfil ? 'perfil' : s.label}</span>
                  {img && <a href={img} download className="text-[0.62rem] px-2 py-0.5 rounded border border-salvia/40 bg-salvia/10 text-salvia">⬇ PNG</a>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
