'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FAMILIAS, type FamiliaImagem as Familia } from '@/lib/crescer/imagens-mae';

// BANCO DE IMAGENS DA MÃE — a Vivianne só ARRASTA as imagens para o cesto da família.
// O sistema nomeia (timestamp) e categoriza (família → temas + modo). Nada de escrever.
const BG = '#0c0a08', CARD = '#171310', GOLD = '#d8a85a', SOFT = '#e6c98f', TXT = '#f4ecdd', LINE = '#2a2118';

export default function BancoImagens() {
  const familias: Familia[] = FAMILIAS; // os cestos vêm do código; só as imagens vêm da API
  const [banco, setBanco] = useState<Record<string, string[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [aEnviar, setAEnviar] = useState<Record<string, number>>({});
  const [sobre, setSobre] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/crescer/banco');
      const j = await r.json();
      if (j.banco) setBanco(j.banco);
    } catch { /* rede */ } finally { setCarregando(false); }
  }, []);
  useEffect(() => { recarregar(); }, [recarregar]);

  const enviar = useCallback(async (familia: string, files: FileList | File[]) => {
    const lista = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!lista.length) return;
    setAEnviar((s) => ({ ...s, [familia]: (s[familia] || 0) + lista.length }));
    for (const file of lista) {
      const fd = new FormData(); fd.append('file', file); fd.append('familia', familia);
      try {
        const r = await fetch('/api/admin/crescer/banco', { method: 'POST', body: fd });
        const j = await r.json();
        if (j.url) setBanco((b) => ({ ...b, [familia]: [j.url, ...(b[familia] || [])] }));
      } catch { /* segue */ }
      setAEnviar((s) => ({ ...s, [familia]: Math.max(0, (s[familia] || 1) - 1) }));
    }
  }, []);

  const apagar = useCallback(async (familia: string, url: string) => {
    setBanco((b) => ({ ...b, [familia]: (b[familia] || []).filter((u) => u !== url) }));
    try { await fetch('/api/admin/crescer/banco', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) }); } catch { /* */ }
  }, []);

  const total = Object.values(banco).reduce((n, a) => n + a.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TXT, fontFamily: 'Georgia, serif', padding: '28px 22px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, letterSpacing: '.01em', margin: 0 }}>Banco de imagens · a mãe</h1>
        <p style={{ color: SOFT, opacity: 0.8, marginTop: 8, fontFamily: 'system-ui, sans-serif', fontSize: 13.5, lineHeight: 1.6, maxWidth: 720 }}>
          Arrasta as tuas imagens (MJ ou outras) para o cesto da <b>família</b> a que pertencem — o sistema nomeia e
          categoriza sozinho, e cada peça escolhe daqui pela sua temática. As de fundo escuro entram como <b>cena inteira</b>;
          as isoladas em <b>preto puro</b> (folhas/flores/raízes) entram como <b>acento</b>. {total > 0 ? `· ${total} no banco` : ''}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 22 }}>
          {familias.map((f) => (
            <Cesto key={f.id} familia={f} imagens={banco[f.id] || []} aEnviar={aEnviar[f.id] || 0}
              sobre={sobre === f.id} setSobre={(v) => setSobre(v ? f.id : null)}
              onFiles={(files) => enviar(f.id, files)} onApagar={(url) => apagar(f.id, url)} />
          ))}
        </div>
        {carregando && <p style={{ color: SOFT, opacity: 0.6, marginTop: 20, fontFamily: 'system-ui' }}>a carregar…</p>}
      </div>
    </div>
  );
}

function Cesto({ familia, imagens, aEnviar, sobre, setSobre, onFiles, onApagar }: {
  familia: Familia; imagens: string[]; aEnviar: number; sobre: boolean;
  setSobre: (v: boolean) => void; onFiles: (f: FileList | File[]) => void; onApagar: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setSobre(true); }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => { e.preventDefault(); setSobre(false); if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files); }}
      style={{ background: CARD, border: `1px solid ${sobre ? GOLD : LINE}`, borderRadius: 14, padding: 14, transition: 'border-color .15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 16 }}>{familia.emoji} {familia.nome}</div>
        <span style={{ fontFamily: 'system-ui', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: familia.modo === 'acento' ? '#9ecb8a' : SOFT, opacity: 0.85 }}>{familia.modo}</span>
      </div>
      <div style={{ color: SOFT, opacity: 0.62, fontFamily: 'system-ui', fontSize: 11.5, lineHeight: 1.5, marginTop: 4 }}>{familia.dica}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 12 }}>
        {imagens.map((url) => (
          <div key={url} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 7, overflow: 'hidden', background: '#000' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => onApagar(url)} title="apagar" style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 9, border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, lineHeight: '18px', cursor: 'pointer', padding: 0 }}>×</button>
          </div>
        ))}
        {Array.from({ length: aEnviar }).map((_, i) => (
          <div key={`u${i}`} style={{ aspectRatio: '4/5', borderRadius: 7, background: '#221a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SOFT, fontSize: 16 }}>…</div>
        ))}
      </div>

      <button onClick={() => inputRef.current?.click()}
        style={{ marginTop: 12, width: '100%', padding: '9px 10px', borderRadius: 9, border: `1px dashed ${GOLD}`, background: sobre ? 'rgba(216,168,90,.12)' : 'transparent', color: SOFT, fontFamily: 'system-ui', fontSize: 12.5, cursor: 'pointer' }}>
        arrastar aqui ou tocar para juntar
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
