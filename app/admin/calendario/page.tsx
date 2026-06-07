'use client';

import Link from 'next/link';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-inter', display: 'swap' });

// Calendário fixo da conta didática "Véu a Véu". Mostra O QUE publicar,
// EM QUE DIA e com QUE FREQUÊNCIA — ligado aos geradores do admin.

type Dia = { dia: string; emoji: string; titulo: string; nota: string; href: string; cta: string; descanso?: boolean };
const SEMANA: Dia[] = [
  { dia: '2ª feira', emoji: '✨', titulo: 'Frase com motion', nota: 'O que mais rende views. Imagem + frase curta (typewriter).', href: '/admin/reels', cta: 'gerar nos reels' },
  { dia: '3ª feira', emoji: '🔎', titulo: 'Sinais de que…', nota: 'Reel muito partilhável (parentificação, lealdades, burnout…).', href: '/admin/reels', cta: 'gerar nos reels' },
  { dia: '4ª feira', emoji: '🎭', titulo: 'Cá em Casa', nota: 'A banda desenhada da família. A tua assinatura — ninguém tem.', href: '/admin/banda', cta: 'gerar conto' },
  { dia: '5ª feira', emoji: '📖', titulo: 'Glossário da Alma / Uma ideia de…', nota: 'Reel: um termo (sombra, ego…) OU uma ideia (Jung, Frankl…). Vão alternando.', href: '/admin/reels', cta: 'gerar nos reels' },
  { dia: '6ª feira', emoji: '💡', titulo: 'O que ninguém te explica', nota: 'Reel de perspetiva — gera curiosidade e partilhas.', href: '/admin/reels', cta: 'gerar nos reels' },
  { dia: 'sábado', emoji: '📊', titulo: 'Infográfico profundo', nota: 'Constrói autoridade. (Ou outra Frase com motion, se preferires leve.)', href: '/admin/infografico', cta: 'gerar infográfico' },
  { dia: 'domingo', emoji: '🌙', titulo: 'Descanso (só stories)', nota: 'Descansa. Se te apetecer, uma Pergunta leve para gerar comentários.', href: '/admin/reels', cta: 'gerar uma Pergunta', descanso: true },
];

type Tipo = { emoji: string; nome: string; oque: string; freq: string; href: string };
const TIPOS: Tipo[] = [
  { emoji: '✨', nome: 'Frase com motion', oque: 'Imagem transcendente + frase curta animada (typewriter). O reel que mais rende.', freq: '1 a 2× / semana', href: '/admin/reels' },
  { emoji: '🔎', nome: 'Sinais de que…', oque: 'Reel com sinais de um padrão. Muito partilhável.', freq: '1× / semana', href: '/admin/reels' },
  { emoji: '💡', nome: 'O que ninguém te explica', oque: 'Reel com uma perspetiva psicológica/sistémica.', freq: '1× / semana', href: '/admin/reels' },
  { emoji: '📖', nome: 'Glossário da Alma', oque: 'Reel que explica um termo (sombra, ego, individuação…).', freq: 'alterna 5ª', href: '/admin/reels' },
  { emoji: '🕯️', nome: 'Uma ideia de…', oque: 'Reel com uma ideia de Jung, Frankl, Hellinger, Rumi…', freq: 'alterna 5ª', href: '/admin/reels' },
  { emoji: '💬', nome: 'Pergunta', oque: 'Reel/post que convida a comentar. Comentários = alcance.', freq: 'opcional (dom)', href: '/admin/reels' },
  { emoji: '🎭', nome: 'Cá em Casa', oque: 'Banda desenhada da família sobre limites no dia a dia.', freq: '1× / semana', href: '/admin/banda' },
  { emoji: '📊', nome: 'Infográfico', oque: 'Imagem didática que explica um conceito a fundo. Autoridade.', freq: '1× / semana', href: '/admin/infografico' },
  { emoji: '📱', nome: 'Stories', oque: 'Pergunta, republicar o post do dia, bastidores leves (livros, anotações — sem cara).', freq: 'todos os dias', href: '/admin/reels' },
];

