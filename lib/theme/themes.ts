import type { Theme } from '@chat/shared-types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '222.2 47.4% 11.2%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96.1%',
    secondaryForeground: '222.2 47.4% 11.2%',
    background: '0 0% 100%',
    foreground: '222.2 47.4% 11.2%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    accent: '210 40% 96.1%',
    accentForeground: '222.2 47.4% 11.2%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 47.4% 11.2%',
    popover: '0 0% 100%',
    popoverForeground: '222.2 47.4% 11.2%',
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '210 40% 98%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '212.7 26.8% 83.9%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
  },
};

export const oceanTheme: Theme = {
  name: 'ocean',
  colors: {
    primary: '199 89% 48%',
    primaryForeground: '210 40% 98%',
    secondary: '199 18% 33%',
    secondaryForeground: '210 40% 98%',
    background: '202 47% 5%',
    foreground: '199 18% 95%',
    muted: '199 18% 15%',
    mutedForeground: '199 18% 60%',
    accent: '199 71% 42%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '199 18% 20%',
    input: '199 18% 20%',
    ring: '199 89% 48%',
    card: '199 47% 7%',
    cardForeground: '199 18% 95%',
    popover: '199 47% 7%',
    popoverForeground: '199 18% 95%',
  },
};

export const forestTheme: Theme = {
  name: 'forest',
  colors: {
    primary: '142 76% 36%',
    primaryForeground: '355 100% 100%',
    secondary: '142 8% 33%',
    secondaryForeground: '355 100% 100%',
    background: '138 23% 7%',
    foreground: '142 8% 95%',
    muted: '142 8% 15%',
    mutedForeground: '142 8% 60%',
    accent: '142 52% 45%',
    accentForeground: '355 100% 100%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '355 100% 100%',
    border: '142 8% 20%',
    input: '142 8% 20%',
    ring: '142 76% 36%',
    card: '138 23% 9%',
    cardForeground: '142 8% 95%',
    popover: '138 23% 9%',
    popoverForeground: '142 8% 95%',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme,
  forest: forestTheme,
} as const;

export type ThemeName = keyof typeof themes;