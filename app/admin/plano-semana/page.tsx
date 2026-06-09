'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CURSOS } from '@/lib/infografico/cursos';
import { semanaEditorialAtual, PLANO_EDITORIAL } from '@/lib/veu/planoEditorial';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Plano da Semana — conta DIDÁTICA veu.a.veu. Âmbito FIXO: psicologia
// transpessoal, constelação familiar (heranças sistémicas), espiritualidade e
// desenvolvimento. Tu escolhes a MATÉRIA e o TEMA dessa matéria; a IA rascunha
// as 6 frases EM TEXTO; tu lês, editas, e só depois crias os posts.

type Dia = { dia: string; wd?: number; emoji: string; label: string; gen: string; formato: string; frase: string; destaque: string[]; legenda: string; fundoPrompt?: string };
type Estado = { curso: string; tema: string; plano: Dia[]; criados: Record<number, boolean> };

const CHAVE = 'veu-plano-atual';

// Tipo de cada dia por ORDEM (resiliente a rascunhos antigos guardados sem o
// campo "gen"/"formato"): seg frase, ter reel, qua Cá em Casa, qui reel, sex
// frase, sáb infográfico.
const SLOTS_META = [
  { wd: 1, gen: 'kinetico', formato: 'kinetico' },
  { wd: 2, gen: 'reel', formato: 'sinais' },
  { wd: 3, gen: 'reel', formato: 'ninguem' },
  { wd: 3, gen: 'reel', formato: 'pensador' }, // 2.º post de quarta (dia de maior audiência)
  { wd: 4, gen: 'banda', formato: 'banda' },
  { wd: 5, gen: 'heroi', formato: 'heroi' },
  { wd: 6, gen: 'infografico', formato: 'infografico' },
  { wd: 7, gen: 'kinetico', formato: 'domingo' },
];
const wdDe = (d: Dia, i: number) => d.wd ?? SLOTS_META[i]?.wd ?? (i + 1);
const genDe = (d: Dia, i: number) => d.gen ?? SLOTS_META[i]?.gen ?? 'kinetico';
const formatoDe = (d: Dia, i: number) => d.formato ?? SLOTS_META[i]?.formato ?? 'kinetico';

// info de cada formato não-cinético (o que gera e onde se revê)
const GEN: Record<string, { badge: string; nota: string; destino: string; verLabel: string; botao: string }> = {
  reel: { badge: 'Vários frames (carrossel/reel)', nota: 'O texto dos frames é montado pelo gerador, a partir deste gancho. Revês e descarregas em Reels.', destino: '/admin/reels', verLabel: 'abrir Reels', botao: 'criar' },
  banda: { badge: 'Cá em Casa · com personagens', nota: 'A cena com os personagens é montada pelo gerador, a partir desta ideia. Revês em Cá em Casa.', destino: '/admin/banda', verLabel: 'abrir Cá em Casa', botao: 'criar Cá em Casa' },
  heroi: { badge: 'I am a Hero · curar liberta', nota: 'O carrossel (capa ilustrada + ensino) é montado pelo gerador, a partir desta ideia. Revês em I am a Hero.', destino: '/admin/heroi', verLabel: 'abrir I am a Hero', botao: 'criar I am a Hero' },
  infografico: { badge: 'Infográfico', nota: 'O infográfico é montado pelo gerador, a partir desta ideia. Revês em Infográficos.', destino: '/admin/infografico', verLabel: 'abrir Infográficos', botao: 'criar infográfico' },
};

// dia (YYYY-MM-DD local)
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// 2.ª-feira da semana a "off" semanas de hoje (0 = esta, +1 = próxima…)
function segundaComOffset(off: number): Date {
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const dw = h.getDay(); // 0=domingo..6=sábado
  const s = new Date(h); s.setDate(h.getDate() + (dw === 0 ? -6 : 1 - dw) + off * 7);
  return s;
}
// data real do dia "wd" (1=2ª…7=dom) na semana mostrada
const dataDoDiaNaSemana = (seg: Date, wd: number) => { const d = new Date(seg); d.setDate(seg.getDate() + (wd - 1)); return isoLocal(d); };

