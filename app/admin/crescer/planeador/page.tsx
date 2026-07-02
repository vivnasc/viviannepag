'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SLOTS, ymd, segundaDaSemana, diasDaSemana, rotuloDia } from '@/lib/crescer/planeador';

// PLANEADOR DA MÃE — semana × 3 slots/dia (11h · 17h · 23h-Brasil). Puxa as peças geradas
// e mostra o que está agendado onde; os vazios enchem-se com uma peça "por agendar".
// Abas PT (@vivianne.dos.santos) / EN (@viviannewrites). Usa /crescer/list + /conteudos/agendar.
const BG = '#0c0a08', CARD = '#171310', GOLD = '#d8a85a', SOFT = '#e6c98f', TXT = '#f4ecdd', LINE = '#2a2118';

interface Peca {
  slug: string; texto: string; tematica: string | null; lingua?: string | null;
  agendadoEm: string | null; hora: string | null; publicado: boolean; arquivado?: boolean;
  img?: string | null; videoUrl?: string | null;
}

export default function Planeador() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [off, setOff] = useState(0);
  const [lingua, setLingua] = useState<'pt' | 'en'>('pt');
  const [alvo, setAlvo] = useState<{ data: string; hora: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const recarregar = useCallback(async () => {
    try { const r = await fetch('/api/admin/crescer/list'); const j = await r.json(); if (j.pecas) setPecas(j.pecas); }
    catch { /* rede */ } finally { setCarregando(false); }
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const daLingua = useCallback((p: Peca) => (p.lingua === 'en' ? 'en' : 'pt') === lingua, [lingua]);
  const dias = useMemo(() => diasDaSemana(segundaDaSemana(new Date(), off)), [off]);
  const noSlot = (data: string, hora: string) => pecas.find((p) => daLingua(p) && p.agendadoEm === data && (p.hora || '').slice(0, 5) === hora && !p.arquivado);
  const porAgendar = useMemo(() => pecas.filter((p) => daLingua(p) && !p.agendadoEm && !p.publicado && !p.arquivado), [pecas, daLingua]);

  const agendar = useCallback(async (slug: string, data: string, hora: string) => {
    setBusy(true);
    setPecas((ps) => ps.map((p) => p.slug === slug ? { ...p, agendadoEm: data, hora } : p));
    try { await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: data, hora, aprovado: true }) }); }
    catch { /* */ } finally { setBusy(false); setAlvo(null); }
  }, []);
  const desagendar = useCallback(async (slug: string) => {
    setPecas((ps) => ps.map((p) => p.slug === slug ? { ...p, agendadoEm: null } : p));
    try { await fetch('/api/admin/conteudos/agendar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, agendadoEm: null }) }); } catch { /* */ }
  }, []);

  const semana = `${rotuloDia(dias[0])} – ${rotuloDia(dias[6])}`;
  const conta = lingua === 'en' ? '@viviannewrites' : '@vivianne.dos.santos';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TXT, fontFamily: 'Georgia, serif', padding: '26px 20px 90px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Planeador · a mãe <span style={{ fontSize: 13, color: SOFT, opacity: 0.7 }}>3 posts/dia</span></h1>
          <div style={{ display: 'flex', gap: 6, fontFamily: 'system-ui', fontSize: 12 }}>
            {(['pt', 'en'] as const).map((l) => (
              <button key={l} onClick={() => { setLingua(l); setAlvo(null); }} style={{ padding: '5px 11px', borderRadius: 8, border: `1px solid ${lingua === l ? GOLD : LINE}`, background: lingua === l ? 'rgba(216,168,90,.14)' : 'transparent', color: lingua === l ? GOLD : SOFT, cursor: 'pointer' }}>{l === 'pt' ? '🇵🇹 português' : '🇬🇧 english'}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontFamily: 'system-ui', fontSize: 13, color: SOFT }}>
          <button onClick={() => setOff((o) => o - 1)} style={navBtn}>◀</button>
          <span style={{ minWidth: 150, textAlign: 'center' }}>{semana}{off === 0 ? ' · esta semana' : ''}</span>
          <button onClick={() => setOff((o) => o + 1)} style={navBtn}>▶</button>
          <span style={{ marginLeft: 8, opacity: 0.6 }}>{conta}</span>
        </div>

        {alvo && <div style={{ marginTop: 14, padding: '9px 12px', borderRadius: 10, border: `1px solid ${GOLD}`, background: 'rgba(216,168,90,.1)', fontFamily: 'system-ui', fontSize: 12.5, color: SOFT }}>A pôr peça em <b style={{ color: TXT }}>{rotuloDia(new Date(alvo.data + 'T00:00'))} · {alvo.hora}</b> — escolhe uma peça em baixo. <button onClick={() => setAlvo(null)} style={{ ...navBtn, marginLeft: 8 }}>cancelar</button></div>}

        {/* grelha: linhas = slots, colunas = dias */}
        <div style={{ overflowX: 'auto', marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `72px repeat(7, minmax(128px, 1fr))`, gap: 6, minWidth: 980 }}>
            <div />
            {dias.map((d) => (
              <div key={+d} style={{ textAlign: 'center', fontFamily: 'system-ui', fontSize: 12, letterSpacing: '.06em', color: ymd(d) === ymd(new Date()) ? GOLD : SOFT, opacity: 0.9, padding: '4px 0' }}>{rotuloDia(d)}</div>
            ))}
            {SLOTS.map((s) => (
              <div key={s.id} style={{ display: 'contents' }}>
                <div style={{ fontFamily: 'system-ui', fontSize: 11, color: SOFT, opacity: 0.75, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', paddingRight: 6 }}>
                  <b style={{ color: TXT }}>{s.hora}</b><span>{s.nome}</span>
                </div>
                {dias.map((d) => {
                  const data = ymd(d); const p = noSlot(data, s.hora);
                  const ativo = alvo?.data === data && alvo?.hora === s.hora;
                  return (
                    <div key={data + s.id} style={{ minHeight: 74, borderRadius: 9, border: `1px solid ${ativo ? GOLD : LINE}`, background: CARD, padding: 7, position: 'relative' }}>
                      {p ? (
                        <>
                          <div style={{ fontSize: 11.5, lineHeight: 1.32, color: TXT, maxHeight: 52, overflow: 'hidden' }}>{p.texto}</div>
                          <div style={{ position: 'absolute', top: 4, right: 5, display: 'flex', gap: 4, alignItems: 'center' }}>
                            {p.videoUrl ? <span title="renderizado" style={{ fontSize: 9 }}>🎬</span> : p.img ? <span title="com imagem" style={{ fontSize: 9 }}>🖼</span> : null}
                            <button onClick={() => desagendar(p.slug)} title="tirar do slot" style={{ border: 'none', background: 'rgba(0,0,0,.5)', color: '#fff', borderRadius: 8, width: 15, height: 15, fontSize: 10, lineHeight: '15px', cursor: 'pointer', padding: 0 }}>×</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setAlvo(ativo ? null : { data, hora: s.hora })} style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', color: SOFT, opacity: ativo ? 1 : 0.4, fontSize: 18, cursor: 'pointer' }}>＋</button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* por agendar */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: 'system-ui', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: SOFT, opacity: 0.7, marginBottom: 8 }}>por agendar · {porAgendar.length} {alvo ? '· toca numa para a pôr no slot' : ''}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {porAgendar.map((p) => (
              <button key={p.slug} disabled={!alvo || busy} onClick={() => alvo && agendar(p.slug, alvo.data, alvo.hora)}
                style={{ textAlign: 'left', background: CARD, border: `1px solid ${alvo ? GOLD : LINE}`, borderRadius: 9, padding: '9px 10px', color: TXT, cursor: alvo ? 'pointer' : 'default', opacity: alvo ? 1 : 0.85 }}>
                <div style={{ fontSize: 11.5, lineHeight: 1.34, maxHeight: 50, overflow: 'hidden' }}>{p.texto}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: SOFT, opacity: 0.6, marginTop: 5 }}>{p.tematica || 'crescer'}{p.videoUrl ? ' · 🎬' : p.img ? ' · 🖼' : ''}</div>
              </button>
            ))}
            {!porAgendar.length && <span style={{ color: SOFT, opacity: 0.5, fontFamily: 'system-ui', fontSize: 12.5 }}>nada por agendar {lingua === 'en' ? 'em inglês' : ''} — gera no /admin/crescer.</span>}
          </div>
        </div>
        {carregando && <p style={{ color: SOFT, opacity: 0.5, marginTop: 16, fontFamily: 'system-ui' }}>a carregar…</p>}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = { border: `1px solid ${LINE}`, background: 'transparent', color: SOFT, borderRadius: 7, padding: '3px 9px', cursor: 'pointer', fontSize: 12 };
