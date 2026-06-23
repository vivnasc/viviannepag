'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, type ComponentProps } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { MetodoSlide, type EstiloMetodo } from '@/components/admin/MetodoSlide';
import { MapaSlide } from '@/components/admin/MapaSlide';
import { CartaSlide } from '@/components/admin/CartaSlide';
import { getConta } from '@/lib/metodo/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type EstadoPost = { slug: string; conta: string | null; tipo: string | null; subtipo: string | null; formato: string | null; beats: string[]; texto: string; conceito: string; imageUrl: string | null; texto2: string | null; conceito2: string | null; imageUrl2: string | null; veuReveal: string | null; veuReveal2: string | null; clip: string | null; clip2: string | null; clipPend: boolean; clipPend2: boolean; clipErro: string | null; vozUrl: string | null; som: string | null; clipTeste: string | null; videoUrl: string | null; legenda: string | null; agendadoEm: string | null; hora: string | null; publicado: boolean; aprovado: boolean; igStatus: string | null; criadoEm: string | null; estilo?: EstiloMetodo | null };

// ESTÁGIO de um post (como no Soulab/Publicar): em edição (a trabalhar) · agendada
// (aprovada, espera a hora) · publicada. Erro = uma publicação que falhou (badge).
type Estagio = 'edicao' | 'agendadas' | 'publicadas' | 'todas';
const estagioDe = (e: EstadoPost): Exclude<Estagio, 'todas'> => e.publicado ? 'publicadas' : e.aprovado ? 'agendadas' : 'edicao';
const ESTAGIOS: { id: Estagio; label: string }[] = [
  { id: 'edicao', label: '✎ em edição' },
  { id: 'agendadas', label: '📅 agendadas' },
  { id: 'publicadas', label: '✓ publicadas' },
  { id: 'todas', label: 'todas' },
];

const TIPO_LABEL: Record<string, string> = {
  carta: 'Carta · Sou Aquela', naonormalizes: 'Não normalizes', cena: 'A cena',
  espelho: 'O Espelho', cartaRenomear: 'Carta de renomear', repara: 'Repara',
  // MÃE · autoridade (os 8 formatos da semana de autoridade)
  veuDe: '🪞 O Véu de…', mecanismo: '⚙️ O Mecanismo Invisível', origem: '🌱 A Origem',
  erro: '🔁 O Erro de Interpretação', custo: '💸 O Custo Escondido', mito: '⚔️ Mito vs Verdade',
  mapa: '🗺️ O Mapa do Véu',
};
// O QUE CADA FORMATO PRECISA (não replicar botões sem pensar no formato — regra
// da Vivianne): todos são texto-sobre-imagem, logo imagem SIM. Som ambiente nos reels
// que MEXEM (cena · não normalizes · espelho) E na CARTA DE RENOMEAR (decisão da
// Vivianne: tipográfica pura ficava simplória; leva som por baixo, mesmo sem imagem).
// voz = narração (a voz da Vivianne, ElevenLabs) — decisão dela de a meter (reverte o
// antigo "voz em nenhum"). Disponível em todos os formatos com texto.
const CAP_FORMATO: Record<string, { imagem: boolean; som: boolean; voz: boolean }> = {
  carta: { imagem: true, som: false, voz: true }, naonormalizes: { imagem: true, som: true, voz: true },
  cena: { imagem: true, som: true, voz: true }, espelho: { imagem: true, som: true, voz: true },
  cartaRenomear: { imagem: true, som: true, voz: true }, repara: { imagem: true, som: false, voz: true },
  // MÃE · autoridade: reels de texto sobre imagem (com som ambiente + voz)
  veuDe: { imagem: true, som: true, voz: true }, mecanismo: { imagem: true, som: true, voz: true },
  origem: { imagem: true, som: true, voz: true }, erro: { imagem: true, som: true, voz: true },
  custo: { imagem: true, som: true, voz: true }, mito: { imagem: true, som: true, voz: true },
  mapa: { imagem: true, som: true, voz: true },
};
const capFormato = (tipo?: string | null) => CAP_FORMATO[tipo ?? ''] ?? { imagem: true, som: false, voz: true };
// 2.ª-feira (ISO) da semana a `offset` semanas de hoje — para testar/gerar 1 dia.
const segISO = (offset: number) => { const x = new Date(); const wd = x.getDay(); x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd) + offset * 7); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const DIAS_CAB = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// PRÉ-VER (feed da mãe): cicla os MOMENTOS da peça (cada beat), com pontinhos, como
// no laboratório — para ela ver TODOS os slides no cartão, não só a capa. EXCEÇÃO: os
// formatos com layout PRÓPRIO (ex. O Mapa do Véu) mostram-se compostos, num só cartão.
function MomentosPreview({ beats, conta, imageUrl, conceito, tipo }: { beats: string[]; conta: ComponentProps<typeof MetodoSlide>['conta']; imageUrl: string | null; conceito: string; tipo?: string | null }) {
  const [i, setI] = useState(0);
  const n = Math.max(1, beats.length);
  useEffect(() => { if (n <= 1) return; const t = setInterval(() => setI((x) => (x + 1) % n), 2600); return () => clearInterval(t); }, [n]);
  // O Mapa do Véu tem cara própria: cartão-diagnóstico (não slides iguais a ciclar).
  if (tipo === 'mapa') return <MapaSlide beats={beats} conta={conta} imageUrl={imageUrl ?? undefined} prog={1} />;
  const idx = Math.min(i, n - 1);
  return (
    <div className="relative">
      <MetodoSlide texto={beats[idx] ?? beats[0] ?? ''} conta={conta} conceito={idx === 0 ? conceito : ''} imageUrl={imageUrl ?? undefined} prog={1} />
      {n > 1 && (
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
          {beats.map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: k === idx ? '#d8b25a' : 'rgba(255,255,255,0.35)' }} />)}
        </div>
      )}
    </div>
  );
}