function realcar(frase: string, destaque: string[]) {
  if (!destaque.length) return <>{frase}</>;
  const re = new RegExp(`(${destaque.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return frase.split(re).map((p, i) => re.test(p) ? <span key={i} style={{ color: '#EBAE4A' }}>{p}</span> : <span key={i}>{p}</span>);
}

export default function PlanoSemanaPage() {
  const [curso, setCurso] = useState('transpessoal');
  const [tema, setTema] = useState('');
  const [plano, setPlano] = useState<Dia[]>([]);
  const [criados, setCriados] = useState<Record<number, boolean>>({});
  const [rascunhando, setRascunhando] = useState(false);
  const [criandoTudo, setCriandoTudo] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [semOffset, setSemOffset] = useState(0); // 0 = esta semana, +1 = próxima…
  const cursoAtual = CURSOS.find((c) => c.id === curso) ?? CURSOS[0];
  const targetSeg = segundaComOffset(semOffset);
  const semEd = semanaEditorialAtual(targetSeg); // tema do plano trimestral DESSA semana

  const aplicar = useCallback((e: Estado) => {
    setCurso(e.curso ?? 'transpessoal'); setTema(e.tema ?? ''); setPlano(e.plano ?? []); setCriados(e.criados ?? {});
  }, []);

  // grava no servidor (cross-device) com debounce, para não disparar a cada tecla
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const salvarServidor = useCallback((estado: Estado) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/admin/plano-semana/estado', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(estado) }).catch(() => {});
    }, 700);
  }, []);

  // carrega o último plano guardado. Fonte de verdade: SERVIDOR (aparece em
  // qualquer dispositivo). Cai para o cache local e, por fim, abre JÁ no tema
  // desta semana do plano editorial de 3 meses (a Vivianne não escolhe nada).
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch('/api/admin/plano-semana/estado');
        if (r.ok) {
          const { estado } = await r.json();
          if (!cancel && estado && (estado.tema || (estado.plano?.length))) { aplicar(estado); return; }
        }
      } catch {}
      if (cancel) return;
      try {
        const s = localStorage.getItem(CHAVE);
        if (s) { const e: Estado = JSON.parse(s); aplicar(e); salvarServidor(e); return; } // migra o rascunho local antigo p/ o servidor
      } catch {}
      if (cancel) return;
      setCurso(semEd.curso); setTema(semEd.tema);
    })();
    return () => { cancel = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function usarSemanaDoPlano() {
    setCurso(semEd.curso); setTema(semEd.tema); setPlano([]); setCriados({});
    guardar({ curso: semEd.curso, tema: semEd.tema, plano: [], criados: {} });
  }
  // navega pelas semanas do plano trimestral (carrega o tema sozinho, não escolhes nada)
  function irSemana(delta: number) {
    const no = semOffset + delta; if (no < 0) return; // não planear o passado
    const se = semanaEditorialAtual(segundaComOffset(no));
    setSemOffset(no); setCurso(se.curso); setTema(se.tema); setPlano([]); setCriados({});
    guardar({ curso: se.curso, tema: se.tema, plano: [], criados: {} });
  }
  const guardar = useCallback((next: Partial<Estado>) => {
    const merged: Estado = { curso, tema, plano, criados, ...next };
    try { localStorage.setItem(CHAVE, JSON.stringify(merged)); } catch {}
    salvarServidor(merged);
  }, [curso, tema, plano, criados, salvarServidor]);

  async function rascunhar() {
    const t = tema.trim();
    if (!t) { setErro('Escolhe ou escreve um tema da matéria.'); return; }
    if (rascunhando) return;
    setRascunhando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/agenda/rascunho-semana', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tema: t, subtitulo: cursoAtual.descricao, curso }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setPlano(j.plano ?? []); setCriados({}); guardar({ plano: j.plano ?? [], criados: {} });
      setMsg('Rascunho pronto. Lê, ajusta o que quiseres, e depois cria cada post.');
    } catch (e) { setErro(String(e)); }
    finally { setRascunhando(false); }
  }

  function editar(i: number, campo: 'frase' | 'legenda' | 'destaque', valor: string) {
    setPlano((prev) => {
      const p = prev.map((d, idx) => idx !== i ? d : { ...d, [campo]: campo === 'destaque' ? valor.split(',').map((s) => s.trim()).filter(Boolean) : valor });
      guardar({ plano: p }); return p;
    });
  }

  async function criarPost(i: number) {
    const d = plano[i];
    if (!d?.frase.trim() || busy !== null) return;
    setBusy(i); setErro(null); setMsg(null);
    // rota para o gerador certo conforme o formato real do dia (resiliente)
    const gen = genDe(d, i); const formato = formatoDe(d, i);
    let url = '/api/admin/reels/gerar';
    let payload: Record<string, unknown> = {};
    if (gen === 'kinetico') payload = { manual: true, formato, curso, frase: d.frase, destaque: d.destaque.join(', '), legenda: d.legenda, fundoPrompt: d.fundoPrompt ?? '' };
    else if (gen === 'reel') payload = { tema: d.frase, formato, curso };
    else if (gen === 'banda') { url = '/api/admin/banda/gerar'; payload = { tema: d.frase }; }
    else if (gen === 'heroi') { url = '/api/admin/heroi/gerar'; payload = { tema: d.frase }; }
    else if (gen === 'infografico') { url = '/api/admin/infografico/gerar'; payload = { tema: d.frase, curso }; }
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      const c = { ...criados, [i]: true }; setCriados(c); guardar({ criados: c });
      // AGENDA-SE SOZINHO no dia do slot (seg..sáb), para apareceres na Agenda
      // sem teres de escolher à mão o que o Plano já criou.
      const slug = j.coleccao?.slug as string | undefined;
      let quando = '';
      if (slug) {
        const data = dataDoDiaNaSemana(targetSeg, wdDe(d, i));
        quando = ` e agendado p/ ${data.split('-').reverse().join('/')}`;
        fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data }) }).catch(() => {});
      }
      const onde = gen === 'kinetico' ? 'Reels (põe o fundo e descarrega)' : (GEN[gen]?.verLabel ?? 'a biblioteca');
      setMsg(`${d.label} criado${quando}. Vê na Agenda, ou em ${onde}.`);
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }

  // CRIAR A SEMANA TODA de uma vez (usa o texto JÁ rascunhado/editado), agenda cada
  // um no seu dia e dispara os MP4s. Sem ser 1 a 1.
  async function criarSemanaToda() {
    if (criandoTudo || !plano.length) return;
    setCriandoTudo(true); setErro(null); setMsg(null);
    const videoSlugs: string[] = [];
    const novo = { ...criados };
    let ok = 0;
    for (let i = 0; i < plano.length; i++) {
      const d = plano[i];
      if (!d?.frase?.trim()) continue;
      setMsg(`a criar ${i + 1}/${plano.length}…`);
      const gen = genDe(d, i); const formato = formatoDe(d, i);
      let url = '/api/admin/reels/gerar'; let payload: Record<string, unknown> = {};
      if (gen === 'kinetico') payload = { manual: true, formato, curso, frase: d.frase, destaque: d.destaque.join(', '), legenda: d.legenda, fundoPrompt: d.fundoPrompt ?? '' };
      else if (gen === 'reel') payload = { tema: d.frase, formato, curso };
      else if (gen === 'banda') { url = '/api/admin/banda/gerar'; payload = { tema: d.frase }; }
      else if (gen === 'heroi') { url = '/api/admin/heroi/gerar'; payload = { tema: d.frase }; }
      else if (gen === 'infografico') { url = '/api/admin/infografico/gerar'; payload = { tema: d.frase, curso }; }
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await r.json();
        const slug = j?.coleccao?.slug as string | undefined;
        if (r.ok && slug) {
          await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: dataDoDiaNaSemana(targetSeg, wdDe(d, i)) }) }).catch(() => {});
          if (gen !== 'reel') videoSlugs.push(slug); // reel = carrossel (sem MP4)
          novo[i] = true; ok++;
        }
      } catch { /* segue para o próximo */ }
    }
    setCriados(novo); guardar({ criados: novo });
    let mp4 = 0;
    for (const slug of videoSlugs) { setMsg(`a disparar MP4 ${mp4 + 1}/${videoSlugs.length}…`); try { const rr = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }); if (rr.ok) mp4++; } catch { /* segue */ } }
    setMsg(`Semana criada: ${ok} posts agendados, ${mp4} MP4s a renderizar (~10 min). Agora é só ir à Agenda baixar o ZIP.`);
    setCriandoTudo(false);
  }

  const nCriados = Object.values(criados).filter(Boolean).length;

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Plano da Semana · Véu a Véu</h1>
          <Link href="/admin/agenda" className="text-[0.7rem] opacity-60 hover:opacity-100">Agenda →</Link>
        </div>
        <p className="text-[0.82rem] opacity-70 mb-1">Conta <b>didática</b>. Âmbito: psicologia transpessoal, constelação familiar (heranças sistémicas), espiritualidade e desenvolvimento.</p>
        <p className="text-[0.78rem] opacity-60 mb-4">Vês <b>as frases reais da semana</b> (8 posts, Seg→Dom, com 2 à quarta), editas à mão, e só depois crias cada post. Nunca às cegas.</p>

        {/* semana do plano trimestral — navega com ◀▶, o tema vem sozinho (não escolhes nada) */}
        <div className="rounded-xl border border-ambar/25 bg-ambar/[0.05] p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => irSemana(-1)} disabled={semOffset === 0} className="text-[0.85rem] px-2.5 py-0.5 rounded-full border border-ambar/30 text-ambar hover:bg-ambar/10 disabled:opacity-25">◀</button>
            <span className="flex-1 text-center text-[0.6rem] uppercase tracking-[0.16em] text-ambar">{semOffset === 0 ? 'Esta semana' : semOffset === 1 ? 'Próxima semana' : `+${semOffset} semanas`} · semana {semEd.semana} de {PLANO_EDITORIAL.length}</span>
            <button onClick={() => irSemana(1)} className="text-[0.85rem] px-2.5 py-0.5 rounded-full border border-ambar/30 text-ambar hover:bg-ambar/10">▶</button>
          </div>
          <p className="font-serif text-xl leading-tight text-center">“{semEd.mote}”</p>
          <p className="text-[0.74rem] opacity-65 mt-0.5 text-center">{semEd.tema} · {(CURSOS.find((c) => c.id === semEd.curso) ?? CURSOS[0]).nome}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {(curso !== semEd.curso || tema !== semEd.tema) && (
              <button onClick={usarSemanaDoPlano} className="text-[0.66rem] px-3 py-1 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10">usar o tema desta semana</button>
            )}
            <Link href="/admin/calendario-veu" className="text-[0.66rem] text-ambar/80 hover:text-ambar">ver os 3 meses →</Link>
          </div>
        </div>
        <p className="text-[0.72rem] opacity-45 mb-3">O tema vem do plano trimestral. Usa ◀▶ para a semana que queres (esta, a próxima…) e carrega em <b>rascunhar a semana</b>. Não escolhes nada.</p>

        {/* matéria + tema (âmbito didático) */}
        <div className="rounded-xl border border-[#C9B6FA]/30 bg-[#C9B6FA]/[0.05] p-4 mb-5">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Matéria</p>
          <div className="flex flex-wrap gap-2 mb-1">
            {CURSOS.map((c) => (
              <button key={c.id} onClick={() => { setCurso(c.id); guardar({ curso: c.id }); }} className={`text-[0.72rem] px-3 py-1.5 rounded-full border ${curso === c.id ? 'border-[#C9B6FA] text-[#C9B6FA] bg-[#C9B6FA]/10' : 'border-ocre/25 text-creme-2/70 hover:border-[#C9B6FA]'}`}>{c.nome}</button>
            ))}
          </div>
          <p className="text-[0.7rem] italic opacity-55 mb-3">{cursoAtual.descricao}</p>

          <p className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 mb-2">Tema da semana</p>
          <input value={tema} onChange={(e) => { setTema(e.target.value); guardar({ tema: e.target.value }); }} placeholder="Escreve, ou escolhe um conceito em baixo…" className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.88rem] outline-none focus:border-ambar mb-2" />
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 mb-3">
            {cursoAtual.conceitos.map((c) => (
              <button key={c} onClick={() => { setTema(c); guardar({ tema: c }); }} className={`text-[0.64rem] px-2 py-0.5 rounded-full border ${tema === c ? 'border-ambar text-ambar bg-ambar/10' : 'border-ocre/20 text-creme-2/65 hover:border-ambar hover:text-ambar'}`}>{c}</button>
            ))}
          </div>

          <button onClick={rascunhar} disabled={rascunhando} className="text-[0.72rem] px-3.5 py-1.5 rounded-full border border-[#C9B6FA] text-[#C9B6FA] bg-[#C9B6FA]/10 hover:bg-[#C9B6FA]/20 disabled:opacity-40">{rascunhando ? 'a escrever a semana…' : plano.length ? '↻ rascunhar de novo' : '✍️ rascunhar a semana'}</button>
        </div>

        {erro && <p className="mb-3 text-[0.75rem] text-red-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.75rem] text-salvia">{msg}</p>}

        {plano.length === 0 && !rascunhando && (
          <p className="text-[0.8rem] opacity-50 text-center py-10">Escolhe a matéria e o tema, depois carrega <b>✍️ rascunhar a semana</b> para veres as frases.</p>
        )}

        {/* criar TODA a semana de uma vez (não 1 a 1), depois de leres/editares */}
        {plano.length > 0 && (
          <button onClick={criarSemanaToda} disabled={criandoTudo || busy !== null} className="w-full mb-4 text-[0.82rem] py-2.5 rounded-lg border border-salvia/50 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-50">{criandoTudo ? `⏳ ${msg ?? 'a criar…'}` : `✓ criar a semana toda (${plano.length} posts), agendar e renderizar`}</button>
        )}

        <div className="space-y-4">
          {plano.map((d, i) => {
            const feito = !!criados[i];
            const gen = genDe(d, i);
            const ehKin = gen === 'kinetico';
            const info = GEN[gen];
            return (
              <div key={i} className={`rounded-xl border border-ocre/12 bg-terra/15 overflow-hidden ${feito ? 'opacity-60' : ''}`}>
                <div className="px-4 py-2 flex items-center gap-2 text-[0.7rem] border-b border-ocre/10">
                  <span className="text-base">{d.emoji}</span>
                  <span className="uppercase tracking-[0.14em] text-[#C9B6FA]">{d.dia}</span>
                  <span className="opacity-50">· {d.label}</span>
                  <span className="ml-auto text-[0.56rem] px-2 py-0.5 rounded-full border border-ocre/25 opacity-70">{ehKin ? 'Post · frase controlada' : info?.badge}</span>
                  {feito && <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-salvia/15 text-salvia">✓ criado</span>}
                </div>

                {ehKin ? (
                  // ── FRASE COM MOTION: tu controlas o texto a 100% ──
                  <>
                    <div className="px-4 pt-4">
                      <div className="rounded-lg bg-gradient-to-br from-[#1a1730] to-[#0F0F1A] border border-white/5 px-5 py-6 text-center">
                        <p className="font-serif text-[1.35rem] leading-snug">{realcar(d.frase, d.destaque)}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45">Frase no ecrã</label>
                      <input value={d.frase} onChange={(e) => editar(i, 'frase', e.target.value)} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.9rem] outline-none focus:border-ambar" />
                      <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45 pt-1">Palavras a ouro (vírgulas)</label>
                      <input value={d.destaque.join(', ')} onChange={(e) => editar(i, 'destaque', e.target.value)} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-1.5 text-[0.8rem] outline-none focus:border-ambar" />
                      <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45 pt-1">Legenda do Instagram</label>
                      <textarea value={d.legenda} onChange={(e) => editar(i, 'legenda', e.target.value)} rows={4} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.8rem] leading-relaxed outline-none focus:border-ambar" />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button onClick={() => criarPost(i)} disabled={busy !== null} className="text-[0.7rem] px-3 py-1.5 rounded-full border border-salvia/45 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-40">{busy === i ? 'a criar…' : feito ? '↻ recriar post' : '✓ criar post com este texto'}</button>
                        <span className="text-[0.64rem] opacity-45">cria o post com o TEU texto. Fundo pões em Reels.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // ── REEL / CÁ EM CASA / INFOGRÁFICO: gerador monta o formato ──
                  <div className="p-4 space-y-2">
                    <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45">A ideia / gancho deste dia</label>
                    <input value={d.frase} onChange={(e) => editar(i, 'frase', e.target.value)} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.9rem] outline-none focus:border-ambar" />
                    <p className="text-[0.66rem] opacity-55 leading-relaxed">{info?.nota}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button onClick={() => criarPost(i)} disabled={busy !== null} className="text-[0.7rem] px-3 py-1.5 rounded-full border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy === i ? 'a gerar…' : feito ? `↻ recriar` : `✓ ${info?.botao ?? 'criar'}`}</button>
                      {feito && info && <Link href={info.destino} className="text-[0.66rem] px-3 py-1.5 rounded-full border border-ocre/30 text-creme-2/75 hover:border-ambar hover:text-ambar no-underline">{info.verLabel} →</Link>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {plano.length > 0 && (
          <p className="text-[0.7rem] opacity-45 mt-6 text-center">{nCriados} de {plano.length} posts criados · o rascunho fica guardado</p>
        )}
      </div>
    </div>
  );
}
