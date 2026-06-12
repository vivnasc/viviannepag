'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Conta = { openId: string; displayName?: string | null; scope?: string | null; ligadoEm: string };
type CreatorInfo = {
  creator_nickname?: string;
  creator_username?: string;
  creator_avatar_url?: string;
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  duet_disabled?: boolean;
  stitch_disabled?: boolean;
  max_video_post_duration_sec?: number;
};

const PRIVACIDADE_PT: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Público (todos)',
  MUTUAL_FOLLOW_FRIENDS: 'Amigos (seguem-se mutuamente)',
  FOLLOWER_OF_CREATOR: 'Seguidores',
  SELF_ONLY: 'Só eu (privado)',
};

export default function TikTokPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [openId, setOpenId] = useState('');
  const [slug, setSlug] = useState('semana-14-trabalho');
  const [titulo, setTitulo] = useState('');

  const [info, setInfo] = useState<CreatorInfo | null>(null);
  const [carregandoInfo, setCarregandoInfo] = useState(false);
  const [avatarOk, setAvatarOk] = useState(true);
  const [privacidade, setPrivacidade] = useState('');
  const [permitirComentarios, setPermitirComentarios] = useState(true);
  const [permitirDuo, setPermitirDuo] = useState(true);
  const [permitirJuncao, setPermitirJuncao] = useState(true);

  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [semVideo, setSemVideo] = useState(false);

  // pré-visualização do vídeo do slug (mostra o que vai ser publicado)
  useEffect(() => {
    if (!slug.trim()) { setPreviewUrl(null); setSemVideo(false); return; }
    const t = setTimeout(() => {
      fetch(`/api/admin/tiktok/video?slug=${encodeURIComponent(slug.trim())}`)
        .then((r) => (r.ok ? r.json() : { videoUrl: null }))
        .then((j: { videoUrl?: string | null }) => { setPreviewUrl(j.videoUrl ?? null); setSemVideo(!j.videoUrl); })
        .catch(() => { setPreviewUrl(null); setSemVideo(true); });
    }, 600);
    return () => clearTimeout(t);
  }, [slug]);

  // carrega contas ligadas
  useEffect(() => {
    fetch('/api/admin/tiktok/contas')
      .then((r) => (r.ok ? r.json() : { contas: [] }))
      .then((j) => { setContas(j.contas ?? []); if (j.contas?.[0]) setOpenId(j.contas[0].openId); })
      .catch(() => {});
  }, []);

  // ao escolher conta, busca as opções reais (privacidade/interações) — exigido pela auditoria
  const carregarInfo = useCallback(async (oid: string) => {
    if (!oid) return;
    setCarregandoInfo(true); setInfo(null); setPrivacidade(''); setResultado(null); setAvatarOk(true);
    try {
      const r = await fetch(`/api/admin/tiktok/creator-info?account=${encodeURIComponent(oid)}`);
      const j = await r.json();
      if (!r.ok) { setResultado('Erro a carregar opções: ' + (j.detalhe ?? j.erro)); return; }
      const d = (j.data ?? {}) as CreatorInfo;
      setInfo(d);
      setPermitirComentarios(!d.comment_disabled);
      setPermitirDuo(!d.duet_disabled);
      setPermitirJuncao(!d.stitch_disabled);
    } catch (e) {
      setResultado('Erro a carregar opções: ' + String(e));
    } finally {
      setCarregandoInfo(false);
    }
  }, []);

  useEffect(() => { if (openId) carregarInfo(openId); }, [openId, carregarInfo]);

  async function publicar() {
    if (!privacidade) { setResultado('Escolhe primeiro quem pode ver o vídeo.'); return; }
    setPublicando(true); setResultado(null);
    try {
      const r = await fetch('/api/admin/tiktok/publicar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          openId, slug, titulo,
          privacidade,
          disableComment: !permitirComentarios,
          disableDuet: !permitirDuo,
          disableStitch: !permitirJuncao,
        }),
      });
      const j = await r.json();
      if (r.ok && j.ok) setResultado('✅ Publicado no TikTok!');
      else if (r.ok && j.detalhe) setResultado('⏳ ' + j.detalhe);
      else setResultado('❌ ' + (j.failReason ?? j.detalhe ?? j.erro ?? 'falhou'));
    } catch (e) {
      setResultado('❌ ' + String(e));
    } finally {
      setPublicando(false);
    }
  }

  const opcoes = info?.privacy_level_options ?? [];

  return (
    <main className="mx-auto max-w-xl px-6 py-10 text-stone-100">
      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-200">← Admin</Link>
      <h1 className="mt-4 text-2xl font-semibold text-white">Publicar no TikTok</h1>
      <p className="mt-1 text-sm text-stone-400">Envia um vídeo para a conta TikTok escolhida, com as opções reais da conta.</p>

      {contas.length === 0 ? (
        <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Ainda não há contas ligadas. Liga uma em <code>/api/admin/tiktok/auth</code>.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {/* conta */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Conta</label>
              <a href="/api/admin/tiktok/auth" className="text-xs text-rose-400 hover:text-rose-300">+ Ligar conta TikTok</a>
            </div>
            <select value={openId} onChange={(e) => setOpenId(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900">
              {contas.map((c) => <option key={c.openId} value={c.openId}>{c.displayName ?? c.openId.slice(0, 10)}</option>)}
            </select>
          </div>

          {/* vídeo */}
          <div>
            <label className="block text-sm font-medium">Vídeo (slug da coleção)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" placeholder="ex: semana-14-trabalho" />
            {/* pré-visualização do vídeo a publicar */}
            <div className="mt-3">
              {previewUrl ? (
                <video src={previewUrl} controls playsInline className="w-44 rounded-xl border border-stone-700 bg-black" />
              ) : semVideo ? (
                <p className="text-xs text-amber-400">Esta coleção ainda não tem vídeo (MP4) gerado.</p>
              ) : (
                <p className="text-xs text-stone-500">A carregar pré-visualização…</p>
              )}
            </div>
          </div>

          {/* legenda */}
          <div>
            <label className="block text-sm font-medium">Legenda (opcional)</label>
            <textarea value={titulo} onChange={(e) => setTitulo(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" placeholder="Deixa vazio para usar a legenda da coleção" />
          </div>

          {/* info do criador + privacidade */}
          <div className="rounded-xl border border-stone-600 bg-stone-900/40 p-4">
            {carregandoInfo ? (
              <p className="text-sm text-stone-500">A carregar opções da conta…</p>
            ) : info ? (
              <>
                <div className="flex items-center gap-3">
                  {info.creator_avatar_url && avatarOk ? (
                    <img src={info.creator_avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" onError={() => setAvatarOk(false)} />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-medium text-white">
                      {(info.creator_nickname ?? 'V').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="font-medium">{info.creator_nickname ?? '—'}</div>
                    {info.creator_username && <div className="text-stone-400">@{info.creator_username}</div>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">Quem pode ver este vídeo? <span className="text-rose-500">*</span></label>
                  <div className="mt-2 space-y-1">
                    {opcoes.map((op) => (
                      <label key={op} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="priv" checked={privacidade === op} onChange={() => setPrivacidade(op)} />
                        {PRIVACIDADE_PT[op] ?? op}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <label className={`flex items-center gap-2 ${info.comment_disabled ? 'text-stone-300' : ''}`}>
                    <input type="checkbox" checked={permitirComentarios} disabled={info.comment_disabled} onChange={(e) => setPermitirComentarios(e.target.checked)} /> Permitir comentários
                  </label>
                  <label className={`flex items-center gap-2 ${info.duet_disabled ? 'text-stone-300' : ''}`}>
                    <input type="checkbox" checked={permitirDuo} disabled={info.duet_disabled} onChange={(e) => setPermitirDuo(e.target.checked)} /> Permitir Duo
                  </label>
                  <label className={`flex items-center gap-2 ${info.stitch_disabled ? 'text-stone-300' : ''}`}>
                    <input type="checkbox" checked={permitirJuncao} disabled={info.stitch_disabled} onChange={(e) => setPermitirJuncao(e.target.checked)} /> Permitir Junção (Stitch)
                  </label>
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-500">Escolhe uma conta para ver as opções.</p>
            )}
          </div>

          {/* aviso obrigatório do TikTok */}
          <p className="text-xs text-stone-400">
            Ao publicar, concordas com a{' '}
            <a className="underline" href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Confirmação de Uso de Música</a>{' '}do TikTok.
          </p>

          <button onClick={publicar} disabled={publicando || !privacidade} className="w-full rounded-lg bg-rose-600 py-3 font-medium text-white hover:bg-rose-500 disabled:opacity-40">
            {publicando ? 'A publicar…' : 'Publicar no TikTok'}
          </button>

          {resultado && <p className="text-sm">{resultado}</p>}
        </div>
      )}
    </main>
  );
}
