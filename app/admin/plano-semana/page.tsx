'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CURSOS } from '@/lib/infografico/cursos';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Plano da Semana — conta DIDÁTICA veu.a.veu. Âmbito FIXO: psicologia
// transpessoal, constelação familiar (heranças sistémicas), espiritualidade e
// desenvolvimento. Tu escolhes a MATÉRIA e o TEMA dessa matéria; a IA rascunha
// as 6 frases EM TEXTO; tu lês, editas, e só depois crias os posts.

type Dia = { dia: string; emoji: string; label: string; frase: string; destaque: string[]; legenda: string };
type Estado = { curso: string; tema: string; plano: Dia[]; criados: Record<number, boolean> };

const CHAVE = 'veu-plano-atual';

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

  // carrega o último plano guardado
  useEffect(() => {
    try { const s = localStorage.getItem(CHAVE); if (s) { const e: Estado = JSON.parse(s); setCurso(e.curso ?? 'transpessoal'); setTema(e.tema ?? ''); setPlano(e.plano ?? []); setCriados(e.criados ?? {}); } } catch {}
  }, []);
  const guardar = useCallback((next: Partial<Estado>) => {
    try {
      const base: Estado = { curso, tema, plano, criados };
      localStorage.setItem(CHAVE, JSON.stringify({ ...base, ...next }));
    } catch {}
  }, [curso, tema, plano, criados]);

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
    try {
      const r = await fetch('/api/admin/reels/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manual: true, formato: 'kinetico', curso, frase: d.frase, destaque: d.destaque.join(', '), legenda: d.legenda }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      const c = { ...criados, [i]: true }; setCriados(c); guardar({ criados: c });
      setMsg(`"${d.frase.slice(0, 32)}…" criado. Vai a Reels para pôr a imagem de fundo e descarregar.`);
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
        <p className="text-[0.78rem] opacity-60 mb-5">Escolhes a <b>matéria</b> e o <b>tema</b>; vês as <b>6 frases reais</b>, editas à mão, e só depois crias cada post. Nunca às cegas.</p>

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
            return (
              <div key={i} className={`rounded-xl border border-ocre/12 bg-terra/15 overflow-hidden ${feito ? 'opacity-60' : ''}`}>
                <div className="px-4 py-2 flex items-center gap-2 text-[0.7rem] border-b border-ocre/10">
                  <span className="text-base">{d.emoji}</span>
                  <span className="uppercase tracking-[0.14em] text-[#C9B6FA]">{d.dia}</span>
                  <span className="opacity-50">· {d.label}</span>
                  {feito && <span className="ml-auto text-[0.6rem] px-2 py-0.5 rounded-full bg-salvia/15 text-salvia">✓ post criado</span>}
                </div>

                {/* pré-visualização da frase como vai aparecer */}
                <div className="px-4 pt-4">
                  <div className="rounded-lg bg-gradient-to-br from-[#1a1730] to-[#0F0F1A] border border-white/5 px-5 py-6 text-center">
                    <p className="font-serif text-[1.35rem] leading-snug">{realcar(d.frase, d.destaque)}</p>
                  </div>
                </div>

                {/* campos editáveis */}
                <div className="p-4 space-y-2">
                  <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45">Frase no ecrã</label>
                  <input value={d.frase} onChange={(e) => editar(i, 'frase', e.target.value)} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.9rem] outline-none focus:border-ambar" />
                  <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45 pt-1">Palavras a ouro (vírgulas)</label>
                  <input value={d.destaque.join(', ')} onChange={(e) => editar(i, 'destaque', e.target.value)} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-1.5 text-[0.8rem] outline-none focus:border-ambar" />
                  <label className="block text-[0.58rem] uppercase tracking-[0.15em] opacity-45 pt-1">Legenda do Instagram</label>
                  <textarea value={d.legenda} onChange={(e) => editar(i, 'legenda', e.target.value)} rows={4} className="w-full bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.8rem] leading-relaxed outline-none focus:border-ambar" />
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => criarPost(i)} disabled={busy !== null} className="text-[0.7rem] px-3 py-1.5 rounded-full border border-salvia/45 bg-salvia/10 text-salvia hover:bg-salvia/20 disabled:opacity-40">{busy === i ? 'a criar…' : feito ? '↻ recriar post' : '✓ criar post com este texto'}</button>
                    <span className="text-[0.64rem] opacity-45">cria o post com o TEU texto. A imagem de fundo pões em Reels.</span>
                  </div>
                </div>
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
