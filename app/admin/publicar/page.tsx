'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { semanaEditorialAtual } from '@/lib/veu/planoEditorial';
import { CONTAS, contaDe, type ContaId } from '@/lib/instagram/contas';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

// ③ PUBLICAR — o planeador da Véu a Véu. NÃO se gera nada aqui (isso é no ②
// Criar). Vês cada post (capa + legenda), aprovas, e publica-se sozinho à hora.
// gerar ≠ publicar: NADA vai para o ar sem estar APROVADO.

type Slide = { imageUrl?: string | null };
type Dia = { slides?: Slide[]; legenda?: string; hashtags?: string[]; videoUrl?: string; imagens?: string[] };
type Theme = { formato?: string; subtipo?: string; marca?: string; universo?: string; agendadoEm?: string | null; publicado?: boolean; igPublicado?: boolean; igStatus?: string; capaRev?: number; aprovado?: boolean; hora?: string | null };
type Item = { slug: string; title: string; dias: Dia[]; theme: Theme; created_at?: string };

const CAPA_REV = 2;
const VIDEO = ['kinetico', 'domingo', 'banda', 'heroi', 'infografico'];
const CARROSSEL = ['sinais', 'ninguem', 'pensador'];
// melhor hora por formato (best-times editoriais; trocar pelas reais do IG com +100 seguidores)
const HORA_FMT: Record<string, string> = { kinetico: '13:00', domingo: '11:00', sinais: '13:00', ninguem: '13:00', pensador: '20:00', banda: '13:00', heroi: '13:00', infografico: '11:00', aneis: '13:00', reel: '13:00' };

const FMT: Record<string, { emoji: string; label: string }> = {
  kinetico: { emoji: '✨', label: 'Frase com motion' }, domingo: { emoji: '🕊️', label: 'Domingo de Luz' },
  sinais: { emoji: '🔎', label: 'Sinais de que…' }, ninguem: { emoji: '🏮', label: 'O que ninguém te explica' },
  pensador: { emoji: '🕯️', label: 'Uma ideia de…' }, banda: { emoji: '🎭', label: 'Cá em Casa' },
  heroi: { emoji: '🌅', label: 'I am a Hero' }, infografico: { emoji: '📊', label: 'Infográfico' },
  aneis: { emoji: '🎞️', label: 'Carrossel' }, reel: { emoji: '🎬', label: 'Reel' },
};
const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const tipoChave = (it: Item) => (it.theme?.formato === 'reel' ? (it.theme?.subtipo ?? 'reel') : (it.theme?.formato ?? ''));
const fmtDe = (it: Item): { emoji: string; label: string } => {
  if (contaDe(it.theme, it.slug) === 'loja') return { emoji: '🛍️', label: it.theme?.universo ? `7 Véus · ${it.theme.universo}` : 'Reel · 7 Véus' };
  return FMT[tipoChave(it)] ?? { emoji: '•', label: tipoChave(it) || 'post' };
};
const legendaDe = (it: Item) => { const d = it.dias?.[0]; return [d?.legenda?.trim(), (d?.hashtags ?? []).join(' ')].filter(Boolean).join('\n\n'); };
const horaDe = (it: Item) => it.theme?.hora || HORA_FMT[tipoChave(it)] || '13:00';
function mediaPronta(it: Item): boolean {
  const c = tipoChave(it); const d = it.dias?.[0];
  if (VIDEO.includes(c)) return !!d?.videoUrl;
  if (CARROSSEL.includes(c)) return (d?.imagens?.length ?? 0) >= 2 && it.theme?.capaRev === CAPA_REV;
  if (c === 'infografico') return !!d?.videoUrl || (d?.imagens?.length ?? 0) >= 1;
  return false;
}
type Estado = 'rascunho' | 'agendado' | 'publicado' | 'erro';
function estadoDe(it: Item): Estado {
  const t = it.theme ?? {};
  if (t.igPublicado || t.publicado) return 'publicado';
  if (t.igStatus?.startsWith('erro')) return 'erro';
  if (t.aprovado) return 'agendado';
  return 'rascunho';
}
const COR: Record<Estado, { bg: string; fg: string; nome: string }> = {
  rascunho: { bg: '#EBAE4A22', fg: '#EBAE4A', nome: 'rascunho' },
  agendado: { bg: '#C9B6FA22', fg: '#C9B6FA', nome: 'agendado' },
  publicado: { bg: '#7E9B8E22', fg: '#7E9B8E', nome: 'publicado' },
  erro: { bg: '#C9737322', fg: '#C97373', nome: 'erro' },
};

