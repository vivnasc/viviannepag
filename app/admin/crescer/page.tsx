'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { KineticSlide, EFEITOS_TEXTO, FONTES_TEXTO, type EfeitoTexto, type FonteTexto, type Tipografia, type AlinhV, type AlinhH } from '@/components/admin/KineticSlide';
import type { Mundo } from '@/lib/estudio-conteudo';
import { CRESCER, TEMATICAS, FORMATOS, VISUAIS, VOZES, CRESCER_MUNDO, CRESCER_SLIDE, type TematicaId, type FormatoId, type VisualId, type VozId } from '@/lib/crescer/marca';
import { MOTION_INGREDIENTES, CAMARA_OPCOES, type CamaraId } from '@/lib/soulab/motion';
import { MUSICA_ESTILOS } from '@/lib/soulab/musica';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

const MUNDO = CRESCER_MUNDO as Mundo;
const DZ = CRESCER.paleta.destaque, BG2 = CRESCER.paleta.bg2, TX = CRESCER.paleta.texto;

type Peca = {
  tematica: string | null; formato: string; visual: string | null;
  slug: string; texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; clipUrl: string | null; imagens: string[] | null;
  somUrl: string | null; somTipo: string | null; somEstilo: string | null;
  legenda: string | null; hashtags: string[]; fundoPrompt: string | null;
  efeito: string | null; tipografia: Tipografia | null; segPorMomento: number | null;
  momentos: string[] | null; slidesImgs: (string | null)[] | null; slidesTip: (Tipografia | null)[] | null; agendadoEm: string | null; hora: string | null;
  publicado: boolean; criadoEm: string | null;
};

const ALINH_V: { id: AlinhV; label: string }[] = [{ id: 'cima', label: '↑ cima' }, { id: 'centro', label: '· centro' }, { id: 'baixo', label: '↓ baixo' }];
const ALINH_H: { id: AlinhH; label: string }[] = [{ id: 'esq', label: '⇤ esq.' }, { id: 'centro', label: '· centro' }, { id: 'dir', label: 'dir. ⇥' }];

// chip multi-seleção
function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} className="text-[0.74rem] px-2.5 py-1 rounded-full border"
      style={on ? { borderColor: DZ, background: DZ, color: BG2 } : { borderColor: 'rgba(255,255,255,0.2)', color: TX }}>{children}</button>
  );
}

