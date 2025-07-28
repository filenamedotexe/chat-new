'use client';

import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { Suspense } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}