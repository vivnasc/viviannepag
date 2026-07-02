'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';
import { getPorta, type PortaId } from '@/lib/portas/marca';

// Estudio de UMA porta (livro): gerar peca (texto + imagem), afinar a legenda,
// trocar a imagem, agendar, renderizar e publicar. Motor separado da Soulab; usa
// so a infra partilhada (agendar, render). Ver lib/portas/marca.ts.

type Peca = {
  slug: string; tipo: string | null; formato: string; momentos: string[] | null;
  texto: string; conceito: string; destaque: string[];
  imageUrl: string | null; videoUrl: string | null; legenda: string | null; hashtags: string[];
  fundoPrompt: string | null; agendadoEm: string | null; hora: string | null; publicado: boolean; criadoEm: string | null;
};

export default function EstudioPorta({ porta: portaId }: { porta: PortaId }) {
  const porta = getPorta(portaId)!;
  const dz = porta.paleta.destaque, bg = porta.paleta.bg, bg2 = porta.paleta.bg2, txt = porta.paleta.texto;
  const claro = ['sinais', 'transicao'].includes(portaId); // portas de fundo claro

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [tipo, setTipo] = useState<string>(porta.tipos[0].id);
  const [formato, setFormato] = useState<'frase' | 'momentos'>('frase');
  const [tema, setTema] = useState('');
  const [quantos, setQuantos] = useState(1);
  const [semInicio, setSemInicio] = useState('');
  const [semHora, setSemHora] = useState('13:00');
  const [semDias, setSemDias] = useState(6);
  const [aba, setAba] = useState<'por-agendar' | 'agendadas' | 'publicadas' | 'todas'>('por-agendar');
  const [busy, setBusy] = useState(false);
  const [acaoSlug, setAcaoSlug] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const recarregar = useCallback(() => {
    fetch(`/api/admin/portas/list?porta=${portaId}`).then((r) => (r.ok ? r.json() : { pecas: [] })).then((j) => setPecas(j.pecas ?? [])).catch(() => {});
  }, [portaId]);
  useEffect(() => { recarregar(); }, [recarregar]);

  const gerar = useCallback(async () => {
    if (busy) return;
    setBusy(true); setErro(null);
    setMsg('A gerar (texto + imagem)... pode demorar ate 1 min por peca. Volta e recarrega se fechares.');
    try {
      const r = await fetch('/api/admin/portas/gerar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ porta: portaId, tipo, quantos, formato, tema: tema.trim() || undefined }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else setMsg(`${j.gerados} peca(s) gerada(s).${j.detalhe ? ` (aviso: ${j.detalhe})` : ''} Reve em baixo, troca a imagem se quiseres, e agenda.`);
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(false); }
  }, [busy, portaId, tipo, quantos, formato, tema, recarregar]);

  const rascunharSemana = useCallback(async () => {
    if (busy) return;
    if (!semInicio) { setErro('Escolhe a data de inicio da semana.'); return; }
    setBusy(true); setErro(null);
    setMsg('A rascunhar a semana (um post por dia, ja agendado)... pode demorar alguns minutos. Nao feches.');
    try {
      const r = await fetch('/api/admin/portas/semana', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ porta: portaId, inicio: semInicio, hora: semHora, dias: semDias }) });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); setMsg(null); }
      else { setMsg(`Semana rascunhada: ${j.gerados} post(s) agendados. Reve na aba agendadas, ajusta o que quiseres.`); setAba('agendadas'); }
      recarregar();
    } catch (e) { setErro(String(e)); setMsg(null); }
    finally { setBusy(false); }
  }, [busy, portaId, semInicio, semHora, semDias, recarregar]);

  const salvarLegenda = useCallback(async (slug: string, legenda: string, hashtags: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A guardar a legenda...');
    try {
      const r = await fetch('/api/admin/portas/editar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, legenda, hashtags }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else { setMsg('Legenda guardada.'); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const novaImagem = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A gerar nova imagem (Flux)...');
    try {
      const r = await fetch('/api/admin/portas/imagem', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else { setMsg('Imagem nova gerada.'); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const agendar = useCallback(async (slug: string, data: string, hora: string) => {
    if (acaoSlug) return;
    if (!data) { setErro('Escolhe a data.'); return; }
    setAcaoSlug(slug); setErro(null); setMsg('A agendar...');
    try {
      // 'YYYY-MM-DD' local, NUNCA via toISOString (recua um dia em PT). aprovado = trava do cron.
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data, hora: hora || '13:00', aprovado: true }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else { setMsg('Agendada. Publica-se sozinha a hora marcada.'); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const desagendar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    setAcaoSlug(slug); setErro(null); setMsg('A desagendar...');
    try {
      const r = await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: null, aprovado: false }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); } else { setMsg('Desagendada.'); recarregar(); }
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug, recarregar]);

  const renderizar = useCallback(async (slug: string) => {
    if (acaoSlug) return;
    if (typeof window !== 'undefined' && !window.confirm('Disparar o RENDER (MP4)? Demora alguns minutos e corre nos GitHub Actions.')) return;
    setAcaoSlug(slug); setErro(null); setMsg('A disparar o render (GitHub Actions)...');
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); else setMsg('Render disparado. O MP4 demora alguns minutos. Recarrega daqui a pouco.');
    } catch (e) { setErro(String(e)); } finally { setAcaoSlug(null); }
  }, [acaoSlug]);

  const apagar = useCallback(async (slug: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Descartar esta peca?')) return;
    try {
      const r = await fetch('/api/admin/portas/apagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (r.ok) recarregar(); else { const j = await r.json().catch(() => ({})); setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
    } catch (e) { setErro(String(e)); }
  }, [recarregar]);

  const estadoDe = (p: Peca) => p.publicado ? 'publicadas' : p.agendadoEm ? 'agendadas' : 'por-agendar';
  const cont = {
    'por-agendar': pecas.filter((p) => estadoDe(p) === 'por-agendar').length,
    agendadas: pecas.filter((p) => estadoDe(p) === 'agendadas').length,
    publicadas: pecas.filter((p) => estadoDe(p) === 'publicadas').length,
    todas: pecas.length,
  };
  const lista = pecas.filter((p) => aba === 'todas' || estadoDe(p) === aba);
  const ABAS: { id: typeof aba; label: string }[] = [
    { id: 'por-agendar', label: `por agendar (${cont['por-agendar']})` },
    { id: 'agendadas', label: `agendadas (${cont.agendadas})` },
    { id: 'publicadas', label: `publicadas (${cont.publicadas})` },
    { id: 'todas', label: `todas (${cont.todas})` },
  ];
  const btnOn = { borderColor: dz, background: dz, color: bg2 };
  const btnOff = { borderColor: claro ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', color: txt };
  const cardBg = claro ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
  const linha = claro ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
  const campoTop: CSSProperties = { borderColor: linha, background: claro ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', color: txt };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8" style={{ background: bg2, color: txt, fontFamily: 'Georgia, serif' }}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 rounded-2xl border p-5" style={{ background: bg, borderColor: linha }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {(['medo', 'sinais', 'transicao'] as PortaId[]).map((id) => (
              <Link key={id} href={`/admin/portas/${id}`} className="px-2.5 py-1 rounded-lg border text-[0.72rem]"
                style={id === portaId ? btnOn : btnOff}>{getPorta(id)!.emoji} {getPorta(id)!.nome}</Link>
            ))}
          </div>
          <h1 className="text-2xl flex items-center gap-2" style={{ color: dz }}><span>{porta.emoji}</span> {porta.nome}</h1>
          <p className="mt-1 text-[0.95rem] italic opacity-90">{porta.pergunta}</p>
          <p className="mt-2 text-[0.8rem] opacity-70">{porta.tese}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/admin/publicar?conta=${portaId}`} className="inline-block px-3 py-1.5 rounded-lg border text-[0.74rem]" style={btnOff}>abrir no Publicar &rarr;</Link>
            <Link href="/admin/portas/desempenho" className="inline-block px-3 py-1.5 rounded-lg border text-[0.74rem]" style={btnOff}>desempenho das 3 &rarr;</Link>
          </div>
        </header>

        {/* gerar */}
        <section className="mb-6 rounded-2xl border p-5" style={{ background: cardBg, borderColor: linha }}>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-3">nova peca</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {porta.tipos.map((t) => (
              <button key={t.id} type="button" onClick={() => setTipo(t.id)} title={t.descricao}
                className="px-3 py-1.5 rounded-lg border text-[0.78rem]" style={tipo === t.id ? btnOn : btnOff}>
                <span className="mr-1">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
          <p className="text-[0.72rem] opacity-60 mb-3">{porta.tipos.find((t) => t.id === tipo)?.descricao}</p>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[0.7rem] opacity-55 mr-0.5">formato:</span>
            {([['frase', 'uma frase'], ['momentos', 'varios momentos']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFormato(id)}
                className="text-[0.74rem] px-2.5 py-1 rounded-full border" style={formato === id ? btnOn : btnOff}>{label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="tema livre (opcional)"
              className="flex-1 min-w-[200px] text-[0.82rem] px-3 py-2 rounded-lg border outline-none" style={{ borderColor: linha, background: claro ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', color: txt }} />
            <label className="inline-flex items-center gap-1.5 text-[0.74rem] opacity-80">quantas:
              <select value={quantos} onChange={(e) => setQuantos(Number(e.target.value))} className="rounded-md px-2 py-1.5 border" style={{ borderColor: linha, background: claro ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', color: txt }}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button type="button" onClick={gerar} disabled={busy} className="px-4 py-2 rounded-lg border text-[0.82rem] disabled:opacity-50" style={btnOn}>{busy ? 'a gerar...' : 'gerar'}</button>
          </div>
          {erro && <p className="mt-3 text-[0.78rem]" style={{ color: '#d66' }}>{erro}</p>}
          {msg && <p className="mt-3 text-[0.78rem] opacity-80">{msg}</p>}
        </section>

        {/* plano da semana (autonomo) */}
        <section className="mb-6 rounded-2xl border p-5" style={{ background: cardBg, borderColor: linha }}>
          <h2 className="text-sm uppercase tracking-widest opacity-60 mb-2">plano da semana (autonomo)</h2>
          <p className="text-[0.72rem] opacity-60 mb-3">Um post por dia, cada dia um angulo diferente em rotacao (sem repetir, cobre o motor ao longo das semanas), ja agendado no calendario. Depois so reves e ajustas.</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[0.7rem] opacity-55">inicio:</label>
            <input type="date" value={semInicio} onChange={(e) => setSemInicio(e.target.value)} className="text-[0.72rem] px-2 py-1.5 rounded-lg border outline-none [color-scheme:light]" style={campoTop} />
            <label className="text-[0.7rem] opacity-55">hora:</label>
            <input type="time" value={semHora} onChange={(e) => setSemHora(e.target.value)} className="text-[0.72rem] px-2 py-1.5 rounded-lg border outline-none" style={campoTop} />
            <label className="text-[0.7rem] opacity-55">dias:</label>
            <select value={semDias} onChange={(e) => setSemDias(Number(e.target.value))} className="rounded-md px-2 py-1.5 border" style={campoTop}>
              {[3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button type="button" onClick={rascunharSemana} disabled={busy} className="px-4 py-2 rounded-lg border text-[0.82rem] disabled:opacity-50" style={btnOn}>{busy ? 'a rascunhar...' : 'rascunhar a semana'}</button>
          </div>
        </section>

        {/* abas */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ABAS.map((a) => (
            <button key={a.id} type="button" onClick={() => setAba(a.id)} className="text-[0.74rem] px-3 py-1.5 rounded-lg border" style={aba === a.id ? btnOn : btnOff}>{a.label}</button>
          ))}
        </div>

        {/* lista */}
        <div className="space-y-4">
          {lista.length === 0 && <p className="text-[0.82rem] opacity-55">Ainda nao ha pecas nesta aba. Gera uma em cima.</p>}
          {lista.map((p) => (
            <Cartao key={p.slug} p={p} dz={dz} bg={bg} linha={linha} txt={txt} claro={claro} btnOn={btnOn} btnOff={btnOff}
              ocupado={acaoSlug === p.slug}
              onLegenda={(leg, tags) => salvarLegenda(p.slug, leg, tags)}
              onImagem={() => novaImagem(p.slug)}
              onAgendar={(d, h) => agendar(p.slug, d, h)}
              onDesagendar={() => desagendar(p.slug)}
              onRender={() => renderizar(p.slug)}
              onApagar={() => apagar(p.slug)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Cartao({ p, dz, bg, linha, txt, claro, btnOn, btnOff, ocupado, onLegenda, onImagem, onAgendar, onDesagendar, onRender, onApagar }: {
  p: Peca; dz: string; bg: string; linha: string; txt: string; claro: boolean;
  btnOn: CSSProperties; btnOff: CSSProperties; ocupado: boolean;
  onLegenda: (legenda: string, hashtags: string) => void; onImagem: () => void;
  onAgendar: (data: string, hora: string) => void; onDesagendar: () => void; onRender: () => void; onApagar: () => void;
}) {
  const [leg, setLeg] = useState(p.legenda ?? '');
  const [tags, setTags] = useState((p.hashtags ?? []).join(' '));
  const [data, setData] = useState(p.agendadoEm ?? '');
  const [hora, setHora] = useState(p.hora ?? '13:00');
  const campo = { borderColor: linha, background: claro ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', color: txt } as CSSProperties;
  return (
    <div className="rounded-2xl border p-4" style={{ background: bg, borderColor: linha }}>
      <div className="flex gap-4">
        <div className="shrink-0 w-28 rounded-lg overflow-hidden border" style={{ borderColor: linha, aspectRatio: '9 / 16', background: claro ? '#0002' : '#0006' }}>
          {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-[0.6rem] opacity-40">sem imagem</div>}
        </div>
        <div className="flex-1 min-w-0">
          {p.conceito && <span className="inline-block text-[0.62rem] px-2 py-0.5 rounded-full border mb-1" style={{ borderColor: dz, color: dz }}>{p.conceito}</span>}
          <p className="text-[0.95rem] leading-snug" style={{ fontStyle: 'italic' }}>{p.texto}</p>
          {p.momentos && p.momentos.length > 1 && (
            <ol className="mt-1.5 text-[0.72rem] opacity-70 list-decimal list-inside space-y-0.5">{p.momentos.map((m, i) => <li key={i}>{m}</li>)}</ol>
          )}
          <p className="mt-1 text-[0.6rem] uppercase tracking-widest opacity-40">{p.tipo} · {p.videoUrl ? 'com video' : 'sem render'} · {p.publicado ? 'publicada' : p.agendadoEm ? `agendada ${p.agendadoEm} ${p.hora ?? ''}` : 'por agendar'}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: linha }}>
        <p className="text-[0.55rem] uppercase tracking-widest opacity-50">legenda</p>
        <textarea value={leg} onChange={(e) => setLeg(e.target.value)} rows={5} className="w-full text-[0.7rem] leading-relaxed px-2 py-1.5 rounded-lg border outline-none" style={campo} />
        <p className="text-[0.55rem] uppercase tracking-widest opacity-50">hashtags</p>
        <textarea value={tags} onChange={(e) => setTags(e.target.value)} rows={2} className="w-full text-[0.64rem] px-2 py-1.5 rounded-lg border outline-none" style={campo} />
        <div className="flex flex-wrap gap-1.5">
          <button type="button" disabled={ocupado} onClick={() => onLegenda(leg, tags)} className="text-[0.68rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={btnOn}>guardar legenda</button>
          <button type="button" disabled={ocupado} onClick={onImagem} className="text-[0.68rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={btnOff}>outra imagem</button>
          <button type="button" disabled={ocupado} onClick={onRender} className="text-[0.68rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={btnOff}>renderizar MP4</button>
          <button type="button" disabled={ocupado} onClick={onApagar} className="text-[0.68rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={{ borderColor: '#d66', color: '#d66' }}>descartar</button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t pt-2" style={{ borderColor: linha }}>
        <span className="text-[0.55rem] uppercase tracking-widest opacity-50 mr-1">agendar</span>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="text-[0.66rem] px-2 py-1 rounded-lg border outline-none [color-scheme:light]" style={campo} />
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="text-[0.66rem] px-2 py-1 rounded-lg border outline-none" style={campo} />
        <button type="button" disabled={ocupado || !data} onClick={() => onAgendar(data, hora)} className="text-[0.68rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={btnOn}>agendar</button>
        {p.agendadoEm && <button type="button" disabled={ocupado} onClick={onDesagendar} className="text-[0.66rem] px-2.5 py-1 rounded-lg border disabled:opacity-50" style={btnOff}>desagendar</button>}
      </div>
    </div>
  );
}
