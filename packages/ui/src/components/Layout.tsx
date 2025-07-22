'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={clsx('min-h-screen bg-background', className)}>
      {children}
    </div>
  );
}

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function Header({ children, className, sticky = true }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        sticky && 'sticky top-0 z-50',
        className
      )}
    >
      <div className="container flex h-16 items-center">{children}</div>
    </motion.header>
  );
}

interface MainProps {
  children: React.ReactNode;
  className?: string;
}

export function Main({ children, className }: MainProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={clsx('container py-8', className)}
    >
      {children}
    </motion.main>
  );
}

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
}

export function Sidebar({ children, className, position = 'left' }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: position === 'left' ? -300 : 300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'w-64 border-r bg-background',
        position === 'right' && 'border-l border-r-0',
        className
      )}
    >
      {children}
    </motion.aside>
  );
}

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={clsx('space-y-6', className)}
    >
      {children}
    </motion.div>
  );
}