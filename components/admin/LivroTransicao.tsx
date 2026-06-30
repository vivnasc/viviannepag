'use client';

import { useState } from 'react';
import { IMAGENS_LIVRO } from '@/lib/livro-transicao';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const BUCKET = `${SUPA}/storage/v1/object/public/viviannepag-assets/livro-transicao`;
const PDF_URL = `${SUPA}/storage/v1/object/public/viviannepag-assets/produtos/a-grande-transicao.pdf`;

export function LivroTransicao() {
  const [vers, setVers] = useState<Record<string, number>>({});
  const [aGerar, setAGerar] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(false);
  const [aRender, setARender] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const bust = (chave: string) => setVers((v) => ({ ...v, [chave]: Date.now() }));
  const urlImg = (chave: string, ext = 'jpg') =>
    `${BUCKET}/${chave}.${ext}${vers[chave] ? `?v=${vers[chave]}` : ''}`;

  async function gerar(chave: string) {
    setErro(null);
    setAviso(null);
    setAGerar(chave);
    try {
      const res = await fetch('/api/admin/livro-transicao/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      bust(chave);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setAGerar(null);
    }
  }

  async function carregarCapa(file: File) {
    setErro(null);
    setAviso(null);
    setACarregar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/livro-transicao/upload-capa', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      bust('capa-propria');
      setAviso('Capa carregada. No render, a tua capa vence a gerada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setACarregar(false);
    }
  }

  async function renderizar() {
    setErro(null);
    setAviso(null);
    setARender(true);
    try {
      const res = await fetch('/api/admin/livro-transicao/render-dispatch', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
      setAviso('A renderizar no GitHub Actions (Puppeteer). O PDF aparece em ~2 a 4 minutos no link abaixo.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setARender(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {erro && <p className="text-[0.85rem] text-rose-300 bg-rose-900/20 border border-rose-500/30 rounded-lg px-4 py-2">{erro}</p>}
      {aviso && <p className="text-[0.85rem] text-ambar bg-ambar/10 border border-ambar/30 rounded-lg px-4 py-2">{aviso}</p>}

      {/* Capa própria (carregar) */}
      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Capa própria</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-4">
          Se fizeste a capa fora do site (a imagem dos dois mundos), carrega-a aqui. Vence sempre a capa gerada no render.
        </p>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer bg-ambar text-terra font-sans text-[0.85rem] font-medium rounded-[12px] px-4 py-2.5 hover:bg-ocre transition-colors">
            {aCarregar ? 'a carregar…' : 'carregar capa'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) carregarCapa(f);
              }}
            />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlImg('capa-propria', 'png')}
            alt="capa própria"
            className="w-[78px] h-[104px] object-cover rounded-[8px] border border-ocre/20"
            onError={(e) => ((e.currentTarget.style.display = 'none'))}
          />
        </div>
      </section>

      {/* Gerar imagens (Replicate) */}
      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Imagens · gerar (Replicate)</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          A capa (os dois mundos) e as quatro vinhetas das Partes, na estética do manifesto Pós-Sobrevivência. Gera, vê, e regenera até gostares; o render usa sempre a mais recente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {IMAGENS_LIVRO.map((img) => (
            <div key={img.chave} className="flex gap-4 border border-ocre/10 rounded-[12px] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlImg(img.chave)}
                alt={img.nome}
                className="w-[88px] h-[120px] object-cover rounded-[8px] border border-ocre/20 bg-terra/40 shrink-0"
                onError={(e) => ((e.currentTarget.style.visibility = 'hidden'))}
              />
              <div className="flex flex-col">
                <p className="font-serif text-creme text-[0.95rem] leading-tight">{img.nome}</p>
                <p className="text-creme-2/55 text-[0.78rem] font-serif italic mt-1 mb-3">{img.legenda}</p>
                <button
                  onClick={() => gerar(img.chave)}
                  disabled={aGerar === img.chave}
                  className="self-start bg-ambar/90 text-terra font-sans text-[0.8rem] font-medium rounded-[10px] px-3.5 py-2 hover:bg-ocre transition-colors disabled:opacity-50"
                >
                  {aGerar === img.chave ? 'a gerar…' : 'gerar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Render */}
      <section className="border border-ocre/15 rounded-[14px] p-6">
        <h3 className="font-serif text-creme text-[1.05rem] mb-1">Renderizar o livro (PDF)</h3>
        <p className="text-creme-2/60 text-[0.82rem] font-serif italic mb-5">
          Compõe o miolo tipografado (arco, capitular, ornamentos, caixas, diagrama, vinhetas das Partes) com a capa, e publica o PDF. Corre no GitHub Actions.
        </p>
        <div className="flex items-center gap-5 flex-wrap">
          <button
            onClick={renderizar}
            disabled={aRender}
            className="bg-ambar text-terra font-sans text-[0.9rem] font-medium rounded-[12px] px-5 py-3 hover:bg-ocre transition-colors disabled:opacity-50"
          >
            {aRender ? 'a disparar…' : 'renderizar PDF'}
          </button>
          <a href={PDF_URL} target="_blank" rel="noreferrer" className="text-ocre hover:text-ambar text-[0.85rem] no-underline border-b border-ocre/40">
            abrir o último PDF →
          </a>
        </div>
      </section>
    </div>
  );
}
