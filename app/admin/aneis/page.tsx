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
    if (!item) return; setErro(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: item.slug }) });
      const j = await r.json();
      if (!r.ok) { setErro('imagens: ' + (j.erro ?? '')); return; }
      setMsg('A preparar as imagens (~3 min). Recarrega depois e descarrega cada uma.');
    } catch (e) { setErro(String(e)); }
  }

  const perfil = item?.dias.find((d) => d.slides?.[0]?.perfil);
  const aneis = item?.dias.filter((d) => !d.slides?.[0]?.perfil) ?? [];

  const Cartao = ({ d }: { d: Dia }) => {
    const s = d.slides?.[0]; const img = d.imagens?.[0];
    if (!s) return null;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-[210px]"><AnelCover label={s.label ?? ''} mundo={d.mundo ?? item?.theme?.mundo ?? 'escola'} perfil={!!s.perfil} /></div>
        <span className="text-[0.72rem] opacity-80">{s.perfil ? 'foto de perfil' : s.label}</span>
        {img
          ? <a href={img} download className="text-[0.62rem] px-2.5 py-1 rounded border border-salvia/40 bg-salvia/10 text-salvia">⬇ descarregar</a>
          : <span className="text-[0.58rem] opacity-40">(falta gerar imagem)</span>}
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
          {item && <Btn variant="default" onClick={gerarImagens}>preparar imagens p/ descarregar</Btn>}
          {erro && <span className="text-[0.75rem] text-red-300">{erro}</span>}
          {msg && <span className="text-[0.75rem] text-salvia">{msg}</span>}
        </Card>

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
