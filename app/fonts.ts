import { Alice, Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const alice = localFont({
  src: '../public/fonts/Alice-Regular.ttf',
  variable: '--font-alice',
  display: 'swap',
});

export const vastago = localFont({
  src: '../public/fonts/vastago.otf',
  variable: '--font-vastago',
  display: 'swap',
}); 