'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, Conta, type ContaId } from '@/lib/metodo/contas';
import { planoSemanaPecas, faceDaEspiral, gestoDaConta } from '@/lib/metodo/peca';
import { FraseRapida } from '@/components/admin/FraseRapida';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

// Arranque do plano: 22 jun 2026 (a semana de 15-21 foi de testes). Enquanto não
// chega lá, o calendário abre já na 1.ª semana do plano (22 jun), não na de testes.
function semanasAteArranque(): number {
  const h = new Date(); const dow = h.getDay();
  const seg = new Date(h.getFullYear(), h.getMonth(), h.getDate() + (dow === 0 ? -6 : 1 - dow));
  const arranque = new Date(2026, 5, 22);
  const diff = Math.round((arranque.getTime() - seg.getTime()) / (7 * 864e5));
  return diff > 0 ? diff : 0;
}

export default function MetodoSemanaPage() {
  const [offset, setOffset] = useState(() => semanasAteArranque());
  const [sel, setSel] = useState<ContaId>('mae');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get('conta');
    if (c && CONTAS_LISTA.some((x) => x.id === c)) setSel(c as ContaId);
    const o = q.get('off');
    if (o !== null && o.trim() !== '' && Number.isFinite(Number(o))) setOffset(Number(o));
  }, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // tudo passa pelo motor novo (gerar-peca): família × véu × conta -> anatomia.
  const chamar = useCallback(async (chave: string, payload: Record<string, unknown>, aGerar: string, feito: (j: { gerados?: number; jaExistiam?: boolean }) => string) => {
    if (busy) return;
    setBusy(chave); setErro(null); setMsg(aGerar);
    try {
      const r = await fetch('/api/admin/metodo/gerar-peca', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(feito(j));
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(null); }
  }, [busy]);

  const gerar = (conta: string, semanas: number, off: number) =>
    chamar(`${conta}-${semanas}`, { conta, semanas, offset: off }, 'A gerar no servidor (a anatomia de cada dia). Podes sair ou fechar. 1 a 2 min por semana.', (j) => `${j.gerados} peças geradas, já com a data de cada dia. Vê-as no Publicar ou na página da conta.`);
  const completar = (conta: string, off: number) =>
    chamar(`${conta}-comp`, { conta, completar: true, offset: off }, 'A completar os dias que faltam (não estraga os já feitos). Podes sair que continua.', (j) => j.jaExistiam ? 'A semana já está completa.' : `${j.gerados} dia(s) em falta gerado(s).`);
  const gerarDia = (conta: string, data: string, off: number) =>
    chamar(`${conta}-dia-${data}`, { conta, dia: data, offset: off }, 'A gerar este dia (texto). Depois gera a imagem e renderiza na página da conta.', (j) => `${j.gerados} dia gerado para ${data}.`);

  // semana mostrada (seg→dom), offset 0 = ESTA semana.
  const hoje = new Date();
  const dow = hoje.getDay();
  const seg = new Date(hoje); seg.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7);
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  const dm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rotuloSemana = offset === 0 ? 'Esta semana' : offset === 1 ? 'Próxima semana' : offset === -1 ? 'Semana passada' : `${offset > 0 ? '+' : ''}${offset} semanas`;

  // a ESPIRAL: a face do retrato que esta semana aprofunda (igual para todas as contas).
  const face = faceDaEspiral(offset);
  const contaSel = CONTAS_LISTA.find((c) => c.id === sel)!;
  const pecas = planoSemanaPecas(sel, offset);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
          <Link href="/admin/metodo/calendario" className="text-[0.7rem] opacity-60 hover:opacity-100">← Calendário trimestral</Link>
        </div>
        <h1 className="mt-3 text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Calendário semanal</h1>
        <p className="mt-2 text-[0.86rem] opacity-80 max-w-2xl">
          1 véu por dia (a semana inteira são os 7 véus). Cada peça = uma <b>família</b> que se reconhece nesse véu, dita pela voz da conta. Gera no servidor; nada publica sem o teu ✓ no Publicar.
        </p>

        {/* separadores das contas */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {CONTAS_LISTA.map((c) => {
            const ativo = c.id === sel;
            return (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1.5 rounded-lg border text-[0.82rem]" style={{ borderColor: ativo ? c.cor : 'rgba(255,255,255,0.15)', color: ativo ? c.cor : '#F2E8DC', background: ativo ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[0.8rem]">
          <button onClick={() => setOffset((o) => o - 1)} className="px-2.5 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10">◀</button>
          <p><b>{rotuloSemana}</b> · {dm(seg)} a {dm(dom)}</p>
          <button onClick={() => setOffset((o) => o + 1)} className="px-2.5 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10">▶</button>
          {offset !== 0 && <button onClick={() => setOffset(0)} className="text-[0.66rem] px-2 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10">hoje</button>}
        </div>

        {/* a espiral: a face que esta semana aprofunda (desce do trimestral) */}
        <div className="mt-4 rounded-xl border border-[#EBAE4A]/25 bg-[#EBAE4A]/[0.05] p-4">
          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[#EBAE4A] mb-1">Do calendário trimestral · {rotuloSemana} · {face.volta}.ª volta da espiral</p>
          <p className="text-lg leading-tight" style={{ fontFamily: 'var(--font-cormorant), serif', color: '#EBAE4A' }}>Esta semana aprofunda <b>{face.titulo.toLowerCase()}</b> dos 7 véus.</p>
          <p className="text-[0.74rem] opacity-65">A voz desta conta: {gestoDaConta(sel).volta}.</p>
          <Link href="/admin/metodo/calendario" className="inline-block mt-2 text-[0.66rem] text-[#EBAE4A]/80 hover:text-[#EBAE4A]">ver o trimestral →</Link>
        </div>

        {erro && <p className="mt-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mt-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        <section className="mt-5 rounded-2xl border border-white/10 p-4" style={{ background: `${contaSel.paleta.bg1}` }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: contaSel.cor }}>@{contaSel.handle}</h2>
            <div className="flex gap-2 flex-wrap text-[0.74rem]">
              <button onClick={() => gerar(sel, 1, offset)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: `${contaSel.cor}88`, color: contaSel.cor }}>
                {busy === `${sel}-1` ? 'a gerar…' : 'gerar esta semana'}
              </button>
              <button onClick={() => completar(sel, offset)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border border-white/20 disabled:opacity-40">
                {busy === `${sel}-comp` ? 'a completar…' : 'completar (faltam)'}
              </button>
              <button onClick={() => gerar(sel, 4, 0)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: contaSel.cor, color: '#0F0F1A', background: contaSel.cor }}>
                {busy === `${sel}-4` ? 'a gerar…' : 'gerar 4 semanas'}
              </button>
              <Link href={`/admin/publicar?conta=${contaSel.marca}&vista=semana`} className="px-3 py-1.5 rounded-lg border border-white/20">ver no Publicar →</Link>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {pecas.map((p) => (
              <div key={p.data} className="rounded-xl border border-white/10 bg-black/20 p-3 text-[0.8rem]">
                <div className="flex items-center gap-2 flex-wrap text-[0.64rem] uppercase tracking-wider opacity-70">
                  <span className="font-semibold">{['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][new Date(p.data + 'T12:00').getDay()]}</span>
                  <span className="opacity-50">{p.data.slice(8)}/{p.data.slice(5, 7)}</span>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[0.62rem] uppercase tracking-wider" style={{ background: `${contaSel.cor}33`, color: contaSel.cor }}>Véu {p.veu}</span>
                <p className="mt-1.5 leading-snug" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
                  <span style={{ color: contaSel.cor }}>{p.personagem.nome}</span>
                  {p.familia && <span className="opacity-50 text-[0.72rem]"> · {p.familia.nome}</span>}
                </p>
                <p className="mt-0.5 text-[0.72rem] opacity-55 italic leading-snug">{p.personagem.frases[0]}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-wider opacity-45">aprofunda: {p.face.titulo.toLowerCase()}</p>
                <button onClick={() => gerarDia(sel, p.data, offset)} disabled={!!busy} className="mt-2 text-[0.62rem] px-2 py-1 rounded-md border disabled:opacity-40" style={{ borderColor: `${contaSel.cor}66`, color: contaSel.cor }}>{busy === `${sel}-dia-${p.data}` ? 'a gerar…' : 'gerar este dia'}</button>
              </div>
            ))}
          </div>
        </section>

        <FraseRapida />
      </div>
    </main>
  );
}
