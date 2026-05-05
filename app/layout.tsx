import './globals.css';
import type { Metadata } from 'next';
import { Noto_Sans_KR, Space_Grotesk } from 'next/font/google';

const bodyFont = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-body'
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'POLABS ADMIN',
  description: '피오랩스 어드민',
  applicationName: 'POLABS ADMIN',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': -1,
      'max-image-preview': 'none',
      'max-video-preview': -1
    }
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'POLABS ADMIN',
    description: '피오랩스 어드민',
    siteName: 'POLABS ADMIN',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/polabs-og.png', width: 512, height: 512, alt: 'POLABS 로고' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POLABS ADMIN',
    description: '피오랩스 어드민',
    images: ['/polabs-og.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
