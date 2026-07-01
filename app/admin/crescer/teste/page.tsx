'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TEMAS_CENA } from '@/lib/crescer/mundo-teste';

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
  const [promovidas, setPromovidas] = useState<Set<string>>(new Set()); // urls já guardadas (anti-duplicado)
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
    if (promovidas.has(url)) return; // anti-duplicado
    setBusy(true); setErro('');
    try {
      const r = await fetch('/api/admin/crescer/anchors', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fromUrl: url, categoria: cat }) });
      const d = await r.json();
      if (!d.ok) setErro(d.detalhe || d.erro || 'falhou');
      else { setPromovidas((s) => new Set(s).add(url)); await carregar(); }
    } catch (e) { setErro(String(e)); } finally { setBusy(false); }
  };

  const limparAncoras = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar TODAS as âncoras da bíblia visual?')) return;
    setBusy(true);
    try { await fetch('/api/admin/crescer/anchors', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ todas: true }) }); setPromovidas(new Set()); await carregar(); }
    finally { setBusy(false); }
  };

  const apagarAncora = async (path: string) => {
    setBusy(true);
    try { await fetch('/api/admin/crescer/anchors', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path }) }); await carregar(); }
    finally { setBusy(false); }
  };

  const [aGerar, setAGerar] = useState(0); // quantas ainda a sair (progresso)

  // ── TESTAR COM O CONTEÚDO DA MÃE · NÃO se cria nada: puxa-se uma frase JÁ gerada
  // no crescer (com a sua matéria) e o mundo dá-lhe a imagem. A matéria vem do conteúdo.
  const [frase, setFrase] = useState('');
  const [temaSel, setTemaSel] = useState('emergencia');
  const [materiaLabel, setMateriaLabel] = useState('');
  const [frasesMae, setFrasesMae] = useState<{ frase: string; tematica: string }[]>([]);
  const [idxMae, setIdxMae] = useState(0);
  const [testes, setTestes] = useState<{ url: string; tema: string; frase: string; ts: number }[]>([]);
  const [aTestar, setATestar] = useState(0);

  // matéria da mãe → tema do mundo (partilham o vocabulário; só 'eumaior' precisa de mapa).
  const aoTema = (t: string) => {
    if (t === 'eumaior') return 'consciencia';
    return TEMAS_CENA.some((x) => x.tema === t) ? t : 'emergencia';
  };
  const labelTema = (t: string) => TEMAS_CENA.find((x) => x.tema === t)?.nome ?? t;

  // PUXA uma frase REAL da mãe (cicla pela lista). Carrega a lista na 1.ª vez.
  const puxarMae = async () => {
    setErro('');
    let lista = frasesMae;
    if (!lista.length) {
      try {
        const d = await fetch('/api/admin/crescer/frases-reais').then((r) => r.json());
        lista = Array.isArray(d.frases) ? d.frases : [];
        setFrasesMae(lista);
      } catch { setErro('não consegui ler o conteúdo da mãe'); return; }
    }
    if (!lista.length) { setErro('ainda não há conteúdo gerado no crescer para testar'); return; }
    const i = idxMae % lista.length;
    const item = lista[i];
    setIdxMae(i + 1);
    setFrase(item.frase);
    const tema = aoTema(item.tematica);
    setTemaSel(tema);
    setMateriaLabel(labelTema(tema));
  };

  // gera N imagens do mundo PARA o tema escolhido, com a frase por cima (mock do post).
  const gerarTeste = async () => {
    const N = 4;
    setErro(''); setBusy(true); setATestar(N);
    let fail = 0;
    const f = frase, tema = temaSel;
    const baseSeed = Math.floor(Date.now() / 1000);
    const uma = async (k: number) => {
      await new Promise((r) => setTimeout(r, k * 1800));
      try {
        // a CENA nasce da FRASE real (infinito); tema vai só como reserva.
        const r = await fetch('/api/admin/crescer/teste-mundo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ modo: 'cenas', quantos: 1, seed: baseSeed + k * 37, ancoras: false, tema, frase: f }) });
        const d = await r.json();
        if (d.amostras?.length) setTestes((t) => [{ url: d.amostras[0].url, tema, frase: f, ts: Date.now() }, ...t]);
        else { fail++; if (d.detalhe || d.erro) setErro(d.detalhe || d.erro); }
      } catch { fail++; }
      finally { setATestar((n) => Math.max(0, n - 1)); }
    };
    await Promise.allSettled(Array.from({ length: N }, (_, k) => uma(k)));
    setBusy(false); setATestar(0);
    if (fail > 0) setErro(`saíram ${N - fail} de ${N} (${fail} falharam)`);
  };

  // EFICIENTE: dispara N gerações EM PARALELO (cada uma curta e independente, 1 imagem),
  // e cada uma entra no ecrã assim que fica pronta — sem esperar pelo lote todo.
  // ancoras=false → gera só por TEXTO (o ADN respira, sem o look das âncoras a prender).
  const gerar = async (ancoras: boolean) => {
    const N = 8;
    setErro(''); setBusy(true); setAGerar(N);
    let ok = 0, fail = 0;
    const baseSeed = Math.floor(Date.now() / 1000);
    // ESPAÇA os pedidos (a Replicate trava em rajada de 5 quando há pouco crédito):
    // um a cada ~1,8s em vez de 8 de uma vez. Cada um entra no ecrã assim que sai.
    const dispararUma = async (k: number) => {
      await new Promise((r) => setTimeout(r, k * 1800));
      try {
        const r = await fetch('/api/admin/crescer/teste-mundo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ modo: 'cenas', quantos: 1, seed: baseSeed + k * 37, ancoras }) });
        const d = await r.json();
        if (d.amostras?.length) { ok++; setHistorico((h) => [{ ...d.amostras[0], ts: Date.now() }, ...h]); }
        else { fail++; if (d.detalhe || d.erro) setErro(d.detalhe || d.erro); }
      } catch { fail++; /* uma falhou; as outras seguem */ }
      finally { setAGerar((n) => Math.max(0, n - 1)); }
    };
    await Promise.allSettled(Array.from({ length: N }, (_, k) => dispararUma(k)));
    await carregar(); // sincroniza com o servidor (fonte da verdade)
    setBusy(false); setAGerar(0);
    if (fail > 0) setErro(`saíram ${ok} de ${N} (${fail} falharam — carrega outra vez para completar)`);
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

      {/* TESTAR COM O CONTEÚDO DA MÃE — frase REAL já gerada + a sua matéria */}
      <section style={{ border: '1px solid #3a5a88', borderRadius: 12, padding: 16, marginBottom: 20, background: '#10192a' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 4px' }}>🪢 Testar com o conteúdo da mãe</h2>
        <p style={{ opacity: 0.65, fontSize: 12, margin: '0 0 10px', lineHeight: 1.4 }}>
          Não se cria nada novo. Puxa uma frase que <strong>já geraste</strong> no crescer; a <strong>cena da imagem nasce dessa frase</strong> (a IA inventa uma cena do mundo com o mesmo sentimento, infinito, sem lista fixa). Vês o post real (imagem + texto da mãe).
        </p>
        <div style={{ minHeight: 56, borderRadius: 8, border: '1px solid #345', background: '#0b1118', padding: '12px 14px', fontSize: 15, lineHeight: 1.4, color: frase ? '#eee' : '#667' }}>
          {frase || 'carrega «puxar conteúdo da mãe» para trazer uma frase real…'}
        </div>
        {materiaLabel && <p style={{ fontSize: 12, opacity: 0.75, margin: '8px 0 0' }}>matéria: <strong style={{ color: '#9ec5ff' }}>{materiaLabel}</strong></p>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
          <button onClick={puxarMae} disabled={busy} style={{ ...btn, padding: '8px 14px' }}>🪢 puxar conteúdo da mãe</button>
          <button onClick={gerarTeste} disabled={busy || !frase} style={{ ...btn, background: busy ? '#333' : '#1d3a66', borderColor: '#3a5a88', opacity: !frase ? 0.5 : 1 }}>
            {busy && aTestar > 0 ? `a gerar… (${aTestar} a sair)` : 'gerar 4 para esta matéria'}
          </button>
          {testes.length > 0 && <button onClick={() => setTestes([])} disabled={busy} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #644', background: 'transparent', color: '#d99', cursor: 'pointer', fontSize: 12 }}>limpar testes</button>}
        </div>
        {testes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
            {testes.map((t, i) => (
              <figure key={`${t.ts}-${i}`} style={{ margin: 0, position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                <img src={t.url} alt={t.tema} loading="lazy" style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
                {t.frase && (
                  <figcaption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 14px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,.78))', color: '#fff', fontSize: 15, lineHeight: 1.3, fontWeight: 600, textShadow: '0 1px 6px rgba(0,0,0,.6)' }}>{t.frase}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* BÍBLIA VISUAL — upload de âncoras */}
      <section style={{ border: '1px solid #333', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 15, margin: 0 }}>📚 Bíblia visual ({anchors.length} âncoras)</h2>
          {anchors.length > 0 && <button onClick={limparAncoras} disabled={busy} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #644', background: 'transparent', color: '#d99', cursor: 'pointer', fontSize: 12 }}>limpar âncoras</button>}
        </div>
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
                <button onClick={() => apagarAncora(a.path)} disabled={busy} title="remover esta âncora"
                  style={{ position: 'absolute', top: 5, right: 5, border: 'none', borderRadius: 8, background: 'rgba(180,30,30,.92)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '4px 9px' }}>✕ remover</button>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* GERAR */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => gerar(false)} disabled={busy} title="gera 8 imagens SÓ pelo ADN do mundo (sem âncoras a prender o look) — para o mundo poder mudar e respirar" style={{ ...btn, background: busy ? '#333' : '#15233a', borderColor: '#3a5a88' }}>
          {busy ? `a gerar… (${aGerar} a sair)` : '✦ gerar 8 livre (sem âncoras)'}
        </button>
        <button onClick={() => gerar(true)} disabled={busy || anchors.length === 0} title={anchors.length === 0 ? 'ainda não tens âncoras guardadas' : 'gera 8 ancorado na tua bíblia visual (look fechado às âncoras que guardaste)'} style={{ ...btn, background: busy ? '#333' : '#1a1a1a', opacity: anchors.length === 0 ? 0.5 : 1 }}>
          gerar 8 com o teu mundo ({anchors.length})
        </button>
        {historico.length > 0 && (
          <>
            <span style={{ opacity: 0.6, fontSize: 12 }}>{historico.length} no histórico</span>
            <button onClick={limpar} disabled={busy} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #644', background: 'transparent', color: '#d99', cursor: 'pointer', fontSize: 12 }}>limpar histórico</button>
          </>
        )}
      </div>
      <p style={{ opacity: 0.6, fontSize: 12, marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
        <strong>Livre</strong> = só o ADN do mundo, sem as âncoras a puxar o look (usa isto para o mundo poder MUDAR).
        <strong> Com o teu mundo</strong> = ancorado nas fundadoras que guardaste (fecha o look). As âncoras todas iguais prendem tudo ao mesmo sítio — por isso, se «não muda nada», gera <strong>livre</strong> e só guarda ★ as que forem mesmo novas.
      </p>
      {erro && <p style={{ color: '#f88', marginTop: 12, fontSize: 13 }}>erro: {erro}</p>}
      {historico.length > 0 && (
        <p style={{ opacity: 0.6, fontSize: 12, marginTop: 16, marginBottom: 0 }}>
          Para construir o teu mundo: escolhe uma <strong>categoria</strong> em cima e carrega <strong>★ guardar</strong> nas imagens que forem mesmo o teu mundo — viram fundadoras. Nenhuma é fundadora até carregares ★.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
        {historico.map((a, i) => (
          <figure key={`${a.ts}-${i}`} style={{ margin: 0 }}>
            <img src={a.url} alt={a.categoria} loading="lazy" style={{ width: '100%', borderRadius: 10, display: 'block', aspectRatio: '9/16', objectFit: 'cover' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 4 }}>
              <figcaption style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>{a.categoria || '·'}<span style={{ opacity: 0.7 }}> · {fmt(a.ts)}</span></figcaption>
              {promovidas.has(a.url)
                ? <span style={{ flexShrink: 0, fontSize: 11, color: '#8fd98f', padding: '3px 8px' }}>✓ guardada</span>
                : <button onClick={() => promover(a.url)} disabled={busy} title={`guardar esta imagem como fundadora na categoria "${cat}" (muda a categoria em cima)`}
                    style={{ flexShrink: 0, border: '1px solid #6a5a2a', borderRadius: 8, background: '#2a2415', color: '#ffd479', cursor: 'pointer', fontSize: 11, padding: '3px 8px' }}>
                    ★ guardar em «{cat}»
                  </button>}
            </div>
          </figure>
        ))}
      </div>
    </main>
  );
}
