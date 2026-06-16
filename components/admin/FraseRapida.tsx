'use client';

// Painel "Frase rápida" (emergências / inspiração da hora). Vive por baixo da
// produção semanal. Autónomo: escolhe a conta, escreve a frase, escolhe um FUNDO
// JÁ GUARDADO (reaproveita imagens, sem gerar nova), agenda (data + hora) e:
//   criar reel -> renderizar (motion) -> publicar agora OU deixar agendado.
// Não depende de geração de imagem nem da produção semanal.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CONTAS_LISTA, type Conta } from '@/lib/metodo/contas';

type Fundo = { url: string; conta: string | null; slug: string; criadoEm: string | null };

function hojeLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function FraseRapida() {
  const [conta, setConta] = useState<Conta>(CONTAS_LISTA[0]);
  const [texto, setTexto] = useState('');
  const [destaque, setDestaque] = useState('');
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [todasContas, setTodasContas] = useState(false);
  const [fundoSel, setFundoSel] = useState<string>('');
  const [urlManual, setUrlManual] = useState('');
  const [data, setData] = useState(hojeLocal());
  const [hora, setHora] = useState(conta.id === 'mae' ? '17:00' : '11:00');

  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // hora-padrão da conta quando se troca de conta (a Vivianne pode editar)
  useEffect(() => { setHora(conta.id === 'mae' ? '17:00' : '11:00'); }, [conta.id]);

  // galeria de fundos já guardados (da conta, ou de todas)
  const carregarFundos = useCallback(async () => {
    try {
      const q = todasContas ? '' : `?conta=${conta.id}`;
      const r = await fetch(`/api/admin/metodo/fundos${q}`);
      const j = await r.json();
      if (r.ok) setFundos(j.fundos ?? []);
    } catch { /* sem galeria */ }
  }, [conta.id, todasContas]);
  useEffect(() => { carregarFundos(); }, [carregarFundos]);

  const fundoEscolhido = (urlManual.trim() || fundoSel).trim();

  const criar = useCallback(async () => {
    if (busy) return;
    if (!texto.trim()) { setErro('Escreve a frase primeiro.'); return; }
    setBusy('criar'); setErro(null); setMsg(null); setSlug(null);
    try {
      const destArr = destaque.split(',').map((s) => s.trim()).filter(Boolean);
      const r = await fetch('/api/admin/metodo/frase-rapida', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ conta: conta.id, texto, destaque: destArr.length ? destArr : undefined, imageUrl: fundoEscolhido || undefined, data, hora }),
      });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : '')); }
      else { setSlug(j.slug); setMsg(`Reel criado e agendado para ${j.data} às ${j.hora}. Agora: renderizar o motion.`); }
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, texto, destaque, conta.id, fundoEscolhido, data, hora]);

  const renderizar = useCallback(async () => {
    if (busy || !slug) return;
    setBusy('render'); setErro(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, dias: '1' }) });
      const j = await r.json();
      if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg('Render disparado (GitHub Actions). O motion aparece daqui a alguns minutos. Vê-o na página da conta.');
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, slug]);

  const publicarAgora = useCallback(async () => {
    if (busy || !slug) return;
    setBusy('publicar'); setErro(null);
    try {
      const r = await fetch('/api/admin/ig/publicar-agora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) });
      const j = await r.json();
      if (r.status === 202) setMsg(j.detalhe ?? 'A preparar o vídeo no servidor. Tenta "publicar agora" outra vez daqui a uns minutos.');
      else if (!r.ok) setErro((j.erro ?? 'erro') + (j.detalhe ? `: ${j.detalhe}` : ''));
      else setMsg('Publicado no Instagram. ✓');
    } catch (e) { setErro(String(e)); }
    finally { setBusy(null); }
  }, [busy, slug]);

  return (
    <section className="mt-8 rounded-2xl border border-white/15 p-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-lg" style={{ fontFamily: 'var(--font-cormorant), serif', color: conta.cor }}>⚡ Frase rápida</h2>
        <span className="text-[0.66rem] opacity-50">emergências · inspiração da hora · sem gerar imagem nova</span>
      </div>
      <p className="mt-1 text-[0.74rem] opacity-65 max-w-2xl">
        Um reel de frase com motion, a partir de um fundo que já tens guardado. Escolhe a conta, escreve, escolhe o fundo e agenda. Depois renderiza e publica agora ou na data.
      </p>

      {/* conta */}
      <div className="mt-3 flex gap-2 flex-wrap text-[0.74rem]">
        {CONTAS_LISTA.map((c) => (
          <button key={c.id} onClick={() => setConta(c)} className={`px-2.5 py-1 rounded-lg border ${conta.id === c.id ? '' : 'opacity-60'}`} style={{ borderColor: conta.id === c.id ? c.cor : 'rgba(255,255,255,0.15)', color: conta.id === c.id ? c.cor : undefined }}>@{c.handle}</button>
        ))}
      </div>

      {/* texto + destaque */}
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} placeholder="A frase do reel (a tua voz: direta, sem metáforas)…" className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-[0.85rem] resize-none" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }} />
        <input value={destaque} onChange={(e) => setDestaque(e.target.value)} placeholder="palavra(s) a destacar (vírgulas) — vazio = automático" className="w-full rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-[0.78rem] h-fit" />
      </div>

      {/* fundos guardados */}
      <div className="mt-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-[0.72rem]">
          <span className="opacity-70">Fundo (já guardado):</span>
          <label className="flex items-center gap-1.5 opacity-70 cursor-pointer">
            <input type="checkbox" checked={todasContas} onChange={(e) => setTodasContas(e.target.checked)} /> ver fundos de todas as contas
          </label>
        </div>
        {fundos.length ? (
          <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
            {fundos.map((f) => (
              <button key={f.url} onClick={() => { setFundoSel(f.url); setUrlManual(''); }} className="relative aspect-[9/16] rounded-md overflow-hidden" style={{ outline: fundoSel === f.url && !urlManual ? `2px solid ${conta.cor}` : '1px solid rgba(255,255,255,0.1)' }} title={f.conta ?? ''}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        ) : <p className="mt-2 text-[0.7rem] opacity-45">Sem fundos guardados ainda nesta conta. Marca &quot;todas as contas&quot; ou cola um URL abaixo.</p>}
        <input value={urlManual} onChange={(e) => { setUrlManual(e.target.value); setFundoSel(''); }} placeholder="ou cola o URL de uma imagem…" className="mt-2 w-full rounded-lg bg-black/30 border border-white/15 px-3 py-1.5 text-[0.72rem]" />
      </div>

      {/* agendar */}
      <div className="mt-3 flex items-center gap-3 flex-wrap text-[0.76rem]">
        <label className="flex items-center gap-1.5"><span className="opacity-60">data</span>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="rounded-lg bg-black/30 border border-white/15 px-2 py-1" />
        </label>
        <label className="flex items-center gap-1.5"><span className="opacity-60">hora</span>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="rounded-lg bg-black/30 border border-white/15 px-2 py-1" />
        </label>
      </div>

      {/* ações */}
      <div className="mt-4 flex items-center gap-2 flex-wrap text-[0.76rem]">
        <button onClick={criar} disabled={!!busy} className="px-3 py-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: conta.cor, color: '#0F0F1A', background: conta.cor }}>{busy === 'criar' ? 'a criar…' : '1 · criar reel'}</button>
        <button onClick={renderizar} disabled={!!busy || !slug} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-30">{busy === 'render' ? 'a disparar…' : '2 · renderizar motion'}</button>
        <button onClick={publicarAgora} disabled={!!busy || !slug} className="px-3 py-1.5 rounded-lg border border-white/25 disabled:opacity-30">{busy === 'publicar' ? 'a publicar…' : '3 · publicar agora'}</button>
        {slug && <Link href={`/admin/metodo/${conta.id}`} className="px-3 py-1.5 rounded-lg border border-white/15 opacity-80">ver na conta →</Link>}
        <span className="opacity-45 text-[0.66rem]">(ou deixa só agendado: o cron publica na data)</span>
      </div>

      {erro && <p className="mt-3 text-[0.78rem] text-rose-300">{erro}</p>}
      {msg && <p className="mt-3 text-[0.78rem] text-emerald-300">{msg}</p>}
    </section>
  );
}
