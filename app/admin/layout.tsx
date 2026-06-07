import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import '../[locale]/globals.css';
import Link from 'next/link';

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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/favicon-180.png',
  },
};

const NAV = [
  { href: '/admin', label: 'escritos' },
  { href: '/admin/editora', label: 'editora' },
  { href: '/admin/produtos', label: 'produtos' },
  { href: '/admin/compras', label: 'compras' },
  { href: '/admin/imagens', label: 'galeria' },
  { href: '/admin/estudio', label: 'estúdio' },
  { href: '/admin/carrossel', label: 'carrosséis' },
  { href: '/admin/infografico', label: 'infográficos' },
  { href: '/admin/aneis', label: 'anéis' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <div className="grain" />
        <div className="flex min-h-screen">
          <aside className="w-[200px] shrink-0 border-r border-ocre/10 bg-terra/50 py-8 px-5 flex flex-col gap-1 fixed top-0 left-0 bottom-0 z-40">
            <Link href="/" className="text-ocre text-[0.7rem] tracking-[0.2em] uppercase no-underline hover:text-ambar mb-6 block">
              home
            </Link>
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-creme-2/30 mb-4">ADMIN</p>
            {NAV.map(n => (
              <Link
                key={n.href}
                href={n.href}
                className="block py-2.5 px-3 rounded-[10px] text-creme-2/80 text-[0.85rem] no-underline hover:bg-terra-2/50 hover:text-ambar transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex-1" />
            <p className="text-[0.6rem] text-creme-2/20 mt-4">viviannedossantos.com</p>
          </aside>
          <main className="flex-1 ml-[200px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
