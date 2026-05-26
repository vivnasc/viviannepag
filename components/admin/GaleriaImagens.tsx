'use client';

import { useCallback, useState } from 'react';
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
  const [bulkDrag, setBulkDrag] = useState(false);
  const [bulkProcessando, setBulkProcessando] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<string | null>(null);
  const [perSlot, setPerSlot] = useState<Record<string, boolean>>({});
  const [msgs, setMsgs] = useState<Record<string, string>>({});

  const ptItems = items.filter((e) => e.locale === 'pt');

  const atualizarCapa = useCallback(
    (slug: string, capaUrl: string) => {
      setItems((s) =>
        s.map((e) => (e.slug === slug ? { ...e, capa: capaUrl } : e))
      );
    },
    []
  );

  async function uploadEAplicar(file: File, escrito: Item) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', escrito.slug);
    const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const upJson = await upRes.json();
    if (!upRes.ok) return `${escrito.slug}: upload falhou (${upJson.erro})`;

    const capaUrl = upJson.url as string;

    const allWithSlug = items.filter((e) => e.slug === escrito.slug);
    for (const e of allWithSlug) {
      await fetch(`/api/admin/escritos/${e.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ capa: capaUrl }),
      });
    }
    atualizarCapa(escrito.slug, capaUrl);
    return null;
  }

  async function onSlotDrop(escrito: Item, e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setPerSlot((s) => ({ ...s, [escrito.id]: true }));
    setMsgs((s) => ({ ...s, [escrito.id]: '' }));
    const erro = await uploadEAplicar(file, escrito);
    setPerSlot((s) => ({ ...s, [escrito.id]: false }));
    const enCount = items.filter((x) => x.slug === escrito.slug).length;
    setMsgs((s) => ({
      ...s,
      [escrito.id]: erro ?? `Guardado (${enCount} versão/ões).`,
    }));
  }

  async function onBulkDrop(e: React.DragEvent) {
    e.preventDefault();
    setBulkDrag(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length === 0) return;
    setBulkProcessando(true);
    setBulkMsg(`Claude a identificar ${files.length} imagens…`);

    const fd = new FormData();
    for (const f of files) fd.append('files', f);

    const res = await fetch('/api/admin/match-imagens', { method: 'POST', body: fd });
    const json = await res.json();
    setBulkProcessando(false);

    if (!res.ok) {
      setBulkMsg(`Erro: ${json.erro ?? 'falhou'}${json.detalhe ? ' — ' + json.detalhe.slice(0, 200) : ''}`);
      return;
    }

    setBulkMsg(`Concluído: ${json.sucesso}/${json.total} imagens atribuídas automaticamente (PT + EN).${json.erros?.length ? ' Erros: ' + json.erros.map((e: { ficheiro: string; erro?: string }) => e.ficheiro).join(', ') : ''}`);

    setItems((s) =>
      s.map((item) => {
        const match = json.resultados?.find(
          (r: { slug: string; ok: boolean }) => r.slug === item.slug && r.ok
        );
        return match ? { ...item, capa: '(atualizada)' } : item;
      })
    );
  }

  return (
    <main className="max-w-[1100px] mx-auto px-7 py-10">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">
            admin · galeria
          </p>
          <h1 className="font-serif font-light text-creme text-3xl">imagens</h1>
        </div>
        <Link
          href="/admin"
          className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase no-underline"
        >
          ← voltar à lista
        </Link>
      </header>

      <div
        onDragOver={(ev) => {
          ev.preventDefault();
          setBulkDrag(true);
        }}
        onDragLeave={() => setBulkDrag(false)}
        onDrop={onBulkDrop}
        className={`border-2 border-dashed rounded-[18px] p-6 mb-8 text-center transition-colors ${
          bulkDrag
            ? 'border-ambar bg-ambar/5'
            : 'border-ocre/30 hover:border-ocre/50'
        }`}
      >
        {bulkProcessando ? (
          <p className="text-ambar font-serif italic">{bulkMsg}</p>
        ) : bulkMsg ? (
          <p className="text-ambar text-sm font-serif italic">{bulkMsg}</p>
        ) : (
          <div>
            <p className="text-creme font-serif text-[1.05rem] mb-2">
              Arrasta todas as imagens para aqui de uma vez
            </p>
            <p className="text-creme-2/60 text-[0.82rem]">
              Claude analisa cada imagem e atribui automaticamente ao escrito
              certo (pelo conteúdo visual). Aplica a PT + EN. Não precisas de
              renomear nem ordenar.
            </p>
          </div>
        )}
      </div>

      <p className="text-creme-2/50 text-[0.75rem] mb-6">
        Ou arrasta uma imagem para o card específico:
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ptItems.map((e) => {
          const loading = perSlot[e.id];
          const msg = msgs[e.id];
          const enVersion = items.find(
            (x) => x.slug === e.slug && x.locale === 'en'
          );
          return (
            <li
              key={e.id}
              onDragOver={(ev) => ev.preventDefault()}
              onDrop={(ev) => onSlotDrop(e, ev)}
              className="border rounded-[16px] p-4 transition-colors border-ocre/25 bg-terra-2/20 hover:border-ambar/40"
            >
              <div className="aspect-[3/2] mb-3 rounded-[10px] overflow-hidden bg-terra/60 border border-ocre/20 flex items-center justify-center relative">
                {e.capa ? (
                  <img
                    src={e.capa}
                    alt={e.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-creme-2/40 italic text-sm">
                    sem capa
                  </span>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-terra/80 flex items-center justify-center text-ambar text-sm italic font-serif">
                    a carregar…
                  </div>
                )}
              </div>
              <p className="text-[0.66rem] tracking-[0.22em] uppercase text-ocre/70 mb-1.5 flex gap-2">
                {e.tematica && (
                  <span className="text-ocre">{e.tematica}</span>
                )}
                <span>{e.data}</span>
                <span className="text-ambar/60">
                  PT{enVersion ? ' + EN' : ''}
                </span>
              </p>
              <h3 className="font-serif font-light text-creme text-[1.02rem] leading-[1.25] mb-1">
                {e.titulo}
              </h3>
              {msg && (
                <p
                  className={`mt-2 text-[0.78rem] italic font-serif ${
                    msg.startsWith('Erro') ? 'text-rosa' : 'text-ambar'
                  }`}
                >
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
