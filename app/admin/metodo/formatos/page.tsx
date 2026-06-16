'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { FORMATOS } from '@/lib/metodo/formatos';
import { type VeuNome } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// CAMADA 1 · laboratório dos MOTORES EDITORIAIS (posts da tarde). Gera os BEATS
// (texto) de um motor + véu, para VER antes de escolher o recipiente (Camada 2).
// Não há render aqui de propósito: o motor não sabe o que é um reel/carrossel.

const VEUS: VeuNome[] = ['Turbilhão', 'Memória', 'Esforço', 'Desolação', 'Horizonte', 'Permanência', 'Dualidade'];

export default function MetodoFormatosPage() {
  const [formato, setFormato] = useState(FORMATOS[0].id);
  const [veu, setVeu] = useState<VeuNome>('Esforço');
  const [beats, setBeats] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const f = FORMATOS.find((x) => x.id === formato)!;

  async function gerar() {
    if (busy) return;
    setBusy(true); setErro(null); setBeats([]);
    try {
      const r = await fetch('/api/admin/metodo/formato', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ formato, veu }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setBeats(j.beats ?? []);
    } catch (e) { setErro(String(e)); }
    finally { setBusy(false); }
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Motores editoriais · posts da tarde</h1>
          <Link href="/admin/metodo" className="text-[0.7rem] opacity-60 hover:opacity-100">← Método VS</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1"><b>Camada 1</b> (o difícil): cada motor é uma estrutura + uma dimensão do SABER. Gera os <b>beats</b> (texto) para veres a profundidade <b>antes</b> de escolher o recipiente.</p>
        <p className="text-[0.74rem] opacity-50 mb-5">Sem render aqui: o motor não sabe se vai virar reel, carrossel ou vídeo. Isso é a Camada 2 (a embalagem), à parte.</p>

        {/* escolher motor */}
        <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Motor</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {FORMATOS.map((x) => {
            const on = x.id === formato;
            return (
              <button key={x.id} onClick={() => { setFormato(x.id); setBeats([]); }} className="px-3 py-1.5 rounded-lg border text-[0.78rem]" style={{ borderColor: on ? '#EBAE4A' : 'rgba(255,255,255,0.15)', color: on ? '#EBAE4A' : '#F2E8DC', background: on ? '#EBAE4A18' : 'transparent' }}>{x.nome}</button>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 p-3 mb-4 text-[0.78rem] bg-white/[0.03]">
          <p className="opacity-80 mb-1.5">{f.proposito}</p>
          <p className="text-[0.6rem] uppercase tracking-[0.14em] opacity-45 mb-1">Estrutura (dimensão: {f.dimensao})</p>
          <ol className="list-decimal list-inside space-y-0.5 opacity-65 text-[0.72rem]">
            {f.beats.map((b, i) => <li key={i}><b>{b.papel}</b> · {b.instrucao}</li>)}
          </ol>
        </div>

        {/* escolher véu */}
        <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Véu</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {VEUS.map((v) => {
            const on = v === veu;
            return (
              <button key={v} onClick={() => { setVeu(v); setBeats([]); }} className="px-2.5 py-1 rounded-full border text-[0.72rem]" style={{ borderColor: on ? '#EBAE4A' : 'rgba(255,255,255,0.15)', color: on ? '#EBAE4A' : '#F2E8DC', background: on ? '#EBAE4A14' : 'transparent' }}>{v}</button>
            );
          })}
        </div>

        <button onClick={gerar} disabled={busy} className="px-4 py-2 rounded-lg border border-[#EBAE4A] text-[#0F0F1A] bg-[#EBAE4A] disabled:opacity-50 text-[0.82rem] font-medium">{busy ? 'a gerar os beats…' : 'gerar os beats'}</button>

        {erro && <p className="mt-3 text-[0.8rem] text-rose-300">{erro}</p>}

        {beats.length > 0 && (
          <div className="mt-6">
            <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">{f.nome} · {veu} · {beats.length} beats</p>
            <div className="space-y-2">
              {beats.map((b, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-3.5 flex gap-3" style={{ background: `linear-gradient(135deg, #EBAE4A10, transparent 60%)` }}>
                  <span className="text-[0.6rem] opacity-40 mt-1 shrink-0">{i + 1}</span>
                  <p className="leading-snug text-[1.02rem]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{b}</p>
                </div>
              ))}
            </div>
            <p className="text-[0.7rem] opacity-40 mt-4">Estes beats são o motor (Camada 1). O recipiente (motion, reel narrado, vídeo, carrossel) é o passo seguinte — veste estes mesmos beats.</p>
          </div>
        )}
      </div>
    </div>
  );
}
