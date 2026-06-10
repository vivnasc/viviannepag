'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

export default function InstagramTokenPage() {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<{ ligado: boolean; username?: string; erro?: string } | null>(null);
  const [aVerificar, setAVerificar] = useState(false);

  const verificar = useCallback(async () => {
    setAVerificar(true);
    try {
      const r = await fetch('/api/admin/ig/status', { cache: 'no-store' });
      setEstado(await r.json());
    } catch (e) { setEstado({ ligado: false, erro: String(e) }); }
    setAVerificar(false);
  }, []);
  useEffect(() => { verificar(); }, [verificar]);

  async function guardar() {
    if (busy || token.trim().length < 20) return;
    setBusy(true); setMsg(null); setErro(null);
    try {
      const r = await fetch('/api/admin/ig/set-token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: token.trim() }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setMsg(j.msg ?? 'Token guardado.'); setToken(''); await verificar(); }
      else setErro(j.detalhe ?? j.erro ?? `erro ${r.status}`);
    } catch (e) { setErro(String(e)); }
    setBusy(false);
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-xl mx-auto">
        <Link href="/admin/agenda" className="text-[0.7rem] opacity-60 hover:opacity-100 no-underline">← Agenda</Link>
        <h1 className="text-2xl font-semibold mt-2 mb-1">Ligação ao Instagram</h1>

        {/* ESTADO da ligação — diz preto no branco se está bom */}
        <div className="my-4 p-3 rounded-lg border" style={estado?.ligado ? { borderColor: '#7E9B8E55', background: '#7E9B8E14' } : { borderColor: '#C9737355', background: '#C9737314' }}>
          {aVerificar && !estado ? <span className="text-[0.84rem] opacity-70">a verificar a ligação…</span>
            : estado?.ligado
              ? <span className="text-[0.9rem] text-salvia">✓ <b>Ligado</b> a @{estado.username} — podes publicar.</span>
              : <span className="text-[0.9rem] text-rosa">✗ <b>Não ligado.</b> {estado?.erro ?? 'cola um token novo em baixo.'}</span>}
          <button onClick={verificar} disabled={aVerificar} className="ml-2 text-[0.66rem] px-2 py-0.5 rounded-full border border-ocre/30 text-creme-2/70 hover:border-ambar disabled:opacity-40">{aVerificar ? '…' : '↻ testar'}</button>
        </div>

        <p className="text-[0.8rem] opacity-65 mb-4">Para (re)ligar: cola um token do Instagram (mesmo de curta duração, do Graph API Explorer). Eu torno-o <b>permanente (~60 dias)</b> e renova-se sozinho todas as semanas — não voltas a mexer nisto.</p>

        <ol className="text-[0.74rem] opacity-70 leading-relaxed mb-4 list-decimal pl-5 space-y-1">
          <li>Vai a <b>developers.facebook.com</b> → Tools → <b>Graph API Explorer</b>.</li>
          <li>Escolhe a tua app <b>VivianneDosSantos</b> e gera um token (com as permissões do Instagram).</li>
          <li>Copia o token e cola aqui em baixo. Carrega em guardar.</li>
        </ol>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="cola o token aqui (EAA...)"
          rows={4}
          className="w-full text-[0.78rem] font-mono p-3 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2 resize-y"
        />
        <button onClick={guardar} disabled={busy || token.trim().length < 20} className="mt-3 text-[0.84rem] px-5 py-2.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy ? 'a tornar permanente…' : '🔑 guardar e tornar permanente'}</button>

        {msg && <p className="mt-4 text-[0.82rem] text-salvia">✓ {msg}</p>}
        {erro && <p className="mt-4 text-[0.82rem] text-rosa">✗ {erro}</p>}

        <p className="text-[0.66rem] opacity-45 mt-6">O token é guardado num sítio privado (não no código nem no Vercel). Precisa de <code>META_APP_ID</code> e <code>META_APP_SECRET</code> definidos no Vercel.</p>
      </div>
    </div>
  );
}
