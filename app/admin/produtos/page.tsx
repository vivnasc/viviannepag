'use client';

import { useEffect, useState, useRef } from 'react';
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
  badge: string | null;
  destaque: boolean;
  publicado: boolean;
  ordem: number;
};

const vazio: Omit<Produto, 'id'> = {
  slug: '', titulo: '', subtitulo: '', descricao: '', preco: '',
  preco_original: null, capa: null, checkout_url: null, badge: null,
  destaque: false, publicado: false, ordem: 0,
};

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [edit, setEdit] = useState<(Produto | (Omit<Produto, 'id'> & { id?: undefined })) | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dragAtivo, setDragAtivo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function carregar() {
    const res = await fetch('/api/admin/produtos');
    if (!res.ok) return;
    const json = await res.json();
    setProdutos(json.produtos ?? []);
  }

  useEffect(() => { carregar(); }, []);

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
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">preço</label><input value={edit.preco} onChange={e => setEdit({...edit, preco: e.target.value})} className={inp} placeholder="€29" /></div>
            <div><label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">preço original (riscado)</label><input value={edit.preco_original??''} onChange={e => setEdit({...edit, preco_original: e.target.value||null})} className={inp} placeholder="€49" /></div>
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
        <div className="flex gap-3 items-center">
          <Link href="/admin" className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] lowercase no-underline">← escritos</Link>
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
              <button onClick={() => setEdit(p)} className="text-ocre text-[0.8rem] hover:text-ambar">editar</button>
              <button onClick={() => apagar(p)} className="text-rosa/60 text-[0.78rem] hover:text-rosa">apagar</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
