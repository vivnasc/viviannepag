'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Escrito = {
  id?: string;
  slug: string;
  locale: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  tematica: string | null;
  capa: string | null;
  data: string;
  publicado: boolean;
};

const TEMATICAS = ['o-no', 'presenca', 'veu'];

export function EscritoEditor({ inicial, modo }: { inicial: Escrito; modo: 'novo' | 'editar' }) {
  const router = useRouter();
  const [escrito, setEscrito] = useState<Escrito>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [dragAtivo, setDragAtivo] = useState(false);
  const [aGerar, setAGerar] = useState<null | 'esboco' | 'titulo' | 'resumo' | 'continuar' | 'expandir' | 'prompt-imagem' | 'legenda-social' | 'traduzir-en'>(null);
  const [legendaSocial, setLegendaSocial] = useState('');
  const [promptIA, setPromptIA] = useState('');
  const [estiloMJ, setEstiloMJ] = useState('');
  const [promptMJ, setPromptMJ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof Escrito>(k: K, v: Escrito[K]) {
    setEscrito((s) => ({ ...s, [k]: v }));
  }

  async function salvar() {
    if (!escrito.slug || !escrito.titulo) {
      setMensagem('Slug e título são obrigatórios.');
      return;
    }
    setSalvando(true);
    setMensagem(null);
    const url = modo === 'novo' ? '/api/admin/escritos' : `/api/admin/escritos/${escrito.id}`;
    const method = modo === 'novo' ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(escrito),
    });
    const json = await res.json();
    setSalvando(false);
    if (res.ok) {
      setMensagem('Guardado.');
      if (modo === 'novo' && json.escrito?.id) {
        router.replace(`/admin/${json.escrito.id}`);
      }
    } else {
      setMensagem(`Erro: ${json.erro}`);
    }
  }

  async function upload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', escrito.slug || 'sem-slug');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (res.ok) {
      set('capa', json.url);
      setMensagem('Imagem carregada.');
    } else {
      setMensagem(`Upload falhou: ${json.erro}`);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragAtivo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  async function traduzirEN() {
    if (!escrito.conteudo || !escrito.slug) return;
    setAGerar('traduzir-en');
    setMensagem('A traduzir para EN…');
    const res = await fetch('/api/admin/gerar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        modo: 'traduzir-en',
        titulo: escrito.titulo,
        prompt: escrito.resumo,
        contexto: escrito.conteudo,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setAGerar(null);
      setMensagem(`Erro: ${json.erro}`);
      return;
    }
    const texto = json.texto as string;
    const titleMatch = texto.match(/^TITLE:\s*(.+)/m);
    const summaryMatch = texto.match(/^SUMMARY:\s*(.+)/m);
    const bodyStart = texto.indexOf('\n\n', texto.indexOf('SUMMARY:'));
    const enTitulo = titleMatch?.[1]?.trim() ?? escrito.titulo;
    const enResumo = summaryMatch?.[1]?.trim() ?? escrito.resumo;
    const enConteudo = bodyStart > 0 ? texto.slice(bodyStart).trim() : texto;

    const saveRes = await fetch('/api/admin/escritos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        slug: escrito.slug,
        locale: 'en',
        titulo: enTitulo,
        resumo: enResumo,
        conteudo: enConteudo,
        tematica: escrito.tematica,
        capa: escrito.capa,
        data: escrito.data,
        publicado: escrito.publicado,
      }),
    });
    setAGerar(null);
    if (saveRes.ok) {
      setMensagem('Versão EN criada e guardada.');
    } else {
      const sj = await saveRes.json();
      if (sj.erro === 'slug-duplicado') {
        setMensagem('Versão EN já existe para este slug. Edita-a na lista.');
      } else {
        setMensagem(`Traduzido mas falhou a guardar: ${sj.erro}`);
      }
    }
  }

  async function gerar(modo: 'esboco' | 'titulo' | 'resumo' | 'continuar' | 'expandir' | 'prompt-imagem' | 'legenda-social') {
    setAGerar(modo);
    setMensagem(null);
    const payload: Record<string, string> = { modo };
    if (modo === 'esboco' || modo === 'titulo') {
      payload.prompt = promptIA || escrito.titulo;
      payload.titulo = escrito.titulo;
      payload.tematica = escrito.tematica ?? '';
    } else if (modo === 'prompt-imagem') {
      payload.prompt = estiloMJ || '';
      payload.contexto = escrito.conteudo || escrito.titulo;
    } else if (modo === 'legenda-social') {
      payload.contexto = `Título: ${escrito.titulo}\nResumo: ${escrito.resumo}\n\n${escrito.conteudo}`;
    } else {
      payload.contexto = escrito.conteudo;
    }
    const res = await fetch('/api/admin/gerar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setAGerar(null);
    if (!res.ok) {
      setMensagem(`Erro Claude: ${json.erro}`);
      return;
    }
    if (modo === 'titulo') {
      setMensagem(json.texto);
    } else if (modo === 'resumo') {
      set('resumo', json.texto.trim());
    } else if (modo === 'continuar') {
      set('conteudo', (escrito.conteudo || '') + '\n\n' + json.texto);
    } else if (modo === 'expandir') {
      set('conteudo', json.texto);
    } else if (modo === 'prompt-imagem') {
      setPromptMJ(json.texto.trim());
    } else if (modo === 'legenda-social') {
      setLegendaSocial(json.texto);
    } else {
      set('conteudo', json.texto);
    }
  }

  return (
    <main className="max-w-[860px] mx-auto px-7 py-10">
      <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link href="/admin" className="text-ocre/80 no-underline text-[0.82rem] tracking-[0.08em] hover:text-ambar">
          ← voltar
        </Link>
        <div className="flex gap-2 items-center">
          {mensagem && <span className="text-ambar text-sm italic font-serif mr-2">{mensagem}</span>}
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-ocre text-terra rounded-[12px] px-5 py-2 text-[0.85rem] tracking-[0.04em] lowercase hover:bg-ambar transition-colors disabled:opacity-70"
          >
            {salvando ? 'a guardar…' : 'guardar'}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <Field label="título">
          <input value={escrito.titulo} onChange={(e) => set('titulo', e.target.value)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="slug (URL)">
            <input value={escrito.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className={inputCls} />
          </Field>
          <Field label="data">
            <input type="date" value={escrito.data} onChange={(e) => set('data', e.target.value)} className={inputCls} />
          </Field>
          <Field label="temática">
            <select value={escrito.tematica ?? ''} onChange={(e) => set('tematica', e.target.value || null)} className={inputCls}>
              <option value="">— sem temática —</option>
              {TEMATICAS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="língua">
            <select value={escrito.locale} onChange={(e) => set('locale', e.target.value)} className={inputCls}>
              <option value="pt">português</option>
              <option value="en">english</option>
            </select>
          </Field>
        </div>

        <Field label="resumo">
          <div className="relative">
            <textarea value={escrito.resumo} onChange={(e) => set('resumo', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            <button
              onClick={() => gerar('resumo')}
              disabled={aGerar !== null}
              className="absolute top-2 right-2 text-[0.7rem] tracking-[0.06em] uppercase text-ocre hover:text-ambar disabled:opacity-50"
            >
              {aGerar === 'resumo' ? 'a gerar…' : '✶ gerar resumo'}
            </button>
          </div>
        </Field>

        <Field label="capa">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragAtivo(true); }}
            onDragLeave={() => setDragAtivo(false)}
            onDrop={onDrop}
            className={`border border-dashed rounded-[14px] p-4 transition-colors cursor-pointer ${dragAtivo ? 'border-ambar bg-terra-2/50' : 'border-ocre/40'}`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
              className="hidden"
            />
            {escrito.capa ? (
              <div className="flex items-center gap-4">
                <img src={escrito.capa} alt="capa" className="w-32 h-20 object-cover rounded-md border border-ocre/30" />
                <div className="flex-1">
                  <p className="text-creme-2 text-sm break-all">{escrito.capa}</p>
                  <button onClick={(e) => { e.stopPropagation(); set('capa', null); }} className="text-rosa/70 text-xs mt-2 hover:text-rosa">remover</button>
                </div>
              </div>
            ) : (
              <p className="text-creme-2/60 italic text-sm text-center">arrasta uma imagem para aqui ou clica para escolher</p>
            )}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap items-end">
            <input
              placeholder="estilo (ex: fotografia minimalista, digital art, watercolor…)"
              value={estiloMJ}
              onChange={(e) => setEstiloMJ(e.target.value)}
              className={`${inputCls} flex-1 min-w-[200px] text-sm`}
            />
            <button
              type="button"
              onClick={() => gerar('prompt-imagem')}
              disabled={aGerar !== null || (!escrito.conteudo && !escrito.titulo)}
              className={btnSec}
            >
              {aGerar === 'prompt-imagem' ? 'a gerar…' : '✶ gerar prompt MJ'}
            </button>
          </div>
          {promptMJ && (
            <div className="mt-3 bg-terra-2/40 rounded-[10px] p-3 border border-ocre/20">
              <p className="text-[0.68rem] tracking-[0.16em] uppercase text-ocre/70 mb-2">prompt midjourney (copiar):</p>
              <p className="text-creme text-sm font-mono leading-relaxed select-all">{promptMJ}</p>
            </div>
          )}
        </Field>

        <Field label="conteúdo (markdown)">
          <div className="flex gap-2 mb-2 flex-wrap">
            <input
              placeholder="pede ao Claude: ex. 'a vergonha como fronteira'"
              value={promptIA}
              onChange={(e) => setPromptIA(e.target.value)}
              className={`${inputCls} flex-1 min-w-[240px] text-sm`}
            />
            <button onClick={() => gerar('esboco')} disabled={aGerar !== null} className={btnSec}>
              {aGerar === 'esboco' ? 'a gerar…' : '✶ esboço'}
            </button>
            <button onClick={() => gerar('titulo')} disabled={aGerar !== null} className={btnSec}>
              {aGerar === 'titulo' ? '…' : '✶ títulos'}
            </button>
            <button onClick={() => gerar('continuar')} disabled={aGerar !== null || !escrito.conteudo} className={btnSec}>
              {aGerar === 'continuar' ? '…' : '✶ continuar'}
            </button>
            <button onClick={() => gerar('expandir')} disabled={aGerar !== null || !escrito.conteudo} className={btnSec}>
              {aGerar === 'expandir' ? '…' : '✶ expandir'}
            </button>
          </div>
          <textarea
            value={escrito.conteudo}
            onChange={(e) => set('conteudo', e.target.value)}
            rows={22}
            className={`${inputCls} font-mono text-[0.92rem] leading-[1.7]`}
            placeholder="# corpo do texto em markdown..."
          />
        </Field>

        {escrito.locale === 'pt' && (
          <Field label="versão inglesa">
            <button
              type="button"
              onClick={traduzirEN}
              disabled={aGerar !== null || !escrito.conteudo || !escrito.slug}
              className={btnSec}
            >
              {aGerar === 'traduzir-en' ? 'a traduzir…' : '✶ traduzir para EN e guardar'}
            </button>
            <p className="text-creme-2/50 text-[0.75rem] mt-2">Claude traduz título + resumo + texto e cria um novo escrito com locale EN e o mesmo slug. Se já existir, não sobrescreve.</p>
          </Field>
        )}

        <Field label="redes sociais">
          <button
            type="button"
            onClick={() => gerar('legenda-social')}
            disabled={aGerar !== null || !escrito.conteudo}
            className={`${btnSec} mb-3`}
          >
            {aGerar === 'legenda-social' ? 'a gerar…' : '✶ gerar legendas (Instagram · TikTok · Stories)'}
          </button>
          {legendaSocial && (
            <pre className="bg-terra-2/40 rounded-[12px] p-4 border border-ocre/15 text-creme-2 text-sm whitespace-pre-wrap font-sans leading-relaxed select-all">{legendaSocial}</pre>
          )}
        </Field>

        <Field label="publicar">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={escrito.publicado} onChange={(e) => set('publicado', e.target.checked)} className="w-4 h-4 accent-ambar" />
            <span className="text-creme-2 text-sm">{escrito.publicado ? 'visível no site' : 'rascunho (não aparece)'}</span>
          </label>
        </Field>
      </div>
    </main>
  );
}

const inputCls = 'w-full bg-transparent border border-ocre/40 rounded-[12px] py-2.5 px-3.5 text-creme font-sans text-base outline-none placeholder:text-creme/30 focus:border-ambar transition-colors';
const btnSec = 'text-[0.78rem] tracking-[0.04em] lowercase border border-ocre/40 hover:border-ambar text-creme-2 rounded-[10px] px-3 py-2 disabled:opacity-50';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.72rem] tracking-[0.18em] uppercase text-ocre/80 mb-2">{label}</label>
      {children}
    </div>
  );
}
