'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { Button } from './Button';

interface ThemeToggleProps {
  theme: 'light' | 'dark' | string;
  onToggle: () => void;
  'data-testid'?: string;
}

export function ThemeToggle({ theme, onToggle, 'data-testid': dataTestId }: ThemeToggleProps) {
  const isDark = theme === 'dark' || theme === 'ocean' || theme === 'forest';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="relative h-9 w-9 p-0"
      data-testid={dataTestId}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 90 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <IconSun className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <IconMoon className="h-5 w-5" />
      </motion.div>
    </Button>
  );
}