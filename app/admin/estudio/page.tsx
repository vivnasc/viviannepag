'use client';

import { useState } from 'react';
import {
  CALENDARIO_30_DIAS,
  PALETAS,
  TIPO_LABELS,
  type ConteudoDia,
  type Slide,
  type Mundo,
} from '@/lib/estudio-conteudo';

function PhoneFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 320, maxWidth: '100%' }}>
      <div
        className="rounded-[36px] border-[3px] border-creme-2/20 overflow-hidden"
        style={{ aspectRatio: '9/16', background: '#111' }}
      >
        {children}
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-[5px] rounded-full bg-creme-2/15" />
    </div>
  );
}

function SlidePreview({ slide, mundo, index, total }: { slide: Slide; mundo: Mundo; index: number; total: number }) {
  const p = PALETAS[mundo];
  const isCapa = slide.tipo === 'capa';
  const isCitacao = slide.tipo === 'citacao';
  const isCta = slide.tipo === 'cta';

  const bgStyle = isCapa
    ? { background: `linear-gradient(160deg, ${p.bg}, ${p.bg2})` }
    : isCitacao
    ? { background: `linear-gradient(160deg, ${p.bg2}, ${p.bg})` }
    : isCta
    ? { background: `linear-gradient(160deg, ${p.bg}, ${p.destaque}22)` }
    : { background: p.bg2 };

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center px-8 py-12 text-center relative"
      style={bgStyle}
    >
      {isCapa && (
        <>
          <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-6" style={{ color: p.destaque, opacity: 0.7 }}>
            vivianne dos santos
          </p>
          <h2
            className="font-serif font-light text-[1.45rem] leading-[1.15] mb-6 whitespace-pre-line"
            style={{ color: p.texto }}
          >
            {slide.destaque
              ? slide.texto.split(slide.destaque).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <em style={{ color: p.destaque }}>{slide.destaque}</em>}
                  </span>
                ))
              : slide.texto}
          </h2>
          <div className="w-10 h-px mt-2" style={{ background: p.destaque, opacity: 0.4 }} />
        </>
      )}

      {slide.tipo === 'conteudo' && (
        <>
          {slide.titulo && (
            <p
              className="text-[0.65rem] tracking-[0.25em] uppercase mb-5 self-start text-left w-full"
              style={{ color: p.destaque, opacity: 0.8 }}
            >
              {slide.titulo}
            </p>
          )}
          <p
            className="font-serif text-[0.95rem] leading-[1.55] whitespace-pre-line text-left w-full"
            style={{ color: p.texto, opacity: 0.92 }}
          >
            {slide.texto}
          </p>
        </>
      )}

      {isCitacao && (
        <>
          <div className="text-4xl mb-4" style={{ color: p.destaque, opacity: 0.3 }}>"</div>
          <p
            className="font-serif italic text-[1.1rem] leading-[1.45] whitespace-pre-line mb-6"
            style={{ color: p.texto }}
          >
            {slide.texto.replace(/^"|"$/g, '')}
          </p>
          {slide.destaque && (
            <p className="text-[0.65rem] tracking-[0.15em]" style={{ color: p.destaque, opacity: 0.6 }}>
              {slide.destaque}
            </p>
          )}
        </>
      )}

      {isCta && (
        <>
          <div className="w-8 h-8 rounded-full mb-6 flex items-center justify-center" style={{ background: p.destaque + '22' }}>
            <span className="text-sm" style={{ color: p.destaque }}>↗</span>
          </div>
          <p
            className="font-serif text-[0.92rem] leading-[1.55] whitespace-pre-line mb-6"
            style={{ color: p.texto }}
          >
            {slide.texto}
          </p>
          {slide.destaque && (
            <p
              className="text-[0.72rem] tracking-[0.12em] mt-2 px-4 py-2 rounded-full"
              style={{ background: p.destaque + '20', color: p.destaque }}
            >
              {slide.destaque}
            </p>
          )}
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-colors"
            style={{ background: i === index ? p.destaque : p.texto + '30' }}
          />
        ))}
      </div>
    </div>
  );
}

