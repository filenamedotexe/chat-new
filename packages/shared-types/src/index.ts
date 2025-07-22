export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expires: Date;
  sessionToken: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  enabledFor?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}