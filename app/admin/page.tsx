'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Escrito = {
  id: string;
  slug: string;
  locale: string;
  titulo: string;
  resumo: string;
  tematica: string | null;
  data: string;
  publicado: boolean;
  updated_at: string;
};

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState<'idle' | 'login' | 'erro'>('idle');
  const [escritos, setEscritos] = useState<Escrito[]>([]);
  const [migrando, setMigrando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [sugerindo, setSugerindo] = useState(false);
  const [sugestoes, setSugestoes] = useState<string | null>(null);
  const [traduzindo, setTraduzindo] = useState(false);
  const [corrigindoDatas, setCorrigindoDatas] = useState(false);
  const [carregandoCapas, setCarregandoCapas] = useState(false);
  const [ligandoCapas, setLigandoCapas] = useState(false);
  const [diagnosticando, setDiagnosticando] = useState(false);
  const [separando, setSeparando] = useState(false);
  const [removendoTravessoes, setRemovendoTravessoes] = useState(false);

  async function carregar() {
    const res = await fetch('/api/admin/escritos');
    if (res.status === 401) {
      setAutenticado(false);
      return;
    }
    const json = await res.json();
    setEscritos(json.escritos ?? []);
    setAutenticado(true);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setEstado('login');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword('');
      setEstado('idle');
      carregar();
    } else {
      setEstado('erro');
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAutenticado(false);
    setEscritos([]);
  }

  async function migrar() {
    if (!confirm('Importar novos .mdx para a base de dados? Só adiciona escritos que ainda não existem. Nunca mexe nos que já lá estão.')) return;
    setMigrando(true);
    setMensagem(null);
    const res = await fetch('/api/admin/migrar', { method: 'POST' });
    const json = await res.json();
    setMigrando(false);
    if (res.ok) {
      setMensagem(`Importados: ${json.importados.length}. Ignorados: ${json.ignorados.length}.`);
      carregar();
    } else {
      setMensagem(`Erro: ${json.erro}`);
    }
  }

  async function ligarCapas() {
    setLigandoCapas(true);
    setMensagem(null);
    const res = await fetch('/api/admin/ligar-capas', { method: 'POST' });
    const json = await res.json();
    setLigandoCapas(false);
    setMensagem(res.ok ? `${json.ligados}/${json.total} capas ligadas.\n${(json.detalhes ?? []).join('\n')}` : `Erro: ${json.erro}`);
    carregar();
  }

  async function carregarCapas() {
    if (!confirm('Carregar capas do repo (ESCRITOS-CAPAS/) para os escritos? Atribui automaticamente pelo nome do ficheiro.')) return;
    setCarregandoCapas(true);
    setMensagem(null);
    const res = await fetch('/api/admin/carregar-capas', { method: 'POST' });
    const json = await res.json();
    setCarregandoCapas(false);
    if (res.ok) {
      const falhouTxt = json.falhou?.length ? `\nFalharam: ${json.falhou.map((f: {ficheiro: string; erro?: string}) => `${f.ficheiro} (${f.erro})`).join(', ')}` : '';
      setMensagem(`${json.sucesso}/${json.total} capas carregadas.${falhouTxt}`);
    } else {
      setMensagem(`Erro: ${json.erro}`);
    }
  }

  async function diagnosticar() {
    setDiagnosticando(true);
    setMensagem(null);
    const res = await fetch('/api/admin/diagnostico-capas');
    const json = await res.json();
    setDiagnosticando(false);
    setMensagem(JSON.stringify(json, null, 2));
  }

  async function removerTravessoes() {
    setRemovendoTravessoes(true);
    setMensagem(null);
    const res = await fetch('/api/admin/remover-travessoes', { method: 'POST' });
    const json = await res.json();
    setRemovendoTravessoes(false);
    setMensagem(res.ok ? `${json.alterados}/${json.total} escritos limpos.\n${(json.detalhes ?? []).join('\n')}` : `Erro: ${json.erro}`);
    carregar();
  }

  async function separarCapasPublicas() {
    if (!confirm('Cria bucket público "capas" e copia para lá todas as imagens de capa do bucket "escritos" (que se mantém privado para os ebooks).')) return;
    setSeparando(true);
    setMensagem(null);
    const res = await fetch('/api/admin/separar-capas-publicas', { method: 'POST' });
    const json = await res.json();
    setSeparando(false);
    setMensagem(JSON.stringify(json, null, 2));
    carregar();
  }

  async function corrigirDatas() {
    setCorrigindoDatas(true);
    setMensagem(null);
    const res = await fetch('/api/admin/corrigir-datas', { method: 'POST' });
    const json = await res.json();
    setCorrigindoDatas(false);
    setMensagem(res.ok ? `${json.corrigidos} datas corrigidas.` : `Erro: ${json.erro}`);
    carregar();
  }

  async function traduzirTodos() {
    if (!confirm('Traduzir todos os escritos PT que não têm versão EN? Usa a Claude API (pode demorar 2-3 minutos).')) return;
    setTraduzindo(true);
    setMensagem(null);
    const res = await fetch('/api/admin/traduzir-todos', { method: 'POST' });
    const json = await res.json();
    setTraduzindo(false);
    if (res.ok) {
      setMensagem(`Traduzidos: ${json.traduzidos}/${json.total}.${json.erros ? ' Erros: ' + json.erros.join(', ') : ''}`);
      carregar();
    } else {
      setMensagem(`Erro: ${json.erro}`);
    }
  }

  async function sugerirTemas() {
    setSugerindo(true);
    setSugestoes(null);
    const resumo = escritos.map((e) => `[${e.tematica ?? '?'}] "${e.titulo}"`).join('\n');
    const res = await fetch('/api/admin/gerar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ modo: 'sugerir-temas', escritosExistentes: resumo }),
    });
    const json = await res.json();
    setSugerindo(false);
    if (res.ok) {
      setSugestoes(json.texto);
    } else {
      setSugestoes(`Erro: ${json.erro}`);
    }
  }

  async function apagar(id: string, titulo: string) {
    if (!confirm(`Apagar "${titulo}"? Esta accao nao se desfaz.`)) return;
    const res = await fetch(`/api/admin/escritos/${id}`, { method: 'DELETE' });
    if (res.ok) carregar();
  }

  if (autenticado === null) {
    return <div className="min-h-screen flex items-center justify-center text-creme-2/60 text-sm">a carregar…</div>;
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen flex items-center justify-center px-7">
        <form onSubmit={login} className="max-w-[360px] w-full text-center">
          <p className="text-[0.72rem] tracking-[0.32em] uppercase text-ocre mb-6">admin</p>
          <h1 className="font-serif font-light text-creme text-3xl mb-8">entrar</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoFocus
            className="w-full bg-transparent border border-ocre/45 rounded-[14px] py-3.5 px-4.5 text-creme font-sans text-base outline-none placeholder:text-creme/40 placeholder:italic focus:border-ambar transition-colors mb-4"
          />
          <button
            type="submit"
            disabled={estado === 'login'}
            className="w-full bg-ocre text-terra border border-ocre rounded-[14px] py-3.5 px-5 font-sans text-[0.92rem] tracking-[0.04em] lowercase hover:bg-ambar transition-colors disabled:opacity-70"
          >
            entrar
          </button>
          {estado === 'erro' && (
            <p className="text-rosa font-serif italic text-sm mt-4">password incorrecta</p>
          )}
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-[960px] mx-auto px-7 py-12">
      <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">admin</p>
          <h1 className="font-serif font-light text-creme text-3xl">escritos</h1>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href="/admin/capas"
            className="bg-ambar text-terra rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:bg-ocre no-underline inline-block"
          >
            auditoria de capas
          </Link>
          <button
            onClick={removerTravessoes}
            disabled={removendoTravessoes}
            className="border border-ocre/45 text-creme-2 rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:border-ambar hover:text-ambar disabled:opacity-70"
          >
            {removendoTravessoes ? 'a limpar…' : 'remover travessões'}
          </button>
          <button
            onClick={separarCapasPublicas}
            disabled={separando}
            className="border border-ocre/45 text-creme-2 rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:border-ambar hover:text-ambar disabled:opacity-70"
          >
            {separando ? 'a separar…' : 'separar capas (re-correr)'}
          </button>
          <button
            onClick={diagnosticar}
            disabled={diagnosticando}
            className="border border-ocre/45 text-creme-2 rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:border-ambar hover:text-ambar disabled:opacity-70"
          >
            {diagnosticando ? 'a diagnosticar…' : 'diagnóstico capas'}
          </button>
          <button
            onClick={ligarCapas}
            disabled={ligandoCapas}
            className="bg-ocre text-terra rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:bg-ambar disabled:opacity-70"
          >
            {ligandoCapas ? 'a ligar…' : 'ligar capas ao storage'}
          </button>
          <button
            onClick={carregarCapas}
            disabled={carregandoCapas}
            className="bg-ambar text-terra rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:bg-ocre disabled:opacity-70"
          >
            {carregandoCapas ? 'a carregar capas…' : 'carregar capas do repo'}
          </button>
          <button
            onClick={corrigirDatas}
            disabled={corrigindoDatas}
            className="text-rosa border border-rosa/40 hover:border-rosa rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase disabled:opacity-70"
          >
            {corrigindoDatas ? 'a corrigir…' : 'corrigir datas'}
          </button>
          <button
            onClick={traduzirTodos}
            disabled={traduzindo}
            className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase disabled:opacity-70"
          >
            {traduzindo ? 'a traduzir…' : 'traduzir todos EN'}
          </button>
          <button
            onClick={migrar}
            disabled={migrando}
            className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase disabled:opacity-70"
            title="Carrega para a BD os .mdx do repo (idempotente, upsert)"
          >
            {migrando ? 'a importar…' : 'importar .mdx'}
          </button>
          <Link
            href="/admin/novo"
            className="bg-ocre text-terra rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase hover:bg-ambar transition-colors no-underline"
          >
            + novo escrito
          </Link>
          <button onClick={logout} className="text-creme-2/60 text-[0.75rem] hover:text-creme">
            sair
          </button>
        </div>
      </header>

      {mensagem && (
        <pre className="text-ambar text-xs mb-6 font-mono whitespace-pre-wrap break-all bg-terra/40 border border-ocre/25 rounded-[10px] p-4 max-h-[50vh] overflow-auto">{mensagem}</pre>
      )}

      {escritos.length > 0 && (() => {
        const porTematica: Record<string, number> = {};
        const semCapa: string[] = [];
        let publicados = 0;
        let rascunhos = 0;
        for (const e of escritos) {
          const t = e.tematica ?? 'sem-tematica';
          porTematica[t] = (porTematica[t] ?? 0) + 1;
          if (!e.publicado) rascunhos++; else publicados++;
          if (!(e as Record<string, unknown>).capa) semCapa.push(e.titulo);
        }
        return (
          <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
              <p className="text-ambar text-2xl font-serif">{escritos.length}</p>
              <p className="text-[0.7rem] tracking-[0.14em] uppercase text-creme-2/70">total</p>
            </div>
            <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
              <p className="text-ambar text-2xl font-serif">{publicados}</p>
              <p className="text-[0.7rem] tracking-[0.14em] uppercase text-creme-2/70">publicados</p>
            </div>
            <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
              <p className="text-ambar text-2xl font-serif">{rascunhos}</p>
              <p className="text-[0.7rem] tracking-[0.14em] uppercase text-creme-2/70">rascunhos</p>
            </div>
            <div className="border border-ocre/20 rounded-[14px] p-4 text-center">
              <p className="text-ambar text-2xl font-serif">{semCapa.length}</p>
              <p className="text-[0.7rem] tracking-[0.14em] uppercase text-creme-2/70">sem capa</p>
            </div>
            {Object.entries(porTematica).sort().map(([t, n]) => (
              <div key={t} className="border border-ocre/15 rounded-[12px] p-3 text-center">
                <p className="text-creme text-lg font-serif">{n}</p>
                <p className="text-[0.66rem] tracking-[0.14em] uppercase text-ocre/70">{t}</p>
              </div>
            ))}
            <div className="col-span-full mt-2">
              <button
                onClick={sugerirTemas}
                disabled={sugerindo}
                className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase disabled:opacity-70"
              >
                {sugerindo ? 'Claude a pensar…' : '✶ sugerir próximos temas'}
              </button>
              {sugestoes && (
                <pre className="mt-4 bg-terra-2/40 rounded-[12px] p-4 border border-ocre/15 text-creme-2 text-sm whitespace-pre-wrap font-sans leading-relaxed">{sugestoes}</pre>
              )}
            </div>
          </div>
        );
      })()}

      {escritos.length === 0 ? (
        <p className="text-creme-2/70 italic font-serif">Sem escritos. Clica em "importar .mdx" para carregar os existentes, ou cria um novo.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[0.7rem] tracking-[0.18em] uppercase text-ocre/70 border-b border-ocre/20">
              <th className="py-3">título</th>
              <th className="py-3">temática</th>
              <th className="py-3">data</th>
              <th className="py-3">loc</th>
              <th className="py-3">estado</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {escritos.map((e) => (
              <tr key={e.id} className="border-b border-ocre/10 hover:bg-terra-2/50 transition-colors">
                <td className="py-4">
                  <Link href={`/admin/${e.id}`} className="text-creme hover:text-ambar transition-colors font-serif text-[1.02rem] no-underline">
                    {e.titulo}
                  </Link>
                  <p className="text-creme-2/60 text-[0.78rem] mt-1">{e.slug}</p>
                </td>
                <td className="py-4 text-creme-2/80 text-[0.85rem]">{e.tematica ?? '—'}</td>
                <td className="py-4 text-creme-2/80 text-[0.85rem]">{e.data}</td>
                <td className="py-4 text-creme-2/80 text-[0.85rem] uppercase">{e.locale}</td>
                <td className="py-4">
                  <span className={`text-[0.7rem] tracking-[0.12em] uppercase px-2 py-1 rounded-md ${e.publicado ? 'text-ambar border border-ambar/40' : 'text-creme-2/60 border border-creme-2/20'}`}>
                    {e.publicado ? 'publicado' : 'rascunho'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button onClick={() => apagar(e.id, e.titulo)} className="text-rosa/60 hover:text-rosa text-[0.78rem] tracking-[0.04em]">
                    apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
