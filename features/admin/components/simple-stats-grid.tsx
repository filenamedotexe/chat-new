'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconUsers, 
  IconFolderOpen, 
  IconClipboardList, 
  IconFiles,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconClock,
  IconClipboardCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface SimpleStatCard {
  label: string;
  value: string;
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
}

interface SimpleStatsGridProps {
  stats: SimpleStatCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  users: IconUsers,
  folderOpen: IconFolderOpen,
  clipboardList: IconClipboardList,
  files: IconFiles,
  activity: IconActivity,
  clock: IconClock,
  clipboardCheck: IconClipboardCheck,
  alertCircle: IconAlertCircle,
  trendingUp: IconTrendingUp
};

export function SimpleStatsGrid({ stats, columns = 4, className }: SimpleStatsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || IconActivity;
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}