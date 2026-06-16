import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
});

export const metadata = {
  title: 'Copa 2026',
  description: 'Acompanhe jogos, grupos, chaveamento e artilharia da Copa do Mundo 2026.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} min-h-screen`}
        style={{ background: '#0C0C0F' }}
      >
        <nav className="border-b border-zinc-800 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <a href="/copa" className="text-yellow-400 font-bold text-sm hover:text-yellow-300 transition-colors">
              🏆 Copa 2026
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
