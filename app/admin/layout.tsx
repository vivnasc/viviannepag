import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import '../[locale]/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'admin · Vivianne dos Santos',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
