'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconClock 
} from '@tabler/icons-react';
import type { ClientHealthStatus } from '../types/status';
import { 
  getStatusBgColor, 
  getStatusDescription 
} from '../lib/calculate-status';

interface StatusBadgeProps {
  status: ClientHealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  tooltip?: boolean;
}

const statusIcons = {
  'active': IconCircleCheck,
  'at-risk': IconAlertTriangle,
  'inactive': IconClock,
};

const statusLabels = {
  'active': 'Active',
  'at-risk': 'At Risk',
  'inactive': 'Inactive',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
  className,
  tooltip = true,
}: StatusBadgeProps) {
  const Icon = statusIcons[status];
  const label = statusLabels[status];
  const description = getStatusDescription(status);

  const badgeContent = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        getStatusBgColor(status),
        sizeClasses[size],
        className
      )}
      title={tooltip ? description : undefined}
      data-testid={`status-badge-${status}`}
      data-status={status}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showText && label}
    </span>
  );

  return badgeContent;
}

interface StatusIndicatorProps {
  status: ClientHealthStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'md', 
  className 
}: StatusIndicatorProps) {
  const colors = {
    'active': 'bg-green-500',
    'at-risk': 'bg-yellow-500', 
    'inactive': 'bg-red-500',
  };

  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={cn(
        'rounded-full',
        colors[status],
        sizes[size],
        className
      )}
      title={getStatusDescription(status)}
      data-testid={`status-indicator-${status}`}
    />
  );
}