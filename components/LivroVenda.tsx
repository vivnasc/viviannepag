import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { TopNav } from '@/components/TopNav';
import { LangToggle } from '@/components/LangToggle';
import { Footer } from '@/components/home/Footer';
import { BotaoCompra } from '@/components/BotaoCompra';
import { GotaAssina, GotaMini } from '@/components/icons/GotaAssina';
import { getManual, AUTORA } from '@/lib/livros';
import { notFound } from 'next/navigation';

// Página de venda de um manual-filho (um movimento). Não é uma ficha: é uma
// página que tem de convencer e cativar. Estrutura: reconhecimento (a dor vista)
// -> a virada -> o que é (e não é) -> o que está lá dentro (o protocolo, a sério)
// -> para quem é -> a autora (autoridade) -> a compra (com o depois em linguagem
// que um leitor frio entende) -> o mapa inteiro.
export async function LivroVenda({ slug, locale }: { slug: string; locale: string }) {
  setRequestLocale(locale);
  const m = getManual(slug);
  if (!m) notFound();
  const isEn = locale === 'en';
  const livroHref = isEn ? '/en/os-sete-veus' : '/os-sete-veus';
  const grad = `linear-gradient(168deg, ${m.cor.topo}, ${m.cor.baixo})`;

  const t = {
    selo: isEn ? 'Method VS · See and Release' : 'Método VS · Ver e Soltar',
    reconhece: isEn ? 'Do you recognise yourself?' : 'Reconheces-te?',
    virada: isEn ? 'But there is a way out' : 'Mas há uma saída',
    oQueE: isEn ? 'What it is (and what it is not)' : 'O que é (e o que não é)',
    dentro: isEn ? 'What is inside' : 'O que está lá dentro',
    protocoloLabel: isEn ? 'The protocol' : 'O protocolo',
    protocoloSub: isEn
      ? 'five movements you train until your body knows them by heart, for the middle of a crisis.'
      : 'cinco tempos que treinas até o corpo os saber de cor, para o meio de uma crise.',
    protocoloLock: isEn ? 'The five movements, step by step, are in the manual.' : 'Os cinco tempos, passo a passo, estão no manual.',
    praticas: isEn ? 'The practices' : 'As práticas',
    praticasSub: isEn
      ? 'the daily training, for the calm moments, so the path is there when you need it.'
      : 'o treino diário, para os momentos de calma, para o caminho estar lá quando precisares.',
    caminhoSub: isEn
      ? 'a short crossing, one movement a day, for your body to learn it from within.'
      : 'uma travessia curta, um movimento por dia, para o corpo a aprender por dentro.',
    bonusLabel: isEn ? 'Bonus · the pocket sheet' : 'Bónus · o rascunho de bolso',
    bonusSub: isEn
      ? 'the whole method on one card, to keep nearby and use without the book in front of you.'
      : 'o método inteiro num cartão, para teres por perto e usares sem o livro à frente.',
    paraQuem: isEn ? 'This is for you if…' : 'Isto é para ti se…',
    autora: isEn ? 'Who writes this' : 'Quem escreve',
    depoisTit: isEn ? 'And after?' : 'E depois?',
    comprarTit: isEn ? 'Take the method home' : 'Leva o método contigo',
    pdf: isEn ? 'Immediate PDF, yours forever.' : 'PDF imediato, teu para sempre.',
    mapa: isEn
      ? <>One of three movements: See, Come back, Live. The whole map is in <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">The Seven Veils</a>.</>
      : <>Um de três movimentos: Ver, Vir, Viver. O mapa inteiro está em <a href={livroHref} className="text-ambar no-underline border-b border-ambar/40">Os Sete Véus</a>.</>,
  };

  return (
    <>
      <TopNav />
      <LangToggle />
      <div className="relative z-[2] max-w-wrap mx-auto px-7">

        {/* HERO */}
        <header className="pt-24 pb-10 text-center">
          <div
            className="w-[260px] h-[347px] mx-auto mb-9 rounded-[14px] border border-ocre/30 flex flex-col items-center justify-center text-center px-6"
            style={{ background: grad, boxShadow: '0 24px 70px -24px rgba(0,0,0,0.7)' }}
          >
            <p className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-[#E6CE8E]/90 mb-4">{t.selo}</p>
            <p className="font-serif text-creme text-[2rem] leading-none">{m.marca}</p>
            <p className="font-serif italic text-creme-2/80 text-[0.85rem] mt-3">{m.movimento}</p>
          </div>
          <p className="font-sans text-[0.7rem] tracking-[0.34em] uppercase text-salvia mb-3">{t.selo}</p>
          <h1 className="font-serif font-light text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.05] text-creme">{m.marca}</h1>
          <p className="font-serif italic font-light text-ocre text-[clamp(1.05rem,3.4vw,1.35rem)] mt-4 leading-[1.4] max-w-[600px] mx-auto">
            {isEn ? m.promessaEn : m.promessa}
          </p>
          <p className="max-w-[560px] mx-auto mt-7 text-[1.05rem] leading-[1.85] text-creme-2">{isEn ? m.intro : m.intro}</p>
          <div className="mt-9">
            <BotaoCompra slug={m.slug} locale={locale} titulo={m.marca} preco={m.preco} />
            <p className="text-creme-2/55 text-[0.82rem] mt-3">{t.pdf}</p>
          </div>
        </header>

        <div className="veu my-12" />

        {/* RECONHECIMENTO — a dor vista, para a leitora se sentir reconhecida */}
        <section className="max-w-[620px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6 text-center">{t.reconhece}</p>
          <ul className="space-y-3.5">
            {(isEn ? m.paraQuemEn : m.paraQuem).map((p, i) => (
              <li key={i} className="flex gap-3 text-creme-2 text-[1.04rem] leading-[1.7]">
                <GotaMini className="w-[16px] h-[16px] mt-1.5 shrink-0 opacity-70" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="veu my-12" />

        {/* A VIRADA — amostra: o reconhecimento abre, a esperança vira */}
        <section className="max-w-[620px] mx-auto my-10 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6">{t.virada}</p>
          <div className="font-serif font-light text-creme-2 text-[1.12rem] leading-[1.95] space-y-4">
            {(isEn ? m.amostraEn : m.amostra).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <GotaAssina className="w-[54px] h-[54px] mx-auto mt-8 opacity-95 block" />
        </section>

        <div className="veu my-12" />

        {/* O QUE É / NÃO É */}
        <section className="max-w-[620px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-6 text-center">{t.oQueE}</p>
          <p className="text-creme-2/75 text-[1.02rem] leading-[1.8] mb-4">{isEn ? m.naoEEn : m.naoE}</p>
          <p className="text-creme text-[1.08rem] leading-[1.8] font-serif">{isEn ? m.eEn : m.e}</p>
        </section>

        <div className="veu my-12" />

        {/* O QUE ESTÁ LÁ DENTRO — substância concreta que justifica a compra */}
        <section className="max-w-[680px] mx-auto my-10">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-7 text-center">{t.dentro}</p>

          <div className="rounded-[16px] border border-ocre/20 p-7 mb-5" style={{ background: grad }}>
            <p className="font-serif text-creme text-[1.2rem]">{m.protocoloNome}</p>
            <p className="text-creme-2/70 text-[0.9rem] mt-1 mb-5">{t.protocoloSub}</p>
            {/* sinaliza que são cinco tempos, sem os revelar (isso é o produto) */}
            <div className="flex gap-2.5 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="w-8 h-8 rounded-full border border-ambar/40 text-ambar/85 text-[0.82rem] flex items-center justify-center font-serif">{n}</span>
              ))}
            </div>
            <p className="text-creme-2/85 text-[0.98rem] leading-[1.75]">{isEn ? m.protocoloFormaEn : m.protocoloForma}</p>
            <p className="text-ambar/80 text-[0.82rem] italic font-serif mt-4">{t.protocoloLock}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="rounded-[14px] border border-ocre/20 p-5">
              <p className="font-serif text-creme text-[1.05rem]">{t.praticas}</p>
              <p className="text-creme-2/70 text-[0.88rem] leading-[1.6] mt-1.5">{t.praticasSub}</p>
            </div>
            <div className="rounded-[14px] border border-ocre/20 p-5">
              <p className="font-serif text-creme text-[1.05rem]">{isEn ? m.caminhoEn : m.caminho}</p>
              <p className="text-creme-2/70 text-[0.88rem] leading-[1.6] mt-1.5">{t.caminhoSub}</p>
            </div>
          </div>

          <div className="rounded-[14px] border border-ambar/30 bg-ambar/5 p-5">
            <p className="font-serif text-ambar text-[1.05rem]">{t.bonusLabel}</p>
            <p className="text-creme-2/80 text-[0.88rem] leading-[1.6] mt-1.5">{t.bonusSub}</p>
          </div>
        </section>

        <div className="veu my-12" />

        {/* A AUTORA — autoridade, com o nome dela */}
        <section className="max-w-[640px] mx-auto my-10 grid grid-cols-[120px_1fr] gap-7 items-center max-[520px]:grid-cols-1 max-[520px]:text-center max-[520px]:gap-5">
          <Image
            src="/vivianne-2.jpg"
            alt={AUTORA.nome}
            width={1024}
            height={1280}
            className="w-[120px] h-[156px] object-cover rounded-[12px] border border-ocre/30 max-[520px]:mx-auto"
            style={{ objectPosition: '50% 22%' }}
          />
          <div>
            <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-ocre mb-2">{t.autora}</p>
            <p className="font-serif text-creme text-[1.2rem] mb-2">{AUTORA.nome}</p>
            <p className="text-creme-2/80 text-[0.96rem] leading-[1.7]">{isEn ? AUTORA.bioEn : AUTORA.bio}</p>
          </div>
        </section>

        <div className="veu my-12" />

        {/* O DEPOIS — o estado-depois em linguagem clara (não só "a margem") */}
        <section className="max-w-[600px] mx-auto my-10 text-center">
          <p className="font-sans text-[0.7rem] tracking-[0.32em] uppercase text-salvia mb-5">{t.depoisTit}</p>
          <p className="font-serif font-light text-creme text-[1.2rem] leading-[1.7]">{isEn ? m.depoisFraseEn : m.depoisFrase}</p>
        </section>

        <div className="veu my-12" />

        {/* COMPRA */}
        <section className="max-w-[440px] mx-auto my-10 text-center">
          <h2 className="font-serif font-light text-creme text-[clamp(1.5rem,5vw,2rem)] mb-3">{t.comprarTit}</h2>
          <p className="text-creme-2/70 text-[0.92rem] leading-relaxed mb-2">
            {isEn
              ? 'A real method, with its own protocol, practices and a seven-day path, plus the pocket sheet. Yours, in PDF, the moment you buy.'
              : 'Um método a sério, com protocolo próprio, práticas e um caminho de sete dias, mais o rascunho de bolso. Teu, em PDF, no momento da compra.'}
          </p>
          <p className="text-ambar/90 text-[1.4rem] font-serif mb-6">{m.preco}</p>
          <BotaoCompra slug={m.slug} locale={locale} titulo={m.marca} preco={m.preco} />
        </section>

        <p className="max-w-[600px] mx-auto pb-2 text-center text-creme-2/55 text-[0.88rem] font-serif">{t.mapa}</p>

        <div className="veu my-14" />
        <Footer />
      </div>
    </>
  );
}
