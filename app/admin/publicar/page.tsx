'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

// ③ PUBLICAR — ambiente SÓ de publicar (separado de planear e criar). Aqui vê-se
// cada post (capa + legenda), controla-se a qualidade e publica-se ou agenda-se.
// NÃO se gera nada aqui (isso é no ② Criar). gerar ≠ publicar.

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string; capaRev?: number };
type Item = { slug: string; title: string; dias: Dia[]; theme: Theme; created_at?: string };

const CAPA_REV = 2;
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico'];
const CARROSSEL = ['sinais', 'ninguem', 'pensador'];

const FMT: Record<string, { emoji: string; label: string }> = {
  kinetico: { emoji: '✨', label: 'Frase com motion' },
  domingo: { emoji: '🕊️', label: 'Domingo de Luz' },
  sinais: { emoji: '🔎', label: 'Sinais de que…' },
  ninguem: { emoji: '🏮', label: 'O que ninguém te explica' },
  pensador: { emoji: '🕯️', label: 'Uma ideia de…' },
  banda: { emoji: '🎭', label: 'Cá em Casa' },
  heroi: { emoji: '🌅', label: 'I am a Hero' },
  infografico: { emoji: '📊', label: 'Infográfico' },
  aneis: { emoji: '🎞️', label: 'Carrossel' },
  reel: { emoji: '🎬', label: 'Reel' },
};
const tipoChave = (it: Item) => (it.theme?.formato === 'reel' ? (it.theme?.subtipo ?? 'reel') : (it.theme?.formato ?? ''));
const fmtDe = (it: Item) => FMT[tipoChave(it)] ?? { emoji: '•', label: tipoChave(it) || 'post' };
const legendaDe = (it: Item) => {
  const d = it.dias?.[0];
  return [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n');
};
function mediaPronta(it: Item): boolean {
  const c = tipoChave(it); const d = it.dias?.[0];
  if (VIDEO.includes(c)) return !!d?.videoUrl;
  if (CARROSSEL.includes(c)) return (d?.imagens?.length ?? 0) >= 2 && it.theme?.capaRev === CAPA_REV;
  if (c === 'infografico') return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1;
  return false;
}
const ddmm = (iso?: string | null) => iso ? iso.split('-').reverse().slice(0, 2).join('/') : '';

export default function PublicarPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [capas, setCapas] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [aberta, setAberta] = useState<Set<string>>(new Set()); // legendas abertas
  const [verPublicados, setVerPublicados] = useState(false);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list', { cache: 'no-store' });
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapas(j.capas ?? {})).catch(() => {}); }, []);

  const capaDe = (it: Item): string | null => {
    const d = it.dias?.[0];
    return d?.imagens?.[0] ?? (d?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? capas[tipoChave(it)] ?? null;
  };

  async function agendar(slug: string, agendadoEm: string | null) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, agendadoEm } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm }) }).catch(() => {});
  }

  async function publicar(it: Item) {
    if (busy) return;
    if (!confirm(`Publicar JÁ no Instagram (a sério, no teu perfil):\n\n“${it.title}”\n\nSe ainda não estiver pronto, eu preparo e publico sozinho (~10 min) — deixa esta página aberta. Continuar?`)) return;
    setBusy(it.slug); setMsg(null);
    const ini = Date.now();
    const tentar = async (): Promise<void> => {
      const r = await fetch('/api/admin/ig/publicar-agora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json().catch(() => ({}));
      if (j.preparando) {
        const mins = Math.floor((Date.now() - ini) / 60000);
        setMsg(`⏳ “${it.title}”: a preparar as imagens… (${mins} min) — deixa a página aberta, publica-se sozinho quando estiver pronto.`);
        if (Date.now() - ini < 15 * 60 * 1000) { setTimeout(() => { tentar().catch(() => {}); }, 30000); return; }
        const m = `⏳ “${it.title}”: ainda a preparar passados 15 min — tenta de novo daqui a pouco.`; setMsg(m); alert(m); setBusy(null); return;
      }
      if (r.ok) { const m = `✓ Publicado no Instagram: “${it.title}”.`; setMsg(m); alert(m); await carregar(); }
      else { const m = `✗ Não publicou “${it.title}”:\n\n${j.detalhe ?? j.erro ?? r.status}`; setMsg(m); alert(m); }
      setBusy(null);
    };
    try { await tentar(); } catch (e) { const m = 'Erro: ' + String(e); setMsg(m); alert(m); setBusy(null); }
  }

  const porPublicar = itens.filter((it) => !it.theme?.igPublicado);
  const publicados = itens.filter((it) => it.theme?.igPublicado);
  // agendados primeiro (por data), depois os sem data
  porPublicar.sort((a, b) => (a.theme?.agendadoEm ?? '9999').localeCompare(b.theme?.agendadoEm ?? '9999'));

  const Chip = ({ href, n, label, active }: { href: string; n: string; label: string; active?: boolean }) => (
    <Link href={href} className={`text-[0.74rem] px-3 py-1.5 rounded-full border no-underline ${active ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{n} {label}</Link>
  );

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Chip href="/admin/calendario-veu" n="①" label="Planear" />
          <Chip href="/admin/conteudos" n="②" label="Criar" />
          <Chip href="/admin/publicar" n="③" label="Publicar" active />
          <Link href="/admin/instagram" className="ml-auto text-[0.7rem] opacity-60 hover:opacity-100 no-underline">🔑 Instagram</Link>
        </div>

        <h1 className="text-2xl font-semibold">Publicar · Véu a Véu</h1>
        <p className="text-[0.82rem] opacity-65 mb-5">Vê cada post, lê a legenda, e <b>só então</b> publica ou agenda. Aqui não se gera nada — isso é no <Link href="/admin/conteudos" className="text-ambar">② Criar</Link>.</p>

        {msg && <div className="mb-4 text-[0.78rem] text-ambar whitespace-pre-wrap p-3 rounded-lg border border-ambar/25 bg-ambar/5">{msg}</div>}

        {porPublicar.length === 0 && <p className="text-[0.84rem] opacity-55 py-8 text-center">Nada por publicar. Vai ao ② Criar gerar conteúdo.</p>}

        <div className="space-y-3">
          {porPublicar.map((it) => {
            const m = fmtDe(it); const capa = capaDe(it); const pronto = mediaPronta(it);
            const aberto = aberta.has(it.slug); const leg = legendaDe(it);
            const erro = !it.theme?.igPublicado && it.theme?.igStatus?.startsWith('erro');
            return (
              <div key={it.slug} className="rounded-xl border border-ocre/15 bg-terra/15 p-3">
                <div className="flex gap-3">
                  <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-black/30 grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">{m.emoji}</span>}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.98rem] leading-tight truncate" title={it.title}>{it.title}</p>
                    <p className="text-[0.62rem] opacity-55 mt-0.5">{m.emoji} {m.label}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[0.56rem] px-1.5 py-0.5 rounded-full" style={pronto ? { background: '#7E9B8E22', color: '#7E9B8E' } : { background: '#EBAE4A22', color: '#EBAE4A' }}>{pronto ? '● media pronta' : '○ preparo ao publicar'}</span>
                      {it.theme?.agendadoEm && <span className="text-[0.56rem] px-1.5 py-0.5 rounded-full bg-[#C9B6FA]/15 text-[#C9B6FA]">📅 {ddmm(it.theme.agendadoEm)}</span>}
                      {erro && <button onClick={() => alert(it.theme?.igStatus)} className="text-[0.56rem] px-1.5 py-0.5 rounded-full bg-rosa/15 text-rosa/90 underline">⚠ ver erro</button>}
                    </div>
                  </div>
                </div>

                {leg && (
                  <button onClick={() => setAberta((s) => { const n = new Set(s); n.has(it.slug) ? n.delete(it.slug) : n.add(it.slug); return n; })} className="mt-2 text-[0.64rem] text-creme-2/60 hover:text-ambar">{aberto ? '▾ esconder legenda' : '▸ ver legenda'}</button>
                )}
                {aberto && <div className="mt-1.5 text-[0.74rem] leading-relaxed opacity-85 whitespace-pre-wrap border-l-2 border-ocre/20 pl-3">{leg}</div>}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button onClick={() => publicar(it)} disabled={busy === it.slug} className="text-[0.74rem] px-3.5 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy === it.slug ? '…a publicar' : '⚡ publicar agora'}</button>
                  <label className="text-[0.66rem] opacity-65 flex items-center gap-1.5">📅 agendar:
                    <input type="date" value={it.theme?.agendadoEm ?? ''} onChange={(e) => agendar(it.slug, e.target.value || null)} className="text-[0.66rem] px-2 py-1 rounded-md border border-ocre/25 bg-[#15131f] text-creme-2" />
                  </label>
                  {it.theme?.agendadoEm && <button onClick={() => agendar(it.slug, null)} className="text-[0.6rem] px-2 py-0.5 rounded-full border border-rosa/25 text-rosa/70 hover:bg-rosa/10">tirar data</button>}
                </div>
              </div>
            );
          })}
        </div>

        {/* publicados */}
        {publicados.length > 0 && (
          <div className="mt-8">
            <button onClick={() => setVerPublicados((v) => !v)} className="text-[0.74rem] text-salvia/80 hover:text-salvia">✓ Já publicados ({publicados.length}) {verPublicados ? '▾' : '▸'}</button>
            {verPublicados && (
              <div className="mt-2 space-y-1.5">
                {publicados.map((it) => (
                  <div key={it.slug} className="flex items-center gap-2 text-[0.76rem] opacity-65 p-2 rounded-lg bg-black/15">
                    <span className="text-salvia">✓</span>
                    <span className="truncate">{it.title}</span>
                    <span className="ml-auto text-[0.58rem] opacity-50">{fmtDe(it).label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
