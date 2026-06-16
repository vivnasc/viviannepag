'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, Conta } from '@/lib/metodo/contas';
import { planoSemana, planoSemanaMae } from '@/lib/metodo/semana';
import { FraseRapida } from '@/components/admin/FraseRapida';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };

export default function MetodoSemanaPage() {
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // gera no SERVIDOR, alinhado ao plano (datas + imagens). Pode sair/fechar.
  const gerar = useCallback(async (chave: string, conta: string, semanas: number, off: number) => {
    if (busy) return;
    setBusy(chave); setErro(null);
    setMsg('A gerar no servidor (texto + imagem, por dia). Podes sair ou fechar. Demora 1 a 2 minutos por semana.');
    try {
      // a mãe tem pipeline própria: 1 véu/dia, reel de 2 faces (dor -> revelação).
      const endpoint = conta === 'mae' ? '/api/admin/metodo/gerar-mae' : '/api/admin/metodo/gerar-lote';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta, semanas, offset: off }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} posts gerados (${j.comImagem} com imagem), já com a data de cada dia. Vê-os no Publicar (vista Feed/Semana) ou na página da conta.`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(null); }
  }, [busy]);

  // MÃE: gerar SÓ um dia (a data escolhida) — sobrescreve só esse, não a semana.
  const gerarDiaMae = useCallback(async (data: string) => {
    if (busy) return;
    setBusy(`mae-dia-${data}`); setErro(null);
    setMsg('A gerar este dia no servidor (texto). Depois "gerar imagens em falta" e renderizar.');
    try {
      const r = await fetch('/api/admin/metodo/gerar-mae', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: 'mae', dia: data }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} dia gerado para ${data}.`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(null); }
  }, [busy]);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <h1 className="mt-3 text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Produção semanal</h1>
        <p className="mt-2 text-[0.86rem] opacity-80 max-w-2xl">
          O plano por dia (como na veu.a.veu): cada dia tem o seu tipo, na proporção 60/30/10. Carregas e gera no servidor, com texto + imagem, já com a data de cada post. Podes sair que continua. Nada publica sem o teu ✓ no Publicar.
        </p>

        <div className="mt-4 flex items-center gap-2 text-[0.78rem] flex-wrap">
          <span className="opacity-60">Semana:</span>
          {[0, 1, 2, 3].map((o) => (
            <button key={o} onClick={() => setOffset(o)} className={`px-2.5 py-1 rounded-lg border ${offset === o ? 'border-[#EBAE4A] text-[#EBAE4A]' : 'border-white/15 opacity-70'}`}>{o === 0 ? 'próxima' : `+${o}`}</button>
          ))}
        </div>

        {erro && <p className="mt-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mt-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        <div className="mt-5 space-y-6">
          {CONTAS_LISTA.map((conta: Conta) => {
            const isMae = conta.id === 'mae';
            const dias = isMae ? [] : planoSemana(conta.id, offset);
            const diasMae = isMae ? planoSemanaMae(offset) : [];
            return (
              <section key={conta.id} className="rounded-2xl border border-white/10 p-4" style={{ background: `${conta.paleta.bg1}` }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</h2>
                  <div className="flex gap-2 flex-wrap text-[0.74rem]">
                    <button onClick={() => gerar(`${conta.id}-1`, conta.id, 1, offset)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: `${conta.cor}88`, color: conta.cor }}>
                      {busy === `${conta.id}-1` ? 'a gerar…' : 'gerar esta semana'}
                    </button>
                    <button onClick={() => gerar(`${conta.id}-4`, conta.id, 4, 0)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: conta.cor, color: '#0F0F1A', background: conta.cor }}>
                      {busy === `${conta.id}-4` ? 'a gerar…' : 'gerar 4 semanas'}
                    </button>
                    <Link href={`/admin/publicar?conta=${conta.marca}&vista=semana`} className="px-3 py-1.5 rounded-lg border border-white/20">ver no Publicar →</Link>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                  {isMae ? diasMae.map((d) => (
                    <div key={d.wd} className="rounded-xl border border-white/10 bg-black/20 p-3 text-[0.8rem]">
                      <div className="flex items-center gap-2 flex-wrap text-[0.64rem] uppercase tracking-wider opacity-70">
                        <span className="font-semibold">{d.nome}</span>
                        <span className="opacity-50">{d.data}</span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[0.62rem] uppercase tracking-wider" style={{ background: `${conta.cor}33`, color: conta.cor }}>Véu {d.veu} · reel 2 faces</span>
                      <p className="mt-1.5 leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                        <span className="opacity-55 italic">face 1 · a dor (IA)</span>
                      </p>
                      <p className="mt-1 leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                        <span className="text-[0.6rem] uppercase tracking-wider opacity-50">face 2 · revelação</span><br />{d.revelacao.texto}
                      </p>
                      <button onClick={() => gerarDiaMae(d.data)} disabled={!!busy} className="mt-2 text-[0.62rem] px-2 py-1 rounded-md border disabled:opacity-40" style={{ borderColor: `${conta.cor}66`, color: conta.cor }}>{busy === `mae-dia-${d.data}` ? 'a gerar…' : 'gerar este dia'}</button>
                    </div>
                  )) : dias.map((d) => (
                    <div key={d.wd} className="rounded-xl border border-white/10 bg-black/20 p-3 text-[0.8rem]">
                      <div className="flex items-center gap-2 flex-wrap text-[0.64rem] uppercase tracking-wider opacity-70">
                        <span className="font-semibold">{d.nome}</span>
                        <span className="opacity-50">{d.data}</span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[0.62rem] uppercase tracking-wider" style={{ background: `${conta.cor}33`, color: conta.cor }}>{TIPO_LABEL[d.tipo]}</span>
                      <p className="mt-1.5 leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                        {d.tipo === 'reconhecimento' ? <span className="opacity-55 italic">frase nova do {d.post.conceito} (IA)</span> : d.post.texto}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <FraseRapida />
      </div>
    </main>
  );
}
