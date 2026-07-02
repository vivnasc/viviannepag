import type { Metadata } from 'next';
import '../[locale]/globals.css';

export const metadata: Metadata = {
  title: 'render-reel-mae',
  robots: { index: false, follow: false },
};

export default function RenderReelMaeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, padding: 0, background: '#0c0a08', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
