'use client';

import { useEffect, useMemo, useState } from 'react';
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BUCKET = 'capas';

function urlImagem(slug: string, ficheiro: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}/${ficheiro}`;
}

export default function AdminCapasPage() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [aAbrir, setAAbrir] = useState<string | null>(null);
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

  async function aplicar(slug: string, slugOrigem: string, ficheiro: string) {
    setGuardando(slug);
    setMensagem(null);
    const res = await fetch('/api/admin/definir-capa', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, slugOrigem, ficheiroOrigem: ficheiro }),
    });
    const json = await res.json();
    setGuardando(null);
    if (res.ok) {
      setMensagem(`✓ ${slug} actualizado`);
      setAAbrir(null);
      carregar();
    } else {
      setMensagem(`Erro: ${json.erro} ${json.detalhe ?? ''}`);
    }
  }

  const todasImagens = useMemo(() => {
    if (!dados) return [];
    return Object.entries(dados.ficheirosPorSlug).flatMap(([slug, files]) =>
      files.map((f) => ({ slug, ficheiro: f, url: urlImagem(slug, f) })),
    );
  }, [dados]);

  if (!dados) {
    return <div className="min-h-screen flex items-center justify-center text-creme-2/60 text-sm">a carregar…</div>;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-7 py-10">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin · capas</p>
          <h1 className="font-serif font-light text-creme text-3xl">auditoria de capas</h1>
          <p className="text-creme-2/70 text-sm mt-2">
            {dados.itens.length} escritos · {dados.duplicados.length} ficheiros usados em mais de um escrito · {todasImagens.length} imagens no storage
          </p>
        </div>
        <Link href="/admin" className="text-ocre text-sm hover:text-ambar">← admin</Link>
      </header>

      {mensagem && (
        <p className="text-ambar text-sm mb-6 font-serif italic">{mensagem}</p>
      )}

      <div className="space-y-4">
        {dados.itens.map((i) => {
          const duplicado = dados.duplicados.includes(i.ficheiro);
          const aberto = aAbrir === i.slug;
          return (
            <div
              key={i.id}
              className={`border rounded-[12px] p-4 ${duplicado ? 'border-rosa/60 bg-rosa/5' : 'border-ocre/25'}`}
            >
              <div className="flex gap-4 items-start">
                {i.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.capa} alt={i.titulo} className="w-40 h-40 object-cover rounded-[10px] flex-shrink-0" />
                ) : (
                  <div className="w-40 h-40 bg-terra/40 border border-ocre/20 rounded-[10px] flex items-center justify-center text-ocre/50 text-xs">sem capa</div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-creme text-lg leading-tight mb-1">{i.titulo}</h2>
                  <p className="text-ocre/60 text-[0.7rem] font-mono break-all mb-2">{i.slug}</p>
                  {duplicado && (
                    <p className="text-rosa text-[0.78rem] italic mb-2">⚠ a usar a mesma imagem que outro escrito</p>
                  )}
                  <button
                    onClick={() => setAAbrir(aberto ? null : i.slug)}
                    className="bg-ocre text-terra rounded-[8px] px-3 py-1.5 text-[0.8rem] lowercase hover:bg-ambar"
                  >
                    {aberto ? 'fechar galeria' : 'trocar capa'}
                  </button>
                </div>
              </div>

              {aberto && (
                <div className="mt-5 pt-5 border-t border-ocre/15">
                  <p className="text-creme-2/70 text-xs mb-3">clica numa imagem para a aplicar a este escrito</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {todasImagens.map((img) => {
                      const isAtual = i.ficheiro === img.ficheiro;
                      return (
                        <button
                          key={`${img.slug}/${img.ficheiro}`}
                          onClick={() => aplicar(i.slug, img.slug, img.ficheiro)}
                          disabled={guardando === i.slug}
                          className={`relative aspect-square rounded-[8px] overflow-hidden border-2 transition-all ${
                            isAtual ? 'border-ambar' : 'border-ocre/20 hover:border-ambar/60'
                          } disabled:opacity-40`}
                          title={`${img.slug}/${img.ficheiro}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          {isAtual && (
                            <span className="absolute top-1 right-1 bg-ambar text-terra text-[0.6rem] tracking-wider px-1.5 py-0.5 rounded">
                              actual
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {guardando === i.slug && (
                    <p className="text-ambar text-sm mt-3 italic">a aplicar…</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
