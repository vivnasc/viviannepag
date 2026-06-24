'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FORMATOS_LISTA, CALENDARIO } from '@/lib/metodo-vs/formatos';
import { KineticSlide, estiloMomento, EFEITOS_TEXTO, FONTES_TEXTO, TRANSICOES, type EfeitoTexto, type FonteTexto, type Tipografia, type Transicao } from '@/components/admin/KineticSlide';
import { METODOVS_MUNDO, metodoVSConta, METODOVS_CONTAS_LISTA, type MetodoVSContaId } from '@/lib/metodo-vs/marca';
import { CONTAS } from '@/lib/metodo/contas';
import { MOTION_INGREDIENTES, CAMARA_OPCOES, type CamaraId } from '@/lib/soulab/motion';
import { MUSICA_ESTILOS } from '@/lib/soulab/musica';
import type { Mundo } from '@/lib/estudio-conteudo';

// MÉTODO VS · ESTÚDIO PARTILHADO da MÃE e das 3 FILHAS (ver · vir · viver). É o mesmo
// motor e o mesmo estúdio completo por peça (prever · texto · legenda · motion · som ·
// tipografia · efeito · tempo · render · agendar); o que muda é a CONTA (a marca em que
// publica, o prefixo do slug, a assinatura, e a ÂNCORA da voz na geração — ver gerar.ts).
// A página da mãe e a rota dinâmica [conta] são só invólucros finos deste componente.

const MUNDO = METODOVS_MUNDO as Mundo; // a paleta 'autora' (ouro) vive em PALETAS.
// paleta do estúdio (espelha PALETAS.autora, ouro/castanho) — comum às 4 contas.
const PAL = { bg: '#3A2818', bg2: '#2A1C12', texto: '#F2E8DC', destaque: '#EBAE4A' };
const dz = PAL.destaque, bg2 = PAL.bg2;

type Peca = {
  slug: string; veu: string | null; formato: string | null; hora: string | null;
  momentos: string[]; texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; clipUrl: string | null;
  somUrl: string | null; somTipo: string | null; somEstilo: string | null;
  efeito: string | null; transicao: string | null; tipografia: Tipografia | null; segPorMomento: number | null;
  legenda: string | null; hashtags: string[]; fundoPrompt: string | null;
  agendadoEm: string | null; publicado: boolean;
};

const NOME_FORMATO: Record<string, string> = Object.fromEntries(FORMATOS_LISTA.map((f) => [f.id, `${f.emoji} ${f.nome}`]));

// a segunda-feira da semana de um offset (0 = esta), em componentes LOCAIS (nunca
// toISOString — em PT recua um dia). Espelha segDaSemana() da rota de geração.
function segundaDaSemana(offset: number): Date {
  const x = new Date(); const wd = x.getDay();
  x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd) + offset * 7); x.setHours(0, 0, 0, 0);
  return x;
}
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
const dataLocalStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
// rótulo do cabeçalho de dia no feed: "segunda · 24/06" (a partir de 'YYYY-MM-DD' local).
function rotuloDoDia(chave: string): string {
  if (chave === 'sem-data') return 'sem data · rascunhos';
  const [y, m, d] = chave.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return `${DIAS_PT[dt.getDay()]} · ${ddmm(dt)}`;
}
function rotuloSemana(offset: number): string {
  const seg = segundaDaSemana(offset);
  const dom = new Date(seg); dom.setDate(seg.getDate() + 6);
  const quando = offset === 0 ? 'esta semana' : offset === 1 ? 'próxima semana' : offset < 0 ? `há ${-offset} sem.` : `daqui a ${offset} sem.`;
  return `${quando} · ${ddmm(seg)}–${ddmm(dom)}`;
}

