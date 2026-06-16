'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS_LISTA, Conta, type ContaId } from '@/lib/metodo/contas';
import { planoSemana, planoSemanaMae, VEUS_SEMANA_MAE } from '@/lib/metodo/semana';
import { jornadaConta, totalTemas, semanaTrimestreAtual } from '@/lib/metodo/planoTrimestral';
import { FraseRapida } from '@/components/admin/FraseRapida';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable}`;

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };

export default function MetodoSemanaPage() {
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState<ContaId>('mae'); // conta ativa (separadores, como no calendário)
  // ligação a partir do calendário: ?conta=ver abre nessa conta; ?off=3 abre nessa
  // semana (offset 0 = esta), para o "abrir na produção" cair na semana do cartão.
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

  // COMPLETAR a semana: gera SÓ os dias que ainda faltam (não estraga os já
  // feitos). Mãe já salta os existentes; as portas levam completar:true.
  const completar = useCallback(async (conta: string, off: number) => {
    if (busy) return;
    setBusy(`${conta}-comp`); setErro(null);
    setMsg('A completar os dias que faltam (não estraga os já feitos). Podes sair que continua.');
    try {
      const endpoint = conta === 'mae' ? '/api/admin/metodo/gerar-mae' : '/api/admin/metodo/gerar-lote';
      const payload = conta === 'mae' ? { conta, semanas: 1, offset: off } : { conta, completar: true, offset: off };
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(j.jaExistiam ? 'A semana já está completa.' : `${j.gerados} dia(s) em falta gerado(s).`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(null); }
  }, [busy]);

  // PORTAS: gerar SÓ um dia (a data escolhida) — regenera esse, não a semana.
  const gerarDiaPorta = useCallback(async (conta: string, data: string, off: number) => {
    if (busy) return;
    setBusy(`${conta}-dia-${data}`); setErro(null);
    setMsg('A gerar este dia (texto). Depois gera a imagem e renderiza na página da conta.');
    try {
      const r = await fetch('/api/admin/metodo/gerar-lote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta, dia: data, offset: off }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} dia gerado para ${data}.`);
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

  // semana mostrada (seg→dom), offset 0 = ESTA semana (como na Agenda da veu.a.veu)
  const hoje = new Date();
  const dow = hoje.getDay();
  const seg = new Date(hoje); seg.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7);
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  const dm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const rotuloSemana = offset === 0 ? 'Esta semana' : offset === 1 ? 'Próxima semana' : offset === -1 ? 'Semana passada' : `${offset > 0 ? '+' : ''}${offset} semanas`;

  // CONTEXTO TRIMESTRAL: a produção semanal DESCE do plano de 3 meses (como o
  // Plano da Semana desce do plano editorial da veu.a.veu). Portas: o tema desta
  // semana da jornada; mãe: os temas são DIAS (os 7 véus, 1 por dia).
  const totalT = sel === 'mae' ? 0 : totalTemas(sel);
  const jornada = sel === 'mae' ? [] : jornadaConta(sel);
  const idxT = totalT ? (((semanaTrimestreAtual() - 1 + offset) % totalT) + totalT) % totalT : 0;
  const temaT = jornada[idxT];

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
          <Link href="/admin/metodo/calendario" className="text-[0.7rem] opacity-60 hover:opacity-100">← Calendário · 3 meses</Link>
        </div>
        <h1 className="mt-3 text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Produção semanal</h1>
        <p className="mt-2 text-[0.86rem] opacity-80 max-w-2xl">
          O plano por dia (como na veu.a.veu): cada dia tem o seu tipo, na proporção 60/30/10. Carregas e gera no servidor, com texto + imagem, já com a data de cada post. Podes sair que continua. Nada publica sem o teu ✓ no Publicar.
        </p>

        {/* separadores das contas (mesmo padrão do calendário trimestral) */}
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

        {/* o plano de 3 meses para esta semana — a produção DESCE daqui (como o
            Plano da Semana desce do plano editorial da veu.a.veu) */}
        <div className="mt-4 rounded-xl border border-[#EBAE4A]/25 bg-[#EBAE4A]/[0.05] p-4">
          {sel === 'mae' ? (
            <>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[#EBAE4A] mb-1.5">Do plano de 3 meses · {rotuloSemana} · os temas são dias</p>
              <div className="flex flex-wrap gap-1.5">
                {VEUS_SEMANA_MAE.map((v) => (
                  <span key={v.wd} className="text-[0.62rem] px-2 py-0.5 rounded-full border border-[#EBAE4A]/35 text-[#EBAE4A]/90">{v.nome.slice(0, 3)} · {v.veu}</span>
                ))}
              </div>
            </>
          ) : temaT ? (
            <>
              <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[#EBAE4A] mb-1">Do plano de 3 meses · {rotuloSemana} · tema {idxT + 1} de {totalT}</p>
              <p className="text-lg leading-tight" style={{ fontFamily: 'var(--font-cormorant), serif', color: '#EBAE4A' }}>“{temaT.mote}”</p>
              <p className="text-[0.74rem] opacity-65">Véu {temaT.veu} · {temaT.nota}</p>
            </>
          ) : null}
          <Link href="/admin/metodo/calendario" className="inline-block mt-2 text-[0.66rem] text-[#EBAE4A]/80 hover:text-[#EBAE4A]">ver os 3 meses →</Link>
        </div>

        {erro && <p className="mt-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mt-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        <div className="mt-5 space-y-6">
          {CONTAS_LISTA.filter((c) => c.id === sel).map((conta: Conta) => {
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
                    <button onClick={() => completar(conta.id, offset)} disabled={!!busy} className="px-3 py-1.5 rounded-lg border border-white/20 disabled:opacity-40">
                      {busy === `${conta.id}-comp` ? 'a completar…' : 'completar (faltam)'}
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
                      <button onClick={() => gerarDiaPorta(conta.id, d.data, offset)} disabled={!!busy} className="mt-2 text-[0.62rem] px-2 py-1 rounded-md border disabled:opacity-40" style={{ borderColor: `${conta.cor}66`, color: conta.cor }}>{busy === `${conta.id}-dia-${d.data}` ? 'a gerar…' : 'gerar este dia'}</button>
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