export default function PublicarPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [capas, setCapas] = useState<Record<string, string>>({});
  const [vista, setVista] = useState<'semana' | 'mes' | 'feed'>('semana');
  const [offset, setOffset] = useState(0); // semanas (semana) ou meses (mes)
  const [fEstado, setFEstado] = useState<'todos' | Estado>('todos');
  const [fFormato, setFFormato] = useState<string>('todos');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [legenda, setLegenda] = useState<Item | null>(null); // painel de rever
  const [igOk, setIgOk] = useState<boolean | null>(null);
  const [conta, setConta] = useState<ContaId>('veuaveu'); // conta selecionada

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/conteudos/list', { cache: 'no-store' });
    if (r.ok) setItens((await r.json()).contos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { fetch('/api/admin/reels/capa-serie').then((r) => r.ok ? r.json() : { capas: {} }).then((j) => setCapas(j.capas ?? {})).catch(() => {}); }, []);
  useEffect(() => { setIgOk(null); fetch(`/api/admin/ig/status?conta=${conta}`, { cache: 'no-store' }).then((r) => r.json()).then((j) => setIgOk(!!j.ligado)).catch(() => setIgOk(false)); }, [conta]);

  // só o conteúdo DESTA conta (veu.a.veu vs loja) — nunca misturar
  const itensConta = itens.filter((it) => contaDe(it.theme, it.slug) === conta);

  const capaDe = (it: Item): string | null => {
    const d = it.dias?.[0];
    return d?.imagens?.[0] ?? (d?.slides ?? []).find((s) => s.imageUrl)?.imageUrl ?? capas[tipoChave(it)] ?? null;
  };

  // grava no theme (optimista) e persiste
  async function setTheme(slug: string, patch: Partial<Theme>) {
    setItens((prev) => prev.map((it) => it.slug === slug ? { ...it, theme: { ...it.theme, ...patch } } : it));
    await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, ...patch }) }).catch(() => {});
  }

  async function publicar(it: Item) {
    if (busy) return;
    if (!confirm(`Publicar JÁ no Instagram (a sério):\n\n“${it.title}”\n\nSe não estiver pronto, preparo e publico sozinho (~10 min) — deixa a página aberta. Continuar?`)) return;
    setBusy(it.slug); setMsg(null);
    const ini = Date.now();
    const tentar = async (): Promise<void> => {
      const r = await fetch('/api/admin/ig/publicar-agora', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: it.slug }) });
      const j = await r.json().catch(() => ({}));
      if (j.preparando) {
        const mins = Math.floor((Date.now() - ini) / 60000);
        setMsg(`⏳ “${it.title}”: a preparar… (${mins} min) — deixa a página aberta, publica-se sozinho quando estiver pronto.`);
        if (Date.now() - ini < 15 * 60 * 1000) { setTimeout(() => { tentar().catch(() => {}); }, 30000); return; }
        setMsg(`⏳ “${it.title}”: ainda a preparar passados 15 min — tenta daqui a pouco.`); setBusy(null); return;
      }
      if (r.ok) { setMsg(`✓ Publicado: “${it.title}”.`); await carregar(); }
      else { const m = `✗ Não publicou “${it.title}”: ${j.detalhe ?? j.erro ?? r.status}`; setMsg(m); alert(m); }
      setBusy(null);
    };
    try { await tentar(); } catch (e) { setMsg('Erro: ' + String(e)); setBusy(null); }
  }

  // semana mostrada (seg→dom)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dow = hoje.getDay();
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate() + (dow === 0 ? -6 : 1 - dow) + (vista === 'semana' ? offset : 0) * 7);
  const diasSemana = Array.from({ length: 7 }).map((_, i) => { const d = new Date(segunda); d.setDate(segunda.getDate() + i); return d; });
  const semEd = semanaEditorialAtual(segunda);
  const hojeIso = isoLocal(hoje);

  const passaFiltro = (it: Item) => (fEstado === 'todos' || estadoDe(it) === fEstado) && (fFormato === 'todos' || tipoChave(it) === fFormato);
  const naoPublicados = itensConta.filter((it) => estadoDe(it) !== 'publicado');

  async function aprovarSemana() {
    const isos = new Set(diasSemana.map(isoLocal));
    const alvo = itensConta.filter((it) => it.theme?.agendadoEm && isos.has(it.theme.agendadoEm) && estadoDe(it) === 'rascunho');
    if (!alvo.length) { setMsg('Nada por aprovar nesta semana.'); return; }
    if (!confirm(`Aprovar ${alvo.length} post(s) desta semana? Ficam a publicar-se sozinhos nas suas horas.`)) return;
    for (const it of alvo) await setTheme(it.slug, { aprovado: true });
    setMsg(`✓ ${alvo.length} post(s) aprovados. Publicam-se sozinhos às horas marcadas.`);
  }

  // ── componentes ──
  const Cartao = ({ it, compacto }: { it: Item; compacto?: boolean }) => {
    const m = fmtDe(it); const capa = capaDe(it); const e = estadoDe(it); const pronto = mediaPronta(it);
    return (
      <div className="rounded-xl border border-ocre/15 bg-terra/15 overflow-hidden">
        <div className="flex gap-3 p-2.5">
          <button onClick={() => setLegenda(it)} className="w-14 h-[4.5rem] shrink-0 rounded-lg overflow-hidden bg-black/30 grid place-items-center" title="ver capa e legenda">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{m.emoji}</span>}</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[0.52rem] px-1.5 py-0.5 rounded-full" style={{ background: COR[e].bg, color: COR[e].fg }}>{COR[e].nome}</span>
              <span className="text-[0.58rem] font-mono opacity-55">{horaDe(it)}</span>
              {!pronto && e !== 'publicado' && <span className="text-[0.5rem] opacity-45">○ prepara ao publicar</span>}
            </div>
            <p className="text-[0.88rem] leading-tight mt-1 line-clamp-2" title={it.title}>{it.title}</p>
            <p className="text-[0.56rem] opacity-50 mt-0.5">{m.emoji} {m.label}</p>
            {!compacto && e !== 'publicado' && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {e === 'rascunho' && <button onClick={() => setTheme(it.slug, { aprovado: true })} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-[#C9B6FA]/45 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓ aprovar</button>}
                {e === 'agendado' && <button onClick={() => setTheme(it.slug, { aprovado: false })} className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/60 hover:border-ambar">↩ desaprovar</button>}
                <button onClick={() => publicar(it)} disabled={busy === it.slug} className="text-[0.64rem] px-2.5 py-1 rounded-full border border-ambar/45 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">{busy === it.slug ? '…' : '⚡ publicar já'}</button>
                <button onClick={() => setLegenda(it)} className="text-[0.6rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/55 hover:border-ambar">👁 rever</button>
              </div>
            )}
            {e === 'publicado' && <p className="text-[0.6rem] text-salvia mt-2">✓ já no Instagram</p>}
          </div>
        </div>
      </div>
    );
  };

  const NavItem = ({ href, n, label, active }: { href: string; n: string; label: string; active?: boolean }) => (
    <Link href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[0.82rem] no-underline ${active ? 'bg-ambar/15 text-ambar border border-ambar/40' : 'text-creme-2/75 hover:bg-white/5'}`}><span className="opacity-70">{n}</span>{label}</Link>
  );

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] ${cormorant.variable} ${inter.variable}`}>
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-44 shrink-0 border-r border-ocre/12 p-3 flex flex-col gap-1.5 sticky top-0 h-screen">
          <p className="text-[1.05rem] font-semibold px-2 pb-1 leading-tight">Publicar</p>
          {/* seletor de CONTA — nunca misturar veu.a.veu com a loja */}
          <div className="px-1 pb-2">
            {CONTAS.map((c) => (
              <button key={c.id} onClick={() => setConta(c.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[0.74rem] mb-0.5 ${conta === c.id ? 'bg-ambar/15 text-ambar border border-ambar/40' : 'text-creme-2/65 hover:bg-white/5 border border-transparent'}`}>
                <span>{c.emoji}</span><span className="truncate">{c.nome}</span>
              </button>
            ))}
          </div>
          <NavItem href="/admin/calendario-veu" n="①" label="Planear" />
          <NavItem href="/admin/conteudos" n="②" label="Criar" />
          <NavItem href="/admin/publicar" n="③" label="Publicar" active />
          <div className="mt-auto pt-3 border-t border-ocre/12">
            <Link href={`/admin/instagram?conta=${conta}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.72rem] no-underline text-creme-2/70 hover:bg-white/5">
              <span>🔑 Instagram</span>
              <span className="ml-auto w-2 h-2 rounded-full" style={{ background: igOk == null ? '#888' : igOk ? '#7E9B8E' : '#C97373' }} title={igOk ? 'ligado' : 'não ligado'} />
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Publicar</h1>
            <span className="text-[0.74rem] opacity-55">vês, aprovas, e publica-se sozinho às horas — nada vai ao ar sem o teu ✓</span>
          </div>

          {/* barra: vistas + filtros + nav */}
          <div className="flex items-center gap-2 flex-wrap mt-4 mb-4">
            <div className="flex rounded-lg border border-ocre/20 overflow-hidden">
              {(['semana', 'mes', 'feed'] as const).map((v) => (
                <button key={v} onClick={() => { setVista(v); setOffset(0); }} className={`text-[0.74rem] px-3 py-1.5 ${vista === v ? 'bg-ambar/15 text-ambar' : 'text-creme-2/65 hover:bg-white/5'}`}>{v === 'semana' ? 'Semana' : v === 'mes' ? 'Mês' : 'Feed'}</button>
              ))}
            </div>
            {vista !== 'feed' && (
              <div className="flex items-center gap-1">
                <button onClick={() => setOffset((o) => o - 1)} className="text-[0.8rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">◀</button>
                <button onClick={() => setOffset(0)} className="text-[0.62rem] px-2 py-1 rounded-full border border-ambar/30 text-ambar/80 hover:bg-ambar/10">hoje</button>
                <button onClick={() => setOffset((o) => o + 1)} className="text-[0.8rem] px-2 py-1 rounded-full border border-ocre/25 text-creme-2/70 hover:border-ambar">▶</button>
              </div>
            )}
            <select value={fEstado} onChange={(e) => setFEstado(e.target.value as 'todos' | Estado)} className="text-[0.7rem] px-2 py-1.5 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2">
              <option value="todos">todos os estados</option><option value="rascunho">rascunho</option><option value="agendado">agendado</option><option value="publicado">publicado</option><option value="erro">erro</option>
            </select>
            <select value={fFormato} onChange={(e) => setFFormato(e.target.value)} className="text-[0.7rem] px-2 py-1.5 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2">
              <option value="todos">todos os formatos</option>{Object.entries(FMT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {vista === 'semana' && <button onClick={aprovarSemana} className="ml-auto text-[0.74rem] px-3 py-1.5 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓✓ aprovar a semana</button>}
          </div>

          {msg && <div className="mb-4 text-[0.78rem] text-ambar whitespace-pre-wrap p-3 rounded-lg border border-ambar/25 bg-ambar/5">{msg}</div>}

          {/* VISTA SEMANA */}
          {vista === 'semana' && (
            <>
              <p className="text-[0.72rem] opacity-55 mb-3">Semana de {segunda.getDate()} {MESES[segunda.getMonth()]} · tema: <b className="opacity-80">“{semEd.tema}”</b></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {diasSemana.map((d) => {
                  const iso = isoLocal(d);
                  const posts = itensConta.filter((it) => it.theme?.agendadoEm === iso && passaFiltro(it));
                  return (
                    <div key={iso} className={`rounded-xl border p-2.5 ${iso === hojeIso ? 'border-ambar/40 bg-ambar/5' : 'border-ocre/12 bg-black/10'}`}>
                      <p className="text-[0.7rem] uppercase tracking-wider mb-2 flex items-center gap-2"><span className="text-[#C9B6FA]">{DIAS_PT[d.getDay()]} {d.getDate()}</span>{iso === hojeIso && <span className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-ambar/20 text-ambar normal-case tracking-normal">hoje</span>}</p>
                      <div className="space-y-2">
                        {posts.length === 0 ? <p className="text-[0.6rem] opacity-35 py-3 text-center">—</p> : posts.map((it) => <Cartao key={it.slug} it={it} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VISTA MÊS */}
          {vista === 'mes' && (() => {
            const base = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
            const ini = new Date(base); ini.setDate(1 - ((base.getDay() + 6) % 7)); // começa na segunda
            const celulas = Array.from({ length: 42 }).map((_, i) => { const d = new Date(ini); d.setDate(ini.getDate() + i); return d; });
            return (
              <>
                <p className="text-[0.78rem] opacity-65 mb-3 capitalize">{MESES[base.getMonth()]} {base.getFullYear()}</p>
                <div className="grid grid-cols-7 gap-1 text-center text-[0.58rem] opacity-50 mb-1">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((x) => <div key={x}>{x}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {celulas.map((d) => {
                    const iso = isoLocal(d); const noMes = d.getMonth() === base.getMonth();
                    const posts = itensConta.filter((it) => it.theme?.agendadoEm === iso && passaFiltro(it));
                    return (
                      <button key={iso} onClick={() => { if (posts.length) { setLegenda(posts[0]); } }} className={`min-h-[4.5rem] rounded-lg border p-1 text-left ${iso === hojeIso ? 'border-ambar/50' : 'border-ocre/10'} ${noMes ? 'bg-black/15' : 'bg-transparent opacity-40'}`}>
                        <span className="text-[0.56rem] opacity-55">{d.getDate()}</span>
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {posts.slice(0, 4).map((it) => { const c = capaDe(it); const e = estadoDe(it); return <span key={it.slug} className="w-4 h-5 rounded-sm overflow-hidden bg-black/40 ring-1" style={{ ['--tw-ring-color' as string]: COR[e].fg } as React.CSSProperties}>{c ? <img src={c} alt="" className="w-full h-full object-cover" /> : <span className="text-[0.5rem]">{fmtDe(it).emoji}</span>}</span>; })}
                          {posts.length > 4 && <span className="text-[0.5rem] opacity-50">+{posts.length - 4}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[0.6rem] opacity-45 mt-2">Toca num dia com posts para os rever. (Para aprovar/publicar usa a vista Semana.)</p>
              </>
            );
          })()}

          {/* VISTA FEED (pré-visualização do perfil) */}
          {vista === 'feed' && (() => {
            const ord = [...naoPublicados.filter(passaFiltro)].sort((a, b) => (b.theme?.agendadoEm ?? '').localeCompare(a.theme?.agendadoEm ?? ''));
            return (
              <>
                <p className="text-[0.72rem] opacity-55 mb-3">Como o teu feed vai ficar (próximos posts, dos mais recentes ao topo). As capas conversam entre si?</p>
                {ord.length === 0 ? <p className="text-[0.8rem] opacity-50 py-8 text-center">Sem posts por publicar.</p> : (
                  <div className="grid grid-cols-3 gap-1 max-w-md">
                    {ord.map((it) => { const c = capaDe(it); const e = estadoDe(it); return (
                      <button key={it.slug} onClick={() => setLegenda(it)} className="relative aspect-[4/5] bg-black/30 overflow-hidden">
                        {c ? <img src={c} alt="" className="w-full h-full object-cover" /> : <span className="grid place-items-center w-full h-full text-xl">{fmtDe(it).emoji}</span>}
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: COR[e].fg }} />
                      </button>
                    ); })}
                  </div>
                )}
              </>
            );
          })()}
        </main>
      </div>

      {/* PAINEL DE REVER (capa grande + legenda) */}
      {legenda && (() => {
        const it = legenda; const m = fmtDe(it); const capa = capaDe(it); const e = estadoDe(it);
        return (
          <div onClick={() => setLegenda(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
            <div onClick={(ev) => ev.stopPropagation()} className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-ocre/20 bg-[#15131f] p-4 ${cormorant.variable} ${inter.variable}`}>
              <div className="flex items-start gap-4">
                <div className="w-40 shrink-0 rounded-lg overflow-hidden bg-black/30 aspect-[4/5] grid place-items-center">{capa ? <img src={capa} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">{m.emoji}</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><span className="text-[0.56rem] px-1.5 py-0.5 rounded-full" style={{ background: COR[e].bg, color: COR[e].fg }}>{COR[e].nome}</span><span className="text-[0.62rem] opacity-55">{m.emoji} {m.label}</span></div>
                  <p className="text-[1.1rem] leading-tight">{it.title}</p>
                  <div className="flex items-center gap-3 mt-3 text-[0.72rem]">
                    <label className="flex items-center gap-1.5 opacity-80">📅 <input type="date" value={it.theme?.agendadoEm ?? ''} onChange={(ev) => setTheme(it.slug, { agendadoEm: ev.target.value || null })} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
                    <label className="flex items-center gap-1.5 opacity-80">🕐 <input type="time" value={horaDe(it)} onChange={(ev) => setTheme(it.slug, { hora: ev.target.value })} className="px-2 py-1 rounded-md border border-ocre/25 bg-[#0F0F1A] text-creme-2" /></label>
                  </div>
                  <p className="text-[0.56rem] opacity-45 mt-1">hora sugerida para {m.label}: {HORA_FMT[tipoChave(it)] ?? '13:00'} (melhor alcance)</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {e === 'rascunho' && <button onClick={() => { setTheme(it.slug, { aprovado: true }); }} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-[#C9B6FA]/50 bg-[#C9B6FA]/10 text-[#C9B6FA] hover:bg-[#C9B6FA]/20">✓ aprovar (publica-se à hora)</button>}
                    {e === 'agendado' && <button onClick={() => setTheme(it.slug, { aprovado: false })} className="text-[0.66rem] px-2.5 py-1.5 rounded-lg border border-ocre/25 text-creme-2/65 hover:border-ambar">↩ pôr em rascunho</button>}
                    <button onClick={() => { setLegenda(null); publicar(it); }} disabled={busy === it.slug} className="text-[0.74rem] px-3 py-1.5 rounded-lg border border-ambar/50 bg-ambar/10 text-ambar hover:bg-ambar/20 disabled:opacity-40">⚡ publicar já</button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[0.62rem] uppercase tracking-wider opacity-50 mb-1">Legenda</p>
                <div className="text-[0.82rem] leading-relaxed whitespace-pre-wrap opacity-90 border-l-2 border-ocre/20 pl-3">{legendaDe(it) || <span className="opacity-40">(sem legenda)</span>}</div>
              </div>
              <button onClick={() => setLegenda(null)} className="mt-4 text-[0.7rem] opacity-60 hover:opacity-100">fechar ✕</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
