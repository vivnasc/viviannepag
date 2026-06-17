'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS, type ContaId } from '@/lib/metodo/contas';
import { CONTAS_UNIVERSO, CALENDARIO_UNIVERSO, GESTO_CONTA } from '@/lib/metodo/universo';
import { FAMILIAS } from '@/lib/metodo/personagens';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// UNIVERSO VS · o MACRO primeiro (de onde partimos -> para onde vamos), e só
// depois a SEMANA a descer dele. A Vivianne vê o mapa antes de validar o semanal.

type Reel = { hook: string; reconhecimento: string; raiz: string; volta: string; envio: string };
type Dia = { wd: number; nome: string; veu: string; personagem: string; reel: Reel | null };

// "onde estamos -> para onde vamos" por conta (do plano fechado; transição, não demolição).
const CAMINHO: Record<ContaId, { funcao: string; de: string; para: string }> = {
  mae: { funcao: 'A VOZ · nomeia', de: 'a conta-mãe que junta a voz e as séries', para: 'a voz que nomeia o padrão em 1.ª pessoa, o centro do universo' },
  ver: { funcao: 'VER · de fora', de: 'a porta que mostra o padrão', para: 'as histórias/espelho onde a pessoa se vê (revelação)' },
  vir: { funcao: 'PARAR · receber', de: 'a porta do regresso', para: 'a primeira a acender: parar, receber, deixar de carregar tudo' },
  viver: { funcao: 'VIVER · um gesto hoje', de: 'a porta da prática', para: 'o exercício/gesto concreto que leva ao produto' },
};

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
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Universo VS · o mapa</h1>
          <Link href="/admin/metodo" className="text-[0.7rem] opacity-60 hover:opacity-100">← Método VS</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-6">Primeiro o <b>macro</b> (de onde partimos, para onde vamos). A semana <b>desce</b> daqui. veu.a.veu fica fora.</p>

        {/* 1 · AS 4 CONTAS — de onde estamos -> para onde vamos */}
        <h2 className="text-[0.62rem] uppercase tracking-[0.18em] opacity-50 mb-2">1 · As 4 contas (a travessia, não demolição)</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 mb-7">
          {CONTAS_UNIVERSO.map((c) => {
            const conta = CONTAS[c]; const cam = CAMINHO[c];
            return (
              <div key={c} className="rounded-xl border border-white/10 p-3.5" style={{ background: `linear-gradient(135deg, ${conta.cor}14, transparent 60%)` }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[0.95rem]" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</span>
                  <span className="text-[0.58rem] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: conta.cor + '22', color: conta.cor }}>{cam.funcao}</span>
                </div>
                <p className="text-[0.74rem] opacity-65"><span className="opacity-50">hoje:</span> {cam.de}</p>
                <p className="text-[0.74rem] mt-0.5" style={{ color: conta.cor }}><span className="opacity-50 text-[#F2E8DC]">para onde vai:</span> {cam.para}</p>
              </div>
            );
          })}
        </div>

        {/* 2 · A ESPIRAL — 1 véu por dia, repete e aprofunda */}
        <h2 className="text-[0.62rem] uppercase tracking-[0.18em] opacity-50 mb-2">2 · A espiral · 1 véu por dia</h2>
        <div className="rounded-xl border border-white/10 p-3.5 mb-2 bg-white/[0.03]">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CALENDARIO_UNIVERSO.map((d) => (
              <div key={d.wd} className="text-center rounded-lg border border-white/10 py-2">
                <p className="text-[0.56rem] uppercase tracking-wider opacity-50">{d.nome.slice(0, 3)}</p>
                <p className="text-[0.86rem]" style={{ fontFamily: 'var(--font-cormorant), serif', color: '#EBAE4A' }}>{d.veu}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[0.7rem] opacity-45 mb-7">A semana repete-se e <b>aprofunda</b> (espiral, não escada): os mesmos 7 véus, voltas mais finas de cada vez. No mesmo dia, as 4 contas tratam o <b>mesmo véu</b>, cada uma no seu gesto (o funil fecha dentro do dia).</p>

        {/* 3 · A MATÉRIA — as 5 famílias de personagens (o reservatório infinito) */}
        <h2 className="text-[0.62rem] uppercase tracking-[0.18em] opacity-50 mb-2">3 · A matéria · 5 famílias de personagens</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-1">
          {FAMILIAS.map((f) => (
            <div key={f.id} className="rounded-xl border border-white/10 p-3 bg-black/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[0.84rem]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{f.nome}</span>
                {f.tier === 'nucleo' && <span className="text-[0.5rem] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#EBAE4A]/20 text-[#EBAE4A]">núcleo</span>}
              </div>
              <p className="text-[0.72rem] opacity-70 italic" style={{ fontFamily: 'var(--font-cormorant), serif' }}>“{f.crenca}”</p>
              <p className="text-[0.62rem] opacity-45 mt-1">{f.personagens.map((p) => p.nome.replace(/^A /, '')).join(' · ')}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.7rem] opacity-45 mb-8">Cada personagem atravessa vários véus. É daqui que sai conteúdo sem fim e sem repetir: o véu dá o <b>porquê</b>, a personagem dá o <b>quem</b>, a conta dá o <b>como</b>.</p>

        {/* 4 · A SEMANA — desce do macro */}
        <h2 className="text-[0.62rem] uppercase tracking-[0.18em] opacity-50 mb-2">4 · A semana (desce daqui · só texto, Fase 1)</h2>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <button onClick={gerarSemana} disabled={!!busy} className="px-4 py-2 rounded-lg border border-[#EBAE4A] text-[#0F0F1A] bg-[#EBAE4A] disabled:opacity-50 text-[0.82rem] font-medium">{busy ? `a gerar @${CONTAS[busy as ContaId]?.handle}…` : 'gerar a semana'}</button>
          {erro && <span className="text-[0.8rem] text-rose-300">{erro}</span>}
          {msg && !erro && <span className="text-[0.8rem] text-emerald-300">{msg}</span>}
        </div>

        <div className="space-y-7">
          {CONTAS_UNIVERSO.map((c) => {
            const conta = CONTAS[c];
            const dias = dados[c];
            return (
              <section key={c} className="rounded-2xl border border-white/10 p-4" style={{ background: conta.paleta.bg1 + '55' }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h3 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>@{conta.handle}</h3>
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

        <p className="text-[0.7rem] opacity-40 mt-6">Validas a escrita. Quando aprovares a voz, ligamos a imagem (o gesto de cada conta) e depois produzir/agendar.</p>
      </div>
    </div>
  );
}
