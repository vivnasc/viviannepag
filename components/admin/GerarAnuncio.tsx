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

type Estado = 'inicio' | 'a-fazer' | 'erro';

function Painel({ variante, g, capaUrl }: { variante: string; g: Guiao; capaUrl: string | null }) {
  const [cena, setCena] = useState<string | null>(null);
  const [cenaEstado, setCenaEstado] = useState<Estado>('inicio');
  const [motion, setMotion] = useState<string | null>(null);
  const [motionEstado, setMotionEstado] = useState<Estado>('inicio');
  const [voz, setVoz] = useState<string | null>(null);
  const [vozEstado, setVozEstado] = useState<Estado>('inicio');
  const [montar, setMontar] = useState<'inicio' | 'a-enviar' | 'enviado' | 'erro'>('inicio');
  const [erro, setErro] = useState('');

  async function gerarCena() {
    setCenaEstado('a-fazer');
    try {
      const r = await fetch('/api/admin/anuncio/cena', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setCena(j.url); setMotion(null); setCenaEstado('inicio');
    } catch (e) { setCenaEstado('erro'); setErro((e as Error).message); }
  }
  async function gerarMotion() {
    setMotionEstado('a-fazer');
    try {
      const r = await fetch('/api/admin/anuncio/motion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setMotion(j.url); setMotionEstado('inicio');
    } catch (e) { setMotionEstado('erro'); setErro((e as Error).message); }
  }
  async function ouvir() {
    setVozEstado('a-fazer');
    try {
      const r = await fetch(`/api/admin/anuncio/voz?variante=${variante}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || 'erro');
      setVoz(j.url); setVozEstado('inicio');
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

      {/* STORYBOARD — o que vai sair, antes de montar */}
      <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1">texto no ecrã (gancho)</p>
      {g.intro.map((c, i) => (
        <p key={i} className="text-creme font-serif italic mb-1 text-[0.82rem] leading-relaxed">“{c.texto.replace(/\n/g, ' ')}” <span className="text-creme-2/40 not-italic">· {c.st}-{c.en}s</span></p>
      ))}
      <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1 mt-3">a tua voz diz (com karaokê)</p>
      <ol className="text-[0.82rem] text-creme-2/85 leading-relaxed list-decimal pl-5 mb-3 space-y-0.5">
        {g.falas.map((f, i) => <li key={i}>{f}</li>)}
      </ol>
      <p className="text-creme-2/60 text-[0.78rem] mb-4">
        <span className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em]">fim · </span>
        {g.fim.titulo} — <em className="font-serif">{g.fim.cta}</em>
      </p>

      {/* 1 · CENA (imagem) */}
      <div className="mt-2 pt-4 border-t border-ocre/15">
        <p className="text-creme-2/55 text-[0.72rem] mb-2">1 · a cena que vai mexer (não é a capa chapada — é uma cena do mundo do livro)</p>
        <button onClick={gerarCena} disabled={cenaEstado === 'a-fazer'}
          className="rounded-full border border-ambar/60 text-ambar px-4 py-2 text-[0.82rem] hover:bg-ambar/10 transition-colors disabled:opacity-50">
          {cenaEstado === 'a-fazer' ? 'a gerar a cena… (~1 min)' : '🎨 gerar a cena'}
        </button>
        {(cena || capaUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cena || capaUrl || ''} alt="" className="w-[120px] rounded-[8px] border border-ocre/20 mt-3" />
        )}
      </div>

      {/* 2 · MOTION (Kling) */}
      <div className="mt-4 pt-4 border-t border-ocre/15">
        <p className="text-creme-2/55 text-[0.72rem] mb-2">2 · pôr a cena a mexer (movimento real, não zoom)</p>
        <button onClick={gerarMotion} disabled={motionEstado === 'a-fazer' || !cena}
          className="rounded-full border border-ambar/60 text-ambar px-4 py-2 text-[0.82rem] hover:bg-ambar/10 transition-colors disabled:opacity-40">
          {motionEstado === 'a-fazer' ? 'a animar… (~2-3 min)' : '🎬 pôr a mexer'}
        </button>
        {!cena && <span className="text-creme-2/40 text-[0.72rem] ml-2">gera a cena primeiro</span>}
        {motion && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={motion} controls autoPlay muted loop className="w-[160px] rounded-[8px] border border-ocre/20 mt-3 aspect-[9/16] object-cover bg-black" />
        )}
      </div>

      {/* 3 · VOZ */}
      <div className="mt-4 pt-4 border-t border-ocre/15">
        <p className="text-creme-2/55 text-[0.72rem] mb-2">3 · ouvir a tua voz (é a que o vídeo vai ter)</p>
        <button onClick={ouvir} disabled={vozEstado === 'a-fazer'}
          className="rounded-full border border-ambar/60 text-ambar px-4 py-2 text-[0.82rem] hover:bg-ambar/10 transition-colors disabled:opacity-50">
          {vozEstado === 'a-fazer' ? 'a gerar a voz…' : '▶ ouvir a voz'}
        </button>
        {voz && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={voz} controls className="w-full mt-3" />
        )}
      </div>

      {/* MONTAR */}
      <div className="mt-5 pt-4 border-t border-ocre/15">
        <button onClick={montarVideo} disabled={montar === 'a-enviar'}
          className="rounded-full bg-ambar text-[#2A1C12] px-5 py-2.5 text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {montar === 'a-enviar' ? 'a enviar…' : 'montar o vídeo final →'}
        </button>
        <p className="text-creme-2/45 text-[0.72rem] mt-2">monta com a cena, o motion e a voz que aprovaste acima. Karaokê + música ficam no render.</p>
        {montar === 'enviado' && <p className="text-salvia text-[0.8rem] mt-3 font-serif italic">A montar (~5-10 min). Atualiza a página e o vídeo aparece em baixo.</p>}
        {(cenaEstado === 'erro' || motionEstado === 'erro' || vozEstado === 'erro' || montar === 'erro') && <p className="text-rosa/90 text-[0.8rem] mt-3">Algo correu mal: {erro}</p>}
      </div>
    </div>
  );
}
