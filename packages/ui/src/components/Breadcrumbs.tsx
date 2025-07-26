'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronRight, IconHome } from '@tabler/icons-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Helper to format segment names
function formatSegment(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'id': 'Details',
    'new': 'New',
    'edit': 'Edit',
  };
  
  if (specialCases[segment]) {
    return specialCases[segment];
  }
  
  // Convert kebab-case to Title Case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Auto-generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Skip (protected) or (auth) route groups
  const filteredSegments = segments.filter(
    segment => !segment.startsWith('(') && !segment.endsWith(')')
  );
  
  // Build breadcrumbs
  filteredSegments.forEach((segment, index) => {
    // Skip UUID segments (assumed to be IDs)
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return;
    }
    
    const href = '/' + filteredSegments.slice(0, index + 1).join('/');
    const label = formatSegment(segment);
    
    breadcrumbs.push({ label, href });
  });
  
  return breadcrumbs;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Use provided items or auto-generate from pathname
  const breadcrumbItems = items || generateBreadcrumbs(pathname);
  
  // Don't show breadcrumbs on dashboard
  if (pathname === '/dashboard' && !items) {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={clsx(
        'flex items-center text-sm text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <>
            <li>
              <Link 
                href="/dashboard"
                className="flex items-center hover:text-foreground transition-colors"
              >
                <IconHome className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {breadcrumbItems.length > 0 && (
              <li>
                <IconChevronRight className="h-4 w-4" />
              </li>
            )}
          </>
        )}
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={item.href || item.label}>
              <li>
                {isLast || !item.href ? (
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li>
                  <IconChevronRight className="h-4 w-4" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile-optimized breadcrumbs that show only current and parent
export function MobileBreadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);
  
  if (pathname === '/dashboard' && !items || breadcrumbItems.length === 0) {
    return null;
  }
  
  // Show only the last two items on mobile
  const mobileItems = breadcrumbItems.slice(-2);
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={clsx(
        'flex items-center text-xs text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {mobileItems.length > 1 && (
          <>
            <li>
              <Link
                href={mobileItems[0].href!}
                className="hover:text-foreground transition-colors truncate max-w-[100px]"
              >
                {mobileItems[0].label}
              </Link>
            </li>
            <li>
              <IconChevronRight className="h-3 w-3" />
            </li>
          </>
        )}
        <li>
          <span className="font-medium text-foreground truncate max-w-[150px]">
            {mobileItems[mobileItems.length - 1].label}
          </span>
        </li>
      </ol>
    </nav>
  );
}