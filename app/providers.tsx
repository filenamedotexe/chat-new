'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Suspense } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}