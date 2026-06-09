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

type Dia = { dia: string; emoji: string; label: string; gen: string; formato: string; frase: string; destaque: string[]; legenda: string; fundoPrompt?: string };
type Estado = { curso: string; tema: string; plano: Dia[]; criados: Record<number, boolean> };

const CHAVE = 'veu-plano-atual';

// Tipo de cada dia por ORDEM (resiliente a rascunhos antigos guardados sem o
// campo "gen"/"formato"): seg frase, ter reel, qua Cá em Casa, qui reel, sex
// frase, sáb infográfico.
const SLOTS_META = [
  { gen: 'kinetico', formato: 'kinetico' },
  { gen: 'reel', formato: 'ninguem' },
  { gen: 'banda', formato: 'banda' },
  { gen: 'reel', formato: 'sinais' },
  { gen: 'kinetico', formato: 'kinetico' },
  { gen: 'infografico', formato: 'infografico' },
];
const genDe = (d: Dia, i: number) => d.gen ?? SLOTS_META[i]?.gen ?? 'kinetico';
const formatoDe = (d: Dia, i: number) => d.formato ?? SLOTS_META[i]?.formato ?? 'kinetico';

// info de cada formato não-cinético (o que gera e onde se revê)
const GEN: Record<string, { badge: string; nota: string; destino: string; verLabel: string; botao: string }> = {
  reel: { badge: 'Reel · vários frames', nota: 'O texto dos frames é montado pelo gerador, a partir deste gancho. Revês e descarregas em Reels.', destino: '/admin/reels', verLabel: 'abrir Reels', botao: 'criar reel' },
  banda: { badge: 'Cá em Casa · com personagens', nota: 'A cena com os personagens é montada pelo gerador, a partir desta ideia. Revês em Cá em Casa.', destino: '/admin/banda', verLabel: 'abrir Cá em Casa', botao: 'criar Cá em Casa' },
  infografico: { badge: 'Infográfico', nota: 'O infográfico é montado pelo gerador, a partir desta ideia. Revês em Infográficos.', destino: '/admin/infografico', verLabel: 'abrir Infográficos', botao: 'criar infográfico' },
};

// dia (YYYY-MM-DD local) do slot i: seg=0..sáb=5 -> próxima ocorrência desse dia
function dataDoSlot(i: number): string {
  const wd = i + 1; // 1=segunda ... 6=sábado
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let add = (wd - hoje.getDay() + 7) % 7; if (add === 0) add = 7;
  const d = new Date(hoje); d.setDate(d.getDate() + add);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
  const [busy, setBusy] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const cursoAtual = CURSOS.find((c) => c.id === curso) ?? CURSOS[0];
  const semEd = semanaEditorialAtual();

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
    if (gen === 'kinetico') payload = { manual: true, formato: 'kinetico', curso, frase: d.frase, destaque: d.destaque.join(', '), legenda: d.legenda, fundoPrompt: d.fundoPrompt ?? '' };
    else if (gen === 'reel') payload = { tema: d.frase, formato, curso };
    else if (gen === 'banda') { url = '/api/admin/banda/gerar'; payload = { tema: d.frase }; }
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
        const data = dataDoSlot(i);
        quando = ` e agendado p/ ${data.split('-').reverse().join('/')}`;
        fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data }) }).catch(() => {});
      }
      const onde = gen === 'kinetico' ? 'Reels (põe o fundo e descarrega)' : (GEN[gen]?.verLabel ?? 'a biblioteca');
      setMsg(`${d.label} criado${quando}. Vê na Agenda, ou em ${onde}.`);
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
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
        <p className="text-[0.78rem] opacity-60 mb-4">Vês as <b>6 frases reais</b>, editas à mão, e só depois crias cada post. Nunca às cegas.</p>

        {/* a semana de hoje, vinda do plano de 3 meses (não escolhes nada) */}
        <div className="rounded-xl border border-ambar/25 bg-ambar/[0.05] p-4 mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.6rem] uppercase tracking-[0.18em] text-ambar">Plano de 3 meses · semana {semEd.semana} de {PLANO_EDITORIAL.length}</span>
            <Link href="/admin/calendario-veu" className="text-[0.66rem] text-ambar/80 hover:text-ambar">ver os 3 meses →</Link>
          </div>
          <p className="font-serif text-xl leading-tight">“{semEd.mote}”</p>
          <p className="text-[0.74rem] opacity-65 mt-0.5">{semEd.tema} · {(CURSOS.find((c) => c.id === semEd.curso) ?? CURSOS[0]).nome}</p>
          {(curso !== semEd.curso || tema !== semEd.tema) && (
            <button onClick={usarSemanaDoPlano} className="mt-2 text-[0.66rem] px-3 py-1 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10">usar o tema desta semana</button>
          )}
        </div>
        <p className="text-[0.72rem] opacity-45 mb-3">Já está preenchido com o tema de hoje. Carrega em rascunhar — ou troca abaixo se quiseres outro.</p>

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

          <button onClick={rascunhar} disabled={rascunhando} className="text-[0.72rem] px-3.5 py-1.5 rounded-full border border-[#C9B6FA] text-[#C9B6FA] bg-[#C9B6FA]/10 hover:bg-[#C9B6FA]/20 disabled:opacity-40">{rascunhando ? 'a escrever as 6 frases…' : plano.length ? '↻ rascunhar de novo' : '✍️ rascunhar a semana'}</button>
        </div>

        {erro && <p className="mb-3 text-[0.75rem] text-red-300">{erro}</p>}
        {msg && <p className="mb-3 text-[0.75rem] text-salvia">{msg}</p>}

        {plano.length === 0 && !rascunhando && (
          <p className="text-[0.8rem] opacity-50 text-center py-10">Escolhe a matéria e o tema, depois carrega <b>✍️ rascunhar a semana</b> para veres as 6 frases.</p>
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
