'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { MetodoSlide } from '@/components/admin/MetodoSlide';
import { getConta } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type EstadoPost = { slug: string; conta: string | null; tipo: string | null; texto: string; conceito: string; imageUrl: string | null; texto2: string | null; conceito2: string | null; imageUrl2: string | null; veuReveal: string | null; veuReveal2: string | null; clip: string | null; clip2: string | null; clipTeste: string | null; videoUrl: string | null; legenda: string | null; agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null };

const TIPO_LABEL: Record<string, string> = { reconhecimento: 'Reconhecimento', revelacao: 'Revelação', manifesto: 'Manifesto' };
// pronomes ambíguos (igual ao servidor) para contar/assinalar as que precisam de melhorar
const AMBIG = /\b(ela|ele|elas|eles|dela|dele|delas|deles|isso|isto|aquilo|aquela|aquele|disso|nisso)\b/i;
const DIAS_CAB = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function MetodoContaPage() {
  const params = useParams<{ conta: string }>();
  const conta = getConta(params.conta);
  const [estado, setEstado] = useState<Record<string, EstadoPost>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [lote, setLote] = useState<{ feito: number; total: number } | null>(null);
  const [detalhe, setDetalhe] = useState<EstadoPost | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [melBusy, setMelBusy] = useState<string | null>(null);

  const toggleSel = (slug: string) => setSel((s) => { const n = new Set(s); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; });

  const recarregar = useCallback(() => {
    fetch('/api/admin/metodo/list').then((r) => (r.ok ? r.json() : { estado: {} })).then((j) => setEstado(j.estado ?? {})).catch(() => {});
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const apagarSelecionados = useCallback(async () => {
    if (!sel.size) return;
    if (typeof window !== 'undefined' && !window.confirm(`Apagar ${sel.size} post(s) selecionado(s)? Os já publicados são protegidos (não se apagam).`)) return;
    let n = 0;
    for (const slug of Array.from(sel)) {
      try { const r = await fetch('/api/admin/metodo/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (r.ok) n += 1; } catch { /* segue */ }
    }
    setSel(new Set()); setMsg(`${n} post(s) apagado(s) (os publicados ficaram).`); recarregar();
  }, [sel, recarregar]);


  // gerar o plano (4 semanas) NO SERVIDOR, alinhado ao Plano da Semana: cada post
  // já com a sua DATA e a sua imagem. Corre sozinho mesmo que saias/feches.
  const gerarLote = useCallback(async (semanas = 4) => {
    if (!conta || lote) return;
    setErro(null); setLote({ feito: 0, total: semanas * 7 });
    setMsg('A gerar o TEXTO no servidor, já com a data de cada dia (não gasta créditos de imagem). Podes sair ou fechar. Volta e recarrega.');
    try {
      // a mãe tem pipeline própria: 1 véu/dia, reel de 2 faces (dor -> revelação).
      const endpoint = conta.id === 'mae' ? '/api/admin/metodo/gerar-mae' : '/api/admin/metodo/gerar-lote';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, semanas }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} frases geradas, organizadas por dia. Revê e limpa; depois "gerar imagens em falta" só das que ficarem.`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setLote(null); recarregar(); }
  }, [conta, lote, recarregar]);

  // gera a imagem (Flux) dos posts sem imagem desta conta (sem reescrever texto).
  const [imgBusy, setImgBusy] = useState(false);
  const gerarImagens = useCallback(async () => {
    if (!conta || imgBusy) return;
    setImgBusy(true); setErro(null);
    let totalFeitas = 0;
    try {
      for (let pass = 0; pass < 20; pass++) {
        const r = await fetch('/api/admin/metodo/imagens', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
        const j = await r.json();
        if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); break; }
        totalFeitas += j.feitas ?? 0;
        setMsg(`Imagens: ${totalFeitas} geradas${j.restantes ? `, faltam ${j.restantes}…` : ''}.`);
        recarregar();
        if ((j.feitas ?? 0) === 0 || (j.restantes ?? 0) === 0) break;
      }
    } catch (e) { setErro(String(e)); }
    finally { setImgBusy(false); recarregar(); }
  }, [conta, imgBusy, recarregar]);

  // organizar: dá data (encaixa no plano por tipo->dia) aos posts sem data.
  const [orgBusy, setOrgBusy] = useState(false);
  const organizar = useCallback(async () => {
    if (!conta || orgBusy) return;
    setOrgBusy(true); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/organizar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`${j.datados ?? 0} posts organizados por dia.`);
    } catch (e) { setErro(String(e)); }
    finally { setOrgBusy(false); recarregar(); }
  }, [conta, orgBusy, recarregar]);

  // hora de publicação em MASSA: a Vivianne quer as frases de manhã (11h).
  const [horaInput, setHoraInput] = useState('11:00');
  const [horaBusy, setHoraBusy] = useState(false);
  const definirHora = useCallback(async () => {
    if (!conta || horaBusy) return;
    setHoraBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/hora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, hora: horaInput }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`${j.mudados ?? 0} posts passam a publicar às ${j.hora}.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setHoraBusy(false); }
  }, [conta, horaBusy, horaInput, recarregar]);

  // legenda: editar à mão a legenda de UM post (a Vivianne corrige o texto da
  // publicação). E repor TODAS (Fase 1, sem funil) de uma vez.
  const [legendaTxt, setLegendaTxt] = useState('');
  const [legBusy, setLegBusy] = useState(false);
  useEffect(() => { setLegendaTxt(detalhe?.legenda ?? ''); }, [detalhe]);
  const guardarLegenda = useCallback(async (slug: string) => {
    if (legBusy) return;
    setLegBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/legenda', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, legenda: legendaTxt }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg('Legenda guardada.'); setDetalhe((d) => (d && d.slug === slug ? { ...d, legenda: legendaTxt } : d)); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setLegBusy(false); }
  }, [legBusy, legendaTxt, recarregar]);
  const [reporBusy, setReporBusy] = useState(false);
  const reporLegendas = useCallback(async () => {
    if (!conta || reporBusy) return;
    if (typeof window !== 'undefined' && !window.confirm('Repor a legenda de TODOS os posts desta conta (Fase 1, sem "Comenta X / manual na bio")? As edições manuais serão substituídas.')) return;
    setReporBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/legendas-repor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`${j.repostos ?? 0} legendas repostas (sem funil). Edita à mão as que quiseres afinar.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setReporBusy(false); }
  }, [conta, reporBusy, recarregar]);

  // apagar TUDO desta conta (recomeçar do zero).
  const [apagarBusy, setApagarBusy] = useState(false);
  const apagarTudo = useCallback(async () => {
    if (!conta || apagarBusy) return;
    if (typeof window !== 'undefined' && !window.confirm(`Apagar TODOS os posts gerados de @${conta.handle}? Não dá para desfazer.`)) return;
    setApagarBusy(true); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/apagar-tudo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`${j.apagados ?? 0} posts apagados. Recomeça do zero quando quiseres.`);
    } catch (e) { setErro(String(e)); }
    finally { setApagarBusy(false); recarregar(); }
  }, [conta, apagarBusy, recarregar]);

  // dispara o render (GitHub Actions) de UM slug. O MP4 sai com o @conta.
  const [renderBusy, setRenderBusy] = useState(false);
  const renderOne = useCallback(async (slug: string) => {
    const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
  }, []);

  // renderiza todos os posts gerados desta conta que ainda não têm vídeo.
  const renderFaltam = useCallback(async (faltam: EstadoPost[]) => {
    if (renderBusy || !faltam.length) return;
    setRenderBusy(true); setErro(null); setMsg(null);
    let n = 0;
    for (const e of faltam) { try { await renderOne(e.slug); n += 1; } catch (err) { setErro(String(err)); break; } }
    setRenderBusy(false);
    setMsg(`${n} renders disparados. Cada vídeo demora alguns minutos a aparecer (GitHub Actions). Recarrega daqui a pouco.`);
  }, [renderBusy, renderOne]);

  // BULK: anima os clips em falta de todos os posts da conta (cada face com
  // imagem mas sem clip). Custa ~$0.35 por clip — daí o aviso no botão.
  const [animarLoteBusy, setAnimarLoteBusy] = useState(false);
  const animarFaltam = useCallback(async (faltam: EstadoPost[]) => {
    if (animarLoteBusy || !faltam.length) return;
    if (typeof window !== 'undefined' && !window.confirm(`Animar os clips em falta de ${faltam.length} post(s)? Custa ~$0.35 por clip (até ~${faltam.length * 2} clips). Demora vários minutos.`)) return;
    setAnimarLoteBusy(true); setErro(null); setMsg(null);
    let n = 0;
    for (const e of faltam) {
      setMsg(`a animar ${n + 1}/${faltam.length}…`);
      try { const r = await fetch('/api/admin/metodo/animar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: e.slug }) }); if (r.ok) n += 1; } catch { /* segue */ }
    }
    setAnimarLoteBusy(false); recarregar();
    setMsg(`${n} post(s) animados. Agora "renderizar os que faltam" para os reels com os clips.`);
  }, [animarLoteBusy, recarregar]);

  // descartar (apagar) um post gerado que não presta, na revisão.
  const descartar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar este post?')) return;
    try {
      const r = await fetch('/api/admin/metodo/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) recarregar(); else { const j = await r.json().catch(() => ({})); setErro(j.erro ?? 'erro a apagar'); }
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  // melhorar EM LOTE: reescreve todas as ambíguas desta conta, repetindo até acabar.
  const [melLoteBusy, setMelLoteBusy] = useState(false);
  const melhorarLote = useCallback(async () => {
    if (!conta || melLoteBusy) return;
    setMelLoteBusy(true); setErro(null);
    let total = 0;
    try {
      for (let pass = 0; pass < 20; pass++) {
        const r = await fetch('/api/admin/metodo/melhorar-lote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
        const j = await r.json();
        if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); break; }
        total += j.feitas ?? 0;
        setMsg(`Frases melhoradas: ${total}${j.restantes ? `, faltam ${j.restantes}…` : ''}.`);
        recarregar();
        if ((j.feitas ?? 0) === 0 || (j.restantes ?? 0) === 0) break;
      }
    } catch (e) { setErro(String(e)); }
    finally { setMelLoteBusy(false); recarregar(); }
  }, [conta, melLoteBusy, recarregar]);

  // outra imagem: regenera só a imagem (variação nova), mantém o texto. Para
  // SUBSTITUIR uma imagem que não se quer, sem descartar o post.
  const [novaImgBusy, setNovaImgBusy] = useState<string | null>(null);
  const novaImagem = useCallback(async (slug: string) => {
    if (novaImgBusy) return;
    setNovaImgBusy(slug); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/imagem-uma', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else {
        const urls = (j.imageUrls ?? [j.imageUrl]) as (string | null)[];
        setMsg(urls.length > 1 ? 'Imagens geradas (as 2 faces). Se não gostares, carrega outra vez.' : 'Imagem gerada. Se não gostares, carrega outra vez.');
        setDetalhe((d) => (d && d.slug === slug ? { ...d, imageUrl: urls[0] ?? d.imageUrl, imageUrl2: urls[1] ?? d.imageUrl2, videoUrl: null } : d));
        recarregar();
      }
    } catch (e) { setErro(String(e)); }
    finally { setNovaImgBusy(null); }
  }, [novaImgBusy, recarregar]);

  // TESTE de clip: anima o fundo (imagem -> vídeo, Kling). ~$0.35, ~1-3 min.
  const [animarBusy, setAnimarBusy] = useState<string | null>(null);
  const animar = useCallback(async (slug: string, face?: number) => {
    if (animarBusy) return;
    setAnimarBusy(slug); setErro(null); setMsg('A animar as faces (Kling, ~2-5 min). Cada face vira um clip. Não feches.');
    try {
      const r = await fetch('/api/admin/metodo/animar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(face === undefined ? { slug } : { slug, face }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else {
        const cf = (j.clipsPorFace ?? []) as (string | null)[];
        setMsg(`${j.clips ?? 1} clip(s) pronto(s). O fundo passa a mexer; carrega "renderizar" para o reel final.`);
        setDetalhe((d) => (d && d.slug === slug ? { ...d, clip: cf[0] ?? d.clip, clip2: cf[1] ?? d.clip2 } : d));
        recarregar();
      }
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setAnimarBusy(null); }
  }, [animarBusy, recarregar]);

  // REJEITAR os clips (limpa-os) para regenerar com o movimento contido.
  const rejeitarClips = useCallback(async (slug: string) => {
    try {
      const r = await fetch('/api/admin/metodo/limpar-clips', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!r.ok) { setErro('não consegui limpar os clips'); return; }
      setDetalhe((d) => (d && d.slug === slug ? { ...d, clip: null, clip2: null } : d));
      setMsg('Clips rejeitados. Carrega "animar (clips das faces)" para gerar de novo, com movimento contido.');
      recarregar();
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  // melhorar: reescreve só o texto (tira ambiguidade), mantém a imagem.
  const melhorar = useCallback(async (slug: string) => {
    if (melBusy) return;
    setMelBusy(slug); setErro(null);
    try {
      const r = await fetch('/api/admin/metodo/melhorar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg(`Reescrito: «${j.texto}»`); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setMelBusy(null); }
  }, [melBusy, recarregar]);

  // TEXTO NOVO mantendo a IMAGEM: frase nova na voz certa da conta (mãe = Dualidade),
  // para destravar "imagem boa, texto mau" sem perder a imagem nem gastar imagem.
  const [txtBusy, setTxtBusy] = useState<string | null>(null);
  const textoNovo = useCallback(async (slug: string) => {
    if (txtBusy) return;
    setTxtBusy(slug); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/texto-novo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else { setMsg(`Texto novo (imagem mantida): «${j.texto}»`); setDetalhe((d) => (d && d.slug === slug ? { ...d, texto: j.texto, conceito: j.conceito ?? d.conceito, videoUrl: null } : d)); recarregar(); }
    } catch (e) { setErro(String(e)); }
    finally { setTxtBusy(null); }
  }, [txtBusy, recarregar]);

  if (!conta) {
    return <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-8`}>
      <p>Conta desconhecida. <Link className="underline" href="/admin/metodo">Voltar</Link></p>
    </main>;
  }

  // tudo o que já foi gerado para esta conta (inclui os do lote/IA), para feedback e render.
  // ordem ESTÁVEL (data, depois slug): os cartões não saltam de sítio quando a
  // lista recarrega após melhorar/descartar/gerar.
  const geradosConta = Object.values(estado).filter((e) => e.conta === conta.id).sort((a, b) => (a.agendadoEm ?? '~').localeCompare(b.agendadoEm ?? '~') || a.slug.localeCompare(b.slug));
  const faltamRender = geradosConta.filter((e) => !e.videoUrl);
  const faltamClip = geradosConta.filter((e) => (e.imageUrl && !e.clip) || (e.imageUrl2 && !e.clip2));
  const semImagem = geradosConta.filter((e) => !e.imageUrl).length;
  const ambiguas = geradosConta.filter((e) => e.tipo === 'reconhecimento' && AMBIG.test(e.texto)).length;

  const semData = geradosConta.filter((e) => !e.agendadoEm).length;
  // por dia (a data é o plano): para a grelha de calendário.
  const porDia = new Map<string, EstadoPost[]>();
  for (const e of geradosConta) { const k = e.agendadoEm ?? 'sem data'; (porDia.get(k) ?? porDia.set(k, []).get(k)!).push(e); }
  const semDataList = porDia.get('sem data') ?? [];

  // grelha de calendário: colunas Seg-Dom, linhas as semanas. Vê-se tudo num relance.
  const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); };
  const fmtD = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const segundaDe = (dt: Date) => { const x = new Date(dt); const wd = x.getDay(); x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd)); return x; };
  const datasComPost = geradosConta.filter((e) => e.agendadoEm).map((e) => e.agendadoEm as string).sort();
  const semanasGrade: string[][] = [];
  if (datasComPost.length) {
    let cur = segundaDe(parse(datasComPost[0]));
    const fim = parse(datasComPost[datasComPost.length - 1]);
    let guarda = 0;
    while (cur <= fim && guarda < 30) {
      const ini = new Date(cur);
      semanasGrade.push(Array.from({ length: 7 }, (_, i) => { const d = new Date(ini); d.setDate(ini.getDate() + i); return fmtD(d); }));
      cur = new Date(ini); cur.setDate(ini.getDate() + 7); guarda += 1;
    }
  }

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: `${conta.paleta.bg1}` }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>
            @{conta.handle} <span className="opacity-70 text-base text-[#F2E8DC]">· {conta.movimento}, {conta.essencia}</span>
          </h1>
          <p className="mt-2 text-[0.9rem] opacity-90">{conta.depois}</p>
          <p className="mt-1 text-[0.78rem] opacity-70">Símbolo: {conta.simbolo} · Véus: {conta.veus.join(' + ')} · Vende: {conta.manualNome} (€{conta.manualPrecoEur})</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem]">
            <button onClick={() => gerarLote(4)} disabled={!!lote} className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: conta.cor, color: '#0F0F1A', background: conta.cor }}>gerar 4 semanas (texto, por dia)</button>
            <Link href={`/admin/publicar?conta=${conta.marca}&vista=semana`} className="px-3 py-1.5 rounded-lg border border-white/20">abrir no Publicar (por dia) →</Link>
            {lote && <span className="opacity-80">a gerar no servidor… (~1 min)</span>}
          </div>
          <p className="mt-1 text-[0.68rem] opacity-50">1) Gera só o TEXTO, já com a data de cada dia (não gasta créditos de imagem). 2) Revês e limpas. 3) Só então "gerar imagens em falta" (paga imagem só das que ficam). Podes sair que continua.</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem] border-t border-white/10 pt-3">
            <span className="opacity-80">Gerados: <b style={{ color: conta.cor }}>{geradosConta.length}</b> · com imagem: {geradosConta.length - semImagem} · com vídeo: {geradosConta.length - faltamRender.length}</span>
            {semData > 0 && <button onClick={organizar} disabled={orgBusy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{orgBusy ? 'a organizar…' : `organizar por dias (${semData})`}</button>}
            {semImagem > 0 && <button onClick={gerarImagens} disabled={imgBusy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{imgBusy ? 'a gerar imagens…' : `gerar imagens em falta (${semImagem})`}</button>}
            {geradosConta.length > 0 && <button onClick={melhorarLote} disabled={melLoteBusy || ambiguas === 0} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{melLoteBusy ? 'a melhorar…' : ambiguas === 0 ? 'sem ambíguas' : `melhorar ambíguas (${ambiguas})`}</button>}
            {geradosConta.length > 0 && <button onClick={() => animarFaltam(faltamClip)} disabled={animarLoteBusy || !faltamClip.length} title="anima (Kling) os clips em falta de todos os posts — ~$0.35 por clip" className="px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-300 disabled:opacity-40">{animarLoteBusy ? '🎬 a animar…' : `🎬 animar clips em falta (${faltamClip.length})`}</button>}
            <button onClick={() => renderFaltam(faltamRender)} disabled={renderBusy || !faltamRender.length} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">
              {renderBusy ? 'a disparar render…' : `renderizar os que faltam (${faltamRender.length})`}
            </button>
            {geradosConta.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-2 py-1">
                <span className="opacity-70">hora:</span>
                <input type="time" value={horaInput} onChange={(e) => setHoraInput(e.target.value)} className="bg-transparent text-[#F2E8DC] outline-none [color-scheme:dark]" />
                <button onClick={definirHora} disabled={horaBusy} className="rounded-md px-2 py-0.5 disabled:opacity-40" style={{ background: conta.cor, color: '#0F0F1A' }}>{horaBusy ? '…' : 'aplicar a todas'}</button>
              </span>
            )}
            {geradosConta.length > 0 && <button onClick={reporLegendas} disabled={reporBusy} title="repor as legendas sem o funil de venda (Fase 1)" className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{reporBusy ? 'a repor…' : 'repor legendas (Fase 1)'}</button>}
            {geradosConta.length > 0 && <button onClick={apagarTudo} disabled={apagarBusy} className="px-3 py-1.5 rounded-lg border border-rose-400/40 text-rose-300/90 disabled:opacity-40">{apagarBusy ? 'a apagar…' : 'apagar tudo'}</button>}
          </div>
        </header>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {geradosConta.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">Gerados · calendário <span className="opacity-40">· {geradosConta.length}</span></h2>
            {sel.size > 0 && (
              <div className="mb-3 flex items-center gap-2 flex-wrap text-[0.78rem] rounded-lg border border-rose-400/30 bg-rose-500/5 px-3 py-2">
                <span><b>{sel.size}</b> selecionado(s)</span>
                <button onClick={apagarSelecionados} className="px-3 py-1 rounded-lg border border-rose-400/50 text-rose-200 hover:bg-rose-500/20">apagar selecionados</button>
                <button onClick={() => setSel(new Set())} className="px-3 py-1 rounded-lg border border-white/20 opacity-70">limpar seleção</button>
                <span className="opacity-50">(os publicados ficam protegidos)</span>
              </div>
            )}
            {semanasGrade.length > 0 && (
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="grid grid-cols-7 gap-1 min-w-[700px]">
                  {DIAS_CAB.map((h) => <div key={h} className="text-center text-[0.6rem] uppercase tracking-wider opacity-50 pb-1">{h}</div>)}
                  {semanasGrade.flatMap((semana) => semana.map((d) => {
                    const wd = parse(d).getDay();
                    const fds = wd === 0 || wd === 6;
                    const posts = porDia.get(d) ?? [];
                    return (
                      <div key={d} className={`min-h-[80px] rounded-lg border border-white/10 p-1 ${fds ? 'bg-white/[0.015]' : 'bg-white/[0.035]'}`}>
                        <div className="text-[0.55rem] opacity-40 mb-0.5">{d.slice(8)}</div>
                        {posts.map((e) => (
                          <div key={e.slug} className={`relative mb-1 rounded-md ${sel.has(e.slug) ? 'ring-2 ring-rose-400' : ''}`}>
                            <button onClick={() => setDetalhe(e)} title={e.texto} className="block w-full rounded-md overflow-hidden" style={{ boxShadow: `0 0 0 1.5px ${e.videoUrl ? '#7E9B8E' : !e.imageUrl ? '#C97373aa' : `${conta.cor}66`}` }}>
                              <MetodoSlide texto={e.texto} conta={conta} conceito={e.conceito} veuReveal={e.veuReveal ?? undefined} imageUrl={e.imageUrl ?? undefined} prog={1} />
                            </button>
                            {!e.publicado && <input type="checkbox" checked={sel.has(e.slug)} onClick={(ev) => ev.stopPropagation()} onChange={() => toggleSel(e.slug)} title="selecionar" className="absolute top-1 left-1 z-10 w-4 h-4 cursor-pointer" />}
                            {e.publicado
                              ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5" title="já publicado (protegido)">✓</span>
                              : <button onClick={(ev) => { ev.stopPropagation(); descartar(e.slug); }} title="apagar este post" className="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-black/75 text-rose-300 hover:bg-rose-500/50 text-[0.72rem] leading-none">✕</button>}
                          </div>
                        ))}
                      </div>
                    );
                  }))}
                </div>
              </div>
            )}
            {semDataList.length > 0 && (
              <div className="mt-4">
                <p className="text-[0.7rem] opacity-60 mb-1.5">Sem data ({semDataList.length}): carrega &quot;organizar por dias&quot; no topo para as encaixar no calendário.</p>
                <div className="flex flex-wrap gap-1">
                  {semDataList.map((e) => (
                    <button key={e.slug} onClick={() => setDetalhe(e)} title={e.texto} className="text-[0.58rem] text-left rounded px-1.5 py-1 max-w-[160px] truncate" style={{ background: `${conta.cor}26` }}>{e.texto}</button>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-2 text-[0.62rem] opacity-40">Clica num post para ver grande e agir (renderizar · melhorar · descartar). Barra à esquerda: verde = MP4 pronto, vermelho = sem imagem.</p>
          </section>
        )}
      </div>

      {detalhe && (
        <div onClick={() => setDetalhe(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div onClick={(ev) => ev.stopPropagation()} className="w-full max-w-[440px] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 text-[0.74rem]">
              <button onClick={() => { const i = geradosConta.findIndex((e) => e.slug === detalhe.slug); if (i > 0) setDetalhe(geradosConta[i - 1]); }} className="px-3 py-1.5 rounded-lg border border-white/25 hover:bg-white/10">← anterior</button>
              <span className="opacity-45">{geradosConta.findIndex((e) => e.slug === detalhe.slug) + 1}/{geradosConta.length}</span>
              <button onClick={() => { const i = geradosConta.findIndex((e) => e.slug === detalhe.slug); if (i >= 0 && i < geradosConta.length - 1) setDetalhe(geradosConta[i + 1]); }} className="px-3 py-1.5 rounded-lg border border-white/25 hover:bg-white/10">seguinte →</button>
            </div>
            {detalhe.texto2 ? (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1 text-center">face 1 · a dor</p>
                    <MetodoSlide texto={detalhe.texto} conceito={detalhe.conceito} veuReveal={detalhe.veuReveal ?? undefined} imageUrl={detalhe.imageUrl ?? undefined} conta={conta} anim="typewriter" prog={1} />
                  </div>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1 text-center">face 2 · revelação</p>
                    <MetodoSlide texto={detalhe.texto2} conceito={detalhe.conceito2 ?? undefined} veuReveal={detalhe.veuReveal2 ?? undefined} imageUrl={detalhe.imageUrl2 ?? undefined} conta={conta} anim="reveal" prog={1} />
                  </div>
                </div>
                <p className="text-center text-[0.6rem] opacity-50 mt-1">no reel: a face 1 escreve-se, depois a face 2</p>
              </div>
            ) : (
              <MetodoSlide texto={detalhe.texto} conceito={detalhe.conceito} veuReveal={detalhe.veuReveal ?? undefined} imageUrl={detalhe.imageUrl ?? undefined} conta={conta} prog={1} />
            )}
            {(detalhe.clip || detalhe.clip2) && (
              <div className="mt-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-[0.6rem] uppercase tracking-wider text-emerald-300">clips (movimento real · Kling)</p>
                  <button onClick={() => rejeitarClips(detalhe.slug)} className="text-[0.58rem] px-2 py-0.5 rounded-full border border-rose-400/40 text-rose-300/90">rejeitar clips</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[detalhe.clip, detalhe.clip2].map((c, i) => (
                    <div key={i}>
                      <p className="text-[0.52rem] uppercase tracking-wider opacity-50 mb-0.5 text-center">{i === 0 ? 'face 1' : 'face 2'}</p>
                      {c
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        ? <video src={c} controls autoPlay loop muted playsInline className="w-full rounded-xl border border-emerald-400/30" />
                        : <div className="aspect-[9/16] rounded-xl border border-dashed border-white/15 grid place-items-center text-[0.55rem] opacity-40">sem clip</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap text-[0.72rem]">
              {detalhe.imageUrl && <button onClick={() => animar(detalhe.slug)} disabled={animarBusy === detalhe.slug} title="anima as faces (imagem → vídeo, Kling); o fundo passa a mexer no reel" className="px-2.5 py-1 rounded-lg border border-emerald-400/40 text-emerald-300 disabled:opacity-40">{animarBusy === detalhe.slug ? '🎬 a animar…' : '🎬 animar (clips das faces)'}</button>}
              {detalhe.videoUrl
                ? <a href={detalhe.videoUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg border border-emerald-400/40 text-emerald-300">ver MP4</a>
                : <button onClick={() => renderOne(detalhe.slug).then(() => setMsg('Render disparado. O vídeo aparece daqui a alguns minutos.')).catch((e) => setErro(String(e)))} className="px-2.5 py-1 rounded-lg border border-white/25">renderizar</button>}
              {(() => {
                const faltaFace2 = !!detalhe.texto2 && (!detalhe.imageUrl || !detalhe.imageUrl2);
                const label = !detalhe.imageUrl ? 'gerar imagem' : faltaFace2 ? 'gerar 2.ª imagem' : 'outra imagem';
                return <button onClick={() => novaImagem(detalhe.slug)} disabled={novaImgBusy === detalhe.slug} title={faltaFace2 ? 'gera a imagem da face que falta (mantém a que já tens)' : detalhe.imageUrl ? 'trocar por outra imagem (mantém o texto)' : 'gerar a imagem (fundo) deste post'} className="px-2.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">{novaImgBusy === detalhe.slug ? '…' : label}</button>;
              })()}
              <button onClick={() => textoNovo(detalhe.slug)} disabled={txtBusy === detalhe.slug} title="frase nova na voz da conta (mãe = Dualidade), mantém a imagem" className="px-2.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">{txtBusy === detalhe.slug ? '…' : 'texto novo'}</button>
              <button onClick={() => melhorar(detalhe.slug)} disabled={melBusy === detalhe.slug} title="afina a frase atual (tira ambiguidade), mantém a imagem" className="px-2.5 py-1 rounded-lg border border-white/25 disabled:opacity-40">{melBusy === detalhe.slug ? '…' : 'melhorar'}</button>
              <button onClick={() => { descartar(detalhe.slug); setDetalhe(null); }} className="px-2.5 py-1 rounded-lg border border-rose-400/40 text-rose-300/90">descartar</button>
              <button onClick={() => setDetalhe(null)} className="px-2.5 py-1 rounded-lg border border-white/20">fechar</button>
            </div>
            <p className="text-center text-[0.66rem] opacity-50 mt-2">{TIPO_LABEL[detalhe.tipo ?? ''] ?? detalhe.tipo} · {detalhe.agendadoEm ?? 'sem data'}</p>
            <div className="mt-3">
              <p className="text-[0.66rem] uppercase tracking-wider opacity-50 mb-1">Legenda (edita à mão)</p>
              <textarea value={legendaTxt} onChange={(e) => setLegendaTxt(e.target.value)} rows={7} className="w-full rounded-lg border border-white/15 bg-black/30 p-2 text-[0.78rem] leading-relaxed outline-none focus:border-white/35" />
              <div className="mt-1.5 flex justify-end">
                <button onClick={() => guardarLegenda(detalhe.slug)} disabled={legBusy || legendaTxt === (detalhe.legenda ?? '')} className="px-2.5 py-1 rounded-lg disabled:opacity-40 text-[0.72rem]" style={{ background: conta.cor, color: '#0F0F1A' }}>{legBusy ? '…' : 'guardar legenda'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
