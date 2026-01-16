import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/custom/loading';
import { AuthProvider } from '@/auth/context';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Save to Linksnatched',
  description:
    'The easiest, fastest way to capture articles, videos, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<Spinner />}>
            <Toaster />
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
