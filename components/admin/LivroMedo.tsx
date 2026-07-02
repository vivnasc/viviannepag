'use client';

import { useState } from 'react';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const BUCKET = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-medo`;

export function LivroMedo() {
  const [vers, setVers] = useState<Record<string, number>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [aCarregar, setACarregar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [aTestar, setATestar] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; texto: string; url?: string } | null>(null);
  const [aRenderizar, setARenderizar] = useState(false);
  const [renderMsg, setRenderMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  async function renderizar() {
    setRenderMsg(null);
    setARenderizar(true);
    try {
      const res = await fetch('/api/admin/livro-medo/render-dispatch', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      setRenderMsg({ ok: true, texto: 'Render disparado (≈3-5 min). A tua capa entra na 1.ª página e os PDF (PT e EN) são publicados na loja. Recarrega mais logo.' });
    } catch (e) {
      setRenderMsg({ ok: false, texto: e instanceof Error ? e.message : String(e) });
    } finally {
      setARenderizar(false);
    }
  }

  async function testarCompra(lang: 'pt' | 'en') {
    setTestMsg(null);
    const email = testEmail.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setTestMsg({ ok: false, texto: 'Escreve um email válido para receber o teste.' });
      return;
    }
    setATestar(lang);
    try {
      const res = await fetch('/api/admin/livro-medo/teste-compra', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      const partes = [
        json.compraOk ? 'recibo + licença ao cliente e aviso à Vivianne ✓' : 'recibo/aviso falhou ✗',
        json.emailOk ? 'email com o link de descarga ✓' : 'email de descarga falhou ✗',
      ];
      setTestMsg({ ok: json.compraOk && json.emailOk, texto: `Enviado para ${email}: ${partes.join(' · ')}`, url: json.downloadUrl });
    } catch (e) {
      setTestMsg({ ok: false, texto: e instanceof Error ? e.message : String(e) });
    } finally {
      setATestar(null);
    }
  }

  const chaveDe = (lg: 'pt' | 'en') => (lg === 'en' ? 'capa-propria-en' : 'capa-propria');
  const urlCapa = (lg: 'pt' | 'en') => {
    const chave = chaveDe(lg);
    return urls[chave] ?? `${BUCKET}/${chave}.png${vers[chave] ? `?v=${vers[chave]}` : ''}`;
  };

  async function carregarCapa(file: File, lang: 'pt' | 'en') {
    setErro(null);
    setAviso(null);
    setACarregar(lang);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('lang', lang);
      const res = await fetch('/api/admin/livro-medo/upload-capa', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      const chave = chaveDe(lang);
      if (json.url) setUrls((u) => ({ ...u, [chave]: json.url as string }));
      setVers((v) => ({ ...v, [chave]: Date.now() }));
      setAviso(lang === 'en' ? 'Capa inglesa carregada.' : 'Capa portuguesa carregada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setACarregar(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {erro && <p className="text-[0.85rem] text-rose-300 bg-rose-900/20 border border-rose-500/30 rounded-lg px-4 py-2">{erro}</p>}
      {aviso && <p className="text-[0.85rem] text-ambar bg-ambar/10 border border-ambar/30 rounded-lg px-4 py-2">{aviso}</p>}

      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Capas</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Carrega a capa que fizeste: uma para o livro português («As Sete Faces do Medo») e outra
          para o inglês («The Seven Faces of Fear»). Ficam guardadas e são usadas pela landing, pela
          loja e pelo render do PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(['pt', 'en'] as const).map((lg) => (
            <div key={lg} className="flex flex-col gap-3">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-[12px] border border-ocre/20 bg-[#100d09] grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${chaveDe(lg)}-${vers[chaveDe(lg)] ?? 0}`}
                  src={urlCapa(lg)}
                  alt={lg === 'en' ? 'The Seven Faces of Fear' : 'As Sete Faces do Medo'}
                  className="h-full w-full object-cover"
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'visible'; }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              </div>
              <label className="inline-flex items-center justify-center gap-2 cursor-pointer bg-ambar text-terra font-sans text-[0.82rem] font-medium rounded-[12px] px-4 py-2.5 hover:bg-ocre transition-colors whitespace-nowrap">
                {aCarregar === lg ? 'a carregar…' : lg === 'en' ? 'capa · inglês' : 'capa · português'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) carregarCapa(f, lg);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Renderizar o livro</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Depois de carregares a capa acima, carrega aqui para compor o PDF. O render mete a tua
          capa na 1.ª página, compõe o miolo (PT e EN) e publica os ficheiros na loja, que passam a
          ser o que o cliente descarrega. Demora poucos minutos.
        </p>
        <button
          type="button"
          onClick={renderizar}
          disabled={aRenderizar}
          className="inline-flex items-center gap-2 rounded-full border border-ambar/60 bg-ambar/10 text-ambar px-6 py-2.5 text-[0.85rem] hover:bg-ambar/20 transition-colors disabled:opacity-50"
        >
          {aRenderizar ? 'a disparar…' : 'renderizar o livro (PT + EN)'}
        </button>
        {renderMsg && (
          <p className={`mt-4 text-[0.85rem] rounded-lg px-4 py-3 border ${renderMsg.ok ? 'text-ambar bg-ambar/10 border-ambar/30' : 'text-rose-300 bg-rose-900/20 border-rose-500/30'}`}>
            {renderMsg.texto}
          </p>
        )}
      </section>

      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Testar a compra</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Dispara uma compra de teste (sem PayPal) para veres exatamente o que o cliente recebe:
          o email de recibo com a licença, o email com o link de descarga do PDF, e a notificação
          que te chega a ti. Escolhe português ou inglês.
        </p>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="o teu email para receber o teste"
          className="w-full max-w-[360px] bg-transparent border border-ocre/40 rounded-[12px] py-2.5 px-4 text-creme font-sans text-[0.9rem] outline-none placeholder:text-creme/40 placeholder:italic focus:border-ambar transition-colors mb-4"
        />
        <div className="flex flex-wrap gap-3">
          {(['pt', 'en'] as const).map((lg) => (
            <button
              key={lg}
              type="button"
              onClick={() => testarCompra(lg)}
              disabled={aTestar !== null}
              className="inline-flex items-center gap-2 bg-ambar text-terra font-sans text-[0.82rem] font-medium rounded-[12px] px-4 py-2.5 hover:bg-ocre transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {aTestar === lg ? 'a enviar…' : lg === 'en' ? 'testar compra · inglês' : 'testar compra · português'}
            </button>
          ))}
        </div>
        {testMsg && (
          <div className={`mt-4 text-[0.85rem] rounded-lg px-4 py-3 border ${testMsg.ok ? 'text-ambar bg-ambar/10 border-ambar/30' : 'text-rose-300 bg-rose-900/20 border-rose-500/30'}`}>
            <p>{testMsg.texto}</p>
            {testMsg.url && (
              <a href={testMsg.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-ocre hover:text-ambar underline">
                abrir o download que o cliente recebe →
              </a>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
