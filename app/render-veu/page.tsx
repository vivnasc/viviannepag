'use client';

// Pagina de render (1080x1920) para o Puppeteer fotografar cada slide de um
// carrossel dos 7 Veus. Le a coleccao por slug (rota publica), renderiza o
// slide pedido a tamanho nativo e marca body[data-slide-ready="true"].
// URL: /render-veu?slug=<slug>&dia=<n>&idx=<i>

import { useEffect, useState, useRef, useMemo } from 'react';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { VeuSlide } from '@/components/admin/VeuSlide';
import { InfograficoSlide } from '@/components/admin/InfograficoSlide';
import { AnelCover } from '@/components/admin/AnelCover';
import { ReelSlide } from '@/components/admin/ReelSlide';
import { BandaSlide } from '@/components/admin/BandaSlide';
import { KineticSlide, type EfeitoTexto, type Tipografia } from '@/components/admin/KineticSlide';
import { SOULAB_SLIDE } from '@/lib/soulab/marca';
import { MetodoSlide } from '@/components/admin/MetodoSlide';
import { CartaSlide } from '@/components/admin/CartaSlide';
import { getConta, type Conta } from '@/lib/metodo/contas';
import { SerieDiariaSlide, type SerieId } from '@/components/admin/SerieDiariaSlide';
import { type PaletaId } from '@/lib/series/serie-design';
import type { Slide, Mundo } from '@/lib/estudio-conteudo';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'block' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'block' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'block' });

type Dia = { dia: number; mundo: Mundo; palavra?: string; subtitulo?: string; slides?: (Slide & { imageUrl?: string })[] };
type Coleccao = { dias: Dia[]; theme?: { subtipo?: string; soulab?: { clipUrl?: string }; metodo?: { tipo?: string; personagem?: string } } };

// séries de reels com capa-assinatura (selo + carvão na capa)
const SERIE_ASSINATURA: Record<string, string> = { ninguem: 'O que ninguém te explica', sinais: 'Sinais de que…', pensador: 'Uma ideia de…' };

type Face = { texto?: string; destaque?: string[]; imageUrl?: string; clipUrl?: string; conceito?: string; veuReveal?: string };
// MÃE · 2 FACES num só reel: a dor (face 1) na 1.ª metade do prog, a revelação
// (face 2) na 2.ª, com crossfade. Conduzido pelo mesmo prog do render (um só MP4).
function DuasFaces({ face1, face2, conta, prog, split }: { face1: Face; face2: Face; conta: Conta; prog: number; split: number }) {
  // TEMPO DE LEITURA: a passagem entre faces é em `split` (não 50/50) — a face 2
  // (texto mais longo) fica com mais tempo. Crossfade LARGO e suave (smoothstep).
  const FADE = 0.1;
  const p1 = Math.min(1, prog / split);
  const p2 = Math.min(1, Math.max(0, (prog - split) / (1 - split)));
  const tt = Math.max(0, Math.min(1, (prog - (split - FADE)) / (2 * FADE)));
  const op2 = tt * tt * (3 - 2 * tt); // smoothstep (ease-in-out), sem corte seco
  return (
    <div style={{ position: 'relative', width: 1080, height: 1920 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - op2 }}>
        <MetodoSlide texto={face1.texto ?? ''} destaque={face1.destaque} imageUrl={face1.imageUrl} clipUrl={face1.clipUrl} conta={conta} conceito={face1.conceito} veuReveal={face1.veuReveal} anim="typewriter" prog={p1} />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: op2 }}>
        <MetodoSlide texto={face2.texto ?? ''} destaque={face2.destaque} imageUrl={face2.imageUrl} clipUrl={face2.clipUrl} conta={conta} conceito={face2.conceito} veuReveal={face2.veuReveal} anim="reveal" prog={p2} />
      </div>
    </div>
  );
}

