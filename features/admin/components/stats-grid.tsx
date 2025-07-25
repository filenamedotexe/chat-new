'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconUsers, 
  IconFolderOpen, 
  IconClipboardList, 
  IconFiles,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconClock,
  IconCheck,
  IconX,
  IconHourglass,
  IconClipboardCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  formatter?: 'number' | 'percentage' | 'filesize';
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend?.direction === 'up' ? IconTrendingUp : IconTrendingDown;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    stat.trend.direction === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    <span>+{stat.trend.value}</span>
                    {stat.trend.label && (
                      <span className="text-xs text-muted-foreground ml-1">{stat.trend.label}</span>
                    )}
                  </div>
                )}
              </div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Extended stats for comprehensive dashboard
export interface ExtendedStats {
  // User stats
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  usersByRole: {
    admin: number;
    client: number;
    team_member: number;
  };

  // Project stats
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projectsThisMonth: number;
  
  // Task stats
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  tasksCompletedThisWeek: number;
  
  // File stats
  totalFiles: number;
  totalFileSize: number;
  filesUploadedThisWeek: number;
  
  // Activity stats
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  
  // Client stats
  totalClients: number;
  activeClients: number;
  clientsWithActiveProjects: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatFileSize(bytes: number): string {
  return formatBytes(bytes);
}

export function getDefaultStatCards(stats: ExtendedStats): StatCard[] {
  const completion = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
    
  const storageUsed = formatFileSize(stats.totalFileSize);
  
  return [
    {
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: IconUsers,
      trend: stats.newUsersThisWeek > 0 ? {
        value: stats.newUsersThisWeek,
        direction: 'up'
      } : undefined
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: IconFolderOpen,
      trend: stats.projectsThisMonth > 0 ? {
        value: stats.projectsThisMonth,
        direction: 'up',
        label: 'this month'
      } : undefined
    },
    {
      label: 'Task Completion',
      value: `${completion}%`,
      icon: IconClipboardList,
      formatter: 'percentage'
    },
    {
      label: 'Storage Used',
      value: storageUsed,
      icon: IconFiles,
      formatter: 'filesize'
    }
  ];
}

export function getClientStatCards(stats: ExtendedStats): StatCard[] {
  const activePercentage = stats.totalClients > 0
    ? Math.round((stats.activeClients / stats.totalClients) * 100)
    : 0;
    
  return [
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      icon: IconUsers
    },
    {
      label: 'Active Clients',
      value: `${activePercentage}%`,
      icon: IconTrendingUp,
      formatter: 'percentage'
    },
    {
      label: 'Client Projects',
      value: stats.clientsWithActiveProjects.toString(),
      icon: IconFolderOpen
    },
    {
      label: 'Activity Today',
      value: stats.activitiesToday.toString(),
      icon: IconActivity,
      trend: stats.activitiesThisWeek > 0 ? {
        value: stats.activitiesThisWeek,
        direction: 'up',
        label: 'this week'
      } : undefined
    }
  ];
}

export function getTaskStatCards(stats: ExtendedStats): StatCard[] {
  return [
    {
      label: 'Not Started',
      value: (stats.totalTasks - stats.completedTasks - stats.inProgressTasks).toString(),
      icon: IconClock
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks.toString(),
      icon: IconActivity
    },
    {
      label: 'Completed',
      value: stats.completedTasks.toString(),
      icon: IconClipboardCheck,
      trend: stats.tasksCompletedThisWeek > 0 ? {
        value: stats.tasksCompletedThisWeek,
        direction: 'up',
        label: 'this week'
      } : undefined
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks.toString(),
      icon: IconAlertCircle
    }
  ];
}