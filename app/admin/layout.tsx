import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import '../[locale]/globals.css';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';

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

const SECOES: { titulo: string; cor: string; itens: { href: string; label: string }[] }[] = [
  {
    titulo: 'publicar · todas as contas',
    cor: '#7E9B8E',
    itens: [
      { href: '/admin/publicar', label: 'publicar · agendar' },
      { href: '/admin/tiktok', label: 'tiktok · publicar' },
      { href: '/admin/analytics', label: 'analytics · instagram' },
      { href: '/admin/site-analytics', label: 'analytics · site' },
      { href: '/admin/instagram', label: 'instagram · ligar token' },
    ],
  },
  {
    titulo: 'viviannedossantos · loja',
    cor: '#EBAE4A',
    itens: [
      { href: '/admin', label: 'escritos' },
      { href: '/admin/editora', label: 'editora' },
      { href: '/admin/produtos', label: 'produtos' },
      { href: '/admin/compras', label: 'compras' },
      { href: '/admin/estudio', label: 'estúdio' },
      { href: '/admin/lista', label: 'a lista · emails' },
    ],
  },
  {
    // A MÃE (vivianne.dos.santos) tem a SUA secção: produzir (as 4 contas trocam-se
    // por ABAS dentro da página — uma só entrada, sem sub-menus a irritar) + as séries
    // e os carrosséis, que são DELA. O mapa (calendário/plano) fica logo a seguir.
    titulo: 'vivianne.dos.santos · a mãe',
    cor: '#d8b25a',
    itens: [
      { href: '/admin/metodo/mae', label: 'produzir · autoridade' },
      { href: '/admin/series-diaria', label: 'vc sabia · hoje em mim' },
      { href: '/admin/carrossel', label: 'carrosséis' },
    ],
  },
  {
    titulo: 'método vs · o mapa',
    cor: '#d8b25a',
    itens: [
      { href: '/admin/metodo/calendario', label: 'calendário · 3 meses' },
      { href: '/admin/metodo/mae-plano', label: 'plano da semana' },
    ],
  },
  {
    titulo: 'soulab.studio',
    cor: '#B9A8E0',
    itens: [
      { href: '/admin/soulab', label: 'laboratório · gerar' },
    ],
  },
  {
    titulo: 'Véu a Véu · planear',
    cor: '#C9B6FA',
    itens: [
      { href: '/admin/calendario-veu', label: 'calendário · 3 meses' },
      { href: '/admin/plano-semana', label: 'plano da semana' },
      { href: '/admin/agenda', label: 'agenda' },
      { href: '/admin/conteudos', label: 'conteúdos · biblioteca' },
    ],
  },
  {
    titulo: 'Véu a Véu · criar',
    cor: '#EBAE4A',
    itens: [
      { href: '/admin/banda', label: 'cá em casa' },
      { href: '/admin/heroi', label: 'i am a hero' },
      { href: '/admin/reels', label: 'reels' },
      { href: '/admin/infografico', label: 'infográficos' },
      { href: '/admin/veu-demonstracoes', label: 'demonstrações físicas' },
      { href: '/admin/carrossel-veu', label: 'carrosséis' },
    ],
  },
  {
    titulo: 'geral',
    cor: '#9aa39a',
    itens: [
      { href: '/admin/imagens', label: 'galeria' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <div className="grain" />
        <div className="flex min-h-screen">
          <aside className="w-[210px] shrink-0 border-r border-ocre/10 bg-terra/50 py-5 px-5 flex flex-col gap-0.5 fixed top-0 left-0 bottom-0 z-40 overflow-y-auto">
            <Link href="/" className="text-ocre text-[0.7rem] tracking-[0.2em] uppercase no-underline hover:text-ambar mb-3 block">
              home
            </Link>
            <AdminNav secoes={SECOES} />
            <div className="flex-1" />
            <p className="text-[0.6rem] text-creme-2/20 mt-2">viviannedossantos.com</p>
          </aside>
          <main className="flex-1 ml-[210px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