// TARDE · N beats sobre UMA cena dramática (clip em loop). Os beats aparecem em
// sequência (cada um na sua janela de tempo), com crossfade. O fundo é único e
// partilhado (1 só clip-bg, que o render faz seek por prog). O último beat mostra
// a assinatura + o véu.
function Sequencia({ beats, clipUrl, imageUrl, conta, conceito, veuReveal, prog, nomeCarta }: { beats: string[]; clipUrl?: string; imageUrl?: string; conta: Conta; conceito?: string; veuReveal?: string; prog: number; nomeCarta?: string }) {
  const n = Math.max(1, beats.length);
  const w = 1 / n;
  const accent = conta.paleta.accent;
  return (
    <div style={{ position: 'relative', width: 1080, height: 1920, background: '#000', overflow: 'hidden' }}>
      {/* NOME da carta do baralho (ex.: "A Diretora Invisível") — rótulo fixo da app,
          escrito por cima da figura (o Flux não escreve texto). Só na carta "Sou Aquela". */}
      {nomeCarta && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', zIndex: 5 }}>
          <span style={{ display: 'inline-block', padding: '14px 40px', background: 'rgba(13,10,6,0.82)', border: `2px solid ${accent}`, borderRadius: 10, color: accent, fontFamily: '"Cormorant Garamond", var(--font-cormorant), serif', fontWeight: 600, fontSize: 50, letterSpacing: '0.02em' }}>{nomeCarta}</span>
        </div>
      )}
      {clipUrl
        // eslint-disable-next-line jsx-a11y/media-has-caption
        ? <video className="clip-bg" src={clipUrl} muted playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.04)', filter: 'brightness(1.06) saturate(1.05)' }} />
        : imageUrl ? <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${(1.08 + 0.1 * prog).toFixed(3)})`, filter: 'brightness(1.06) saturate(1.05)' }} /> : null}
      {/* legibilidade do texto sobre a cena */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 130% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 55%, transparent 80%)' }} />
      {beats.map((b, i) => {
        const lp = Math.max(0, Math.min(1, (prog - i * w) / w)); // progresso DENTRO do beat
        const isLast = i === n - 1;
        const fin = Math.min(1, lp / 0.18);                       // fade-in
        const fout = isLast ? 1 : Math.min(1, (1 - lp) / 0.18);   // fade-out (o último segura)
        const op = (lp <= 0 || lp >= 1) ? (lp >= 1 && isLast ? 1 : 0) : Math.min(fin, fout);
        if (op <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: op }}>
            <MetodoSlide semFundo semRodape={!isLast} texto={b} conta={conta} conceito={i === 0 ? conceito : undefined} veuReveal={isLast ? veuReveal : undefined} anim="reveal" prog={lp} />
          </div>
        );
      })}
    </div>
  );
}

// CARTA DE RENOMEAR (tarde da vir) · N beats em sequência, registo PRÓPRIO:
// beat 0 = a CENA (capa, alto contraste); restantes = o corpo da carta (papel).
function CartaSequencia({ beats, conta, prog, capaImg }: { beats: string[]; conta: Conta; prog: number; capaImg?: string | null }) {
  const n = Math.max(1, beats.length);
  const w = 1 / n;
  // TRANSIÇÃO DE ABERTURA DE PÁGINA (pedido da Vivianne): cada parte da carta entra a
  // rodar a partir da margem esquerda, como uma página de livro a abrir. perspective no
  // contentor + rotateY por beat (de -100º até 0 durante a entrada).
  return (
    <div style={{ position: 'relative', width: 1080, height: 1920, background: '#0d0a06', overflow: 'hidden', perspective: 2200 }}>
      {beats.map((b, i) => {
        const lp = Math.max(0, Math.min(1, (prog - i * w) / w));
        const isLast = i === n - 1;
        const fin = Math.min(1, lp / 0.22);
        const fout = isLast ? 1 : Math.min(1, (1 - lp) / 0.18);
        const op = (lp <= 0 || lp >= 1) ? (lp >= 1 && isLast ? 1 : 0) : Math.min(fin, fout);
        if (op <= 0) return null;
        const ry = (1 - fin) * -100; // a página abre: -100º → 0º
        const aAbrir = i > 0 && ry < -0.5;
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: op, transform: i > 0 ? `rotateY(${ry}deg)` : undefined, transformOrigin: 'left center', transformStyle: 'preserve-3d', boxShadow: aAbrir ? '0 0 120px rgba(0,0,0,0.7)' : 'none' }}>
            <CartaSlide texto={b} conta={conta} capa={i === 0} prog={lp} semRodape={!isLast} imageUrl={i === 0 ? capaImg : undefined} />
          </div>
        );
      })}
    </div>
  );
}

export default function RenderVeuPage() {
  const [estado, setEstado] = useState<{ slide: Slide & { imageUrl?: string }; dia: Dia; idx: number; slide2?: Slide & { imageUrl?: string } } | null>(null);
  const [subtipo, setSubtipo] = useState<string>('');
  const [nomeCarta, setNomeCarta] = useState<string>(''); // nome da personagem na carta "Sou Aquela"
  const [clipBg, setClipBg] = useState<string | null>(null); // Soulab: o clip do Kling (fundo em movimento)
  const [erro, setErro] = useState<string | null>(null);
  const [prog, setProg] = useState(1); // progresso do cinético/infográfico (0..1), conduzido pelo render
  const [video, setVideo] = useState(false); // ?video=1 => modo MP4 (infográfico animado 9:16)
  const splitRef = useRef(0.5); // passagem entre as 2 faces (proporcional ao texto)

  // o render conduz a animação frame a frame via window.__setKProg. Quando há
  // CLIPS (fundo de vídeo), o __setKProg também faz SEEK do(s) vídeo(s) ao tempo
  // certo e ESPERA o frame ('seeked'), para o screenshot apanhar o frame do clip.
  // 2 vídeos = duas faces (sequenciadas 0→0.5 / 0.5→1); 1 vídeo = range cheio.
  useEffect(() => {
    const seekTo = (v: HTMLVideoElement, frac: number) => new Promise<void>((res) => {
      const dur = v.duration; if (!dur || !isFinite(dur)) { res(); return; }
      const t = Math.max(0, Math.min(0.999, frac)) * dur;
      if (Math.abs(v.currentTime - t) < 0.02) { res(); return; }
      const done = () => { v.removeEventListener('seeked', done); res(); };
      v.addEventListener('seeked', done);
      try { v.currentTime = t; } catch { res(); }
      setTimeout(done, 500); // segurança: nunca pendura o frame
    });
    (window as unknown as { __setKProg?: (p: number) => void | Promise<void> }).__setKProg = async (p: number) => {
      setProg(p);
      const vids = Array.from(document.querySelectorAll('video.clip-bg')) as HTMLVideoElement[];
      if (!vids.length) return;
      const sp = splitRef.current || 0.5; // passagem entre faces (tempo de leitura)
      const seeks = vids.length >= 2
        ? [seekTo(vids[0], Math.min(1, p / sp)), seekTo(vids[1], Math.max(0, (p - sp) / (1 - sp)))]
        : vids.map((v) => seekTo(v, p));
      await Promise.all(seeks);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const p = new URLSearchParams(window.location.search);
      const slug = p.get('slug');
      const diaN = Number(p.get('dia'));
      const idx = Number(p.get('idx'));
      if (p.get('video') === '1') setVideo(true);
      if (!slug || !diaN || isNaN(idx)) { setErro('faltam params: slug, dia, idx'); return; }
      try {
        const r = await fetch(`/api/carrossel-veus/data?slug=${encodeURIComponent(slug)}`);
        if (!r.ok) { setErro(`coleccao ${r.status}`); return; }
        const col = (await r.json()) as Coleccao;
        setSubtipo(col.theme?.subtipo ?? '');
        // o NOME só na carta do baralho "Sou Aquela" (tipo 'carta'); nas outras nbeats não.
        setNomeCarta(col.theme?.metodo?.tipo === 'carta' ? (col.theme?.metodo?.personagem ?? '') : '');
        setClipBg(col.theme?.soulab?.clipUrl ?? null);
        const dia = col.dias.find((d) => d.dia === diaN);
        const slide = dia?.slides?.[idx];
        if (!dia || !slide) { setErro('slide nao encontrado'); return; }
        // 2 FACES: a mãe usa subtipo 'duasfaces' = 1 reel com a dor (slide 0) e a
        // revelação (slide 1), reveladas pela 1.ª e 2.ª metade do prog.
        const slide2 = col.theme?.subtipo === 'duasfaces' ? dia?.slides?.[1] : undefined;
        // pre-carrega as imagens de fundo (as duas, se houver) antes de marcar ready
        await Promise.all([slide.imageUrl, slide2?.imageUrl].filter(Boolean).map((src) => new Promise<void>((resolve) => {
          const im = new Image(); im.onload = () => resolve(); im.onerror = () => resolve(); im.src = src as string;
        })));
        setEstado({ slide, dia, idx, slide2 });
      } catch (e) { setErro(String(e)); }
    })();
  }, []);

  // séries diárias: body transparente para a moldura sair com alpha (omitBackground)
  useEffect(() => {
    const t = (estado?.slide as { tipo?: string } | undefined)?.tipo;
    if (typeof document !== 'undefined') document.body.style.background = t === 'serie-diaria' ? 'transparent' : '#000';
  }, [estado]);

  useEffect(() => {
    if (!estado) return;
    let cancel = false;
    const marcar = () => { if (!cancel) document.body.setAttribute('data-slide-ready', 'true'); };
    // espera os CLIPS (fundo de vídeo) terem dados antes de marcar ready, senão o
    // primeiro seek/screenshot apanha um frame vazio.
    const esperarVideos = () => {
      const vids = Array.from(document.querySelectorAll('video.clip-bg')) as HTMLVideoElement[];
      return Promise.all(vids.map((v) => v.readyState >= 2 ? Promise.resolve() : new Promise<void>((res) => {
        const done = () => res();
        v.addEventListener('loadeddata', done, { once: true });
        v.addEventListener('error', done, { once: true });
        setTimeout(done, 8000);
      })));
    };
    (document.fonts?.ready ?? Promise.resolve()).then(() => esperarVideos()).then(() => setTimeout(marcar, 200)).catch(marcar);
    return () => { cancel = true; };
  }, [estado]);

  const tipoSlide = (estado?.slide as { tipo?: string } | undefined)?.tipo;
  const ehInfo = tipoSlide === 'infografico';
  const ehAnel = tipoSlide === 'anel' || tipoSlide === 'perfil';
  const ehReel = tipoSlide === 'reel';
  const ehBanda = tipoSlide === 'banda';
  const ehKinetic = tipoSlide === 'kinetico';
  const ehMetodo = tipoSlide === 'metodo'; // identidade própria das contas do Método VS
  const ehTarde = ehMetodo && subtipo === 'nbeats'; // reel da tarde: N beats sobre 1 cena
  const ehCarta = ehMetodo && subtipo === 'carta'; // Carta de renomear (vir): capa cena + corpo papel
  const ehSerie = tipoSlide === 'serie-diaria'; // moldura das séries diárias, sobreposta ao motion no render
  const ehCarrosselReel = false; // sinais/ninguem/pensador passaram a reels 9:16 (MP4); já não há carrossel de imagens
  const H = ehAnel ? 1080 : ehInfo ? (video ? 1920 : 1350) : ehCarrosselReel ? 1350 : 1920;
  const sd = estado?.slide as unknown as { serie?: SerieId; frase?: string; dia?: string; paleta?: PaletaId } | undefined;
  const s = estado?.slide as unknown as (Slide & { imageUrl?: string; padrao?: string; rotulo?: string; subtitulo?: string; tipoDiagrama?: 'ciclo' | 'espectro' | 'herdado' | 'camadas' | 'travessia'; diagrama?: import('@/components/admin/InfograficoSlide').Diagrama; ciclo?: string[]; custoTi?: string; custoOutros?: string; virada?: string; url?: string; label?: string; perfil?: boolean; kicker?: string; nota?: string; capa?: boolean; cenario?: string; licao?: string; gancho?: string; serie?: string; titulo?: string; pontos?: string[]; motivo?: string; selo?: string; pal?: string; variante?: string; personagens?: import('@/components/admin/BandaSlide').Fala[]; destaque?: string[]; conceito?: string; contaId?: string; veuReveal?: string; clipUrl?: string; cta?: string }) | undefined;

  // TEMPO DE LEITURA: a passagem entre faces (split) é proporcional ao texto — a
  // face 2 (revelação, mais longa) fica com MAIS tempo. Face 1 nunca > 50%.
  const split = useMemo(() => {
    const w = (t?: string) => (t ?? '').trim().split(/\s+/).filter(Boolean).length;
    const l1 = w((estado?.slide as { texto?: string } | undefined)?.texto);
    const l2 = w((estado?.slide2 as { texto?: string } | undefined)?.texto);
    if (!l1 || !l2) return 0.5;
    return Math.max(0.34, Math.min(0.5, l1 / (l1 + l2)));
  }, [estado]);
  useEffect(() => { splitRef.current = split; }, [split]);

  return (
    <div className={`${cormorant.variable} ${inter.variable} ${jetmono.variable}`} style={{ margin: 0, padding: 0, width: 1080, height: H, overflow: 'hidden', background: ehSerie ? 'transparent' : '#000' }}>
      {erro && <div style={{ color: '#fff', padding: 40 }}>{erro}</div>}
      {estado && ehAnel && s && (
        <AnelCover label={s.label ?? ''} imageUrl={s.imageUrl} mundo={estado.dia.mundo} perfil={!!s.perfil} />
      )}
      {estado && ehInfo && s && (
        // MP4 = 9:16 cheio (preenche o ecrã como os outros reels), revelado camada a
        // camada via prog; PNG do feed = 4:5.
        <InfograficoSlide
          info={{ padrao: s.padrao ?? '', rotulo: s.rotulo, subtitulo: s.subtitulo, tipoDiagrama: s.tipoDiagrama, diagrama: s.diagrama, ciclo: s.ciclo, custoTi: s.custoTi, custoOutros: s.custoOutros, virada: s.virada, url: s.url }}
          mundo={estado.dia.mundo}
          imageUrl={s.imageUrl}
          prog={video ? prog : 1}
          ratio={video ? '9:16' : '4:5'}
          conceito={s.conceito}
        />
      )}
      {estado && ehReel && s && (
        <ReelSlide
          frame={{ kicker: s.kicker, texto: s.texto ?? '', nota: s.nota, titulo: s.titulo, pontos: s.pontos, motivo: s.motivo, selo: s.selo || (estado.idx === 0 && SERIE_ASSINATURA[subtipo] ? SERIE_ASSINATURA[subtipo] : undefined), pal: s.pal ?? (SERIE_ASSINATURA[subtipo] ? (estado.idx === 0 ? 'carvao' : 'creme') : undefined), imageUrl: s.imageUrl }}
          mundo={estado.dia.mundo}
          imageUrl={s.imageUrl}
          numero={estado.idx + 1}
          total={estado.dia.slides?.length ?? 1}
          capa={!!s.capa}
          ratio={ehCarrosselReel ? '4:5' : '9:16'}
          conceito={s.conceito}
        />
      )}
      {estado && ehBanda && s && (
        <BandaSlide
          painel={{ cenario: s.cenario, licao: s.licao, personagens: s.personagens, imageUrl: s.imageUrl, gancho: s.gancho, texto: s.texto, serie: s.serie, cta: s.cta }}
          mundo={estado.dia.mundo}
          numero={estado.idx + 1}
          total={estado.dia.slides?.length ?? 1}
          capa={!!s.capa}
          conceito={s.conceito}
        />
      )}
      {estado && ehKinetic && s && (
        <KineticSlide
          texto={s.texto ?? ''}
          destaque={s.destaque}
          imageUrl={s.imageUrl}
          mundo={estado.dia.mundo}
          prog={prog}
          variante={s.variante}
          efeito={(s as { efeito?: EfeitoTexto }).efeito}
          tipografia={(s as { tipografia?: Tipografia }).tipografia}
          conceito={s.conceito}
          clipUrl={(estado.dia.mundo as string) === 'soulab' ? (clipBg ?? undefined) : undefined}
          {...((estado.dia.mundo as string) === 'soulab' ? SOULAB_SLIDE : {})}
        />
      )}
      {estado && ehMetodo && ehCarta && s && getConta(s.contaId ?? '') && (
        <CartaSequencia
          beats={(estado.dia.slides ?? []).map((x) => (x as { texto?: string }).texto ?? '').filter(Boolean)}
          conta={getConta(s.contaId ?? '')!}
          prog={prog}
          capaImg={estado.dia.slides?.[0]?.imageUrl}
        />
      )}
      {estado && ehMetodo && !ehCarta && ehTarde && s && getConta(s.contaId ?? '') && (
        <Sequencia
          beats={(estado.dia.slides ?? []).map((x) => (x as { texto?: string }).texto ?? '').filter(Boolean)}
          clipUrl={(estado.dia.slides?.[0] as { clipUrl?: string } | undefined)?.clipUrl}
          imageUrl={estado.dia.slides?.[0]?.imageUrl}
          conta={getConta(s.contaId ?? '')!}
          conceito={s.conceito}
          veuReveal={(estado.dia.slides?.[(estado.dia.slides?.length ?? 1) - 1] as { veuReveal?: string } | undefined)?.veuReveal}
          prog={prog}
          nomeCarta={nomeCarta || undefined}
        />
      )}
      {estado && ehMetodo && !ehCarta && !ehTarde && estado.slide2 && s && getConta(s.contaId ?? '') && (
        <DuasFaces face1={s as Face} face2={estado.slide2 as unknown as Face} conta={getConta(s.contaId ?? '')!} prog={prog} split={split} />
      )}
      {estado && ehMetodo && !ehCarta && !ehTarde && !estado.slide2 && s && getConta(s.contaId ?? '') && (
        <MetodoSlide
          texto={s.texto ?? ''}
          destaque={s.destaque}
          imageUrl={s.imageUrl}
          clipUrl={s.clipUrl}
          conta={getConta(s.contaId ?? '')!}
          conceito={s.conceito}
          veuReveal={s.veuReveal}
          prog={prog}
        />
      )}
      {estado && ehSerie && sd && (
        // moldura TRANSPARENTE (só texto/marca); o ffmpeg sobrepõe-na ao motion
        <SerieDiariaSlide serie={sd.serie ?? 'vcsabia'} frase={sd.frase ?? ''} dia={sd.dia} paleta={sd.paleta} prog={prog} transparente />
      )}
      {estado && !ehInfo && !ehAnel && !ehReel && !ehBanda && !ehKinetic && !ehMetodo && !ehSerie && (
        <VeuSlide
          slide={estado.slide}
          mundo={estado.dia.mundo}
          palavra={estado.dia.palavra}
          subtitulo={estado.dia.subtitulo}
          imageUrl={estado.slide.imageUrl}
          numeroDia={estado.dia.dia}
          slideIndex={estado.idx + 1}
          slideTotal={estado.dia.slides?.length ?? 6}
          prog={prog}
        />
      )}
    </div>
  );
}
