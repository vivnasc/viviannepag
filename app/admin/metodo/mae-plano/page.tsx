'use client';

// PLANO DA SEMANA (4 contas) · a legibilidade da veu.a.veu, mas HONESTO: mostra o
// PLANO da semana (o esqueleto), NÃO conteúdo fixo a fingir que foi gerado. Por dia:
// o véu (DNA, partilhado) + a FACE desta semana (a espiral do calendário) + o
// formato de manhã/tarde desta conta + a personagem. E, alimentado pela BD, marca
// cada peça «por gerar» ou «✓ gerado». A mãe mostra ainda a carta real do baralho
// (texto fixo, curado) como a carta que VAI sair; as filhas mostram a estrutura.

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { planoSemanaMae } from '@/lib/metodo/semana';
import { personagemDoDia, semanasDesdeInicio } from '@/lib/metodo/peca';
import { FAMILIAS } from '@/lib/metodo/personagens';
import { cartaDoBaralho } from '@/lib/metodo/baralho';
import { getConta, CONTAS_LISTA, type ContaId } from '@/lib/metodo/contas';
import { FACES_ORDEM } from '@/lib/metodo/veu-faces';
import { PORTA_ENQUADRAMENTO } from '@/lib/metodo/lentes';

const FONTS = 'font-[system-ui]';
const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const NOME_TARDE: Record<ContaId, string> = { mae: 'Não normalizes', ver: 'O Espelho', vir: 'Carta de renomear', viver: 'Repara' };
// manhã = a mãe tem a Carta; as filhas têm o SEU formato em modo gancho (não "a cena").
const NOME_MANHA: Record<ContaId, string> = { mae: 'Carta', ver: 'O Espelho · gancho', vir: 'Carta de renomear · gancho', viver: 'Repara' };

type EstadoPost = { conta: string | null; agendadoEm: string | null; hora: string | null; publicado: boolean };

function faceDaData(data: string): { titulo: string } {
  const n = semanasDesdeInicio(new Date(data + 'T12:00:00'));
  const i = ((n % FACES_ORDEM.length) + FACES_ORDEM.length) % FACES_ORDEM.length;
  return FACES_ORDEM[i];
}

