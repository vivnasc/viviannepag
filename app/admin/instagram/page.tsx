'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CONTAS, nomeConta, IG_ID_CONHECIDO, type ContaId } from '@/lib/instagram/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

function InstagramInner() {
  const sp = useSearchParams();
  const [conta, setConta] = useState<ContaId>((sp.get('conta') as ContaId) || 'veuaveu');
  const [token, setToken] = useState('');
  const [igId, setIgId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<{ ligado: boolean; username?: string; erro?: string; igUserId?: string; aviso?: string; igCorreto?: string; igCorretoUser?: string } | null>(null);
  const [aVerificar, setAVerificar] = useState(false);
  const [perms, setPerms] = useState<string[] | null>(null);
  const [permsBusy, setPermsBusy] = useState(false);

  const verPerms = useCallback(async (c: ContaId) => {
    setPermsBusy(true); setPerms(null);
    try {
      const r = await fetch(`/api/admin/ig/permissoes?conta=${c}`, { cache: 'no-store' });
      const j = await r.json();
      setPerms(r.ok ? (j.scopes ?? []) : [`erro: ${j.detalhe ?? j.erro ?? r.status}`]);
    } catch (e) { setPerms([`erro: ${String(e)}`]); }
    setPermsBusy(false);
  }, []);

  const verificar = useCallback(async (c: ContaId) => {
    setAVerificar(true); setEstado(null);
    try {
      const r = await fetch(`/api/admin/ig/status?conta=${c}`, { cache: 'no-store' });
      const j = await r.json();
      setEstado(j);
      if (j?.igUserId) setIgId(j.igUserId); // pré-preenche o ID guardado (não muda)
      else if (IG_ID_CONHECIDO[c]) setIgId(IG_ID_CONHECIDO[c]!); // ou o ID já conhecido (ex.: soulab_en)
    } catch (e) { setEstado({ ligado: false, erro: String(e) }); }
    setAVerificar(false);
  }, []);
  useEffect(() => { verificar(conta); }, [conta, verificar]);

  async function guardar() {
    if (busy || token.trim().length < 20) return;
    if (conta !== 'veuaveu' && igId.trim().length < 5) { setErro('indica o IG_USER_ID dessa conta.'); return; }
    setBusy(true); setMsg(null); setErro(null);
    try {
      const r = await fetch('/api/admin/ig/set-token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: token.trim(), conta, igUserId: igId.trim() || undefined }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setMsg(j.msg ?? 'Token guardado.'); setToken(''); await verificar(conta); }
      else setErro(j.detalhe ?? j.erro ?? `erro ${r.status}`);
    } catch (e) { setErro(String(e)); }
    setBusy(false);
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-xl mx-auto">
        <Link href="/admin/publicar" className="text-[0.7rem] opacity-60 hover:opacity-100 no-underline">← Publicar</Link>
        <h1 className="text-2xl font-semibold mt-2 mb-3">Ligação ao Instagram</h1>

        {/* seletor de conta */}
        <div className="flex gap-2 mb-4">
          {CONTAS.map((c) => (
            <button key={c.id} onClick={() => { setConta(c.id); setToken(''); setIgId(''); setMsg(null); setErro(null); }} className={`text-[0.78rem] px-3 py-1.5 rounded-lg border ${conta === c.id ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{c.emoji} {c.nome}</button>
          ))}
        </div>

        {/* estado da conta selecionada */}
        <div className="mb-4 p-3 rounded-lg border" style={estado?.ligado ? { borderColor: '#7E9B8E55', background: '#7E9B8E14' } : { borderColor: '#C9737355', background: '#C9737314' }}>
          {aVerificar ? <span className="text-[0.84rem] opacity-70">a verificar {nomeConta(conta)}…</span>
            : estado?.ligado
              ? <span className="text-[0.9rem] text-salvia">✓ <b>{nomeConta(conta)}</b> ligado a @{estado.username}.</span>
              : <span className="text-[0.9rem] text-rosa">✗ <b>{nomeConta(conta)}</b> não ligado. {estado?.erro ?? 'cola um token em baixo.'}</span>}
          <button onClick={() => verificar(conta)} disabled={aVerificar} className="ml-2 text-[0.66rem] px-2 py-0.5 rounded-full border border-ocre/30 text-creme-2/70 hover:border-ambar disabled:opacity-40">↻ testar</button>
          <button onClick={() => verPerms(conta)} disabled={permsBusy} className="ml-2 text-[0.66rem] px-2 py-0.5 rounded-full border border-ocre/30 text-creme-2/70 hover:border-ambar disabled:opacity-40">{permsBusy ? '…' : 'ver permissões'}</button>
          {perms && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {perms.length === 0 ? <span className="text-[0.7rem] opacity-60">sem permissões (ou token inválido)</span> : perms.map((p) => (
                <span key={p} className="text-[0.62rem] px-2 py-0.5 rounded-full border border-ocre/25 text-creme-2/70">{p}</span>
              ))}
            </div>
          )}
          {/* AVISO de diagnóstico: ID de Página em vez de IG, ou conta não-Business.
              O erro nº100 ao publicar vem daqui. Se houver um ID certo, oferece trocá-lo. */}
          {estado?.aviso && (
            <div className="mt-2 p-2 rounded-lg border" style={{ borderColor: '#D9A55755', background: '#D9A55714' }}>
              <p className="text-[0.74rem] text-ambar">⚠︎ {estado.aviso}</p>
              {estado.igCorreto && (
                <button onClick={() => { setIgId(estado.igCorreto!); setMsg(`ID do Instagram preenchido (${estado.igCorreto}${estado.igCorretoUser ? ` · @${estado.igCorretoUser}` : ''}). Cola um token e guarda.`); }}
                  className="mt-1.5 text-[0.68rem] px-2.5 py-1 rounded-full border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20">usar este ID → {estado.igCorreto}</button>
              )}
            </div>
          )}
        </div>

        <p className="text-[0.8rem] opacity-65 mb-4">Para (re)ligar a <b>{nomeConta(conta)}</b>: cola um token do Instagram dessa conta (mesmo de curta duração, do Graph API Explorer). Eu torno-o <b>permanente (~60 dias)</b> e renova-se sozinho.</p>

        {conta !== 'veuaveu' && (
          <input value={igId} onChange={(e) => setIgId(e.target.value)} placeholder={`IG_USER_ID da conta ${nomeConta(conta)} (ex.: 1784141...)`} className="w-full text-[0.78rem] font-mono p-2.5 mb-2 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2" />
        )}
        <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="cola o token aqui (EAA...)" rows={4} className="w-full text-[0.78rem] font-mono p-3 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2 resize-y" />
        <button onClick={guardar} disabled={busy || token.trim().length < 20} className="mt-3 text-[0.84rem] px-5 py-2.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy ? 'a tornar permanente…' : '🔑 guardar e tornar permanente'}</button>

        {msg && <p className="mt-4 text-[0.82rem] text-salvia">✓ {msg}</p>}
        {erro && <p className="mt-4 text-[0.82rem] text-rosa">✗ {erro}</p>}

        <p className="text-[0.66rem] opacity-45 mt-6">Cada conta tem o seu token, guardado num sítio privado (não no código nem no Vercel). Precisa de <code>META_APP_ID</code> e <code>META_APP_SECRET</code> no Vercel (partilhados pelas contas da mesma app Meta).</p>
      </div>
    </div>
  );
}

export default function InstagramTokenPage() {
  return <Suspense fallback={null}><InstagramInner /></Suspense>;
}
