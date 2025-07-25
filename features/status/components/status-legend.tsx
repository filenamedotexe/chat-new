'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { StatusBadge } from './status-badge';
import { getStatusDescription } from '../lib/calculate-status';
import type { ClientHealthStatus } from '../types/status';

interface StatusLegendProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

const statusTypes: ClientHealthStatus[] = ['active', 'at-risk', 'inactive'];

export function StatusLegend({ 
  title = "Client Status Legend",
  description = "Understanding client health indicators",
  className,
  compact = false
}: StatusLegendProps) {
  if (compact) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {statusTypes.map((status) => (
            <div key={status} className="flex items-center gap-3">
              <StatusBadge status={status} size="sm" tooltip={false} />
              <span className="text-sm text-muted-foreground">
                {getStatusDescription(status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={className} data-testid="status-legend">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusTypes.map((status) => (
            <div key={status} className="space-y-2">
              <StatusBadge status={status} tooltip={false} />
              <p className="text-sm text-muted-foreground pl-2">
                {getStatusDescription(status)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusSummaryProps {
  summary: {
    active: number;
    atRisk: number;
    inactive: number;
    total: number;
  };
  className?: string;
}

export function StatusSummary({ summary, className }: StatusSummaryProps) {
  const { active, atRisk, inactive, total } = summary;
  
  return (
    <div className={className} data-testid="status-summary">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <StatusBadge status="active" showText={false} size="lg" />
          <p className="text-2xl font-bold text-green-600 mt-2">{active}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="text-center">
          <StatusBadge status="at-risk" showText={false} size="lg" />
          <p className="text-2xl font-bold text-yellow-600 mt-2">{atRisk}</p>
          <p className="text-sm text-muted-foreground">At Risk</p>
        </div>
        <div className="text-center">
          <StatusBadge status="inactive" showText={false} size="lg" />
          <p className="text-2xl font-bold text-red-600 mt-2">{inactive}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </div>
      </div>
      <div className="text-center mt-4 pt-4 border-t">
        <p className="text-lg font-semibold">Total Clients: {total}</p>
      </div>
    </div>
  );
}