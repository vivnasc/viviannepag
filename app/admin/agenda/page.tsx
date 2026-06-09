'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { PostSlide, type PostSlideT } from '@/components/admin/PostSlide';
import type { Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });

// Agenda da "Véu a Véu" = o ÚNICO sítio de agendamento. Em cada dia pões um post
// JÁ gerado (escolhido da biblioteca Conteúdos), baixas e marcas publicado.
// Geras nos geradores → aparece em Conteúdos → agendas aqui → publicas.

type Slide = PostSlideT & { imageUrl?: string | null };
type Dia = { mundo?: Mundo; slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string };
type Theme = { formato?: string; subtipo?: string; mundo?: Mundo; agendadoEm?: string | null; publicado?: boolean };
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
const SUG: Record<number, string> = { 1: '✨ frase', 2: '🔎 sinais de que…', 3: '💡 o que ninguém explica', 4: '🎭 Cá em Casa', 5: '🌅 I am a Hero', 6: '📊 infográfico', 0: '🕊️ Domingo de Luz' };
// formato planeado de cada dia (para o seletor mostrar só esse formato)
const DIA_FORMATO: Record<number, string> = { 1: 'kinetico', 2: 'sinais', 3: 'ninguem', 4: 'banda', 5: 'heroi', 6: 'infografico', 0: 'domingo' };
// formatos que SÃO vídeo (precisam de render MP4); os outros são carrossel/imagem
const VIDEO_FORMATOS = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico'];
const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const HORA = '20:00';
// nome de pasta/ficheiro seguro (sem acentos, sem espaços)
const slugSeguro = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase().slice(0, 40);
const mundoDe = (it: Item): Mundo => it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'escola';

