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
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-7 py-3 bg-terra/90 backdrop-blur border-b border-ocre/10">
          <a href="/" className="text-creme-2/70 text-[0.8rem] hover:text-ambar no-underline">home</a>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-ocre/50">admin</span>
          <a href="/admin" className="text-creme-2/70 text-[0.8rem] hover:text-ambar no-underline">painel</a>
        </nav>
        <div className="pt-12">
          {children}
        </div>
      </body>
    </html>
  );
}
