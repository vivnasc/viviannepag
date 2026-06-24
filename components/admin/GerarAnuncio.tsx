'use client';

import { useState } from 'react';

type Guiao = {
  nome: string;
  intro: { texto: string; st: number; en: number }[];
  introDur: number;
  falas: string[];
  fim: { titulo: string; cta: string; site: string };
};

export function GerarAnuncio({ guioes, capaUrl }: { guioes: Record<string, Guiao>; capaUrl: string | null }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {Object.entries(guioes).map(([v, g]) => (
        <Painel key={v} variante={v} g={g} capaUrl={capaUrl} />
      ))}
    </div>
  );
}

function Painel({ variante, g, capaUrl }: { variante: string; g: Guiao; capaUrl: string | null }) {
  const [voz, setVoz] = useState<string | null>(null);
  const [vozEstado, setVozEstado] = useState<'inicio' | 'a-gerar' | 'erro'>('inicio');
  const [montar, setMontar] = useState<'inicio' | 'a-enviar' | 'enviado' | 'erro'>('inicio');
  const [erro, setErro] = useState('');

  async function ouvir() {
    setVozEstado('a-gerar');
    try {
      const r = await fetch(`/api/admin/anuncio/voz?variante=${variante}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'erro');
      setVoz(j.url);
      setVozEstado('inicio');
    } catch (e) { setVozEstado('erro'); setErro((e as Error).message); }
  }
  async function montarVideo() {
    setMontar('a-enviar');
    try {
      const r = await fetch('/api/admin/anuncio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setMontar('enviado');
    } catch (e) { setMontar('erro'); setErro((e as Error).message); }
  }

  return (
    <div className="rounded-[14px] border border-ocre/25 p-5">
      <p className="text-[0.7rem] tracking-[0.26em] uppercase text-ambar mb-3">{g.nome}</p>

      {/* STORYBOARD — vê o que vai sair, antes de montar */}
      <div className="flex gap-4 mb-4">
        {capaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capaUrl} alt="" className="w-[70px] shrink-0 rounded-[6px] border border-ocre/20 self-start" />
        )}
        <div className="min-w-0 text-[0.8rem] leading-relaxed">
          <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1">texto no ecrã (gancho)</p>
          {g.intro.map((c, i) => (
            <p key={i} className="text-creme font-serif italic mb-1">“{c.texto.replace(/\n/g, ' ')}” <span className="text-creme-2/40 not-italic">· {c.st}-{c.en}s</span></p>
          ))}
        </div>
      </div>
      <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1">a tua voz diz</p>
      <ol className="text-[0.82rem] text-creme-2/85 leading-relaxed list-decimal pl-5 mb-3 space-y-0.5">
        {g.falas.map((f, i) => <li key={i}>{f}</li>)}
      </ol>
      <p className="text-creme-2/60 text-[0.78rem] mb-4">
        <span className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em]">fim · </span>
        {g.fim.titulo} — <em className="font-serif">{g.fim.cta}</em>
      </p>

      {/* PRÉVIA DA VOZ */}
      <button onClick={ouvir} disabled={vozEstado === 'a-gerar'}
        className="rounded-full border border-ambar/60 text-ambar px-5 py-2 text-[0.85rem] hover:bg-ambar/10 transition-colors disabled:opacity-50 mr-2">
        {vozEstado === 'a-gerar' ? 'a gerar a voz…' : '▶ ouvir a voz (prévia)'}
      </button>
      {voz && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio src={voz} controls className="w-full mt-3" />
      )}

      {/* MONTAR O VÍDEO FINAL */}
      <div className="mt-4 pt-4 border-t border-ocre/15">
        <button onClick={montarVideo} disabled={montar === 'a-enviar'}
          className="rounded-full bg-ambar text-[#2A1C12] px-5 py-2.5 text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {montar === 'a-enviar' ? 'a enviar…' : 'montar o vídeo final →'}
        </button>
        {montar === 'enviado' && <p className="text-salvia text-[0.8rem] mt-3 font-serif italic">A montar (~5-10 min). Atualiza a página e o vídeo aparece em baixo.</p>}
        {(vozEstado === 'erro' || montar === 'erro') && <p className="text-rosa/90 text-[0.8rem] mt-3">Algo correu mal: {erro}</p>}
      </div>
    </div>
  );
}
