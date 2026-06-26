'use client';

import { useEffect, useState } from 'react';

type Cena = { id: string; rotulo: string; cenaPrompt?: string; klingPrompt?: string; usarCapa?: boolean };
type Guiao = {
  nome: string;
  cenas: Cena[];
  intro: { texto: string; st: number; en: number }[];
  introDur: number;
  falas: string[];
  fim: { titulo: string; cta: string; site: string };
};
type CenaEstado = { cenaUrl?: string; motionUrl?: string };

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
  const [cenas, setCenas] = useState<CenaEstado[]>(() => g.cenas.map(() => ({})));
  const [ocupada, setOcupada] = useState<number | null>(null); // índice da cena a gerar
  const [acao, setAcao] = useState<'cena' | 'motion' | null>(null);
  const [voz, setVoz] = useState<string | null>(null);
  const [vozEstado, setVozEstado] = useState<Estado>('inicio');
  const [montar, setMontar] = useState<'inicio' | 'a-enviar' | 'enviado' | 'erro'>('inicio');
  const [erro, setErro] = useState('');

  // carrega o que já foi gerado (sobrevive a atualizar a página)
  useEffect(() => {
    fetch(`/api/admin/anuncio/estado?variante=${variante}`)
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.cenas)) setCenas(g.cenas.map((_, i) => j.cenas[i] ?? {}));
        if (j.voz?.url) setVoz(j.voz.url);
      })
      .catch(() => {});
  }, [variante, g.cenas]);

  async function gerarCena(idx: number) {
    setOcupada(idx); setAcao('cena');
    try {
      const r = await fetch('/api/admin/anuncio/cena', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante, idx }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setCenas((cs) => cs.map((c, i) => (i === idx ? { cenaUrl: j.url, motionUrl: undefined } : c)));
    } catch (e) { setErro((e as Error).message); } finally { setOcupada(null); setAcao(null); }
  }
  async function gerarMotion(idx: number) {
    setOcupada(idx); setAcao('motion');
    try {
      const r = await fetch('/api/admin/anuncio/motion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante, idx }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe || j.erro || 'erro');
      setCenas((cs) => cs.map((c, i) => (i === idx ? { ...c, motionUrl: j.url } : c)));
    } catch (e) { setErro((e as Error).message); } finally { setOcupada(null); setAcao(null); }
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

  const prontas = g.cenas.filter((c, i) => c.usarCapa || cenas[i]?.motionUrl || cenas[i]?.cenaUrl).length;

  return (
    <div className="rounded-[14px] border border-ocre/25 p-5">
      <p className="text-[0.7rem] tracking-[0.26em] uppercase text-ambar mb-3">{g.nome}</p>

      {/* STORYBOARD — o que vai sair */}
      <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1">texto no ecrã (gancho)</p>
      {g.intro.map((c, i) => (
        <p key={i} className="text-creme font-serif italic mb-1 text-[0.82rem] leading-relaxed">“{c.texto.replace(/\n/g, ' ')}” <span className="text-creme-2/40 not-italic">· {c.st}-{c.en}s</span></p>
      ))}
      <p className="text-creme-2/50 text-[0.66rem] uppercase tracking-[0.18em] mb-1 mt-3">a tua voz diz (com karaokê)</p>
      <ol className="text-[0.82rem] text-creme-2/85 leading-relaxed list-decimal pl-5 mb-3 space-y-0.5">
        {g.falas.map((f, i) => <li key={i}>{f}</li>)}
      </ol>

      {/* OS PLANOS (cenas que trocam ao longo do vídeo) */}
      <div className="mt-2 pt-4 border-t border-ocre/15">
        <p className="text-creme-2/70 text-[0.78rem] mb-1">os planos do vídeo <span className="text-creme-2/45">({prontas}/{g.cenas.length} prontos · trocam ao longo do anúncio)</span></p>
        <div className="space-y-3 mt-2">
          {g.cenas.map((cena, idx) => {
            const est = cenas[idx] ?? {};
            const aGerar = ocupada === idx;
            // plano que USA A CAPA do livro: mostra a capa, sem gerar nada.
            if (cena.usarCapa) {
              return (
                <div key={cena.id} className="flex gap-3 items-start rounded-[10px] border border-ocre/15 p-2.5">
                  <div className="w-[116px] shrink-0">
                    {capaUrl ? (
                      <a href={capaUrl} target="_blank" rel="noreferrer" title="abrir em grande">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={capaUrl} alt="" className="w-[116px] rounded-[6px] border border-ambar/30 aspect-[9/16] object-cover cursor-zoom-in" />
                      </a>
                    ) : (
                      <div className="w-[116px] aspect-[9/16] rounded-[6px] border border-dashed border-ocre/25 grid place-items-center text-creme-2/30 text-[0.66rem]">capa</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-creme text-[0.8rem] mb-0.5">{idx + 1} · {cena.rotulo}</p>
                    <p className="text-creme-2/45 text-[0.7rem]">usa a capa do livro ✓ — sempre incluída no fim, com um leve movimento. Não é preciso gerar.</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={cena.id} className="flex gap-3 items-start rounded-[10px] border border-ocre/15 p-2.5">
                <div className="w-[116px] shrink-0">
                  {est.motionUrl ? (
                    <a href={est.motionUrl} target="_blank" rel="noreferrer" title="abrir em grande">
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video src={est.motionUrl} muted loop autoPlay playsInline className="w-[116px] rounded-[6px] border border-ambar/30 aspect-[9/16] object-cover bg-black cursor-zoom-in" />
                    </a>
                  ) : est.cenaUrl ? (
                    <a href={est.cenaUrl} target="_blank" rel="noreferrer" title="abrir em grande">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={est.cenaUrl} alt="" className="w-[116px] rounded-[6px] border border-ocre/20 aspect-[9/16] object-cover cursor-zoom-in" />
                    </a>
                  ) : (
                    <div className="w-[116px] aspect-[9/16] rounded-[6px] border border-dashed border-ocre/25 grid place-items-center text-creme-2/30 text-[0.66rem]">plano {idx + 1}</div>
                  )}
                  {(est.motionUrl || est.cenaUrl) && <p className="text-creme-2/40 text-[0.64rem] mt-1 text-center">clica → ver grande</p>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-creme text-[0.8rem] mb-0.5">{idx + 1} · {cena.rotulo}</p>
                  <p className="text-creme-2/45 text-[0.7rem] mb-2">{est.motionUrl ? 'a mexer ✓' : est.cenaUrl ? 'imagem pronta — falta pôr a mexer' : 'por gerar'}</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => gerarCena(idx)} disabled={ocupada !== null}
                      className="rounded-full border border-ambar/55 text-ambar px-3 py-1.5 text-[0.76rem] hover:bg-ambar/10 transition-colors disabled:opacity-40">
                      {aGerar && acao === 'cena' ? 'a gerar…' : est.cenaUrl ? '↻ imagem' : '🎨 imagem'}
                    </button>
                    <button onClick={() => gerarMotion(idx)} disabled={ocupada !== null || !est.cenaUrl}
                      className="rounded-full border border-ambar/55 text-ambar px-3 py-1.5 text-[0.76rem] hover:bg-ambar/10 transition-colors disabled:opacity-40">
                      {aGerar && acao === 'motion' ? 'a animar…' : '🎬 pôr a mexer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VOZ */}
      <div className="mt-4 pt-4 border-t border-ocre/15">
        <p className="text-creme-2/55 text-[0.72rem] mb-2">ouvir a tua voz (é a que o vídeo vai ter)</p>
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
        <button onClick={montarVideo} disabled={montar === 'a-enviar' || prontas === 0}
          className="rounded-full bg-ambar text-[#2A1C12] px-5 py-2.5 text-[0.85rem] font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
          {montar === 'a-enviar' ? 'a enviar…' : 'montar o vídeo final →'}
        </button>
        <p className="text-creme-2/45 text-[0.72rem] mt-2">monta com os planos prontos (cortam ao longo do vídeo) + a tua voz. Karaokê + música ficam no render. {prontas === 0 && 'Gera pelo menos um plano primeiro.'}</p>
        {montar === 'enviado' && <p className="text-salvia text-[0.8rem] mt-3 font-serif italic">A montar (~5-10 min). Atualiza a página e o vídeo aparece em baixo.</p>}
        {(vozEstado === 'erro' || montar === 'erro' || erro) && <p className="text-rosa/90 text-[0.8rem] mt-3">Algo correu mal: {erro}</p>}
      </div>
    </div>
  );
}
