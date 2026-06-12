'use client';

// SÉRIES DIÁRIAS (vivianne.dos.santos) — UMA linha de produção, por série:
//   1 PLANEAR  → gerar o mês (frases únicas + match da pool de motions/áudios)
//   2 PRODUZIR → rever cada dia; copiar prompt → gerar no MJ/Runway → arrastar o vídeo
//   3 RENDER   → moldura + frase + áudio sobre o motion → MP4 (em construção)
//   4 PUBLICAR → ponte para /admin/publicar (já existe lá; não se duplica)
// A série selecionada governa TUDO (VC Sabia e Hoje em Mim nunca se misturam).

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
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

type ProdDia = { slug: string; data: string | null; dia: string | null; frase: string; motionUrl: string | null; motionFonte: string | null; mjPrompt: string; audioMood: string | null; audioUrl: string | null; audioFonte: string | null; videoUrl: string | null; aprovado: boolean };
type BulkRes = { criados: number; semMotion: number; poolErro?: string | null; resumo: { data: string; dia: string; frase: string; motion: string | null; audio: string | null; mj: boolean; mjPrompt?: string }[] };

const Passo = ({ n, titulo, children, sub }: { n: string; titulo: string; sub?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-ocre/20 bg-black/15 p-4 space-y-3">
    <div>
      <p className="text-[0.84rem] font-semibold"><span className="text-ambar mr-1.5">{n}</span>{titulo}</p>
      {sub && <p className="text-[0.62rem] opacity-50 mt-0.5">{sub}</p>}
    </div>
    {children}
  </div>
);

export default function SeriesDiariaPage() {
  const [serie, setSerie] = useState<SerieId>('vcsabia');

  // ── 1 · PLANEAR ──
  const [pool, setPool] = useState<{ motions: number; novos: number; disponiveis?: number; quarentena?: number; quarentenaDias?: number; audios: { mood: string; n: number }[] } | null>(null);
  const [poolErro, setPoolErro] = useState<string | null>(null);
  const [bulkInicio, setBulkInicio] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [bulkDias, setBulkDias] = useState(30);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErro, setBulkErro] = useState<string | null>(null);
  const [bulkSeg, setBulkSeg] = useState(0);
  const [bulkRes, setBulkRes] = useState<BulkRes | null>(null);

  // ── 2 · PRODUZIR ──
  const [prodDias, setProdDias] = useState<ProdDia[] | null>(null);
  const [prodBusy, setProdBusy] = useState(false);
  const [uploadSlug, setUploadSlug] = useState<string | null>(null);
  const [copiadoSlug, setCopiadoSlug] = useState<string | null>(null);
  const [selSlug, setSelSlug] = useState<string | null>(null);
  const [prodProg, setProdProg] = useState(1);
  // ── 3 · RENDER ──
  const [renderBusy, setRenderBusy] = useState(false);
  const [renderMsg, setRenderMsg] = useState<string | null>(null);
  const [rndDe, setRndDe] = useState('');
  const [rndAte, setRndAte] = useState('');
  // ── 4 · PUBLICAR (CSV Metricool) ──
  const [csvPlat, setCsvPlat] = useState<'tiktok' | 'instagram' | 'ambas'>('tiktok');
  const [csvMsg, setCsvMsg] = useState<string | null>(null);

  // ── moldura (preview, colapsável) ──
  const [verMoldura, setVerMoldura] = useState(false);
  const [dia, setDia] = useState('quinta');
  const [frase, setFrase] = useState(EXEMPLOS.vcsabia);
  const [bgUrl, setBgUrl] = useState('');
  const [paleta, setPaleta] = useState<PaletaId>(paletaDoDia('quinta'));
  const [anima, setAnima] = useState(true);
  const [prog, setProg] = useState(1);

  // a SÉRIE governa tudo: pool + produção recarregam sozinhas ao trocar
  useEffect(() => {
    setPool(null); setPoolErro(null);
    fetch(`/api/admin/series-diaria/pool?serie=${serie}`).then((r) => r.json()).then((j) => { if (j.ok) setPool(j); else setPoolErro(j.detalhe ?? j.erro ?? 'erro'); }).catch((e) => setPoolErro(String(e)));
  }, [serie]);

  const carregarProducao = useCallback(async (s: SerieId) => {
    setProdBusy(true);
    try {
      const r = await fetch(`/api/admin/series-diaria/list?serie=${s}`);
      const j = await r.json();
      setProdDias(j.ok ? j.dias : []);
    } catch { setProdDias([]); }
    setProdBusy(false);
  }, []);
  useEffect(() => { setProdDias(null); setSelSlug(null); carregarProducao(serie); }, [serie, carregarProducao]);

  // dia selecionado para o preview montado (à direita) — escolhido da VISTA
  // (a seleção a partir de `visiveis` acontece mais abaixo, depois do filtro)
  useEffect(() => {
    if (!prodDias || !prodDias.length) { setSelSlug(null); return; }
  }, [prodDias]);
  const sel = (prodDias ?? []).find((d) => d.slug === selSlug) ?? null;

  // anima o typewriter no preview montado
  useEffect(() => {
    if (!sel) { setProdProg(1); return; }
    let raf = 0; let start: number | null = null;
    const DUR = 4200, HOLD = 1500, TOTAL = DUR + HOLD;
    const tick = (t: number) => { if (start == null) start = t; setProdProg(Math.min(1, ((t - start) % TOTAL) / DUR)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selSlug, sel?.frase, serie]);

  // ── mexer num SÓ dia (sem tocar no lote): editar / regenerar frase, render ──
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editTxt, setEditTxt] = useState('');
  const [diaBusy, setDiaBusy] = useState<string | null>(null);
  const [diaMsg, setDiaMsg] = useState<string | null>(null);

  async function mexerDia(slug: string, action: 'editar' | 'regenerar', frase?: string) {
    setDiaBusy(slug); setDiaMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/dia', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, action, frase }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      // texto mudou → o MP4 antigo foi invalidado no servidor (volta a "falta render")
      setProdDias((xs) => (xs ?? []).map((d) => d.slug === slug ? { ...d, frase: j.frase, mjPrompt: j.mjPrompt || d.mjPrompt, videoUrl: null } : d));
      setEditSlug(null);
      setDiaMsg(action === 'regenerar' ? '✓ frase nova — renderiza este dia quando estiver a teu gosto.' : '✓ guardado — renderiza este dia para atualizar o MP4.');
    } catch (e) { setDiaMsg('⚠ ' + String(e)); }
    setDiaBusy(null);
  }

  // SOM gerado na app (ElevenLabs) a partir da CENA do motion — match real
  async function gerarSomDia(slug: string) {
    setDiaBusy(slug); setDiaMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/audio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'gerar', slug }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setProdDias((xs) => (xs ?? []).map((d) => d.slug === slug ? { ...d, audioMood: j.mood, audioUrl: j.url, audioFonte: 'gerado', videoUrl: null } : d));
      setDiaMsg('🔊 som gerado da cena do motion — ouve no leitor; renderiza para o meter no MP4.');
    } catch (e) { setDiaMsg('⚠ ' + String(e)); }
    setDiaBusy(null);
  }

  const [sonsBusy, setSonsBusy] = useState(false);
  async function gerarSonsBulk() {
    if (sonsBusy) return;
    const porGerar = (prodDias ?? []).filter((d) => d.audioFonte !== 'gerado' && d.audioFonte !== 'manual').length;
    if (!confirm(`Gerar os sons de ${SERIES[serie].nome} na ElevenLabs (${porGerar} por gerar)?\n\nCada som nasce da cena do motion desse dia — match real. ~poucos segundos por dia.`)) return;
    setSonsBusy(true); setRegMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/gerar-sons', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setRegMsg(`🔊 ${j.gerados ?? 0} som(ns) gerados${j.nota ? ' · ' + j.nota : ''}${j.erros?.length ? ' · ⚠ ' + j.erros.join('; ') : ''}`);
      carregarProducao(serie);
    } catch (e) { setRegMsg('⚠ ' + String(e)); }
    setSonsBusy(false);
  }

  async function renderDia(slug: string) {
    setDiaBusy(slug); setDiaMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slugs: slug, force: true }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setDiaMsg('🎬 render deste dia disparado (~poucos min). Carrega "↻ atualizar" daqui a pouco.');
    } catch (e) { setDiaMsg('⚠ ' + String(e)); }
    setDiaBusy(null);
  }

  async function renderPeriodo(force: boolean) {
    if (renderBusy) return;
    // o período é escolhido por ti (de/até); rende só os dias COM motion nesse intervalo
    const noIntervalo = (prodDias ?? []).filter((d) => d.data && (!rndDe || d.data >= rndDe) && (!rndAte || d.data <= rndAte));
    const comMotion = noIntervalo.filter((d) => d.motionUrl && (force || !d.videoUrl));
    if (!comMotion.length) { setRenderMsg(force ? 'Nenhum dia com motion no período escolhido.' : 'Nada por renderizar no período (ou já têm MP4 — usa "re-render à força").'); return; }
    if (!confirm(`Renderizar ${comMotion.length} dia(s) de ${SERIES[serie].nome}${rndDe || rndAte ? ` (${rndDe || '…'} → ${rndAte || '…'})` : ''}?\n\nCompõe a moldura + áudio sobre cada motion no GitHub Actions (~alguns min).`)) return;
    setRenderBusy(true); setRenderMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slugs: comMotion.map((d) => d.slug).join(','), force: !!force }) });
      const j = await r.json();
      setRenderMsg(r.ok ? `🎬 ${comMotion.length} dia(s) a renderizar no GitHub Actions. Daqui a uns minutos carrega "↻ atualizar" no ② e os MP4 aparecem.` : `⚠ ${j.detalhe ?? j.erro ?? r.status}`);
    } catch (e) { setRenderMsg('⚠ ' + String(e)); }
    setRenderBusy(false);
  }

  // CSV do Metricool: só os dias COM MP4 no período (de/até do passo ③). TikTok
  // por defeito (que ela não consegue agendar de outra forma); pode ser IG ou ambas.
  function baixarCSV() {
    const prontos = (prodDias ?? []).filter((d) => d.videoUrl && d.data && (!rndDe || d.data >= rndDe) && (!rndAte || d.data <= rndAte));
    if (!prontos.length) { setCsvMsg('Nenhum dia COM MP4 no período. Renderiza primeiro (passo ③).'); return; }
    const qs = new URLSearchParams({ serie, plataforma: csvPlat });
    if (rndDe) qs.set('de', rndDe);
    if (rndAte) qs.set('ate', rndAte);
    window.location.href = `/api/admin/series-diaria/csv?${qs.toString()}`;
    setCsvMsg(`⬇ CSV de ${prontos.length} dia(s) (${csvPlat === 'ambas' ? 'TikTok + Instagram' : csvPlat}). Importa no Metricool → agenda em massa.`);
  }

  const trocarSerie = (s: SerieId) => { setSerie(s); setFrase(EXEMPLOS[s]); setBulkRes(null); setBulkErro(null); };

  async function gerarMes() {
    if (bulkBusy) return;
    if (!confirm(`Gerar ${bulkDias} dia(s) de ${SERIES[serie].nome} a partir de ${bulkInicio}?\n\nFica tudo em RASCUNHO — nada publica sem aprovares na Publicar.`)) return;
    setBulkBusy(true); setBulkRes(null); setBulkErro(null); setBulkSeg(0);
    try {
      const r = await fetch('/api/admin/series-diaria/gerar-mes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie, inicio: bulkInicio, dias: bulkDias }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setBulkRes(j); carregarProducao(serie); } else setBulkErro(j.detalhe ?? j.erro ?? `erro ${r.status}`);
    } catch (e) { setBulkErro(`falha de rede: ${String(e)}`); }
    setBulkBusy(false);
  }
  useEffect(() => {
    if (!bulkBusy) return;
    const id = setInterval(() => setBulkSeg((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [bulkBusy]);

  // marca o motion atual como já usado (quarentena 90d) e liberta o dia
  async function queimarMotion(slug: string) {
    if (!confirm('Marcar o motion deste dia como já usado?\n\nEntra em quarentena 90 dias (não volta a ser escolhido) e o dia fica "falta motion" para gerares/carregares outro.')) return;
    setDiaBusy(slug); setDiaMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'queimar', slug }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setProdDias((xs) => (xs ?? []).map((d) => d.slug === slug ? { ...d, motionUrl: null, motionFonte: null, videoUrl: null } : d));
      setDiaMsg('🔁 motion em quarentena. Copia o prompt → gera no MJ → arrasta o novo aqui.');
    } catch (e) { setDiaMsg('⚠ ' + String(e)); }
    setDiaBusy(null);
  }

  async function carregarMotion(slug: string, file: File) {
    setUploadSlug(slug);
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const r1 = await fetch('/api/admin/series-diaria/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'sign', slug, ext }) });
      const j1 = await r1.json();
      if (!r1.ok) throw new Error(j1.detalhe ?? j1.erro);
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
      const { error } = await sb.storage.from(j1.bucket).uploadToSignedUrl(j1.path, j1.token, file, { contentType: file.type || 'video/mp4' });
      if (error) throw error;
      const r2 = await fetch('/api/admin/series-diaria/motion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'set', slug, path: j1.path }) });
      const j2 = await r2.json();
      if (!r2.ok) throw new Error(j2.detalhe ?? j2.erro);
      setProdDias((xs) => (xs ?? []).map((d) => d.slug === slug ? { ...d, motionUrl: j2.url, motionFonte: 'upload' } : d));
    } catch (e) { alert('Falha no upload do motion: ' + String(e)); }
    setUploadSlug(null);
  }

  // ── APAGAR (individual e em bloco, como tudo) ──
  const [apgDe, setApgDe] = useState('');
  const [apgAte, setApgAte] = useState('');
  const [apgBusy, setApgBusy] = useState(false);
  async function apagarDia(slug: string, data: string | null) {
    if (!confirm(`Apagar o dia ${data ?? slug} de ${SERIES[serie].nome}?\n\nApaga a frase/legenda/agendamento deste dia (não toca nos teus vídeos no storage). Não dá para desfazer.`)) return;
    setApgBusy(true);
    try {
      const r = await fetch('/api/admin/series-diaria/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setProdDias((xs) => (xs ?? []).filter((d) => d.slug !== slug));
      setSelSlug(null);
    } catch (e) { alert('Falha ao apagar: ' + String(e)); }
    setApgBusy(false);
  }
  async function apagarPeriodo() {
    if (apgBusy) return;
    const alvo = (prodDias ?? []).filter((d) => d.data && (!apgDe || d.data >= apgDe) && (!apgAte || d.data <= apgAte));
    if (!alvo.length) { setRegMsg('Nenhum dia no intervalo escolhido.'); return; }
    if (!confirm(`Apagar ${alvo.length} dia(s) de ${SERIES[serie].nome}${apgDe || apgAte ? ` (${apgDe || '…'} → ${apgAte || '…'})` : ' (TODOS)'}?\n\nApaga frases/legendas/agendamentos (não toca nos teus vídeos no storage). Não dá para desfazer.`)) return;
    setApgBusy(true); setRegMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie, de: apgDe, ate: apgAte }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setRegMsg(`🗑 ${j.apagados} dia(s) apagados.`);
      carregarProducao(serie);
    } catch (e) { setRegMsg('⚠ ' + String(e)); }
    setApgBusy(false);
  }

  // ── BULK: regenerar frases (o par do "↻ outra frase" por dia) ──
  const [regBusy, setRegBusy] = useState(false);
  const [regMsg, setRegMsg] = useState<string | null>(null);
  async function regenerarFrasesBulk(escopo: 'todas' | 'longas') {
    if (regBusy) return;
    if (!confirm(`Regenerar ${escopo === 'longas' ? 'as frases LONGAS' : 'TODAS as frases'} de ${SERIES[serie].nome}?\n\nReescreve curtas (mantém motion/áudio/data) e invalida os MP4 desses dias (re-renderiza depois). ~1-2 min.`)) return;
    setRegBusy(true); setRegMsg(null);
    try {
      const r = await fetch('/api/admin/series-diaria/regenerar-frases', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ serie, escopo }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.detalhe ?? j.erro);
      setRegMsg(`✓ ${j.atualizados ?? 0} frase(s) reescritas${j.nota ? ` · ${j.nota}` : ''}. Renderiza (o mês ou os dias) para atualizar os MP4.`);
      carregarProducao(serie);
    } catch (e) { setRegMsg('⚠ ' + String(e)); }
    setRegBusy(false);
  }

  // moldura: anima o motion de texto em loop
  useEffect(() => {
    if (!verMoldura || !anima) { setProg(1); return; }
    let raf = 0; let start: number | null = null;
    const DUR = 4200, HOLD = 1500, TOTAL = DUR + HOLD;
    const tick = (t: number) => { if (start == null) start = t; setProg(Math.min(1, ((t - start) % TOTAL) / DUR)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [verMoldura, anima, frase, serie, dia]);

  // ── vista da lista do ②: ARQUIVO automático (passados saem) + filtro por estado ──
  const [verArquivo, setVerArquivo] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'faltaMotion' | 'faltaRender' | 'pronto'>('todos');
  const hojeIso = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const visiveis = (prodDias ?? []).filter((d) => {
    if (!verArquivo && d.data && d.data < hojeIso) return false; // passados = arquivo
    if (filtro === 'faltaMotion') return !d.motionUrl;
    if (filtro === 'faltaRender') return !!d.motionUrl && !d.videoUrl;
    if (filtro === 'pronto') return !!d.videoUrl;
    return true;
  });
  const arquivados = (prodDias ?? []).filter((d) => d.data && d.data < hojeIso).length;
  const semMotion = (prodDias ?? []).filter((d) => !d.motionUrl);

  // a seleção vive sempre dentro da VISTA (nunca aponta a um dia escondido)
  const visiveisKey = visiveis.map((d) => d.slug).join(',');
  useEffect(() => {
    if (!visiveis.length) return;
    if (!selSlug || !visiveis.some((d) => d.slug === selSlug)) setSelSlug(visiveis[0].slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiveisKey]);

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-6 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
      <h1 className="text-2xl font-semibold">Séries diárias</h1>
      <p className="text-[0.76rem] opacity-55 mt-1">Planear → Produzir → Render → Publicar, sempre na série escolhida. (VC Sabia de manhã às {HORA_SERIE.vcsabia} · Hoje em Mim à noite às {HORA_SERIE.hojeemmim}.)</p>

      {/* a SÉRIE governa a página toda */}
      <div className="flex gap-2 mt-4 mb-5">
        {(Object.keys(SERIES) as SerieId[]).map((s) => (
          <button key={s} onClick={() => trocarSerie(s)} className={`text-[0.88rem] px-4 py-2 rounded-xl border ${serie === s ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{SERIES[s].nome} <span className="opacity-50 text-[0.7rem]">· {SERIES[s].momento}</span></button>
        ))}
      </div>

      <div className="max-w-3xl space-y-4">
        {/* ── 1 · PLANEAR ── */}
        <Passo n="①" titulo="Planear · gerar o mês" sub="O Claude escreve as frases (únicas, dia + estação + ritual) e casa cada dia com um motion da pool (novos primeiro; senão melhor match) + áudio por mood.">
          <p className="text-[0.66rem] opacity-60">
            {pool ? <>Pool: <b>{pool.disponiveis ?? pool.motions}</b> motions disponíveis ({pool.novos} novos{pool.quarentena ? <> · <span className="text-[#C9B6FA]">{pool.quarentena} a descansar {pool.quarentenaDias ?? 90} dias</span></> : null}) · áudios: {pool.audios.map((a) => a.mood).join(' · ') || '—'}</>
              : poolErro ? <span className="text-rosa/80">⚠ pool: {poolErro}</span> : 'a ler a pool…'}
          </p>
          <div className="flex items-center gap-2 flex-wrap text-[0.74rem]">
            <label className="flex items-center gap-1.5 opacity-80">início <input type="date" value={bulkInicio} onChange={(e) => setBulkInicio(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
            <label className="flex items-center gap-1.5 opacity-80">dias <input type="number" min={1} max={31} value={bulkDias} onChange={(e) => setBulkDias(Number(e.target.value))} className="w-16 px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
            <button onClick={gerarMes} disabled={bulkBusy} className="text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{bulkBusy ? `⏳ a gerar… ${bulkSeg}s` : `⚡ gerar ${bulkDias} dia(s)`}</button>
          </div>
          {bulkBusy && <p className="text-[0.68rem] text-ambar animate-pulse">⏳ a escrever as frases e a casar motions… 1-2 min, não feches. ({bulkSeg}s)</p>}
          {bulkErro && <p className="text-[0.7rem] text-rosa/90">⚠ {bulkErro}</p>}
          {bulkRes && <p className="text-[0.72rem] text-salvia">✓ {bulkRes.criados} dia(s) criados · {bulkRes.semMotion ? <b className="text-ambar">{bulkRes.semMotion} sem motion (resolve no passo ②)</b> : 'todos com motion da pool'} — a lista está no passo ②.</p>}
        </Passo>

        {/* ── 2 · PRODUZIR ── */}
        <Passo n="②" titulo={`Produzir · ${SERIES[serie].nome}`} sub="Para gerar um motion NOVO: ⧉ copia o prompt → gera no Midjourney/Runway → ⬆ arrasta o vídeo de volta para o dia. Os ♻ da pool já estão prontos.">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => carregarProducao(serie)} disabled={prodBusy} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-[#C9B6FA]/45 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-40">{prodBusy ? 'a ler…' : '↻ atualizar'}</button>
            {prodDias && <span className="text-[0.66rem] opacity-55">{prodDias.length} dias · {prodDias.length - semMotion.length} com motion · <b className={semMotion.length ? 'text-ambar' : ''}>{semMotion.length} por resolver</b></span>}
            <span className="text-[0.6rem] opacity-30">|</span>
            <span className="text-[0.6rem] opacity-50">frases em bulk:</span>
            <button onClick={() => regenerarFrasesBulk('longas')} disabled={regBusy || !prodDias?.length} className="text-[0.66rem] px-2.5 py-1 rounded-full border border-ambar/40 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-30">{regBusy ? '⏳…' : '↻ encurtar as longas'}</button>
            <button onClick={() => regenerarFrasesBulk('todas')} disabled={regBusy || !prodDias?.length} className="text-[0.66rem] px-2.5 py-1 rounded-full border border-ocre/30 text-creme-2/65 hover:border-ambar disabled:opacity-30">↻ regenerar todas</button>
            <span className="text-[0.6rem] opacity-30">|</span>
            <button onClick={gerarSonsBulk} disabled={sonsBusy || !prodDias?.length} className="text-[0.66rem] px-2.5 py-1 rounded-full border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-30">{sonsBusy ? '⏳ a gerar sons…' : '🔊 gerar sons (ElevenLabs)'}</button>
            <span className="text-[0.6rem] opacity-30">|</span>
            <span className="text-[0.6rem] opacity-50">apagar:</span>
            <label className="flex items-center gap-1 text-[0.62rem] opacity-80">de <input type="date" value={apgDe} onChange={(e) => setApgDe(e.target.value)} className="px-1.5 py-0.5 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2 text-[0.62rem]" /></label>
            <label className="flex items-center gap-1 text-[0.62rem] opacity-80">até <input type="date" value={apgAte} onChange={(e) => setApgAte(e.target.value)} className="px-1.5 py-0.5 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2 text-[0.62rem]" /></label>
            <button onClick={apagarPeriodo} disabled={apgBusy || !prodDias?.length} className="text-[0.66rem] px-2.5 py-1 rounded-full border border-[#C97373]/45 bg-[#C97373]/10 text-[#C97373] hover:bg-[#C97373]/20 disabled:opacity-30">{apgBusy ? '⏳…' : '🗑 apagar período'}</button>
          </div>
          {regMsg && <p className="text-[0.66rem] text-ambar">{regMsg}</p>}
          {/* vista: arquivo automático (passados saem) + filtro por estado */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {([['todos', 'todos'], ['faltaMotion', '⚠ falta motion'], ['faltaRender', '🎞 falta render'], ['pronto', '✓ MP4 pronto']] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setFiltro(k)} className={`text-[0.62rem] px-2 py-0.5 rounded-full border ${filtro === k ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/20 text-creme-2/55 hover:border-ambar'}`}>{lbl}</button>
            ))}
            {arquivados > 0 && (
              <button onClick={() => setVerArquivo((v) => !v)} className={`text-[0.62rem] px-2 py-0.5 rounded-full border ${verArquivo ? 'border-[#C9B6FA] bg-[#C9B6FA]/15 text-[#C9B6FA]' : 'border-ocre/20 text-creme-2/55 hover:border-ambar'}`}>{verArquivo ? '▾ a mostrar arquivo' : `📦 arquivo (${arquivados} passados)`}</button>
            )}
            <span className="text-[0.6rem] opacity-45">{visiveis.length} na vista</span>
          </div>
          {prodBusy && !prodDias && <p className="text-[0.7rem] opacity-50">a carregar os dias…</p>}
          {prodDias && prodDias.length === 0 && <p className="text-[0.7rem] opacity-50">Ainda não há dias gerados de {SERIES[serie].nome} — usa o passo ①.</p>}
          {prodDias && prodDias.length > 0 && visiveis.length === 0 && <p className="text-[0.7rem] opacity-50">Nada nesta vista (muda o filtro ou abre o 📦 arquivo).</p>}
          {visiveis.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_270px] gap-4 items-start">
              {/* lista dos dias — clica para ver montado à direita */}
              <div className="space-y-1.5 max-h-[36rem] overflow-y-auto pr-1">
                {visiveis.map((d) => (
                  <button key={d.slug} onClick={() => setSelSlug(d.slug)} className={`w-full text-left flex gap-2.5 items-center rounded-lg border p-2 ${selSlug === d.slug ? 'border-ambar bg-ambar/10' : 'border-ocre/12 bg-black/20 hover:border-ocre/30'}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${d.videoUrl ? 'bg-salvia' : d.motionUrl ? 'bg-[#C9B6FA]' : 'bg-ambar'}`} title={d.videoUrl ? 'MP4 pronto' : d.motionUrl ? 'tem motion' : 'falta motion'} />
                    <span className="font-mono text-[0.58rem] opacity-55 shrink-0 leading-tight w-16">{d.data}<br />{d.dia}</span>
                    <span className="text-[0.74rem] leading-tight line-clamp-2 min-w-0">{d.frase}</span>
                  </button>
                ))}
              </div>
              {/* dia MONTADO (moldura sobre o motion) + áudio + ações */}
              <div className="lg:sticky lg:top-4 space-y-2">
                {sel && (
                  <>
                    <div className="relative w-full max-w-[240px] mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-black">
                      {sel.videoUrl
                        ? <video key={sel.videoUrl} src={sel.videoUrl} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                        : (<>
                            {sel.motionUrl && <video key={sel.motionUrl} src={sel.motionUrl} muted loop autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />}
                            <div className="absolute inset-0"><SerieDiariaSlide serie={serie} frase={sel.frase} dia={sel.dia ?? undefined} paleta={serie === 'hojeemmim' ? paletaDoDia(sel.dia ?? 'quinta') : 'dourado'} prog={prodProg} transparente /></div>
                          </>)}
                    </div>
                    <p className="text-[0.6rem] opacity-55 text-center">{sel.data} · {sel.dia} · {sel.videoUrl ? '🎬 MP4 pronto' : sel.motionUrl ? 'montado (falta render)' : 'falta motion'}</p>
                    {sel.audioUrl
                      ? <div className="flex items-center gap-2"><span className="text-[0.6rem] opacity-60 shrink-0">🔊 {sel.audioMood}{sel.audioFonte === 'gerado' ? ' ✓' : sel.audioFonte === 'manual' ? ' (teu)' : ' (match antigo)'}</span><audio src={sel.audioUrl} controls className="w-full h-7" /></div>
                      : <p className="text-[0.6rem] opacity-40">sem áudio</p>}
                    <button onClick={() => gerarSomDia(sel.slug)} disabled={diaBusy === sel.slug} className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-salvia/45 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-30 w-full">{diaBusy === sel.slug ? '⏳…' : sel.audioFonte === 'gerado' ? '🔊 regenerar som (da cena)' : '🔊 gerar som da cena (ElevenLabs)'}</button>
                    {/* frase: ver / editar à mão / regenerar SÓ este dia */}
                    {editSlug === sel.slug ? (
                      <div className="space-y-1.5">
                        <textarea value={editTxt} onChange={(e) => setEditTxt(e.target.value)} rows={3} className="w-full text-[0.78rem] p-2 rounded-lg border border-ambar/35 bg-[#15131f] text-creme-2 leading-snug" />
                        <div className="flex gap-1.5">
                          <button onClick={() => mexerDia(sel.slug, 'editar', editTxt)} disabled={diaBusy === sel.slug} className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-salvia/50 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-40">{diaBusy === sel.slug ? 'a guardar…' : '✓ guardar'}</button>
                          <button onClick={() => setEditSlug(null)} className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-ocre/25 text-creme-2/60 hover:border-ambar">cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[0.74rem] leading-snug opacity-90 border-l-2 border-ocre/20 pl-2">{sel.frase}</p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditSlug(sel.slug); setEditTxt(sel.frase); }} disabled={diaBusy === sel.slug} className="flex-1 text-[0.66rem] px-2 py-1 rounded-lg border border-ocre/30 text-creme-2/70 hover:border-ambar disabled:opacity-40">✏️ editar</button>
                        <button onClick={() => mexerDia(sel.slug, 'regenerar')} disabled={diaBusy === sel.slug} className="flex-1 text-[0.66rem] px-2 py-1 rounded-lg border border-[#C9B6FA]/40 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-40">{diaBusy === sel.slug ? '⏳…' : '↻ outra frase'}</button>
                      </div>
                      <span className="text-[0.6rem] opacity-55">{sel.motionUrl ? (sel.motionFonte === 'pool' ? '♻ motion da pool' : '⬆ motion teu') : '⚠ sem motion'}</span>
                      {sel.motionUrl && <button onClick={() => queimarMotion(sel.slug)} disabled={diaBusy === sel.slug} className="text-[0.64rem] px-2.5 py-1 rounded-lg border border-[#C97373]/40 text-[#C97373]/85 hover:bg-[#C97373]/10 disabled:opacity-30 text-left">{diaBusy === sel.slug ? '⏳…' : '🔁 já usei este motion (quarentena + trocar)'}</button>}
                      <button onClick={() => { navigator.clipboard.writeText(sel.mjPrompt); setCopiadoSlug(sel.slug); setTimeout(() => setCopiadoSlug(null), 1500); }} disabled={!sel.mjPrompt} className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-30 text-left">{copiadoSlug === sel.slug ? '✓ copiado — cola no MJ/Runway' : '⧉ copiar prompt (gerar motion novo)'}</button>
                      <label className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-[#C9B6FA]/40 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 cursor-pointer text-center">
                        {uploadSlug === sel.slug ? 'a carregar…' : (sel.motionUrl ? '⬆ trocar motion' : '⬆ carregar motion')}
                        <input type="file" accept="video/*" hidden disabled={uploadSlug === sel.slug} onChange={(e) => { const f = e.target.files?.[0]; if (f) carregarMotion(sel.slug, f); e.currentTarget.value = ''; }} />
                      </label>
                      <button onClick={() => renderDia(sel.slug)} disabled={!sel.motionUrl || diaBusy === sel.slug} className="text-[0.66rem] px-2.5 py-1 rounded-lg border border-salvia/45 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-30">🎬 renderizar este dia{sel.videoUrl ? ' (de novo)' : ''}</button>
                      <button onClick={() => apagarDia(sel.slug, sel.data)} disabled={apgBusy} className="text-[0.64rem] px-2.5 py-1 rounded-lg border border-[#C97373]/40 text-[#C97373]/85 hover:bg-[#C97373]/10 disabled:opacity-30">🗑 apagar este dia</button>
                      {diaMsg && <p className="text-[0.62rem] text-ambar">{diaMsg}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Passo>

        {/* ── 3 · RENDER ── */}
        <Passo n="③" titulo="Render · MP4 finais" sub="Escolhe o PERÍODO (de/até; deixa vazio = todos os dias). Compõe a moldura + frase + áudio sobre cada motion no GitHub Actions → MP4 9:16. Só renderiza dias COM motion.">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 text-[0.72rem] opacity-80">de <input type="date" value={rndDe} onChange={(e) => setRndDe(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
            <label className="flex items-center gap-1.5 text-[0.72rem] opacity-80">até <input type="date" value={rndAte} onChange={(e) => setRndAte(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
            <button onClick={() => renderPeriodo(false)} disabled={renderBusy} className="text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{renderBusy ? 'a disparar…' : '🎬 renderizar o período'}</button>
            <button onClick={() => renderPeriodo(true)} disabled={renderBusy} className="text-[0.66rem] px-2.5 py-1 rounded-full border border-ocre/30 text-creme-2/60 hover:border-ambar disabled:opacity-40">re-render à força</button>
            {prodDias && <span className="text-[0.64rem] opacity-55">{prodDias.filter((d) => d.videoUrl).length}/{prodDias.length} com MP4</span>}
          </div>
          {renderMsg && <p className="text-[0.7rem] text-ambar">{renderMsg}</p>}
          <p className="text-[0.62rem] opacity-45">Só renderiza dias COM motion (♻ pool ou ⬆ teu). Os que faltam, resolve no passo ②. Depois carrega "↻ atualizar" no ② para veres os MP4.</p>
        </Passo>

        {/* ── 4 · PUBLICAR ── */}
        <Passo n="④" titulo="Publicar · aprovar e agendar" sub="Instagram publica-se sozinho à hora depois do teu ✓ na Publicar (vivianne.dos.santos). TikTok não dá para agendar aqui — sai por CSV do Metricool, que agenda em massa. Usa o mesmo período (de/até) do passo ③.">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/publicar" className="inline-block text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-salvia/50 bg-salvia/10 text-salvia hover:bg-salvia/20 no-underline">abrir Publicar →</Link>
            <span className="opacity-30">·</span>
            <div className="inline-flex rounded-lg border border-ocre/25 overflow-hidden text-[0.7rem]">
              {([['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['ambas', 'ambas']] as const).map(([k, lbl]) => (
                <button key={k} onClick={() => setCsvPlat(k)} className={`px-2.5 py-1.5 ${csvPlat === k ? 'bg-ambar/15 text-ambar' : 'text-creme-2/60 hover:text-creme-2'}`}>{lbl}</button>
              ))}
            </div>
            <button onClick={baixarCSV} className="text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20">⬇ CSV Metricool</button>
            {prodDias && <span className="text-[0.64rem] opacity-55">{prodDias.filter((d) => d.videoUrl).length} dia(s) com MP4</span>}
          </div>
          {csvMsg && <p className="text-[0.7rem] text-ambar">{csvMsg}</p>}
          <p className="text-[0.62rem] opacity-45">Só entram dias COM MP4 (renderizados no ③). O CSV leva o MP4 (com cache-busting), a legenda longa, data e hora ({HORA_SERIE[serie]}). No Metricool: importar planeamento → CSV.</p>
        </Passo>

        {/* ── moldura (preview, colapsável) ── */}
        <div className="rounded-xl border border-ocre/15 bg-black/10 p-4">
          <button onClick={() => setVerMoldura((v) => !v)} className="text-[0.76rem] opacity-70 hover:opacity-100">{verMoldura ? '▾' : '▸'} 🖼 Moldura (preview do look)</button>
          {verMoldura && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start mt-3">
              <div className="space-y-3">
                {serie === 'hojeemmim' && (
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-wider opacity-50 mb-1.5">Dia da semana · paleta fixa (regente)</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {DIAS.map((d) => (
                        <button key={d} onClick={() => { setDia(d); setPaleta(paletaDoDia(d)); }} className={`text-[0.7rem] px-2.5 py-1 rounded-full border ${dia === d ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/20 text-creme-2/60 hover:border-ambar'}`}>{d}</button>
                      ))}
                    </div>
                    <p className="text-[0.6rem] opacity-55 mt-1">{dia} · regente <b>{REGENTE[dia]}</b> → {PALETAS[paletaDoDia(dia)].nome}</p>
                  </div>
                )}
                <textarea value={frase} onChange={(e) => setFrase(e.target.value)} rows={3} className="w-full text-[0.84rem] p-3 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2 leading-relaxed" />
                <input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="URL de um frame do motion (opcional, só p/ ver sobre fundo real)" className="w-full text-[0.76rem] px-3 py-2 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2" />
                <button onClick={() => setAnima((m) => !m)} className={`text-[0.7rem] px-3 py-1.5 rounded-lg border ${anima ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{anima ? '⏸ parar motion' : '▶ ver motion'}</button>
              </div>
              <div>
                <div className="w-full max-w-[300px] mx-auto">
                  <SerieDiariaSlide serie={serie} frase={frase} dia={dia} bgUrl={bgUrl || undefined} paleta={serie === 'hojeemmim' ? paleta : 'dourado'} prog={prog} />
                </div>
                <p className="text-[0.6rem] opacity-45 text-center mt-2">9:16 · {SERIES[serie].nome}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
