'use client';

import { useState } from 'react';

type Mov = 'ver' | 'vir' | 'viver';
type Frase = { mov: Mov; pt: string; en: string };

// 3 por movimento, intercaladas.
const FRASES: Frase[] = [
  { mov: 'ver', pt: 'A minha cabeça não desliga, sobretudo à noite.', en: 'My mind will not switch off, especially at night.' },
  { mov: 'vir', pt: 'Esgoto-me a cuidar de todos, e descansar dá-me culpa.', en: 'I exhaust myself caring for everyone, and rest gives me guilt.' },
  { mov: 'viver', pt: 'Vivo à espera de um "quando" para ser, enfim, feliz.', en: 'I live waiting for a "when" to finally be happy.' },
  { mov: 'ver', pt: 'Vivo a remoer o passado ou a ensaiar o futuro, raramente no agora.', en: 'I relive the past or rehearse the future, rarely here now.' },
  { mov: 'vir', pt: 'Carrego mais do que devia, e custa-me pedir ou receber.', en: 'I carry more than I should, and it is hard to ask or receive.' },
  { mov: 'viver', pt: 'Mudar de vida, de papel ou de ideias parece trair-me.', en: 'Changing my life, my role or my mind feels like betrayal.' },
  { mov: 'ver', pt: 'Reajo a coisas de hoje com uma intensidade que vem de outro tempo.', en: 'I react to today with an intensity that belongs to another time.' },
  { mov: 'vir', pt: 'Encho o silêncio (televisão, telemóvel, tarefas) para não sentir o vazio.', en: 'I fill the silence (TV, phone, tasks) so as not to feel the emptiness.' },
  { mov: 'viver', pt: 'Agarro-me a quem fui; tenho medo de não saber quem sou sem isso.', en: 'I cling to who I was; I fear not knowing who I am without it.' },
];

const RES: Record<Mov, { slug: string; marca: string; pt: string; en: string }> = {
  ver: { slug: 'ver-soltar', marca: 'ver.soltar', pt: 'A tua cabeça anda à frente de ti. Antes de mudares seja o que for, o passo é sair de dentro da tempestade e vê-la passar de terra. Começa por aqui.', en: 'Your head runs ahead of you. Before changing anything, the step is to step out of the storm and watch it pass from solid ground. Begin here.' },
  vir: { slug: 'vir-soltar', marca: 'vir.soltar', pt: 'Andas a segurar tudo e a encher o silêncio. O passo é parar de empurrar e regressar a ti, deixar-te, enfim, ser segurada. Começa por aqui.', en: 'You hold everything and fill the silence. The step is to stop pushing and return to yourself, to let yourself be held at last. Begin here.' },
  viver: { slug: 'viver-soltar', marca: 'viver.soltar', pt: 'Vives à espera, presa a quem já foste. O passo é tirar a armadura e entrar na tua vida, agora. Começa por aqui.', en: 'You live waiting, clinging to who you were. The step is to take off the armour and enter your life, now. Begin here.' },
};

export function DiagnosticoQuiz({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  const [sel, setSel] = useState<boolean[]>(() => FRASES.map(() => false));
  const [res, setRes] = useState<Mov | null>(null);

  function toggle(i: number) {
    setSel((s) => s.map((v, j) => (j === i ? !v : v)));
  }
  function calcular() {
    const c: Record<Mov, number> = { ver: 0, vir: 0, viver: 0 };
    FRASES.forEach((f, i) => { if (sel[i]) c[f.mov]++; });
    const ordem: Mov[] = ['ver', 'vir', 'viver']; // desempate: ver
    let melhor: Mov = 'ver'; let max = -1;
    for (const m of ordem) { if (c[m] > max) { max = c[m]; melhor = m; } }
    setRes(melhor);
  }

  const base = isEn ? '/en' : '';

  return (
    <div className="max-w-[640px] mx-auto">
      {!res ? (
        <>
          <p className="text-center text-creme-2/80 font-serif text-[1.05rem] mb-8">
            {isEn ? 'Tick the ones you recognise in yourself.' : 'Marca as que reconheces em ti.'}
          </p>
          <ul className="space-y-3">
            {FRASES.map((f, i) => (
              <li key={i}>
                <button
                  onClick={() => toggle(i)}
                  className={`w-full text-left font-serif text-[1.02rem] leading-snug rounded-[12px] border px-5 py-4 transition-colors ${sel[i] ? 'border-ambar bg-ambar/10 text-creme' : 'border-ocre/20 text-creme-2/85 hover:border-ocre/50'}`}
                >
                  <span className={`mr-3 ${sel[i] ? 'text-ambar' : 'text-ocre/40'}`}>{sel[i] ? '●' : '○'}</span>
                  {isEn ? f.en : f.pt}
                </button>
              </li>
            ))}
          </ul>
          <div className="text-center mt-9">
            <button
              onClick={calcular}
              className="inline-block bg-ambar text-[#2A1C12] rounded-full px-8 py-3 text-[0.95rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors"
            >
              {isEn ? 'See my movement' : 'Ver o meu movimento'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-3">
            {isEn ? 'Your first movement' : 'O teu primeiro movimento'}
          </p>
          <h2 className="font-serif font-light text-creme text-[clamp(2rem,7vw,3rem)] mb-5">{RES[res].marca}</h2>
          <p className="font-serif text-creme-2/85 text-[1.08rem] leading-[1.8] max-w-[520px] mx-auto mb-8">
            {isEn ? RES[res].en : RES[res].pt}
          </p>
          <a href={`${base}/${RES[res].slug}`} className="inline-block bg-ambar text-[#2A1C12] rounded-full px-8 py-3 text-[0.95rem] font-sans tracking-[0.02em] hover:bg-ocre transition-colors no-underline">
            {isEn ? `Open ${RES[res].marca}` : `Abrir ${RES[res].marca}`}
          </a>
          <p className="mt-6 text-creme-2/55 text-[0.88rem] font-serif">
            {isEn
              ? <>Want the whole map? <a href={`${base}/os-sete-veus`} className="text-ambar no-underline border-b border-ambar/40">The Seven Veils</a>.</>
              : <>Queres o mapa inteiro? <a href={`${base}/os-sete-veus`} className="text-ambar no-underline border-b border-ambar/40">Os Sete Véus</a>.</>}
          </p>
          <button onClick={() => { setRes(null); setSel(FRASES.map(() => false)); }} className="block mx-auto mt-6 text-creme-2/50 text-[0.82rem] underline">
            {isEn ? 'redo' : 'refazer'}
          </button>
        </div>
      )}
    </div>
  );
}
