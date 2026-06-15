'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, Conta } from '@/lib/metodo/contas';
import { planoSemana, DiaSemana } from '@/lib/metodo/semana';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };

export default function MetodoSemanaPage() {
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const gerarDia = useCallback(async (conta: Conta, dia: DiaSemana) => {
    const key = `${conta.id}-${dia.wd}`;
    setBusy(key); setErro(null);
    try {
      const ehIA = dia.tipo === 'reconhecimento';
      const r = await fetch(ehIA ? '/api/admin/metodo/gerar-ia' : '/api/admin/metodo/gerar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ehIA ? { conta: conta.id, veu: dia.post.veu } : { postId: dia.post.id }),
      });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); return false; }
      return true;
    } catch (e) { setErro(String(e)); return false; }
    finally { setBusy(null); }
  }, []);

  const gerarSemana = useCallback(async (conta: Conta) => {
    setMsg(null);
    const dias = planoSemana(conta.id, offset);
    let ok = 0;
    for (const d of dias) { if (await gerarDia(conta, d)) ok += 1; }
    setMsg(`${conta.handle}: ${ok}/${dias.length} gerados. Vai a Publicar para agendar, renderizar e exportar.`);
  }, [offset, gerarDia]);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <h1 className="mt-3 text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Produção semanal</h1>
        <p className="mt-2 text-[0.86rem] opacity-80 max-w-2xl">
          Cada dia tem o seu tipo, na proporção 60/30/10. Os dias de reconhecimento são gerados com Claude IA (frase nova do véu, na hora); revelação e manifesto vêm curados do manual. Carrega em gerar a semana, sem dependeres de ninguém.
        </p>

        <div className="mt-4 flex items-center gap-2 text-[0.78rem]">
          <span className="opacity-60">Semana:</span>
          {[0, 1, 2, 3].map((o) => (
            <button key={o} onClick={() => setOffset(o)} className={`px-2.5 py-1 rounded-lg border ${offset === o ? 'border-[#EBAE4A] text-[#EBAE4A]' : 'border-white/15 opacity-70'}`}>{o === 0 ? 'próxima' : `+${o}`}</button>
          ))}
        </div>

        {erro && <p className="mt-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mt-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        <div className="mt-5 space-y-6">
          {CONTAS_LISTA.map((conta) => {
            const dias = planoSemana(conta.id, offset);
            return (
              <section key={conta.id} className="rounded-2xl border border-white/10 p-4" style={{ background: `${conta.paleta.bg1}` }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</h2>
                  <button onClick={() => gerarSemana(conta)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border text-[0.74rem] disabled:opacity-40" style={{ borderColor: `${conta.cor}88`, color: conta.cor }}>
                    {busy?.startsWith(conta.id) ? 'a gerar…' : 'gerar a semana'}
                  </button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {dias.map((d) => (
                    <div key={d.wd} className="rounded-xl border border-white/10 bg-black/20 p-3 text-[0.8rem]">
                      <div className="flex items-center gap-2 flex-wrap text-[0.66rem] uppercase tracking-wider opacity-70">
                        <span className="font-semibold">{d.nome}</span>
                        <span className="opacity-50">{d.data}</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: `${conta.cor}33`, color: conta.cor }}>{TIPO_LABEL[d.tipo]}</span>
                        {d.tipo === 'reconhecimento' && <span className="opacity-50 normal-case tracking-normal">IA · {d.post.veu}</span>}
                      </div>
                      <p className="mt-1.5" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                        {d.tipo === 'reconhecimento' ? <span className="opacity-60 italic">frase nova do {d.post.conceito} (gerada na hora)</span> : d.post.texto}
                      </p>
                      <button onClick={() => gerarDia(conta, d)} disabled={!!busy} className="mt-2 px-2.5 py-1 rounded-lg border border-white/20 text-[0.7rem] disabled:opacity-40">
                        {busy === `${conta.id}-${d.wd}` ? 'a gerar…' : 'gerar este dia'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