export default function AgendaPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [picker, setPicker] = useState<string | null>(null); // iso do dia a preencher
  const [verTodos, setVerTodos] = useState(false); // no seletor, mostrar todos os formatos
  // capas-assinatura por série (para a capa do 1.º slide de sinais/ninguém no ZIP)
  const [capasSerie, setCapasSerie] = useState<Record<string, string>>({});

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list');
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapasSerie(j.capas ?? {})).catch(() => {}); }, []);

  async function patch(slug: string, p: { agendadoEm?: string | null; publicado?: boolean }) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, ...p } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...p }) }).catch(() => {});
  }

  // a SEMANA atual, de segunda a domingo (não "a partir de amanhã")
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dow = hoje.getDay(); // 0=domingo..6=sábado
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow));
  const dias = Array.from({ length: 7 }).map((_, i) => { const d = new Date(segunda); d.setDate(segunda.getDate() + i); return d; });
  const hojeIso = isoLocal(hoje);

  const porAgendar = itens.filter((it) => !it.theme?.agendadoEm); // disponíveis para pôr num dia
  const totalAgendados = itens.filter((it) => it.theme?.agendadoEm).length;

  // os posts agendados PARA ESTA SEMANA, por ordem do dia (seg→dom)
  const isoSemana = dias.map(isoLocal);
  const semana = isoSemana
    .map((iso, i) => ({ iso, ordem: i + 1, diaPt: DIAS_PT[dias[i].getDay()], it: itens.find((x) => x.theme?.agendadoEm === iso) }))
    .filter((x): x is { iso: string; ordem: number; diaPt: string; it: Item } => !!x.it);

  // aplica a capa-assinatura + selo/paleta da série ao 1.º slide, como na biblioteca
  // (resolve à hora de mostrar: posts antigos também ganham capa e cabeçalho)
  const SERIE_ASSINATURA = ['ninguem', 'sinais', 'pensador'];
  const CARROSSEL_FORMATOS = ['sinais', 'ninguem', 'pensador']; // saem 4:5 (carrossel de feed), não 9:16
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
        await (document.fonts?.ready ?? Promise.resolve());
        await new Promise((r) => setTimeout(r, 600)); // deixa as imagens de fundo carregar
        const imgs = Array.from(hostRef.current?.querySelectorAll('img') ?? []);
        await Promise.all(imgs.map((im) => (im.complete && im.naturalWidth) ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })));
        await new Promise((r) => setTimeout(r, 200));

        for (const ent of semana) {
          const m = fmtDe(ent.it);
          const pasta = zip.folder(`${ent.ordem}-${ent.diaPt}-${slugSeguro(m.label)}`)!;
          // PNG de cada slide
          const nodes = hostRef.current?.querySelectorAll<HTMLElement>(`[data-post="${ent.iso}"] [data-slide]`);
          if (nodes) for (let i = 0; i < nodes.length; i++) {
            const url = await toPng(nodes[i], { pixelRatio: 1, cacheBust: true });
            pasta.file(`slide-${String(i + 1).padStart(2, '0')}.png`, url.split(',')[1], { base64: true });
          }
          // legenda + hashtags
          pasta.file('legenda.txt', legendaDe(ent.it));
          // MP4 se existir
          const videoUrl = ent.it.dias?.[0]?.videoUrl;
          if (videoUrl) {
            try { const blob = await (await fetch(videoUrl, { cache: 'no-store' })).blob(); pasta.file('reel.mp4', blob); } catch { /* fica sem o MP4 */ }
          }
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `veuaveu-semana-${isoSemana[0]}.zip`; a.click(); URL.revokeObjectURL(a.href);
        setZipMsg(`Pronto: ${semana.length} post(s) da semana, com imagens e legendas.`);
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

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Agenda · Véu a Véu</h1>
          <Link href="/admin/conteudos" className="text-[0.7rem] opacity-60 hover:opacity-100">Biblioteca →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1"><b>1 post por dia</b> (~20h). Aqui pões os posts que <b>já geraste</b>, baixas e marcas publicado.</p>
        <p className="text-[0.74rem] opacity-50 mb-4">Semana atual, <b>segunda a domingo</b>. Cada dia mostra o formato planeado (vê as frases no <Link href="/admin/plano-semana" className="text-[#C9B6FA] underline">Plano da Semana</Link>) e os posts que lá puseres. {porAgendar.length} por agendar · {totalAgendados} agendados.</p>

        {/* descarregar a semana inteira (imagens + legendas + MP4) para publicar à mão */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button onClick={() => { if (semana.length) { setZipMsg(null); setBaixando(true); } }} disabled={baixando || semana.length === 0} className="text-[0.78rem] px-4 py-2 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{baixando ? 'a preparar o ZIP…' : `⬇ baixar a semana (ZIP) · ${semana.length} post(s)`}</button>
          <button onClick={renderMp4Semana} disabled={renderizando || mp4Pendentes.length === 0} className="text-[0.78rem] px-4 py-2 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20 disabled:opacity-40">{renderizando ? 'a disparar…' : `🎬 renderizar MP4s da semana · ${mp4Pendentes.length} em falta`}</button>
          <span className="text-[0.68rem] opacity-50 w-full">ZIP: imagens (PNG) + legenda.txt (+ MP4 quando já existe), uma pasta por dia. O botão dos MP4s dispara o render dos vídeos em falta (Cá em Casa, I am a Hero, Infográfico, Domingo, Frase com motion) ~10 min cada.</span>
          {zipMsg && <span className="text-[0.72rem] text-salvia w-full">{zipMsg}</span>}
          {renderMsg && <span className="text-[0.72rem] text-[#C9B6FA] w-full">{renderMsg}</span>}
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
                ) : (
                  <div className="p-3 space-y-2">
                    {doDia.map((it) => {
                      const m = fmtDe(it); const capa = capaDe(it);
                      return (
                        <div key={it.slug} className="flex items-center gap-3 rounded-lg bg-black/20 border border-white/5 p-2">
                          <span className="text-[0.66rem] font-mono opacity-50 w-10 shrink-0">{HORA}</span>
                          <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                          <span className={`flex-1 min-w-0 truncate text-[0.88rem] ${it.theme?.publicado ? 'line-through opacity-50' : ''}`} title={it.title}>{it.title}</span>
                          {m.href !== '#' && <Link href={m.href} className="shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border border-ocre/25 text-creme-2/65 hover:border-ambar hover:text-ambar no-underline">baixar</Link>}
                          <button onClick={() => patch(it.slug, { publicado: !it.theme?.publicado })} className={`shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full border ${it.theme?.publicado ? 'border-salvia/50 bg-salvia/15 text-salvia' : 'border-ocre/25 text-creme-2/60 hover:border-salvia'}`}>{it.theme?.publicado ? '✓ publicado' : 'marcar'}</button>
                          <button onClick={() => patch(it.slug, { agendadoEm: null })} className="shrink-0 text-[0.6rem] px-1.5 py-0.5 rounded-full border border-rosa/25 text-rosa/70 hover:bg-rosa/10" title="tirar deste dia">✕</button>
                        </div>
                      );
                    })}
                    <button onClick={() => setPicker(iso)} className="w-full text-[0.7rem] py-2 rounded-lg border border-dashed border-ambar/40 text-ambar/90 hover:bg-ambar/10">+ escolher post para este dia</button>
                  </div>
                )}
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
              <div key={ent.iso} data-post={ent.iso} style={{ width: 1080 }}>
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
        const fmtDia = DIA_FORMATO[wd];
        const nomeDia = fmtDia ? (FMT[fmtDia]?.label ?? fmtDia) : '';
        // mostra TUDO o que não está já neste dia (inclui agendados noutro dia e
        // publicados, com etiqueta) — nada desaparece do seletor.
        const disponiveis = itens.filter((it) => it.theme?.agendadoEm !== picker);
        const lista = (verTodos || !fmtDia) ? disponiveis : disponiveis.filter((it) => tipoChave(it) === fmtDia);
        return (
        <div onClick={() => { setPicker(null); setVerTodos(false); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-5 ${cormorant.variable} ${inter.variable}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[0.8rem]">{fmtDia && !verTodos ? <>Só <b>{nomeDia}</b> para <b>{picker.split('-').reverse().join('/')}</b></> : <>Post para <b>{picker.split('-').reverse().join('/')}</b></>}</p>
              {fmtDia && <button onClick={() => setVerTodos((v) => !v)} className="text-[0.62rem] px-2.5 py-1 rounded-full border border-ocre/30 text-creme-2/70 hover:border-ambar">{verTodos ? `só ${nomeDia}` : 'ver todos'}</button>}
            </div>
            <div className="space-y-2">
              {lista.length === 0 && <p className="text-[0.78rem] opacity-55 py-6 text-center">{disponiveis.length === 0 ? 'Não há posts para agendar. Gera nos formatos e volta aqui.' : `Nenhum "${nomeDia}" disponível. Carrega "ver todos" ou gera um.`}</p>}
              {lista.map((it) => {
                const m = fmtDe(it); const capa = capaDe(it);
                const noutroDia = it.theme?.agendadoEm; // já agendado noutro dia (o clique move)
                return (
                  <button key={it.slug} onClick={() => { patch(it.slug, { agendadoEm: picker }); setPicker(null); setVerTodos(false); }} className="w-full flex items-center gap-3 rounded-lg border border-white/8 hover:border-ambar/50 bg-black/20 p-2 text-left">
                    <div className="w-9 h-12 shrink-0 rounded overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span>{m.emoji}</span>}</div>
                    <span className="text-[0.56rem] uppercase tracking-[0.12em] opacity-60 shrink-0">{m.emoji} {m.label}</span>
                    <span className="flex-1 min-w-0 truncate text-[0.84rem]">{it.title}</span>
                    {it.theme?.publicado && <span className="shrink-0 text-[0.54rem] px-1.5 py-0.5 rounded-full border border-salvia/30 text-salvia/80">publicado</span>}
                    {noutroDia && <span className="shrink-0 text-[0.54rem] px-1.5 py-0.5 rounded-full border border-ambar/30 text-ambar/80">agendado {noutroDia.split('-').reverse().slice(0, 2).join('/')} · mover</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setPicker(null); setVerTodos(false); }} className="mt-4 text-[0.7rem] px-3 py-1.5 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">fechar</button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
