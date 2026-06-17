'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS, type ContaId } from '@/lib/metodo/contas';
import { CONTAS_UNIVERSO, CALENDARIO_UNIVERSO, GESTO_CONTA } from '@/lib/metodo/universo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// UNIVERSO VS · Semana (Fase 1, só TEXTO). Carregas "gerar a semana" e lês as 4
// contas × 7 dias (1 véu/dia), à anatomia (hook partido -> reconhecimento -> raiz
// -> volta -> ENVIO). A Vivianne não escolhe nada; valida o texto. Sem imagem.

type Reel = { hook: string; reconhecimento: string; raiz: string; volta: string; envio: string };
type Dia = { wd: number; nome: string; veu: string; personagem: string; reel: Reel | null };

export default function UniversoSemanaPage() {
  const [dados, setDados] = useState<Record<string, Dia[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const gerarConta = useCallback(async (conta: ContaId) => {
    setBusy(conta); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/universo-semana', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); return false; }
      setDados((d) => ({ ...d, [conta]: j.dias ?? [] }));
      return true;
    } catch (e) { setErro(String(e)); return false; }
    finally { setBusy(null); }
  }, []);

  const gerarSemana = useCallback(async () => {
    setErro(null); setMsg('A gerar a semana das 4 contas (texto). Demora 1 a 2 min.');
    for (const c of CONTAS_UNIVERSO) { setMsg(`A gerar @${CONTAS[c].handle}…`); await gerarConta(c); }
    setMsg('Semana gerada. Lê e valida o texto. (sem imagem nesta fase)');
  }, [gerarConta]);

  const algum = Object.keys(dados).length > 0;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Semana · Universo VS</h1>
          <Link href="/admin/metodo" className="text-[0.7rem] opacity-60 hover:opacity-100">← Método VS</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">A semana das 4 contas, <b>1 véu por dia</b>, gerada sozinha. Tu não escolhes nada: lês e validas o <b>texto</b>. (Fase 1: só texto, sem imagem.)</p>
        <p className="text-[0.72rem] opacity-50 mb-4">Anatomia: hook partido → reconhecimento → raiz (o porquê) → volta (o gesto da conta) → ENVIO. Voz: concreta, sem metáforas, sem testemunho.</p>

        <div className="flex items-center gap-3 flex-wrap mb-5">
          <button onClick={gerarSemana} disabled={!!busy} className="px-4 py-2 rounded-lg border border-[#EBAE4A] text-[#0F0F1A] bg-[#EBAE4A] disabled:opacity-50 text-[0.82rem] font-medium">{busy ? `a gerar @${CONTAS[busy as ContaId]?.handle}…` : 'gerar a semana'}</button>
          {erro && <span className="text-[0.8rem] text-rose-300">{erro}</span>}
          {msg && !erro && <span className="text-[0.8rem] text-emerald-300">{msg}</span>}
        </div>

        {/* a semana por conta */}
        <div className="space-y-7">
          {CONTAS_UNIVERSO.map((c) => {
            const conta = CONTAS[c];
            const dias = dados[c];
            return (
              <section key={c} className="rounded-2xl border border-white/10 p-4" style={{ background: conta.paleta.bg1 + '55' }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.66rem] opacity-55">{GESTO_CONTA[c].etiqueta}</span>
                    <button onClick={() => gerarConta(c)} disabled={!!busy} className="text-[0.66rem] px-2.5 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: conta.cor + '66', color: conta.cor }}>{busy === c ? 'a gerar…' : dias ? 'regerar' : 'gerar'}</button>
                  </div>
                </div>

                {!dias ? (
                  <p className="text-[0.78rem] opacity-40 py-3">{algum ? 'ainda não gerado.' : 'carrega "gerar a semana".'}</p>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 mt-2">
                    {dias.map((d) => (
                      <div key={d.wd} className="rounded-xl border border-white/10 bg-black/25 p-3 text-[0.82rem]">
                        <div className="flex items-center gap-2 flex-wrap text-[0.58rem] uppercase tracking-[0.12em] opacity-70 mb-1.5">
                          <span className="font-semibold">{d.nome}</span>
                          <span className="px-1.5 py-0.5 rounded-full" style={{ background: conta.cor + '22', color: conta.cor }}>{d.veu}</span>
                        </div>
                        {!d.reel ? (
                          <p className="text-[0.72rem] text-rose-300/80 italic">falhou, carrega &quot;regerar&quot;.</p>
                        ) : (
                          <div className="space-y-1.5" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                            <p className="leading-snug"><span className="text-[0.52rem] uppercase tracking-wider opacity-40 not-italic" style={{ fontFamily: 'var(--font-inter)' }}>hook</span><br />{d.reel.hook}</p>
                            <p className="leading-snug opacity-90">{d.reel.reconhecimento}</p>
                            <p className="leading-snug opacity-75 text-[0.78rem]"><span className="text-[0.52rem] uppercase tracking-wider opacity-40" style={{ fontFamily: 'var(--font-inter)' }}>raiz</span><br />{d.reel.raiz}</p>
                            <p className="leading-snug" style={{ color: conta.cor }}><span className="text-[0.52rem] uppercase tracking-wider opacity-50" style={{ fontFamily: 'var(--font-inter)' }}>volta</span><br />{d.reel.volta}</p>
                            <p className="leading-snug text-[0.74rem] opacity-70"><span className="text-[0.52rem] uppercase tracking-wider opacity-40" style={{ fontFamily: 'var(--font-inter)' }}>envio</span><br />{d.reel.envio}</p>
                            <p className="text-[0.56rem] opacity-35 pt-0.5" style={{ fontFamily: 'var(--font-inter)' }}>{d.personagem}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-40 mt-6">Fase 1: validas a escrita. Quando aprovares a voz, ligamos a imagem (o gesto de cada conta) e depois produzir/agendar.</p>
      </div>
    </div>
  );
}
