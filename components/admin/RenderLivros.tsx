'use client';

import { useState } from 'react';

// Render (compor capa escolhida + miolo) do pilar e dos manuais, e teste de
// entrega, num só sítio. Sem mexer no GitHub.
export function RenderLivros() {
  const [estado, setEstado] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [teste, setTeste] = useState<{ ok: boolean; emailOk: boolean; downloadUrl: string } | null>(null);

  async function dispara(qual: 'pilar' | 'manuais') {
    setEstado((s) => ({ ...s, [qual]: 'a disparar…' }));
    const url = qual === 'pilar' ? '/api/admin/livro-pilar/render-dispatch' : '/api/admin/manuais/render-dispatch';
    try {
      const res = await fetch(url, { method: 'POST' });
      const json = await res.json();
      setEstado((s) => ({ ...s, [qual]: res.ok ? 'disparado (≈3 min). Recarrega depois.' : `erro: ${json.erro || res.status}` }));
    } catch (e) {
      setEstado((s) => ({ ...s, [qual]: `erro: ${e instanceof Error ? e.message : String(e)}` }));
    }
  }

  async function testar() {
    setTeste(null);
    try {
      const res = await fetch('/api/admin/livro-pilar/teste-compra', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const json = await res.json();
      if (res.ok) setTeste(json);
      else setEstado((s) => ({ ...s, teste: `erro: ${json.erro || res.status}` }));
    } catch (e) { setEstado((s) => ({ ...s, teste: `erro: ${e instanceof Error ? e.message : String(e)}` })); }
  }

  return (
    <section className="border border-ocre/15 rounded-[14px] p-6 mt-8 space-y-5">
      <h3 className="font-serif text-creme text-[1.05rem]">Render e entrega</h3>
      <p className="text-creme-2/60 text-[0.82rem] font-serif italic">
        Depois de escolheres as capas acima, rende para compor a tipografia por cima e publicar os PDFs (com bónus, nos manuais). Depois, faz "seed catálogo" em produtos.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => dispara('pilar')} className="rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-5 py-2 text-[0.82rem] hover:bg-ambar/20 transition-colors">renderizar pilar</button>
        <button onClick={() => dispara('manuais')} className="rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-5 py-2 text-[0.82rem] hover:bg-ambar/20 transition-colors">renderizar manuais (com bónus)</button>
      </div>
      {estado.pilar && <p className="text-salvia text-[0.8rem]">pilar: {estado.pilar}</p>}
      {estado.manuais && <p className="text-salvia text-[0.8rem]">manuais: {estado.manuais}</p>}

      <div className="pt-3 border-t border-ocre/10">
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-2">Testar entrega do pilar (sem PayPal):</p>
        <div className="flex flex-wrap items-center gap-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o teu email" className="bg-transparent border border-ocre/25 rounded-[10px] px-4 py-2 text-[0.85rem] text-creme min-w-[220px]" />
          <button onClick={testar} className="rounded-full border border-salvia/50 text-salvia px-5 py-2 text-[0.82rem] hover:bg-salvia/10 transition-colors">testar entrega + email</button>
        </div>
        {teste && <p className="text-creme-2/80 text-[0.82rem] mt-3">{teste.emailOk ? '✓ email enviado. ' : '⚠ email não enviou; '}<a href={teste.downloadUrl} className="text-ambar underline">descarregar (teste)</a></p>}
        {estado.teste && <p className="text-rosa/90 text-[0.8rem] mt-2">{estado.teste}</p>}
      </div>
    </section>
  );
}
