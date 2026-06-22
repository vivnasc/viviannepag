'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { KineticSlide, EFEITOS_TEXTO, type EfeitoTexto } from '@/components/admin/KineticSlide';
import type { Mundo } from '@/lib/estudio-conteudo';
import { SOULAB, TIPOS_SOULAB, SOULAB_MUNDO, SOULAB_SLIDE, sementeAleatoria, type TipoSoulabId } from '@/lib/soulab/marca';
import { MOTION_INGREDIENTES, CAMARA_OPCOES, type CamaraId } from '@/lib/soulab/motion';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

const MUNDO = SOULAB_MUNDO as Mundo; // a paleta 'soulab' vive em PALETAS (Record<string>)

type Peca = {
  slug: string; tipo: string | null; texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; clipUrl: string | null; legenda: string | null;
  hashtags: string[]; fundoPrompt: string | null; efeito: string | null;
  agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null;
};

// O COMPOSITOR DE MOVIMENTO (autonomia): ela escolhe o que mexe — câmara e/ou
// elementos (água, folhagem, pássaro…) — ou descreve por palavras dela. Estado
// local por cartão; só ao carregar "dar movimento" é que chama o Kling.
function MotionBox({ disabled, busy, onGerar }: { disabled: boolean; busy: boolean; onGerar: (opts: { ingredientes: string[]; camara: CamaraId; livre: string }) => void }) {
  const [ing, setIng] = useState<string[]>([]);
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

export default function SoulabPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [tipo, setTipo] = useState<TipoSoulabId>('frase');
  const [tema, setTema] = useState('');
  const [quantos, setQuantos] = useState(1);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);
  const [motionOpen, setMotionOpen] = useState<string | null>(null);
  const [legendaOpen, setLegendaOpen] = useState<string | null>(null);
  const [agendaOpen, setAgendaOpen] = useState<string | null>(null);
  const [efeitoOpen, setEfeitoOpen] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch('/api/admin/soulab/list').then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setErro(null);
    setMsg('A explorar no laboratório (texto + imagem)… pode demorar até 1 min por peça. Volta e recarrega se fechares.');
    try {
      const r = await fetch('/api/admin/soulab/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo, quantos, tema: tema.trim() || undefined }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} peça(s) gerada(s).${j.detalhe ? ` (aviso: ${j.detalhe})` : ''} Revê em baixo, regenera a imagem se quiseres, e renderiza.`);
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(false); }
  }, [busy, tipo, quantos, tema, recarregar]);

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
          <div className="flex flex-wrap items-center gap-2">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="tema livre (opcional) — ou deixa o acaso decidir 🎲"
              className="flex-1 min-w-[200px] text-[0.82rem] px-3 py-2 rounded-lg border border-white/15 bg-black/20 outline-none" style={{ color: SOULAB.paleta.texto }} />
            <button type="button" onClick={() => setTema(sementeAleatoria())} title="uma semente ampla ao acaso (rola outra vez se não te chamar)"
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
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">peças <span className="opacity-40">· {pecas.length}</span></h2>
          {pecas.length === 0 && <p className="text-[0.78rem] opacity-50">Ainda nada. Escolhe um ângulo e carrega &quot;gerar&quot;.</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pecas.map((p) => (
              <div key={p.slug} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="relative">
                  <KineticSlide texto={p.texto} destaque={p.destaque} imageUrl={p.imageUrl ?? undefined} mundo={MUNDO} prog={1} {...SOULAB_SLIDE} />
                  <span className="absolute top-1 left-1 text-[0.5rem] px-1 py-0.5 rounded bg-black/60">{p.tipo ?? 'soulab'}</span>
                  {p.publicado
                    ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5">✓ publicado</span>
                    : p.clipUrl
                      ? <span className="absolute top-1 right-1 text-[0.5rem] rounded px-1 py-0.5 text-white" style={{ background: SOULAB.paleta.destaque, color: SOULAB.paleta.bg2 }}>🎬 com vida</span>
                      : p.videoUrl
                        ? <span className="absolute top-1 right-1 text-[0.5rem] bg-sky-600/80 text-white rounded px-1 py-0.5">MP4</span>
                        : <span className="absolute top-1 right-1 text-[0.5rem] bg-amber-600/80 text-white rounded px-1 py-0.5">imagem</span>}
                </div>
                {p.clipUrl && (
                  <div className="px-2 pt-2">
                    <p className="text-[0.55rem] uppercase tracking-widest opacity-50 mb-1">movimento (sem texto · o texto entra no render)</p>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={p.clipUrl} controls loop muted playsInline className="w-full rounded-lg border border-white/10" />
                  </div>
                )}
                <div className="p-2 flex flex-wrap gap-1 text-[0.62rem]">
                  <button onClick={() => novaImagem(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">imagem</button>
                  <button onClick={() => setMotionOpen(motionOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug || !p.imageUrl} title="escolhe o que mexe e dá vida à imagem" className="px-2 py-1 rounded border disabled:opacity-40" style={{ borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque }}>🎬 movimento {motionOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setEfeitoOpen(efeitoOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="escolhe e vê o efeito do texto a animar" className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">✶ efeito {efeitoOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setLegendaOpen(legendaOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="ver e editar a legenda, hashtags e CTA" className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">📝 legenda {legendaOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => setAgendaOpen(agendaOpen === p.slug ? null : p.slug)} disabled={!!acaoSlug} title="meter data e hora para publicar" className="px-2 py-1 rounded border disabled:opacity-40" style={p.agendadoEm ? { borderColor: SOULAB.paleta.destaque, color: SOULAB.paleta.destaque } : { borderColor: 'rgba(255,255,255,0.2)' }}>📅 {p.agendadoEm ? p.agendadoEm.slice(5) : 'agendar'} {agendaOpen === p.slug ? '▴' : '▾'}</button>
                  <button onClick={() => renderizar(p.slug)} disabled={!!acaoSlug} className="px-2 py-1 rounded border border-white/20 disabled:opacity-40">render</button>
                  {!p.publicado && <button onClick={() => descartar(p.slug)} className="px-2 py-1 rounded border border-rose-400/40 text-rose-300">descartar</button>}
                </div>
                {motionOpen === p.slug && <MotionBox busy={acaoSlug === p.slug} disabled={!!acaoSlug} onGerar={(opts) => darMovimento(p.slug, opts)} />}
                {legendaOpen === p.slug && <LegendaBox legenda={p.legenda ?? ''} hashtags={p.hashtags} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSave={(leg, tags) => salvarLegenda(p.slug, leg, tags)} />}
                {agendaOpen === p.slug && <AgendarBox agendadoEm={p.agendadoEm} hora={p.hora} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onAgendar={(data, h) => agendarPeca(p.slug, data, h)} onDesagendar={() => desagendarPeca(p.slug)} />}
                {efeitoOpen === p.slug && <EfeitoBox peca={p} busy={acaoSlug === p.slug} disabled={!!acaoSlug} onSave={(ef) => salvarEfeito(p.slug, ef)} />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
