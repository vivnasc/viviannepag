'use client';

// Preview das SÉRIES DIÁRIAS (seteveus.space): VC Sabia + Hoje em Mim.
// Só o LOOK, ao vivo — para a Vivianne validar a moldura antes de ligar o
// upload do motion + render + publicação. Cola um URL de imagem (ou um frame
// do teu Midjourney) para veres a moldura sobre um fundo real.

import { useState, useEffect } from 'react';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { SerieDiariaSlide, SERIES, type SerieId } from '@/components/admin/SerieDiariaSlide';
import { PALETAS, REGENTE, paletaDoDia, HORA_SERIE, type PaletaId } from '@/lib/series/serie-design';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'block' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'block' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'block' });

const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

const EXEMPLOS: Record<SerieId, string> = {
  vcsabia: 'Uma planta não cresce mais depressa por receber mais água do que precisa. Tu também floresces melhor quando respeitas os teus limites.',
  hojeemmim: 'Hoje aprendi que o meu silêncio é, muitas vezes, a resposta mais honesta.',
};

export default function SeriesDiariaPreview() {
  const [serie, setSerie] = useState<SerieId>('hojeemmim');
  const [dia, setDia] = useState('quinta');
  const [frase, setFrase] = useState(EXEMPLOS.hojeemmim);
  const [bgUrl, setBgUrl] = useState('');
  const [paleta, setPaleta] = useState<PaletaId>(paletaDoDia('quinta'));
  const [mjPrompt, setMjPrompt] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [motion, setMotion] = useState(true);
  const [prog, setProg] = useState(1);
  // pool (motions/áudios reciclados da escola-veus) + bulk do mês
  const [pool, setPool] = useState<{ motions: number; novos: number; audios: { mood: string; n: number }[] } | null>(null);
  const [poolErro, setPoolErro] = useState<string | null>(null);
  const [bulkInicio, setBulkInicio] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [bulkDias, setBulkDias] = useState(30);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErro, setBulkErro] = useState<string | null>(null);
  const [bulkSeg, setBulkSeg] = useState(0);
  const [bulkRes, setBulkRes] = useState<{ criados: number; semMotion: number; poolErro?: string | null; resumo: { data: string; dia: string; frase: string; motion: string | null; audio: string | null; mj: boolean; mjPrompt?: string }[] } | null>(null);

  useEffect(() => {
    setPool(null); setPoolErro(null);
    fetch(`/api/admin/series-diaria/pool?serie=${serie}`).then((r) => r.json()).then((j) => { if (j.ok) setPool(j); else setPoolErro(j.detalhe ?? j.erro ?? 'erro'); }).catch((e) => setPoolErro(String(e)));
  }, [serie]);

  async function gerarMes() {
    if (bulkBusy) return;
    if (!confirm(`Gerar ${bulkDias} dia(s) de ${SERIES[serie].nome} a partir de ${bulkInicio}?\n\nFica tudo em RASCUNHO na Publicar (vivianne.dos.santos) — nada publica sem aprovares.`)) return;
    setBulkBusy(true); setBulkRes(null); setBulkErro(null); setErro(null); setBulkSeg(0);
    try {
      const r = await fetch('/api/admin/series-diaria/gerar-mes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie, inicio: bulkInicio, dias: bulkDias }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) setBulkRes(j); else setBulkErro(j.detalhe ?? j.erro ?? `erro ${r.status}`);
    } catch (e) { setBulkErro(`falha de rede: ${String(e)}`); }
    setBulkBusy(false);
  }

  // contador de segundos enquanto o lote gera (feedback de que está vivo)
  useEffect(() => {
    if (!bulkBusy) return;
    const id = setInterval(() => setBulkSeg((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [bulkBusy]);

  const trocarSerie = (s: SerieId) => { setSerie(s); setFrase(EXEMPLOS[s]); setMjPrompt(''); if (s === 'hojeemmim') setPaleta(paletaDoDia(dia)); };
  const trocarDia = (d: string) => { setDia(d); setPaleta(paletaDoDia(d)); }; // paleta FIXA por dia (regente)

  // anima o typewriter (loop) para veres a frase a escrever-se
  useEffect(() => {
    if (!motion) { setProg(1); return; }
    let raf = 0; let start: number | null = null;
    const DUR = 4200, HOLD = 1500, TOTAL = DUR + HOLD;
    const tick = (t: number) => {
      if (start == null) start = t;
      const e = (t - start) % TOTAL;
      setProg(Math.min(1, e / DUR));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion, frase, serie, dia]);

  async function gerar(outra: boolean) {
    setGerando(true); setErro(null);
    try {
      const r = await fetch('/api/admin/series-diaria/gerar-frase', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serie, dia, evitar: outra && frase ? [frase] : [] }),
      });
      const j = await r.json();
      if (r.ok && j.frase) { setFrase(j.frase); setMjPrompt(j.mjPrompt || ''); }
      else setErro(j.detalhe ?? j.erro ?? `erro ${r.status}`);
    } catch (e) { setErro(String(e)); }
    setGerando(false);
  }

  async function copiarMj() {
    try { await navigator.clipboard.writeText(mjPrompt); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch { /* */ }
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-6 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
      <h1 className="text-2xl font-semibold">Séries diárias · preview</h1>
      <p className="text-[0.78rem] opacity-55 mt-1 mb-5">Só o look (a moldura). Valida o visual; o upload do motion + render + publicação ligam-se a seguir.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* controlos */}
        <div className="space-y-4 order-2 lg:order-1">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Série</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(SERIES) as SerieId[]).map((s) => (
                <button key={s} onClick={() => trocarSerie(s)} className={`text-[0.8rem] px-3 py-1.5 rounded-lg border ${serie === s ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{SERIES[s].nome} <span className="opacity-50">· {SERIES[s].momento}</span></button>
              ))}
            </div>
            <p className="text-[0.62rem] opacity-55 mt-1.5">publica ~ <b className="opacity-90">{HORA_SERIE[serie]}</b> ({serie === 'vcsabia' ? 'manhã, motivação para começar o dia' : 'noite, fecho do dia'})</p>
          </div>

          {serie === 'hojeemmim' && (
            <div>
              <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Dia da semana <span className="opacity-60 normal-case tracking-normal">· cada dia tem a sua paleta fixa (regente planetário)</span></p>
              <div className="flex gap-1.5 flex-wrap">
                {DIAS.map((d) => (
                  <button key={d} onClick={() => trocarDia(d)} className={`text-[0.72rem] px-2.5 py-1 rounded-full border ${dia === d ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/20 text-creme-2/60 hover:border-ambar'}`}>{d}</button>
                ))}
              </div>
              <p className="text-[0.62rem] opacity-55 mt-1.5">{dia} · regente <b className="opacity-90">{REGENTE[dia]}</b> → paleta <b className="opacity-90">{PALETAS[paletaDoDia(dia)].nome}</b></p>
            </div>
          )}

          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Paleta {serie === 'hojeemmim' && <span className="opacity-60 normal-case tracking-normal">(fixa pelo dia; aqui só p/ comparar)</span>}</p>
            <div className="flex gap-1.5 flex-wrap">
              {(Object.keys(PALETAS) as PaletaId[]).map((p) => (
                <button key={p} onClick={() => setPaleta(p)} className={`flex items-center gap-1.5 text-[0.72rem] px-2.5 py-1 rounded-full border ${paleta === p ? 'border-ambar text-ambar' : 'border-ocre/20 text-creme-2/60 hover:border-ambar'}`}><span className="w-3 h-3 rounded-full" style={{ background: PALETAS[p].highlight }} />{PALETAS[p].nome}</button>
              ))}
            </div>
          </div>

          <div>
            <button onClick={() => setMotion((m) => !m)} className={`text-[0.72rem] px-3 py-1.5 rounded-lg border ${motion ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{motion ? '⏸ parar motion' : '▶ ver motion (typewriter)'}</button>
            <span className="text-[0.62rem] opacity-45 ml-2">a frase escreve-se (typewriter) — é assim que vai animar no reel.</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[0.7rem] uppercase tracking-wider opacity-50">Frase (do Claude · editável)</p>
              <button onClick={() => gerar(false)} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{gerando ? '…' : '✨ gerar frase'}</button>
              <button onClick={() => gerar(true)} disabled={gerando} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-[#C9B6FA]/45 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-40">↻ outra</button>
            </div>
            <textarea value={frase} onChange={(e) => setFrase(e.target.value)} rows={5} className="w-full text-[0.9rem] p-3 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2 leading-relaxed" />
            <p className="text-[0.62rem] opacity-40 mt-1">O Claude escolhe (nunca repete, ciente do dia + estação). Podes editar à mão ou pedir "outra".</p>
            {erro && <p className="text-[0.68rem] text-rosa/80 mt-1">⚠ {erro}</p>}
          </div>

          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Prompt Midjourney (fundo em movimento)</p>
            <textarea value={mjPrompt} readOnly rows={3} placeholder='Carrega "✨ gerar frase" e aparece aqui o prompt para copiares para o Midjourney.' className="w-full text-[0.76rem] p-3 rounded-lg border border-ocre/20 bg-[#120f1a] text-creme-2/85 leading-relaxed font-mono" />
            <button onClick={copiarMj} disabled={!mjPrompt} className="mt-1.5 text-[0.68rem] px-2.5 py-1 rounded-full border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-30">{copiado ? '✓ copiado' : '⧉ copiar prompt'}</button>
            <p className="text-[0.62rem] opacity-40 mt-1">Geras o motion no Midjourney com este prompt, e depois arrasta-lo para aqui (próximo passo).</p>
          </div>

          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Fundo (URL de imagem, opcional)</p>
            <input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="cola um frame do teu motion para veres sobre fundo real" className="w-full text-[0.8rem] px-3 py-2 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2" />
            <p className="text-[0.62rem] opacity-40 mt-1">No render real, o fundo é o teu vídeo de motion (Midjourney). Aqui é só para pré-visualizar.</p>
          </div>

          {/* ── POOL reciclada (escola-veus) + BULK do mês ── */}
          <div className="rounded-xl border border-ocre/20 bg-black/15 p-4 space-y-3">
            <p className="text-[0.8rem] font-semibold">📦 Gerar 1 mês ({SERIES[serie].nome})</p>
            <p className="text-[0.66rem] opacity-60 -mt-1">
              {pool ? <>Pool ligada: <b>{pool.motions}</b> motions ({pool.novos} novos por usar) · áudios: {pool.audios.map((a) => `${a.mood} (${a.n})`).join(' · ') || '—'}</>
                : poolErro ? <span className="text-rosa/80">⚠ pool: {poolErro}</span>
                : 'a ler a pool de motions/áudios…'}
            </p>
            <div className="flex items-center gap-2 flex-wrap text-[0.74rem]">
              <label className="flex items-center gap-1.5 opacity-80">início <input type="date" value={bulkInicio} onChange={(e) => setBulkInicio(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
              <label className="flex items-center gap-1.5 opacity-80">dias <input type="number" min={1} max={31} value={bulkDias} onChange={(e) => setBulkDias(Number(e.target.value))} className="w-16 px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
              <button onClick={gerarMes} disabled={bulkBusy} className="text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{bulkBusy ? `⏳ a gerar… ${bulkSeg}s` : `⚡ gerar ${bulkDias} dia(s)`}</button>
            </div>
            {bulkBusy && <p className="text-[0.68rem] text-ambar animate-pulse">⏳ a escrever as frases e a casar motions da pool… pode levar 1-2 min. Não feches a página. ({bulkSeg}s)</p>}
            {bulkErro && <p className="text-[0.7rem] text-rosa/90">⚠ {bulkErro}</p>}
            <p className="text-[0.62rem] opacity-45">Frases únicas (dia + estação{serie === 'hojeemmim' ? ' + ritual' : ''}), motion reciclado da pool (novos primeiro, senão melhor match) e áudio por mood. Fica em <b>rascunho</b> na Publicar (vivianne.dos.santos) — nada publica sem o teu ✓. Dias que já existem são saltados.</p>
            {bulkRes && (
              <div className="space-y-2">
                <p className="text-[0.72rem] text-salvia">✓ {bulkRes.criados} dia(s) criados{bulkRes.semMotion ? <> · <b className="text-ambar">{bulkRes.semMotion} sem motion na pool</b> (gera no MJ com os prompts abaixo)</> : ' · todos com motion da pool'}{bulkRes.poolErro ? <span className="text-rosa/80"> · ⚠ pool: {bulkRes.poolErro}</span> : null}</p>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-ocre/15">
                  <table className="w-full text-[0.66rem]">
                    <thead><tr className="text-left opacity-50"><th className="px-2 py-1">data</th><th className="px-2 py-1">frase</th><th className="px-2 py-1">motion</th><th className="px-2 py-1">áudio</th></tr></thead>
                    <tbody>
                      {bulkRes.resumo.map((r) => (
                        <tr key={r.data} className="border-t border-ocre/10 align-top">
                          <td className="px-2 py-1 whitespace-nowrap opacity-70">{r.data}<br /><span className="opacity-60">{r.dia}</span></td>
                          <td className="px-2 py-1">{r.frase}</td>
                          <td className="px-2 py-1">{r.motion ? <span className="text-salvia">♻ {r.motion}</span> : <button onClick={() => navigator.clipboard.writeText(r.mjPrompt ?? '')} title={r.mjPrompt} className="text-ambar underline">⧉ copiar prompt MJ</button>}</td>
                          <td className="px-2 py-1 opacity-70">{r.audio ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* preview 9:16 */}
        <div className="order-1 lg:order-2">
          <div className="w-full max-w-[360px] mx-auto">
            <SerieDiariaSlide serie={serie} frase={frase} dia={dia} bgUrl={bgUrl || undefined} paleta={paleta} prog={prog} />
          </div>
          <p className="text-[0.62rem] opacity-45 text-center mt-2">9:16 · {SERIES[serie].nome}</p>
        </div>
      </div>
    </div>
  );
}
