import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://viviannedossantos.com';
const CONTACTO = 'viv.saraiva@gmail.com';
const ATUALIZADO = '11 de junho de 2026';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  return {
    title: `${en ? 'Privacy Policy' : 'Política de Privacidade'} · Vivianne dos Santos`,
    description: en ? 'How we collect, use and protect your data.' : 'Como recolhemos, usamos e protegemos os teus dados.',
    alternates: { canonical: `${SITE}${en ? '/en/privacidade' : '/privacidade'}` },
  };
}

export default async function PrivacidadePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-stone-700">
      <Link href={en ? '/en' : '/'} className="text-sm text-stone-400 hover:text-stone-600">← {en ? 'Home' : 'Início'}</Link>
      <h1 className="mt-6 text-3xl font-semibold text-stone-900">{en ? 'Privacy Policy' : 'Política de Privacidade'}</h1>
      <p className="mt-2 text-sm text-stone-400">{en ? 'Last updated: June 11, 2026' : `Última atualização: ${ATUALIZADO}`}</p>

      <div className="mt-8 space-y-6 leading-relaxed">
        {en ? (
          <>
            <p>This website (<a className="underline" href={SITE}>{SITE.replace('https://', '')}</a>), run by Vivianne dos Santos, sells digital educational products and shares educational content. This policy explains what data we handle and why.</p>
            <Sec t="What we collect">When you buy a product, we process your email and payment details to deliver your order and send related messages. We use anonymous analytics to understand how the site is used. We do not sell your data.</Sec>
            <Sec t="Third-party services">Payments are processed by PayPal, transactional emails are sent through Resend, and the site is hosted on Vercel. Each handles your data under its own privacy terms.</Sec>
            <Sec t="Social media publishing">Our private admin tools connect to the official Meta (Instagram) and TikTok APIs to publish our own content to our own accounts. We store the access tokens for those accounts securely and use them only to publish on our behalf. We do not collect, store or process data belonging to other TikTok or Instagram users.</Sec>
            <Sec t="Your rights">You can ask us to access, correct or delete your personal data at any time by writing to {CONTACTO}.</Sec>
            <Sec t="Contact">For any privacy question, contact <a className="underline" href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.</Sec>
          </>
        ) : (
          <>
            <p>Este site (<a className="underline" href={SITE}>{SITE.replace('https://', '')}</a>), da responsabilidade de Vivianne dos Santos, vende produtos educativos digitais e partilha conteúdo educativo. Esta política explica que dados tratamos e porquê.</p>
            <Sec t="O que recolhemos">Quando compras um produto, tratamos o teu email e os dados de pagamento para te entregar a encomenda e enviar mensagens relacionadas. Usamos análises anónimas para perceber como o site é utilizado. Não vendemos os teus dados.</Sec>
            <Sec t="Serviços de terceiros">Os pagamentos são processados pelo PayPal, os emails transacionais são enviados pelo Resend e o site é alojado na Vercel. Cada um trata os teus dados ao abrigo das suas próprias políticas.</Sec>
            <Sec t="Publicação em redes sociais">As nossas ferramentas privadas de administração ligam-se às APIs oficiais da Meta (Instagram) e do TikTok para publicar o nosso próprio conteúdo nas nossas próprias contas. Guardamos os tokens de acesso dessas contas de forma segura e usamo-los apenas para publicar em nosso nome. Não recolhemos, guardamos nem tratamos dados de outros utilizadores do TikTok ou do Instagram.</Sec>
            <Sec t="Os teus direitos">Podes pedir o acesso, a correção ou a eliminação dos teus dados pessoais a qualquer momento, escrevendo para {CONTACTO}.</Sec>
            <Sec t="Contacto">Para qualquer questão de privacidade, contacta <a className="underline" href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.</Sec>
          </>
        )}
      </div>
    </main>
  );
}

function Sec({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-stone-900">{t}</h2>
      <p className="mt-1">{children}</p>
    </section>
  );
}
