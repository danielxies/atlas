'use client';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './lib/hooks/useTheme';
import { alice, vastago } from './fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${alice.variable} ${vastago.variable}`}>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}