'use client';

// MÃE · PLANO DA SEMANA (a legibilidade da veu.a.veu): vês a ORDEM da semana ANTES
// de gerar — cada dia, a CARTA do baralho (texto fixo, real) ao meio da manhã +
// o "Não normalizes" ao meio da tarde. Em baixo, o baralho inteiro para afinares.
// Não toca nos 3 geradores maduros (abertura/pico/fecho). 1 clique gera a semana.

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { planoSemanaMae } from '@/lib/metodo/semana';
import { personagemDoDia } from '@/lib/metodo/peca';
import { FAMILIAS } from '@/lib/metodo/personagens';
import { cartaDoBaralho } from '@/lib/metodo/baralho';

const FONTS = 'font-[system-ui]';
const COR = '#d8b25a'; // mãe

const DIA_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export default function MaePlanoPage() {
  const [off, setOff] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const dias = useMemo(() => planoSemanaMae(off).map((d) => {
    const dt = new Date(d.data + 'T12:00:00');
    const personagem = personagemDoDia(d.veu, dt);
    return { data: d.data, wd: DIA_SEMANA[dt.getDay()], veu: d.veu, personagem, carta: personagem ? cartaDoBaralho(personagem.id) : [] };
  }), [off]);

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setMsg('A gerar a semana da mãe (cartas do baralho + não normalizes)…');
    try {
      const r = await fetch('/api/admin/metodo/gerar-mae', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ offset: off, semanas: 1 }) });
      const j = await r.json();
      setMsg(r.ok ? `${j.gerados ?? 0} posts gerados. Vê-os em @vivianne.dos.santos (manhã = cartas, tarde = não normalizes), gera as imagens em falta e renderiza.` : `erro: ${j.erro ?? ''} ${j.detalhe ?? ''}`);
    } catch (e) { setMsg(String(e)); }
    finally { setBusy(false); }
  }, [off, busy]);

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/metodo/mae" className="text-[0.75rem] opacity-60 hover:opacity-100">← @vivianne.dos.santos</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: '#1a1726' }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: COR }}>Plano da semana · Mãe</h1>
          <p className="mt-2 text-[0.85rem] opacity-85">A ordem da semana do Método VS na conta-mãe, <b>antes de gerar</b>: meio da manhã (10h30) a <b>carta</b> da personagem do dia; meio da tarde (16h00) o <b>não normalizes</b>. Não mexe na abertura, no pico nem no fecho do dia.</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[0.75rem]">
            <button onClick={() => setOff((o) => o - 1)} className="px-2.5 py-1 rounded-lg border border-white/20">◀</button>
            <span className="opacity-80">{off === 0 ? 'esta semana' : off > 0 ? `daqui a ${off} sem.` : `há ${-off} sem.`}</span>
            <button onClick={() => setOff((o) => o + 1)} className="px-2.5 py-1 rounded-lg border border-white/20">▶</button>
            <button onClick={gerar} disabled={busy} className="ml-2 px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: COR, color: '#0F0F1A', background: COR }}>{busy ? 'a gerar…' : 'gerar esta semana'}</button>
          </div>
          {msg && <p className="mt-2 text-[0.78rem] text-emerald-300">{msg}</p>}
        </header>

        {/* a ordem da semana: 7 dias × 2 posts */}
        <section className="mb-10 space-y-2">
          {dias.map((d) => (
            <div key={d.data} className="rounded-xl border border-white/10 p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-2">{d.wd} · {d.data.slice(8)}/{d.data.slice(5, 7)}</div>
              <div className="grid md:grid-cols-2 gap-3">
                {/* manhã: carta */}
                <div className="rounded-lg p-3" style={{ background: 'rgba(216,178,90,0.06)', border: '1px solid rgba(216,178,90,0.25)' }}>
                  <div className="text-[0.62rem] uppercase tracking-wider mb-1.5" style={{ color: COR }}>10h30 · Carta {d.personagem ? `· ${d.personagem.nome}` : ''}</div>
                  <div style={{ fontFamily: 'var(--font-cormorant), serif' }} className="text-[0.95rem] leading-snug">
                    {d.carta.length ? d.carta.map((l, i) => <div key={i} className={i === d.carta.length - 1 ? 'italic mt-1' : ''} style={i === d.carta.length - 1 ? { color: COR } : undefined}>{l}</div>) : <span className="opacity-50 text-[0.8rem]">sem carta para esta personagem</span>}
                  </div>
                </div>
                {/* tarde: não normalizes */}
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-[0.62rem] uppercase tracking-wider mb-1.5 opacity-70">16h00 · Não normalizes</div>
                  <p className="text-[0.82rem] opacity-60 leading-snug">A assimetria invisível (responsabilidade sem autoridade · gestão emocional), com a volta de sobrevivência. <span className="italic">Gera-se com o botão.</span></p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* o baralho inteiro, para afinar */}
        <section>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">O baralho "Sou Aquela" · uma carta por personagem</h2>
          <p className="text-[0.72rem] opacity-50 mb-4">Fixo e curado (vem do material real de cada personagem). Para afinar uma carta, diz-me qual e o que mudar.</p>
          <div className="space-y-5">
            {FAMILIAS.map((f) => (
              <div key={f.id}>
                <div className="text-[0.72rem] uppercase tracking-wider mb-2" style={{ color: COR }}>{f.nome}</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {f.personagens.map((p) => {
                    const carta = cartaDoBaralho(p.id);
                    return (
                      <div key={p.id} className="rounded-lg p-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="text-[0.7rem] mb-1.5 opacity-80" style={{ color: COR }}>{p.nome}</div>
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
      </div>
    </main>
  );
}
