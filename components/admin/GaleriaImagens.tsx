'use client';

import { useState } from 'react';
import Link from 'next/link';

type Item = {
  id: string;
  slug: string;
  locale: string;
  titulo: string;
  tematica: string | null;
  data: string;
  capa: string | null;
};

export function GaleriaImagens({ escritos }: { escritos: Item[] }) {
  const [items, setItems] = useState<Item[]>(escritos);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState<Record<string, boolean>>({});
  const [mensagens, setMensagens] = useState<Record<string, string>>({});

  async function fazerUpload(escrito: Item, file: File) {
    setACarregar((s) => ({ ...s, [escrito.id]: true }));
    setMensagens((s) => ({ ...s, [escrito.id]: '' }));
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', escrito.slug);
    const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const upJson = await upRes.json();
    if (!upRes.ok) {
      setACarregar((s) => ({ ...s, [escrito.id]: false }));
      setMensagens((s) => ({ ...s, [escrito.id]: `Erro: ${upJson.erro}` }));
      return;
    }
    const saveRes = await fetch(`/api/admin/escritos/${escrito.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ capa: upJson.url }),
    });
    setACarregar((s) => ({ ...s, [escrito.id]: false }));
    if (saveRes.ok) {
      setItems((s) =>
        s.map((e) => (e.id === escrito.id ? { ...e, capa: upJson.url } : e))
      );
      setMensagens((s) => ({ ...s, [escrito.id]: 'Guardado.' }));
    } else {
      setMensagens((s) => ({ ...s, [escrito.id]: 'Upload ok, guardar falhou.' }));
    }
  }

  function onDrop(escrito: Item, e: React.DragEvent) {
    e.preventDefault();
    setArrastando(null);
    const file = e.dataTransfer.files?.[0];
    if (file) fazerUpload(escrito, file);
  }

  return (
    <main className="max-w-[1100px] mx-auto px-7 py-10">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · galeria</p>
          <h1 className="font-serif font-light text-creme text-3xl">imagens</h1>
          <p className="text-creme-2/70 text-sm mt-2 max-w-[640px]">
            Arrasta a imagem que geraste no Midjourney directamente para cima do escrito a que pertence. O servidor renomeia, faz upload para o Supabase Storage, e atualiza a capa do escrito automaticamente.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase no-underline"
        >
          ← voltar à lista
        </Link>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((e) => {
          const ativo = arrastando === e.id;
          const carregando = aCarregar[e.id];
          const msg = mensagens[e.id];
          return (
            <li
              key={e.id}
              onDragOver={(ev) => { ev.preventDefault(); setArrastando(e.id); }}
              onDragLeave={() => setArrastando((s) => (s === e.id ? null : s))}
              onDrop={(ev) => onDrop(e, ev)}
              className={`border rounded-[16px] p-4 transition-colors ${
                ativo ? 'border-ambar bg-terra-2/60' : 'border-ocre/25 bg-terra-2/20'
              }`}
            >
              <div className="aspect-[3/2] mb-3 rounded-[10px] overflow-hidden bg-terra/60 border border-ocre/20 flex items-center justify-center relative">
                {e.capa ? (
                  <img src={e.capa} alt={e.titulo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-creme-2/40 italic text-sm">sem capa</span>
                )}
                {carregando && (
                  <div className="absolute inset-0 bg-terra/80 flex items-center justify-center text-ambar text-sm italic font-serif">
                    a carregar…
                  </div>
                )}
              </div>
              <p className="text-[0.66rem] tracking-[0.22em] uppercase text-ocre/70 mb-1.5 flex gap-2">
                {e.tematica && <span className="text-ocre">{e.tematica}</span>}
                <span>{e.data}</span>
                <span className="opacity-50">{e.locale}</span>
              </p>
              <h3 className="font-serif font-light text-creme text-[1.02rem] leading-[1.25] mb-1">
                {e.titulo}
              </h3>
              <p className="text-creme-2/50 text-[0.72rem] break-all">{e.slug}</p>
              {msg && (
                <p className={`mt-2 text-[0.78rem] italic font-serif ${msg.startsWith('Erro') ? 'text-rosa' : 'text-ambar'}`}>
                  {msg}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
