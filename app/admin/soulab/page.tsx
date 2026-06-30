'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { KineticSlide, EFEITOS_TEXTO, FONTES_TEXTO, type EfeitoTexto, type FonteTexto, type Tipografia } from '@/components/admin/KineticSlide';
import type { Mundo } from '@/lib/estudio-conteudo';
import { SOULAB, TIPOS_SOULAB, SOULAB_MUNDO, SOULAB_SLIDE, sementeAleatoria, type TipoSoulabId } from '@/lib/soulab/marca';
import { MOTION_INGREDIENTES, CAMARA_OPCOES, type CamaraId } from '@/lib/soulab/motion';
import { MUSICA_ESTILOS } from '@/lib/soulab/musica';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

const MUNDO = SOULAB_MUNDO as Mundo; // a paleta 'soulab' vive em PALETAS (Record<string>)

type Peca = {
  slug: string; tipo: string | null; texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; clipUrl: string | null; somUrl: string | null; somTipo: string | null; somEstilo: string | null; legenda: string | null;
  hashtags: string[]; fundoPrompt: string | null; efeito: string | null; tipografia: Tipografia | null;
  segPorMomento: number | null;
  formato: string; momentos: string[] | null;
  parteDe: string | null; parte: number | null; // série: continuação de um fio
  veiaTitulo?: string | null; veiaLivro?: string | null; // de que secção do livro foi minerada
  agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null;
};

