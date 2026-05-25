'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EscritoMeta, Locale } from '@/lib/escritos-shared';
import { formatarData } from '@/lib/escritos-shared';

type Trad = {
  todosTitulo: string;
  todosSub: string;
  eyebrow: string;
  vazio: string;
  tematicas: Record<string, string>;
};

const TEMATICAS_ORDEM = ['o-no', 'presenca', 'veu'];

function CardEscrito({
  e,
  locale,
  tematicas,
  destaque,
}: {
  e: EscritoMeta;
  locale: string;
  tematicas: Record<string, string>;
  destaque?: boolean;
}) {
  const href = locale === 'en' ? `/en/escritos/${e.slug}` : `/escritos/${e.slug}`;
  const label = e.tematica ? tematicas[e.tematica] : null;

  if (destaque) {
    return (
      <Link href={href} className="block group no-underline mb-10">
        <div className="relative overflow-hidden rounded-[20px] border border-ocre/25">
          {e.capa && (
            <Image
              src={e.capa}
              alt={e.titulo}
              width={1600}
              height={1067}
              priority
              unoptimized={e.capa.endsWith('.svg')}
              className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-terra/95 via-terra/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-10">
            {label && (
              <p className="text-[0.68rem] tracking-[0.32em] uppercase text-ambar mb-3">
                · {label} ·
              </p>
            )}
            <h2 className="font-serif font-light text-creme text-[clamp(1.8rem,5vw,2.8rem)] leading-[1.1] mb-3 group-hover:text-ambar transition-colors">
              {e.titulo}
            </h2>
            <p className="font-serif italic text-creme-2/90 text-[clamp(0.95rem,2.5vw,1.12rem)] leading-[1.5] max-w-[540px]">
              {e.resumo}
            </p>
            <p className="text-[0.7rem] tracking-[0.2em] uppercase text-ocre/70 mt-4">
              {formatarData(e.data, locale as Locale)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="block group no-underline">
      <div className="overflow-hidden rounded-[16px] border border-ocre/20 transition-colors group-hover:border-ambar/40">
        {e.capa && (
          <Image
            src={e.capa}
            alt={e.titulo}
            width={800}
            height={533}
            unoptimized={e.capa.endsWith('.svg')}
            className="w-full aspect-[3/2] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-[0.64rem] tracking-[0.18em] uppercase text-ocre/60">
              {formatarData(e.data, locale as Locale)}
            </span>
          </div>
          <h3 className="font-serif font-light text-creme text-[clamp(1.2rem,3vw,1.45rem)] leading-[1.2] mb-2 group-hover:text-ambar transition-colors">
            {e.titulo}
          </h3>
          <p className="text-creme-2/80 text-[0.9rem] leading-[1.55] line-clamp-2">
            {e.resumo}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function EscritosIndex({
  escritos,
  locale,
  trad,
}: {
  escritos: EscritoMeta[];
  locale: string;
  trad: Trad;
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  const porTematica: Record<string, EscritoMeta[]> = {};
  for (const e of escritos) {
    const t = e.tematica ?? 'outros';
    if (!porTematica[t]) porTematica[t] = [];
    porTematica[t].push(e);
  }

  const tematicasOrdenadas = TEMATICAS_ORDEM.filter((t) => porTematica[t]);
  if (porTematica['outros']) tematicasOrdenadas.push('outros');

  const [destaque] = escritos;

  return (
    <>
      {destaque && (
        <CardEscrito e={destaque} locale={locale} tematicas={trad.tematicas} destaque />
      )}

      <nav className="mb-12">
        <div className="flex flex-wrap justify-center gap-3 mb-2">
          {tematicasOrdenadas.map((t) => {
            const label = trad.tematicas[t] ?? t;
            const count = porTematica[t]?.length ?? 0;
            const isAberto = aberto === t;
            return (
              <button
                key={t}
                onClick={() => setAberto(isAberto ? null : t)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[0.8rem] tracking-[0.08em] transition-colors ${
                  isAberto
                    ? 'border-ambar text-ambar bg-ambar/10'
                    : 'border-ocre/35 text-creme-2 hover:border-ambar hover:text-ambar'
                }`}
              >
                <span className="font-serif italic">{label}</span>
                <span className="text-[0.68rem] text-ocre/70">{count}</span>
              </button>
            );
          })}
          {aberto && (
            <button
              onClick={() => setAberto(null)}
              className="px-4 py-2.5 text-[0.75rem] text-creme-2/60 hover:text-creme transition-colors"
            >
              ver todos
            </button>
          )}
        </div>
      </nav>

      {(() => {
        const lista = aberto ? (porTematica[aberto] ?? []) : escritos.slice(1);
        if (lista.length === 0) return null;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {lista.map((e) => (
              <CardEscrito key={e.slug} e={e} locale={locale} tematicas={trad.tematicas} />
            ))}
          </div>
        );
      })()}
    </>
  );
}
