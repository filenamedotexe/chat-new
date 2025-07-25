'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconTrendingUp,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../../status/components/status-badge';
import { getStatusPriority } from '../../status/lib/calculate-status';
import type { ClientStatus } from '../../status/types/status';
import { formatDistanceToNow } from 'date-fns';

interface ClientStatusOverviewProps {
  clients: ClientStatus[];
  showLimit?: number;
}

export function ClientStatusOverview({ clients, showLimit = 5 }: ClientStatusOverviewProps) {
  // Sort clients by status priority (at-risk first, then by activity)
  const sortedClients = [...clients].sort((a, b) => {
    if (a.status !== b.status) {
      return getStatusPriority(a.status) - getStatusPriority(b.status);
    }
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  const displayClients = showLimit ? sortedClients.slice(0, showLimit) : sortedClients;

  const getClientHealth = (client: ClientStatus): number => {
    if (client.totalTasks === 0) return 100;
    const completionRate = (client.completedTasks / client.totalTasks) * 100;
    const hasOverdue = client.overdueItems > 0;
    const recentActivity = new Date().getTime() - client.lastActivity.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
    
    let health = completionRate;
    if (hasOverdue) health -= 20;
    if (!recentActivity) health -= 10;
    
    return Math.max(0, Math.min(100, health));
  };

  return (
    <Card data-testid="client-status-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Client Status Overview
            </CardTitle>
            <CardDescription>
              Monitor client engagement and project health
            </CardDescription>
          </div>
          <Link 
            href="/admin/clients" 
            className="text-sm text-primary hover:underline"
          >
            View All Clients
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayClients.map((client) => {
            const health = getClientHealth(client);
            
            return (
              <div key={client.id} className="flex items-center gap-4 p-4 rounded-lg border" data-testid={`client-status-${client.id}`}>
                <StatusBadge status={client.status} size="lg" showText={false} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{client.name}</h4>
                    <StatusBadge status={client.status} size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconTrendingUp className="h-3 w-3" />
                      <span>{client.activeProjects} active projects</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      <span>
                        Last active {formatDistanceToNow(client.lastActivity)}
                      </span>
                    </div>
                  </div>
                  
                  {(client.overdueItems > 0 || client.upcomingDeadlines > 0) && (
                    <div className="flex items-center gap-4 mt-2">
                      {client.overdueItems > 0 && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {client.overdueItems} overdue items
                        </span>
                      )}
                      {client.upcomingDeadlines > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {client.upcomingDeadlines} upcoming deadlines
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">{Math.round(health)}%</div>
                  <div className="text-xs text-muted-foreground">Health Score</div>
                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        health >= 80 ? "bg-green-600" :
                        health >= 60 ? "bg-amber-600" :
                        "bg-red-600"
                      )}
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {clients.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No client data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

