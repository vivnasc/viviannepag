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
    title: `${en ? 'Terms of Service' : 'Termos de Serviço'} · Vivianne dos Santos`,
    description: en ? 'The terms for using this website and its products.' : 'Os termos de utilização deste site e dos seus produtos.',
    alternates: { canonical: `${SITE}${en ? '/en/termos' : '/termos'}` },
  };
}

export default async function TermosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const en = locale === 'en';

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-stone-700">
      <Link href={en ? '/en' : '/'} className="text-sm text-stone-400 hover:text-stone-600">← {en ? 'Home' : 'Início'}</Link>
      <h1 className="mt-6 text-3xl font-semibold text-stone-900">{en ? 'Terms of Service' : 'Termos de Serviço'}</h1>
      <p className="mt-2 text-sm text-stone-400">{en ? 'Last updated: June 11, 2026' : `Última atualização: ${ATUALIZADO}`}</p>

      <div className="mt-8 space-y-6 leading-relaxed">
        {en ? (
          <>
            <p>Welcome to <a className="underline" href={SITE}>{SITE.replace('https://', '')}</a>, run by Vivianne dos Santos. By using this website you agree to these terms.</p>
            <Sec t="Use of the site">This website offers educational content and digital products. You agree to use it lawfully and not to misuse, copy or resell its content without permission.</Sec>
            <Sec t="Products and payments">Digital products are delivered electronically after payment, processed securely by PayPal. Because they are digital, sales are final unless the law requires otherwise.</Sec>
            <Sec t="Intellectual property">All content, texts and materials are the property of Vivianne dos Santos and may not be reproduced without written consent.</Sec>
            <Sec t="Social media content">Content we publish to our own Instagram and TikTok accounts through the official APIs is created and owned by us. These terms do not grant any rights over third-party platforms.</Sec>
            <Sec t="Liability">The content is provided for educational purposes and does not replace professional advice. We are not liable for decisions made based on it.</Sec>
            <Sec t="Contact">Questions about these terms: <a className="underline" href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.</Sec>
          </>
        ) : (
          <>
            <p>Bem-vinda ao <a className="underline" href={SITE}>{SITE.replace('https://', '')}</a>, da responsabilidade de Vivianne dos Santos. Ao usares este site, aceitas estes termos.</p>
            <Sec t="Utilização do site">Este site oferece conteúdo educativo e produtos digitais. Comprometes-te a usá-lo de forma lícita e a não utilizar indevidamente, copiar ou revender o seu conteúdo sem autorização.</Sec>
            <Sec t="Produtos e pagamentos">Os produtos digitais são entregues eletronicamente após o pagamento, processado de forma segura pelo PayPal. Por serem digitais, as vendas são finais, salvo quando a lei exigir o contrário.</Sec>
            <Sec t="Propriedade intelectual">Todo o conteúdo, textos e materiais são propriedade de Vivianne dos Santos e não podem ser reproduzidos sem consentimento escrito.</Sec>
            <Sec t="Conteúdo em redes sociais">O conteúdo que publicamos nas nossas próprias contas de Instagram e TikTok através das APIs oficiais é criado e pertence-nos. Estes termos não concedem quaisquer direitos sobre plataformas de terceiros.</Sec>
            <Sec t="Responsabilidade">O conteúdo é disponibilizado com fins educativos e não substitui aconselhamento profissional. Não nos responsabilizamos por decisões tomadas com base nele.</Sec>
            <Sec t="Contacto">Questões sobre estes termos: <a className="underline" href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.</Sec>
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
