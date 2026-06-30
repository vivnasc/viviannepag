'use client';
import { useState } from 'react';

// SANDBOX isolado para afinar O MUNDO (mentes evoluídas, abundância = novo normal),
// SEM tocar nos posts nem no gerador a sério. Gera amostras descartáveis e mostra-as.
export default function TesteMundoPage() {
  const [busy, setBusy] = useState(false);
  const [amostras, setAmostras] = useState<{ url: string; categoria: string }[]>([]);
  const [erro, setErro] = useState('');

  const gerar = async () => {
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/teste-mundo', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantos: 4 }),
      });
      const d = await r.json();
      if (d.amostras?.length) setAmostras(d.amostras);
      else setErro(d.detalhe || d.erro || 'falhou');
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>🧪 Gerador de teste · o teu mundo</h1>
      <p style={{ opacity: 0.7, fontSize: 13, margin: '0 0 16px', lineHeight: 1.4 }}>
        Sandbox isolado: gera amostras do mundo (mentes evoluídas, abundância como novo normal)
        <strong> sem tocar nos teus posts nem no gerador a sério</strong>. Para afinarmos o teu mundo à vontade.
        A cena «pessoa sozinha na vegetação» e a escassez estão banidas.
      </p>
      <button onClick={gerar} disabled={busy}
        style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #888', background: busy ? '#333' : '#1a1a1a', color: '#eee', cursor: busy ? 'default' : 'pointer' }}>
        {busy ? 'a gerar 4 amostras… (pode levar 1-2 min)' : 'gerar 4 amostras'}
      </button>
      {erro && <p style={{ color: '#f88', marginTop: 12, fontSize: 13 }}>erro: {erro}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 20 }}>
        {amostras.map((a, i) => (
          <figure key={i} style={{ margin: 0 }}>
            <img src={a.url} alt={a.categoria} style={{ width: '100%', borderRadius: 10, display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
            <figcaption style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{a.categoria}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
