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

export const metadata: Metadata = {
  title: 'PO LABS 월별 성과 템플릿',
  description: '회원가입, 관리자 권한, 월별 보고서, PDF 출력이 가능한 성과 대시보드 템플릿'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