// ── EDITOR DE TIPOGRAFIA + ALINHAMENTO (a novidade: posição do texto sobre a imagem) ──
function TipografiaBox({ peca, disabled, busy, onSave }: { peca: Peca; disabled: boolean; busy: boolean; onSave: (t: Tipografia) => void }) {
  const t0 = peca.tipografia ?? {};
  const [fonte, setFonte] = useState<FonteTexto>((t0.fonte as FonteTexto) ?? 'serif');
  const [tamanho, setTamanho] = useState<number>(t0.tamanho ?? 92);
  const [cor, setCor] = useState<string>(t0.cor ?? '#F4ECDD');
  const [corDestaque, setCorDestaque] = useState<string>(t0.corDestaque ?? DZ);
  const [alinhV, setAlinhV] = useState<AlinhV>((t0.alinhV as AlinhV) ?? 'centro');
  const [alinhH, setAlinhH] = useState<AlinhH>((t0.alinhH as AlinhH) ?? 'centro');
  const tipo: Tipografia = { fonte, tamanho, cor, corDestaque, alinhV, alinhH };
  return (
    <div className="px-2 pb-2 space-y-2 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">letras + posição (vê ao vivo)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={1} tipografia={tipo} {...CRESCER_SLIDE} />
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[0.55rem] opacity-50 mr-0.5">fonte:</span>
        {FONTES_TEXTO.map((f) => <Chip key={f.id} on={fonte === f.id} onClick={() => setFonte(f.id)}>{f.label}</Chip>)}
      </div>
      <label className="flex items-center gap-2 text-[0.6rem] opacity-80">
        <span className="opacity-60">tamanho</span>
        <input type="range" min={56} max={128} step={2} value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))} className="flex-1 accent-current" style={{ color: DZ }} />
        <span className="tabular-nums w-7 text-right">{tamanho}</span>
      </label>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[0.55rem] opacity-50 mr-0.5">vertical:</span>
        {ALINH_V.map((a) => <Chip key={a.id} on={alinhV === a.id} onClick={() => setAlinhV(a.id)}>{a.label}</Chip>)}
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[0.55rem] opacity-50 mr-0.5">horizontal:</span>
        {ALINH_H.map((a) => <Chip key={a.id} on={alinhH === a.id} onClick={() => setAlinhH(a.id)}>{a.label}</Chip>)}
      </div>
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">texto</span>
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">realce</span>
          <input type="color" value={corDestaque} onChange={(e) => setCorDestaque(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
      </div>
      <button type="button" onClick={() => onSave(tipo)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a guardar…' : '💾 guardar letras + posição'}</button>
    </div>
  );
}

// PRÉ-VISUALIZAÇÃO · navega o carrossel TODO, slide a slide (‹ N/total ›). Cada tela
// 4:5 sai EXATAMENTE como vai publicar: com a SUA imagem (capa sim/não, slide sim/não),
// a SUA cor de página e o SEU tamanho de letra (lê-se de slidesImgs/slidesTip). O texto
// anima (efeito) no slide aberto para ela ver o movimento. Resolve o "só vejo a capa":
// agora abre-se o interior 1 a 1.
function PreviewBox({ peca }: { peca: Peca }) {
  const moms = peca.momentos && peca.momentos.length > 1 ? peca.momentos : [peca.texto];
  const n = moms.length;
  const [idx, setIdx] = useState(0);
  const [prog, setProg] = useState(0);
  const ef = (peca.efeito as EfeitoTexto | null) ?? undefined;
  const cur = Math.min(idx, n - 1);
  // imagem e tipografia DESTE slide (per-slide), com recuo ao global da peça.
  const imgSlide = peca.slidesImgs?.[cur] ?? (cur === 0 ? peca.imageUrl : null) ?? undefined;
  const tipSlide = { ...(peca.tipografia ?? {}), ...(peca.slidesTip?.[cur] ?? {}) } as Tipografia;
  // o texto do slide aberto anima do início ao fim, em loop, para ver o efeito.
  useEffect(() => {
    let raf = 0; let start: number | null = null;
    const dur = 3800, hold = 1100;
    const tick = (t: number) => { if (start === null) start = t; const e = (t - start) % (dur + hold); setProg(Math.min(1, e / dur)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cur]);
  return (
    <div className="px-2 pb-2 space-y-1 border-t border-white/5 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-[0.55rem] uppercase tracking-widest opacity-50">pré-visualização · {n > 1 ? 'o carrossel todo, slide a slide' : 'como vai sair'}</p>
        {n > 1 && (
          <span className="flex items-center gap-1.5 text-[0.6rem]">
            <button type="button" onClick={() => setIdx((i) => (i - 1 + n) % n)} className="px-1.5 py-0.5 rounded border border-white/20 hover:border-current" style={{ color: DZ }}>‹</button>
            <span className="tabular-nums opacity-70">{cur === 0 ? 'capa' : `slide ${cur + 1}`} · {cur + 1}/{n}</span>
            <button type="button" onClick={() => setIdx((i) => (i + 1) % n)} className="px-1.5 py-0.5 rounded border border-white/20 hover:border-current" style={{ color: DZ }}>›</button>
          </span>
        )}
      </div>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={moms[cur]} destaque={cur === 0 ? peca.destaque : []} imageUrl={imgSlide} mundo={MUNDO} prog={prog} efeito={ef} tipografia={tipSlide} {...CRESCER_SLIDE} />
      </div>
      {n > 1 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {moms.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} title={i === 0 ? 'capa' : `slide ${i + 1}`}
              className="w-5 h-5 text-[0.5rem] rounded border tabular-nums" style={i === cur ? { borderColor: DZ, background: DZ, color: BG2 } : { borderColor: 'rgba(255,255,255,0.2)', color: TX }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function LegendaBox({ legenda, hashtags, disabled, busy, onSave }: { legenda: string; hashtags: string[]; disabled: boolean; busy: boolean; onSave: (legenda: string, hashtags: string) => void }) {
  const [leg, setLeg] = useState(legenda);
  const [tags, setTags] = useState((hashtags ?? []).join(' '));
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">legenda</p>
      <textarea value={leg} onChange={(e) => setLeg(e.target.value)} rows={6} className="w-full text-[0.64rem] leading-relaxed px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: TX }} />
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">hashtags</p>
      <textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={2} className="w-full text-[0.6rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: TX }} />
      <button type="button" onClick={() => onSave(leg, tags)} disabled={disabled} className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a guardar…' : '💾 guardar legenda'}</button>
    </div>
  );
}

function AgendarBox({ agendadoEm, hora, disabled, busy, onAgendar, onDesagendar }: { agendadoEm: string | null; hora: string | null; disabled: boolean; busy: boolean; onAgendar: (data: string, hora: string) => void; onDesagendar: () => void }) {
  const [data, setData] = useState(agendadoEm ?? '');
  const [h, setH] = useState(hora ?? '20:00');
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">agendar publicação</p>
      <div className="flex gap-1">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="flex-1 text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: TX }} />
        <input type="time" value={h} onChange={(e) => setH(e.target.value)} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: TX }} />
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => onAgendar(data, h)} disabled={disabled || !data} className="flex-1 text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a agendar…' : '📅 agendar'}</button>
        {agendadoEm && <button type="button" onClick={onDesagendar} disabled={disabled} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-rose-400/40 text-rose-300 disabled:opacity-50">desagendar</button>}
      </div>
    </div>
  );
}

function EfeitoBox({ peca, disabled, busy, onSave }: { peca: Peca; disabled: boolean; busy: boolean; onSave: (efeito: EfeitoTexto) => void }) {
  const [efeito, setEfeito] = useState<EfeitoTexto>((peca.efeito as EfeitoTexto) ?? 'maquina');
  const [prog, setProg] = useState(0);
  useEffect(() => {
    let raf = 0; let start: number | null = null;
    const dur = 3800, hold = 1100;
    const tick = (t: number) => { if (start === null) start = t; const e = (t - start) % (dur + hold); setProg(Math.min(1, e / dur)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [efeito]);
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">efeito do texto (vê a animar)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={prog} efeito={efeito} tipografia={peca.tipografia ?? undefined} {...CRESCER_SLIDE} />
      </div>
      <div className="flex flex-wrap gap-1">
        {EFEITOS_TEXTO.map((ef) => <Chip key={ef.id} on={efeito === ef.id} onClick={() => setEfeito(ef.id)}>{ef.label}</Chip>)}
      </div>
      <button type="button" onClick={() => onSave(efeito)} disabled={disabled} className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a guardar…' : '💾 guardar efeito'}</button>
    </div>
  );
}

function MotionBox({ disabled, busy, onGerar }: { disabled: boolean; busy: boolean; onGerar: (opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => void }) {
  const [ing, setIng] = useState<string[]>(['natural']);
  const [cam, setCam] = useState<CamaraId>('suave');
  const [livre, setLivre] = useState('');
  const toggle = (id: string) => setIng((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">o que mexe? (escolhe tu)</p>
      <div className="flex flex-wrap gap-1">{MOTION_INGREDIENTES.map((m) => <Chip key={m.id} on={ing.includes(m.id)} onClick={() => toggle(m.id)}>{m.label}</Chip>)}</div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[0.55rem] opacity-50 mr-0.5">câmara:</span>
        {CAMARA_OPCOES.map((c) => <Chip key={c.id} on={cam === c.id} onClick={() => setCam(c.id)}>{c.label}</Chip>)}
      </div>
      <input value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="ou descreve tu o movimento…" className="w-full text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: TX }} />
      <button type="button" onClick={() => onGerar({ ingredientes: ing, camara: cam, livre })} disabled={disabled} className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a dar vida…' : '🎬 dar movimento'}</button>
    </div>
  );
}

function SomBox({ peca, disabled, busy, onGerar, onRemover }: { peca: Peca; disabled: boolean; busy: boolean; onGerar: (tipo: 'cena' | 'musica', estilo?: string) => void; onRemover: () => void }) {
  const [estilo, setEstilo] = useState<string>(peca.somEstilo ?? 'flauta');
  const tipoAtual = peca.somUrl ? (peca.somTipo ?? 'cena') : null;
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">áudio do reel</p>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {peca.somUrl && <audio src={peca.somUrl} controls className="w-full h-8" />}
      <button type="button" onClick={() => onGerar('cena')} disabled={disabled || !peca.imageUrl} className="w-full text-[0.64rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={tipoAtual === 'cena' ? { borderColor: DZ, background: DZ, color: BG2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{busy ? 'a gerar…' : '🌿 som ambiente da cena'}</button>
      <div className="rounded-lg border border-white/15 p-1.5 space-y-1">
        <p className="text-[0.55rem] opacity-55">🎵 música ambiente (instrumental)</p>
        <div className="flex flex-wrap gap-1">{MUSICA_ESTILOS.map((m) => <Chip key={m.id} on={estilo === m.id} onClick={() => setEstilo(m.id)}>{m.label}</Chip>)}</div>
        <button type="button" onClick={() => onGerar('musica', estilo)} disabled={disabled} className="w-full text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-50" style={tipoAtual === 'musica' ? { borderColor: DZ, background: DZ, color: BG2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{busy ? 'a compor…' : '🎼 gerar música'}</button>
      </div>
      {peca.somUrl && <button type="button" onClick={onRemover} disabled={disabled} className="w-full text-[0.6rem] px-2 py-1 rounded-lg border border-white/20 disabled:opacity-50">↩︎ voltar à música da loja</button>}
    </div>
  );
}

// EDITOR DE SLIDES (autonomia total): vê todos os slides, edita o TEXTO de cada um
// e põe/tira IMAGEM em cada slide (capa sim ou não, slides sim ou não).
function SlidesBox({ peca, disabled, busy, onSaveTextos, onImagem, onEstilo }: { peca: Peca; disabled: boolean; busy: boolean; onSaveTextos: (textos: string[]) => void; onImagem: (idx: number, remover: boolean) => void; onEstilo: (idx: number, tip: { tamanho?: number; corFundo?: string }) => void }) {
  const iniciais = peca.momentos && peca.momentos.length > 1 ? peca.momentos : [peca.texto];
  const [textos, setTextos] = useState<string[]>(iniciais);
  const imgs = peca.slidesImgs ?? [];
  const tips = peca.slidesTip ?? [];
  const [tams, setTams] = useState<number[]>(iniciais.map((_, i) => tips[i]?.tamanho ?? (i === 0 ? 80 : 46)));
  const [fundos, setFundos] = useState<string[]>(iniciais.map((_, i) => tips[i]?.corFundo ?? ''));
  const setT = (i: number, v: string) => setTextos((s) => s.map((x, k) => (k === i ? v : x)));
  return (
    <div className="px-2 pb-2 space-y-2 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">slides · texto, imagem, tamanho e cor da página de cada um</p>
      {textos.map((t, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-1.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.55rem] opacity-50">{i === 0 ? 'capa' : `slide ${i + 1}`}</span>
            <span className="flex gap-1">
              <button type="button" onClick={() => onImagem(i, false)} disabled={disabled} className="text-[0.56rem] px-1.5 py-0.5 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>{imgs[i] ? '🔁 imagem' : '🖼 pôr imagem'}</button>
              {imgs[i] && <button type="button" onClick={() => onImagem(i, true)} disabled={disabled} className="text-[0.56rem] px-1.5 py-0.5 rounded border border-rose-400/40 text-rose-300 disabled:opacity-40">✕ tirar</button>}
            </span>
          </div>
          {imgs[i] && <img src={imgs[i] as string} alt="" className="h-16 rounded border border-white/10" />}
          <textarea value={t} onChange={(e) => setT(i, e.target.value)} rows={i === 0 ? 2 : 4} className="w-full text-[0.64rem] leading-relaxed px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: TX }} />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1 text-[0.55rem] opacity-75">
              <span className="opacity-60">tamanho</span>
              <input type="range" min={40} max={120} step={2} value={tams[i]} onChange={(e) => setTams((s) => s.map((x, k) => (k === i ? Number(e.target.value) : x)))} className="accent-current" style={{ color: DZ, width: 90 }} />
              <span className="tabular-nums w-6 text-right">{tams[i]}</span>
            </label>
            <label className="flex items-center gap-1 text-[0.55rem] opacity-75"><span className="opacity-60">cor da página</span>
              <input type="color" value={fundos[i] || '#171310'} onChange={(e) => setFundos((s) => s.map((x, k) => (k === i ? e.target.value : x)))} className="w-6 h-5 rounded bg-transparent border border-white/15" /></label>
            {fundos[i] && <button type="button" onClick={() => setFundos((s) => s.map((x, k) => (k === i ? '' : x)))} className="text-[0.52rem] opacity-60 underline">limpar cor</button>}
            <button type="button" onClick={() => onEstilo(i, { tamanho: tams[i], corFundo: fundos[i] || undefined })} disabled={disabled} className="text-[0.55rem] px-1.5 py-0.5 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>aplicar estilo</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onSaveTextos(textos)} disabled={disabled} className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a guardar…' : '💾 guardar textos'}</button>
    </div>
  );
}

// PADRÃO (fixável): defaults aplicados a TODAS as peças novas + "aplicar aos selecionados".
type Padrao = { tipografia: Tipografia; efeito: EfeitoTexto };
const PADRAO_DEFAULT: Padrao = { tipografia: { fonte: 'serif', tamanho: 92, cor: '#F4ECDD', corDestaque: DZ, alinhV: 'centro', alinhH: 'centro' }, efeito: 'maquina' };

export default function CrescerPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [temas, setTemas] = useState<Set<TematicaId>>(new Set());
  const [fmts, setFmts] = useState<Set<FormatoId>>(new Set(['frase']));
  const [vis, setVis] = useState<Set<VisualId>>(new Set(['pessoas']));
  const [voz, setVoz] = useState<VozId>('direta'); // a voz do alcance, por defeito
  const [quantos, setQuantos] = useState(2);
  const [surpreender, setSurpreender] = useState(false);
  const [tema, setTema] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);
  const [aberto, setAberto] = useState<{ slug: string; tab: string } | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [filtroTema, setFiltroTema] = useState<string>('todos');
  const [padrao, setPadrao] = useState<Padrao>(PADRAO_DEFAULT);
  const [padraoOpen, setPadraoOpen] = useState(false);
  // agendar em lote ESPAÇADO (não encher o feed): 1 post a cada N dias, à hora.
  const [agData, setAgData] = useState('');
  const [agHora, setAgHora] = useState('20:00');
  const [agCad, setAgCad] = useState(1);

  // padrão guardado no browser dela (fixável).
  useEffect(() => {
    try { const s = localStorage.getItem('crescer-padrao'); if (s) setPadrao({ ...PADRAO_DEFAULT, ...JSON.parse(s) }); } catch { /* ignora */ }
  }, []);
  const fixarPadrao = useCallback((p: Padrao) => { setPadrao(p); try { localStorage.setItem('crescer-padrao', JSON.stringify(p)); } catch { /* ignora */ } setMsg('Padrão fixado. As peças novas saem assim (podes mudar à peça).'); }, []);

  const recarregar = useCallback(() => {
    fetch('/api/admin/crescer/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const toggle = <T,>(setS: React.Dispatch<React.SetStateAction<Set<T>>>, id: T) => setS((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const abrir = (slug: string, tab: string) => setAberto((a) => (a && a.slug === slug && a.tab === tab ? null : { slug, tab }));

  const gerar = useCallback(async () => {
    if (busy) return;
    if (!surpreender && !temas.size) { setErro('Escolhe pelo menos uma temática (ou liga o "surpreende-me").'); return; }
    setBusy(true); setErro(null);
    setMsg('A gerar o lote (texto + imagem)… pode demorar. Não feches; recarrega se precisares.');
    try {
      const r = await fetch('/api/admin/crescer/gerar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tematicas: [...temas], formatos: [...fmts], visuais: [...vis], quantos, surpreender, voz,
          tema: tema.trim() || undefined, tipografia: padrao.tipografia, efeito: padrao.efeito,
        }),
      });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} peça(s) gerada(s)${j.detalhe ? ` (aviso: ${j.detalhe})` : ''}. Revê em baixo, afina e renderiza.`);
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); } finally { setBusy(false); }
  }, [busy, surpreender, temas, fmts, vis, voz, quantos, tema, padrao, recarregar]);

  // acção numa peça (rota genérica)
  const acao = useCallback(async (slug: string, url: string, body: Record<string, unknown>, aviso: string, ok: string, fechar = true) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg(aviso);
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...body }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg(ok); if (fechar) setAberto(null); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const renderizar = useCallback((slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Disparar o RENDER FINAL (MP4)? Demora alguns minutos (GitHub Actions).')) return;
    acao(slug, '/api/admin/carrossel/render-dispatch', { dias: '1' }, 'A disparar o render…', 'Render disparado. O MP4 aparece daqui a uns minutos.', false);
  }, [acao]);
  const apagar = useCallback((slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar esta peça?')) return;
    acao(slug, '/api/admin/crescer/apagar', {}, 'A descartar…', 'Descartada.');
  }, [acao]);
  // CARROSSEL DE IMAGENS: gera cada slide como tela 4:5 (sem MP4), para publicar à
  // mão como carrossel (capa com imagem + telas de texto que se deslizam).
  const carrossel = useCallback((slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Gerar o CARROSSEL de imagens (telas 4:5, sem motion)? Corre nos GitHub Actions, uns minutos.')) return;
    acao(slug, '/api/admin/carrossel/render-dispatch', { dias: '1', modo: 'carrossel' }, 'A gerar o carrossel de imagens…', 'Carrossel disparado. As imagens aparecem daqui a uns minutos (recarrega).', false);
  }, [acao]);
  // VÍDEO CINEMATOGRÁFICO (cenas sequenciadas): traz a IMAGEM a movimento contínuo
  // (~40s, clips Kling encadeados pelo último frame). Precisa de imagem. Depois é
  // "render (reel)" para pôr o texto por cima. Usa o disparo partilhado do reel
  // narrativo (slug-agnóstico). Resultado em theme.soulab.clipUrl (o player mostra-o).
  const cenaVideo = useCallback((slug: string, temImagem: boolean) => {
    if (!temImagem) { setErro('A cena precisa de imagem. Gera a imagem primeiro.'); return; }
    if (typeof window !== 'undefined' && !window.confirm('Trazer a imagem a MOVIMENTO cinematográfico (vídeo contínuo ~40s)? Corre nos GitHub Actions, uns minutos, e tem custo. Depois carrega "render (reel)" para pôr o texto por cima.')) return;
    acao(slug, '/api/admin/metodo-vs/reel-narrativo-dispatch', { nClips: 4, dur: 10 }, 'A trazer a cena a movimento (uns minutos)…', 'Cena a ganhar vida. O vídeo aparece daqui a uns minutos (recarrega); depois "render (reel)" para o texto por cima.', false);
  }, [acao]);
  // editor de slides: guardar os textos de todos os slides + imagem por slide.
  const salvarTextos = useCallback((slug: string, textos: string[]) => acao(slug, '/api/admin/crescer/texto', { textos }, 'A guardar os textos…', 'Textos guardados. Re-renderiza para os veres no carrossel/vídeo.', false), [acao]);
  const imagemSlide = useCallback((slug: string, idx: number, remover: boolean) => acao(slug, '/api/admin/crescer/imagem', { idx, remover }, remover ? 'A tirar a imagem do slide…' : 'A gerar a imagem do slide (Flux)…', remover ? 'Imagem tirada do slide.' : 'Imagem do slide gerada.', false), [acao]);
  const salvarEstilo = useCallback((slug: string, idx: number, tip: { tamanho?: number; corFundo?: string }) => acao(slug, '/api/admin/crescer/slide-estilo', { idx, tipografia: tip }, 'A aplicar o estilo do slide…', 'Estilo do slide aplicado.', false), [acao]);

  // ── seleção múltipla + lote ──
  const toggleSel = useCallback((slug: string) => setSel((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; }), []);
  const emLote = useCallback(async (faz: (slug: string) => Promise<Response>, etiqueta: string, podePublicada = true) => {
    if (acaoSlug || busy || !sel.size) return;
    const alvos = pecas.filter((p) => sel.has(p.slug) && (podePublicada || !p.publicado)).map((p) => p.slug);
    if (!alvos.length) { setSel(new Set()); return; }
    setBusy(true); setErro(null); setMsg(`${etiqueta} · 0/${alvos.length}…`);
    let feitos = 0;
    for (const slug of alvos) { try { const r = await faz(slug); if (r.ok) feitos++; } catch { /* segue */ } setMsg(`${etiqueta} · ${feitos}/${alvos.length}…`); }
    setMsg(`${etiqueta}: ${feitos}/${alvos.length} feito(s).`); setSel(new Set()); setBusy(false); recarregar();
  }, [acaoSlug, busy, sel, pecas, recarregar]);

  const padraoLote = useCallback(() => emLote((slug) => fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, tipografia: padrao.tipografia, efeito: padrao.efeito }) }), 'A aplicar o padrão'), [emLote, padrao]);
  const imagemLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Trocar a imagem das ${sel.size} selecionada(s)?`)) return; return emLote((slug) => fetch('/api/admin/crescer/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }), 'A trocar imagem'); }, [emLote, sel]);
  const renderLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Renderizar (MP4) as ${sel.size} selecionada(s)? Minutos, GitHub Actions.`)) return; return emLote((slug) => fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) }), 'A disparar render'); }, [emLote, sel]);
  const apagarLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Descartar ${sel.size} selecionada(s)? (salta publicadas)`)) return; return emLote((slug) => fetch('/api/admin/crescer/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }), 'A descartar', false); }, [emLote, sel]);
  // AGENDAR ESPAÇADO: distribui as selecionadas 1 a cada N dias, desde a data, à
  // hora, e aprova (publica-se sozinho à hora, como na Soulab). Assim o feed NÃO
  // enche: filtra por temática e agenda cada categoria no seu ritmo. Datas em
  // componentes LOCAIS (nunca toISOString, que recua um dia em PT).
  const agendarEspacado = useCallback(async () => {
    if (acaoSlug || busy) return;
    if (!agData) { setErro('Escolhe a data de início do agendamento espaçado.'); return; }
    const alvos = pecas.filter((p) => sel.has(p.slug) && !p.publicado).map((p) => p.slug);
    if (!alvos.length) { setSel(new Set()); return; }
    const [Y, M, D] = agData.split('-').map(Number);
    const passo = Math.max(1, agCad);
    setBusy(true); setErro(null);
    let feitos = 0;
    for (let i = 0; i < alvos.length; i++) {
      const dt = new Date(Y, (M ?? 1) - 1, D ?? 1); dt.setDate(dt.getDate() + i * passo);
      const data = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      setMsg(`A agendar espaçado · ${feitos}/${alvos.length}…`);
      try {
        const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: alvos[i], agendadoEm: data, hora: agHora || '20:00', aprovado: true }) });
        if (r.ok) feitos++;
      } catch { /* segue */ }
    }
    setMsg(`Agendado espaçado: ${feitos}/${alvos.length} (1 a cada ${passo} dia(s) desde ${agData}, às ${agHora}). Publica-se sozinho à hora.`);
    setSel(new Set()); setBusy(false); recarregar();
  }, [acaoSlug, busy, agData, agHora, agCad, pecas, sel, recarregar]);

  const pecasFiltradas = pecas.filter((p) => filtroTema === 'todos' || p.tematica === filtroTema);

  return (
    <main className={`${FONTS} min-h-screen px-4 py-8 md:px-8`} style={{ background: BG2, color: TX }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: CRESCER.paleta.bg }}>
          <h1 className="text-2xl flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant), serif', color: DZ }}>
            <span>{CRESCER.emoji}</span> {CRESCER.nome} <span className="opacity-70 text-base" style={{ color: TX }}>· @{CRESCER.handle}</span>
          </h1>
          <p className="mt-2 text-[0.92rem] italic opacity-90" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{CRESCER.posicionamento}</p>
          <Link href="/admin/publicar?conta=loja" className="mt-3 inline-block px-3 py-1.5 rounded-lg border border-white/20 text-[0.74rem] hover:bg-white/10">abrir no Publicar →</Link>
        </header>

        {/* gerar */}
        <section className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">gerar um lote</h2>

          <p className="text-[0.62rem] uppercase tracking-widest opacity-50 mb-1.5">temáticas <span className="opacity-50">(escolhe várias)</span></p>
          <div className="flex flex-wrap gap-1.5 mb-3">{TEMATICAS.map((t) => <Chip key={t.id} on={temas.has(t.id)} onClick={() => toggle(setTemas, t.id)} title={t.descricao}><span className="mr-1">{t.emoji}</span>{t.label}</Chip>)}</div>

          <p className="text-[0.62rem] uppercase tracking-widest opacity-50 mb-1.5">formatos</p>
          <div className="flex flex-wrap gap-1.5 mb-3">{FORMATOS.map((f) => <Chip key={f.id} on={fmts.has(f.id)} onClick={() => toggle(setFmts, f.id)} title={f.descricao}><span className="mr-1">{f.emoji}</span>{f.label}</Chip>)}</div>

          <p className="text-[0.62rem] uppercase tracking-widest opacity-50 mb-1.5">visuais</p>
          <div className="flex flex-wrap gap-1.5 mb-3">{VISUAIS.map((v) => <Chip key={v.id} on={vis.has(v.id)} onClick={() => toggle(setVis, v.id)} title={v.descricao}><span className="mr-1">{v.emoji}</span>{v.label}</Chip>)}</div>

          <p className="text-[0.62rem] uppercase tracking-widest opacity-50 mb-1.5">voz <span className="opacity-50">(a direta é a do alcance)</span></p>
          <div className="flex flex-wrap gap-1.5 mb-3">{VOZES.map((v) => <Chip key={v.id} on={voz === v.id} onClick={() => setVoz(v.id)} title={v.descricao}><span className="mr-1">{v.emoji}</span>{v.label}</Chip>)}</div>

          <div className="flex flex-wrap items-center gap-2">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="tema livre (opcional)" className="flex-1 min-w-[180px] text-[0.82rem] px-3 py-2 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: TX }} />
            <Chip on={surpreender} onClick={() => setSurpreender((s) => !s)} title="ignora as escolhas e combina ao acaso">🎲 surpreende-me</Chip>
            <label className="inline-flex items-center gap-1.5 text-[0.74rem] opacity-80">quantas:
              <select value={quantos} onChange={(e) => setQuantos(Number(e.target.value))} className="bg-black/20 border border-white/15 rounded-md px-2 py-1.5 [color-scheme:dark]">
                {[1, 2, 3, 4, 5, 6, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button onClick={gerar} disabled={busy} className="px-4 py-2 rounded-lg border disabled:opacity-50 text-[0.84rem]" style={{ borderColor: DZ, background: DZ, color: BG2 }}>{busy ? 'a gerar…' : '🌱 gerar'}</button>
          </div>
          <p className="text-[0.6rem] opacity-45 mt-2">Sem seleção, escolhe combinações ao acaso. Máximo 8 peças por lote (carrega outra vez para mais).</p>

          {/* PADRÃO fixável */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <button onClick={() => setPadraoOpen((o) => !o)} className="text-[0.72rem] px-2.5 py-1 rounded-lg border border-white/20">⚙ padrão {padraoOpen ? '▴' : '▾'}</button>
            {padraoOpen && (
              <div className="mt-2 rounded-xl border border-white/10 p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[0.62rem] opacity-60 mb-2">A base de TODAS as peças novas (podes sempre mudar à peça). Fixa as letras, a posição e o efeito.</p>
                <PadraoEditor padrao={padrao} onFixar={fixarPadrao} />
              </div>
            )}
          </div>
        </section>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {/* peças */}
        <section>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-2">peças <span className="opacity-40">· {pecas.length}</span></h2>

          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Chip on={filtroTema === 'todos'} onClick={() => setFiltroTema('todos')}>todas</Chip>
            {TEMATICAS.map((t) => <Chip key={t.id} on={filtroTema === t.id} onClick={() => setFiltroTema(t.id)} title={t.label}>{t.emoji}</Chip>)}
          </div>

          {pecas.length === 0 && <p className="text-[0.78rem] opacity-50">Ainda nada. Escolhe temáticas e formatos e carrega &quot;gerar&quot;.</p>}

          {sel.size > 0 && (
            <div className="sticky top-2 z-30 mb-3 rounded-xl border p-2.5 flex items-center gap-1.5 flex-wrap" style={{ borderColor: DZ, background: 'rgba(20,16,12,0.96)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              <span className="text-[0.72rem] font-medium" style={{ color: DZ }}>{sel.size} selecionada(s)</span>
              <button onClick={() => setSel(new Set())} className="text-[0.58rem] px-1.5 py-0.5 rounded-lg border border-white/20 opacity-75">limpar</button>
              <span className="opacity-30">·</span>
              <button onClick={padraoLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }} title="aplica as letras/posição/efeito do padrão">⚙ aplicar padrão</button>
              <button onClick={imagemLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">🖼 imagem</button>
              <button onClick={renderLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">🎞 render</button>
              <button onClick={apagarLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-rose-400/50 text-rose-300 disabled:opacity-40">🗑 descartar</button>
              <span className="w-full h-px bg-white/10 my-0.5" />
              {/* agendar espaçado: 1 a cada N dias (não encher o feed) */}
              <span className="text-[0.58rem] opacity-60">agendar espaçado:</span>
              <input type="date" value={agData} onChange={(e) => setAgData(e.target.value)} className="text-[0.58rem] px-1 py-0.5 rounded border border-white/20 bg-black/30 [color-scheme:dark]" style={{ color: TX }} />
              <input type="time" value={agHora} onChange={(e) => setAgHora(e.target.value)} className="text-[0.58rem] px-1 py-0.5 rounded border border-white/20 bg-black/30 [color-scheme:dark]" style={{ color: TX }} />
              <label className="text-[0.58rem] opacity-75 flex items-center gap-1">1 a cada
                <select value={agCad} onChange={(e) => setAgCad(Number(e.target.value))} className="bg-black/30 border border-white/20 rounded px-1 py-0.5 [color-scheme:dark]">
                  {[1, 2, 3, 4, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                dia(s)
              </label>
              <button onClick={agendarEspacado} disabled={busy || !agData} className="text-[0.6rem] px-1.5 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }} title="distribui as selecionadas 1 a cada N dias e aprova; publica-se sozinho à hora (filtra por temática para espaçar cada categoria)">📅 agendar espaçado</button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pecasFiltradas.map((p) => {
              const ab = aberto?.slug === p.slug ? aberto.tab : null;
              const tBusy = acaoSlug === p.slug;
              return (
                <div key={p.slug} className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderColor: sel.has(p.slug) ? DZ : 'rgba(255,255,255,0.1)' }}>
                  <div className="relative">
                    <KineticSlide texto={p.texto} destaque={p.destaque} imageUrl={p.imageUrl ?? undefined} mundo={MUNDO} prog={1} tipografia={p.tipografia ?? undefined} {...CRESCER_SLIDE} />
                    <button onClick={() => toggleSel(p.slug)} className="absolute bottom-1 left-1 w-6 h-6 rounded-md border flex items-center justify-center text-[0.7rem] z-10" style={sel.has(p.slug) ? { background: DZ, borderColor: DZ, color: BG2 } : { background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.5)', color: 'transparent' }}>✓</button>
                    <span className="absolute top-1 left-1 text-[0.5rem] px-1 py-0.5 rounded bg-black/60">{p.tematica ?? 'crescer'}{p.momentos && p.momentos.length > 1 ? ` · ${p.momentos.length}❑` : ''}</span>
                    {p.publicado
                      ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5">✓ publicado</span>
                      : p.videoUrl
                        ? <span className="absolute top-1 right-1 text-[0.5rem] bg-sky-600/80 text-white rounded px-1 py-0.5">✅ MP4</span>
                        : p.clipUrl
                          ? <span className="absolute top-1 right-1 text-[0.5rem] rounded px-1 py-0.5" style={{ background: DZ, color: BG2 }}>🎬 por renderizar</span>
                          : <span className="absolute top-1 right-1 text-[0.5rem] bg-amber-600/80 text-white rounded px-1 py-0.5">por renderizar</span>}
                  </div>
                  {p.clipUrl && (
                    <div className="px-2 pt-2">
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video src={p.clipUrl} controls loop muted playsInline className="w-full rounded-lg border border-white/10" />
                    </div>
                  )}
                  {p.imagens && p.imagens.length > 0 && (
                    <div className="px-2 pt-2">
                      <p className="text-[0.55rem] uppercase tracking-widest opacity-50 mb-1">carrossel · {p.imagens.length} telas (agenda e publica-se sozinho)</p>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {p.imagens.map((u, i) => (
                          <a key={i} href={u} target="_blank" rel="noreferrer" className="shrink-0" title={`tela ${i + 1} · abrir/baixar`}>
                            <img src={u} alt="" className="h-28 rounded border border-white/10" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-2 flex flex-wrap gap-1 text-[0.62rem]">
                    <button onClick={() => abrir(p.slug, 'preview')} disabled={tBusy} className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>▶ pré-ver</button>
                    <button onClick={() => abrir(p.slug, 'slides')} disabled={tBusy} title="ver todos os slides, editar o texto e pôr/tirar imagem em cada um" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>📝 slides</button>
                    <button onClick={() => acao(p.slug, '/api/admin/crescer/imagem', {}, 'A trocar a imagem (Flux)…', 'Imagem nova.', false)} disabled={tBusy} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">imagem</button>
                    <button onClick={() => abrir(p.slug, 'motion')} disabled={tBusy || !p.imageUrl} className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>🎬 mov.</button>
                    <button onClick={() => cenaVideo(p.slug, !!p.imageUrl)} disabled={tBusy || !p.imageUrl} title="vídeo cinematográfico: traz a imagem a movimento contínuo (~40s). Depois render (reel) para o texto por cima." className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>🎞 cena</button>
                    <button onClick={() => abrir(p.slug, 'efeito')} disabled={tBusy} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">✶ efeito</button>
                    <button onClick={() => abrir(p.slug, 'som')} disabled={tBusy} className="px-2 py-1 rounded border disabled:opacity-40" style={p.somUrl ? { borderColor: DZ, color: DZ } : { borderColor: 'rgba(255,255,255,0.2)' }}>🔊 áudio</button>
                    <button onClick={() => abrir(p.slug, 'letras')} disabled={tBusy} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">🅰 letras</button>
                    <button onClick={() => abrir(p.slug, 'legenda')} disabled={tBusy} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">📝 legenda</button>
                    <button onClick={() => abrir(p.slug, 'agenda')} disabled={tBusy} className="px-2 py-1 rounded border disabled:opacity-40" style={p.agendadoEm ? { borderColor: DZ, color: DZ } : { borderColor: 'rgba(255,255,255,0.2)' }}>📅 {p.agendadoEm ? p.agendadoEm.slice(5) : 'agendar'}</button>
                    {p.momentos && p.momentos.length > 1 && <button onClick={() => carrossel(p.slug)} disabled={tBusy} title="gera as telas 4:5 para publicar como carrossel de imagens" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: DZ, color: DZ }}>🖼 carrossel</button>}
                    <button onClick={() => renderizar(p.slug)} disabled={tBusy} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">render (reel)</button>
                    {!p.publicado && <button onClick={() => apagar(p.slug)} className="px-2 py-1 rounded border border-rose-400/40 text-rose-300">descartar</button>}
                  </div>
                  {ab === 'preview' && <PreviewBox peca={p} />}
                  {ab === 'slides' && <SlidesBox peca={p} busy={tBusy} disabled={tBusy} onSaveTextos={(t) => salvarTextos(p.slug, t)} onImagem={(idx, rem) => imagemSlide(p.slug, idx, rem)} onEstilo={(idx, tip) => salvarEstilo(p.slug, idx, tip)} />}
                  {ab === 'motion' && <MotionBox busy={tBusy} disabled={tBusy} onGerar={(opts) => acao(p.slug, '/api/admin/soulab/motion', opts, 'A dar vida à imagem (Kling)… 1-3 min.', 'Movimento gerado.')} />}
                  {ab === 'efeito' && <EfeitoBox peca={p} busy={tBusy} disabled={tBusy} onSave={(ef) => acao(p.slug, '/api/admin/soulab/editar', { efeito: ef }, 'A guardar o efeito…', 'Efeito guardado.')} />}
                  {ab === 'som' && <SomBox peca={p} busy={tBusy} disabled={tBusy} onGerar={(tipo, estilo) => acao(p.slug, '/api/admin/soulab/som', { tipo, estilo }, 'A gerar o áudio…', 'Áudio gerado.', false)} onRemover={() => acao(p.slug, '/api/admin/soulab/som', { remover: true }, 'A remover o áudio…', 'Áudio removido.', false)} />}
                  {ab === 'letras' && <TipografiaBox peca={p} busy={tBusy} disabled={tBusy} onSave={(t) => acao(p.slug, '/api/admin/soulab/editar', { tipografia: t }, 'A guardar letras + posição…', 'Guardado.')} />}
                  {ab === 'legenda' && <LegendaBox legenda={p.legenda ?? ''} hashtags={p.hashtags} busy={tBusy} disabled={tBusy} onSave={(leg, tags) => acao(p.slug, '/api/admin/soulab/editar', { legenda: leg, hashtags: tags }, 'A guardar a legenda…', 'Legenda guardada.')} />}
                  {ab === 'agenda' && <AgendarBox agendadoEm={p.agendadoEm} hora={p.hora} busy={tBusy} disabled={tBusy} onAgendar={(data, h) => acao(p.slug, '/api/admin/conteudos/agendar', { agendadoEm: data, hora: h || '20:00', aprovado: true }, 'A agendar…', 'Agendada.')} onDesagendar={() => acao(p.slug, '/api/admin/conteudos/agendar', { agendadoEm: null, aprovado: false }, 'A desagendar…', 'Desagendada.')} />}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

// editor do PADRÃO (mesmas escolhas da peça, mas guarda no browser e fixa o default)
function PadraoEditor({ padrao, onFixar }: { padrao: Padrao; onFixar: (p: Padrao) => void }) {
  const t0 = padrao.tipografia;
  const [fonte, setFonte] = useState<FonteTexto>((t0.fonte as FonteTexto) ?? 'serif');
  const [tamanho, setTamanho] = useState<number>(t0.tamanho ?? 92);
  const [cor, setCor] = useState<string>(t0.cor ?? '#F4ECDD');
  const [corDestaque, setCorDestaque] = useState<string>(t0.corDestaque ?? DZ);
  const [alinhV, setAlinhV] = useState<AlinhV>((t0.alinhV as AlinhV) ?? 'centro');
  const [alinhH, setAlinhH] = useState<AlinhH>((t0.alinhH as AlinhH) ?? 'centro');
  const [efeito, setEfeito] = useState<EfeitoTexto>(padrao.efeito ?? 'maquina');
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 items-center"><span className="text-[0.55rem] opacity-50 mr-0.5">fonte:</span>{FONTES_TEXTO.map((f) => <Chip key={f.id} on={fonte === f.id} onClick={() => setFonte(f.id)}>{f.label}</Chip>)}</div>
      <label className="flex items-center gap-2 text-[0.6rem] opacity-80"><span className="opacity-60">tamanho</span>
        <input type="range" min={56} max={128} step={2} value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))} className="flex-1 accent-current" style={{ color: DZ }} /><span className="tabular-nums w-7 text-right">{tamanho}</span></label>
      <div className="flex flex-wrap gap-1 items-center"><span className="text-[0.55rem] opacity-50 mr-0.5">vertical:</span>{ALINH_V.map((a) => <Chip key={a.id} on={alinhV === a.id} onClick={() => setAlinhV(a.id)}>{a.label}</Chip>)}</div>
      <div className="flex flex-wrap gap-1 items-center"><span className="text-[0.55rem] opacity-50 mr-0.5">horizontal:</span>{ALINH_H.map((a) => <Chip key={a.id} on={alinhH === a.id} onClick={() => setAlinhH(a.id)}>{a.label}</Chip>)}</div>
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">texto</span><input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">realce</span><input type="color" value={corDestaque} onChange={(e) => setCorDestaque(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
      </div>
      <div className="flex flex-wrap gap-1 items-center"><span className="text-[0.55rem] opacity-50 mr-0.5">efeito:</span>{EFEITOS_TEXTO.map((ef) => <Chip key={ef.id} on={efeito === ef.id} onClick={() => setEfeito(ef.id)}>{ef.label}</Chip>)}</div>
      <button type="button" onClick={() => onFixar({ tipografia: { fonte, tamanho, cor, corDestaque, alinhV, alinhH }, efeito })} className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border" style={{ borderColor: DZ, background: DZ, color: BG2 }}>📌 fixar padrão</button>
    </div>
  );
}
