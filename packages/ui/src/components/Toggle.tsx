'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  id?: string;
  name?: string;
  'data-testid'?: string;
}

export function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  id,
  name,
  'data-testid': dataTestId,
}: ToggleProps) {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      margin: 'mx-0.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      margin: 'mx-0.5',
    },
    lg: {
      track: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6',
      margin: 'mx-1',
    },
  };

  const currentSize = sizes[size];

  const toggle = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-label={label || 'Toggle'}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          currentSize.track,
          isChecked ? 'bg-primary' : 'bg-muted',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        data-testid={dataTestId}
        id={id}
      >
        <motion.span
          layout
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30
          }}
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
            currentSize.thumb,
            currentSize.margin,
            isChecked ? currentSize.translate : 'translate-x-0'
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium cursor-pointer',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (name) {
    return (
      <>
        <input
          type="checkbox"
          name={name}
          checked={isChecked}
          onChange={() => {}}
          className="sr-only"
          aria-hidden="true"
        />
        {toggle}
      </>
    );
  }

  return toggle;
}

// Convenience component for form usage
export function FormToggle({
  label,
  description,
  ...props
}: ToggleProps & { className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {label && (
          <div className="text-sm font-medium leading-none mb-1">
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      <Toggle {...props} />
    </div>
  );
}