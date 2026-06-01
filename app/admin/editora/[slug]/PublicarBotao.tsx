'use client';

import { useState } from 'react';

type Resultado = {
  ok?: boolean;
  erro?: string;
  ref?: string;
  render?: { ok: boolean; detalhe?: string };
  pdfUrl?: string;
  workflowUrl?: string;
};

export default function PublicarBotao({ slug, bloqueado }: { slug: string; bloqueado: boolean }) {
  const [estado, setEstado] = useState<'idle' | 'a-publicar' | 'feito' | 'erro'>('idle');
  const [res, setRes] = useState<Resultado | null>(null);

  async function publicar() {
    if (bloqueado && !confirm('Este livro tem erros de compliance. Publicar como rascunho e renderizar mesmo assim?')) return;
    setEstado('a-publicar');
    setRes(null);
    try {
      const r = await fetch('/api/admin/editora/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j: Resultado = await r.json();
      setRes(j);
      setEstado(r.ok ? 'feito' : 'erro');
    } catch (e) {
      setRes({ erro: String(e) });
      setEstado('erro');
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={publicar}
        disabled={estado === 'a-publicar'}
        className="bg-ouro text-terra-2 rounded-[12px] px-5 py-2 text-[0.82rem] font-medium hover:bg-ambar disabled:opacity-60"
        title="Cria o produto como rascunho e dispara o render editorial no GitHub Actions"
      >
        {estado === 'a-publicar' ? 'a publicar…' : '📖 publicar (rascunho + render)'}
      </button>

      {estado === 'feito' && res?.ok && (
        <div className="text-right text-[0.74rem] leading-relaxed max-w-[340px]">
          <p className="text-salvia">Produto criado como rascunho.</p>
          <p className={res.render?.ok ? 'text-salvia' : 'text-ambar/90'}>
            {res.render?.ok
              ? `Render disparado (ref ${res.ref}). PDF pronto em ~3min.`
              : `Render não disparou: ${res.render?.detalhe ?? 'sem detalhe'}`}
          </p>
          <p className="text-creme-2/60 mt-1">
            Marca <span className="text-ocre">publicado</span> em /admin/produtos para aparecer na loja.
          </p>
          {res.workflowUrl && (
            <a href={res.workflowUrl} target="_blank" rel="noreferrer" className="text-ocre hover:text-ambar no-underline">
              ver workflow ↗
            </a>
          )}
        </div>
      )}

      {estado === 'erro' && (
        <p className="text-rosa/80 text-[0.74rem] max-w-[340px] text-right">
          Erro: {res?.erro ?? res?.render?.detalhe ?? 'falha'}
        </p>
      )}
    </div>
  );
}
