'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { semanaEditorialAtual } from '@/lib/veu/planoEditorial';
import { CONTAS, contaDe, nomeConta, type ContaId } from '@/lib/instagram/contas';
import { PostSlide, type PostSlideT } from '@/components/admin/PostSlide';
import { horaDoMetodo } from '@/lib/metodo/agenda';
import type { Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono' });

// ③ PUBLICAR — o planeador da Véu a Véu. NÃO se gera nada aqui (isso é no ②
// Criar). Vês cada post (capa + legenda), aprovas, e publica-se sozinho à hora.
// gerar ≠ publicar: NADA vai para o ar sem estar APROVADO.

type Slide = { tipo?: string; imageUrl?: string | null; kicker?: string; texto?: string; titulo?: string; nota?: string; pontos?: string[]; selo?: string; pal?: string; motionUrl?: string | null; videoUrl?: string | null };
type Dia = { mundo?: Mundo; slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; marca?: string; universo?: string; serie?: string; mundo?: Mundo; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string | null; capaRev?: number; aprovado?: boolean; hora?: string | null; metodo?: { conta?: string } | null };
type Item = { slug: string; title: string; dias: Dia[]; theme: Theme; created_at?: string };

const CAPA_REV = 2;
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico', 'sinais', 'ninguem', 'pensador'];
const CARROSSEL: string[] = []; // já não há carrossel de imagens (sinais/ninguem/pensador passaram a reels MP4)
// melhor hora por formato (best-times editoriais; trocar pelas reais do IG com +100 seguidores)
const HORA_FMT: Record<string, string> = { kinetico: '13:00', domingo: '11:00', sinais: '13:00', ninguem: '13:00', pensador: '20:00', banda: '13:00', heroi: '13:00', infografico: '11:00', aneis: '13:00', reel: '13:00' };

const FMT: Record<string, { emoji: string; label: string }> = {
  kinetico: { emoji: '✨', label: 'Frase com motion' }, domingo: { emoji: '🕊️', label: 'Domingo de Luz' },
  sinais: { emoji: '🔎', label: 'Sinais de que…' }, ninguem: { emoji: '🏮', label: 'O que ninguém te explica' },
  pensador: { emoji: '🕯️', label: 'Uma ideia de…' }, banda: { emoji: '🎭', label: 'Cá em Casa' },
  heroi: { emoji: '🌅', label: 'I am a Hero' }, infografico: { emoji: '📊', label: 'Infográfico' },
  aneis: { emoji: '🎞️', label: 'Carrossel' }, reel: { emoji: '🎬', label: 'Reel' },
};
const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const tipoChave = (it: Item) => (it.theme?.formato === 'reel' ? (it.theme?.subtipo ?? 'reel') : (it.theme?.formato ?? ''));
const fmtDe = (it: Item): { emoji: string; label: string } => {
  // séries diárias têm marca:'loja' (publicam na conta vivianne.dos.santos), mas
  // NÃO são o produto 7 Véus — rótulo próprio por série.
  if (it.theme?.formato === 'serie-diaria') return { emoji: '🎬', label: it.theme?.serie === 'vcsabia' ? 'VC Sabia' : it.theme?.serie === 'hojeemmim' ? 'Hoje em Mim' : 'Série diária' };
  if (contaDe(it.theme, it.slug) === 'loja') return { emoji: '🛍️', label: it.theme?.universo ? `7 Véus · ${it.theme.universo}` : 'Reel · 7 Véus' };
  return FMT[tipoChave(it)] ?? { emoji: '•', label: tipoChave(it) || 'post' };
};
const legendaDe = (it: Item) => { const d = it.dias?.[0]; return [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n'); };
// Método VS = frases da manhã (canon: 11h; a mãe à tarde, 17h). Sem hora
// explícita, usa a hora do método (não o default genérico, que dava 13h/20h).
const horaDe = (it: Item) => it.theme?.hora || (it.theme?.metodo ? horaDoMetodo(it.theme.metodo.conta ?? '') : HORA_FMT[tipoChave(it)]) || '13:00';
// preview de VÍDEO (séries/reels): o MP4 renderizado, ou o motion ainda por
// renderizar — para o cartão mostrar a 1.ª frame quando não há imagem de capa.
const videoDe = (it: Item): string | null => { const d = it.dias?.[0]; const s = d?.slides?.[0]; return d?.videoUrl ?? s?.videoUrl ?? s?.motionUrl ?? null; };
// chave/rótulo de formato para o filtro do export (levar só uma parte: VC Sabia,
// Hoje em Mim, Carrosséis 7 Véus…). Igual à lógica do route do CSV.
const chaveFmt = (it: Item): string => it.theme?.formato === 'serie-diaria' ? (it.theme?.serie || 'serie') : (contaDe(it.theme, it.slug) === 'loja' ? 'veus' : tipoChave(it));
const rotuloFmt = (k: string): string => k === 'vcsabia' ? 'VC Sabia' : k === 'hojeemmim' ? 'Hoje em Mim' : k === 'veus' ? 'Carrosséis 7 Véus' : k === 'serie' ? 'Série diária' : (FMT[k]?.label ?? k);
// ficheiros descarregáveis de um post (vídeo ou imagens), com nome amigável
const mediaDe = (it: Item): { url: string; nome: string }[] => {
  const d = it.dias?.[0];
  if (d?.videoUrl) return [{ url: d.videoUrl, nome: `${it.slug}.mp4` }];
  if (d?.imagens?.length) return d.imagens.map((u, i) => ({ url: u, nome: `${it.slug}-${i + 1}.jpg` }));
  const motion = videoDe(it);
  if (motion) return [{ url: motion, nome: `${it.slug}-motion.mp4` }];
  return [];
};
// baixa um ficheiro (fetch→blob força o download; se o CORS bloquear, abre numa aba para guardar à mão)
async function baixarFicheiro(url: string, nome: string) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    const blob = await r.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  } catch {
    window.open(url, '_blank');
  }
}
// thumbnail de vídeo FIÁVEL: preload=metadata + seek a 0.1s no onLoadedMetadata
// força o browser (Edge/Chrome) a decodificar e PINTAR a 1.ª frame — o truque
// só com "#t=0.1" no src não pinta de forma consistente.
function VideoThumb({ src, className }: { src: string; className?: string }) {
  return (
    <video
      src={src}
      className={className}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => { try { e.currentTarget.currentTime = 0.1; } catch { /* ignora */ } }}
    />
  );
}
const SERIE_ASSINATURA = ['ninguem', 'sinais', 'pensador']; // capa-assinatura no 1.º slide
const mundoDe = (it: Item): Mundo => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'escola';
function mediaPronta(it: Item): boolean {
  const c = tipoChave(it); const d = it.dias?.[0];
  if (contaDe(it.theme, it.slug) === 'loja') return !!d?.videoUrl;
  if (VIDEO.includes(c)) return !!d?.videoUrl;
  if (CARROSSEL.includes(c)) return (d?.imagens?.length ?? 0) >= 2 && it.theme?.capaRev === CAPA_REV;
  if (c === 'infografico') return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1;
  return false;
}
type Estado = 'rascunho' | 'agendado' | 'publicado' | 'erro';
function estadoDe(it: Item): Estado {
  const t = it.theme ?? {};
  if (t.igPublicado || t.publicado) return 'publicado';
  if (t.igStatus?.startsWith('erro')) return 'erro';
  if (t.aprovado) return 'agendado';
  return 'rascunho';
}
const COR: Record<Estado, { bg: string; fg: string; nome: string }> = {
  rascunho: { bg: '#EBAE4A22', fg: '#EBAE4A', nome: 'rascunho' },
  agendado: { bg: '#C9B6FA22', fg: '#C9B6FA', nome: 'agendado' },
  publicado: { bg: '#7E9B8E22', fg: '#7E9B8E', nome: 'publicado' },
  erro: { bg: '#C9737322', fg: '#C97373', nome: 'erro' },
};

