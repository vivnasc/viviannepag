'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { PostSlide, type PostSlideT } from '@/components/admin/PostSlide';
import type { Mundo } from '@/lib/estudio-conteudo';
import { semanaEditorialAtual } from '@/lib/veu/planoEditorial';
import { getCurso } from '@/lib/infografico/cursos';
import { contaDe } from '@/lib/instagram/contas';

// orquestração "gerar a semana toda": cada dia → o seu gerador
const ROTA_GEN: Record<string, string> = { kinetico: '/api/admin/reels/gerar', reel: '/api/admin/reels/gerar', banda: '/api/admin/banda/gerar', heroi: '/api/admin/heroi/gerar', infografico: '/api/admin/infografico/gerar' };

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });

// Agenda da "Véu a Véu" = o ÚNICO sítio de agendamento. Em cada dia pões um post
// JÁ gerado (escolhido da biblioteca Conteúdos), baixas e marcas publicado.
// Geras nos geradores → aparece em Conteúdos → agendas aqui → publicas.

type Slide = PostSlideT & { imageUrl?: string | null };
type Dia = { mundo?: Mundo; slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string };
type Theme = { formato?: string; subtipo?: string; mundo?: Mundo; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string; marca?: string; universo?: string; curso?: string };
type Item = { slug: string; title: string; dias: Dia[]; theme: Theme };

const FMT: Record<string, { emoji: string; label: string; href: string }> = {
  banda: { emoji: '🎭', label: 'Cá em Casa', href: '/admin/banda' },
  heroi: { emoji: '🌅', label: 'I am a Hero', href: '/admin/heroi' },
  infografico: { emoji: '📊', label: 'Infográfico', href: '/admin/infografico' },
  aneis: { emoji: '🎞️', label: 'Carrossel', href: '/admin/carrossel-veu' },
  kinetico: { emoji: '✨', label: 'Frase com motion', href: '/admin/reels' },
  sinais: { emoji: '🔎', label: 'Sinais de que…', href: '/admin/reels' },
  ninguem: { emoji: '🏮', label: 'O que ninguém te explica', href: '/admin/reels' },
  pergunta: { emoji: '💬', label: 'Pergunta', href: '/admin/reels' },
  glossario: { emoji: '📖', label: 'Glossário da Alma', href: '/admin/reels' },
  pensador: { emoji: '🕯️', label: 'Uma ideia de…', href: '/admin/reels' },
  domingo: { emoji: '🕊️', label: 'Domingo de Luz', href: '/admin/reels' },
  reel: { emoji: '🎬', label: 'Reel', href: '/admin/reels' },
};
const tipoChave = (it: Item) => (it.theme?.formato === 'reel' ? (it.theme?.subtipo ?? 'reel') : (it.theme?.formato ?? ''));
const fmtDe = (it: Item) => FMT[tipoChave(it)] ?? { emoji: '•', label: tipoChave(it) || 'outro', href: '#' };
const capaDe = (it: Item) => (it.dias?.[0]?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? null;
// sugestão de formato por dia (só dica, não obriga)
const SUG: Record<number, string> = { 1: '✨ Frase com motion', 2: '🔎 Sinais de que…', 3: '💡 O que ninguém · 🕯️ Uma ideia de…', 4: '🎭 Cá em Casa', 5: '🌅 I am a Hero', 6: '📊 Infográfico', 0: '🕊️ Domingo de Luz' };
// formato(s) planeado(s) de cada dia. Quarta (3) leva 2 (dia de maior audiência).
const DIA_FORMATO: Record<number, string[]> = { 1: ['kinetico'], 2: ['sinais'], 3: ['ninguem', 'pensador'], 4: ['banda'], 5: ['heroi'], 6: ['infografico'], 0: ['domingo'] };
// formatos que SÃO vídeo (precisam de render MP4); já não há carrossel de imagens na veu.a.veu
const VIDEO_FORMATOS = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico', 'sinais', 'ninguem', 'pensador'];
const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const HORA = '13:00';
// horas ÓPTIMAS por dia (best-times do Metricool: meio-dia + fim de dia), por slot.
// A quarta (2 posts) reparte-se: meio-dia e fim de dia.
const HORAS: Record<number, string[]> = {
  1: ['13:00'],          // seg · Frase com motion
  2: ['13:00'],          // ter · Sinais
  3: ['13:00', '20:00'], // qua · O que ninguém (meio-dia) + Uma ideia de… (fim de dia)
  4: ['13:00'],          // qui · Cá em Casa
  5: ['13:00'],          // sex · I am a Hero
  6: ['11:00'],          // sáb · Infográfico (manhã de fim de semana)
  0: ['11:00'],          // dom · Domingo de Luz (manhã)
};
const horaDoSlot = (wd: number, k: number) => HORAS[wd]?.[k] ?? HORAS[wd]?.[0] ?? HORA;
// nome de pasta/ficheiro seguro (sem acentos, sem espaços)
const slugSeguro = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 40);
const mundoDe = (it: Item): Mundo => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'escola';
// cache-busting para o MP4 (re-render fica no mesmo URL; o CDN podia servir o antigo)
const semCacheUrl = (u: string) => u + (u.includes('?') ? '&' : '?') + 'v=' + Date.now();

