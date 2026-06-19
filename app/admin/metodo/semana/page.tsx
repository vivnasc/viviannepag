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

// Arranque do plano: 22 jun 2026 (a semana de 15-21 foi de testes). O calendário
// NUNCA mostra semanas antes do arranque (não se gera conteúdo para o passado).
// offsetArranque = a semana de 22 jun face a esta semana (negativo após o arranque).
function offsetArranque(): number {
  const h = new Date(); const dow = h.getDay();
  const seg = new Date(h.getFullYear(), h.getMonth(), h.getDate() + (dow === 0 ? -6 : 1 - dow));
  const arranque = new Date(2026, 5, 22);
  return Math.round((arranque.getTime() - seg.getTime()) / (7 * 864e5));
}

export default function MetodoSemanaPage() {
  const [offset, setOffset] = useState(() => Math.max(0, offsetArranque()));
  const minOff = offsetArranque(); // o calendário não recua antes do arranque (22 jun)
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

  // as 2 PEÇAS de cada dia, no FORMATO próprio da conta (descoberta de manhã ·
  // profundidade à noite). Geradas aqui mesmo, no calendário, sem página à parte.
  type SB = { tipo: string; beats: { tempo: string; imagem: string; texto: string }[]; envio: string };
  const [sbs, setSbs] = useState<Record<string, SB>>({});
  const [sbBusy, setSbBusy] = useState<string | null>(null);
  const gerarPeca = useCallback(async (data: string, tipo: 'descoberta' | 'profundidade', opts?: { evitar?: string[]; clarificar?: boolean }, conta: ContaId = sel) => {
    const chave = `${conta}-${data}-${tipo}`;
    setSbBusy(chave); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/storyboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta, tipo, dia: data, evitar: opts?.evitar, clarificar: opts?.clarificar }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setSbs((s) => ({ ...s, [chave]: { tipo, beats: j.beats ?? [], envio: j.envio ?? '' } }));
    } catch (e) { setErro(String(e)); }
    finally { setSbBusy(null); }
  }, [sel]);
  // COMPARAR AS 4 CONTAS no mesmo dia, lado a lado (sem saltar entre separadores).
  // Gera o tipo escolhido (manhã/noite) para as 4 contas, uma de cada vez.
  const [comparar, setComparar] = useState<string | null>(null);
  const [compBusy, setCompBusy] = useState<string | null>(null);
  const compararTipo = useCallback(async (data: string, tipo: 'descoberta' | 'profundidade') => {
    setCompBusy(`${data}-${tipo}`); setErro(null);
    for (const c of CONTAS_LISTA) { await gerarPeca(data, tipo, undefined, c.id); }
    setCompBusy(null);
  }, [gerarPeca]);
  // REVER A SEMANA TODA nas 4 contas (os 7 dias × 4 contas, de uma vez).
  const [verSemana, setVerSemana] = useState(false);
  const [semProg, setSemProg] = useState<string | null>(null);
  // editar à mão: muda o texto/imagem de um beat (fica guardado no estado).
  const editarBeat = useCallback((chave: string, i: number, campo: 'texto' | 'imagem', valor: string) => {
    setSbs((s) => { const sb = s[chave]; if (!sb) return s; const beats = sb.beats.map((b, k) => k === i ? { ...b, [campo]: valor } : b); return { ...s, [chave]: { ...sb, beats } }; });
  }, []);
  const editarEnvio = useCallback((chave: string, valor: string) => {
    setSbs((s) => { const sb = s[chave]; if (!sb) return s; return { ...s, [chave]: { ...sb, envio: valor } }; });
  }, []);

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

  // gera a SEMANA TODA (7 dias) nas 4 contas, no tipo escolhido, uma de cada vez.
  const gerarSemana4 = async (tipo: 'descoberta' | 'profundidade') => {
    const total = pecas.length * CONTAS_LISTA.length;
    setErro(null); let n = 0; setSemProg(`0/${total} (${tipo === 'descoberta' ? 'manhã' : 'noite'})`);
    for (const p of pecas) {
      for (const c of CONTAS_LISTA) {
        await gerarPeca(p.data, tipo, undefined, c.id);
        n += 1; setSemProg(`${n}/${total} (${tipo === 'descoberta' ? 'manhã' : 'noite'})`);
      }
    }
    setSemProg(null);
  };

  // a coluna de UMA conta num dia (manhã + noite), partilhada pelo comparador de
  // um dia e pela vista da semana toda. Só leitura (a edição fica nos separadores).
  const colunaConta = (c: Conta, data: string) => (
    <div key={c.id} className="rounded-xl border border-white/10 p-3" style={{ background: `${c.paleta.bg1}` }}>
      <p className="text-[0.82rem] font-semibold" style={{ color: c.cor }}>@{c.handle}</p>
      {(['descoberta', 'profundidade'] as const).map((tipo) => {
        const sb = sbs[`${c.id}-${data}-${tipo}`];
        if (!sb) return null;
        return (
          <div key={tipo} className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2">
            <p className="text-[0.52rem] uppercase tracking-wider opacity-50 mb-1">{tipo === 'descoberta' ? 'manhã · descoberta' : 'noite · profundidade'}</p>
            {sb.beats.map((b, i) => (
              <div key={i} className="mb-1.5">
                <p className="text-[0.5rem] opacity-35 italic leading-tight">🎞️ {b.imagem}</p>
                <p className="text-[0.74rem] leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{b.texto}</p>
              </div>
            ))}
            {sb.envio && <p className="text-[0.62rem] mt-1" style={{ color: c.cor }}>↳ {sb.envio}</p>}
          </div>
        );
      })}
    </div>
  );

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
          <button onClick={() => setOffset((o) => Math.max(minOff, o - 1))} disabled={offset <= minOff} className="px-2.5 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10 disabled:opacity-25 disabled:cursor-not-allowed">◀</button>
          <p><b>{rotuloSemana}</b> · {dm(seg)} a {dm(dom)}</p>
          <button onClick={() => setOffset((o) => o + 1)} className="px-2.5 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10">▶</button>
          {offset !== Math.max(minOff, 0) && <button onClick={() => setOffset(Math.max(minOff, 0))} className="text-[0.66rem] px-2 py-1 rounded-full border border-[#EBAE4A]/30 text-[#EBAE4A]/80 hover:bg-[#EBAE4A]/10">arranque</button>}
          <button onClick={() => setVerSemana((v) => !v)} className="ml-auto text-[0.72rem] px-3 py-1.5 rounded-lg border border-white/25 hover:bg-white/5">{verSemana ? 'fechar a semana toda' : 'rever a semana toda · 4 contas →'}</button>
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
                {/* as 2 PEÇAS do dia, no formato próprio da conta */}
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {(['descoberta', 'profundidade'] as const).map((tipo) => {
                    const chave = `${sel}-${p.data}-${tipo}`;
                    return <button key={tipo} onClick={() => gerarPeca(p.data, tipo)} disabled={!!sbBusy} className="text-[0.6rem] px-2 py-1 rounded-md border disabled:opacity-40" style={{ borderColor: `${contaSel.cor}66`, color: contaSel.cor }}>{sbBusy === chave ? '…' : tipo === 'descoberta' ? 'manhã' : 'noite'}</button>;
                  })}
                  <button onClick={() => setComparar(p.data)} className="text-[0.6rem] px-2 py-1 rounded-md border border-white/25 hover:bg-white/5">comparar as 4 contas →</button>
                </div>
                {(['descoberta', 'profundidade'] as const).map((tipo) => {
                  const chave = `${sel}-${p.data}-${tipo}`;
                  const sb = sbs[chave];
                  if (!sb) return null;
                  const textos = sb.beats.map((b) => b.texto);
                  return (
                    <div key={tipo} className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2">
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <p className="text-[0.52rem] uppercase tracking-wider opacity-50">{tipo === 'descoberta' ? 'manhã · descoberta' : 'noite · profundidade'}</p>
                        <div className="flex gap-1">
                          <button onClick={() => gerarPeca(p.data, tipo, { evitar: textos })} disabled={!!sbBusy} className="text-[0.54rem] px-1.5 py-0.5 rounded border border-white/20 disabled:opacity-40" title="gera de novo, com outro ângulo">regenerar</button>
                          <button onClick={() => gerarPeca(p.data, tipo, { clarificar: true, evitar: textos })} disabled={!!sbBusy} className="text-[0.54rem] px-1.5 py-0.5 rounded border border-white/20 disabled:opacity-40" title="reescreve mais claro, tira ambiguidades">melhorar</button>
                        </div>
                      </div>
                      {sb.beats.map((b, i) => (
                        <div key={i} className="mb-1.5">
                          <p className="text-[0.54rem] opacity-40 italic leading-tight">🎞️ {b.imagem}</p>
                          <textarea value={b.texto} onChange={(e) => editarBeat(chave, i, 'texto', e.target.value)} rows={2} className="w-full bg-black/30 border border-white/10 rounded px-1.5 py-1 text-[0.72rem] leading-snug outline-none focus:border-[#EBAE4A]/60" style={{ fontFamily: 'var(--font-cormorant), serif', color: '#F2E8DC' }} />
                        </div>
                      ))}
                      <textarea value={sb.envio} onChange={(e) => editarEnvio(chave, e.target.value)} rows={1} placeholder="envio (manda a quem precisa)" className="w-full bg-black/20 border border-white/10 rounded px-1.5 py-1 text-[0.62rem] outline-none focus:border-[#EBAE4A]/60" style={{ color: contaSel.cor }} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* COMPARAR AS 4 CONTAS no mesmo dia, lado a lado. Mesmo véu, mesma
            personagem, mesma cor: o que muda é o formato, a voz e os símbolos. */}
        {comparar && (() => {
          const pc = pecas.find((x) => x.data === comparar);
          const compBoth = (tipo: 'descoberta' | 'profundidade') => compBusy === `${comparar}-${tipo}`;
          return (
            <section className="mt-5 rounded-2xl border border-white/15 bg-black/30 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif' }}>As 4 contas · {comparar.slice(8)}/{comparar.slice(5, 7)}</h2>
                  {pc && <p className="text-[0.74rem] opacity-65">Mesmo véu <b>{pc.veu}</b>, mesma personagem <b>{pc.personagem.nome}</b>, mesma cor. Muda o formato, a voz e os símbolos.</p>}
                </div>
                <div className="flex gap-2 flex-wrap text-[0.74rem]">
                  <button onClick={() => compararTipo(comparar, 'descoberta')} disabled={!!compBusy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{compBoth('descoberta') ? 'a gerar manhã…' : 'gerar manhã (4 contas)'}</button>
                  <button onClick={() => compararTipo(comparar, 'profundidade')} disabled={!!compBusy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{compBoth('profundidade') ? 'a gerar noite…' : 'gerar noite (4 contas)'}</button>
                  <button onClick={() => setComparar(null)} className="px-3 py-1.5 rounded-lg border border-white/15 opacity-70 hover:opacity-100">fechar</button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {CONTAS_LISTA.map((c) => colunaConta(c, comparar))}
              </div>
            </section>
          );
        })()}

        {/* A SEMANA TODA nas 4 contas: os 7 dias, cada um com as 4 contas em
            colunas. Gera tudo de uma vez (manhã ou noite) para validar a semana. */}
        {verSemana && (
          <section className="mt-5 rounded-2xl border border-white/15 bg-black/30 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif' }}>A semana toda · 4 contas</h2>
                <p className="text-[0.74rem] opacity-65">Os 7 dias, cada um nas 4 contas. {rotuloSemana} · {dm(seg)} a {dm(dom)}.</p>
              </div>
              <div className="flex gap-2 flex-wrap text-[0.74rem]">
                <button onClick={() => gerarSemana4('descoberta')} disabled={!!semProg} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{semProg && semProg.includes('manhã') ? `a gerar… ${semProg}` : `gerar manhã (${pecas.length * CONTAS_LISTA.length} peças)`}</button>
                <button onClick={() => gerarSemana4('profundidade')} disabled={!!semProg} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{semProg && semProg.includes('noite') ? `a gerar… ${semProg}` : `gerar noite (${pecas.length * CONTAS_LISTA.length} peças)`}</button>
                <button onClick={() => setVerSemana(false)} className="px-3 py-1.5 rounded-lg border border-white/15 opacity-70 hover:opacity-100">fechar</button>
              </div>
            </div>
            <div className="mt-3 space-y-4">
              {pecas.map((p) => (
                <div key={p.data}>
                  <p className="text-[0.7rem] uppercase tracking-wider opacity-60 mb-1">
                    <span className="font-semibold">{['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][new Date(p.data + 'T12:00').getDay()]} {p.data.slice(8)}/{p.data.slice(5, 7)}</span>
                    {' · '}véu <b>{p.veu}</b>{' · '}<span className="opacity-70">{p.personagem.nome}</span>
                  </p>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {CONTAS_LISTA.map((c) => colunaConta(c, p.data))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <FraseRapida />
      </div>
    </main>
  );
}
