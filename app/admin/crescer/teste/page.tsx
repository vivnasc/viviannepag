'use client';
import { useState, useEffect, useCallback } from 'react';

// SANDBOX isolado para afinar O MUNDO, ancorado nas referências DELA, SEM tocar nos
// posts nem no gerador a sério. O HISTÓRICO vem do SERVIDOR (a pasta real das amostras),
// por isso não se perde ao recarregar nem ao trocar de aba.
type Amostra = { url: string; categoria: string; ts: number };

export default function TesteMundoPage() {
  const [busy, setBusy] = useState(false);
  const [historico, setHistorico] = useState<Amostra[]>([]);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/crescer/teste-mundo', { method: 'GET' });
      const d = await r.json();
      if (Array.isArray(d.amostras)) setHistorico(d.amostras as Amostra[]);
    } catch { /* offline */ }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const gerar = async () => {
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/teste-mundo', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantos: 4 }),
      });
      const d = await r.json();
      if (d.amostras?.length) await carregar(); // o histórico vem do servidor
      else setErro(d.detalhe || d.erro || 'falhou');
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  };

  const limpar = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar TODAS as amostras de teste?')) return;
    setBusy(true);
    try { await fetch('/api/admin/crescer/teste-mundo', { method: 'DELETE' }); await carregar(); }
    finally { setBusy(false); }
  };

  const fmt = (ts: number) => { try { return ts ? new Date(ts).toLocaleString('pt-PT') : ''; } catch { return ''; } };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>🧪 Gerador de teste · o teu mundo</h1>
      <p style={{ opacity: 0.7, fontSize: 13, margin: '0 0 16px', lineHeight: 1.4 }}>
        Sandbox isolado, ancorado nas TUAS 3 imagens de referência, <strong>sem tocar nos teus posts nem no gerador a sério</strong>.
        O histórico fica guardado no servidor (não se perde ao recarregar).
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
            <img src={a.url} alt={a.categoria} loading="lazy" style={{ width: '100%', borderRadius: 10, display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
            <figcaption style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{a.categoria || '·'}<span style={{ opacity: 0.5 }}> · {fmt(a.ts)}</span></figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
