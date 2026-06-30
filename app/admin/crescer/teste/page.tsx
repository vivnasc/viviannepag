'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// SANDBOX · a BÍBLIA VISUAL do mundo dela. Ela carrega as imagens fundadoras (feitas
// no MidJourney/ChatGPT) por categoria; o gerador fotografa acontecimentos ancorado
// nelas (image_prompt, peso forte). SEM tocar nos posts nem no gerador a sério.
type Amostra = { url: string; categoria: string; ts: number };
type Anchor = { url: string; categoria: string; path: string };

export default function TesteMundoPage() {
  const [busy, setBusy] = useState(false);
  const [historico, setHistorico] = useState<Amostra[]>([]);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [cat, setCat] = useState('cidade');
  const [erro, setErro] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    try {
      const [h, a] = await Promise.all([
        fetch('/api/admin/crescer/teste-mundo').then((r) => r.json()),
        fetch('/api/admin/crescer/anchors').then((r) => r.json()),
      ]);
      if (Array.isArray(h.amostras)) setHistorico(h.amostras as Amostra[]);
      if (Array.isArray(a.anchors)) setAnchors(a.anchors as Anchor[]);
      if (Array.isArray(a.categorias)) { setCats(a.categorias as string[]); if (a.categorias[0]) setCat((c) => c || a.categorias[0]); }
    } catch { /* offline */ }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const subirAncora = async (file: File) => {
    setBusy(true); setErro('');
    try {
      const dataUrl = await new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(file); });
      const r = await fetch('/api/admin/crescer/anchors', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dataUrl, categoria: cat }) });
      const d = await r.json();
      if (!d.ok) setErro(d.detalhe || d.erro || 'falhou'); else await carregar();
    } catch (e) { setErro(String(e)); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  // promove uma imagem GERADA a fundadora (âncora) na categoria escolhida no dropdown.
  const promover = async (url: string) => {
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/anchors', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fromUrl: url, categoria: cat }) });
      const d = await r.json();
      if (!d.ok) setErro(d.detalhe || d.erro || 'falhou'); else await carregar();
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  };

  const apagarAncora = async (path: string) => {
    setBusy(true);
    try { await fetch('/api/admin/crescer/anchors', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path }) }); await carregar(); }
    finally { setBusy(false); }
  };

  const gerar = async (modo: 'objetos' | 'cenas') => {
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/teste-mundo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ modo }) });
      const d = await r.json();
      if (d.amostras?.length) await carregar(); else setErro(d.detalhe || d.erro || 'falhou');
    } catch (e) {
      // "Load failed" = o navegador largou o pedido longo, mas o servidor pode ter
      // continuado e guardado as imagens. Recarrega o histórico para as apanhar.
      setErro(`${e} — (a verificar se as imagens chegaram a sair…)`);
      setTimeout(() => carregar(), 8000);
      setTimeout(() => carregar(), 25000);
    } finally { setBusy(false); }
  };

  const limpar = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar TODAS as amostras de teste?')) return;
    setBusy(true);
    try { await fetch('/api/admin/crescer/teste-mundo', { method: 'DELETE' }); await carregar(); } finally { setBusy(false); }
  };

  const fmt = (ts: number) => { try { return ts ? new Date(ts).toLocaleString('pt-PT') : ''; } catch { return ''; } };
  const btn = { padding: '8px 16px', borderRadius: 10, border: '1px solid #888', background: '#1a1a1a', color: '#eee', cursor: 'pointer' } as const;

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: '#eee', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>🧪 Gerador de teste · o teu mundo</h1>
      <p style={{ opacity: 0.7, fontSize: 13, margin: '0 0 16px', lineHeight: 1.4 }}>
        Carrega as tuas imagens FUNDADORAS por categoria (a bíblia visual). O gerador fotografa
        acontecimentos do mundo <strong>ancorado nelas</strong>, sem tocar nos teus posts nem no gerador a sério.
      </p>

      {/* BÍBLIA VISUAL — upload de âncoras */}
      <section style={{ border: '1px solid #333', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, margin: '0 0 8px' }}>📚 Bíblia visual ({anchors.length} âncoras)</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ ...btn, padding: '7px 10px' }}>
            {(cats.length ? cats : [cat]).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input ref={fileRef} type="file" accept="image/*" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) subirAncora(f); }}
            style={{ fontSize: 12, color: '#ccc' }} />
          <span style={{ opacity: 0.55, fontSize: 12 }}>escolhe a categoria e carrega a imagem</span>
        </div>
        {anchors.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginTop: 12 }}>
            {anchors.map((a) => (
              <figure key={a.path} style={{ margin: 0, position: 'relative' }}>
                <img src={a.url} alt={a.categoria} loading="lazy" style={{ width: '100%', borderRadius: 8, display: 'block', aspectRatio: '1', objectFit: 'cover' }} />
                <figcaption style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{a.categoria}</figcaption>
                <button onClick={() => apagarAncora(a.path)} disabled={busy} title="apagar" style={{ position: 'absolute', top: 4, right: 4, border: 'none', borderRadius: 6, background: 'rgba(0,0,0,.6)', color: '#f99', cursor: 'pointer', fontSize: 11, padding: '2px 6px' }}>✕</button>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* GERAR */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => gerar('cenas')} disabled={busy} title="gera imagens do mundo (cenas humanas) no gpt-image-2, ancoradas nas tuas referências" style={{ ...btn, background: busy ? '#333' : '#1a1a1a' }}>
          {busy ? 'a gerar imagens do mundo…' : 'gerar imagens do mundo'}
        </button>
        {historico.length > 0 && (
          <>
            <span style={{ opacity: 0.6, fontSize: 12 }}>{historico.length} no histórico</span>
            <button onClick={limpar} disabled={busy} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #644', background: 'transparent', color: '#d99', cursor: 'pointer', fontSize: 12 }}>limpar histórico</button>
          </>
        )}
      </div>
      {erro && <p style={{ color: '#f88', marginTop: 12, fontSize: 13 }}>erro: {erro}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 20 }}>
        {historico.map((a, i) => (
          <figure key={`${a.ts}-${i}`} style={{ margin: 0, position: 'relative' }}>
            <img src={a.url} alt={a.categoria} loading="lazy" style={{ width: '100%', borderRadius: 10, display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
            <button onClick={() => promover(a.url)} disabled={busy} title={`guardar como fundadora na categoria "${cat}"`}
              style={{ position: 'absolute', top: 6, right: 6, border: 'none', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#ffd479', cursor: 'pointer', fontSize: 11, padding: '3px 7px' }}>
              ⭐ {cat}
            </button>
            <figcaption style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{a.categoria || '·'}<span style={{ opacity: 0.5 }}> · {fmt(a.ts)}</span></figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
