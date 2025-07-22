'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const showFallback = !src || imageError;
  const initials = fallback
    ? fallback
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={clsx(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizes[size],
        className
      )}
    >
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      {showFallback && (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="font-medium text-muted-foreground">{initials}</span>
        </div>
      )}
    </div>
  );
}