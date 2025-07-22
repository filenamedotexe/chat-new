'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, type ThemeName } from './themes';
import type { Theme } from '@chat/shared-types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: typeof themes;
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && savedTheme in themes) {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const themeData = themes[theme];

    // Remove all theme classes
    Object.keys(themes).forEach((themeName) => {
      root.classList.remove(themeName);
    });

    // Add current theme class for dark mode
    if (theme === 'dark' || theme === 'ocean' || theme === 'forest') {
      root.classList.add('dark');
    }

    // Apply CSS variables
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes,
        currentTheme: themes[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}