export default function PublicarPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [capas, setCapas] = useState<Record<string, string>>({});
  const [vista, setVista] = useState<'semana' | 'mes' | 'feed'>('semana');
  const [offset, setOffset] = useState(0); // semanas (semana) ou meses (mes)
  const [fEstado, setFEstado] = useState<'todos' | Estado>('todos');
  const [fFormato, setFFormato] = useState<string>('todos');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [legenda, setLegenda] = useState<Item | null>(null); // painel de rever
  const [igOk, setIgOk] = useState<boolean | null>(null);
  const [conta, setConta] = useState<ContaId>('veuaveu'); // conta selecionada
  // abre já na conta/vista pedidas por link (ex.: /admin/publicar?conta=versoltar&vista=feed)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('conta'); const v = p.get('vista');
    if (c && CONTAS.some((x) => x.id === c)) setConta(c as ContaId);
    if (v === 'feed' || v === 'semana' || v === 'mes') setVista(v);
  }, []);
  const [pickerLoja, setPickerLoja] = useState(false); // seletor de semana da Loja a colocar
  const [exportar, setExportar] = useState(false); // painel de exportar CSV (Metricool)
  const [expDe, setExpDe] = useState(''); const [expAte, setExpAte] = useState('');
  const [expFmt, setExpFmt] = useState('tudo'); // filtro de formato no export (tudo | vcsabia | hojeemmim | veus | …)
  const [expPlat, setExpPlat] = useState<'tiktok' | 'instagram' | 'ambas'>('tiktok');
  const [copiado, setCopiado] = useState<string | null>(null); // slug do post cuja legenda foi copiada

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list', { cache: 'no-store' });
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapas(j.capas ?? {})).catch(() => {}); }, []);
  useEffect(() => { setIgOk(null); fetch(`/api/admin/ig/status?conta=${conta}`, { cache: 'no-store' }).then((r) => r.json()).then((j) => setIgOk(!!j.ligado)).catch(() => setIgOk(false)); }, [conta]);

  // só o conteúdo DESTA conta (veu.a.veu vs loja) — nunca misturar
  const itensConta = itens.filter((it) => contaDe(it.theme, it.slug) === conta);

  const capaDe = (it: Item): string | null => {
    const d = it.dias?.[0];
    return d?.imagens?.[0] ?? (d?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? capas[tipoChave(it)] ?? null;
  };

  // aplica a capa-assinatura + selo/paleta ao 1.º slide, como na biblioteca,
  // para a pré-visualização visual sair igual ao que é publicado.
  const slidesComCapa = (it: Item): Slide[] => {
    const sub = tipoChave(it);
    const capa = capas[sub];
    const ehAss = SERIE_ASSINATURA.includes(sub);
    return (it.dias?.[0]?.slides ?? []).map((s, i) => {
      if (i !== 0) return s;
      const out: Slide = { ...s };
      if (capa && !out.imageUrl) out.imageUrl = capa;
      if (ehAss) { out.selo = out.selo || (FMT[sub]?.label ?? ''); out.pal = out.pal ?? 'carvao'; }
      return out;
    });
  };

  // grava no theme (optimista) e persiste
  async function setTheme(slug: string, patch: Partial<Theme>) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, ...patch } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...patch }) }).catch(() => {});
  }

  async function publicar(it: Item) {
    if (busy) return;
    if (!confirm(`Publicar JÁ no Instagram (a sério):\n\n“${it.title}”\n\nSe não estiver pronto, preparo e publico sozinho (~10 min) — deixa a página aberta. Continuar?`)) return;
    setBusy(it.slug); setMsg(null);
    const ini = Date.now();
    const tentar = async (): Promise<void> => {
      const r = await fetch('/api/admin/ig/publicar-agora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json().catch(() => ({}));
      if (j.preparando) {
        const mins = Math.floor((Date.now() - ini) / 60000);
        setMsg(`⏳ “${it.title}”: a preparar… (${mins} min) — deixa a página aberta, publica-se sozinho quando estiver pronto.`);
        if (Date.now() - ini < 15 * 60 * 1000) { setTimeout(() => { tentar().catch(() => {}); }, 30000); return; }
        setMsg(`⏳ “${it.title}”: ainda a preparar passados 15 min — tenta daqui a pouco.`); setBusy(null); return;
      }
      if (r.ok) { setMsg(`✓ Publicado: “${it.title}”.`); await carregar(); }
      else { const m = `✗ Não publicou “${it.title}”: ${j.detalhe ?? j.erro ?? r.status}`; setMsg(m); alert(m); }
      setBusy(null);
    };
    try { await tentar(); } catch (e) { setMsg('Erro: ' + String(e)); setBusy(null); }
  }

  // semana mostrada (seg→dom)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dow = hoje.getDay();
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + (vista === 'semana' ? offset : 0) * 7);
  const diasSemana = Array.from({ length: 7 }).map((_, i) => { const d = new Date(segunda); d.setDate(segunda.getDate() + i); return d; });
  const semEd = semanaEditorialAtual(segunda);
  const hojeIso = isoLocal(hoje);

  const passaFiltro = (it: Item) => (fEstado === 'todos' || estadoDe(it) === fEstado) && (fFormato === 'todos' || tipoChave(it) === fFormato);
  const naoPublicados = itensConta.filter((it) => estadoDe(it) !== 'publicado');

  async function aprovarSemana() {
    const isos = new Set(diasSemana.map(isoLocal));
    const alvo = itensConta.filter((it) => it.theme?.agendadoEm && isos.has(it.theme.agendadoEm) && estadoDe(it) === 'rascunho');
    if (!alvo.length) { setMsg('Nada por aprovar nesta semana.'); return; }
    if (!confirm(`Aprovar ${alvo.length} post(s) desta semana? Ficam a publicar-se sozinhos nas suas horas.`)) return;
    for (const it of alvo) await setTheme(it.slug, { aprovado: true });
    setMsg(`✓ ${alvo.length} post(s) aprovados. Publicam-se sozinhos às horas marcadas.`);
  }

  // LIMPAR todos os agendamentos desta conta: tira-os do calendário e deixam de
  // publicar sozinhos, mas NÃO apaga os posts (ficam nas bibliotecas). Para
  // trocar o conteúdo. Os já publicados ficam intactos. Por conta (nunca mistura).
  async function limparAgendamentos() {
    if (busy) return;
    const nome = CONTAS.find((c) => c.id === conta)?.nome ?? conta;
    const alvo = itensConta.filter((it) => it.theme?.agendadoEm && estadoDe(it) !== 'publicado');
    if (!alvo.length) { setMsg(`Não há agendamentos por limpar em ${nome}.`); return; }
    if (!confirm(`Limpar ${alvo.length} agendamento(s) de ${nome}?\n\nOs posts saem do calendário e DEIXAM de publicar sozinhos, mas NÃO são apagados (ficam nas bibliotecas). Os já publicados não são tocados.\n\nContinuar?`)) return;
    setBusy('limpar'); setMsg(null);
    let ok = 0;
    for (const it of alvo) { await setTheme(it.slug, { agendadoEm: null, aprovado: false }); ok++; }
    setBusy(null);
    setMsg(`🧹 ${ok} agendamento(s) limpos em ${nome}. Os posts ficaram por agendar — podes trocar o conteúdo.`);
  }

  // molds da Loja = coleções-semana ainda SEM datas (para "colocar" numa semana)
  const moldesLoja = itens.filter((it) => contaDe(it.theme, it.slug) === 'loja' && !it.theme?.agendadoEm && !it.slug.startsWith('loja-'));
  async function colocarLoja(moldSlug: string) {
    setPickerLoja(false); setMsg(null);
    const seg = isoLocal(diasSemana[0]);
    const r = await fetch('/api/admin/loja/colocar-semana', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: moldSlug, segunda: seg }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { setMsg(`✓ ${j.criados} carrossel(éis) da Loja colocados nesta semana (seg→dom). Revê e aprova.`); await carregar(); }
    else { setMsg(`✗ ${j.detalhe ?? j.erro ?? r.status}`); }
  }

  // importar CSV do Metricool → cria posts (rascunho) na conta selecionada
  async function importarCSV(file?: File | null) {
    if (!file) return;
    setMsg('a ler CSV…');
    try {
      const txt = await file.text();
      const r = await fetch('/api/admin/publicar/importar-csv', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ csv: txt, conta }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setMsg(`✓ ${j.criados} posts importados do CSV para ${conta} (${j.ignorados} linhas não-Instagram ignoradas). Revê e aprova.`); await carregar(); }
      else setMsg(`✗ ${j.detalhe ?? j.erro ?? r.status}`);
    } catch (e) { setMsg('Erro a ler o CSV: ' + String(e)); }
  }

  // exportar CSV do Metricool: os posts DESTA conta no intervalo escolhido, para
  // agendar em massa (sobretudo TikTok, que não publica sozinho daqui).
  const itensConexpo = itensConta.filter((it) => {
    const d = it.theme?.agendadoEm; if (!d || !mediaPronta(it)) return false;
    if (expFmt !== 'tudo' && chaveFmt(it) !== expFmt) return false;
    return (!expDe || d >= expDe) && (!expAte || d <= expAte);
  });
  // formatos disponíveis nesta conta (só os que têm média pronta) → opções do filtro
  const fmtsExport = Array.from(new Set(itensConta.filter(mediaPronta).map(chaveFmt)));
  function exportarCSV() {
    if (!itensConexpo.length) { setMsg('Nenhum post com média pronta no intervalo escolhido (renderiza/prepara primeiro).'); return; }
    const qs = new URLSearchParams({ conta, plataforma: expPlat });
    if (expFmt !== 'tudo') qs.set('formato', expFmt);
    if (expDe) qs.set('de', expDe);
    if (expAte) qs.set('ate', expAte);
    window.location.href = `/api/admin/publicar/exportar-csv?${qs.toString()}`;
    setExportar(false);
    setMsg(`⬇ CSV de ${itensConexpo.length} post(s) (${expPlat === 'ambas' ? 'TikTok + Instagram' : expPlat}). Importa no Metricool → agenda em massa.`);
  }

  // ── componentes ──
  const Cartao = ({ it, compacto }: { it: Item; compacto?: boolean }) => {
    const m = fmtDe(it); const capa = capaDe(it); const e = estadoDe(it); const pronto = mediaPronta(it);
    const vid = capa ? null : videoDe(it);
    return (
      <div onClick={() => setLegenda(it)} className="rounded-xl border border-ocre/15 bg-terra/15 overflow-hidden cursor-pointer hover:border-ambar/40 transition-colors" title="clica para ver o conteúdo">
        <div className="flex gap-3 p-2.5">
          <div className="w-14 h-[4.5rem] shrink-0 rounded-lg overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : vid ? <VideoThumb src={vid} className="w-full h-full object-cover" /> : <span className="text-lg">{m.emoji}</span>}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[0.52rem] px-1.5 py-0.5 rounded-full" style={{ background: COR[e].bg, color: COR[e].fg }}>{COR[e].nome}</span>
              <span className="text-[0.58rem] font-mono opacity-55">{horaDe(it)}</span>
              {!pronto && e !== 'publicado' && <span className="text-[0.5rem] opacity-45">○ prepara ao publicar</span>}
            </div>
            <p className="text-[0.88rem] leading-tight mt-1 line-clamp-2" title={it.title}>{it.title}</p>
            <p className="text-[0.56rem] opacity-50 mt-0.5">{m.emoji} {m.label}</p>
            {!compacto && e !== 'publicado' && (
              <div onClick={(ev) => ev.stopPropagation()} className="flex items-center gap-1.5 mt-2 flex-wrap">
                {e === 'rascunho' && <button onClick={() => setTheme(it.slug, { aprovado: true })} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-[#C9B6FA]/45 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓ aprovar</button>}
                {e === 'agendado' && <button onClick={() => setTheme(it.slug, { aprovado: false })} className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/60 hover:border-ambar">↩ desaprovar</button>}
                {/* ERRO: recuperar — limpa o erro e volta a pôr na fila à mesma hora (self-heal no agendar). Para outra data/hora, muda no 📅 do laboratório ou na vista Feed. */}
                {e === 'erro' && <button onClick={() => setTheme(it.slug, { aprovado: true, igStatus: null })} title="limpa o erro e tenta de novo à hora marcada" className="text-[0.64rem] px-2.5 py-1 rounded-full border border-[#C9B6FA]/45 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">↻ reagendar</button>}
                <button onClick={() => publicar(it)} disabled={busy === it.slug} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy === it.slug ? '…' : '⚡ publicar já'}</button>
                <button onClick={() => setLegenda(it)} className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/55 hover:border-ambar">👁 rever</button>
                <button onClick={async () => { try { await navigator.clipboard.writeText(legendaDe(it)); setCopiado(it.slug); setTimeout(() => setCopiado(null), 1500); } catch {} }} title="copiar a legenda+hashtags" className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/55 hover:border-ambar">{copiado === it.slug ? '✓ copiado' : '📋 legenda'}</button>
                {mediaDe(it)[0] && <button onClick={() => { const ms = mediaDe(it); if (ms.length > 1) setLegenda(it); else baixarFicheiro(ms[0].url, ms[0].nome); }} title="baixar o ficheiro" className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/55 hover:border-ambar">⬇ baixar</button>}
              </div>
            )}
            {e === 'publicado' && <p className="text-[0.6rem] text-salvia mt-2">✓ já no Instagram</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-6 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
      {/* topo: seletor de CONTA (nunca misturar) + estado do Instagram */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {CONTAS.map((c) => (
          <button key={c.id} onClick={() => setConta(c.id)} className={`text-[0.8rem] px-3 py-1.5 rounded-lg border ${conta === c.id ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{c.emoji} {c.nome}</button>
        ))}
        <Link href={`/admin/instagram?conta=${conta}`} className="ml-auto flex items-center gap-2 text-[0.72rem] px-3 py-1.5 rounded-lg border border-ocre/25 text-creme-2/70 hover:border-ambar no-underline">🔑 Instagram <span className="w-2 h-2 rounded-full" style={{ background: igOk == null ? '#888' : igOk ? '#7E9B8E' : '#C97373' }} /></Link>
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Publicar · {CONTAS.find((c) => c.id === conta)?.nome}</h1>
        <span className="text-[0.74rem] opacity-55">vês, aprovas, e publica-se sozinho às horas — nada vai ao ar sem o teu ✓</span>
      </div>

          {/* barra: vistas + filtros + nav */}
          <div className="flex items-center gap-2 flex-wrap mt-4 mb-4">
            <div className="flex rounded-lg border border-ocre/20 overflow-hidden">
              {(['semana', 'mes', 'feed'] as const).map((v) => (
                <button key={v} onClick={() => { setVista(v); setOffset(0); }} className={`text-[0.74rem] px-3 py-1.5 ${vista === v ? 'bg-ambar/15 text-ambar' : 'text-creme-2/65 hover:bg-white/5'}`}>{v === 'semana' ? 'Semana' : v === 'mes' ? 'Mês' : 'Feed'}</button>
              ))}
            </div>
            {vista !== 'feed' && (
              <div className="flex items-center gap-1">
                <button onClick={() => setOffset((o) => o - 1)} className="text-[0.8rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">◀</button>
                <button onClick={() => setOffset(0)} className="text-[0.62rem] px-2 py-1 rounded-full border border-ambar/30 text-ambar/80 hover:bg-ambar/10">hoje</button>
                <button onClick={() => setOffset((o) => o + 1)} className="text-[0.8rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">▶</button>
              </div>
            )}
            <select value={fEstado} onChange={(e) => setFEstado(e.target.value as 'todos' | Estado)} className="text-[0.7rem] px-2 py-1.5 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2">
              <option value="todos">todos os estados</option><option value="rascunho">rascunho</option><option value="agendado">agendado</option><option value="publicado">publicado</option><option value="erro">erro</option>
            </select>
            <select value={fFormato} onChange={(e) => setFFormato(e.target.value)} className="text-[0.7rem] px-2 py-1.5 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2">
              <option value="todos">todos os formatos</option>{Object.entries(FMT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <label className="text-[0.7rem] px-3 py-1.5 rounded-lg border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 cursor-pointer" title={`importa um CSV do Metricool para ${conta}`}>⬆ importar CSV
              <input type="file" accept=".csv,text/csv" hidden onChange={(e) => { importarCSV(e.target.files?.[0]); e.currentTarget.value = ''; }} />
            </label>
            <button onClick={() => { setExpFmt('tudo'); setExportar(true); }} title={`exporta os posts de ${nomeConta(conta)} num intervalo de datas como CSV do Metricool (TikTok)`} className="text-[0.7rem] px-3 py-1.5 rounded-lg border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20">⬇ exportar CSV</button>
            <button onClick={limparAgendamentos} disabled={busy === 'limpar'} title={`tira do calendário TODOS os agendamentos desta conta (não apaga os posts) — para trocar o conteúdo`} className="text-[0.7rem] px-3 py-1.5 rounded-lg border border-[#C97373]/45 bg-[#C97373]/10 text-[#C97373] hover:bg-[#C97373]/20 disabled:opacity-40">{busy === 'limpar' ? 'a limpar…' : '🧹 limpar agendamentos'}</button>
            {vista === 'semana' && (
              <div className="ml-auto flex items-center gap-2">
                {conta === 'loja' && <button onClick={() => setPickerLoja(true)} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20">＋ colocar carrosséis da Loja</button>}
                <button onClick={aprovarSemana} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓✓ aprovar a semana</button>
              </div>
            )}
          </div>

          {msg && <div className="mb-4 text-[0.78rem] text-ambar whitespace-pre-wrap p-3 rounded-lg border border-ambar/25 bg-ambar/5">{msg}</div>}

          {/* VISTA SEMANA */}
          {vista === 'semana' && (
            <>
              <p className="text-[0.72rem] opacity-55 mb-3">Semana de {segunda.getDate()} {MESES[segunda.getMonth()]} · tema: <b className="opacity-80">“{semEd.tema}”</b></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {diasSemana.map((d) => {
                  const iso = isoLocal(d);
                  const posts = itensConta.filter((it) => it.theme?.agendadoEm === iso && passaFiltro(it)).sort((a, b) => horaDe(a).localeCompare(horaDe(b)));
                  return (
                    <div key={iso} className={`rounded-xl border p-2.5 ${iso === hojeIso ? 'border-ambar/40 bg-ambar/5' : 'border-ocre/12 bg-black/10'}`}>
                      <p className="text-[0.7rem] uppercase tracking-wider mb-2 flex items-center gap-2"><span className="text-[#C9B6FA]">{DIAS_PT[d.getDay()]} {d.getDate()}</span>{iso === hojeIso && <span className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-ambar/20 text-ambar normal-case tracking-normal">hoje</span>}</p>
                      <div className="space-y-2">
                        {posts.length === 0 ? <p className="text-[0.6rem] opacity-35 py-3 text-center">—</p> : posts.map((it) => <Cartao key={it.slug} it={it} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VISTA MÊS */}
          {vista === 'mes' && (() => {
            const base = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
            const ini = new Date(base); ini.setDate(1 - ((base.getDay() + 6) % 7)); // começa na segunda
            const celulas = Array.from({ length: 42 }).map((_, i) => { const d = new Date(ini); d.setDate(ini.getDate() + i); return d; });
            return (
              <>
                <p className="text-[0.78rem] opacity-65 mb-3 capitalize">{MESES[base.getMonth()]} {base.getFullYear()}</p>
                <div className="grid grid-cols-7 gap-1 text-center text-[0.58rem] opacity-50 mb-1">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((x) => <div key={x}>{x}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {celulas.map((d) => {
                    const iso = isoLocal(d); const noMes = d.getMonth() === base.getMonth();
                    const posts = itensConta.filter((it) => it.theme?.agendadoEm === iso && passaFiltro(it)).sort((a, b) => horaDe(a).localeCompare(horaDe(b)));
                    return (
                      <button key={iso} onClick={() => { if (posts.length) { setLegenda(posts[0]); } }} className={`min-h-[4.5rem] rounded-lg border p-1 text-left ${iso === hojeIso ? 'border-ambar/50' : 'border-ocre/10'} ${noMes ? 'bg-black/15' : 'bg-transparent opacity-40'}`}>
                        <span className="text-[0.56rem] opacity-55">{d.getDate()}</span>
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {posts.slice(0, 4).map((it) => { const c = capaDe(it); const v = c ? null : videoDe(it); const e = estadoDe(it); return <span key={it.slug} className="w-4 h-5 rounded-sm overflow-hidden bg-black/40 ring-1" style={{ ['--tw-ring-color' as string]: COR[e].fg } as React.CSSProperties}>{c ? <img src={c} alt="" className="w-full h-full object-cover" /> : v ? <VideoThumb src={v} className="w-full h-full object-cover" /> : <span className="text-[0.5rem]">{fmtDe(it).emoji}</span>}</span>; })}
                          {posts.length > 4 && <span className="text-[0.5rem] opacity-50">+{posts.length - 4}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.6rem] opacity-45 mt-2">Toca num dia com posts para os rever. (Para aprovar/publicar usa a vista Semana.)</p>
              </>
            );
          })()}

          {/* VISTA FEED (pré-visualização do perfil) */}
          {vista === 'feed' && (() => {
            const ord = [...naoPublicados.filter(passaFiltro)].sort((a, b) => (b.theme?.agendadoEm ?? '').localeCompare(a.theme?.agendadoEm ?? ''));
            return (
              <>
                <p className="text-[0.72rem] opacity-55 mb-3">Como o teu feed vai ficar (próximos posts, dos mais recentes ao topo). As capas conversam entre si?</p>
                {ord.length === 0 ? <p className="text-[0.8rem] opacity-50 py-8 text-center">Sem posts por publicar.</p> : (
                  <div className="grid grid-cols-3 gap-1 max-w-md">
                    {ord.map((it) => { const c = capaDe(it); const v = c ? null : videoDe(it); const e = estadoDe(it); return (
                      <button key={it.slug} onClick={() => setLegenda(it)} className="relative aspect-[4/5] bg-black/30 overflow-hidden">
                        {c ? <img src={c} alt="" className="w-full h-full object-cover" /> : v ? <VideoThumb src={v} className="w-full h-full object-cover" /> : <span className="grid place-items-center w-full h-full text-xl">{fmtDe(it).emoji}</span>}
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: COR[e].fg }} />
                      </button>
                    ); })}
                  </div>
                )}
              </>
            );
          })()}

      {/* EXPORTAR CSV (Metricool) — posts desta conta num intervalo de datas */}
      {exportar && (
        <div onClick={() => setExportar(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md rounded-2xl border border-ocre/20 bg-[#15131f] p-4 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
            <p className="text-[0.95rem] font-semibold mb-1">Exportar CSV · {nomeConta(conta)}</p>
            <p className="text-[0.72rem] opacity-60 mb-3">Escolhe o intervalo de datas. Gera um CSV do Metricool com os posts que têm média pronta (vídeo/imagens), para agendar em massa — sobretudo o <b>TikTok</b>, que não se publica sozinho daqui.</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <label className="flex items-center gap-1.5 text-[0.72rem] opacity-80">de <input type="date" value={expDe} onChange={(e) => setExpDe(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
              <label className="flex items-center gap-1.5 text-[0.72rem] opacity-80">até <input type="date" value={expAte} onChange={(e) => setExpAte(e.target.value)} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
            </div>
            <div className="inline-flex rounded-lg border border-ocre/25 overflow-hidden text-[0.72rem] mb-3">
              {([['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['ambas', 'ambas']] as const).map(([k, lbl]) => (
                <button key={k} onClick={() => setExpPlat(k)} className={`px-3 py-1.5 ${expPlat === k ? 'bg-ambar/15 text-ambar' : 'text-creme-2/60 hover:text-creme-2'}`}>{lbl}</button>
              ))}
            </div>
            {/* FORMATO: levar só uma parte (ex.: só VC Sabia, ou só carrosséis) */}
            {fmtsExport.length > 1 && (
              <div className="mb-3">
                <p className="text-[0.62rem] opacity-55 mb-1">Formato (leva só uma parte):</p>
                <div className="flex flex-wrap gap-1.5">
                  {['tudo', ...fmtsExport].map((k) => (
                    <button key={k} onClick={() => setExpFmt(k)} className={`text-[0.68rem] px-2.5 py-1 rounded-full border ${expFmt === k ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/60 hover:text-creme-2 hover:border-ambar/40'}`}>{k === 'tudo' ? 'Tudo' : rotuloFmt(k)}</button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[0.66rem] opacity-55 mb-3">{itensConexpo.length} post(s) prontos{expFmt !== 'tudo' ? ` · ${rotuloFmt(expFmt)}` : ''}{expDe || expAte ? ` (${expDe || '…'} → ${expAte || '…'})` : ' (todas as datas)'}.</p>
            <div className="flex items-center gap-2">
              <button onClick={exportarCSV} className="text-[0.76rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20">⬇ descarregar CSV</button>
              <button onClick={() => setExportar(false)} className="text-[0.7rem] opacity-60 hover:opacity-100">fechar ✕</button>
            </div>
          </div>
        </div>
      )}

      {/* SELETOR: que semana de carrosséis da Loja colocar nesta semana */}
      {pickerLoja && (
        <div onClick={() => setPickerLoja(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-4 ${cormorant.variable} ${inter.variable}`}>
            <p className="text-[0.95rem] font-semibold mb-1">Colocar carrosséis da Loja</p>
            <p className="text-[0.72rem] opacity-60 mb-3">Escolhe a semana de carrosséis (7 Véus) para abrir nos dias <b>{isoLocal(diasSemana[0]).split('-').reverse().slice(0,2).join('/')}→{isoLocal(diasSemana[6]).split('-').reverse().slice(0,2).join('/')}</b>.</p>
            <div className="space-y-2">
              {moldesLoja.length === 0 && <p className="text-[0.78rem] opacity-55 py-4 text-center">Nenhuma semana de carrosséis disponível (gera/renderiza em <code>/admin/carrossel</code> primeiro).</p>}
              {moldesLoja.map((it) => (
                <button key={it.slug} onClick={() => colocarLoja(it.slug)} className="w-full text-left p-2.5 rounded-lg border border-ocre/20 bg-black/15 hover:border-ambar">
                  <p className="text-[0.84rem] truncate">{it.title}</p>
                  <p className="text-[0.6rem] opacity-50">{it.theme?.universo ?? ''} · {(it.dias?.length ?? 0)} dias</p>
                </button>
              ))}
            </div>
            <button onClick={() => setPickerLoja(false)} className="mt-3 text-[0.7rem] opacity-60 hover:opacity-100">fechar ✕</button>
          </div>
        </div>
      )}

      {/* PAINEL DE REVER (capa grande + legenda) */}
      {legenda && (() => {
        const it = legenda; const m = fmtDe(it); const capa = capaDe(it); const e = estadoDe(it); const vidCapa = capa ? null : videoDe(it);
        return (
          <div onClick={() => setLegenda(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
            <div onClick={(ev) => ev.stopPropagation()} className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-4 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
              <div className="flex items-start gap-4">
                <div className="w-40 shrink-0 rounded-lg overflow-hidden bg-black/30 aspect-[4/5] grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : vidCapa ? <VideoThumb src={vidCapa} className="w-full h-full object-cover" /> : <span className="text-3xl">{m.emoji}</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><span className="text-[0.56rem] px-1.5 py-0.5 rounded-full" style={{ background: COR[e].bg, color: COR[e].fg }}>{COR[e].nome}</span><span className="text-[0.62rem] opacity-55">{m.emoji} {m.label}</span></div>
                  <p className="text-[1.1rem] leading-tight">{it.title}</p>
                  <div className="flex items-center gap-3 mt-3 text-[0.72rem]">
                    <label className="flex items-center gap-1.5 opacity-80">📅 <input type="date" value={it.theme?.agendadoEm ?? ''} onChange={(ev) => setTheme(it.slug, { agendadoEm: ev.target.value || null })} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
                    <label className="flex items-center gap-1.5 opacity-80">🕐 <input type="time" value={horaDe(it)} onChange={(ev) => setTheme(it.slug, { hora: ev.target.value })} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
                  </div>
                  <p className="text-[0.56rem] opacity-45 mt-1">hora sugerida para {m.label}: {HORA_FMT[tipoChave(it)] ?? '13:00'} (melhor alcance)</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {e === 'rascunho' && <button onClick={() => { setTheme(it.slug, { aprovado: true }); }} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓ aprovar (publica-se à hora)</button>}
                    {e === 'agendado' && <button onClick={() => setTheme(it.slug, { aprovado: false })} className="text-[0.66rem] px-2.5 py-1.5 rounded-lg border border-ocre/25 text-creme-2/65 hover:border-ambar">↩ pôr em rascunho</button>}
                    <button onClick={() => { setLegenda(null); publicar(it); }} disabled={busy === it.slug} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">⚡ publicar já</button>
                  </div>
                </div>
              </div>
              {/* CONTEÚDO REAL do post: vídeo, imagens renderizadas, ou os textos dos slides */}
              {(() => {
                const dia = it.dias?.[0];
                if (dia?.videoUrl) return (
                  <div className="mt-4">
                    <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Conteúdo (vídeo)</p>
                    <video src={dia.videoUrl} controls className="w-full max-h-[55vh] rounded-lg bg-black" />
                  </div>
                );
                if (dia?.imagens?.length) return (
                  <div className="mt-4">
                    <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Conteúdo ({dia.imagens.length} imagens) — desliza →</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {dia.imagens.map((u, i) => <img key={i} src={u} alt={`slide ${i + 1}`} className="h-64 rounded-lg shrink-0" />)}
                    </div>
                  </div>
                );
                // séries sem MP4 ainda: mostra o MOTION cru (a moldura/frase entram no render)
                const motion = videoDe(it);
                if (motion) return (
                  <div className="mt-4">
                    <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Conteúdo (motion — a moldura + frase entram no render do ③)</p>
                    <video src={motion} controls muted playsInline className="w-full max-h-[55vh] rounded-lg bg-black" />
                  </div>
                );
                const slides = slidesComCapa(it);
                if (slides.length) {
                  const ratio = SERIE_ASSINATURA.includes(tipoChave(it)) ? '4:5' : '9:16';
                  return (
                    <div className="mt-4">
                      <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Conteúdo · {slides.length} slides (como vai sair) — desliza →</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {slides.map((s, i) => (
                          <div key={i} className="w-52 shrink-0">
                            <PostSlide slide={s as unknown as PostSlideT} mundo={mundoDe(it)} numero={i + 1} total={slides.length} ratio={ratio} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* para publicar à mão (WhatsApp, etc.): copiar legenda + baixar ficheiros */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ocre/10 pt-3">
                <span className="text-[0.6rem] uppercase tracking-wider opacity-45">para publicar à mão:</span>
                <button onClick={async () => { try { await navigator.clipboard.writeText(legendaDe(it)); setCopiado(it.slug); setTimeout(() => setCopiado(null), 1500); } catch {} }} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20">📋 {copiado === it.slug ? 'copiado!' : 'copiar legenda'}</button>
                {mediaDe(it).map((mm, i, arr) => (
                  <button key={i} onClick={() => baixarFicheiro(mm.url, mm.nome)} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-[#7E9B8E]/45 bg-[#7E9B8E]/10 text-[#9DB6A9] hover:bg-[#7E9B8E]/20">⬇ baixar {arr.length > 1 ? `imagem ${i + 1}` : (it.dias?.[0]?.videoUrl || videoDe(it) ? 'vídeo' : 'imagem')}</button>
                ))}
                {mediaDe(it).length === 0 && <span className="text-[0.66rem] opacity-40">(este post ainda não tem ficheiro pronto)</span>}
              </div>

              <div className="mt-4">
                <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Legenda</p>
                <div className="text-[0.82rem] leading-relaxed whitespace-pre-wrap opacity-90 border-l-2 border-ocre/20 pl-3">{legendaDe(it) || <span className="opacity-40">(sem legenda)</span>}</div>
              </div>
              <button onClick={() => setLegenda(null)} className="mt-4 text-[0.7rem] opacity-60 hover:opacity-100">fechar ✕</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