export default function CalendarioPage() {
  return (
    <div className={`min-h-screen bg-[#0F0F1A] text-[#F2E8DC] p-4 sm:p-8 ${cormorant.variable} ${inter.variable}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">Calendário · Véu a Véu</h1>
          <Link href="/admin/reels" className="text-[0.7rem] opacity-60 hover:opacity-100">Reels →</Link>
        </div>
        <p className="text-[0.85rem] opacity-70 mb-1"><b>1 publicação principal por dia + stories.</b> Conta nova: <i>consistência &gt; volume</i>.</p>
        <p className="text-[0.78rem] opacity-55 mb-6">Hora: sempre a mesma — <b>~13h</b> ou <b>20h–21h</b> (pico). Stories: 1 de manhã (~9h) + 1 à noite (~21h).</p>

        {/* A semana */}
        <h2 className="text-[0.65rem] uppercase tracking-[0.25em] text-[#C9B6FA] mb-3">A tua semana</h2>
        <div className="space-y-2 mb-10">
          {SEMANA.map((d) => (
            <div key={d.dia} className={`flex items-center gap-4 rounded-xl border p-3.5 ${d.descanso ? 'border-white/8 bg-white/[0.02]' : 'border-ocre/12 bg-terra/20'}`}>
              <div className="w-20 shrink-0 text-[0.72rem] uppercase tracking-wide opacity-60">{d.dia}</div>
              <div className="text-2xl shrink-0">{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[1.05rem] leading-tight">{d.titulo}</p>
                <p className="text-[0.72rem] opacity-55 leading-snug">{d.nota}</p>
              </div>
              <Link href={d.href} className="shrink-0 text-[0.66rem] px-3 py-1.5 rounded-full border border-ambar/40 text-ambar hover:bg-ambar/10 no-underline">{d.cta} →</Link>
            </div>
          ))}
        </div>

        {/* Tipos + frequência */}
        <h2 className="text-[0.65rem] uppercase tracking-[0.25em] text-[#C9B6FA] mb-3">Os teus tipos de post e a frequência</h2>
        <div className="rounded-xl border border-ocre/12 overflow-hidden mb-10">
          {TIPOS.map((t, i) => (
            <Link key={t.nome} href={t.href} className={`flex items-center gap-3 p-3 no-underline text-[#F2E8DC] hover:bg-terra-2/30 ${i % 2 ? 'bg-white/[0.015]' : ''}`}>
              <div className="text-xl shrink-0 w-7 text-center">{t.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-medium leading-tight">{t.nome}</p>
                <p className="text-[0.72rem] opacity-55 leading-snug">{t.oque}</p>
              </div>
              <div className="shrink-0 text-[0.68rem] px-2.5 py-1 rounded-full bg-[#C9B6FA]/15 text-[#C9B6FA]">{t.freq}</div>
            </Link>
          ))}
        </div>

        {/* No total */}
        <div className="rounded-xl border border-salvia/25 bg-salvia/5 p-4 mb-8">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-salvia mb-2">No total, por semana</p>
          <p className="text-[0.85rem] leading-relaxed opacity-85">
            ~5 reels (✨🔎💡📖/🕯️ + 1 extra) · 1 Cá em Casa 🎭 · 1 infográfico 📊 · stories 📱 todos os dias.
            <br />É a proporção que faz crescer: reels trazem gente nova, o resto cria autoridade e ligação.
          </p>
        </div>

        <div className="rounded-xl border border-ambar/20 bg-ambar/5 p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ambar mb-2">Lembra-te (conta nova)</p>
          <ul className="text-[0.82rem] leading-relaxed opacity-85 list-disc pl-5 space-y-1">
            <li>Os primeiros posts quase ninguém vê — é normal, não é fracasso.</li>
            <li>Publicar 1×/dia <b>não</b> dá banimento. Banimento é spam/automação.</li>
            <li>Mantém a constância 3–4 semanas — é aí que o algoritmo começa a mostrar-te.</li>
            <li>Não apagues posts fracos; aprende com os números e segue.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
