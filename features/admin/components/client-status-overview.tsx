'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconCircleCheck,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ClientStatus {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'at-risk' | 'inactive';
  activeProjects: number;
  totalProjects: number;
  completedTasks: number;
  totalTasks: number;
  lastActivity: Date;
  upcomingDeadlines: number;
  overdueItems: number;
}

interface ClientStatusOverviewProps {
  clients: ClientStatus[];
  showLimit?: number;
}

export function ClientStatusOverview({ clients, showLimit = 5 }: ClientStatusOverviewProps) {
  // Sort clients by status priority (at-risk first, then by activity)
  const sortedClients = [...clients].sort((a, b) => {
    const statusPriority = { 'at-risk': 0, 'active': 1, 'inactive': 2 };
    if (a.status !== b.status) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return b.lastActivity.getTime() - a.lastActivity.getTime();
  });

  const displayClients = showLimit ? sortedClients.slice(0, showLimit) : sortedClients;

  const statusConfig = {
    active: {
      icon: IconCircleCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Active'
    },
    'at-risk': {
      icon: IconAlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'At Risk'
    },
    inactive: {
      icon: IconClock,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Inactive'
    }
  };

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
    <Card>
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
            const config = statusConfig[client.status];
            const StatusIcon = config.icon;
            const health = getClientHealth(client);
            
            return (
              <div key={client.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className={cn("p-2 rounded-full", config.bgColor)}>
                  <StatusIcon className={cn("h-5 w-5", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{client.name}</h4>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      config.bgColor,
                      config.color
                    )}>
                      {config.label}
                    </span>
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

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}