// O COMPOSITOR DE MOVIMENTO (autonomia): ela escolhe o que mexe — câmara e/ou
// elementos (água, folhagem, pássaro…) — ou descreve por palavras dela. Estado
// local por cartão; só ao carregar "dar movimento" é que chama o Kling.
function MotionBox({ disabled, busy, onGerar }: { disabled: boolean; busy: boolean; onGerar: (opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => void }) {
  const [ing, setIng] = useState<string[]>(['natural']); // por defeito anima o que está na imagem (não só câmara)
  const [cam, setCam] = useState<CamaraId>('suave');
  const [livre, setLivre] = useState('');
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  const toggle = (id: string) => setIng((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">o que mexe? (escolhe tu)</p>
      <div className="flex flex-wrap gap-1">
        {MOTION_INGREDIENTES.map((m) => {
          const on = ing.includes(m.id);
          return (
            <button key={m.id} type="button" onClick={() => toggle(m.id)}
              className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
              style={on ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{m.label}</button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[0.55rem] opacity-50 mr-0.5">câmara:</span>
        {CAMARA_OPCOES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCam(c.id)}
            className="text-[0.56rem] px-1.5 py-0.5 rounded border"
            style={cam === c.id ? { borderColor: dz, color: dz } : { borderColor: 'rgba(255,255,255,0.15)', opacity: 0.7 }}>{c.label}</button>
        ))}
      </div>
      <input value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="ou descreve tu o movimento…"
        className="w-full text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
      <button type="button" onClick={() => onGerar({ ingredientes: ing, camara: cam, livre })} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50"
        style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a dar vida…' : '🎬 dar movimento'}</button>
    </div>
  );
}

// A LEGENDA + HASHTAGS à vista e editáveis (autonomia: ela mexe no texto do post).
// O CTA leve vem já na legenda gerada; aqui ela afina à mão.
function LegendaBox({ legenda, hashtags, disabled, busy, onSave }: { legenda: string; hashtags: string[]; disabled: boolean; busy: boolean; onSave: (legenda: string, hashtags: string) => void }) {
  const [leg, setLeg] = useState(legenda);
  const [tags, setTags] = useState((hashtags ?? []).join(' '));
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">legenda (o CTA leve está no fim)</p>
      <textarea value={leg} onChange={(e) => setLeg(e.target.value)} rows={6}
        className="w-full text-[0.64rem] leading-relaxed px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">hashtags</p>
      <textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={2}
        className="w-full text-[0.6rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
      <button type="button" onClick={() => onSave(leg, tags)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50"
        style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar legenda'}</button>
    </div>
  );
}

// AGENDAR (autonomia): data + hora no próprio cartão. Ao agendar, marca aprovado
// (a trava do cron) — depois publica-se sozinha à hora, e o vídeo prepara-se só.
function AgendarBox({ agendadoEm, hora, disabled, busy, onAgendar, onDesagendar }: { agendadoEm: string | null; hora: string | null; disabled: boolean; busy: boolean; onAgendar: (data: string, hora: string) => void; onDesagendar: () => void }) {
  const [data, setData] = useState(agendadoEm ?? '');
  const [h, setH] = useState(hora ?? '13:00');
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">agendar publicação</p>
      <div className="flex gap-1">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="flex-1 text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: SOULAB.paleta.texto }} />
        <input type="time" value={h} onChange={(e) => setH(e.target.value)} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: SOULAB.paleta.texto }} />
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => onAgendar(data, h)} disabled={disabled || !data}
          className="flex-1 text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a agendar…' : '📅 agendar'}</button>
        {agendadoEm && <button type="button" onClick={onDesagendar} disabled={disabled} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-rose-400/40 text-rose-300 disabled:opacity-50">desagendar</button>}
      </div>
      <p className="text-[0.52rem] opacity-45 leading-snug">Publica-se sozinha à hora marcada; o vídeo é preparado automaticamente. A hora é no teu fuso.</p>
    </div>
  );
}

// O EFEITO DO TEXTO (autonomia): ela escolhe como a frase se revela e VÊ-O a
// animar em loop (a pré-visualização corre prog 0→1). O render usa o efeito guardado.
function EfeitoBox({ peca, disabled, busy, onSave }: { peca: Peca; disabled: boolean; busy: boolean; onSave: (efeito: EfeitoTexto) => void }) {
  const [efeito, setEfeito] = useState<EfeitoTexto>((peca.efeito as EfeitoTexto) ?? 'maquina');
  const [prog, setProg] = useState(0);
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  useEffect(() => {
    let raf = 0; let start: number | null = null;
    const dur = 3800, hold = 1100; // anima e segura, depois repete
    const tick = (t: number) => {
      if (start === null) start = t;
      const e = (t - start) % (dur + hold);
      setProg(Math.min(1, e / dur));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [efeito]);
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">efeito do texto (vê a animar)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={prog} efeito={efeito} {...SOULAB_SLIDE} />
      </div>
      <div className="flex flex-wrap gap-1">
        {EFEITOS_TEXTO.map((ef) => (
          <button key={ef.id} type="button" onClick={() => setEfeito(ef.id)}
            className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
            style={efeito === ef.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{ef.label}</button>
        ))}
      </div>
      <button type="button" onClick={() => onSave(efeito)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50"
        style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar efeito'}</button>
    </div>
  );
}

// O ÁUDIO DO REEL (autonomia): DUAS fontes à escolha dela, ambas viram o áudio do
// render. (1) som ambiente FEITO DA CENA (a partir da imagem); (2) MÚSICA ambiente
// instrumental (flauta/piano…). Ouve aqui; "remover" volta à música da loja.
function SomBox({ peca, disabled, busy, onGerar, onRemover }: { peca: Peca; disabled: boolean; busy: boolean; onGerar: (tipo: 'cena' | 'musica', estilo?: string) => void; onRemover: () => void }) {
  const [estilo, setEstilo] = useState<string>(peca.somEstilo ?? 'flauta');
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  const tipoAtual = peca.somUrl ? (peca.somTipo ?? 'cena') : null;
  const nomeTipo = tipoAtual === 'musica' ? `música · ${peca.somEstilo ?? ''}` : tipoAtual === 'cena' ? 'som da cena' : '';
  return (
    <div className="px-2 pb-2 space-y-1.5 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">áudio do reel {tipoAtual && <span style={{ color: dz }}>· {nomeTipo}</span>}</p>
      {peca.somUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio src={peca.somUrl} controls className="w-full h-8" />
      )}

      {/* 1 · som da cena (a partir da imagem) */}
      <button type="button" onClick={() => onGerar('cena')} disabled={disabled || !peca.imageUrl}
        className="w-full text-[0.64rem] px-2 py-1.5 rounded-lg border disabled:opacity-50"
        style={tipoAtual === 'cena' ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>
        {busy ? 'a gerar…' : '🌿 som ambiente da cena'}
      </button>

      {/* 2 · música ambiente (flauta/piano…) */}
      <div className="rounded-lg border border-white/15 p-1.5 space-y-1">
        <p className="text-[0.55rem] opacity-55">🎵 música ambiente (instrumental)</p>
        <div className="flex flex-wrap gap-1">
          {MUSICA_ESTILOS.map((m) => (
            <button key={m.id} type="button" onClick={() => setEstilo(m.id)}
              className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
              style={estilo === m.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{m.label}</button>
          ))}
        </div>
        <button type="button" onClick={() => onGerar('musica', estilo)} disabled={disabled}
          className="w-full text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-50"
          style={tipoAtual === 'musica' ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>
          {busy ? 'a compor…' : `🎼 gerar música · ${MUSICA_ESTILOS.find((m) => m.id === estilo)?.label ?? estilo}`}
        </button>
      </div>

      {peca.somUrl && <button type="button" onClick={onRemover} disabled={disabled} className="w-full text-[0.6rem] px-2 py-1 rounded-lg border border-white/20 disabled:opacity-50">↩︎ voltar à música da loja</button>}
      <p className="text-[0.52rem] opacity-45 leading-snug">Sem áudio próprio, o render usa a música da loja. A música é instrumental (flauta, piano…), não a Ancient Ground.</p>
    </div>
  );
}

// EDITOR DE TIPOGRAFIA (autonomia): fonte, tamanho e cores das letras, com
// pré-visualização ao vivo (a frase completa). O render usa o que ela guardar.
function TipografiaBox({ peca, disabled, busy, onSave }: { peca: Peca; disabled: boolean; busy: boolean; onSave: (t: Tipografia) => void }) {
  const t0 = peca.tipografia ?? {};
  const [fonte, setFonte] = useState<FonteTexto>((t0.fonte as FonteTexto) ?? 'serif');
  const [tamanho, setTamanho] = useState<number>(t0.tamanho ?? 92);
  const [cor, setCor] = useState<string>(t0.cor ?? '#F4ECDD');
  const [corDestaque, setCorDestaque] = useState<string>(t0.corDestaque ?? SOULAB.paleta.destaque);
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  const tipo: Tipografia = { fonte, tamanho, cor, corDestaque };
  return (
    <div className="px-2 pb-2 space-y-2 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">tipografia (vê ao vivo)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={1} tipografia={tipo} {...SOULAB_SLIDE} />
      </div>
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[0.55rem] opacity-50 mr-0.5">fonte:</span>
        {FONTES_TEXTO.map((f) => (
          <button key={f.id} type="button" onClick={() => setFonte(f.id)} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
            style={fonte === f.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{f.label}</button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-[0.6rem] opacity-80">
        <span className="opacity-60">tamanho</span>
        <input type="range" min={56} max={128} step={2} value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))} className="flex-1 accent-current" style={{ color: dz }} />
        <span className="tabular-nums w-7 text-right">{tamanho}</span>
      </label>
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">texto</span>
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
        <label className="flex items-center gap-1.5 text-[0.6rem] opacity-80"><span className="opacity-60">realce</span>
          <input type="color" value={corDestaque} onChange={(e) => setCorDestaque(e.target.value)} className="w-7 h-6 rounded bg-transparent border border-white/15" /></label>
      </div>
      <button type="button" onClick={() => onSave(tipo)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar tipografia'}</button>
    </div>
  );
}

// PRÉ-VISUALIZAÇÃO do reel (ver ANTES de renderizar): anima prog 0→1 em loop, com
// o efeito + tipografia da peça. Se for "vários momentos", sequencia-os (crossfade),
// como o render vai fazer. Assim ela vê como sai SEM gastar um render.
//
// O TEMPO POR MOMENTO é ESCOLHA DELA (slider): o preview anima a esse ritmo E o
// render usa o MESMO valor (slides[0].segPorMomento) — o que vê é o que sai.
function PreviewBox({ peca, disabled, busy, onSaveTempo }: { peca: Peca; disabled: boolean; busy: boolean; onSaveTempo: (seg: number) => void }) {
  const [prog, setProg] = useState(0);
  const moms = peca.momentos && peca.momentos.length > 1 ? peca.momentos : null;
  const ef = (peca.efeito as EfeitoTexto | null) ?? undefined;
  const tip = peca.tipografia ?? undefined;
  const [seg, setSeg] = useState<number>(peca.segPorMomento ?? 5.5);
  const dz = SOULAB.paleta.destaque, bg2 = SOULAB.paleta.bg2;
  useEffect(() => {
    let raf = 0; let start: number | null = null;
    const dur = (moms?.length ?? 1) * seg * 1000, hold = 1200; // MESMO ritmo do render (seg/momento)
    const tick = (t: number) => { if (start === null) start = t; const e = (t - start) % (dur + hold); setProg(Math.min(1, e / dur)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moms, seg]);
  return (
    <div className="px-2 pb-2 space-y-1 border-t border-white/5 pt-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">pré-visualização · como vai sair no reel (ver antes de renderizar)</p>
      {moms ? (
        <div style={{ position: 'relative', aspectRatio: '1080 / 1920', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {moms.map((m, i) => {
            const n = moms.length, w = 1 / n;
            const lp = Math.max(0, Math.min(1, (prog - i * w) / w));
            const isLast = i === n - 1;
            const fin = Math.min(1, lp / 0.18), fout = isLast ? 1 : Math.min(1, (1 - lp) / 0.18);
            const op = (lp <= 0 || lp >= 1) ? (lp >= 1 && isLast ? 1 : 0) : Math.min(fin, fout);
            if (op <= 0) return null;
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: op }}>
                <KineticSlide texto={m} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={lp} efeito={ef} tipografia={tip} {...SOULAB_SLIDE} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border border-white/10">
          <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={prog} efeito={ef} tipografia={tip} {...SOULAB_SLIDE} />
        </div>
      )}
      {peca.clipUrl && <p className="text-[0.5rem] opacity-45">(o movimento vê-se no 🎬; aqui mostra-se a imagem + o texto a animar)</p>}

      {/* TEMPO POR MOMENTO — escolha dela; o preview acima já anima a este ritmo,
          e o render usa o MESMO valor ao guardar. Só faz sentido com vários momentos. */}
      {moms && (
        <div className="space-y-1 pt-1">
          <label className="flex items-center gap-2 text-[0.6rem] opacity-80">
            <span className="opacity-60 whitespace-nowrap">tempo / momento</span>
            <input type="range" min={3} max={12} step={0.5} value={seg} onChange={(e) => setSeg(Number(e.target.value))} className="flex-1 accent-current" style={{ color: dz }} />
            <span className="tabular-nums w-9 text-right">{seg.toFixed(1)}s</span>
          </label>
          <p className="text-[0.5rem] opacity-45">{moms.length} momentos × {seg.toFixed(1)}s ≈ <b>{Math.round(seg * moms.length)}s</b> de reel. Arrasta e vê em cima; guarda para o render usar o mesmo.</p>
          <button type="button" onClick={() => onSaveTempo(seg)} disabled={disabled || seg === (peca.segPorMomento ?? 5.5)}
            className="w-full text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar tempo'}</button>
        </div>
      )}
    </div>
  );
}

export default function SoulabPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [aba, setAba] = useState<'por-agendar' | 'agendadas' | 'publicadas' | 'todas'>('por-agendar');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<TipoSoulabId>('frase');
  const [tema, setTema] = useState('');
  const sementesRecentes = useRef<string[]>([]); // últimas sementes do "surpreende-me", para não repetir
  const [quantos, setQuantos] = useState(1);
  const [formato, setFormato] = useState<'frase' | 'momentos'>('frase');
  const [modo, setModo] = useState<'abre' | 'encaminha'>('abre'); // abre = deixa em aberto; encaminha = desdobra e pousa
  const [fonte, setFonte] = useState<'livro' | 'tema'>('livro'); // minerar os livros (defeito) vs partir do ângulo/tema
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);
  const [motionOpen, setMotionOpen] = useState<string | null>(null);
  const [legendaOpen, setLegendaOpen] = useState<string | null>(null);
  const [agendaOpen, setAgendaOpen] = useState<string | null>(null);
  const [efeitoOpen, setEfeitoOpen] = useState<string | null>(null);
  const [somOpen, setSomOpen] = useState<string | null>(null);
  const [tipoOpen, setTipoOpen] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [efeitoLote, setEfeitoLote] = useState<EfeitoTexto>('maquina');

  const recarregar = useCallback(() => {
    fetch('/api/admin/soulab/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setErro(null);
    setMsg('A explorar no laboratório (texto + imagem)… pode demorar até 1 min por peça. Volta e recarrega se fechares.');
    try {
      const r = await fetch('/api/admin/soulab/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo, quantos, formato, modo, fonte, tema: tema.trim() || undefined }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} peça(s) gerada(s).${j.detalhe ? ` (aviso: ${j.detalhe})` : ''} Revê em baixo, regenera a imagem se quiseres, e renderiza.`);
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(false); }
  }, [busy, tipo, quantos, formato, modo, fonte, tema, recarregar]);

  const darMovimento = useCallback(async (slug: string, opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null);
    setMsg('A dar vida à imagem (Kling)… pode demorar 1 a 3 min. Não feches.');
    try {
      const r = await fetch('/api/admin/soulab/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...opts }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Movimento gerado. Vê em baixo, no cartão. (É só o motion, sem texto; o texto entra no render.)'); setMotionOpen(null); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const salvarLegenda = useCallback(async (slug: string, legenda: string, hashtags: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar a legenda…');
    try {
      const r = await fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, legenda, hashtags }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Legenda guardada.'); setLegendaOpen(null); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const agendarPeca = useCallback(async (slug: string, agendadoEm: string, hora: string) => {
    if (acaoSlug) return;
    if (!agendadoEm) { setErro('Escolhe a data.'); return; }
    setAcaoSlug(slug); setErro(null); setMsg('A agendar…');
    try {
      // agendadoEm vem do input date como 'YYYY-MM-DD' (local) — enviar tal e qual,
      // NUNCA via toISOString (recuava um dia em PT). aprovado=true = a trava do cron.
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm, hora: hora || '13:00', aprovado: true }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Agendada. Publica-se sozinha à hora marcada (o vídeo é preparado automaticamente).'); setAgendaOpen(null); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const desagendarPeca = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A desagendar…');
    try {
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: null, aprovado: false }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
      else { setMsg('Desagendada.'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const salvarEfeito = useCallback(async (slug: string, efeito: EfeitoTexto) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar o efeito do texto…');
    try {
      const r = await fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, efeito }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Efeito guardado. O reel final usa-o no render.'); setEfeitoOpen(null); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const gerarSomPeca = useCallback(async (slug: string, opts: { remover?: boolean; tipo?: 'cena' | 'musica'; estilo?: string }) => {
    if (acaoSlug) return;
    const { remover, tipo, estilo } = opts;
    setAcaoSlug(slug); setErro(null);
    setMsg(remover ? 'A remover o áudio (volta à música da loja)…'
      : tipo === 'musica' ? 'A compor a música ambiente (MusicGen)… ~30-60s.'
      : 'A gerar o som da cena (ElevenLabs)… ~20-40s.');
    try {
      const r = await fetch('/api/admin/soulab/som', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, remover, tipo, estilo }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg(remover ? 'Áudio removido (volta à música da loja no render).' : 'Áudio gerado. Ouve em baixo; o render usa-o como áudio do reel.'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const salvarTempo = useCallback(async (slug: string, segPorMomento: number) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar o tempo por momento…');
    try {
      const r = await fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, segPorMomento }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Tempo guardado. O render usa este ritmo (o mesmo que vês na pré-visualização).'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const salvarTipografia = useCallback(async (slug: string, tipografia: Tipografia) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar a tipografia…');
    try {
      const r = await fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, tipografia }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Tipografia guardada. O reel usa-a no render.'); setTipoOpen(null); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const novaImagem = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A regenerar a imagem (Flux)…');
    try {
      const r = await fetch('/api/admin/soulab/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Imagem nova gerada. Se gostares, renderiza.'); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const renderizar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    // NÃO disparar por surpresa: o render gasta tempo (~minutos) e Actions. Confirma.
    if (typeof window !== 'undefined' && !window.confirm('Disparar o RENDER FINAL (MP4)? Demora alguns minutos e corre nos GitHub Actions.\n\nDica: pré-vê primeiro com ▶ para veres como vai sair.')) return;
    setAcaoSlug(slug); setErro(null); setMsg('A disparar o render (GitHub Actions)…');
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg('Render disparado. O MP4 demora alguns minutos a aparecer. Recarrega daqui a pouco.');
    } catch (e) { setErro(String(e)); }
    finally { setAcaoSlug(null); }
  }, [acaoSlug]);

  const descartar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar esta peça?')) return;
    try {
      const r = await fetch('/api/admin/soulab/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) recarregar(); else { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  // CONTINUAR O FIO: gera a PARTE 2 de um reel que resultou (mesmo registo/voz).
  const continuar = useCallback(async (slug: string) => {
    setAcaoSlug(slug); setErro(null); setMsg('A continuar o fio (parte 2 na mesma voz)…');
    try {
      const r = await fetch('/api/admin/soulab/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ continuarDe: slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Seguimento gerado. Está em baixo, no topo da lista.'); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [recarregar]);

  // ── SELEÇÃO MÚLTIPLA + barra de ferramentas em lote (motion, efeito, som, render…) ──
  const toggleSel = useCallback((slug: string) => setSel((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; }), []);
  const emLote = useCallback(async (faz: (slug: string) => Promise<Response>, etiqueta: string, podePublicada = true) => {
    if (acaoSlug || busy || !sel.size) return;
    const alvos = pecas.filter((p) => sel.has(p.slug) && (podePublicada || !p.publicado)).map((p) => p.slug);
    if (!alvos.length) { setSel(new Set()); return; }
    setBusy(true); setErro(null); setMsg(`${etiqueta} · 0/${alvos.length}…`);
    let feitos = 0;
    for (const slug of alvos) {
      try { const r = await faz(slug); if (r.ok) feitos++; } catch { /* segue */ }
      setMsg(`${etiqueta} · ${feitos}/${alvos.length}…`);
    }
    setMsg(`${etiqueta}: ${feitos}/${alvos.length} feito(s).`);
    setSel(new Set()); setBusy(false); recarregar();
  }, [acaoSlug, busy, sel, pecas, recarregar]);

  const motionLote = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm(`Dar/REFAZER MOTION de vídeo (Kling) às ${sel.size} selecionada(s)? Refaz mesmo as que já têm vídeo (corrigir câmara estática). 1-3 min cada. Não feches. (só salta sem imagem.)`)) return;
    return emLote((slug) => { const p = pecas.find((x) => x.slug === slug); if (!p?.imageUrl) return Promise.resolve(new Response(null, { status: 200 })); return fetch('/api/admin/soulab/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, camara: 'suave', ingredientes: ['natural'] }) }); }, 'A dar motion');
  }, [emLote, pecas, sel]);
  const efeitoLoteAplicar = useCallback(() => emLote((slug) => fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, efeito: efeitoLote }) }), 'A aplicar efeito'), [emLote, efeitoLote]);
  const somLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Gerar SOM da cena nas ${sel.size} selecionada(s)? (salta sem imagem)`)) return; return emLote((slug) => { const p = pecas.find((x) => x.slug === slug); if (!p?.imageUrl) return Promise.resolve(new Response(null, { status: 200 })); return fetch('/api/admin/soulab/som', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, tipo: 'cena' }) }); }, 'A gerar som'); }, [emLote, pecas, sel]);
  const imagemLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Trocar a imagem das ${sel.size} selecionada(s)?`)) return; return emLote((slug) => fetch('/api/admin/soulab/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }), 'A trocar imagem'); }, [emLote, sel]);
  const renderLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Renderizar (MP4) as ${sel.size} selecionada(s)? Corre nos GitHub Actions; minutos.`)) return; return emLote((slug) => fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) }), 'A disparar render'); }, [emLote, sel]);
  const apagarLote = useCallback(() => { if (typeof window !== 'undefined' && !window.confirm(`Descartar ${sel.size} selecionada(s)? (salta publicadas)`)) return; return emLote((slug) => fetch('/api/admin/soulab/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }), 'A descartar', false); }, [emLote, sel]);

  const estadoDe = (p: Peca): 'por-agendar' | 'agendadas' | 'publicadas' => p.publicado ? 'publicadas' : p.agendadoEm ? 'agendadas' : 'por-agendar';
  const cont = {
    'por-agendar': pecas.filter((p) => estadoDe(p) === 'por-agendar').length,
    agendadas: pecas.filter((p) => estadoDe(p) === 'agendadas').length,
    publicadas: pecas.filter((p) => estadoDe(p) === 'publicadas').length,
    todas: pecas.length,
  };
  const buscaN = busca.trim().toLowerCase();
  const pecasFiltradas = pecas
    .filter((p) => aba === 'todas' || estadoDe(p) === aba)
    .filter((p) => filtroTipo === 'todos' || p.tipo === filtroTipo)
    .filter((p) => !buscaN || `${p.texto} ${p.conceito} ${(p.momentos ?? []).join(' ')}`.toLowerCase().includes(buscaN));
  const pecasOrdenadas = aba === 'agendadas'
    ? [...pecasFiltradas].sort((a, b) => `${a.agendadoEm ?? ''}${a.hora ?? ''}`.localeCompare(`${b.agendadoEm ?? ''}${b.hora ?? ''}`))
    : pecasFiltradas;
  const ABAS: { id: 'por-agendar' | 'agendadas' | 'publicadas' | 'todas'; label: string }[] = [
    { id: 'por-agendar', label: 'por agendar' },
    { id: 'agendadas', label: 'agendadas' },
    { id: 'publicadas', label: 'publicadas' },
    { id: 'todas', label: 'todas' },
  ];

  return (
    <main className={`${FONTS} min-h-screen px-4 py-8 md:px-8`} style={{ background: SOULAB.paleta.bg2, color: SOULAB.paleta.texto }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: SOULAB.paleta.bg }}>
          <h1 className="text-2xl flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant), serif', color: SOULAB.paleta.destaque }}>
            <span>{SOULAB.emoji}</span> @{SOULAB.handle} <span className="opacity-70 text-base" style={{ color: SOULAB.paleta.texto }}>· {SOULAB.nome}</span>
          </h1>
          <p className="mt-2 text-[0.92rem] italic opacity-90" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{SOULAB.posicionamento}</p>
          <p className="mt-2 text-[0.8rem] opacity-70">{SOULAB.missao}</p>
          <p className="mt-2 text-[0.7rem] opacity-55">Tom: {SOULAB.tom.join(' · ')}</p>
          <Link href={`/admin/publicar?conta=${SOULAB.id}`} className="mt-3 inline-block px-3 py-1.5 rounded-lg border border-white/20 text-[0.74rem] hover:bg-white/10">abrir no Publicar →</Link>
        </header>

        {/* gerar */}
        <section className="mb-6 rounded-2xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">nova experiência</h2>
          <p className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-1.5">fonte</p>
          <div className="flex flex-wrap gap-2 mb-1">
            {([['livro', '📖 minerar o livro'], ['tema', '💭 ângulo / tema']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setFonte(id)} title={id === 'livro' ? 'cada peça nasce de uma ideia de um capítulo ainda não usado dos livros dela' : 'parte do ângulo escolhido ou de um tema livre'}
                className="px-3 py-1.5 rounded-lg border text-[0.78rem]"
                style={fonte === id ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 } : { borderColor: 'rgba(255,255,255,0.18)', color: SOULAB.paleta.texto }}>{label}</button>
            ))}
          </div>
          <p className="text-[0.58rem] opacity-45 mb-3">{fonte === 'livro' ? 'Minerado de um capítulo ainda não usado (anti-repetição). Impossível sem o livro.' : 'Parte do ângulo/tema abaixo.'}</p>
          <p className="text-[0.6rem] uppercase tracking-widest opacity-50 mb-1.5">ângulo</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {TIPOS_SOULAB.map((t) => (
              <button key={t.id} onClick={() => setTipo(t.id)} title={t.descricao}
                className="px-3 py-1.5 rounded-lg border text-[0.78rem]"
                style={tipo === t.id
                  ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }
                  : { borderColor: 'rgba(255,255,255,0.18)', color: SOULAB.paleta.texto }}>
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
          <p className="text-[0.72rem] opacity-60 mb-3">{TIPOS_SOULAB.find((t) => t.id === tipo)?.descricao}</p>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[0.7rem] opacity-55 mr-0.5">formato:</span>
            {([['frase', '✶ 1 frase'], ['momentos', '❑ vários momentos']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFormato(id)} title={id === 'momentos' ? 'um reel onde a ideia se desdobra em 3-5 linhas sobre a mesma cena' : 'um reel de uma só frase'}
                className="text-[0.74rem] px-2.5 py-1 rounded-full border"
                style={formato === id ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 } : { borderColor: 'rgba(255,255,255,0.2)', color: SOULAB.paleta.texto }}>{label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[0.7rem] opacity-55 mr-0.5">voz:</span>
            {([['abre', '◌ abre (deixa a refletir)'], ['encaminha', '➜ encaminha (desdobra e pousa)']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setModo(id)} title={id === 'encaminha' ? 'além de abrir, desdobra mais uma volta e pousa num movimento (sem conselho); para quem não fecha sozinho' : 'acende a reflexão e deixa em aberto (o registo atual)'}
                className="text-[0.74rem] px-2.5 py-1 rounded-full border"
                style={modo === id ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 } : { borderColor: 'rgba(255,255,255,0.2)', color: SOULAB.paleta.texto }}>{label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="tema livre (opcional) — ou deixa o acaso decidir 🎲"
              className="flex-1 min-w-[200px] text-[0.82rem] px-3 py-2 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
            <button type="button" onClick={() => { const s = sementeAleatoria(sementesRecentes.current); sementesRecentes.current = [s, ...sementesRecentes.current].slice(0, 8); setTema(s); }} title="uma semente ampla ao acaso (rola outra vez se não te chamar)"
              className="px-3 py-2 rounded-lg border text-[0.78rem] hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.25)', color: SOULAB.paleta.texto }}>
              🎲 surpreende-me
            </button>
            <label className="inline-flex items-center gap-1.5 text-[0.74rem] opacity-80">
              quantas:
              <select value={quantos} onChange={(e) => setQuantos(Number(e.target.value))} className="bg-black/20 border border-white/15 rounded-md px-2 py-1.5 [color-scheme:dark]">
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button onClick={gerar} disabled={busy} className="px-4 py-2 rounded-lg border disabled:opacity-50 text-[0.84rem]"
              style={{ borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }}>
              {busy ? 'a explorar…' : '🧪 gerar'}
            </button>
          </div>
        </section>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {/* peças geradas */}
        <section>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-2">peças <span className="opacity-40">· {pecas.length}</span></h2>

          {/* separadores por estado */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {ABAS.map((a) => (
              <button key={a.id} onClick={() => setAba(a.id)} className="text-[0.72rem] px-2.5 py-1 rounded-full border"
                style={aba === a.id ? { borderColor: SOULAB.paleta.destaque, background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 } : { borderColor: 'rgba(255,255,255,0.18)', color: SOULAB.paleta.texto }}>
                {a.label} <span className="opacity-60">· {cont[a.id]}</span>
              </button>
            ))}
          </div>

          {/* filtro por ângulo + busca */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <button onClick={() => setFiltroTipo('todos')} className="text-[0.62rem] px-2 py-0.5 rounded-full border"
              style={filtroTipo === 'todos' ? { borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque } : { borderColor: 'rgba(255,255,255,0.15)', opacity: 0.7 }}>todos</button>
            {TIPOS_SOULAB.map((t) => (
              <button key={t.id} onClick={() => setFiltroTipo(t.id)} title={t.label} className="text-[0.62rem] px-2 py-0.5 rounded-full border"
                style={filtroTipo === t.id ? { borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque } : { borderColor: 'rgba(255,255,255,0.15)', opacity: 0.7 }}>{t.emoji}</button>
            ))}
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="procurar…"
              className="ml-auto text-[0.7rem] px-2.5 py-1 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
          </div>

          {pecas.length === 0 && <p className="text-[0.78rem] opacity-50">Ainda nada. Escolhe um ângulo e carrega &quot;gerar&quot;.</p>}
          {pecas.length > 0 && pecasOrdenadas.length === 0 && <p className="text-[0.76rem] opacity-50">Nada neste separador/filtro.</p>}

          {/* BARRA DE FERRAMENTAS · seleção múltipla (motion, efeito, som, render… em lote) */}
          {sel.size > 0 && (
            <div className="sticky top-2 z-30 mb-3 rounded-xl border p-2.5 flex items-center gap-1.5 flex-wrap" style={{ borderColor: SOULAB.paleta.destaque, background: 'rgba(20,18,28,0.96)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              <span className="text-[0.72rem] font-medium" style={{ color: SOULAB.paleta.destaque }}>{sel.size} selecionada(s)</span>
              <button onClick={() => setSel(new Set())} className="text-[0.58rem] px-1.5 py-0.5 rounded-lg border border-white/20 opacity-75">limpar</button>
              <span className="opacity-30">·</span>
              <button onClick={motionLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40" title="vídeo real (Kling); 1-3 min cada">🎬 motion</button>
              <button onClick={imagemLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">🖼 imagem</button>
              <button onClick={somLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40" title="som da cena (salta sem imagem)">🔊 som</button>
              <span className="inline-flex items-center gap-1">
                <select value={efeitoLote} onChange={(e) => setEfeitoLote(e.target.value as EfeitoTexto)} className="text-[0.6rem] px-1 py-1 rounded-lg border border-white/15 bg-black/30 outline-none [color-scheme:dark]" style={{ color: SOULAB.paleta.texto }}>
                  {EFEITOS_TEXTO.map((ef) => <option key={ef.id} value={ef.id}>{ef.label}</option>)}
                </select>
                <button onClick={efeitoLoteAplicar} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque }}>✶ efeito</button>
              </span>
              <button onClick={renderLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">🎞 render</button>
              <button onClick={apagarLote} disabled={busy} className="text-[0.6rem] px-1.5 py-1 rounded-lg border border-rose-400/50 text-rose-300 disabled:opacity-40">🗑 descartar</button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pecasOrdenadas.map((p) => (
              <div key={p.slug} className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderColor: sel.has(p.slug) ? SOULAB.paleta.destaque : 'rgba(255,255,255,0.1)' }}>
                <div className="relative">
                  <KineticSlide texto={p.texto} destaque={p.destaque} imageUrl={p.imageUrl ?? undefined} mundo={MUNDO} prog={1} {...SOULAB_SLIDE} />
                  <button onClick={() => toggleSel(p.slug)} title={sel.has(p.slug) ? 'tirar da seleção' : 'selecionar'}
                    className="absolute bottom-1 left-1 w-6 h-6 rounded-md border flex items-center justify-center text-[0.7rem] z-10"
                    style={sel.has(p.slug) ? { background: SOULAB.paleta.destaque, borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 } : { background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.5)', color: 'transparent' }}>✓</button>
                  <span className="absolute top-1 left-1 text-[0.5rem] px-1 py-0.5 rounded bg-black/60">{p.veiaTitulo ? `📖 ${p.veiaTitulo}` : (p.tipo ?? 'soulab')}{p.momentos && p.momentos.length > 1 ? ` · ❑ ${p.momentos.length} momentos` : ''}{p.parte ? ` · ↪ parte ${p.parte}` : ''}</span>
                  {/* O estado que importa primeiro é "está renderizada?" (videoUrl). O clip
                      do motion vinha à frente e ESCONDIA o sinal de MP4 — agora o MP4 ganha,
                      e o "🎬 com vida" mostra-se só quando tem motion mas AINDA não renderizou. */}
                  {p.publicado
                    ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5">✓ publicado</span>
                    : p.videoUrl
                      ? <span className="absolute top-1 right-1 text-[0.5rem] bg-sky-600/80 text-white rounded px-1 py-0.5">✅ MP4 pronto{p.clipUrl ? ' · vida' : ''}</span>
                      : p.clipUrl
                        ? <span className="absolute top-1 right-1 text-[0.5rem] rounded px-1 py-0.5" style={{ background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }}>🎬 com vida · por renderizar</span>
                        : <span className="absolute top-1 right-1 text-[0.5rem] bg-amber-600/80 text-white rounded px-1 py-0.5">imagem · por renderizar</span>}
                </div>
                {p.clipUrl && (
                  <div className="px-2 pt-2">
                    <p className="text-[0.55rem] uppercase tracking-widest opacity-50 mb-1">movimento (sem texto · o texto entra no render)</p>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={p.clipUrl} controls loop muted playsInline className="w-full rounded-lg border border-white/10" />
                  </div>
                )}
                <div className="p-2 flex flex-wrap gap-1 text-[0.62rem]">
                  <button onClick={() => setPreviewOpen(previewOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="ver o reel a animar ANTES de renderizar" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque }}>▶ pré-ver {previewOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => novaImagem(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">imagem</button>
                  <button onClick={() => setMotionOpen(motionOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug || !p.imageUrl} title="escolhe o que mexe e dá vida à imagem" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque }}>🎬 movimento {motionOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setEfeitoOpen(efeitoOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="escolhe e vê o efeito do texto a animar" className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">✶ efeito {efeitoOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setSomOpen(somOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="áudio do reel: som da cena, máquina de escrever ou música ambiente" className="px-2 py-1 rounded border disabled:opacity-40" style={p.somUrl ? { borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque } : { borderColor: 'rgba(255,255,255,0.2)' }}>🔊 áudio {somOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setTipoOpen(tipoOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="editor de tipografia: fonte, tamanho, cor" className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">🅰 letras {tipoOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setLegendaOpen(legendaOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="ver e editar a legenda, hashtags e CTA" className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">📝 legenda {legendaOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setAgendaOpen(agendaOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="meter data e hora para publicar" className="px-2 py-1 rounded border disabled:opacity-40" style={p.agendadoEm ? { borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque } : { borderColor: 'rgba(255,255,255,0.2)' }}>📅 {p.agendadoEm ? p.agendadoEm.slice(5) : 'agendar'} {agendaOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => renderizar(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">render</button>
                  <button onClick={() => continuar(p.slug)} disabled={!!acaoSlug} title="gerar a parte 2 deste reel, na mesma voz e registo (para reels que resultaram)" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque }}>↪ continuar</button>
                  {!p.publicado && <button onClick={() => descartar(p.slug)} className="px-2 py-1 rounded border border-rose-400/40 text-rose-300">descartar</button>}
                </div>
                {previewOpen === p.slug && <PreviewBox peca={p} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSaveTempo={(seg) => salvarTempo(p.slug, seg)} />}
                {motionOpen === p.slug && <MotionBox busy={acaoSlug === p.slug} disabled={!!acaoSlug} onGerar={(opts) => darMovimento(p.slug, opts)} />}
                {legendaOpen === p.slug && <LegendaBox legenda={p.legenda ?? ''} hashtags={p.hashtags} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSave={(leg, tags) => salvarLegenda(p.slug, leg, tags)} />}
                {agendaOpen === p.slug && <AgendarBox agendadoEm={p.agendadoEm} hora={p.hora} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onAgendar={(data, h) => agendarPeca(p.slug, data, h)} onDesagendar={() => desagendarPeca(p.slug)} />}
                {efeitoOpen === p.slug && <EfeitoBox peca={p} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSave={(ef) => salvarEfeito(p.slug, ef)} />}
                {somOpen === p.slug && <SomBox peca={p} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onGerar={(tipo, estilo) => gerarSomPeca(p.slug, { tipo, estilo })} onRemover={() => gerarSomPeca(p.slug, { remover: true })} />}
                {tipoOpen === p.slug && <TipografiaBox peca={p} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSave={(t) => salvarTipografia(p.slug, t)} />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