function ReelPreview({ conteudo }: { conteudo: ConteudoDia }) {
  const p = PALETAS[conteudo.mundo];
  const script = conteudo.reelScript!;

  return (
    <div
      className="w-full h-full flex flex-col justify-end px-6 py-8 relative"
      style={{ background: `linear-gradient(180deg, ${p.bg2}44, ${p.bg2})` }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${p.bg}, transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-medium" style={{ background: p.destaque + '30', color: p.destaque }}>
            V
          </div>
          <div>
            <p className="text-[0.7rem] font-medium" style={{ color: p.texto }}>vivianne.dos.santos</p>
            <p className="text-[0.55rem]" style={{ color: p.texto + '80' }}>Reel · {script.duracao}</p>
          </div>
        </div>

        <p className="font-serif text-[0.85rem] leading-[1.5] mb-3" style={{ color: p.texto }}>
          <span style={{ color: p.destaque }}>Gancho: </span>
          {script.gancho}
        </p>

        <div className="border-l-2 pl-3 mb-3" style={{ borderColor: p.destaque + '40' }}>
          {script.corpo.map((linha, i) => (
            <p key={i} className="text-[0.75rem] leading-[1.5] mb-1.5" style={{ color: p.texto + 'cc' }}>
              {linha}
            </p>
          ))}
        </div>

        <p className="text-[0.75rem] font-medium mb-2" style={{ color: p.destaque }}>
          CTA: {script.cta}
        </p>

        {script.musica && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[0.6rem]">♪</span>
            <p className="text-[0.6rem]" style={{ color: p.texto + '60' }}>{script.musica}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CarrosselNavigavel({ conteudo }: { conteudo: ConteudoDia }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const slides = conteudo.slides ?? [];
  const total = slides.length;

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame>
        <SlidePreview
          slide={slides[slideAtual]}
          mundo={conteudo.mundo}
          index={slideAtual}
          total={total}
        />
      </PhoneFrame>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSlideAtual(Math.max(0, slideAtual - 1))}
          disabled={slideAtual === 0}
          className="w-8 h-8 rounded-full border border-ocre/30 text-creme-2/80 text-sm hover:border-ambar hover:text-ambar disabled:opacity-30 transition-colors"
        >
          ←
        </button>
        <span className="text-[0.72rem] text-creme-2/60 tracking-[0.1em]">
          {slideAtual + 1} / {total}
        </span>
        <button
          onClick={() => setSlideAtual(Math.min(total - 1, slideAtual + 1))}
          disabled={slideAtual === total - 1}
          className="w-8 h-8 rounded-full border border-ocre/30 text-creme-2/80 text-sm hover:border-ambar hover:text-ambar disabled:opacity-30 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

function DetalheConteudo({ conteudo, onFechar }: { conteudo: ConteudoDia; onFechar: () => void }) {
  const p = PALETAS[conteudo.mundo];
  const tipo = TIPO_LABELS[conteudo.tipo];
  const temSlides = conteudo.slides && conteudo.slides.length > 0;
  const temReel = conteudo.reelScript;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-[1000px] rounded-[20px] border border-ocre/20 overflow-hidden" style={{ background: '#1a1410' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ocre/15">
          <div className="flex items-center gap-3">
            <span className="text-lg">{tipo.emoji}</span>
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase" style={{ color: tipo.cor }}>
                {tipo.label} · Dia {conteudo.dia}
              </p>
              <h2 className="font-serif font-light text-creme text-lg">{conteudo.titulo}</h2>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-full border border-ocre/30 text-creme-2/70 text-sm hover:border-ambar hover:text-ambar transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <div>
            {temSlides && <CarrosselNavigavel conteudo={conteudo} />}
            {temReel && (
              <PhoneFrame>
                <ReelPreview conteudo={conteudo} />
              </PhoneFrame>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-2">Descrição</p>
              <p className="text-creme-2/80 text-[0.88rem] leading-relaxed">{conteudo.descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ocre/60 mb-1">Plataforma</p>
                <p className="text-creme text-[0.85rem]">
                  {conteudo.plataforma === 'ambas' ? 'Instagram + TikTok' : conteudo.plataforma === 'instagram' ? 'Instagram' : 'TikTok'}
                </p>
              </div>
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ocre/60 mb-1">Horário</p>
                <p className="text-creme text-[0.85rem]">{conteudo.horario}</p>
              </div>
              <div className="border border-ocre/15 rounded-[12px] p-3">
                <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ocre/60 mb-1">Mundo</p>
                <p className="text-[0.85rem]" style={{ color: p.destaque }}>{p.nome}</p>
              </div>
              {conteudo.produtoRelacionado && (
                <div className="border border-ocre/15 rounded-[12px] p-3">
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ocre/60 mb-1">Produto</p>
                  <p className="text-creme text-[0.85rem]">{conteudo.produtoRelacionado}</p>
                </div>
              )}
            </div>

            {temReel && conteudo.reelScript && (
              <div>
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-3">Script Completo</p>
                <div className="bg-terra-2/40 rounded-[12px] p-4 border border-ocre/15 space-y-3">
                  <div>
                    <p className="text-[0.6rem] tracking-[0.15em] uppercase text-ambar/70 mb-1">Gancho (3s)</p>
                    <p className="text-creme font-serif text-[0.9rem] leading-relaxed">{conteudo.reelScript.gancho}</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.15em] uppercase text-ambar/70 mb-1">Corpo</p>
                    {conteudo.reelScript.corpo.map((l, i) => (
                      <p key={i} className="text-creme-2/80 text-[0.85rem] leading-relaxed mb-1">• {l}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[0.6rem] tracking-[0.15em] uppercase text-ambar/70 mb-1">CTA</p>
                    <p className="text-creme text-[0.85rem]">{conteudo.reelScript.cta}</p>
                  </div>
                  {conteudo.reelScript.musica && (
                    <p className="text-creme-2/50 text-[0.75rem]">♪ {conteudo.reelScript.musica} · {conteudo.reelScript.duracao}</p>
                  )}
                </div>
              </div>
            )}

            {temSlides && conteudo.slides && (
              <div>
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-3">Textos dos Slides</p>
                <div className="space-y-2">
                  {conteudo.slides.map((s, i) => (
                    <div key={i} className="bg-terra-2/40 rounded-[10px] p-3 border border-ocre/10">
                      <p className="text-[0.6rem] tracking-[0.15em] uppercase text-ocre/60 mb-1">
                        Slide {i + 1} · {s.tipo}
                        {s.titulo ? ` · ${s.titulo}` : ''}
                      </p>
                      <p className="text-creme-2/80 text-[0.8rem] leading-relaxed whitespace-pre-line">{s.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-1.5">
                {conteudo.hashtags.map((h) => (
                  <span key={h} className="text-[0.7rem] px-2 py-1 rounded-md bg-terra-2/50 text-ocre/80">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {conteudo.notas && (
              <div>
                <p className="text-[0.65rem] tracking-[0.2em] uppercase text-ocre/70 mb-2">Notas</p>
                <p className="text-creme-2/70 text-[0.82rem] italic">{conteudo.notas}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSlidePreview({ conteudo }: { conteudo: ConteudoDia }) {
  const p = PALETAS[conteudo.mundo];
  const firstSlide = conteudo.slides?.[0];

  if (conteudo.reelScript) {
    return (
      <div
        className="w-full rounded-[8px] overflow-hidden flex items-end p-2"
        style={{
          aspectRatio: '9/16',
          maxHeight: 80,
          background: `linear-gradient(160deg, ${p.bg2}, ${p.bg})`,
        }}
      >
        <p className="text-[0.45rem] leading-tight line-clamp-3" style={{ color: p.texto + 'cc' }}>
          {conteudo.reelScript.gancho}
        </p>
      </div>
    );
  }

  if (firstSlide) {
    return (
      <div
        className="w-full rounded-[8px] overflow-hidden flex items-center justify-center p-2 text-center"
        style={{
          aspectRatio: '1/1',
          maxHeight: 60,
          background: `linear-gradient(160deg, ${p.bg}, ${p.bg2})`,
        }}
      >
        <p className="text-[0.42rem] leading-tight line-clamp-3 font-serif" style={{ color: p.texto + 'cc' }}>
          {firstSlide.texto}
        </p>
      </div>
    );
  }

  return null;
}

type Vista = 'calendario' | 'lista' | 'tipos';
type FiltroMundo = Mundo | 'todos';

export default function EstudioPage() {
  const [selecionado, setSelecionado] = useState<ConteudoDia | null>(null);
  const [vista, setVista] = useState<Vista>('calendario');
  const [filtroMundo, setFiltroMundo] = useState<FiltroMundo>('todos');

  const conteudosFiltrados = filtroMundo === 'todos'
    ? CALENDARIO_30_DIAS
    : CALENDARIO_30_DIAS.filter(c => c.mundo === filtroMundo);

  const semanas: ConteudoDia[][] = [];
  for (let i = 0; i < 30; i += 7) {
    semanas.push(CALENDARIO_30_DIAS.slice(i, i + 7));
  }

  const estatisticas = {
    total: CALENDARIO_30_DIAS.length,
    carrosseis: CALENDARIO_30_DIAS.filter(c => c.tipo.startsWith('carrossel')).length,
    reels: CALENDARIO_30_DIAS.filter(c => c.tipo.startsWith('reel')).length,
    citacoes: CALENDARIO_30_DIAS.filter(c => c.tipo === 'citacao-visual').length,
    ambas: CALENDARIO_30_DIAS.filter(c => c.plataforma === 'ambas').length,
    soInsta: CALENDARIO_30_DIAS.filter(c => c.plataforma === 'instagram').length,
  };

  const porMundo: Record<string, number> = {};
  for (const c of CALENDARIO_30_DIAS) {
    porMundo[c.mundo] = (porMundo[c.mundo] ?? 0) + 1;
  }

  const porTipo: Record<string, ConteudoDia[]> = {};
  for (const c of conteudosFiltrados) {
    if (!porTipo[c.tipo]) porTipo[c.tipo] = [];
    porTipo[c.tipo].push(c);
  }

  return (
    <main className="max-w-[1200px] mx-auto px-7 py-12">
      <header className="mb-10">
        <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
        <h1 className="font-serif font-light text-creme text-3xl mb-2">Estúdio de Conteúdo</h1>
        <p className="text-creme-2/60 text-[0.88rem]">
          Calendário de 30 dias · Instagram + TikTok · Carrosséis, Reels e Citações
        </p>
      </header>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.total}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">conteúdos</p>
        </div>
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.carrosseis}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">carrosséis</p>
        </div>
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.reels}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">reels</p>
        </div>
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.citacoes}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">citações</p>
        </div>
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.ambas}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">insta+tiktok</p>
        </div>
        <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
          <p className="text-ambar text-2xl font-serif">{estatisticas.soInsta}</p>
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-creme-2/70">só instagram</p>
        </div>
      </div>

      {/* Filtros por mundo */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/50 mr-2">Mundo:</p>
        {(['todos', 'freeme', 'infonte', 'synchim', 'escola', 'autora'] as const).map(m => (
          <button
            key={m}
            onClick={() => setFiltroMundo(m)}
            className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-[0.08em] border transition-colors ${
              filtroMundo === m
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/25 text-creme-2/60 hover:border-ocre/50 hover:text-creme-2/80'
            }`}
          >
            {m === 'todos' ? 'todos' : PALETAS[m].nome}
            {m !== 'todos' && (
              <span className="ml-1.5 text-[0.6rem] opacity-60">{porMundo[m] ?? 0}</span>
            )}
          </button>
        ))}
      </div>

      {/* Vista toggle */}
      <div className="flex items-center gap-2 mb-8">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-creme-2/50 mr-2">Vista:</p>
        {([
          { id: 'calendario' as Vista, label: 'Calendário' },
          { id: 'lista' as Vista, label: 'Lista' },
          { id: 'tipos' as Vista, label: 'Por Tipo' },
        ]).map(v => (
          <button
            key={v.id}
            onClick={() => setVista(v.id)}
            className={`px-3 py-1.5 rounded-full text-[0.72rem] tracking-[0.08em] border transition-colors ${
              vista === v.id
                ? 'border-ambar text-ambar bg-ambar/10'
                : 'border-ocre/25 text-creme-2/60 hover:border-ocre/50'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* VISTA: CALENDÁRIO */}
      {vista === 'calendario' && (
        <div className="space-y-6">
          {semanas.map((semana, si) => (
            <div key={si}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-serif font-light text-creme text-lg">Semana {si + 1}</h3>
                <div className="flex-1 h-px bg-ocre/15" />
                <span className="text-[0.65rem] tracking-[0.14em] uppercase text-ocre/50">
                  Dias {si * 7 + 1}–{Math.min((si + 1) * 7, 30)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {semana.map(c => {
                  const tipo = TIPO_LABELS[c.tipo];
                  const pal = PALETAS[c.mundo];
                  const isFiltered = filtroMundo !== 'todos' && c.mundo !== filtroMundo;

                  return (
                    <button
                      key={c.dia}
                      onClick={() => setSelecionado(c)}
                      className={`text-left rounded-[14px] border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                        isFiltered ? 'opacity-20 pointer-events-none' : ''
                      }`}
                      style={{
                        borderColor: pal.destaque + '30',
                        background: `linear-gradient(160deg, ${pal.bg}22, transparent)`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[0.65rem] font-medium" style={{ color: pal.destaque }}>
                          Dia {c.dia}
                        </span>
                        <span className="text-xs">{tipo.emoji}</span>
                      </div>
                      <MiniSlidePreview conteudo={c} />
                      <p className="font-serif text-creme text-[0.72rem] leading-tight mt-2 line-clamp-2">
                        {c.titulo}
                      </p>
                      <p className="text-[0.55rem] tracking-[0.1em] uppercase mt-1.5" style={{ color: tipo.cor + 'aa' }}>
                        {tipo.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[0.5rem] text-creme-2/40">{c.horario}</span>
                        <span className="text-[0.5rem] text-creme-2/30">·</span>
                        <span className="text-[0.5rem] text-creme-2/40">
                          {c.plataforma === 'ambas' ? 'IG+TT' : c.plataforma === 'instagram' ? 'IG' : 'TT'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA: LISTA */}
      {vista === 'lista' && (
        <div className="space-y-2">
          {conteudosFiltrados.map(c => {
            const tipo = TIPO_LABELS[c.tipo];
            const pal = PALETAS[c.mundo];
            return (
              <button
                key={c.dia}
                onClick={() => setSelecionado(c)}
                className="w-full text-left flex items-center gap-4 py-3 px-4 rounded-[12px] border border-ocre/10 hover:border-ocre/30 transition-colors group"
                style={{ background: `linear-gradient(90deg, ${pal.bg}11, transparent)` }}
              >
                <span className="text-ambar font-serif text-lg w-8 text-center shrink-0">
                  {c.dia}
                </span>
                <span className="text-lg shrink-0">{tipo.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-creme text-[0.92rem] group-hover:text-ambar transition-colors truncate">
                    {c.titulo}
                  </p>
                  <p className="text-creme-2/50 text-[0.72rem] truncate">{c.descricao}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.6rem] tracking-[0.12em] uppercase" style={{ color: tipo.cor }}>
                    {tipo.label}
                  </p>
                  <p className="text-[0.6rem] text-creme-2/40">
                    {c.horario} · {pal.nome}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* VISTA: POR TIPO */}
      {vista === 'tipos' && (
        <div className="space-y-10">
          {Object.entries(porTipo).map(([tipoKey, items]) => {
            const tipo = TIPO_LABELS[tipoKey as keyof typeof TIPO_LABELS];
            return (
              <section key={tipoKey}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{tipo.emoji}</span>
                  <h3 className="font-serif font-light text-creme text-xl">{tipo.label}</h3>
                  <div className="flex-1 h-px bg-ocre/15" />
                  <span className="text-[0.65rem] tracking-[0.14em] uppercase" style={{ color: tipo.cor }}>
                    {items.length} posts
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(c => {
                    const pal = PALETAS[c.mundo];
                    return (
                      <button
                        key={c.dia}
                        onClick={() => setSelecionado(c)}
                        className="text-left rounded-[14px] border p-4 transition-all hover:-translate-y-0.5 group"
                        style={{ borderColor: pal.destaque + '25', background: `linear-gradient(160deg, ${pal.bg}18, transparent)` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[0.65rem] font-medium" style={{ color: pal.destaque }}>
                            Dia {c.dia} · {pal.nome}
                          </span>
                          <span className="text-[0.6rem] text-creme-2/40">{c.horario}</span>
                        </div>
                        <p className="font-serif text-creme text-[0.92rem] leading-tight group-hover:text-ambar transition-colors mb-1.5">
                          {c.titulo}
                        </p>
                        <p className="text-creme-2/50 text-[0.72rem] line-clamp-2">{c.descricao}</p>
                        {c.slides && (
                          <p className="text-[0.6rem] text-ocre/50 mt-2">{c.slides.length} slides</p>
                        )}
                        {c.reelScript && (
                          <p className="text-[0.6rem] text-ocre/50 mt-2">{c.reelScript.duracao}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Estratégia de conteúdo */}
      <section className="mt-16 border border-ocre/15 rounded-[18px] p-6">
        <h2 className="font-serif font-light text-creme text-xl mb-4">Estratégia de Conteúdo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[0.85rem] text-creme-2/80 leading-relaxed">
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Ritmo Semanal</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Seg+Sáb:</span> Carrossel educativo (autoridade)</li>
              <li><span className="text-ocre">Ter+Qui:</span> Reel gancho + Carrossel dica (alcance + valor)</li>
              <li><span className="text-ocre">Qua:</span> Citação visual (saves + partilhas)</li>
              <li><span className="text-ocre">Sex:</span> Reel bastidores (conexão pessoal)</li>
              <li><span className="text-ocre">Dom:</span> Carrossel produto (conversão suave)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Princípios</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Gancho forte:</span> 3 primeiros segundos decidem tudo</li>
              <li><span className="text-ocre">Formato didáctico:</span> explicar sem ser académico</li>
              <li><span className="text-ocre">CTA suave:</span> nunca vender, sempre oferecer</li>
              <li><span className="text-ocre">Autenticidade:</span> partilhar a jornada, não só o resultado</li>
              <li><span className="text-ocre">Consistência:</span> mesmo horário, mesma paleta, mesma voz</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Tendências Redes 2026</h3>
            <ul className="space-y-1.5">
              <li><span className="text-ocre">Carrosséis:</span> o formato com mais saves e partilhas no IG</li>
              <li><span className="text-ocre">Reels curtos:</span> 15-30s com gancho nos 3s, TikTok e IG Reels</li>
              <li><span className="text-ocre">Texto no ecrã:</span> 80% vê sem som, legendas obrigatórias</li>
              <li><span className="text-ocre">Vulnerabilidade:</span> conteúdo pessoal supera conteúdo polido</li>
              <li><span className="text-ocre">Micro-nicho:</span> terapia + maternidade + sistémica = posicionamento forte</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Paletas por Mundo</h3>
            <div className="space-y-2">
              {Object.entries(PALETAS).map(([key, pal]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded" style={{ background: pal.bg }} />
                    <div className="w-5 h-5 rounded" style={{ background: pal.bg2 }} />
                    <div className="w-5 h-5 rounded" style={{ background: pal.destaque }} />
                  </div>
                  <span className="text-creme-2/70 text-[0.78rem]">{pal.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Referências competição */}
      <section className="mt-8 border border-ocre/15 rounded-[18px] p-6">
        <h2 className="font-serif font-light text-creme text-xl mb-4">Referências e Competição</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[0.85rem] text-creme-2/80 leading-relaxed">
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">O que funciona no nicho</h3>
            <ul className="space-y-1.5">
              <li>Carrosséis com frases curtas + fundo escuro</li>
              <li>Reels a falar directamente para a câmara</li>
              <li>Conteúdo "eu também senti isto" (identificação)</li>
              <li>Exercícios práticos com resultado imediato</li>
              <li>Citações sobre fundo texturado (não Canva genérico)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Design diferenciador</h3>
            <ul className="space-y-1.5">
              <li>Paleta terra/orgânica (vs. tons pastel genéricos)</li>
              <li>Tipografia Fraunces (serif elegante, nunca Canva)</li>
              <li>Pouco texto por slide (máximo 5-6 linhas)</li>
              <li>Espaço negativo generoso</li>
              <li>Sem emojis excessivos nos slides</li>
            </ul>
          </div>
          <div>
            <h3 className="text-ambar text-[0.7rem] tracking-[0.2em] uppercase mb-2">Ganchos que convertem</h3>
            <ul className="space-y-1.5">
              <li>"Tu sabes do que estou a falar."</li>
              <li>"Ninguém te disse isto mas..."</li>
              <li>"Se sentes X, isto é para ti."</li>
              <li>"3 sinais de que..." (lista)</li>
              <li>Pergunta directa ao público</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Modal de detalhe */}
      {selecionado && (
        <DetalheConteudo conteudo={selecionado} onFechar={() => setSelecionado(null)} />
      )}
    </main>
  );
}
