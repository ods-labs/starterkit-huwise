import { Outfit } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';
import clsx from 'clsx';
import { AdaptiveExternalLayout } from '@/layouts/ExternalLayout';
import { withAssetPrefix } from '@/utils/pathUtils';
import { PianoAnalytics } from '@/analytics/PianoAnalytics';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
});

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "StarterKit NextJs - for Huwise projects",
  description: 'Meta description',
  icons: {
    icon: withAssetPrefix('/favicon.ico'),
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={clsx('light', outfit.variable)} suppressHydrationWarning>
      <head />
      <body className={clsx(
        'min-h-screen bg-background font-sans antialiased',
        outfit.variable
      )}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "mon-theme" }}>
          <PianoAnalytics />
          <AdaptiveExternalLayout>
            {children}
          </AdaptiveExternalLayout>
        </Providers>
      </body>
    </html>
  );
}