function PlanoInner() {
  const sp = useSearchParams();
  const contaParam = (sp.get('conta') ?? '') as ContaId;
  const [sel, setSel] = useState<ContaId>(getConta(contaParam) ? contaParam : 'mae');
  const conta = getConta(sel)!;
  const ehMae = sel === 'mae';

  // arranca na próxima semana CHEIA (sem passado); navegador preso ao trimestre (13).
  const offStart = new Date().getDay() === 1 ? 0 : 1;
  const offFim = offStart + 12;
  const [off, setOff] = useState(offStart);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // estado REAL (o que já foi gerado), para marcar cada peça por gerar / ✓ gerado.
  const [estado, setEstado] = useState<Record<string, EstadoPost>>({});
  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/list').then((r) => (r.ok ? r.json() : { estado: {} })).then((j) => setEstado(j.estado ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const temPost = useCallback((data: string, periodo: 'manha' | 'tarde') => {
    return Object.values(estado).some((e) => e.conta === sel && e.agendadoEm === data && (periodo === 'tarde' ? (e.hora ?? '') >= '13:00' : (e.hora ?? '') < '13:00'));
  }, [estado, sel]);

  const dias = useMemo(() => planoSemanaMae(off).map((d) => {
    const dt = new Date(d.data + 'T12:00:00');
    const personagem = personagemDoDia(d.veu, dt);
    return { data: d.data, wd: DIA_SEMANA[dt.getDay()], veu: d.veu, personagem };
  }), [off]);

  const face = dias[0] ? faceDaData(dias[0].data) : null;

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setMsg('A gerar a semana…');
    try {
      const endpoint = ehMae ? '/api/admin/metodo/gerar-mae' : '/api/admin/metodo/gerar-conta';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: sel, offset: off, semanas: 1 }) });
      const j = await r.json();
      setMsg(r.ok ? `${j.gerados ?? 0} posts gerados. Vê-os em "produzir" desta conta; lá geras as imagens e renderizas.` : `erro: ${j.erro ?? ''} ${j.detalhe ?? ''}`);
      recarregar();
    } catch (e) { setMsg(String(e)); }
    finally { setBusy(false); }
  }, [busy, ehMae, sel, off, recarregar]);

  // TESTAR 1 DIA só NESTA conta (não nas 4): gera manhã+tarde de 1 dia só na conta
  // selecionada, para afinar/testar sem gastar créditos nas contas que ainda não estão prontas.
  const testarDiaConta = useCallback(async () => {
    if (busy) return;
    setBusy(true); setMsg(`A testar 1 dia · só @${conta.handle}…`);
    try {
      const endpoint = ehMae ? '/api/admin/metodo/gerar-mae' : '/api/admin/metodo/gerar-conta';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: sel, dia: dias[0]?.data, offset: off }) });
      const j = await r.json().catch(() => ({}));
      setMsg(r.ok ? `${j.gerados ?? 0} post(s) de 1 dia gerados só em @${conta.handle}. Vê em "produzir".` : `erro: ${j.erro ?? ''} ${j.detalhe ?? ''}`);
      recarregar();
    } catch (e) { setMsg(String(e)); }
    finally { setBusy(false); }
  }, [busy, ehMae, sel, dias, off, conta.handle, recarregar]);

  // AS 4 CONTAS de uma vez (o hub comum): testa 1 dia OU gera a semana de mãe + ver
  // + vir + viver, no offset visível. Cada chamada já persiste no servidor.
  const correrQuatro = useCallback(async (modo: 'dia' | 'semana') => {
    if (busy) return;
    setBusy(true);
    const alvo: { id: ContaId; ep: string }[] = [
      { id: 'mae', ep: 'gerar-mae' }, { id: 'ver', ep: 'gerar-conta' },
      { id: 'vir', ep: 'gerar-conta' }, { id: 'viver', ep: 'gerar-conta' },
    ];
    let total = 0;
    try {
      for (const a of alvo) {
        setMsg(`${modo === 'dia' ? 'A testar 1 dia' : 'A gerar a semana'} · ${a.id}…`);
        const body = modo === 'dia' ? { conta: a.id, dia: dias[0]?.data, offset: off } : { conta: a.id, offset: off, semanas: 1 };
        const r = await fetch(`/api/admin/metodo/${a.ep}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) total += j.gerados ?? 0;
      }
      setMsg(`${modo === 'dia' ? 'Teste de 1 dia' : 'Semana'} das 4 contas: ${total} posts. Vê em cada conta (tabs).`);
      recarregar();
    } catch (e) { setMsg(String(e)); }
    finally { setBusy(false); }
  }, [busy, dias, off, recarregar]);

  const inicio = dias[0]?.data ?? '';
  const gerarSerie = useCallback(async (serie: 'vcsabia' | 'hojeemmim', rotulo: string) => {
    if (busy || !inicio) return;
    setBusy(true); setMsg(`A gerar ${rotulo} da semana (7 dias)…`);
    try {
      const r = await fetch('/api/admin/series-diaria/gerar-mes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie, inicio, dias: 7 }) });
      const j = await r.json();
      setMsg(r.ok ? `${rotulo}: gerada(s) ${j.gerados ?? j.criados ?? 'ok'}.` : `erro ${rotulo}: ${j.erro ?? ''} ${j.detalhe ?? ''}`);
    } catch (e) { setMsg(String(e)); }
    finally { setBusy(false); }
  }, [busy, inicio]);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href={`/admin/metodo/${sel}`} className="text-[0.75rem] opacity-60 hover:opacity-100">← @{conta.handle}</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: '#1a1726' }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>Plano da semana · {conta.movimento}</h1>
          <p className="mt-2 text-[0.85rem] opacity-85">O <b>plano</b> da semana (o esqueleto, não conteúdo a fingir): cada dia, o véu + a face desta semana + o formato de manhã e de tarde. Cada peça mostra se está <b>por gerar</b> ou <b>✓ gerada</b>.</p>

          {/* tabs das 4 contas */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {CONTAS_LISTA.map((c) => (
              <button key={c.id} onClick={() => setSel(c.id)} className="px-3 py-1 rounded-lg border text-[0.78rem]" style={{ borderColor: c.id === sel ? c.cor : 'rgba(255,255,255,0.15)', color: c.id === sel ? c.cor : '#F2E8DC', background: c.id === sel ? c.cor + '18' : 'transparent' }}>@{c.handle}</button>
            ))}
          </div>

          {!ehMae && (
            <p className="mt-3 text-[0.82rem] opacity-80" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{PORTA_ENQUADRAMENTO[sel as 'ver' | 'vir' | 'viver']}{conta.fraseMae ? ` «${conta.fraseMae}»` : ''}</p>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap text-[0.75rem]">
            <button onClick={() => setOff((o) => Math.max(offStart, o - 1))} disabled={off <= offStart} className="px-2.5 py-1 rounded-lg border border-white/20 disabled:opacity-30">◀</button>
            <span className="opacity-80">semana {off - offStart + 1}/13{dias[0]?.data ? ` · ${dias[0].data.slice(8)}/${dias[0].data.slice(5, 7)}` : ''}{face ? ` · ${face.titulo}` : ''}</span>
            <button onClick={() => setOff((o) => Math.min(offFim, o + 1))} disabled={off >= offFim} className="px-2.5 py-1 rounded-lg border border-white/20 disabled:opacity-30">▶</button>
            <button onClick={testarDiaConta} disabled={busy} title="gera SÓ 1 dia (manhã + tarde) SÓ nesta conta — para testar/afinar sem gastar nas outras" className="ml-2 px-3 py-1.5 rounded-lg border border-sky-400/70 text-sky-200 disabled:opacity-50" style={{ background: 'rgba(56,189,248,0.12)' }}>{busy ? '…' : `🔍 testar 1 dia · só @${conta.handle}`}</button>
            <button onClick={gerar} disabled={busy} title="gera a semana toda SÓ nesta conta" className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-50">gerar a semana · só esta conta</button>
            <span className="opacity-30">·</span>
            <button onClick={() => correrQuatro('dia')} disabled={busy} title="gera 1 dia (manhã + tarde) nas 4 contas de uma vez" className="px-3 py-1.5 rounded-lg border border-white/20 opacity-80 disabled:opacity-50">testar 1 dia · 4 contas</button>
            <button onClick={() => correrQuatro('semana')} disabled={busy} title="gera a semana toda nas 4 contas de uma vez" className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: conta.cor, color: '#0F0F1A', background: conta.cor }}>{busy ? 'a gerar…' : '✦ gerar a semana · 4 contas'}</button>
            {ehMae && <>
              <button onClick={() => gerarSerie('vcsabia', 'vc sabia')} disabled={busy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-50">vc sabia</button>
              <button onClick={() => gerarSerie('hojeemmim', 'hoje em mim')} disabled={busy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-50">hoje em mim</button>
              <Link href="/admin/carrossel" className="px-3 py-1.5 rounded-lg border border-white/25">carrosséis →</Link>
            </>}
            <Link href={`/admin/metodo/${sel}`} className="px-3 py-1.5 rounded-lg border border-white/25">produzir / ver gerados →</Link>
          </div>
          {msg && <p className="mt-2 text-[0.78rem] text-emerald-300">{msg}</p>}
        </header>

        {/* a ordem da semana: 7 dias × 2 peças, com estado real */}
        <section className="mb-10 space-y-2">
          {dias.map((d) => {
            const temM = temPost(d.data, 'manha');
            const temT = temPost(d.data, 'tarde');
            return (
              <div key={d.data} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-2">{d.wd} · {d.data.slice(8)}/{d.data.slice(5, 7)} · <span style={{ color: conta.cor }}>{d.veu}</span></div>
                <div className={`grid ${ehMae ? 'md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {/* manhã — só a mãe (as filhas não têm post de manhã, por agora) */}
                  {ehMae && (
                  <div className="rounded-lg p-3" style={{ background: `${conta.cor}10`, border: `1px solid ${conta.cor}33` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[0.62rem] uppercase tracking-wider" style={{ color: conta.cor }}>10h30 · {NOME_MANHA[sel]}{d.personagem ? ` · ${d.personagem.nome}` : ''}</span>
                      <span className="text-[0.56rem] px-1.5 py-0.5 rounded-full" style={temM ? { background: 'rgba(126,155,142,0.25)', color: '#9ED8B8' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{temM ? '✓ gerada' : 'por gerar'}</span>
                    </div>
                    <p className="text-[0.82rem] opacity-60 leading-snug">Carta de {d.personagem?.nome ?? 'a personagem do dia'} — personagem fixa, mensagem gerada da semente dela. <span className="italic">{temM ? 'já gerada (vê em produzir).' : 'escreve-se ao gerar.'}</span></p>
                  </div>
                  )}
                  {/* tarde (filhas = único post, às 14h) */}
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[0.62rem] uppercase tracking-wider opacity-70">{ehMae ? '16h00' : '14h00'} · {NOME_TARDE[sel]}</span>
                      <span className="text-[0.56rem] px-1.5 py-0.5 rounded-full" style={temT ? { background: 'rgba(126,155,142,0.25)', color: '#9ED8B8' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{temT ? '✓ gerada' : 'por gerar'}</span>
                    </div>
                    <p className="text-[0.82rem] opacity-60 leading-snug">{ehMae ? 'A assimetria invisível (responsabilidade sem autoridade · gestão emocional), com a volta de sobrevivência.' : `${NOME_TARDE[sel]}, ancorado no véu ${d.veu}.`} <span className="italic">Escreve-se ao gerar.</span></p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* o baralho inteiro — só a mãe (é o material "Sou Aquela") */}
        {ehMae && (
          <section>
            <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">O baralho &quot;Sou Aquela&quot; · as personagens (fixas)</h2>
            <p className="text-[0.72rem] opacity-50 mb-4">As PERSONAGENS do baralho são fixas; a MENSAGEM de cada carta NÃO é — gera-se a partir desta semente (a voz dela), variando de cada vez. Em baixo vês a semente curada de cada personagem.</p>
            <div className="space-y-5">
              {FAMILIAS.map((f) => (
                <div key={f.id}>
                  <div className="text-[0.72rem] uppercase tracking-wider mb-2" style={{ color: conta.cor }}>{f.nome}</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {f.personagens.map((p) => {
                      const carta = cartaDoBaralho(p.id);
                      return (
                        <div key={p.id} className="rounded-lg p-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="text-[0.7rem] mb-1.5 opacity-80" style={{ color: conta.cor }}>{p.nome}</div>
                          <div style={{ fontFamily: 'var(--font-cormorant), serif' }} className="text-[0.88rem] leading-snug">
                            {carta.length ? carta.map((l, i) => <div key={i} className={i === carta.length - 1 ? 'italic mt-1 opacity-90' : ''}>{l}</div>) : <span className="opacity-40 text-[0.78rem]">(por escrever)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function MaePlanoPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#0F0F1A]" />}><PlanoInner /></Suspense>;
}
