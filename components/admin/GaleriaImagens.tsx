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

  function matchPorNome(fileName: string, escritos: Item[]): Item | null {
    const words = fileName
      .toLowerCase()
      .replace(/[_\-\.]/g, ' ')
      .replace(/\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    let best: Item | null = null;
    let bestScore = 0;

    for (const e of escritos) {
      const target = `${e.titulo} ${e.slug} ${e.tematica ?? ''}`.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (target.includes(w)) score += w.length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }

    return bestScore >= 4 ? best : null;
  }

  async function onBulkDrop(e: React.DragEvent) {
    e.preventDefault();
    setBulkDrag(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length === 0) return;
    setBulkProcessando(true);

    const disponiveis = [...ptItems];
    const detalhes: string[] = [];
    let ok = 0;
    let noMatch = 0;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setBulkMsg(`${i + 1}/${files.length}: ${f.name}...`);

      const matched = matchPorNome(f.name, disponiveis);
      if (!matched) {
        noMatch++;
        detalhes.push(`? ${f.name} → sem match (arrasta manualmente para o card)`);
        continue;
      }

      const idx = disponiveis.findIndex((x) => x.id === matched.id);
      if (idx >= 0) disponiveis.splice(idx, 1);

      const fd = new FormData();
      fd.append('file', f);
      fd.append('slug', matched.slug);

      try {
        const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (upRes.ok) {
          const upJson = await upRes.json();
          const allVersions = items.filter((x) => x.slug === matched.slug);
          for (const v of allVersions) {
            await fetch(`/api/admin/escritos/${v.id}`, {
              method: 'PUT',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ capa: upJson.url }),
            });
          }
          ok++;
          detalhes.push(`✓ ${f.name} → ${matched.slug}`);
        } else {
          detalhes.push(`✗ ${f.name} → upload falhou`);
        }
      } catch {
        detalhes.push(`✗ ${f.name} → erro de rede`);
      }

      setBulkMsg(`${ok}/${files.length} atribuídas\n\n${detalhes.join('\n')}`);
    }

    setBulkProcessando(false);
    if (noMatch > 0) {
      setBulkMsg(`${ok} atribuídas, ${noMatch} sem match automático.\nOs sem match: arrasta para o card certo abaixo.\n\n${detalhes.join('\n')}`);
    } else {
      setBulkMsg(`CONCLUÍDO: ${ok}/${files.length} atribuídas.\n\n${detalhes.join('\n')}\n\nA recarregar...`);
      setTimeout(() => window.location.reload(), 2000);
    }
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
          <pre className="text-ambar font-sans text-sm whitespace-pre-wrap text-left">{bulkMsg}</pre>
        ) : bulkMsg ? (
          <pre className="text-ambar font-sans text-sm whitespace-pre-wrap text-left">{bulkMsg}</pre>
        ) : (
          <div>
            <p className="text-creme font-serif text-[1.05rem] mb-2">
              Arrasta tudo para aqui (imagens, vídeos, o que tiveres)
            </p>
            <p className="text-creme-2/60 text-[0.82rem]">
              Match automático pelo nome do ficheiro. Sem API, sem espera.
              Os que não encontrar match, arrastas para o card abaixo.
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