// PRÉ-VISUALIZAÇÃO do reel (ver ANTES de renderizar): anima prog 0→1 em loop, com o
// efeito + tipografia da peça. Se for "vários momentos", sequencia-os (crossfade),
// como o render vai fazer. O TEMPO POR MOMENTO é escolha dela (slider): o preview
// anima a esse ritmo E o render usa o MESMO valor — o que vê é o que sai.
function PreviewBox({ peca, slide, disabled, busy, onSaveTempo, onSaveTransicao }: { peca: Peca; slide: typeof METODOVS_CONTAS_LISTA[number]['slide']; disabled: boolean; busy: boolean; onSaveTempo: (seg: number) => void; onSaveTransicao: (t: Transicao) => void }) {
  const [prog, setProg] = useState(0);
  const moms = peca.momentos && peca.momentos.length > 1 ? peca.momentos : null;
  const ef = (peca.efeito as EfeitoTexto | null) ?? undefined;
  const tip = peca.tipografia ?? undefined;
  const [seg, setSeg] = useState<number>(peca.segPorMomento ?? 5.5);
  // a transição vê-se AO VIVO: muda aqui e o preview troca já (guarda para o render usar).
  const [trans, setTrans] = useState<Transicao>((peca.transicao as Transicao | null) ?? 'deslizar');
  useEffect(() => {
    let raf = 0; let start: number | null = null;
    const dur = (moms?.length ?? 1) * seg * 1000, hold = 1200;
    const tick = (t: number) => { if (start === null) start = t; const e = (t - start) % (dur + hold); setProg(Math.min(1, e / dur)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moms, seg]);
  return (
    <div className="space-y-1">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">pré-visualização · como vai sair no reel (ver antes de renderizar)</p>
      {moms ? (
        <div style={{ position: 'relative', aspectRatio: '1080 / 1920', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {moms.map((m, i) => {
            const n = moms.length, w = 1 / n;
            const lp = Math.max(0, Math.min(1, (prog - i * w) / w));
            const est = estiloMomento(trans, lp, i === n - 1);
            if (!est) return null;
            return (
              <div key={i} style={{ position: 'absolute', inset: 0, ...est }}>
                <KineticSlide texto={m} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={lp} efeito={ef} tipografia={tip} {...slide} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border border-white/10">
          <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={prog} efeito={ef} tipografia={tip} {...slide} />
        </div>
      )}
      {peca.clipUrl && <p className="text-[0.5rem] opacity-45">(o movimento vê-se no 🎬; aqui mostra-se a imagem mais o texto a animar)</p>}
      {moms && (
        <div className="space-y-1.5 pt-1">
          {/* TRANSIÇÃO entre frases (à escolha, com explicação) — vê-se já em cima */}
          <p className="text-[0.55rem] uppercase tracking-widest opacity-50 pt-0.5">transição entre frases</p>
          <div className="flex flex-wrap gap-1">
            {TRANSICOES.map((t) => (
              <button key={t.id} type="button" onClick={() => setTrans(t.id)} title={t.desc} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
                style={trans === t.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{t.label}</button>
            ))}
          </div>
          <p className="text-[0.5rem] opacity-50 leading-snug">{TRANSICOES.find((t) => t.id === trans)?.desc}</p>
          <button type="button" onClick={() => onSaveTransicao(trans)} disabled={disabled || trans === ((peca.transicao as Transicao | null) ?? 'deslizar')}
            className="w-full text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar transição'}</button>

          <label className="flex items-center gap-2 text-[0.6rem] opacity-80 pt-1">
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

// EDITAR O TEXTO de cada momento (autonomia): uma textarea por momento. Guarda via a
// rota própria de edição de texto do método (o texto vive nos slides, o que o render lê).
function TextoBox({ peca, disabled, busy, onSave }: { peca: Peca; disabled: boolean; busy: boolean; onSave: (momentos: string[]) => void }) {
  const base = peca.momentos.length ? peca.momentos : [peca.texto];
  const [moms, setMoms] = useState<string[]>(base);
  const set = (i: number, v: string) => setMoms((s) => s.map((x, k) => (k === i ? v : x)));
  return (
    <div className="space-y-1.5">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">texto {moms.length > 1 ? `· ${moms.length} momentos (o 1.º é a capa/faca)` : ''}</p>
      {moms.map((m, i) => (
        <textarea key={i} value={m} onChange={(e) => set(i, e.target.value)} rows={2}
          className="w-full text-[0.66rem] leading-relaxed px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: PAL.texto }} />
      ))}
      <button type="button" onClick={() => onSave(moms.map((m) => m.trim()).filter(Boolean))} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar texto'}</button>
    </div>
  );
}

// A LEGENDA + HASHTAGS à vista e editáveis (autonomia: ela mexe no texto do post).
function LegendaBox({ legenda, hashtags, disabled, busy, onSave }: { legenda: string; hashtags: string[]; disabled: boolean; busy: boolean; onSave: (legenda: string, hashtags: string) => void }) {
  const [leg, setLeg] = useState(legenda);
  const [tags, setTags] = useState((hashtags ?? []).join(' '));
  return (
    <div className="space-y-1.5">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">legenda</p>
      <textarea value={leg} onChange={(e) => setLeg(e.target.value)} rows={6}
        className="w-full text-[0.64rem] leading-relaxed px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: PAL.texto }} />
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">hashtags</p>
      <textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={2}
        className="w-full text-[0.6rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: PAL.texto }} />
      <button type="button" onClick={() => onSave(leg, tags)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar legenda'}</button>
    </div>
  );
}

// O COMPOSITOR DE MOVIMENTO: ela escolhe o que mexe (câmara e/ou elementos) ou descreve
// por palavras dela. Só ao carregar "dar movimento" chama o Kling (rota do Soulab por slug).
function MotionBox({ disabled, busy, clipUrl, onGerar }: { disabled: boolean; busy: boolean; clipUrl: string | null; onGerar: (opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => void }) {
  const [ing, setIng] = useState<string[]>([]);
  const [cam, setCam] = useState<CamaraId>('suave');
  const [livre, setLivre] = useState('');
  const toggle = (id: string) => setIng((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <div className="space-y-1.5">
      {clipUrl && (
        <div>
          <p className="text-[0.55rem] uppercase tracking-widest opacity-50 mb-1">movimento (sem texto · o texto entra no render)</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={clipUrl} controls loop muted playsInline className="w-full rounded-lg border border-white/10" />
        </div>
      )}
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">o que mexe? (escolhe tu)</p>
      <div className="flex flex-wrap gap-1">
        {MOTION_INGREDIENTES.map((m) => {
          const on = ing.includes(m.id);
          return (
            <button key={m.id} type="button" onClick={() => toggle(m.id)} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
              style={on ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{m.label}</button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[0.55rem] opacity-50 mr-0.5">câmara:</span>
        {CAMARA_OPCOES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCam(c.id)} className="text-[0.56rem] px-1.5 py-0.5 rounded border"
            style={cam === c.id ? { borderColor: dz, color: dz } : { borderColor: 'rgba(255,255,255,0.15)', opacity: 0.7 }}>{c.label}</button>
        ))}
      </div>
      <input value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="ou descreve tu o movimento…"
        className="w-full text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: PAL.texto }} />
      <button type="button" onClick={() => onGerar({ ingredientes: ing, camara: cam, livre })} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a dar vida…' : '🎬 dar movimento'}</button>
    </div>
  );
}

// O ÁUDIO DO REEL: duas fontes à escolha (som da cena · música ambiente instrumental),
// ambas viram o áudio do render (theme.soulab.somUrl). "Remover" volta à música da loja.
function SomBox({ peca, disabled, busy, onGerar, onRemover }: { peca: Peca; disabled: boolean; busy: boolean; onGerar: (tipo: 'cena' | 'musica', estilo?: string) => void; onRemover: () => void }) {
  const [estilo, setEstilo] = useState<string>(peca.somEstilo ?? 'flauta');
  const tipoAtual = peca.somUrl ? (peca.somTipo ?? 'cena') : null;
  const nomeTipo = tipoAtual === 'musica' ? `música · ${peca.somEstilo ?? ''}` : tipoAtual === 'cena' ? 'som da cena' : '';
  return (
    <div className="space-y-1.5">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">áudio do reel {tipoAtual && <span style={{ color: dz }}>· {nomeTipo}</span>}</p>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {peca.somUrl && <audio src={peca.somUrl} controls className="w-full h-8" />}
      <button type="button" onClick={() => onGerar('cena')} disabled={disabled || !peca.imageUrl}
        className="w-full text-[0.64rem] px-2 py-1.5 rounded-lg border disabled:opacity-50"
        style={tipoAtual === 'cena' ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{busy ? 'a gerar…' : '🌿 som ambiente da cena'}</button>
      <div className="rounded-lg border border-white/15 p-1.5 space-y-1">
        <p className="text-[0.55rem] opacity-55">🎵 música ambiente (instrumental)</p>
        <div className="flex flex-wrap gap-1">
          {MUSICA_ESTILOS.map((m) => (
            <button key={m.id} type="button" onClick={() => setEstilo(m.id)} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
              style={estilo === m.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{m.label}</button>
          ))}
        </div>
        <button type="button" onClick={() => onGerar('musica', estilo)} disabled={disabled}
          className="w-full text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-50"
          style={tipoAtual === 'musica' ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{busy ? 'a compor…' : `🎼 gerar música · ${MUSICA_ESTILOS.find((m) => m.id === estilo)?.label ?? estilo}`}</button>
      </div>
      {peca.somUrl && <button type="button" onClick={onRemover} disabled={disabled} className="w-full text-[0.6rem] px-2 py-1 rounded-lg border border-white/20 disabled:opacity-50">↩︎ voltar à música da loja</button>}
      <p className="text-[0.52rem] opacity-45 leading-snug">Sem áudio próprio, o render usa a música da loja. A música é instrumental (flauta, piano…).</p>
    </div>
  );
}

// O EFEITO DO TEXTO: ela escolhe como a frase se revela e VÊ-O a animar em loop.
function EfeitoBox({ peca, slide, disabled, busy, onSave }: { peca: Peca; slide: typeof METODOVS_CONTAS_LISTA[number]['slide']; disabled: boolean; busy: boolean; onSave: (efeito: EfeitoTexto) => void }) {
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
    <div className="space-y-1.5">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">efeito do texto (vê a animar)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={prog} efeito={efeito} {...slide} />
      </div>
      <div className="flex flex-wrap gap-1">
        {EFEITOS_TEXTO.map((ef) => (
          <button key={ef.id} type="button" onClick={() => setEfeito(ef.id)} className="text-[0.58rem] px-1.5 py-0.5 rounded-full border"
            style={efeito === ef.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.2)' }}>{ef.label}</button>
        ))}
      </div>
      <button type="button" onClick={() => onSave(efeito)} disabled={disabled}
        className="w-full text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a guardar…' : '💾 guardar efeito'}</button>
    </div>
  );
}

// EDITOR DE TIPOGRAFIA: fonte, tamanho e cores das letras, com pré-visualização ao vivo.
function TipografiaBox({ peca, slide, disabled, busy, onSave }: { peca: Peca; slide: typeof METODOVS_CONTAS_LISTA[number]['slide']; disabled: boolean; busy: boolean; onSave: (t: Tipografia) => void }) {
  const t0 = peca.tipografia ?? {};
  const [fonte, setFonte] = useState<FonteTexto>((t0.fonte as FonteTexto) ?? 'serif');
  const [tamanho, setTamanho] = useState<number>(t0.tamanho ?? 92);
  const [cor, setCor] = useState<string>(t0.cor ?? '#F4ECDD');
  const [corDestaque, setCorDestaque] = useState<string>(t0.corDestaque ?? PAL.destaque);
  const tipo: Tipografia = { fonte, tamanho, cor, corDestaque };
  return (
    <div className="space-y-2">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">tipografia (vê ao vivo)</p>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <KineticSlide texto={peca.texto} destaque={peca.destaque} imageUrl={peca.imageUrl ?? undefined} mundo={MUNDO} prog={1} tipografia={tipo} {...slide} />
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

// AGENDAR: data mais hora no estúdio. Ao agendar, marca aprovado (a trava do cron) —
// publica-se sozinha à hora. A marca da peça mapeia a conta de Instagram (ver Publicar).
function AgendarBox({ agendadoEm, hora, contaNome, disabled, busy, onAgendar, onDesagendar }: { agendadoEm: string | null; hora: string | null; contaNome: string; disabled: boolean; busy: boolean; onAgendar: (data: string, hora: string) => void; onDesagendar: () => void }) {
  const [data, setData] = useState(agendadoEm ?? '');
  const [h, setH] = useState(hora ?? '11:00');
  return (
    <div className="space-y-1.5">
      <p className="text-[0.55rem] uppercase tracking-widest opacity-50">agendar publicação</p>
      <div className="flex gap-1">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="flex-1 text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: PAL.texto }} />
        <input type="time" value={h} onChange={(e) => setH(e.target.value)} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-white/15 bg-black/20 outline-none [color-scheme:dark]" style={{ color: PAL.texto }} />
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => onAgendar(data, h)} disabled={disabled || !data}
          className="flex-1 text-[0.66rem] px-2 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: dz, background: dz, color: bg2 }}>{busy ? 'a agendar…' : '📅 agendar'}</button>
        {agendadoEm && <button type="button" onClick={onDesagendar} disabled={disabled} className="text-[0.62rem] px-2 py-1.5 rounded-lg border border-rose-400/40 text-rose-300 disabled:opacity-50">desagendar</button>}
      </div>
      <p className="text-[0.52rem] opacity-45 leading-snug">Publica-se sozinha na conta {contaNome} à hora marcada; o vídeo é preparado automaticamente. A hora é no teu fuso.</p>
    </div>
  );
}

// ESTÚDIO completo de UMA peça (modal). Espelha o Soulab: prever · texto · legenda ·
// motion · som · letras · efeito · imagem · render · agendar.
function Estudio({ peca, slide, contaNome, acaoSlug, onFechar, acoes }: {
  peca: Peca; slide: typeof METODOVS_CONTAS_LISTA[number]['slide']; contaNome: string; acaoSlug: string | null; onFechar: () => void;
  acoes: {
    salvarTexto: (slug: string, momentos: string[]) => void;
    salvarLegenda: (slug: string, legenda: string, hashtags: string) => void;
    darMovimento: (slug: string, opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => void;
    gerarSom: (slug: string, opts: { remover?: boolean; tipo?: 'cena' | 'musica'; estilo?: string }) => void;
    salvarEfeito: (slug: string, efeito: EfeitoTexto) => void;
    salvarTransicao: (slug: string, t: Transicao) => void;
    salvarTipografia: (slug: string, t: Tipografia) => void;
    salvarTempo: (slug: string, seg: number) => void;
    novaImagem: (slug: string) => void;
    renderizar: (slug: string) => void;
    agendar: (slug: string, data: string, hora: string) => void;
    desagendar: (slug: string) => void;
  };
}) {
  type Sec = 'prever' | 'texto' | 'legenda' | 'motion' | 'som' | 'letras' | 'efeito' | 'agendar';
  const [sec, setSec] = useState<Sec>('prever');
  const busy = acaoSlug === peca.slug;
  const disabled = !!acaoSlug;
  const SECS: { id: Sec; label: string }[] = [
    { id: 'prever', label: '▶ prever' },
    { id: 'texto', label: '✎ texto' },
    { id: 'legenda', label: '📝 legenda' },
    { id: 'motion', label: '🎬 motion' },
    { id: 'som', label: '🔊 som' },
    { id: 'letras', label: '🅰 letras' },
    { id: 'efeito', label: '✶ efeito' },
    { id: 'agendar', label: '📅 agendar' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 md:p-6" onClick={onFechar}>
      <div className="w-full max-w-md rounded-2xl border border-white/12 shadow-2xl" style={{ background: PAL.bg }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-widest opacity-50">estúdio</p>
            <p className="text-[0.8rem] truncate" style={{ color: dz }}>{NOME_FORMATO[peca.formato ?? ''] ?? peca.formato ?? 'revelação'} · véu {peca.veu ?? '—'}</p>
          </div>
          <button onClick={onFechar} className="text-[0.8rem] px-2 py-1 rounded-lg border border-white/20 hover:bg-white/10">fechar ✕</button>
        </div>

        {/* estado + render + imagem rápidos */}
        <div className="px-4 pt-3 flex flex-wrap items-center gap-1.5 text-[0.62rem]">
          {peca.publicado ? <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[#0F0F1A]">✓ publicada</span>
            : peca.agendadoEm ? <span className="px-1.5 py-0.5 rounded text-[#0F0F1A]" style={{ background: dz }}>📅 {peca.agendadoEm.slice(5)} {(peca.hora ?? '').slice(0, 5)}</span>
              : <span className="px-1.5 py-0.5 rounded bg-white/10">✎ por agendar</span>}
          {peca.videoUrl && <span className="px-1.5 py-0.5 rounded bg-sky-600/80 text-white">MP4 pronto</span>}
          {peca.clipUrl && <span className="px-1.5 py-0.5 rounded text-[#0F0F1A]" style={{ background: dz }}>🎬 com vida</span>}
          <button onClick={() => acoes.novaImagem(peca.slug)} disabled={disabled} title="gerar outra imagem (mantém o texto)" className="ml-auto px-2 py-0.5 rounded border border-white/20 disabled:opacity-40">{busy ? '…' : '🖼 outra imagem'}</button>
          <button onClick={() => acoes.renderizar(peca.slug)} disabled={disabled} title="renderizar o reel final (MP4)" className="px-2 py-0.5 rounded border border-white/20 disabled:opacity-40">{busy ? '…' : '🎬 render'}</button>
        </div>

        {peca.videoUrl && (
          <div className="px-4 pt-3">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={peca.videoUrl} controls playsInline className="w-full rounded-lg border border-white/10" />
          </div>
        )}

        {/* separadores das secções do estúdio */}
        <div className="px-4 pt-3 flex flex-wrap gap-1">
          {SECS.map((s) => (
            <button key={s.id} onClick={() => setSec(s.id)} className="text-[0.64rem] px-2 py-1 rounded-full border"
              style={sec === s.id ? { borderColor: dz, background: dz, color: bg2 } : { borderColor: 'rgba(255,255,255,0.18)', color: PAL.texto }}>{s.label}</button>
          ))}
        </div>

        <div className="px-4 py-3">
          {sec === 'prever' && <PreviewBox peca={peca} slide={slide} busy={busy} disabled={disabled} onSaveTempo={(seg) => acoes.salvarTempo(peca.slug, seg)} onSaveTransicao={(t) => acoes.salvarTransicao(peca.slug, t)} />}
          {sec === 'texto' && <TextoBox peca={peca} busy={busy} disabled={disabled} onSave={(moms) => acoes.salvarTexto(peca.slug, moms)} />}
          {sec === 'legenda' && <LegendaBox legenda={peca.legenda ?? ''} hashtags={peca.hashtags} busy={busy} disabled={disabled} onSave={(leg, tags) => acoes.salvarLegenda(peca.slug, leg, tags)} />}
          {sec === 'motion' && <MotionBox clipUrl={peca.clipUrl} busy={busy} disabled={disabled || !peca.imageUrl} onGerar={(opts) => acoes.darMovimento(peca.slug, opts)} />}
          {sec === 'som' && <SomBox peca={peca} busy={busy} disabled={disabled} onGerar={(tipo, estilo) => acoes.gerarSom(peca.slug, { tipo, estilo })} onRemover={() => acoes.gerarSom(peca.slug, { remover: true })} />}
          {sec === 'letras' && <TipografiaBox peca={peca} slide={slide} busy={busy} disabled={disabled} onSave={(t) => acoes.salvarTipografia(peca.slug, t)} />}
          {sec === 'efeito' && <EfeitoBox peca={peca} slide={slide} busy={busy} disabled={disabled} onSave={(ef) => acoes.salvarEfeito(peca.slug, ef)} />}
          {sec === 'agendar' && <AgendarBox agendadoEm={peca.agendadoEm} hora={peca.hora} contaNome={contaNome} busy={busy} disabled={disabled} onAgendar={(d, h) => acoes.agendar(peca.slug, d, h)} onDesagendar={() => acoes.desagendar(peca.slug)} />}
        </div>
      </div>
    </div>
  );
}

function Cartao({ p, onApagar, onAbrir, selecionado, onToggleSel }: { p: Peca; onApagar: (slug: string) => void; onAbrir: (slug: string) => void; selecionado: boolean; onToggleSel: (slug: string) => void }) {
  const [i, setI] = useState(0);
  const n = Math.max(1, p.momentos.length);
  useEffect(() => { if (n <= 1) return; const t = setInterval(() => setI((x) => (x + 1) % n), 2400); return () => clearInterval(t); }, [n]);
  const idx = Math.min(i, n - 1);
  const transNome = TRANSICOES.find((t) => t.id === ((p.transicao as Transicao | null) ?? (p.momentos.length > 1 ? 'deslizar' : null)))?.label;
  return (
    <div className="rounded-2xl border overflow-hidden transition-shadow" style={{ background: '#15131F', borderColor: selecionado ? dz : 'rgba(255,255,255,0.1)', boxShadow: selecionado ? `0 0 0 1px ${dz}` : 'none' }}>
      <div className="relative" style={{ aspectRatio: '1080 / 1920', background: '#0E0B16' }}>
        {p.imageUrl && <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.8)' }} />}
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.3rem', lineHeight: 1.3, color: '#F4ECDD', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>{p.momentos[idx] ?? p.momentos[0] ?? ''}</p>
        </div>
        {/* caixa de seleção (canto superior esquerdo) — barra de ferramentas em lote */}
        <button onClick={() => onToggleSel(p.slug)} title={selecionado ? 'tirar da seleção' : 'selecionar'}
          className="absolute top-2 left-2 w-6 h-6 rounded-md border flex items-center justify-center text-[0.7rem] z-10"
          style={selecionado ? { background: dz, borderColor: dz, color: '#0F0F1A' } : { background: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.5)', color: 'transparent' }}>✓</button>
        {n > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {p.momentos.map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: k === idx ? '#EBAE4A' : 'rgba(255,255,255,0.35)' }} />)}
          </div>
        )}
        {p.videoUrl ? <span className="absolute top-2 right-2 text-[0.55rem] bg-emerald-600/85 text-white rounded px-1.5 py-0.5">MP4</span>
          : p.clipUrl ? <span className="absolute top-2 right-2 text-[0.55rem] rounded px-1.5 py-0.5 text-[#0F0F1A]" style={{ background: '#EBAE4A' }}>🎬</span> : null}
      </div>
      <div className="p-2.5 text-[0.64rem]">
        <p className="truncate" style={{ fontFamily: 'var(--font-serif), serif', fontSize: '0.78rem', color: '#F4ECDD' }}>{NOME_FORMATO[p.formato ?? ''] ?? p.formato ?? 'revelação'}</p>
        <p className="opacity-45 mb-1.5 text-[0.58rem]">véu {p.veu ?? '—'}{p.hora ? ` · ${p.hora.slice(0, 5)}` : ''}{n > 1 && transNome ? ` · ${transNome}` : ''}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {p.publicado ? <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[#0F0F1A]">✓ publicada</span>
            : p.agendadoEm ? <span className="px-1.5 py-0.5 rounded bg-[#C9B6FA]/80 text-[#0F0F1A]">📅 {p.agendadoEm.slice(5)} {(p.hora ?? '').slice(0, 5)}</span>
              : <span className="px-1.5 py-0.5 rounded bg-white/10">✎ por agendar</span>}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <button onClick={() => onAbrir(p.slug)} title="abrir o estúdio: prever, editar texto, legenda, motion, som, render, agendar" className="px-2 py-0.5 rounded border font-medium" style={{ borderColor: '#EBAE4A', color: '#EBAE4A' }}>✦ estúdio</button>
          {!p.publicado && <button onClick={() => onApagar(p.slug)} className="ml-auto px-2 py-0.5 rounded border border-rose-400/40 text-rose-300">✕</button>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// O ESTÚDIO da conta (mãe ou filha). conta = 'mae' | 'ver' | 'vir' | 'viver'.
export default function EstudioVS({ conta }: { conta: MetodoVSContaId }) {
  const cfg = metodoVSConta(conta);
  const dados = CONTAS[cfg.id];
  const ehMae = cfg.id === 'mae';
  const contaNome = ehMae ? 'vivianne.dos.santos' : dados.handle;
  const slide = cfg.slide;

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);
  const [estudioSlug, setEstudioSlug] = useState<string | null>(null);
  const [offset, setOffset] = useState(0); // 0 = esta semana; ▶ para semanas futuras (produzir e pré-datar)
  const [sel, setSel] = useState<Set<string>>(new Set()); // seleção múltipla (barra de ferramentas)
  const [soDaSemana, setSoDaSemana] = useState(false);     // ver só a semana navegada
  const [transLote, setTransLote] = useState<Transicao>('deslizar'); // transição a aplicar em lote

  const recarregar = useCallback(() => {
    fetch(`/api/admin/metodo-vs/list?conta=${cfg.id}`).then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, [cfg.id]);
  useEffect(() => { recarregar(); }, [recarregar]);

  const chamar = useCallback(async (corpo: Record<string, unknown>, etiqueta: string) => {
    if (busy) return;
    setBusy(etiqueta); setErro(null); setMsg('A revelar…');
    try {
      const r = await fetch('/api/admin/metodo-vs/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: cfg.id, ...corpo }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else if (!j.gerados) setMsg('Nada novo (já existiam). Apaga para refazer.');
      else setMsg(`${j.gerados} peça(s) gerada(s).`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, recarregar, cfg.id]);

  const apagar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Apagar esta peça?')) return;
    try { const r = await fetch('/api/admin/metodo-vs/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (r.ok) { setEstudioSlug((s) => (s === slug ? null : s)); recarregar(); } } catch { /* */ }
  }, [recarregar]);

  // estúdio: cada ação corre uma rota (do Soulab por slug, ou a própria do método para
  // a imagem) e recarrega. acaoSlug trava o resto enquanto uma corre.
  const novaImagem = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A gerar outra imagem (Flux)…');
    try {
      const r = await fetch('/api/admin/metodo-vs/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Imagem trocada.');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const renderizar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    if (typeof window !== 'undefined' && !window.confirm('Disparar o RENDER FINAL (MP4)? Demora alguns minutos e corre nos GitHub Actions.\n\nDica: pré-vê primeiro com ▶ prever.')) return;
    setAcaoSlug(slug); setErro(null); setMsg('A disparar o render (alguns minutos)…');
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Render disparado. O MP4 aparece daqui a alguns minutos (recarrega).');
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug]);

  // editar (legenda/efeito/tipografia/tempo) -> rota genérica do Soulab por slug.
  const salvarEditar = useCallback(async (slug: string, corpo: Record<string, unknown>, ok: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar…');
    try {
      const r = await fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...corpo }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg(ok);
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  // o texto dos momentos vive nos slides; gravamos via a rota própria do método.
  const salvarTexto = useCallback(async (slug: string, momentos: string[]) => {
    if (acaoSlug || !momentos.length) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar o texto…');
    try {
      const r = await fetch('/api/admin/metodo-vs/texto', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, momentos }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Texto guardado.');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const salvarLegenda = useCallback((slug: string, legenda: string, hashtags: string) => salvarEditar(slug, { legenda, hashtags }, 'Legenda guardada.'), [salvarEditar]);
  const salvarEfeito = useCallback((slug: string, efeito: EfeitoTexto) => salvarEditar(slug, { efeito }, 'Efeito guardado. O reel usa-o no render.'), [salvarEditar]);
  const salvarTransicao = useCallback((slug: string, transicao: Transicao) => salvarEditar(slug, { transicao }, 'Transição guardada. O reel troca de frase assim.'), [salvarEditar]);
  const salvarTipografia = useCallback((slug: string, tipografia: Tipografia) => salvarEditar(slug, { tipografia }, 'Tipografia guardada.'), [salvarEditar]);
  const salvarTempo = useCallback((slug: string, segPorMomento: number) => salvarEditar(slug, { segPorMomento }, 'Tempo guardado. O render usa este ritmo.'), [salvarEditar]);

  const darMovimento = useCallback(async (slug: string, opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A dar vida à imagem (Kling)… pode demorar 1 a 3 min. Não feches.');
    try {
      const r = await fetch('/api/admin/soulab/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...opts }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Movimento gerado. Vê em cima (o texto entra no render).');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const gerarSom = useCallback(async (slug: string, opts: { remover?: boolean; tipo?: 'cena' | 'musica'; estilo?: string }) => {
    if (acaoSlug) return;
    const { remover, tipo, estilo } = opts;
    setAcaoSlug(slug); setErro(null);
    setMsg(remover ? 'A remover o áudio (volta à música da loja)…' : tipo === 'musica' ? 'A compor a música ambiente (~30-60s)…' : 'A gerar o som da cena (~20-40s)…');
    try {
      const r = await fetch('/api/admin/soulab/som', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, remover, tipo, estilo }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg(remover ? 'Áudio removido.' : 'Áudio gerado. O render usa-o como áudio do reel.');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const agendar = useCallback(async (slug: string, data: string, hora: string) => {
    if (acaoSlug) return;
    if (!data) { setErro('Escolhe a data.'); return; }
    setAcaoSlug(slug); setErro(null); setMsg('A agendar…');
    try {
      // data vem do input 'YYYY-MM-DD' (local) — enviar tal e qual, NUNCA via
      // toISOString. aprovado=true = a trava do cron. Publica na conta da marca.
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data, hora: hora || '11:00', aprovado: true }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Agendada. Publica-se sozinha à hora marcada.');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const desagendar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A desagendar…');
    try {
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: null, aprovado: false }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); } else setMsg('Desagendada.');
      recarregar();
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  // ── SELEÇÃO MÚLTIPLA + barra de ferramentas (edições em lote / apagar em lote) ──
  const toggleSel = useCallback((slug: string) => setSel((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; }), []);
  const limparSel = useCallback(() => setSel(new Set()), []);

  // corre uma ação em CADA peça selecionada (sequencial, salta publicadas quando faz sentido).
  const emLote = useCallback(async (faz: (slug: string) => Promise<Response>, etiqueta: string, podePublicada = true) => {
    if (acaoSlug || busy || !sel.size) return;
    const alvos = pecas.filter((p) => sel.has(p.slug) && (podePublicada || !p.publicado)).map((p) => p.slug);
    if (!alvos.length) { setSel(new Set()); return; }
    setBusy('lote'); setErro(null); setMsg(`${etiqueta} · 0/${alvos.length}…`);
    let feitos = 0;
    for (const slug of alvos) {
      try { const r = await faz(slug); if (r.ok) feitos++; } catch { /* segue */ }
      setMsg(`${etiqueta} · ${feitos}/${alvos.length}…`);
    }
    setMsg(`${etiqueta}: ${feitos}/${alvos.length} feito(s).`);
    setSel(new Set()); setBusy(null); recarregar();
  }, [acaoSlug, busy, sel, pecas, recarregar]);

  const apagarLote = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm(`Apagar ${[...sel].length} peça(s) selecionada(s)? (as publicadas são saltadas)`)) return;
    return emLote((slug) => fetch('/api/admin/metodo-vs/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }), 'A apagar', false);
  }, [emLote, sel]);

  const transicaoLote = useCallback(() => emLote((slug) => fetch('/api/admin/soulab/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, transicao: transLote }) }), 'A aplicar transição'), [emLote, transLote]);

  // agendar em lote: aprova cada peça na SUA data/hora já pré-datada (o passo final de
  // "produzir a próxima semana e deixar agendada"). Salta as que não têm data e as publicadas.
  const agendarLote = useCallback(() => emLote((slug) => {
    const p = pecas.find((x) => x.slug === slug);
    if (!p?.agendadoEm) return Promise.resolve(new Response(null, { status: 400 }));
    return fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: p.agendadoEm.slice(0, 10), hora: p.hora || '11:00', aprovado: true }) });
  }, 'A agendar', false), [emLote, pecas]);

  const pecaAberta = pecas.find((p) => p.slug === estudioSlug) ?? null;

  // a semana navegada (seg→dom) para o filtro "ver só esta semana".
  const semSeg = segundaDaSemana(offset);
  const semDom = new Date(semSeg); semDom.setDate(semSeg.getDate() + 6);
  const dentroDaSemana = (p: Peca) => { if (!p.agendadoEm) return false; const d = p.agendadoEm.slice(0, 10); return d >= dataLocalStr(semSeg) && d <= dataLocalStr(semDom); };
  const pecasVistas = soDaSemana ? pecas.filter(dentroDaSemana) : pecas;
  const ordenadas = [...pecasVistas].sort((a, b) => `${a.agendadoEm ?? '~'}${a.hora ?? ''}`.localeCompare(`${b.agendadoEm ?? '~'}${b.hora ?? ''}`));
  // agrupar por DIA (hierarquia + ritmo): cabeçalho de dia, depois os cartões desse dia.
  const grupos: { chave: string; rotulo: string; itens: Peca[] }[] = [];
  for (const p of ordenadas) {
    const chave = p.agendadoEm ? p.agendadoEm.slice(0, 10) : 'sem-data';
    let g = grupos.find((x) => x.chave === chave);
    if (!g) { g = { chave, rotulo: rotuloDoDia(chave), itens: [] }; grupos.push(g); }
    g.itens.push(p);
  }

  const titulo = ehMae ? 'Método VS · a conta mãe' : `Método VS · ${dados.movimento}`;
  const ancoraDesc = ehMae
    ? 'Vários posts diferentes, voz de autoridade (revelar, não explicar), por um calendário. Cada formato é um ângulo do mesmo véu.'
    : `A voz da revelação, ancorada à confissão desta conta: "${dados.fraseMae}" Todo o post a reconhece, dita de formas novas; o fecho aponta para ${dados.chegada}.`;

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-[0.75rem] opacity-60 hover:opacity-100">← admin</Link>

        {/* separadores das 4 contas (mãe · ver · vir · viver) */}
        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          {METODOVS_CONTAS_LISTA.map((c) => {
            const ativa = c.id === cfg.id;
            const href = c.id === 'mae' ? '/admin/metodo-vs' : `/admin/metodo-vs/${c.id}`;
            return (
              <Link key={c.id} href={href} className="text-[0.72rem] px-2.5 py-1 rounded-full border"
                style={ativa ? { borderColor: c.cor, background: c.cor, color: '#0F0F1A' } : { borderColor: 'rgba(255,255,255,0.18)', color: '#F2E8DC' }}>
                {c.emoji} {c.nome}
              </Link>
            );
          })}
        </div>

        <h1 className="text-2xl mt-3 mb-1" style={{ fontFamily: 'var(--font-serif), serif', color: cfg.cor }}>{titulo}</h1>
        <p className="text-[0.84rem] opacity-75 mb-1">{ancoraDesc}</p>
        <p className="text-[0.7rem] opacity-45 mb-5">Cada peça tem o estúdio completo: prever, texto, legenda, motion, som, tempo, render, agendar. Publica em <b>@{contaNome}</b>. Carrega «✦ estúdio» num cartão.</p>

        {/* CALENDÁRIO · a semana toda de uma vez, com navegação ◀▶ (produzir e pré-datar futuras) */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 mb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setOffset((o) => Math.max(-8, o - 1))} disabled={!!busy || offset <= -8} className="w-6 h-6 rounded-lg border border-white/20 text-[0.7rem] disabled:opacity-30" title="semana anterior">◀</button>
              <span className="text-[0.66rem] uppercase tracking-widest opacity-70 min-w-[11rem] text-center" style={{ color: offset === 0 ? undefined : cfg.cor }}>{rotuloSemana(offset)}</span>
              <button onClick={() => setOffset((o) => Math.min(12, o + 1))} disabled={!!busy || offset >= 12} className="w-6 h-6 rounded-lg border border-white/20 text-[0.7rem] disabled:opacity-30" title="semana seguinte">▶</button>
              {offset !== 0 && <button onClick={() => setOffset(0)} disabled={!!busy} className="text-[0.58rem] px-1.5 py-0.5 rounded border border-white/15 opacity-70">hoje</button>}
            </div>
            <button onClick={() => chamar({ semana: true, offset }, 'semana')} disabled={!!busy} className="px-3 py-1.5 rounded-lg font-medium text-[0.78rem] disabled:opacity-50" style={{ background: cfg.cor, color: '#0F0F1A' }}>{busy === 'semana' ? 'a produzir a semana…' : offset === 0 ? '✦ produzir a semana toda' : '✦ produzir e pré-datar'}</button>
          </div>
          <p className="text-[0.55rem] opacity-45 mb-2">{CALENDARIO.length} posts · {offset > 0 ? 'gera já a semana futura e deixa cada post com a data certa (depois é só agendar no estúdio).' : 'salta os dias que já passaram e os que já existem.'}</p>
          <div className="flex flex-wrap gap-1.5">
            {CALENDARIO.map((s, i) => (
              <span key={i} className="text-[0.6rem] px-2 py-1 rounded-lg border border-white/12 opacity-75" title={`${s.nome} · ${s.hora}`}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][s.wd]} {s.hora.slice(0, 5)} · {NOME_FORMATO[s.formato] ?? s.formato}</span>
            ))}
          </div>
        </div>

        {/* VÁRIOS FORMATOS · gera um de qualquer ângulo (como os tipos do Soulab) */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button onClick={() => chamar({}, 'sorte')} disabled={!!busy} className="px-3 py-2 rounded-lg border border-white/20 text-[0.78rem] hover:border-ambar disabled:opacity-40">{busy === 'sorte' ? '…' : '✦ surpreende-me'}</button>
          <span className="opacity-40 text-[0.7rem]">ou um formato:</span>
          {FORMATOS_LISTA.map((f) => (
            <button key={f.id} onClick={() => chamar({ formato: f.id }, f.id)} disabled={!!busy} className="px-2.5 py-1.5 rounded-lg border border-white/15 text-[0.74rem] hover:border-ambar disabled:opacity-40">{busy === f.id ? '…' : `${f.emoji} ${f.nome}`}</button>
          ))}
        </div>

        {erro && <p className="mb-3 text-[0.82rem] text-rose-300">{erro}</p>}
        {msg && !erro && <p className="mb-3 text-[0.82rem] text-emerald-300">{msg}</p>}

        {/* cabeçalho do feed: contagem + filtro "só a semana navegada" */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <p className="text-[0.66rem] uppercase tracking-widest opacity-50">{pecasVistas.length} peça(s){soDaSemana ? ` · ${rotuloSemana(offset)}` : ''}</p>
          <label className="flex items-center gap-1.5 text-[0.66rem] opacity-80 cursor-pointer select-none">
            <input type="checkbox" checked={soDaSemana} onChange={(e) => setSoDaSemana(e.target.checked)} className="accent-current" style={{ accentColor: cfg.cor }} />
            ver só a semana navegada ({rotuloSemana(offset)})
          </label>
        </div>

        {/* BARRA DE FERRAMENTAS · seleção múltipla (edições em lote / apagar) */}
        {sel.size > 0 && (
          <div className="sticky top-2 z-30 mb-3 rounded-xl border p-2.5 flex items-center gap-2 flex-wrap" style={{ borderColor: cfg.cor, background: '#1B1626', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <span className="text-[0.72rem] font-medium" style={{ color: cfg.cor }}>{sel.size} selecionada(s)</span>
            <span className="opacity-30">·</span>
            {/* aplicar transição a todas as selecionadas */}
            <div className="flex items-center gap-1">
              <span className="text-[0.6rem] opacity-55">transição:</span>
              <select value={transLote} onChange={(e) => setTransLote(e.target.value as Transicao)} className="text-[0.62rem] px-1.5 py-1 rounded-lg border border-white/15 bg-black/30 outline-none [color-scheme:dark]" style={{ color: PAL.texto }}>
                {TRANSICOES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <button onClick={transicaoLote} disabled={!!busy} className="text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: cfg.cor, color: cfg.cor }}>aplicar</button>
            </div>
            <span className="opacity-30">·</span>
            <button onClick={agendarLote} disabled={!!busy} className="text-[0.62rem] px-2 py-1 rounded-lg border disabled:opacity-40" style={{ borderColor: cfg.cor, color: cfg.cor }} title="aprova cada peça na sua data já marcada (publica-se sozinha)">📅 agendar selecionadas</button>
            <button onClick={apagarLote} disabled={!!busy} className="text-[0.62rem] px-2 py-1 rounded-lg border border-rose-400/50 text-rose-300 disabled:opacity-40">🗑 apagar selecionadas</button>
            <button onClick={limparSel} className="ml-auto text-[0.62rem] px-2 py-1 rounded-lg border border-white/20 opacity-75">limpar seleção</button>
          </div>
        )}

        {pecasVistas.length === 0 ? (
          <p className="text-center text-[0.78rem] opacity-50 py-10">{soDaSemana ? 'Nada nesta semana. Produz a semana ou tira o filtro.' : 'Ainda não há peças. Carrega «✦ produzir a semana toda» ou um formato.'}</p>
        ) : (
          <div className="space-y-6">
            {grupos.map((g) => (
              <section key={g.chave}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[0.72rem] uppercase tracking-[0.18em]" style={{ color: cfg.cor }}>{g.rotulo}</h3>
                  <span className="text-[0.58rem] opacity-40">{g.itens.length} post(s)</span>
                  <button onClick={() => setSel((s) => { const n = new Set(s); const todas = g.itens.every((p) => n.has(p.slug)); g.itens.forEach((p) => (todas ? n.delete(p.slug) : n.add(p.slug))); return n; })}
                    className="text-[0.55rem] px-1.5 py-0.5 rounded border border-white/15 opacity-60 hover:opacity-100">selecionar dia</button>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {g.itens.map((p) => <Cartao key={p.slug} p={p} onApagar={apagar} onAbrir={setEstudioSlug} selecionado={sel.has(p.slug)} onToggleSel={toggleSel} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {pecaAberta && (
        <Estudio
          peca={pecaAberta} slide={slide} contaNome={contaNome} acaoSlug={acaoSlug} onFechar={() => setEstudioSlug(null)}
          acoes={{ salvarTexto, salvarLegenda, darMovimento, gerarSom, salvarEfeito, salvarTransicao, salvarTipografia, salvarTempo, novaImagem, renderizar, agendar, desagendar }}
        />
      )}
    </main>
  );
}