export default function MetodoContaPage() {
  const params = useParams<{ conta: string }>();
  const conta = getConta(params.conta);
  const [estado, setEstado] = useState<Record<string, EstadoPost>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [lote, setLote] = useState<{ feito: number; total: number } | null>(null);
  const [detalhe, setDetalhe] = useState<EstadoPost | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  // ORGANIZAÇÃO (pedido da Vivianne, como no Soulab): NÃO há abas manhã/tarde — os
  // dois períodos aparecem juntos por dia (manhã em cima, tarde em baixo, por hora).
  // As abas são por ESTÁGIO (em edição · agendadas · publicadas · todas), para ela
  // ver logo no que está a trabalhar sem cliques extras.
  const [estagio, setEstagio] = useState<Estagio>('edicao');
  // SEMANA a gerar (offset em semanas a partir de ESTA). Arranca na próxima semana
  // CHEIA: se hoje já passou a 2.ª-feira, não geramos meia-semana — começamos na
  // 2.ª que vem (ex.: hoje 20 jun -> semana de 22 jun). Assim nunca se gera passado.
  const [offset, setOffset] = useState(() => { const h = new Date(); return h.getDay() === 1 ? 0 : 1; });
  // 2.ª-feira (e domingo) da semana-alvo, para o rótulo "semana de X a Y".
  const segDaSemanaAlvo = (() => { const x = new Date(); const wd = x.getDay(); x.setDate(x.getDate() + (wd === 0 ? -6 : 1 - wd) + offset * 7); x.setHours(0, 0, 0, 0); return x; })();
  const domDaSemanaAlvo = (() => { const d = new Date(segDaSemanaAlvo); d.setDate(d.getDate() + 6); return d; })();
  const fmtDM = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

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

  // apaga os posts de DIAS QUE JÁ PASSARAM (não publicados) — limpa o lixo de
  // semanas de teste sem mexer no que já foi publicado nem no futuro.
  const [limparPassadoBusy, setLimparPassadoBusy] = useState(false);
  const apagarPassados = useCallback(async (slugs: string[]) => {
    if (limparPassadoBusy || !slugs.length) return;
    if (typeof window !== 'undefined' && !window.confirm(`Apagar ${slugs.length} post(s) de dias que já passaram? Os publicados ficam protegidos.`)) return;
    setLimparPassadoBusy(true); setErro(null); setMsg(null);
    let n = 0;
    for (const slug of slugs) {
      try { const r = await fetch('/api/admin/metodo/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (r.ok) n += 1; } catch { /* segue */ }
    }
    setLimparPassadoBusy(false); setMsg(`${n} post(s) de dias passados apagado(s). Gera a próxima semana (▶).`); recarregar();
  }, [limparPassadoBusy, recarregar]);

  // MOVER (não apagar) os dias passados para a semana-alvo visível: empurra-os por
  // N semanas inteiras, mantendo o dia-da-semana (e o véu) e a hora. Assim não se
  // perde o trabalho já feito. O delta = nº de semanas da mais antiga até à alvo.
  const [moverBusy, setMoverBusy] = useState(false);
  const moverPassados = useCallback(async (deltaSemanas: number) => {
    if (!conta || moverBusy || deltaSemanas < 1) return;
    if (typeof window !== 'undefined' && !window.confirm(`Mover os dias passados ${deltaSemanas} semana(s) para a frente (mantém o dia da semana e a hora)? Os publicados ficam onde estão.`)) return;
    setMoverBusy(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/mover', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, deltaSemanas }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`${j.movidos ?? 0} post(s) movidos para a frente${j.saltados ? ` (${j.saltados} saltados: já havia post nesse dia)` : ''}.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setMoverBusy(false); }
  }, [conta, moverBusy, recarregar]);


  // gerar o plano NO SERVIDOR, alinhado ao Plano da Semana: cada post já com a sua
  // DATA. A semana-alvo é o `offset` (0 = esta, 1 = a que vem…); nunca gera passado.
  const gerarLote = useCallback(async (semanas = 1) => {
    if (!conta || lote) return;
    setErro(null);
    setLote({ feito: 0, total: semanas * 7 });
    setMsg('A gerar o TEXTO no servidor, já com a data de cada dia (não gasta créditos de imagem). Podes sair ou fechar. Volta e recarrega.');
    try {
      // a mãe é AUTORIDADE: a semana dos 8 formatos (1 véu/semana). As filhas usam o
      // seu gerador (a cena de manhã + a peça funda da tarde, cada uma no seu formato).
      const endpoint = conta.id === 'mae' ? '/api/admin/metodo/gerar-autoridade' : '/api/admin/metodo/gerar-conta';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, semanas, offset }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else if (j.jaPassou) setMsg('Essa semana já passou — avança para a semana seguinte (▶) e gera essa.');
      else setMsg(`${j.gerados} posts gerados, com a data de cada dia. Revê e limpa; depois "gerar imagens em falta" só das que ficarem.`);
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setLote(null); recarregar(); }
  }, [conta, lote, offset, recarregar]);

  // TESTAR 1 DIA (texto): gera SÓ a 2.ª-feira da semana-alvo (manhã + tarde) desta
  // conta, para a Vivianne VER o conteúdo antes de gastar créditos na semana toda.
  const [testeBusy, setTesteBusy] = useState(false);
  const testarUmDia = useCallback(async () => {
    if (!conta || testeBusy || lote) return;
    setTesteBusy(true); setErro(null); setMsg('A gerar 1 dia (teste)…');
    try {
      const endpoint = conta.id === 'mae' ? '/api/admin/metodo/gerar-autoridade' : '/api/admin/metodo/gerar-conta';
      const r = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id, dia: segISO(offset), offset }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg(`1 dia de teste gerado (${j.gerados ?? 0} post(s)). Abre, vê o texto e "testar 1 imagem". Se gostares, gera a semana.`);
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setTesteBusy(false); }
  }, [conta, testeBusy, lote, offset, recarregar]);

  // AS 4 CONTAS de uma vez (só na mãe): testa 1 dia OU gera a semana de mae+ver+
  // vir+viver em sequência, para não entrar conta a conta. O dia/semana é o mesmo
  // offset visível. Corre uma a uma (cada chamada já persiste no servidor).
  const [quatroBusy, setQuatroBusy] = useState(false);
  const correrQuatro = useCallback(async (modo: 'dia' | 'semana') => {
    if (quatroBusy || lote) return;
    setQuatroBusy(true); setErro(null);
    const contas: { id: string; ep: string }[] = [
      { id: 'mae', ep: '/api/admin/metodo/gerar-autoridade' },
      { id: 'ver', ep: '/api/admin/metodo/gerar-conta' },
      { id: 'vir', ep: '/api/admin/metodo/gerar-conta' },
      { id: 'viver', ep: '/api/admin/metodo/gerar-conta' },
    ];
    let totais = 0;
    try {
      for (const c of contas) {
        setMsg(`${modo === 'dia' ? 'A testar 1 dia' : 'A gerar a semana'} · ${c.id}…`);
        const body = modo === 'dia' ? { conta: c.id, dia: segISO(offset), offset } : { conta: c.id, semanas: 1, offset };
        const r = await fetch(c.ep, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) totais += j.gerados ?? 0;
        else setErro(`${c.id}: ${(j.erro ?? 'erro')}${j.detalhe ? ` (${j.detalhe})` : ''}`);
        recarregar();
      }
      setMsg(`${modo === 'dia' ? 'Teste de 1 dia' : 'Semana'} das 4 contas: ${totais} posts no total. Revê cada conta na sua secção.`);
    } catch (e) { setErro(String(e)); }
    finally { setQuatroBusy(false); recarregar(); }
  }, [quatroBusy, lote, offset, recarregar]);

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
  // "ver grande": abre um slide do reel em tamanho real (a lupa é pequena demais).
  const [grande, setGrande] = useState<{ texto: string; capa: boolean } | null>(null);
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


  // descartar (apagar) um post gerado que não presta, na revisão.
  const descartar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar este post?')) return;
    try {
      const r = await fetch('/api/admin/metodo/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) recarregar(); else { const j = await r.json().catch(() => ({})); setErro(j.erro ?? 'erro a apagar'); }
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  // outra imagem: regenera só a imagem (variação nova), mantém o texto. Para
  // SUBSTITUIR uma imagem que não se quer, sem descartar o post.
  const [novaImgBusy, setNovaImgBusy] = useState<string | null>(null);
  const novaImagem = useCallback(async (slug: string, estilo?: 'dramatico') => {
    if (novaImgBusy) return;
    setNovaImgBusy(slug); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/metodo/imagem-uma', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(estilo ? { slug, estilo } : { slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else {
        const urls = (j.imageUrls ?? [j.imageUrl]) as (string | null)[];
        setMsg(estilo === 'dramatico' ? 'Imagem DRAMÁTICA gerada. Agora "animar" para o movimento.' : 'Imagem gerada. Se não gostares, carrega outra vez.');
        setDetalhe((d) => (d && d.slug === slug ? { ...d, imageUrl: urls[0] ?? d.imageUrl, imageUrl2: urls[1] ?? d.imageUrl2, clip: null, clip2: null, clipPend: false, clipPend2: false, videoUrl: null } : d));
        recarregar();
      }
    } catch (e) { setErro(String(e)); }
    finally { setNovaImgBusy(null); }
  }, [novaImgBusy, recarregar]);

  // ANIMAR o fundo (imagem -> vídeo, Kling). DISPARA no servidor e volta em segundos:
  // o clip é colhido depois (corre no Replicate), por isso PODES MUDAR DE CONTA OU
  // FECHAR que não se perde. ~$0.35/face, fica pronto em ~2-5 min.
  const [animarBusy, setAnimarBusy] = useState<string | null>(null);
  const animar = useCallback(async (slug: string, face?: number) => {
    if (animarBusy) return;
    setAnimarBusy(slug); setErro(null); setMsg('A disparar a animação no servidor…');
    try {
      const r = await fetch('/api/admin/metodo/animar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(face === undefined ? { slug } : { slug, face }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else {
        setMsg(`A animar ${j.pendentes ?? 1} face(s) no servidor (~2-5 min). Podes mudar de conta ou fechar — o clip aparece sozinho quando ficar pronto.`);
        // marca pendente já (a colheita automática traz o clip quando estiver pronto)
        setDetalhe((d) => (d && d.slug === slug ? { ...d, clipPend: true, clipPend2: d.imageUrl2 ? true : d.clipPend2 } : d));
        recarregar();
      }
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setAnimarBusy(null); }
  }, [animarBusy, recarregar]);

  // COLHE os clips prontos (varre o método todo). Corre sozinho enquanto houver
  // faces a animar — e também ao abrir a página, para apanhar o que ficou pronto
  // enquanto estiveste fora. É isto que torna a animação independente da aba.
  const colher = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/metodo/colher', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && (j.colhidos ?? 0) > 0) recarregar();
    } catch { /* tenta na próxima */ }
  }, [recarregar]);

  // colhe ao abrir (apanha o que ficou pronto enquanto saíste) e, enquanto houver
  // faces a animar, vai colhendo a cada 15s — o clip aparece sozinho na página.
  const haPendentes = Object.values(estado).some((e) => e.clipPend || e.clipPend2);
  useEffect(() => { colher(); }, [colher]);
  useEffect(() => {
    if (!haPendentes) return;
    const id = setInterval(colher, 15000);
    return () => clearInterval(id);
  }, [haPendentes, colher]);

  // mantém a JANELA aberta (detalhe) em sincronia com a lista: quando a colheita
  // traz o 2.º clip (ou o vídeo final), a janela atualiza-se sozinha em vez de
  // ficar presa no estado em que a abriste (era isto que mostrava "só 1 clip").
  useEffect(() => {
    setDetalhe((d) => {
      if (!d) return d;
      const fresh = Object.values(estado).find((e) => e.slug === d.slug);
      return fresh ?? d;
    });
  }, [estado]);

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

  // SOM (ambiente, ElevenLabs sound-generation): gera/regenera o som de fundo do
  // reel (só nos formatos que MEXEM). Ouves no player. NÃO é voz (não há voz).
  const [somBusy, setSomBusy] = useState<string | null>(null);
  const gerarSomTeste = useCallback(async (slug: string) => {
    if (somBusy) return;
    setSomBusy(slug); setErro(null); setMsg('A gerar o som ambiente (ElevenLabs)…');
    try {
      const r = await fetch('/api/admin/metodo/som', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else { setMsg('Som gerado. Ouve no player.'); setDetalhe((d) => (d && d.slug === slug ? { ...d, som: j.som } : d)); recarregar(); }
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setSomBusy(null); }
  }, [somBusy, recarregar]);

  // VOZ (narração, ElevenLabs TTS): a voz da Vivianne lê o texto do post. Ouves no player.
  const [vozBusy, setVozBusy] = useState<string | null>(null);
  const gerarVozTeste = useCallback(async (slug: string) => {
    if (vozBusy) return;
    setVozBusy(slug); setErro(null); setMsg('A gerar a voz (ElevenLabs)…');
    try {
      const r = await fetch('/api/admin/metodo/voz', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else { setMsg('Voz gerada. Ouve no player.'); setDetalhe((d) => (d && d.slug === slug ? { ...d, vozUrl: j.voz } : d)); recarregar(); }
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setVozBusy(null); }
  }, [vozBusy, recarregar]);

  // ESTILO (independência): guarda a tipografia do post (theme.estilo) e atualiza já o preview.
  const salvarEstilo = useCallback(async (slug: string, estilo: EstiloMetodo) => {
    setDetalhe((d) => (d && d.slug === slug ? { ...d, estilo } : d));
    try { await fetch('/api/admin/metodo/estilo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, estilo }) }); } catch { /* fica o preview local */ }
  }, []);

  // CARTA DE RENOMEAR (vir): gera UMA carta (6 passos) e persiste-a (subtipo 'carta').
  const [cartaBusy, setCartaBusy] = useState(false);
  const gerarCarta = useCallback(async () => {
    if (!conta || cartaBusy) return;
    setCartaBusy(true); setErro(null); setMsg('A gerar uma Carta de renomear…');
    try {
      const r = await fetch('/api/admin/metodo/gerar-carta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conta: conta.id }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg('Carta criada (Tarde). Abre, revê e renderiza: capa alto contraste + corpo papel.');
      recarregar();
    } catch (e) { setErro(String(e)); }
    finally { setCartaBusy(false); }
  }, [conta, cartaBusy, recarregar]);

  if (!conta) {
    return <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-8`}>
      <p>Conta desconhecida. <Link className="underline" href="/admin/metodo">Voltar</Link></p>
    </main>;
  }

  // tudo o que já foi gerado para esta conta (inclui os do lote/IA), para feedback e render.
  // ordem ESTÁVEL (data, depois slug): os cartões não saltam de sítio quando a
  // lista recarrega após gerar/descartar/render.
  const geradosConta = Object.values(estado).filter((e) => e.conta === conta.id).sort((a, b) => (a.agendadoEm ?? '~').localeCompare(b.agendadoEm ?? '~') || a.slug.localeCompare(b.slug));
  const faltamRender = geradosConta.filter((e) => !e.videoUrl);
  // a Carta de renomear é TIPOGRÁFICA (não leva imagem Flux) — fora das contagens de imagem.
  // a carta de renomear AGORA leva imagem (na CAPA) — por isso conta para "imagens em falta".
  const levaImagem = (e: EstadoPost) => Boolean(e);
  const semImagem = geradosConta.filter((e) => !e.imageUrl && levaImagem(e)).length;
  // posts de DIAS QUE JÁ PASSARAM e ainda não publicados (lixo das semanas de teste).
  const hojeISO = (() => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`; })();
  const passados = geradosConta.filter((e) => e.agendadoEm && e.agendadoEm < hojeISO && !e.publicado);

  // PERÍODO de um post (só para o badge ☀️/🌙 no cartão): tarde = hora >= 13h.
  const ehTardePost = (e: EstadoPost) => (e.hora ?? '') >= '13:00';
  // o CALENDÁRIO mostra o ESTÁGIO escolhido (não o período): em edição · agendadas ·
  // publicadas · todas. Os dois períodos aparecem juntos por dia (ordenados por hora).
  const geradosVista = geradosConta.filter((e) => estagio === 'todas' || estagioDe(e) === estagio);
  // por dia (a data é o plano): para a grelha de calendário.
  const porDia = new Map<string, EstadoPost[]>();
  for (const e of geradosVista) { const k = e.agendadoEm ?? 'sem data'; (porDia.get(k) ?? porDia.set(k, []).get(k)!).push(e); }
  // manhã em cima, tarde em baixo: ordena por hora dentro de cada dia.
  for (const lista of porDia.values()) lista.sort((a, b) => (a.hora ?? '99').localeCompare(b.hora ?? '99'));
  const semDataList = porDia.get('sem data') ?? [];

  // grelha de calendário: UMA SEMANA de cada vez (a `offset`, a mesma que se gera),
  // como o Plano da Semana da veu.a.veu. Nunca amontoa: 10 semanas = navegar 10
  // vezes com ◀ ▶. Cada semana é a sua página limpa, sincronizada com a geração.
  const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); };
  const fmtD = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const semanaUnica: string[] = Array.from({ length: 7 }, (_, i) => { const d = new Date(segDaSemanaAlvo); d.setDate(segDaSemanaAlvo.getDate() + i); return fmtD(d); });
  const postsDaSemana = geradosVista.filter((e) => e.agendadoEm && semanaUnica.includes(e.agendadoEm));
  // contadores por ESTÁGIO desta semana — para as abas mostrarem quanto há em cada.
  const daSemanaTudo = geradosConta.filter((e) => e.agendadoEm && semanaUnica.includes(e.agendadoEm));
  const contaEstagio = (id: Estagio) => id === 'todas' ? daSemanaTudo.length : daSemanaTudo.filter((e) => estagioDe(e) === id).length;
  // quantas semanas é preciso empurrar os passados para a mais antiga cair na semana-alvo.
  const deltaParaAlvo = (() => {
    if (!passados.length) return 0;
    const cedo = passados.map((e) => e.agendadoEm as string).sort()[0];
    const segCedo = (() => { const d = parse(cedo); const wd = d.getDay(); d.setDate(d.getDate() + (wd === 0 ? -6 : 1 - wd)); d.setHours(0, 0, 0, 0); return d; })();
    return Math.round((segDaSemanaAlvo.getTime() - segCedo.getTime()) / (7 * 86400000));
  })();

  return (
    <main className={`${FONTS} min-h-screen bg-[#0F0F1A] text-[#F2E8DC] px-4 py-8 md:px-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/metodo" className="text-[0.75rem] opacity-60 hover:opacity-100">← Método VS</Link>
        <header className="mt-3 mb-6 rounded-2xl border border-white/10 p-5" style={{ background: `${conta.paleta.bg1}` }}>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-cormorant), serif', color: '#d8b25a' }}>
            @{conta.handle} <span className="opacity-70 text-base text-[#F2E8DC]">· {conta.movimento}, {conta.essencia}</span>
          </h1>
          <p className="mt-2 text-[0.9rem] opacity-90">{conta.depois}</p>
          <p className="mt-1 text-[0.78rem] opacity-70">Símbolo: {conta.simbolo} · Véus: {conta.veus.join(' + ')} · Vende: {conta.manualNome} (€{conta.manualPrecoEur})</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem]">
            {/* SEMANA-ALVO: ◀ ▶ escolhem que semana se gera; o rótulo mostra as datas
                reais. Arranca na próxima semana CHEIA, por isso nunca gera passado. */}
            <span className="inline-flex items-center rounded-lg border border-white/15 overflow-hidden">
              <button onClick={() => setOffset((o) => o - 1)} title="semana anterior" className="px-2 py-1.5 hover:bg-white/10">◀</button>
              <span className="px-2 py-1.5 min-w-[150px] text-center">{offset === 0 ? 'esta semana' : offset === 1 ? 'próxima semana' : `+${offset} semanas`}<br /><span className="opacity-60 text-[0.62rem]">{fmtDM(segDaSemanaAlvo)} a {fmtDM(domDaSemanaAlvo)}</span></span>
              <button onClick={() => setOffset((o) => o + 1)} title="semana seguinte" className="px-2 py-1.5 hover:bg-white/10">▶</button>
            </span>
            <button onClick={testarUmDia} disabled={testeBusy || !!lote} title={conta.id === 'mae' ? 'gera SÓ a 2.ª-feira desta semana (🪞 O Véu de…) para veres o texto antes da semana toda' : 'gera SÓ a 2.ª-feira desta semana para veres o texto antes de gastar créditos na semana toda'} className="px-3 py-1.5 rounded-lg border border-sky-400/50 text-sky-300 disabled:opacity-40">{testeBusy ? 'a testar…' : '🔍 testar 1 dia (texto)'}</button>
            <button onClick={() => gerarLote(1)} disabled={!!lote} title={conta.id === 'mae' ? 'gera a SEMANA DE AUTORIDADE: 1 véu, os 8 formatos (seg→dom, quarta a dobrar)' : 'gera o texto da semana, já com a data de cada dia'} className="px-3 py-1.5 rounded-lg border disabled:opacity-50" style={{ borderColor: '#d8b25a', color: '#0F0F1A', background: '#d8b25a' }}>{conta.id === 'mae' ? '⚔️ gerar semana de autoridade' : 'gerar esta semana (texto)'}</button>
            {conta.id === 'mae' && <button onClick={() => correrQuatro('dia')} disabled={quatroBusy || !!lote} title="gera 1 dia (manhã + tarde) em TODAS as contas (mãe + ver + vir + viver) para testares as 4 de uma vez" className="px-3 py-1.5 rounded-lg border border-sky-400/40 text-sky-300 disabled:opacity-40">{quatroBusy ? '…' : '🔍 testar 1 dia · 4 contas'}</button>}
            {conta.id === 'mae' && <button onClick={() => correrQuatro('semana')} disabled={quatroBusy || !!lote} title="gera a semana toda nas 4 contas de uma vez (só depois de testares)" className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{quatroBusy ? '…' : 'gerar a semana · 4 contas'}</button>}
            {conta.id === 'vir' && <button onClick={gerarCarta} disabled={cartaBusy} title="gera UMA Carta de renomear (6 passos: cena → vida → nome → releitura → preço → abertura). Capa alto contraste + corpo papel." className="px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 disabled:opacity-40">{cartaBusy ? '✉️ a gerar…' : '✉️ gerar Carta de renomear'}</button>}
            <Link href={`/admin/publicar?conta=${conta.marca}&vista=semana`} className="px-3 py-1.5 rounded-lg border border-white/20">abrir no Publicar (por dia) →</Link>
            {conta.id === 'mae' && <Link href="/admin/metodo/mae-plano" className="px-3 py-1.5 rounded-lg border" style={{ borderColor: '#d8b25a', color: '#d8b25a' }}>📅 Plano da semana (ver a ordem) →</Link>}
            {lote && <span className="opacity-80">a gerar no servidor… (~1 min)</span>}
          </div>
          <p className="mt-1 text-[0.68rem] opacity-50">Escolhe a semana (◀ ▶) e gera só o TEXTO, já com a data de cada dia (não gasta créditos de imagem). Para longo prazo, gera semana a semana — vão-se empilhando no calendário em baixo. Depois revês, limpas e só então "gerar imagens em falta".</p>
          <div className="mt-3 flex gap-2 flex-wrap items-center text-[0.72rem] border-t border-white/10 pt-3">
            <span className="opacity-80">Gerados: <b style={{ color: '#d8b25a' }}>{geradosConta.length}</b> · com imagem: {geradosConta.length - semImagem} · com vídeo: {geradosConta.length - faltamRender.length}</span>
            {semImagem > 0 && <button onClick={() => { const alvo = geradosConta.find((e) => !e.imageUrl && levaImagem(e)); if (alvo) novaImagem(alvo.slug); }} disabled={!!novaImgBusy} title="gera só a imagem do 1.º post sem imagem — para veres se sai bem antes de gerar todas" className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{novaImgBusy ? 'a gerar 1…' : 'testar 1 imagem'}</button>}
            {semImagem > 0 && <button onClick={gerarImagens} disabled={imgBusy} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">{imgBusy ? 'a gerar imagens…' : `gerar imagens em falta (${semImagem})`}</button>}
            {geradosConta.length > 0 && <button onClick={() => renderFaltam(faltamRender)} disabled={renderBusy || !faltamRender.length} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-40">
              {renderBusy ? 'a disparar render…' : `renderizar os que faltam (${faltamRender.length})`}
            </button>}
            {geradosConta.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-2 py-1">
                <span className="opacity-70">hora:</span>
                <input type="time" value={horaInput} onChange={(e) => setHoraInput(e.target.value)} className="bg-transparent text-[#F2E8DC] outline-none [color-scheme:dark]" />
                <button onClick={definirHora} disabled={horaBusy} className="rounded-md px-2 py-0.5 disabled:opacity-40" style={{ background: '#d8b25a', color: '#0F0F1A' }}>{horaBusy ? '…' : 'aplicar a todas'}</button>
              </span>
            )}
            {passados.length > 0 && deltaParaAlvo >= 1 && <button onClick={() => moverPassados(deltaParaAlvo)} disabled={moverBusy} title="empurra os dias passados para esta semana (mantém o dia da semana e a hora) — não perde o trabalho" className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: '#d8b25a', color: '#d8b25a' }}>{moverBusy ? 'a mover…' : `↪ mover passados para ${fmtDM(segDaSemanaAlvo)} (${passados.length})`}</button>}
            {passados.length > 0 && <button onClick={() => apagarPassados(passados.map((e) => e.slug))} disabled={limparPassadoBusy} title="apaga os posts de dias que já passaram (os publicados ficam)" className="px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 disabled:opacity-40">{limparPassadoBusy ? 'a apagar…' : `apagar dias passados (${passados.length})`}</button>}
            {geradosConta.length > 0 && <button onClick={apagarTudo} disabled={apagarBusy} className="px-3 py-1.5 rounded-lg border border-rose-400/40 text-rose-300/90 disabled:opacity-40">{apagarBusy ? 'a apagar…' : 'apagar tudo'}</button>}
          </div>
        </header>

        {erro && <p className="mb-3 text-[0.8rem] text-rose-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.8rem] text-emerald-300">{msg}</p>}

        {geradosConta.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">Semana de {fmtDM(segDaSemanaAlvo)} a {fmtDM(domDaSemanaAlvo)} <span className="opacity-40">· {postsDaSemana.length} nesta vista (total {geradosConta.length})</span></h2>
            <div className="mb-3 flex items-center gap-2 flex-wrap text-[0.78rem]">
              <span className="inline-flex items-center rounded-lg border border-white/15 overflow-hidden mr-1">
                <button onClick={() => setOffset((o) => o - 1)} title="semana anterior" className="px-2 py-1.5 hover:bg-white/10">◀</button>
                <button onClick={() => setOffset(() => { const h = new Date(); return h.getDay() === 1 ? 0 : 1; })} className="px-2 py-1.5 text-[0.66rem] opacity-70 hover:bg-white/10">hoje</button>
                <button onClick={() => setOffset((o) => o + 1)} title="semana seguinte" className="px-2 py-1.5 hover:bg-white/10">▶</button>
              </span>
              {/* ABAS POR ESTÁGIO (não por período): manhã e tarde aparecem JUNTAS por dia. */}
              <div className="inline-flex rounded-lg border border-white/15 overflow-hidden flex-wrap">
                {ESTAGIOS.map((s) => (
                  <button key={s.id} onClick={() => setEstagio(s.id)} className="px-3 py-1.5" style={{ background: estagio === s.id ? '#d8b25a' : 'transparent', color: estagio === s.id ? '#0F0F1A' : '#F2E8DC' }}>{s.label} · {contaEstagio(s.id)}</button>
                ))}
              </div>
            </div>
            {sel.size > 0 && (
              <div className="mb-3 flex items-center gap-2 flex-wrap text-[0.78rem] rounded-lg border border-rose-400/30 bg-rose-500/5 px-3 py-2">
                <span><b>{sel.size}</b> selecionado(s)</span>
                <button onClick={apagarSelecionados} className="px-3 py-1 rounded-lg border border-rose-400/50 text-rose-200 hover:bg-rose-500/20">apagar selecionados</button>
                <button onClick={() => setSel(new Set())} className="px-3 py-1 rounded-lg border border-white/20 opacity-70">limpar seleção</button>
                <span className="opacity-50">(os publicados ficam protegidos)</span>
              </div>
            )}
            {conta.id === 'mae' ? (
              /* MÃE · FEED DE CARTÕES (como o laboratório): cartões grandes, pré-ver de
                 todos os momentos, abrir para o estúdio. Sem a grelha apertada. */
              <>
                {geradosVista.length === 0 && <p className="text-center text-[0.74rem] opacity-50 py-8">Nada nesta vista. Carrega «🔍 testar 1 dia» ou «⚔️ gerar semana de autoridade» em cima.</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...geradosVista].sort((a, b) => `${a.agendadoEm ?? ''}${a.hora ?? ''}`.localeCompare(`${b.agendadoEm ?? ''}${b.hora ?? ''}`)).map((e) => {
                    const est = estagioDe(e);
                    const erro = !e.publicado && !!e.igStatus?.startsWith('erro');
                    return (
                      <div key={e.slug} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <button onClick={() => setDetalhe(e)} title={e.texto} className="block w-full" style={{ boxShadow: `inset 0 0 0 1.5px ${e.videoUrl ? '#7E9B8E' : !e.imageUrl ? '#C97373aa' : '#d8b25a55'}` }}>
                          <MomentosPreview beats={e.beats.length ? e.beats : [e.texto]} conta={conta} imageUrl={e.imageUrl} conceito={e.conceito} tipo={e.tipo} />
                        </button>
                        <div className="p-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6rem]">
                          <span className="opacity-80">{TIPO_LABEL[e.tipo ?? ''] ?? e.tipo ?? 'autoridade'}</span>
                          <span className="font-mono opacity-45">{e.agendadoEm ? `${e.agendadoEm.slice(8)}/${e.agendadoEm.slice(5, 7)}` : 'sem data'} {(e.hora ?? '').slice(0, 5)}</span>
                          <span className="px-1 py-0.5 rounded text-[0.5rem]" style={erro ? { background: '#C97373', color: '#fff' } : est === 'publicadas' ? { background: '#7E9B8E', color: '#0F0F1A' } : est === 'agendadas' ? { background: '#C9B6FA', color: '#0F0F1A' } : { background: 'rgba(255,255,255,0.12)' }}>{erro ? '⚠ erro' : est === 'publicadas' ? '✓ publicada' : est === 'agendadas' ? '📅 agendada' : '✎ edição'}</span>
                          <div className="ml-auto flex gap-1">
                            <button onClick={() => setDetalhe(e)} className="px-1.5 py-0.5 rounded border border-white/20 hover:border-ambar">abrir</button>
                            {!e.imageUrl && <button onClick={() => novaImagem(e.slug)} disabled={!!novaImgBusy} title="gerar imagem" className="px-1.5 py-0.5 rounded border border-white/20 disabled:opacity-40">🖼</button>}
                            {!e.publicado && <button onClick={() => descartar(e.slug)} title="descartar" className="px-1.5 py-0.5 rounded border border-rose-400/40 text-rose-300">✕</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
            <div className="overflow-x-auto -mx-1 px-1">
                <div className="grid grid-cols-7 gap-1 min-w-[700px]">
                  {DIAS_CAB.map((h) => <div key={h} className="text-center text-[0.6rem] uppercase tracking-wider opacity-50 pb-1">{h}</div>)}
                  {semanaUnica.map((d) => {
                    const wd = parse(d).getDay();
                    const fds = wd === 0 || wd === 6;
                    const passou = d < hojeISO;
                    const posts = porDia.get(d) ?? [];
                    return (
                      <div key={d} className={`min-h-[80px] rounded-lg border border-white/10 p-1 ${passou ? 'opacity-40' : ''} ${fds ? 'bg-white/[0.015]' : 'bg-white/[0.035]'}`}>
                        <div className="text-[0.55rem] opacity-40 mb-0.5">{d.slice(8)}{passou ? ' · passou' : ''}</div>
                        {posts.map((e) => (
                          <div key={e.slug} className={`relative mb-1 rounded-md ${sel.has(e.slug) ? 'ring-2 ring-rose-400' : ''}`}>
                            {/* hora + período (☀️ manhã / 🌙 tarde): agora aparecem juntos no mesmo dia */}
                            <span className="absolute bottom-1 left-1 z-10 text-[0.5rem] px-1 py-0.5 rounded" style={{ background: ehTardePost(e) ? 'rgba(235,174,74,0.9)' : 'rgba(0,0,0,0.7)', color: ehTardePost(e) ? '#0F0F1A' : '#F2E8DC' }} title={ehTardePost(e) ? 'tarde' : 'manhã'}>{ehTardePost(e) ? '🌙' : '☀️'} {(e.hora ?? '').slice(0, 5) || '—'}</span>
                            {/* badge de ESTÁGIO/erro no canto: agendada (📅) ou erro (⚠), para ver de relance */}
                            {!e.publicado && e.igStatus?.startsWith('erro') ? <span className="absolute bottom-1 right-1 z-10 text-[0.5rem] px-1 py-0.5 rounded bg-rose-600/85 text-white" title={`erro: ${e.igStatus}`}>⚠ erro</span>
                              : !e.publicado && e.aprovado ? <span className="absolute bottom-1 right-1 z-10 text-[0.5rem] px-1 py-0.5 rounded bg-[#C9B6FA]/85 text-[#0F0F1A]" title="agendada (espera a hora)">📅</span> : null}
                            <button onClick={() => setDetalhe(e)} title={e.texto} className="block w-full rounded-md overflow-hidden" style={{ boxShadow: `0 0 0 1.5px ${e.videoUrl ? '#7E9B8E' : !e.imageUrl ? '#C97373aa' : `${'#d8b25a'}66`}` }}>
                              {e.subtipo === 'carta'
                                ? <CartaSlide texto={e.texto} conta={conta} capa prog={1} imageUrl={e.imageUrl ?? undefined} />
                                : <MetodoSlide texto={e.texto} conta={conta} conceito={e.conceito} veuReveal={e.veuReveal ?? undefined} imageUrl={e.imageUrl ?? undefined} prog={1} />}
                            </button>
                            {!e.publicado && <input type="checkbox" checked={sel.has(e.slug)} onClick={(ev) => ev.stopPropagation()} onChange={() => toggleSel(e.slug)} title="selecionar" className="absolute top-1 left-1 z-10 w-4 h-4 cursor-pointer" />}
                            {e.publicado
                              ? <span className="absolute top-1 right-1 text-[0.5rem] bg-emerald-600/85 text-white rounded px-1 py-0.5" title="já publicado (protegido)">✓</span>
                              : <button onClick={(ev) => { ev.stopPropagation(); descartar(e.slug); }} title="apagar este post" className="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-black/75 text-rose-300 hover:bg-rose-500/50 text-[0.72rem] leading-none">✕</button>}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                {postsDaSemana.length === 0 && <p className="mt-2 text-center text-[0.7rem] opacity-50">Nada nesta semana ({fmtDM(segDaSemanaAlvo)} a {fmtDM(domDaSemanaAlvo)}). Carrega &quot;gerar esta semana&quot; em cima, ou navega ◀ ▶.</p>}
              </div>
            )}
            {semDataList.length > 0 && (
              <div className="mt-4">
                <p className="text-[0.7rem] opacity-60 mb-1.5">Sem data ({semDataList.length}): posts antigos sem dia. Descarta-os e gera a semana de novo (já saem com a data certa).</p>
                <div className="flex flex-wrap gap-1">
                  {semDataList.map((e) => (
                    <button key={e.slug} onClick={() => setDetalhe(e)} title={e.texto} className="text-[0.58rem] text-left rounded px-1.5 py-1 max-w-[160px] truncate" style={{ background: `${'#d8b25a'}26` }}>{e.texto}</button>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-2 text-[0.62rem] opacity-40">Clica num post para ver grande e agir (imagem · animar · renderizar · descartar). Barra à esquerda: verde = MP4 pronto, vermelho = sem imagem.</p>
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
            {/* ESTADO À VISTA (dentro da modal): senão a mensagem fica atrás da modal e parece que nada acontece. */}
            {erro && <p className="mb-2 text-[0.78rem] text-rose-300 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2">{erro}</p>}
            {msg && !erro && <p className="mb-2 text-[0.78rem] text-emerald-300 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2">{msg}</p>}
            {detalhe.videoUrl && (
              <div className="mb-2">
                <p className="text-[0.6rem] uppercase tracking-wider text-emerald-300 text-center mb-1">reel final (renderizado)</p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={detalhe.videoUrl} controls autoPlay loop playsInline className="w-full rounded-xl border border-emerald-400/40 max-h-[55vh] mx-auto" />
                <p className="text-center text-[0.55rem] opacity-40 mt-1">é este que vai para o Publicar. Em baixo: as faces e os clips de origem.</p>
              </div>
            )}
            {detalhe.subtipo === 'carta' ? (
              // Carta de renomear (vir): TIPOGRÁFICA, em papel (CartaSlide), não Flux.
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-amber-300">{detalhe.conceito || 'Carta de renomear'}</span>
                  <span className="text-[0.55rem] opacity-50">carta tipográfica (papel)</span>
                </div>
                <CartaSlide texto={detalhe.texto} conta={conta} capa prog={1} imageUrl={detalhe.imageUrl ?? undefined} />
                {detalhe.beats.length > 1 && (
                  <ol className="mt-2 space-y-1.5">
                    {detalhe.beats.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[0.82rem] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-[0.6rem] opacity-40 mt-0.5">{i + 1}</span>
                        <span className="whitespace-pre-line leading-snug" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{b}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="text-center text-[0.6rem] opacity-50 mt-1">no reel: a CAPA é uma imagem (a cena da memória) e o corpo revela-se em papel tipográfico</p>
              </div>
            ) : detalhe.subtipo === 'nbeats' ? (
              // UMA REGRA para tudo: a peça é um REEL (uma cena/figura + texto em
              // sequência). O carrossel mostra os FRAMES do reel (a mesma cena/figura +
              // a linha de cada momento), para se VEREM os beats. Vale também p/ a carta.
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-amber-300">{TIPO_LABEL[detalhe.tipo ?? ''] ?? detalhe.conceito ?? 'a cena'}</span>
                  <span className="text-[0.55rem] opacity-50">reel · {detalhe.beats.length} momentos</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {detalhe.beats.map((b, i) => (
                    <button key={i} onClick={() => setGrande({ texto: b, capa: i === 0 })} title="ver grande" className="shrink-0 w-[150px] snap-start text-left">
                      <span className="block text-center text-[0.55rem] uppercase tracking-wider opacity-45 mb-0.5">slide {i + 1}/{detalhe.beats.length} · 🔍</span>
                      <MetodoSlide texto={b} conceito={i === 0 ? (detalhe.conceito || undefined) : undefined} imageUrl={detalhe.imageUrl ?? undefined} clipUrl={i === 0 ? (detalhe.clip ?? undefined) : undefined} conta={conta} anim="reveal" prog={1} estilo={detalhe.estilo ?? undefined} />
                    </button>
                  ))}
                </div>
                <p className="text-center text-[0.6rem] opacity-50 mt-1">clica num cartão para o ver GRANDE. Cada cartão é um slide do reel; a imagem é a mesma cena em todos.</p>
              </div>
            ) : detalhe.texto2 ? (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1 text-center">face 1 · a dor</p>
                    <MetodoSlide texto={detalhe.texto} conceito={detalhe.conceito} veuReveal={detalhe.veuReveal ?? undefined} imageUrl={detalhe.imageUrl ?? undefined} conta={conta} anim="typewriter" prog={1} estilo={detalhe.estilo ?? undefined} />
                  </div>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-wider opacity-50 mb-1 text-center">face 2 · revelação</p>
                    <MetodoSlide texto={detalhe.texto2} conceito={detalhe.conceito2 ?? undefined} veuReveal={detalhe.veuReveal2 ?? undefined} imageUrl={detalhe.imageUrl2 ?? undefined} conta={conta} anim="reveal" prog={1} estilo={detalhe.estilo ?? undefined} />
                  </div>
                </div>
                <p className="text-center text-[0.6rem] opacity-50 mt-1">no reel: a face 1 escreve-se, depois a face 2</p>
              </div>
            ) : (
              <MetodoSlide texto={detalhe.texto} conceito={detalhe.conceito} veuReveal={detalhe.veuReveal ?? undefined} imageUrl={detalhe.imageUrl ?? undefined} conta={conta} prog={1} estilo={detalhe.estilo ?? undefined} />
            )}
            {(detalhe.clip || detalhe.clip2 || detalhe.clipPend || detalhe.clipPend2) && (
              <div className="mt-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-[0.6rem] uppercase tracking-wider text-emerald-300">clips (movimento real · Kling)</p>
                  {(detalhe.clipPend || detalhe.clipPend2) && <button onClick={colher} className="text-[0.58rem] px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300/90">colher prontos</button>}
                  <button onClick={() => rejeitarClips(detalhe.slug)} className="text-[0.58rem] px-2 py-0.5 rounded-full border border-rose-400/40 text-rose-300/90">rejeitar clips</button>
                </div>
                {(() => { const umClip = detalhe.subtipo === 'nbeats' || detalhe.subtipo === 'visual'; return (
                <div className={`grid ${umClip ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-2'} gap-2`}>
                  {(umClip
                    ? [{ c: detalhe.clip, p: detalhe.clipPend, label: 'a cena' }]
                    : [{ c: detalhe.clip, p: detalhe.clipPend, label: 'face 1' }, { c: detalhe.clip2, p: detalhe.clipPend2, label: 'face 2' }]
                  ).map(({ c, p, label }, i) => (
                    <div key={i}>
                      <p className="text-[0.52rem] uppercase tracking-wider opacity-50 mb-0.5 text-center">{label}</p>
                      {c
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        ? <video src={c} controls autoPlay loop muted playsInline className="w-full rounded-xl border border-emerald-400/30" />
                        : p
                          ? <div className="aspect-[9/16] rounded-xl border border-dashed border-emerald-400/30 grid place-items-center text-center text-[0.55rem] text-emerald-300/80 px-2">🎬 a animar…<br/>(aparece sozinho)</div>
                          : detalhe.clipErro
                            ? <div className="aspect-[9/16] rounded-xl border border-dashed border-rose-400/40 grid place-items-center text-center text-[0.55rem] text-rose-300/90 px-2">⚠️ falhou<br/>{detalhe.clipErro.slice(0, 80)}<br/><span className="opacity-70">carrega &quot;animar&quot; outra vez</span></div>
                            : <div className="aspect-[9/16] rounded-xl border border-dashed border-white/15 grid place-items-center text-[0.55rem] opacity-40">sem clip</div>}
                    </div>
                  ))}
                </div>
                ); })()}
              </div>
            )}
            {/* PIPELINE DE PRODUÇÃO (estúdio): rascunho → imagem → som → render, com
                ESTADO de cada fase e SÓ os botões que servem este formato. */}
            {(() => { const cap = capFormato(detalhe.tipo); const temImg = !!detalhe.imageUrl; return (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <p className="text-[0.55rem] uppercase tracking-[0.16em] opacity-50 mb-2 text-center">produção · {TIPO_LABEL[detalhe.tipo ?? ''] ?? 'peça'}</p>
              <div className="flex items-stretch justify-center gap-1.5 flex-wrap text-[0.7rem]">
                {/* 1 · RASCUNHO (texto gerado pela IA, das tuas fontes) */}
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/5 px-2.5 py-1.5 text-center">
                  <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">1 · rascunho</span>
                  <span className="text-emerald-300">✓ {detalhe.beats.length || 1} slides</span>
                </div>
                {/* 2 · IMAGEM (só formatos visuais; carta de renomear é tipográfica) */}
                {cap.imagem ? (
                  <div className={`rounded-lg border px-2.5 py-1.5 text-center ${temImg ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/15'}`}>
                    <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">2 · imagem</span>
                    <div className="flex items-center gap-1.5 justify-center">
                      <button onClick={() => novaImagem(detalhe.slug)} disabled={novaImgBusy === detalhe.slug} title={temImg ? 'trocar por outra imagem (mantém o texto)' : 'gerar a imagem deste post'} className={temImg ? 'text-amber-300' : 'text-emerald-300'}>{novaImgBusy === detalhe.slug ? '…' : temImg ? 'outra' : 'gerar imagem'}</button>
                      {temImg && <button onClick={() => novaImagem(detalhe.slug, 'dramatico')} disabled={novaImgBusy === detalhe.slug} title="versão dramática (teste)" className="opacity-70">⚡</button>}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 px-2.5 py-1.5 text-center opacity-50">
                    <span className="block text-[0.5rem] uppercase tracking-wider">2 · imagem</span>
                    <span className="text-[0.62rem]">tipográfica</span>
                  </div>
                )}
                {/* MOTION (opção da Vivianne: ela decide por post se anima a imagem com
                    movimento REAL + zoom lento). Só faz sentido com imagem gerada. */}
                {cap.imagem && temImg && (
                  <div className={`rounded-lg border px-2.5 py-1.5 text-center ${detalhe.clip ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/15'}`}>
                    <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">motion</span>
                    <button onClick={() => animar(detalhe.slug)} disabled={animarBusy === detalhe.slug} title="animar a imagem: movimento real do que existe + zoom lento (tu decides se queres)" className={detalhe.clip ? 'text-amber-300' : 'text-emerald-300'}>{animarBusy === detalhe.slug ? '…' : detalhe.clip ? 'outro' : '🎬 animar'}</button>
                  </div>
                )}
                {/* 3 · SOM (só os reels que mexem) */}
                {cap.som && (
                  <div className={`rounded-lg border px-2.5 py-1.5 text-center ${detalhe.som ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/15'}`}>
                    <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">3 · som</span>
                    <button onClick={() => gerarSomTeste(detalhe.slug)} disabled={somBusy === detalhe.slug} title="som ambiente (ElevenLabs)" className={detalhe.som ? 'text-amber-300' : 'text-emerald-300'}>{somBusy === detalhe.slug ? '…' : detalhe.som ? 'outro' : 'gerar som'}</button>
                  </div>
                )}
                {/* 3b · VOZ (narração — a voz da Vivianne lê o texto) */}
                {cap.voz && (
                  <div className={`rounded-lg border px-2.5 py-1.5 text-center ${detalhe.vozUrl ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/15'}`}>
                    <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">voz</span>
                    <button onClick={() => gerarVozTeste(detalhe.slug)} disabled={vozBusy === detalhe.slug} title="narração (a tua voz, ElevenLabs)" className={detalhe.vozUrl ? 'text-amber-300' : 'text-emerald-300'}>{vozBusy === detalhe.slug ? '…' : detalhe.vozUrl ? 'outra' : 'gerar voz'}</button>
                  </div>
                )}
                {/* 4 · RENDER */}
                <div className={`rounded-lg border px-2.5 py-1.5 text-center ${detalhe.videoUrl ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/15'}`}>
                  <span className="block text-[0.5rem] uppercase tracking-wider opacity-50">4 · render</span>
                  {detalhe.videoUrl
                    ? <a href={detalhe.videoUrl} target="_blank" rel="noreferrer" className="text-emerald-300">ver MP4</a>
                    : <button onClick={() => renderOne(detalhe.slug).then(() => setMsg('Render disparado. O vídeo aparece daqui a alguns minutos.')).catch((e) => setErro(String(e)))} className="text-emerald-300">renderizar</button>}
                </div>
              </div>
              {/* ESTILO (independência da Vivianne): controla a tipografia do post.
                  Muda e o render/preview seguem — sem deploys. */}
              {(() => { const est: EstiloMetodo = detalhe.estilo ?? {}; const set = (p: Partial<EstiloMetodo>) => salvarEstilo(detalhe.slug, { ...est, ...p }); return (
                <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[0.66rem]">
                  <div className="flex items-center justify-between mb-1.5"><span className="uppercase tracking-wider opacity-50">estilo do texto</span><button onClick={() => salvarEstilo(detalhe.slug, {})} className="opacity-60 hover:opacity-100">repor padrão</button></div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-1">tamanho<input type="range" min={60} max={150} value={est.tamanho ?? 98} onChange={(e) => set({ tamanho: Number(e.target.value) })} /><span className="opacity-60 w-6">{est.tamanho ?? 98}</span></label>
                    <label className="flex items-center gap-1">cor<input type="color" value={est.cor ?? '#F5EEE3'} onChange={(e) => set({ cor: e.target.value })} /></label>
                    <label className="flex items-center gap-1">realce<input type="color" value={est.corDestaque ?? conta.cor} onChange={(e) => set({ corDestaque: e.target.value })} /></label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={!!est.italico} onChange={(e) => set({ italico: e.target.checked })} />itálico</label>
                    <label className="flex items-center gap-1">fonte<select value={est.fonte ?? 'serif'} onChange={(e) => set({ fonte: e.target.value as EstiloMetodo['fonte'] })} className="bg-transparent border border-white/20 rounded px-1"><option value="serif">serif</option><option value="sans">sans</option><option value="mono">mono</option></select></label>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mt-1.5 pt-1.5 border-t border-white/10">
                    <span className="uppercase tracking-wider opacity-50">motion</span>
                    <label className="flex items-center gap-1">texto<select value={est.animTexto ?? 'reveal'} onChange={(e) => set({ animTexto: e.target.value as EstiloMetodo['animTexto'] })} className="bg-transparent border border-white/20 rounded px-1"><option value="reveal">aparece (bloco)</option><option value="typewriter">palavra a palavra</option></select></label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={est.zoom !== false} onChange={(e) => set({ zoom: e.target.checked })} />zoom na imagem</label>
                  </div>
                </div>
              ); })()}
              <div className="mt-2 flex items-center justify-center gap-2 text-[0.68rem]">
                <button onClick={() => { descartar(detalhe.slug); setDetalhe(null); }} className="px-2.5 py-1 rounded-lg border border-rose-400/40 text-rose-300/90">descartar</button>
                <button onClick={() => setDetalhe(null)} className="px-2.5 py-1 rounded-lg border border-white/20">fechar</button>
              </div>
            </div>
            ); })()}
            {detalhe.som && (
              <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="text-center">
                  <p className="text-[0.58rem] uppercase tracking-wider text-amber-300/90 mb-1">🔊 som ambiente</p>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio src={detalhe.som} controls className="w-full" />
                </div>
              </div>
            )}
            {detalhe.vozUrl && (
              <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
                <div className="text-center">
                  <p className="text-[0.58rem] uppercase tracking-wider text-sky-300/90 mb-1">🎙️ voz (narração)</p>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio src={detalhe.vozUrl} controls className="w-full" />
                </div>
              </div>
            )}
            <p className="text-center text-[0.66rem] opacity-50 mt-2">{TIPO_LABEL[detalhe.tipo ?? ''] ?? detalhe.tipo} · {detalhe.agendadoEm ?? 'sem data'}</p>
            <div className="mt-3">
              <p className="text-[0.66rem] uppercase tracking-wider opacity-50 mb-1">Legenda (edita à mão)</p>
              <textarea value={legendaTxt} onChange={(e) => setLegendaTxt(e.target.value)} rows={7} className="w-full rounded-lg border border-white/15 bg-black/30 p-2 text-[0.78rem] leading-relaxed outline-none focus:border-white/35" />
              <div className="mt-1.5 flex justify-end">
                <button onClick={() => guardarLegenda(detalhe.slug)} disabled={legBusy || legendaTxt === (detalhe.legenda ?? '')} className="px-2.5 py-1 rounded-lg disabled:opacity-40 text-[0.72rem]" style={{ background: '#d8b25a', color: '#0F0F1A' }}>{legBusy ? '…' : 'guardar legenda'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VER GRANDE: um slide do reel em tamanho real (a lupa era pequena demais). */}
      {grande && detalhe && (
        <div onClick={() => setGrande(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[360px] text-center">
            <div className="w-full" style={{ aspectRatio: '9 / 16' }}>
              <MetodoSlide texto={grande.texto} conceito={grande.capa ? (detalhe.conceito || undefined) : undefined} imageUrl={detalhe.imageUrl ?? undefined} conta={conta} anim="reveal" prog={1} estilo={detalhe.estilo ?? undefined} />
            </div>
            <button onClick={() => setGrande(null)} className="mt-3 px-4 py-2 rounded-lg border border-white/25 text-[0.8rem]">fechar</button>
          </div>
        </div>
      )}
    </main>
  );
}