export default function AgendaPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = esta semana, +1 = próxima…
  const [gerSemana, setGerSemana] = useState<{ feito: number; total: number; msg: string } | null>(null);
  const [gerandoSemana, setGerandoSemana] = useState(false); // true só enquanto corre (permite repetir)
  const [picker, setPicker] = useState<string | null>(null); // iso do dia a preencher
  const [pickerFmt, setPickerFmt] = useState<string | null>(null); // formato do slot clicado (filtra o seletor)
  const [verTodos, setVerTodos] = useState(false); // no seletor, mostrar todos os formatos
  const abrirPicker = (iso: string, fmt?: string) => { setPickerFmt(fmt ?? null); setVerTodos(false); setPicker(iso); };
  // capas-assinatura por série (para a capa do 1.º slide de sinais/ninguém no ZIP)
  const [capasSerie, setCapasSerie] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list');
    // A Agenda é SÓ da veu.a.veu: NUNCA mostrar conteúdo da loja nem de outras
    // contas (importadas por CSV). Filtra pela conta detetada (theme + slug).
    if (r.ok) setItens((((await r.json()).contos ?? []) as Item[]).filter((it) => contaDe(it.theme, it.slug) === 'veuaveu'));
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapasSerie(j.capas ?? {})).catch(() => {}); }, []);

  async function patch(slug: string, p: { agendadoEm?: string | null; publicado?: boolean }) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, ...p } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...p }) }).catch(() => {});
  }

  // APAGAR DE VEZ (≠ ✕ que só tira do dia): remove o post da biblioteca. Pede
  // confirmação porque é destrutivo e não tem volta.
  async function apagar(it: Item) {
    if (typeof window !== 'undefined' && !window.confirm(`Apagar DE VEZ este post?\n\n“${it.title}”\n\nNão tem volta (≠ ✕, que só o tira do dia).`)) return;
    setItens((prev) => prev.filter((x) => x.slug !== it.slug));
    await fetch('/api/admin/conteudos/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) }).catch(() => {});
  }

  // a semana mostrada, de segunda a domingo. semanaOffset: 0 = esta, +1 = próxima…
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dow = hoje.getDay(); // 0=domingo..6=sábado
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + semanaOffset * 7);
  const dias = Array.from({ length: 7 }).map((_, i) => { const d = new Date(segunda); d.setDate(segunda.getDate() + i); return d; });
  const hojeIso = isoLocal(hoje);
  // tema editorial DESTA semana (para o "gerar a semana toda")
  const semEd = semanaEditorialAtual(segunda);
  // os 7 dias (seg→dom) de uma semana qualquer, por offset (para o bulk)
  const diasDaSemana = (offset: number) => {
    const seg = new Date(hoje); seg.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7);
    return Array.from({ length: 7 }).map((_, i) => { const d = new Date(seg); d.setDate(seg.getDate() + i); return d; });
  };

  const porAgendar = itens.filter((it) => !it.theme?.agendadoEm); // disponíveis para pôr num dia
  const totalAgendados = itens.filter((it) => it.theme?.agendadoEm).length;

  // os posts agendados PARA ESTA SEMANA, por ordem do dia (seg→dom)
  const isoSemana = dias.map(isoLocal);
  // TODOS os posts agendados da semana (não só um por dia: a quarta tem 2)
  const semana = isoSemana.flatMap((iso, i) =>
    itens.filter((x) => x.theme?.agendadoEm === iso).map((it) => ({ iso, ordem: i + 1, diaPt: DIAS_PT[dias[i].getDay()], it })),
  );

  // aplica a capa-assinatura + selo/paleta da série ao 1.º slide, como na biblioteca
  // (resolve à hora de mostrar: posts antigos também ganham capa e cabeçalho)
  const SERIE_ASSINATURA = ['ninguem', 'sinais', 'pensador'];
  const CARROSSEL_FORMATOS: string[] = []; // sinais/ninguem/pensador passaram a reels 9:16 (MP4); já não saem 4:5
  const slidesComCapa = (it: Item): Slide[] => {
    const sub = it.theme?.subtipo ?? '';
    const capa = capasSerie[sub];
    const ehAssinatura = SERIE_ASSINATURA.includes(sub);
    const nome = FMT[sub]?.label ?? '';
    return (it.dias?.[0]?.slides ?? []).map((s, i) => {
      if (i !== 0) return s;
      const out: Slide = { ...s };
      if (capa && !s.imageUrl) out.imageUrl = capa;
      if (ehAssinatura) { out.selo = s.selo || nome; out.pal = s.pal ?? 'carvao'; }
      return out;
    });
  };
  const legendaDe = (it: Item): string => {
    const d = it.dias?.[0];
    return [it.title, '', d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter((x) => x !== undefined).join('\n').trim();
  };

  // ── descarregar TODO o material da semana num ZIP (PNG dos slides + legenda.txt + MP4) ──
  const hostRef = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState(false);
  const [zipMsg, setZipMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!baixando) return;
    (async () => {
      try {
        const { toPng } = await import('html-to-image');
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        // dados FRESCOS: apanha os MP4s já renderizados (a página em memória pode estar desatualizada)
        const fresh: Record<string, Item> = {};
        try { const fr = await fetch('/api/admin/conteudos/list', { cache: 'no-store' }); if (fr.ok) for (const x of ((await fr.json()).contos ?? []) as Item[]) fresh[x.slug] = x; } catch { /* usa o que há em memória */ }
        const videoUrlDe = (it: Item) => fresh[it.slug]?.dias?.[0]?.videoUrl ?? it.dias?.[0]?.videoUrl;
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 600)); // deixa as imagens de fundo carregar
        const imgs = Array.from(hostRef.current?.querySelectorAll('img') ?? []);
        await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })));
        await new Promise((r) => setTimeout(r, 200));

        let mp4Incluidos = 0, mp4Falta = 0;
        for (const ent of semana) {
          const m = fmtDe(ent.it);
          const pasta = zip.folder(`${ent.ordem}-${ent.diaPt}-${slugSeguro(m.label)}`)!;
          // PNG de cada slide
          const nodes = hostRef.current?.querySelectorAll<HTMLElement>(`[data-post="${ent.it.slug}"] [data-slide]`);
          if (nodes) for (let i = 0; i < nodes.length; i++) {
            const url = await toPng(nodes[i], { pixelRatio: 1, cacheBust: true });
            pasta.file(`slide-${String(i + 1).padStart(2, '0')}.png`, url.split(',')[1], { base64: true });
          }
          // legenda + hashtags
          pasta.file('legenda.txt', legendaDe(ent.it));
          // MP4 já renderizado (dados frescos). Se for formato de vídeo e ainda não houver, conta como em falta.
          const videoUrl = videoUrlDe(ent.it);
          const ehVideo = VIDEO_FORMATOS.includes(tipoChave(ent.it));
          if (videoUrl) {
            try { const blob = await (await fetch(videoUrl, { cache: 'no-store' })).blob(); pasta.file('reel.mp4', blob); mp4Incluidos++; } catch { /* fica sem o MP4 */ }
          } else if (ehVideo) { mp4Falta++; }
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `veuaveu-semana-${isoSemana[0]}.zip`; a.click(); URL.revokeObjectURL(a.href);
        setZipMsg(`Pronto: ${semana.length} post(s), ${mp4Incluidos} MP4 incluído(s)${mp4Falta ? `, ${mp4Falta} ainda por renderizar (carrega "🎬 renderizar MP4s da semana", espera ~10 min e volta a baixar)` : ''}.`);
      } catch (e) { setZipMsg('Falhou o download: ' + String(e)); }
      setBaixando(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baixando]);

  // ── renderizar todos os MP4s EM FALTA da semana (dispara o GitHub Actions p/ cada um) ──
  const mp4Pendentes = semana.filter((e) => VIDEO_FORMATOS.includes(tipoChave(e.it)) && !e.it.dias?.[0]?.videoUrl);
  const [renderizando, setRenderizando] = useState(false);
  const [renderMsg, setRenderMsg] = useState<string | null>(null);
  async function renderMp4Semana() {
    if (!mp4Pendentes.length) { setRenderMsg('Não há MP4s em falta esta semana.'); return; }
    setRenderizando(true); setRenderMsg(null);
    let ok = 0; const erros: string[] = [];
    for (const e of mp4Pendentes) {
      try {
        const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: e.it.slug }) });
        if (r.ok) ok++; else { const j = await r.json().catch(() => ({})); erros.push(`${e.diaPt}: ${j.erro ?? r.status}`); }
      } catch (err) { erros.push(`${e.diaPt}: ${String(err)}`); }
    }
    setRenderizando(false);
    setRenderMsg(`${ok} render(s) MP4 disparado(s) (~10 min cada, no GitHub Actions). Recarrega esta página daqui a pouco para os veres.${erros.length ? ' Falhas: ' + erros.join('; ') : ''}`);
  }
  // ── RE-renderizar a semana TODA, À FORÇA (mesmo os MP4 que já estão prontos).
  // Útil para refazer todos os vídeos da semana de uma vez (ex.: aplicar uma
  // melhoria do render sem ter de carregar post a post). ──
  const videoSemana = semana.filter((e) => VIDEO_FORMATOS.includes(tipoChave(e.it)));
  async function reRenderSemana() {
    if (!videoSemana.length) { setRenderMsg('Não há vídeos nesta semana para renderizar.'); return; }
    if (!window.confirm(`Re-renderizar à força os ${videoSemana.length} MP4 desta semana (mesmo os já prontos)? Cada um leva ~10 min no GitHub Actions.`)) return;
    setRenderizando(true); setRenderMsg(null);
    let ok = 0; const erros: string[] = [];
    for (const e of videoSemana) {
      try {
        const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: e.it.slug }) });
        if (r.ok) ok++; else { const j = await r.json().catch(() => ({})); erros.push(`${e.diaPt}: ${j.erro ?? r.status}`); }
      } catch (err) { erros.push(`${e.diaPt}: ${String(err)}`); }
    }
    setRenderizando(false);
    setRenderMsg(`${ok} render(s) re-disparado(s) à força (~10 min cada, no GitHub Actions). Recarrega esta página daqui a pouco para veres os MP4 novos.${erros.length ? ' Falhas: ' + erros.join('; ') : ''}`);
  }
  // (re)renderizar o MP4 de UM post (útil para refazer um já renderizado com a animação nova)
  async function reRender(it: Item) {
    setRenderMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json().catch(() => ({}));
      setRenderMsg(r.ok ? `Render disparado: “${it.title}” (~10 min no servidor). Recarrega para veres o resultado novo.` : 'Falhou: ' + (j.erro ?? r.status));
    } catch (e) { setRenderMsg('Erro: ' + String(e)); }
  }

  // publicar JÁ um post no Instagram (teste). Publica mesmo no IG real.
  const [igBusy, setIgBusy] = useState<string | null>(null);
  const [igMsg, setIgMsg] = useState<string | null>(null);
  async function publicarAgora(it: Item) {
    if (igBusy) return;
    if (!confirm(`Publicar JÁ no Instagram (a sério, no teu perfil):\n\n“${it.title}”\n\nSe ainda não estiver pronto, eu preparo e publico sozinho (~10 min) — deixa esta página aberta. Podes apagar depois no Instagram. Continuar?`)) return;
    setIgBusy(it.slug); setIgMsg(null);
    const ini = Date.now();
    const tentar = async (): Promise<void> => {
      const r = await fetch('/api/admin/ig/publicar-agora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json().catch(() => ({}));
      if (j.preparando) {
        const mins = Math.floor((Date.now() - ini) / 60000);
        setIgMsg(`⏳ “${it.title}”: a preparar as imagens no servidor… (${mins} min) — deixa esta página aberta, publica-se sozinho quando estiver pronto.`);
        if (Date.now() - ini < 15 * 60 * 1000) { setTimeout(() => { tentar().catch(() => {}); }, 30000); return; }
        const m = `⏳ “${it.title}”: ainda a preparar passados 15 min. As imagens devem estar quase — tenta o 🧪 publicar daqui a pouco.`; setIgMsg(m); alert(m); setIgBusy(null); return;
      }
      if (r.ok) { const m = `✓ Publicado no Instagram: “${it.title}”.`; setIgMsg(m); alert(m); await carregar(); }
      else { const m = `✗ Não publicou “${it.title}”:\n\n${j.detalhe ?? j.erro ?? r.status}`; setIgMsg(m); alert(m); }
      setIgBusy(null);
    };
    try { await tentar(); } catch (e) { const m = 'Erro: ' + String(e); setIgMsg(m); alert(m); setIgBusy(null); }
  }

  // ── GERAR UMA SEMANA (por offset): rascunha o tema editorial DESSA semana,
  //    gera os 8 posts, agenda cada um no seu dia e dispara o render. Devolve
  //    o resumo. `prefixo` enfeita a mensagem de progresso no modo bulk. ──
  async function gerarUmaSemana(offset: number, prefixo = ''): Promise<{ feito: number; mp4: number; erros: string[]; tema: string }> {
    const dias7 = diasDaSemana(offset);
    const semEdW = semanaEditorialAtual(dias7[0]);
    const cursoW = getCurso(semEdW.curso);
    const erros: string[] = [];
    const videoSlugs: string[] = [];
    let feito = 0, mp4 = 0;
    setGerSemana({ feito: 0, total: 8, msg: `${prefixo}a rascunhar “${semEdW.tema}”…` });
    const r = await fetch('/api/admin/agenda/rascunho-semana', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tema: semEdW.tema, subtitulo: cursoW.descricao, curso: semEdW.curso }) });
    const j = await r.json();
    if (!r.ok || !Array.isArray(j.plano)) { erros.push(`rascunho: ${j.erro ?? r.status}`); return { feito, mp4, erros, tema: semEdW.tema }; }
    const plano = j.plano as Array<{ wd: number; gen: string; formato: string; frase: string; destaque: string[]; legenda: string; fundoPrompt?: string }>;
    for (const d of plano) {
      setGerSemana({ feito, total: plano.length, msg: `${prefixo}a gerar ${feito + 1}/${plano.length}…` });
      const url = ROTA_GEN[d.gen] ?? ROTA_GEN.reel;
      let payload: Record<string, unknown> = {};
      if (d.gen === 'kinetico') payload = { manual: true, formato: d.formato, curso: semEdW.curso, frase: d.frase, destaque: (d.destaque ?? []).join(', '), legenda: d.legenda, fundoPrompt: d.fundoPrompt ?? '' };
      else if (d.gen === 'reel') payload = { tema: d.frase, formato: d.formato, curso: semEdW.curso };
      else if (d.gen === 'banda' || d.gen === 'heroi') payload = { tema: d.frase };
      else if (d.gen === 'infografico') payload = { tema: d.frase, curso: semEdW.curso };
      try {
        const gr = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        const gj = await gr.json();
        const slug = gj?.coleccao?.slug as string | undefined;
        if (gr.ok && slug) {
          const data = isoLocal(dias7[d.wd - 1]); // wd 1..7 -> dias7[0..6] dessa semana
          await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data }) }).catch(() => {});
          videoSlugs.push(slug);
        } else { erros.push(`dia ${d.wd}: ${gj?.erro ?? gr.status}`); }
      } catch (e) { erros.push(`dia ${d.wd}: ${String(e)}`); }
      feito++; await carregar();
    }
    for (const slug of videoSlugs) {
      setGerSemana({ feito, total: plano.length, msg: `${prefixo}a preparar media ${mp4 + 1}/${videoSlugs.length}…` });
      try { const rr = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (rr.ok) mp4++; } catch { /* segue */ }
    }
    return { feito, mp4, erros, tema: semEdW.tema };
  }

  // gerar/agendar a SEMANA mostrada (1 semana)
  async function gerarSemana() {
    if (gerandoSemana) return;
    setGerandoSemana(true);
    try {
      const res = await gerarUmaSemana(semanaOffset);
      setGerSemana({ feito: res.feito, total: 8, msg: `Pronto: ${res.feito} posts gerados e agendados (“${res.tema}”), ${res.mp4} a preparar (~10 min).${res.erros.length ? ' Falhas: ' + res.erros.join('; ') : ''}` });
    } catch (e) { setGerSemana({ feito: 0, total: 0, msg: 'Erro: ' + String(e) }); }
    finally { setGerandoSemana(false); }
  }

  // ── BULK: gerar/agendar VÁRIAS semanas seguidas, a partir da semana mostrada.
  //    Cada semana leva o seu tema do plano editorial de 13 semanas. ──
  const [nSemanas, setNSemanas] = useState(4);
  async function gerarVariasSemanas(n: number) {
    if (gerandoSemana) return;
    if (!confirm(`Gerar e agendar ${n} semana(s) seguidas (a partir da semana mostrada), ~8 posts cada?\n\nIsto demora uns minutos e gera ~${n * 8} posts. Continuar?`)) return;
    setGerandoSemana(true);
    let totFeito = 0, totMp4 = 0; const todasErros: string[] = [];
    try {
      for (let k = 0; k < n; k++) {
        const res = await gerarUmaSemana(semanaOffset + k, `semana ${k + 1}/${n} · `);
        totFeito += res.feito; totMp4 += res.mp4; todasErros.push(...res.erros.map((e) => `s${k + 1}: ${e}`));
      }
      setGerSemana({ feito: totFeito, total: n * 8, msg: `Pronto: ${n} semanas · ${totFeito} posts agendados, ${totMp4} a preparar (~10 min cada). Publica-se tudo sozinho.${todasErros.length ? ' Falhas: ' + todasErros.slice(0, 6).join('; ') + (todasErros.length > 6 ? '…' : '') : ''}` });
    } catch (e) { setGerSemana({ feito: totFeito, total: n * 8, msg: 'Erro a meio: ' + String(e) }); }
    finally { setGerandoSemana(false); }
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Agenda · Véu a Véu</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/instagram" className="text-[0.7rem] opacity-60 hover:opacity-100">🔑 Instagram</Link>
            <Link href="/admin/conteudos" className="text-[0.7rem] opacity-60 hover:opacity-100">Biblioteca →</Link>
          </div>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-3">Tudo num só sítio: <b>planeia → gera → renderiza → baixa</b>, sem saltar de aba.</p>

        {/* navegação de semanas + tema editorial dessa semana */}
        <div className="rounded-xl border border-[#C9B6FA]/25 bg-[#C9B6FA]/[0.05] p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setSemanaOffset((o) => o - 1)} className="text-[0.8rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">◀</button>
            <div className="flex-1 text-center">
              <p className="text-[0.78rem]"><b>{semanaOffset === 0 ? 'Esta semana' : semanaOffset === 1 ? 'Próxima semana' : `${semanaOffset > 0 ? '+' : ''}${semanaOffset} semanas`}</b> · {String(dias[0].getDate()).padStart(2, '0')}/{String(dias[0].getMonth() + 1).padStart(2, '0')} a {String(dias[6].getDate()).padStart(2, '0')}/{String(dias[6].getMonth() + 1).padStart(2, '0')}</p>
              <p className="text-[0.66rem] opacity-60">tema: “{semEd.tema}” · {getCurso(semEd.curso).nome.split(' ')[0]}</p>
            </div>
            <button onClick={() => setSemanaOffset((o) => o + 1)} className="text-[0.8rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">▶</button>
            {semanaOffset !== 0 && <button onClick={() => setSemanaOffset(0)} className="text-[0.6rem] px-2 py-1 rounded-full border border-ambar/30 text-ambar/80 hover:bg-ambar/10">hoje</button>}
          </div>
          <button onClick={gerarSemana} disabled={gerandoSemana} className="w-full text-[0.82rem] py-2.5 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-50">{gerandoSemana ? `⚡ ${gerSemana?.msg ?? 'a gerar…'}` : '⚡ gerar a semana toda (8 posts) e agendar'}</button>
          {/* BULK: várias semanas de uma vez, a partir da semana mostrada */}
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[0.66rem] opacity-55">ou de uma vez:</span>
            <select value={nSemanas} onChange={(e) => setNSemanas(Number(e.target.value))} disabled={gerandoSemana} className="text-[0.72rem] px-2 py-1 rounded-lg border border-ambar/30 bg-[#15131f] text-ambar disabled:opacity-50">
              {[2, 3, 4, 6, 8, 13].map((n) => <option key={n} value={n}>{n} semanas</option>)}
            </select>
            <button onClick={() => gerarVariasSemanas(nSemanas)} disabled={gerandoSemana} className="text-[0.76rem] px-3 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-50">⚡⚡ gerar {nSemanas} semanas e agendar</button>
          </div>
          {gerSemana && <p className="text-[0.66rem] opacity-70 mt-1.5 text-center">{gerSemana.msg}</p>}
          <p className="text-[0.6rem] opacity-45 mt-1 text-center">Gera os 8 posts do tema da semana e agenda-os nos dias certos — depois publica-se tudo sozinho. O bulk faz N semanas seguidas (cada uma com o seu tema do plano de 13). {porAgendar.length} por agendar · {totalAgendados} agendados.</p>
        </div>

        {/* descarregar a semana inteira (imagens + legendas + MP4) para publicar à mão */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button onClick={() => { if (semana.length) { setZipMsg(null); setBaixando(true); } }} disabled={baixando || semana.length === 0} className="text-[0.78rem] px-4 py-2 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{baixando ? 'a preparar o ZIP…' : `⬇ baixar a semana (ZIP) · ${semana.length} post(s)`}</button>
          <button onClick={renderMp4Semana} disabled={renderizando || mp4Pendentes.length === 0} className="text-[0.78rem] px-4 py-2 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-40">{renderizando ? 'a disparar…' : `🎬 renderizar MP4s da semana · ${mp4Pendentes.length} em falta`}</button>
          <button onClick={reRenderSemana} disabled={renderizando || videoSemana.length === 0} className="text-[0.78rem] px-4 py-2 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{renderizando ? 'a disparar…' : `↻ re-renderizar a semana toda · ${videoSemana.length} MP4`}</button>
          <span className="text-[0.68rem] opacity-50 w-full">ZIP: imagens (PNG) + legenda.txt (+ MP4 quando já existe), uma pasta por dia. O botão dos MP4s dispara o render dos vídeos em falta (Cá em Casa, I am a Hero, Infográfico, Domingo, Frase com motion) ~10 min cada.</span>
          {mp4Pendentes.length > 0 && <span className="text-[0.66rem] opacity-60 w-full">Em falta ({mp4Pendentes.length}): {mp4Pendentes.map((e) => `${e.diaPt} ${FMT[tipoChave(e.it)]?.label ?? ''}`).join(' · ')}. Os carrosséis (Sinais, O que ninguém, Uma ideia) não têm MP4. Se faltar algum dia, é porque ainda não geraste/agendaste esse post.</span>}
          {zipMsg && <span className="text-[0.72rem] text-salvia w-full">{zipMsg}</span>}
          {renderMsg && <span className="text-[0.72rem] text-[#C9B6FA] w-full">{renderMsg}</span>}
          {igMsg && <span className="text-[0.74rem] text-ambar w-full">{igMsg}</span>}
          {/* imagens-assinatura LIMPAS (sem texto) — para animar no MidJourney */}
          {Object.keys(capasSerie).length > 0 && (
            <div className="w-full flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[0.66rem] opacity-55">Imagem da capa (limpa, p/ animar no MJ):</span>
              {Object.entries(capasSerie).map(([sub, url]) => (
                <a key={sub} href={url} target="_blank" rel="noreferrer" download className="text-[0.66rem] px-2.5 py-1 rounded-full border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 no-underline">⬇ {FMT[sub]?.label ?? sub}</a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {dias.map((d) => {
            const wd = d.getDay();
            const iso = isoLocal(d);
            const doDia = itens.filter((it) => it.theme?.agendadoEm === iso);
            const dataLabel = `${DIAS_PT[wd]} · ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            const descanso = false; // domingo passou a 🕊️ Domingo de Luz (post leve)
            return (
              <div key={iso} className="rounded-xl border border-ocre/12 bg-terra/15 overflow-hidden">
                <div className="px-4 py-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#C9B6FA] border-b border-ocre/10">
                  {dataLabel}{iso === hojeIso && <span className="normal-case tracking-normal text-[0.56rem] px-1.5 py-0.5 rounded-full bg-ambar/20 text-ambar">hoje</span>}
                  {!descanso && <span className="ml-auto normal-case tracking-normal text-[0.62rem] opacity-40">{SUG[wd]}</span>}
                </div>

                {descanso ? (
                  <div className="flex items-center gap-3 px-4 py-3 opacity-60"><span className="text-xl">🌙</span><span className="text-[0.92rem]">Descanso</span></div>
                ) : (() => {
                  // SLOTS planeados do dia (quarta = 2). Cada slot casa com um post desse
                  // formato já agendado, ou fica vazio (placeholder para preencher).
                  const planned = DIA_FORMATO[wd] ?? [];
                  const usados = new Set<string>();
                  const slots = planned.map((fmt) => {
                    const post = doDia.find((it) => tipoChave(it) === fmt && !usados.has(it.slug));
                    if (post) usados.add(post.slug);
                    return { fmt, post };
                  });
                  const extras = doDia.filter((it) => !usados.has(it.slug)); // posts de outro formato neste dia
                  const linhaPost = (it: Item, etiqueta?: string, hora: string = horaDoSlot(wd, 0)) => {
                    const m = fmtDe(it); const capa = capaDe(it);
                    const ehVideo = VIDEO_FORMATOS.includes(tipoChave(it));
                    const videoUrl = it.dias?.[0]?.videoUrl;
                    return (
                      <div key={it.slug} className="flex items-center gap-2.5 rounded-lg bg-black/20 border border-white/5 p-2">
                        <span className="text-[0.66rem] font-mono opacity-50 w-10 shrink-0">{hora}</span>
                        <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                        <div className="flex-1 min-w-0">
                          <span className={`block truncate text-[0.86rem] ${it.theme?.publicado ? 'line-through opacity-50' : ''}`} title={it.title}>{it.title}{etiqueta && <span className="ml-1 text-[0.54rem] opacity-50">{etiqueta}</span>}{it.theme?.igPublicado && <span className="ml-1 text-[0.54rem] text-salvia">✓ Instagram</span>}{!it.theme?.igPublicado && it.theme?.igStatus?.startsWith('erro') && <button onClick={() => alert(it.theme?.igStatus)} className="ml-1 text-[0.54rem] text-rosa/80 underline" title={it.theme.igStatus}>⚠ IG (ver)</button>}</span>
                          {/* etiqueta de formato + estado de render */}
                          {ehVideo
                            ? <span className="text-[0.52rem] px-1.5 py-0.5 rounded-full" style={videoUrl ? { background: '#7E9B8E22', color: '#7E9B8E' } : { background: '#EBAE4A22', color: '#EBAE4A' }}>{videoUrl ? '🎬 MP4 pronto' : '🎬 por renderizar'}</span>
                            : <span className="text-[0.52rem] px-1.5 py-0.5 rounded-full" style={{ background: '#C9B6FA22', color: '#C9B6FA' }}>🖼️ carrossel</span>}
                        </div>
                        {/* baixar o FORMATO CERTO: MP4 só quando existe; carrossel abre as imagens */}
                        {ehVideo
                          ? (<>
                              {videoUrl
                                ? <a href={semCacheUrl(videoUrl)} download className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-salvia/40 bg-salvia/10 text-salvia hover:bg-salvia/20 no-underline">⬇ MP4</a>
                                : <span className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-ocre/15 text-creme-2/35 cursor-not-allowed" title="Ainda sem MP4. Carrega 🎬 renderizar e espera ~10 min.">⬇ por renderizar</span>}
                              <button onClick={() => reRender(it)} title={videoUrl ? 're-renderizar o MP4 (~10 min) — útil para aplicar a animação nova' : 'renderizar o MP4 (~10 min)'} className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-[#C9B6FA]/30 text-[#C9B6FA]/85 hover:bg-[#C9B6FA]/10">{videoUrl ? '↻🎬' : '🎬'}</button>
                            </>)
                          : (<>
                              {m.href !== '#' && <Link href={m.href} className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-ocre/25 text-creme-2/65 hover:border-ambar hover:text-ambar no-underline">⬇ imagens</Link>}
                              <button onClick={() => reRender(it)} title="render no servidor (~10 min) — necessário para o carrossel publicar sozinho no Instagram" className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-[#C9B6FA]/30 text-[#C9B6FA]/85 hover:bg-[#C9B6FA]/10">↻🖼️</button>
                            </>)}
                        <button onClick={() => publicarAgora(it)} disabled={igBusy === it.slug || !!it.theme?.igPublicado} title={it.theme?.igPublicado ? 'já publicado no Instagram' : 'publicar JÁ no Instagram (teste — vai mesmo para o teu perfil)'} className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{igBusy === it.slug ? '…' : it.theme?.igPublicado ? '✓ IG' : '🧪 publicar'}</button>
                        <button onClick={() => patch(it.slug, { publicado: !it.theme?.publicado })} className={`shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border ${it.theme?.publicado ? 'border-salvia/50 bg-salvia/15 text-salvia' : 'border-ocre/25 text-creme-2/60 hover:border-salvia'}`}>{it.theme?.publicado ? '✓ publicado' : 'marcar'}</button>
                        <button onClick={() => patch(it.slug, { agendadoEm: null })} className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-rosa/25 text-rosa/70 hover:bg-rosa/10" title="tirar deste dia (não apaga)">✕</button>
                        <button onClick={() => apagar(it)} className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-rose-500/40 text-rose-400/80 hover:bg-rose-500/15" title="apagar DE VEZ (não tem volta)">🗑</button>
                      </div>
                    );
                  };
                  return (
                    <div className="p-3 space-y-2">
                      {slots.map(({ fmt, post }, k) => post ? linhaPost(post, undefined, horaDoSlot(wd, k)) : (
                        <button key={`vazio-${fmt}-${k}`} onClick={() => abrirPicker(iso, fmt)} className="w-full flex items-center gap-2 text-[0.74rem] py-2.5 px-3 rounded-lg border border-dashed border-ambar/35 text-ambar/85 hover:bg-ambar/10">
                          <span>{FMT[fmt]?.emoji ?? '＋'}</span><span className="opacity-90">+ {FMT[fmt]?.label ?? fmt}</span>
                          {slots.length > 1 && <span className="ml-auto text-[0.54rem] opacity-50">post {k + 1} de {slots.length}</span>}
                        </button>
                      ))}
                      {extras.map((it, ei) => linhaPost(it, '· extra', horaDoSlot(wd, slots.length + ei)))}
                      <button onClick={() => abrirPicker(iso)} className="w-full text-[0.64rem] py-1.5 rounded-lg border border-ocre/20 text-creme-2/55 hover:border-ambar hover:text-ambar">+ outro post</button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <p className="text-[0.7rem] opacity-45 mt-6 text-center">Os posts vêm da biblioteca Conteúdos. Sem nada para agendar? Gera primeiro nos formatos.</p>
      </div>

      {/* host escondido: rende os slides da semana em tamanho nativo p/ capturar PNG */}
      {baixando && (
        <div ref={hostRef} className={`${cormorant.variable} ${inter.variable} ${jetmono.variable}`} style={{ position: 'fixed', left: -10000, top: 0, width: 1080 }} aria-hidden>
          {semana.map((ent) => {
            const slides = slidesComCapa(ent.it);
            return (
              <div key={ent.it.slug} data-post={ent.it.slug} style={{ width: 1080 }}>
                {slides.map((s, i) => (
                  <div key={i} data-slide style={{ width: 1080 }}>
                    <PostSlide slide={s} mundo={mundoDe(ent.it)} numero={i + 1} total={slides.length} ratio={CARROSSEL_FORMATOS.includes(ent.it.theme?.subtipo ?? '') ? '4:5' : '9:16'} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* seletor de post para um dia */}
      {picker && (() => {
        const wd = new Date(picker + 'T12:00:00').getDay();
        // se clicaste um slot específico (pickerFmt), filtra a esse formato; senão, aos formatos do dia
        const alvo = pickerFmt ? [pickerFmt] : (DIA_FORMATO[wd] ?? []);
        const nomeDia = alvo.map((f) => FMT[f]?.label ?? f).join(' + ');
        const fechar = () => { setPicker(null); setVerTodos(false); setPickerFmt(null); };
        // mostra TUDO o que não está já neste dia (inclui agendados noutro dia e
        // publicados, com etiqueta) — nada desaparece do seletor.
        const disponiveis = itens.filter((it) => it.theme?.agendadoEm !== picker);
        const lista = (verTodos || !alvo.length) ? disponiveis : disponiveis.filter((it) => alvo.includes(tipoChave(it)));
        return (
        <div onClick={fechar} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-5 ${cormorant.variable} ${inter.variable}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[0.8rem]">{alvo.length > 0 && !verTodos ? <>Para <b>{picker.split('-').reverse().join('/')}</b>: <b>{nomeDia}</b></> : <>Post para <b>{picker.split('-').reverse().join('/')}</b></>}</p>
              {alvo.length > 0 && <button onClick={() => setVerTodos((v) => !v)} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ocre/30 text-creme-2/70 hover:border-ambar">{verTodos ? `só ${nomeDia}` : 'ver todos'}</button>}
            </div>
            <div className="space-y-2">
              {lista.length === 0 && <p className="text-[0.78rem] opacity-55 py-6 text-center">{disponiveis.length === 0 ? 'Não há posts para agendar. Gera nos formatos e volta aqui.' : `Nenhum "${nomeDia}" disponível. Carrega "ver todos" ou gera um.`}</p>}
              {lista.map((it) => {
                const m = fmtDe(it); const capa = capaDe(it);
                const noutroDia = it.theme?.agendadoEm; // já agendado noutro dia (o clique move)
                return (
                  <button key={it.slug} onClick={() => { patch(it.slug, { agendadoEm: picker }); fechar(); }} className="w-full flex items-center gap-3 rounded-lg border border-white/8 hover:border-ambar/50 bg-black/20 p-2 text-left">
                    <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                    <span className="text-[0.56rem] uppercase tracking-[0.12em] opacity-60 shrink-0">{m.emoji} {m.label}</span>
                    <span className="flex-1 min-w-0 truncate text-[0.84rem]">{it.title}</span>
                    {it.theme?.publicado && <span className="shrink-0 text-[0.54rem] px-1.5 py-0.5 rounded-full border border-salvia/30 text-salvia/80">publicado</span>}
                    {noutroDia && <span className="shrink-0 text-[0.54rem] px-1.5 py-0.5 rounded-full border border-ambar/30 text-ambar/80">agendado {noutroDia.split('-').reverse().slice(0, 2).join('/')} · mover</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={fechar} className="mt-4 text-[0.7rem] px-3 py-1.5 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">fechar</button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
