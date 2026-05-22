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
    if (!confirm('Importar todos os .mdx para a base de dados? Vai fazer upsert (atualiza se ja existir).')) return;
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
            href="/admin/imagens"
            className="text-creme-2 border border-ocre/40 hover:border-ambar rounded-[12px] px-4 py-2 text-[0.8rem] tracking-[0.04em] lowercase no-underline"
            title="Galeria com drop-em-slot por escrito"
          >
            galeria
          </Link>
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
        <p className="text-ambar text-sm mb-6 font-serif italic">{mensagem}</p>
      )}

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
