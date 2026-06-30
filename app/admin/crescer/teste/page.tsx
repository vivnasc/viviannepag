'use client';
import { useState, useEffect, useCallback } from 'react';

// SANDBOX isolado para afinar O MUNDO (mentes evoluídas, abundância = novo normal),
// SEM tocar nos posts nem no gerador a sério. Gera amostras descartáveis, mostra-as,
// e GUARDA HISTÓRICO (localStorage) para comparar iterações sem perder nada.
type Amostra = { url: string; categoria: string; ts: number };
const CHAVE = 'crescer-teste-historico';

export default function TesteMundoPage() {
  const [busy, setBusy] = useState(false);
  const [historico, setHistorico] = useState<Amostra[]>([]);
  const [erro, setErro] = useState('');

  // carrega o histórico guardado ao abrir
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAVE);
      if (raw) setHistorico(JSON.parse(raw) as Amostra[]);
    } catch { /* sem histórico */ }
  }, []);

  const guardar = useCallback((lista: Amostra[]) => {
    setHistorico(lista);
    try { localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 200))); } catch { /* cheio */ }
  }, []);

  const gerar = async () => {
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/teste-mundo', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantos: 4 }),
      });
      const d = await r.json();
      if (d.amostras?.length) {
        const novas: Amostra[] = (d.amostras as { url: string; categoria: string }[]).map((a) => ({ ...a, ts: Date.now() }));
        guardar([...novas, ...historico]); // mais recentes primeiro
      } else setErro(d.detalhe || d.erro || 'falhou');
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  };

  const limpar = () => { if (typeof window !== 'undefined' && window.confirm('Limpar o histórico de amostras? (não apaga os ficheiros, só a lista aqui)')) guardar([]); };

  const fmt = (ts: number) => { try { return new Date(ts).toLocaleString('pt-PT'); } catch { return ''; } };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>🧪 Gerador de teste · o teu mundo</h1>
      <p style={{ opacity: 0.7, fontSize: 13, margin: '0 0 16px', lineHeight: 1.4 }}>
        Sandbox isolado: gera amostras do mundo (mentes evoluídas, abundância como novo normal)
        <strong> sem tocar nos teus posts nem no gerador a sério</strong>. Guarda histórico para comparares iterações.
        A cena «pessoa sozinha na vegetação» e a escassez estão banidas.
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={gerar} disabled={busy}
          style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #888', background: busy ? '#333' : '#1a1a1a', color: '#eee', cursor: busy ? 'default' : 'pointer' }}>
          {busy ? 'a gerar 4 amostras… (pode levar 1-2 min)' : 'gerar 4 amostras'}
        </button>
        {historico.length > 0 && (
          <>
            <span style={{ opacity: 0.6, fontSize: 12 }}>{historico.length} no histórico</span>
            <button onClick={limpar} disabled={busy}
              style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #644', background: 'transparent', color: '#d99', cursor: 'pointer', fontSize: 12 }}>
              limpar histórico
            </button>
          </>
        )}
      </div>
      {erro && <p style={{ color: '#f88', marginTop: 12, fontSize: 13 }}>erro: {erro}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 20 }}>
        {historico.map((a, i) => (
          <figure key={`${a.ts}-${i}`} style={{ margin: 0 }}>
            <img src={a.url} alt={a.categoria} style={{ width: '100%', borderRadius: 10, display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
            <figcaption style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{a.categoria}<span style={{ opacity: 0.5 }}> · {fmt(a.ts)}</span></figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
