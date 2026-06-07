'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { InfograficoSlide, type Infografico } from '@/components/admin/InfograficoSlide';
import { Btn, Card } from '@/components/admin/EstudioKit';
import { COLECOES, type ColecaoId } from '@/lib/colecoes';
import { PADROES_SUGERIDOS } from '@/lib/infografico/padroes';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'swap' });
const FONTS = `${cormorant.variable} ${inter.variable} ${jetmono.variable}`;

type Mundo = 'freeme' | 'infonte' | 'synchim' | 'escola' | 'autora';
type InfoSlide = Infografico & { tipo: string; imageUrl?: string };
type Item = {
  slug: string; title: string;
  dias: Array<{ dia: number; mundo?: Mundo; imagens?: string[]; slides?: InfoSlide[] }>;
  theme: { universo?: ColecaoId; mundo?: Mundo };
  created_at: string;
};

export default function InfograficoPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tema, setTema] = useState('');
  const [universo, setUniverso] = useState<ColecaoId>('freeme-mae');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [zoom, setZoom] = useState<{ info: Infografico; mundo: Mundo; imageUrl?: string } | null>(null);

  const carregar = useCallback(async () => {
    const r = await fetch('/api/admin/infografico/list');
    if (r.ok) setItens((await r.json()).infograficos ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function gerar() {
    if (!tema.trim()) { setErro('Escreve o padrão/tema.'); return; }
    setGerando(true); setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/infografico/gerar', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tema, universo }),
      });
      const j = await r.json();
      if (!r.ok) { setErro((j.erro ?? '') + (j.detalhe ? `: ${j.detalhe}` : '')); return; }
      setTema('');
      await carregar();
    } catch (e) { setErro(String(e)); }
    finally { setGerando(false); }
  }

  async function gerarImagem(slug: string) {
    setErro(null); setMsg(null);
    try {
      const r = await fetch('/api/admin/carrossel/render-dispatch', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j = await r.json();
      if (!r.ok) { setErro('imagem: ' + (j.erro ?? '')); return; }
      setMsg('Render da imagem disparado (~3 min). Recarrega depois para a descarregares.');
    } catch (e) { setErro(String(e)); }
  }

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${FONTS}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Infográficos de Padrão</h1>
          <Link href="/admin/carrossel" className="text-[0.7rem] opacity-60 hover:opacity-100">Carrosséis →</Link>
        </div>
        <p className="text-[0.8rem] opacity-65 mb-6">Uma imagem que explica um padrão e a sua limitação. Série à parte — geras quando quiseres.</p>

        <Card className="p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={tema} onChange={(e) => setTema(e.target.value)}
              placeholder="Padrão / tema (ex.: compensar a mais, agradar para pertencer)…"
              className="flex-1 bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem] outline-none focus:border-ambar"
            />
            <select value={universo} onChange={(e) => setUniverso(e.target.value as ColecaoId)} className="bg-black/30 border border-ocre/25 rounded-lg px-3 py-2 text-[0.85rem]">
              {COLECOES.map((c) => <option key={c.id} value={c.id} className="bg-[#0F0F1A]">{c.nome}</option>)}
            </select>
            <Btn variant="primary" onClick={gerar} disabled={gerando}>{gerando ? 'a gerar…' : 'gerar infográfico'}</Btn>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-[0.6rem] uppercase tracking-[0.15em] opacity-50 self-center mr-1">sugestões:</span>
            {(PADROES_SUGERIDOS[universo] ?? []).map((sug) => (
              <button key={sug} onClick={() => setTema(sug)} className="text-[0.68rem] px-2.5 py-1 rounded-full border border-ocre/25 text-creme-2/75 hover:border-ambar hover:text-ambar">{sug}</button>
            ))}
          </div>
          {erro && <p className="mt-3 text-[0.75rem] text-red-300">{erro}</p>}
          {msg && <p className="mt-3 text-[0.75rem] text-salvia">{msg}</p>}
        </Card>

        <div className="grid grid-cols-1 gap-8">
          {itens.map((it) => {
            const s = it.dias?.[0]?.slides?.[0];
            const img = it.dias?.[0]?.imagens?.[0];
            const mundo = it.dias?.[0]?.mundo ?? it.theme?.mundo ?? 'freeme';
            if (!s) return null;
            const info = { padrao: s.padrao, subtitulo: s.subtitulo, tipoDiagrama: s.tipoDiagrama, diagrama: s.diagrama, ciclo: s.ciclo, custoTi: s.custoTi, custoOutros: s.custoOutros, virada: s.virada, url: s.url };
            return (
              <Card key={it.slug} className="p-5">
                <h3 className="font-serif text-lg mb-4 text-center">{it.title}</h3>
                <button onClick={() => setZoom({ info, mundo, imageUrl: s.imageUrl })} className="block w-full max-w-[460px] mx-auto mb-4 cursor-zoom-in" title="ampliar">
                  <InfograficoSlide info={info} mundo={mundo} imageUrl={s.imageUrl} />
                </button>
                <div className="flex items-center gap-2 justify-center">
                  {img
                    ? <a href={img} download className="text-[0.72rem] px-3 py-1.5 rounded border border-salvia/40 bg-salvia/10 text-salvia">⬇ descarregar imagem</a>
                    : <Btn variant="default" onClick={() => gerarImagem(it.slug)}>gerar imagem (PNG)</Btn>}
                </div>
              </Card>
            );
          })}
        </div>

        {zoom && (
          <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out">
            <div className="w-full" style={{ maxWidth: 'min(88vw, 520px)' }} onClick={(e) => e.stopPropagation()}>
              <InfograficoSlide info={zoom.info} mundo={zoom.mundo} imageUrl={zoom.imageUrl} />
              <p className="text-center text-[0.7rem] opacity-60 mt-3">toca fora para fechar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
