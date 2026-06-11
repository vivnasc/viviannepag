'use client';

// Preview das SÉRIES DIÁRIAS (seteveus.space): VC Sabia + Hoje em Mim.
// Só o LOOK, ao vivo — para a Vivianne validar a moldura antes de ligar o
// upload do motion + render + publicação. Cola um URL de imagem (ou um frame
// do teu Midjourney) para veres a moldura sobre um fundo real.

import { useState } from 'react';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { SerieDiariaSlide, SERIES, type SerieId } from '@/components/admin/SerieDiariaSlide';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'block' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'block' });
const jetmono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetmono', display: 'block' });

const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

const EXEMPLOS: Record<SerieId, string> = {
  vcsabia: 'Uma planta não cresce mais depressa por receber mais água do que precisa. Tu também floresces melhor quando respeitas os teus limites.',
  hojeemmim: 'Hoje aprendi que o meu silêncio é, muitas vezes, a resposta mais honesta.',
};

export default function SeriesDiariaPreview() {
  const [serie, setSerie] = useState<SerieId>('hojeemmim');
  const [dia, setDia] = useState('quinta');
  const [frase, setFrase] = useState(EXEMPLOS.hojeemmim);
  const [bgUrl, setBgUrl] = useState('');

  const trocarSerie = (s: SerieId) => { setSerie(s); setFrase(EXEMPLOS[s]); };

  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-6 ${cormorant.variable} ${inter.variable} ${jetmono.variable}`}>
      <h1 className="text-2xl font-semibold">Séries diárias · preview</h1>
      <p className="text-[0.78rem] opacity-55 mt-1 mb-5">Só o look (a moldura). Valida o visual; o upload do motion + render + publicação ligam-se a seguir.</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* controlos */}
        <div className="space-y-4 order-2 lg:order-1">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Série</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(SERIES) as SerieId[]).map((s) => (
                <button key={s} onClick={() => trocarSerie(s)} className={`text-[0.8rem] px-3 py-1.5 rounded-lg border ${serie === s ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/25 text-creme-2/70 hover:border-ambar'}`}>{SERIES[s].nome} <span className="opacity-50">· {SERIES[s].momento}</span></button>
              ))}
            </div>
          </div>

          {serie === 'hojeemmim' && (
            <div>
              <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Dia da semana</p>
              <div className="flex gap-1.5 flex-wrap">
                {DIAS.map((d) => (
                  <button key={d} onClick={() => setDia(d)} className={`text-[0.72rem] px-2.5 py-1 rounded-full border ${dia === d ? 'border-ambar bg-ambar/15 text-ambar' : 'border-ocre/20 text-creme-2/60 hover:border-ambar'}`}>{d}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Frase</p>
            <textarea value={frase} onChange={(e) => setFrase(e.target.value)} rows={5} className="w-full text-[0.9rem] p-3 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2 leading-relaxed" />
          </div>

          <div>
            <p className="text-[0.7rem] uppercase tracking-wider opacity-50 mb-1.5">Fundo (URL de imagem, opcional)</p>
            <input value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="cola um frame do teu motion para veres sobre fundo real" className="w-full text-[0.8rem] px-3 py-2 rounded-lg border border-ocre/25 bg-[#15131f] text-creme-2" />
            <p className="text-[0.62rem] opacity-40 mt-1">No render real, o fundo é o teu vídeo de motion (Midjourney). Aqui é só para pré-visualizar.</p>
          </div>
        </div>

        {/* preview 9:16 */}
        <div className="order-1 lg:order-2">
          <div className="w-full max-w-[360px] mx-auto">
            <SerieDiariaSlide serie={serie} frase={frase} dia={dia} bgUrl={bgUrl || undefined} />
          </div>
          <p className="text-[0.62rem] opacity-45 text-center mt-2">9:16 · {SERIES[serie].nome}</p>
        </div>
      </div>
    </div>
  );
}
