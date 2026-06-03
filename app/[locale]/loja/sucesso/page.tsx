import Link from 'next/link';
import Image from 'next/image';
import { existsSync } from 'fs';
import { join } from 'path';
import { setRequestLocale } from 'next-intl/server';
import { LangToggle } from '@/components/LangToggle';
import { TopNav } from '@/components/TopNav';
import { GotaMini } from '@/components/icons/GotaAssina';

export default async function SucessoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isPt = locale === 'pt';

  // Foto de gratidao (gerada no MidJourney). So mostra se o ficheiro existir,
  // para nunca aparecer imagem partida. Basta guardar em public/gratidao-sucesso.jpg.
  const temFoto = existsSync(join(process.cwd(), 'public', 'gratidao-sucesso.jpg'));

  return (
    <>
      <TopNav />
      <LangToggle />
      <main className="relative z-[2] max-w-wrap mx-auto px-7 min-h-[70vh] flex flex-col items-center justify-center text-center py-16">
        {temFoto && (
          <div className="relative w-[150px] h-[150px] mb-8 rounded-full overflow-hidden border border-ambar/40 shadow-xl shadow-black/30">
            <Image src="/gratidao-sucesso.jpg" alt="" fill className="object-cover" unoptimized priority />
          </div>
        )}
        <p className="text-[0.78rem] tracking-[0.32em] uppercase text-ambar mb-5">
          {isPt ? 'obrigada' : 'thank you'}
        </p>
        <h1 className="font-serif font-light text-creme text-[clamp(2rem,6vw,3.2rem)] leading-[1.1] tracking-[-0.01em] mb-5">
          {isPt ? 'A tua travessia começa agora' : 'Your journey begins now'}
        </h1>
        <p className="font-serif italic text-creme-2 text-[1.05rem] max-w-[480px] mb-8">
          {isPt
            ? 'O pagamento foi confirmado. Vais receber um email com o acesso ao teu conteúdo dentro de momentos.'
            : 'Payment confirmed. You will receive an email with access to your content shortly.'}
        </p>
        <GotaMini className="w-[36px] h-[36px] opacity-50 mb-10" />
        <Link
          href={locale === 'en' ? '/en' : '/'}
          className="text-ocre no-underline border-b border-ocre/40 hover:border-ambar hover:text-ambar transition-colors text-[0.95rem] tracking-[0.04em] pb-0.5"
        >
          {isPt ? 'voltar ao início' : 'back home'}
        </Link>
      </main>
    </>
  );
}
