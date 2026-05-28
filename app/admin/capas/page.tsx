'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: string;
  slug: string;
  titulo: string;
  capa: string | null;
  ficheiro: string;
};

type Dados = {
  itens: Item[];
  duplicados: string[];
  ficheirosPorSlug: Record<string, string[]>;
};

export default function AdminCapasPage() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [escolhas, setEscolhas] = useState<Record<string, { slugOrigem: string; ficheiro: string }>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregar() {
    const res = await fetch('/api/admin/auditoria-capas');
    const json = await res.json();
    setDados(json);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function guardar(slug: string) {
    const e = escolhas[slug];
    if (!e) return;
    setGuardando(slug);
    setMensagem(null);
    const res = await fetch('/api/admin/definir-capa', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, slugOrigem: e.slugOrigem, ficheiroOrigem: e.ficheiro }),
    });
    const json = await res.json();
    setGuardando(null);
    if (res.ok) {
      setMensagem(`✓ ${slug} actualizado (${json.versoes} versões)`);
      carregar();
    } else {
      setMensagem(`Erro: ${json.erro} ${json.detalhe ?? ''}`);
    }
  }

  if (!dados) {
    return <div className="min-h-screen flex items-center justify-center text-creme-2/60 text-sm">a carregar…</div>;
  }

  const todosFicheiros = Object.entries(dados.ficheirosPorSlug).flatMap(([slug, files]) =>
    files.map((f) => ({ slug, file: f, label: `${slug}/${f}` })),
  );

  return (
    <main className="max-w-[1200px] mx-auto px-7 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · capas</p>
          <h1 className="font-serif font-light text-creme text-3xl">auditoria de capas</h1>
          <p className="text-creme-2/70 text-sm mt-2">
            {dados.itens.length} escritos · {dados.duplicados.length} ficheiros usados em mais de um escrito
          </p>
        </div>
        <Link href="/admin" className="text-ocre text-sm hover:text-ambar">← admin</Link>
      </header>

      {mensagem && (
        <p className="text-ambar text-sm mb-6 font-serif italic">{mensagem}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dados.itens.map((i) => {
          const duplicado = dados.duplicados.includes(i.ficheiro);
          const escolha = escolhas[i.slug];
          return (
            <div
              key={i.id}
              className={`border rounded-[12px] p-4 ${duplicado ? 'border-rosa/60 bg-rosa/5' : 'border-ocre/25'}`}
            >
              <div className="flex gap-4">
                {i.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.capa} alt={i.titulo} className="w-32 h-32 object-cover rounded-[8px] flex-shrink-0" />
                ) : (
                  <div className="w-32 h-32 bg-terra/40 border border-ocre/20 rounded-[8px] flex items-center justify-center text-ocre/50 text-xs">sem capa</div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-creme text-base leading-tight mb-1">{i.titulo}</h2>
                  <p className="text-ocre/60 text-[0.7rem] font-mono break-all">{i.ficheiro || '—'}</p>
                  {duplicado && (
                    <p className="text-rosa text-[0.72rem] mt-1 italic">⚠ ficheiro repetido</p>
                  )}
                  <div className="mt-3 flex flex-col gap-2">
                    <select
                      value={escolha ? `${escolha.slugOrigem}/${escolha.ficheiro}` : ''}
                      onChange={(ev) => {
                        const v = ev.target.value;
                        if (!v) return;
                        const [s, ...rest] = v.split('/');
                        setEscolhas((prev) => ({ ...prev, [i.slug]: { slugOrigem: s, ficheiro: rest.join('/') } }));
                      }}
                      className="bg-terra border border-ocre/35 text-creme text-[0.78rem] rounded-[8px] px-2 py-1.5 max-w-full"
                    >
                      <option value="">— escolher ficheiro —</option>
                      <optgroup label={`do próprio (${i.slug})`}>
                        {(dados.ficheirosPorSlug[i.slug] ?? []).map((f) => (
                          <option key={`own-${f}`} value={`${i.slug}/${f}`}>{f}</option>
                        ))}
                      </optgroup>
                      <optgroup label="de outros escritos">
                        {todosFicheiros
                          .filter((tf) => tf.slug !== i.slug)
                          .map((tf) => (
                            <option key={`other-${tf.label}`} value={tf.label}>{tf.label}</option>
                          ))}
                      </optgroup>
                    </select>
                    <button
                      onClick={() => guardar(i.slug)}
                      disabled={!escolha || guardando === i.slug}
                      className="bg-ocre text-terra rounded-[8px] px-3 py-1.5 text-[0.78rem] lowercase hover:bg-ambar disabled:opacity-40"
                    >
                      {guardando === i.slug ? 'a guardar…' : 'aplicar capa'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
