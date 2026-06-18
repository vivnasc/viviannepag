'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, type ContaId } from '@/lib/metodo/contas';
import { FORMATOS_CONTA } from '@/lib/metodo/formatos-conta';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// As 2 PEÇAS DO DIA de uma conta (descoberta de manhã + profundidade à noite),
// cada conta no SEU formato próprio. Aqui vê-se que cada conta sai DIFERENTE — é o
// formato que as individualiza, não a cor. Só texto + indicações de imagem.

type Beat = { tempo: string; imagem: string; texto: string };
type SB = { tipo: string; veu: string; personagem: string; beats: Beat[]; envio: string };

export default function PecasPage() {
  const [sel, setSel] = useState<ContaId>('vir');
  const [pecas, setPecas] = useState<Record<string, SB | null>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const gerar = useCallback(async (conta: ContaId, tipo: 'descoberta' | 'profundidade') => {
    setBusy(`${conta}-${tipo}`); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/storyboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta, tipo }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setPecas((p) => ({ ...p, [`${conta}-${tipo}`]: j }));
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, []);

  const gerarDuas = useCallback(async (conta: ContaId) => {
    await gerar(conta, 'descoberta'); await gerar(conta, 'profundidade');
  }, [gerar]);

  const conta = CONTAS_LISTA.find((c) => c.id === sel)!;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>As 2 peças do dia</h1>
          <Link href="/admin/metodo" className="text-[0.7rem] opacity-60 hover:opacity-100">← Método VS</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-4">Cada conta tem o <b>seu formato</b> (manhã = descoberta · noite = profundidade). A mecânica é igual; o <b>formato e a veste</b> é que distinguem. Escolhe a conta e gera as 2 peças do dia.</p>

        <div className="flex gap-2 flex-wrap mb-4">
          {CONTAS_LISTA.map((c) => {
            const on = c.id === sel;
            return <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: on ? c.cor : 'rgba(255,255,255,0.15)', color: on ? c.cor : '#F2E8DC', background: on ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>;
          })}
        </div>

        <button onClick={() => gerarDuas(sel)} disabled={!!busy} className="px-4 py-2 rounded-lg border border-[#EBAE4A] text-[#0F0F1A] bg-[#EBAE4A] disabled:opacity-50 text-[0.82rem] font-medium mb-2">{busy ? 'a gerar…' : 'gerar as 2 peças do dia'}</button>
        {erro && <p className="text-[0.8rem] text-rose-300 mb-2">{erro}</p>}

        <div className="space-y-6 mt-4">
          {(['descoberta', 'profundidade'] as const).map((tipo) => {
            const sb = pecas[`${sel}-${tipo}`];
            const fmt = FORMATOS_CONTA[sel][tipo];
            return (
              <section key={tipo} className="rounded-2xl border border-white/10 p-4" style={{ background: `linear-gradient(135deg, ${conta.cor}10, transparent 60%)` }}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[0.58rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full" style={{ background: conta.cor + '22', color: conta.cor }}>{tipo === 'descoberta' ? 'manhã · descoberta' : 'noite · profundidade'}</span>
                  <span className="text-[0.8rem] opacity-80" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{fmt.nome}</span>
                </div>
                {!sb ? (
                  <p className="text-[0.76rem] opacity-45 py-2">carrega &quot;gerar as 2 peças do dia&quot;.</p>
                ) : (
                  <>
                    <p className="text-[0.66rem] opacity-50 mb-2">véu do dia: {sb.veu} · {sb.personagem}</p>
                    <div className="space-y-2">
                      {sb.beats.map((b, i) => (
                        <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-2.5 text-[0.82rem]">
                          <div className="flex gap-2 text-[0.58rem] uppercase tracking-wider opacity-45 mb-1"><span>{b.tempo}</span></div>
                          <p className="opacity-60 text-[0.72rem] italic mb-0.5">🎞️ {b.imagem}</p>
                          <p style={{ fontFamily: 'var(--font-cormorant), serif' }}>{b.texto}</p>
                        </div>
                      ))}
                    </div>
                    {sb.envio && <p className="mt-2 text-[0.78rem]" style={{ color: conta.cor }}>envio · {sb.envio}</p>}
                  </>
                )}
              </section>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">Compara: muda de conta e gera. Cada uma sai num formato diferente (faca fragmentada · espelho 2000/2026 · 5 frases interativas · microdrama de objetos · o exercício…). É isto que as individualiza.</p>
      </div>
    </div>
  );
}
