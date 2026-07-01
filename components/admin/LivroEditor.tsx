'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Unidade = {
  id: string;
  tipo: string;
  kicker: string;
  titulo: string;
  epigrafe: string | null;
  texto: string[];
  textoOriginal: string[];
  comentario: string;
  editado: boolean;
};

function Cresce({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      rows={1}
    />
  );
}

export function LivroEditor() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);

  // estado da assistência por parágrafo (índice -> {comentario, aPedir, sugestao})
  const [assist, setAssist] = useState<Record<number, { comentario: string; aberto: boolean; aPedir: boolean; sugestao: string | null }>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/livro-transicao/conteudo');
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || `erro ${res.status}`);
        setUnidades(json.unidades);
        setSelId(json.unidades[0]?.id ?? null);
      } catch (e) {
        setErro(e instanceof Error ? e.message : String(e));
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const sel = useMemo(() => unidades.find((u) => u.id === selId) ?? null, [unidades, selId]);

  function patchSel(patch: Partial<Unidade>) {
    setUnidades((us) => us.map((u) => (u.id === selId ? { ...u, ...patch } : u)));
  }
  function setParagrafo(i: number, v: string) {
    if (!sel) return;
    const t = sel.texto.slice();
    t[i] = v;
    patchSel({ texto: t });
  }
  function apagarParagrafo(i: number) {
    if (!sel) return;
    patchSel({ texto: sel.texto.filter((_, k) => k !== i) });
  }
  function adicionarParagrafo() {
    if (!sel) return;
    patchSel({ texto: [...sel.texto, ''] });
  }

  function trocarUnidade(id: string) {
    setSelId(id);
    setAssist({});
    setAviso(null);
    setErro(null);
  }

  async function pedirClaude(i: number) {
    if (!sel) return;
    const a = assist[i];
    if (!a?.comentario?.trim()) return;
    setAssist((s) => ({ ...s, [i]: { ...s[i], aPedir: true, sugestao: null } }));
    setErro(null);
    try {
      const res = await fetch('/api/admin/livro-transicao/assistir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: sel.titulo, passagem: sel.texto[i], comentario: a.comentario }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detalhe || json.erro || `erro ${res.status}`);
      setAssist((s) => ({ ...s, [i]: { ...s[i], aPedir: false, sugestao: json.sugestao } }));
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
      setAssist((s) => ({ ...s, [i]: { ...s[i], aPedir: false } }));
    }
  }
  function aceitarSugestao(i: number) {
    const a = assist[i];
    if (!a?.sugestao) return;
    setParagrafo(i, a.sugestao);
    setAssist((s) => ({ ...s, [i]: { comentario: '', aberto: false, aPedir: false, sugestao: null } }));
  }

  async function guardar() {
    if (!sel) return;
    setAGuardar(true);
    setErro(null);
    setAviso(null);
    try {
      const res = await fetch('/api/admin/livro-transicao/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sel.id, texto: sel.texto, comentario: sel.comentario }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detalhe || json.erro || `erro ${res.status}`);
      patchSel({ editado: true });
      setAviso('Guardado.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setAGuardar(false);
    }
  }

  function reporOriginal() {
    if (!sel) return;
    patchSel({ texto: sel.textoOriginal.slice() });
    setAssist({});
  }

  if (carregando) return <p className="text-creme/50 text-sm">a carregar o livro…</p>;
  if (erro && !unidades.length) return <p className="text-red-300 text-sm">erro: {erro}</p>;

  const ta = 'w-full bg-transparent text-creme/90 font-serif text-[1.02rem] leading-relaxed resize-none outline-none border border-transparent focus:border-ocre/40 rounded px-3 py-2';

  return (
    <div className="grid grid-cols-[240px_1fr] gap-7">
      {/* índice */}
      <nav className="sticky top-6 self-start max-h-[80vh] overflow-auto pr-2 space-y-0.5">
        {unidades.map((u) => (
          <button
            key={u.id}
            onClick={() => trocarUnidade(u.id)}
            className={`block w-full text-left px-3 py-2 rounded text-[0.82rem] leading-tight transition ${
              u.id === selId ? 'bg-ocre/15 text-creme' : 'text-creme/55 hover:bg-white/5'
            }`}
          >
            <span className="block text-[0.62rem] tracking-[0.18em] uppercase text-ocre/70">{u.kicker}</span>
            <span className="block">{u.titulo || '—'}</span>
            {u.editado && <span className="text-[0.6rem] text-ocre/80">editado ✦</span>}
          </button>
        ))}
      </nav>

      {/* editor */}
      <section className="min-w-0">
        {sel && (
          <>
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <p className="text-[0.66rem] tracking-[0.3em] uppercase text-ocre">{sel.kicker}</p>
              <div className="flex items-center gap-3 text-[0.72rem]">
                <button onClick={reporOriginal} className="text-creme/45 hover:text-creme/80">repor original</button>
                <button
                  onClick={guardar}
                  disabled={aGuardar}
                  className="px-3 py-1.5 rounded bg-ocre/85 text-[#1a160f] font-medium disabled:opacity-50"
                >
                  {aGuardar ? 'a guardar…' : 'guardar capítulo'}
                </button>
              </div>
            </div>
            <h2 className="font-serif font-light text-creme text-2xl mb-2">{sel.titulo}</h2>
            {sel.epigrafe && <p className="font-serif italic text-creme/55 text-sm mb-6">{sel.epigrafe}</p>}

            {(aviso || erro) && (
              <p className={`text-xs mb-4 ${erro ? 'text-red-300' : 'text-ocre'}`}>{erro || aviso}</p>
            )}

            <div className="space-y-2">
              {sel.texto.map((p, i) => {
                const a = assist[i] ?? { comentario: '', aberto: false, aPedir: false, sugestao: null };
                return (
                  <div key={i} className="group rounded-lg hover:bg-white/[0.03] -mx-2 px-2 py-1">
                    <Cresce value={p} onChange={(v) => setParagrafo(i, v)} className={ta} />
                    <div className="flex items-center gap-3 px-3 mt-0.5 opacity-0 group-hover:opacity-100 transition text-[0.7rem]">
                      <button
                        onClick={() => setAssist((s) => ({ ...s, [i]: { ...a, aberto: !a.aberto } }))}
                        className="text-ocre/80 hover:text-ocre"
                      >
                        {a.aberto ? 'fechar' : '✎ pedir à Claude'}
                      </button>
                      <button onClick={() => apagarParagrafo(i)} className="text-creme/30 hover:text-red-300">
                        apagar §
                      </button>
                    </div>

                    {a.aberto && (
                      <div className="mt-2 ml-3 border-l border-ocre/30 pl-3 space-y-2">
                        <textarea
                          value={a.comentario}
                          onChange={(e) => setAssist((s) => ({ ...s, [i]: { ...a, comentario: e.target.value } }))}
                          placeholder="o que queres mudar neste parágrafo? (ex.: mais seco; tira a repetição; dá mais força ao fim)"
                          rows={2}
                          className="w-full bg-white/5 text-creme/85 text-[0.82rem] rounded px-3 py-2 outline-none border border-white/10 focus:border-ocre/40"
                        />
                        <button
                          onClick={() => pedirClaude(i)}
                          disabled={a.aPedir || !a.comentario.trim()}
                          className="px-3 py-1 rounded bg-ocre/80 text-[#1a160f] text-[0.72rem] font-medium disabled:opacity-40"
                        >
                          {a.aPedir ? 'a pensar…' : 'pedir reescrita'}
                        </button>
                        {a.sugestao && (
                          <div className="rounded bg-ocre/[0.07] border border-ocre/25 p-3">
                            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ocre/80 mb-1">sugestão</p>
                            <p className="font-serif text-creme/90 text-[0.98rem] leading-relaxed mb-3">{a.sugestao}</p>
                            <div className="flex gap-3 text-[0.72rem]">
                              <button onClick={() => aceitarSugestao(i)} className="px-3 py-1 rounded bg-ocre/85 text-[#1a160f] font-medium">
                                aceitar
                              </button>
                              <button
                                onClick={() => setAssist((s) => ({ ...s, [i]: { ...a, sugestao: null } }))}
                                className="text-creme/45 hover:text-creme/80"
                              >
                                descartar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={adicionarParagrafo} className="mt-3 text-[0.72rem] text-creme/40 hover:text-creme/80">
              + parágrafo
            </button>

            <div className="mt-8 border-t border-white/10 pt-4">
              <p className="text-[0.62rem] tracking-[0.2em] uppercase text-creme/40 mb-1">nota do capítulo (só para ti)</p>
              <textarea
                value={sel.comentario}
                onChange={(e) => patchSel({ comentario: e.target.value })}
                rows={2}
                placeholder="lembretes, dúvidas, o que falta…"
                className="w-full bg-white/5 text-creme/75 text-[0.82rem] rounded px-3 py-2 outline-none border border-white/10 focus:border-ocre/40"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
