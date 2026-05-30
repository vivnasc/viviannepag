'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

type Produto = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  preco: string;
  preco_original: string | null;
  capa: string | null;
  checkout_url: string | null;
  ficheiro_path: string | null;
  badge: string | null;
  destaque: boolean;
  publicado: boolean;
  ordem: number;
};

const vazio: Omit<Produto, 'id'> = {
  slug: '', titulo: '', subtitulo: '', descricao: '', preco: '',
  preco_original: null, capa: null, checkout_url: null, ficheiro_path: null, badge: null,
  destaque: false, publicado: false, ordem: 0,
};

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [edit, setEdit] = useState<(Produto | (Omit<Produto, 'id'> & { id?: undefined })) | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ultimoPdf, setUltimoPdf] = useState<{ slug: string; url: string; ts: number } | null>(null);
  const [pdfs, setPdfs] = useState<Record<string, { url: string; updatedAt?: string }>>({});
  const [polling, setPolling] = useState(false);
  const [dragAtivo, setDragAtivo] = useState(false);
  const [legendaModal, setLegendaModal] = useState<Produto | null>(null);
  const [legendas, setLegendas] = useState<{ig: string; fb: string; tw: string; hashtags: string} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const HASHTAGS_VIVIANNE = '#viviannedossantos #autoconhecimento #constelacaofamiliar #psicologiatranspessoal #maternidadeconsciente #desenvolvimentopessoal #curacaoemocional #mulheresqueinspiram #crescimentopessoal #despertaremocional #terapiaholisticaonline #ebookdigital #vidacomproposito #saudementalimporta #lealdadesinvisiveis';
  const HASHTAGS_FREEME = '#freeme #culpadamae #maternidade #limites #constelacaofamiliar #maesreais';
  const HASHTAGS_INFONTE = '#infonte #substituicao #sonhosherdados #clareza #proposito #exaustaosemchegada';
  const HASHTAGS_SYNCHIM = '#synchim #relacaodecasal #casal #amor #constelacaofamiliar #nodocasal';
  const HASHTAGS_ESCOLA = '#escoladosveus #identidade #sentido #transpessoal #autoconhecimentoprofundo';

  function gerarLegendas(p: Produto) {
    const url = `https://viviannedossantos.com/loja/${p.slug}`;
    const isEbook = p.badge?.toLowerCase().includes('ebook');
    const tipo = isEbook ? 'ebook' : 'guia';
    const isInfonte = p.slug.includes('sonho') || p.slug.includes('voz') || p.slug.includes('mente') || p.slug.includes('teu');
    const isSynchim = p.slug.includes('casal') || p.slug.includes('perguntas');
    const isEscola = p.slug.includes('quemes') || p.slug.includes('sentido') || p.slug.includes('escuro') || p.slug.includes('presenca');

    let tags = HASHTAGS_VIVIANNE;
    if (isInfonte) tags = HASHTAGS_INFONTE + ' ' + HASHTAGS_VIVIANNE;
    else if (isSynchim) tags = HASHTAGS_SYNCHIM + ' ' + HASHTAGS_VIVIANNE;
    else if (isEscola) tags = HASHTAGS_ESCOLA + ' ' + HASHTAGS_VIVIANNE;
    else tags = HASHTAGS_FREEME + ' ' + HASHTAGS_VIVIANNE;

    const ig = `${p.subtitulo}\n\nNovo ${tipo}: "${p.titulo}"\nPor Vivianne dos Santos\n\nLink na bio ou em viviannedossantos.com/loja\n\n.\n.\n.\n${tags}`;
    const fb = `"${p.titulo}"\n${p.subtitulo}\n\nNovo ${tipo} de Vivianne dos Santos.\n\n${url}`;
    const tw = `"${p.titulo}" — ${p.subtitulo}\n\n${url}\n\n${isInfonte ? '#infonte' : '#freeme'} #autoconhecimento #ebook`;

    setLegendas({ ig, fb, tw, hashtags: tags });
    setLegendaModal(p);
  }

  async function copiarTexto(texto: string) {
    await navigator.clipboard.writeText(texto);
    setMsg('Copiado!');
    setTimeout(() => setMsg(null), 1500);
  }

  async function carregar() {
    const res = await fetch('/api/admin/produtos');
    if (!res.ok) return;
    const json = await res.json();
    setProdutos(json.produtos ?? []);
  }

  async function carregarPdfs() {
    try {
      const res = await fetch(`/api/admin/produtos/pdfs-list?_=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      setPdfs(json.pdfs ?? {});
    } catch {}
  }

  useEffect(() => { carregar(); carregarPdfs(); }, []);

  // Apos disparar um render, re-fetch PDFs a cada 20s ate 10min
  useEffect(() => {
    if (!polling) return;
    const start = Date.now();
    const id = setInterval(() => {
      if (Date.now() - start > 10 * 60 * 1000) {
        setPolling(false);
        clearInterval(id);
        return;
      }
      carregarPdfs();
    }, 20_000);
    return () => clearInterval(id);
  }, [polling]);

  async function salvar() {
    if (!edit || !edit.slug || !edit.titulo) { setMsg('Slug e título obrigatórios'); return; }
    setSalvando(true); setMsg(null);
    const url = edit.id ? `/api/admin/produtos/${edit.id}` : '/api/admin/produtos';
    const method = edit.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(edit) });
    setSalvando(false);
    if (res.ok) { setEdit(null); carregar(); setMsg('Guardado.'); }
    else { const j = await res.json(); setMsg(`Erro: ${j.erro}`); }
  }

  async function apagar(p: Produto) {
    if (!confirm(`Apagar "${p.titulo}"?`)) return;
    await fetch(`/api/admin/produtos/${p.id}`, { method: 'DELETE' });
    carregar();
  }

  async function uploadCapa(file: File) {
    if (!edit) return;
    const fd = new FormData(); fd.append('file', file); fd.append('slug', edit.slug || 'produto');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (res.ok) setEdit({ ...edit, capa: json.url });
    else setMsg(`Upload: ${json.erro}`);
  }

  const inp = 'w-full bg-transparent border border-ocre/40 rounded-[12px] py-2.5 px-3.5 text-creme font-sans text-base outline-none placeholder:text-creme/30 focus:border-ambar transition-colors';

  if (edit) {
    return (
      <main className="max-w-[780px] mx-auto px-7 py-10">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setEdit(null)} className="text-ocre/80 text-[0.82rem] hover:text-ambar">← voltar</button>
          <div className="flex gap-2 items-center">
            {msg && <span className="text-ambar text-sm italic mr-2">{msg}</span>}
            <button onClick={salvar} disabled={salvando} className="bg-ocre text-terra rounded-[12px] px-5 py-2 text-[0.85rem] hover:bg-ambar disabled:opacity-70">
              {salvando ? 'a guardar…' : 'guardar'}
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">título</label><input value={edit.titulo} onChange={e => setEdit({...edit, titulo: e.target.value})} className={inp} /></div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">slug</label><input value={edit.slug} onChange={e => setEdit({...edit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')})} className={inp} /></div>
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">badge</label><input value={edit.badge??''} onChange={e => setEdit({...edit, badge: e.target.value||null})} className={inp} placeholder="ex: novo, -30%" /></div>
          </div>
          <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">subtítulo</label><input value={edit.subtitulo} onChange={e => setEdit({...edit, subtitulo: e.target.value})} className={inp} /></div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">preço</label><input value={edit.preco} onChange={e => setEdit({...edit, preco: e.target.value})} className={inp} placeholder="€7" /></div>
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">preço original (riscado)</label><input value={edit.preco_original??''} onChange={e => setEdit({...edit, preco_original: e.target.value||null})} className={inp} placeholder="€29" /></div>
          </div>
          <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">URL de checkout</label><input value={edit.checkout_url??''} onChange={e => setEdit({...edit, checkout_url: e.target.value||null})} className={inp} placeholder="https://hotmart.com/..." /></div>
          <div>
            <label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">capa</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragAtivo(true); }}
              onDragLeave={() => setDragAtivo(false)}
              onDrop={e => { e.preventDefault(); setDragAtivo(false); const f = e.dataTransfer.files?.[0]; if (f) uploadCapa(f); }}
              onClick={() => fileRef.current?.click()}
              className={`border border-dashed rounded-[14px] p-4 cursor-pointer transition-colors ${dragAtivo ? 'border-ambar bg-terra-2/50' : 'border-ocre/40'}`}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCapa(f); }} className="hidden" />
              {edit.capa ? (
                <div className="flex items-center gap-4">
                  <img src={edit.capa} alt="" className="w-24 h-32 object-cover rounded-md border border-ocre/30" />
                  <div className="flex-1"><p className="text-creme-2 text-sm break-all">{edit.capa}</p><button onClick={e => { e.stopPropagation(); setEdit({...edit, capa: null}); }} className="text-rosa/70 text-xs mt-2 hover:text-rosa">remover</button></div>
                </div>
              ) : <p className="text-creme-2/60 italic text-sm text-center">arrasta a capa do produto</p>}
            </div>
          </div>
          <div>
            <label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">ficheiro do produto (PDF, ebook)</label>
            <div className="flex gap-3 items-center">
              <input value={edit.ficheiro_path??''} onChange={e => setEdit({...edit, ficheiro_path: e.target.value||null})} className={`${inp} flex-1`} placeholder="path no Supabase Storage (ex: produtos/guia-do-no.pdf)" />
              <input type="file" accept=".pdf,.epub,.zip" onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                const fd = new FormData(); fd.append('file', f); fd.append('slug', edit.slug||'produto');
                const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                const json = await res.json();
                if (res.ok) { setEdit({...edit, ficheiro_path: json.path}); setMsg('Ficheiro carregado.'); }
                else setMsg(`Upload: ${json.erro}`);
              }} className="text-creme-2 text-sm" />
            </div>
            {edit.ficheiro_path && <p className="text-ambar/70 text-xs mt-1">Path: {edit.ficheiro_path}</p>}
          </div>
          <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">descrição (markdown)</label><textarea value={edit.descricao} onChange={e => setEdit({...edit, descricao: e.target.value})} rows={14} className={`${inp} font-mono text-[0.92rem]`} /></div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">ordem</label><input type="number" value={edit.ordem} onChange={e => setEdit({...edit, ordem: Number(e.target.value)})} className={inp} /></div>
            <div className="flex gap-6 items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={edit.publicado} onChange={e => setEdit({...edit, publicado: e.target.checked})} className="w-4 h-4 accent-ambar" /><span className="text-creme-2 text-sm">publicado</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={edit.destaque} onChange={e => setEdit({...edit, destaque: e.target.checked})} className="w-4 h-4 accent-ambar" /><span className="text-creme-2 text-sm">destaque</span></label>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
          <h1 className="font-serif font-light text-creme text-3xl">produtos</h1>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          {polling && (
            <span className="text-[0.7rem] text-ambar/80 px-2 py-1 rounded-[6px] border border-ambar/30 bg-ambar/5">
              ⟳ a verificar PDFs
            </span>
          )}
          <button
            onClick={carregarPdfs}
            className="text-creme-2/70 text-[0.78rem] hover:text-ambar border border-ocre/30 rounded-[10px] px-3 py-2"
            title={`${Object.keys(pdfs).length} PDFs em Supabase`}
          >
            ↻ PDFs ({Object.keys(pdfs).length})
          </button>
          <Link href="/admin" className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] lowercase no-underline">← escritos</Link>
          <button
            onClick={async () => {
              const total = produtos.filter(x => x.slug?.startsWith('ebook-') || x.slug?.startsWith('guia-')).length;
              if (!confirm(`Renderizar TODOS os ${total} PDFs editoriais? Auto-deteta mundo por slug. ~30-45min no GitHub Actions, mas resume seguro (re-runs skipam o que ja existe).`)) return;
              setMsg('A disparar bulk render editorial...');
              const r = await fetch('/api/admin/produtos/render-ebook-dispatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: 'ALL', mundo: 'auto' }),
              });
              const j = await r.json();
              if (r.ok) {
                setPolling(true);
                setMsg(`Bulk disparado (${total} PDFs). 'ver PDF' aparece em cada card a medida que ficam prontos.`);
              } else {
                setMsg(`Erro: ${j.erro}`);
              }
            }}
            className="bg-ouro text-terra-2 rounded-[12px] px-4 py-2 text-[0.8rem] font-medium hover:bg-ambar"
            title="Auto-deteta mundo por slug, 1 GH Action processa todos"
          >
            📚 render TODOS
          </button>
          <button onClick={async () => { setSalvando(true); setMsg('A popular 15 produtos...'); const r = await fetch('/api/admin/seed-produtos', { method: 'POST' }); const j = await r.json(); setSalvando(false); setMsg(r.ok ? `${j.total} produtos populados.` : `Erro: ${j.erro}`); carregar(); }} disabled={salvando} className="bg-bordeaux/80 text-creme rounded-[12px] px-4 py-2 text-[0.8rem] lowercase hover:bg-bordeaux disabled:opacity-70">seed 15 produtos</button>
          <button onClick={() => setEdit({ ...vazio })} className="bg-ocre text-terra rounded-[12px] px-4 py-2 text-[0.8rem] lowercase hover:bg-ambar">+ novo produto</button>
        </div>
      </header>
      {msg && <p className="text-ambar text-sm mb-6 italic font-serif">{msg}</p>}
      {produtos.length === 0 ? (
        <p className="text-creme-2/70 italic font-serif">Sem produtos. Cria o primeiro.</p>
      ) : (
        <div className="grid gap-4">
          {produtos.map(p => (
            <div key={p.id} className="flex items-center gap-5 border border-ocre/15 rounded-[14px] p-4 hover:bg-terra-2/40 transition-colors">
              {p.capa ? <img src={p.capa} alt="" className="w-16 h-20 object-cover rounded-md border border-ocre/25 shrink-0" /> : <div className="w-16 h-20 rounded-md bg-terra-2/60 shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-creme text-[1.05rem]">{p.titulo}</h3>
                <p className="text-creme-2/60 text-[0.78rem]">{p.slug} · {p.preco} · {p.publicado ? 'publicado' : 'rascunho'}</p>
              </div>
              <button onClick={() => gerarLegendas(p)} className="text-salvia text-[0.78rem] hover:text-ambar">legendas</button>
              {pdfs[p.slug] && (
                <a
                  href={`${pdfs[p.slug].url}?t=${Date.now()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ouro text-[0.78rem] hover:underline no-underline"
                  title={`Actualizado ${pdfs[p.slug].updatedAt ? new Date(pdfs[p.slug].updatedAt!).toLocaleString('pt-PT') : ''}`}
                >
                  ver PDF
                </a>
              )}
              {(p.slug?.startsWith('ebook-') || p.slug?.startsWith('guia-')) && (
                <button
                  onClick={async () => {
                    const mundo = prompt(`Mundo das imagens MJ para "${p.titulo}"?\n(freeme | infonte | synchim | escola | autora)`, 'freeme');
                    if (!mundo) return;
                    setMsg('A disparar render editorial...');
                    const r = await fetch('/api/admin/produtos/render-ebook-dispatch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ slug: p.slug, mundo }),
                    });
                    const j = await r.json();
                    if (r.ok) {
                      setUltimoPdf({ slug: p.slug, url: j.pdfUrl, ts: Date.now() });
                      setPolling(true);
                      setMsg(`Render disparado para ${p.slug}. PDF pronto em ~3min. Link 'ver PDF' aparece sozinho.`);
                    } else {
                      setMsg(`Erro: ${j.erro}`);
                    }
                  }}
                  className="text-ambar text-[0.78rem] hover:text-ouro"
                  title="Gera PDF editorial com imagens MJ"
                >
                  📖 PDF editorial
                </button>
              )}
              <button onClick={() => { const u = `https://viviannedossantos.com/loja/${p.slug}`; navigator.clipboard.writeText(u); setMsg('Link copiado!'); setTimeout(() => setMsg(null), 1500); }} className="text-creme-2/60 text-[0.78rem] hover:text-ambar">link</button>
              <button onClick={() => setEdit(p)} className="text-ocre text-[0.8rem] hover:text-ambar">editar</button>
              <button onClick={() => apagar(p)} className="text-rosa/60 text-[0.78rem] hover:text-rosa">apagar</button>
            </div>
          ))}
        </div>
      )}
      {legendaModal && legendas && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setLegendaModal(null)}>
          <div className="bg-terra rounded-[18px] border border-ocre/30 max-w-[700px] w-full max-h-[90vh] overflow-y-auto p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[0.7rem] tracking-[0.18em] uppercase text-ocre/80 mb-1">legendas social</p>
                <h3 className="font-serif text-creme text-xl">{legendaModal.titulo}</h3>
              </div>
              <button onClick={() => setLegendaModal(null)} className="text-creme-2/60 hover:text-creme text-xl">×</button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.72rem] tracking-[0.14em] uppercase text-rosa font-medium">Instagram</p>
                  <button onClick={() => copiarTexto(legendas.ig)} className="text-ocre text-[0.75rem] hover:text-ambar">copiar</button>
                </div>
                <pre className="bg-terra-2/60 rounded-[12px] p-4 text-creme-2/90 text-[0.82rem] leading-[1.6] whitespace-pre-wrap font-sans overflow-x-auto">{legendas.ig}</pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.72rem] tracking-[0.14em] uppercase text-ocre font-medium">Facebook</p>
                  <button onClick={() => copiarTexto(legendas.fb)} className="text-ocre text-[0.75rem] hover:text-ambar">copiar</button>
                </div>
                <pre className="bg-terra-2/60 rounded-[12px] p-4 text-creme-2/90 text-[0.82rem] leading-[1.6] whitespace-pre-wrap font-sans overflow-x-auto">{legendas.fb}</pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.72rem] tracking-[0.14em] uppercase text-creme-2/80 font-medium">X / Twitter</p>
                  <button onClick={() => copiarTexto(legendas.tw)} className="text-ocre text-[0.75rem] hover:text-ambar">copiar</button>
                </div>
                <pre className="bg-terra-2/60 rounded-[12px] p-4 text-creme-2/90 text-[0.82rem] leading-[1.6] whitespace-pre-wrap font-sans overflow-x-auto">{legendas.tw}</pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[0.72rem] tracking-[0.14em] uppercase text-ambar font-medium">Hashtags</p>
                  <button onClick={() => copiarTexto(legendas.hashtags)} className="text-ocre text-[0.75rem] hover:text-ambar">copiar</button>
                </div>
                <pre className="bg-terra-2/60 rounded-[12px] p-4 text-ambar/80 text-[0.78rem] leading-[1.8] whitespace-pre-wrap font-sans overflow-x-auto">{legendas.hashtags}</pre>
              </div>

              <div className="flex gap-3 pt-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(legendas.fb)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-[12px] border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar no-underline">WhatsApp</a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(legendas.tw)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-[12px] border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar no-underline">X</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://viviannedossantos.com/loja/${legendaModal.slug}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 rounded-[12px] border border-ocre/30 text-creme-2 text-[0.8rem] hover:border-ambar no-underline">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
