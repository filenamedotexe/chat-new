import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconUsers, 
  IconFolderOpen, 
  IconClipboardList, 
  IconFiles,
  IconActivity,
  IconTrendingUp,
  IconClock,
  IconBuilding,
  IconRefresh,
  IconChartBar,
  IconClipboardCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { TimelineCompact } from '@/features/timeline/components/timeline';
import { getRecentActivity } from '@/features/timeline/data/activity';
import Link from 'next/link';
import { SimpleStatsGrid, type SimpleStatCard } from './simple-stats-grid';
import { ClientStatusOverview } from './client-status-overview';
import type { ClientStatus } from '../../status/types/status';
import { FeatureFlagsManager } from './feature-flags-manager';
import type { ExtendedStats } from './stats-grid';

interface AdminDashboardProps {
  stats: ExtendedStats;
  recentActivity: Awaited<ReturnType<typeof getRecentActivity>>;
  clientStatuses: ClientStatus[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function AdminDashboard({ stats, recentActivity, clientStatuses }: AdminDashboardProps) {
  // Generate stat cards server-side
  const completion = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
    
  const storageUsed = formatFileSize(stats.totalFileSize);
  
  const defaultStatCards: SimpleStatCard[] = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: 'users',
      trend: stats.newUsersThisWeek > 0 ? {
        value: stats.newUsersThisWeek,
        direction: 'up'
      } : undefined
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: 'folderOpen',
      trend: stats.projectsThisMonth > 0 ? {
        value: stats.projectsThisMonth,
        direction: 'up',
        label: 'this month'
      } : undefined
    },
    {
      label: 'Task Completion',
      value: `${completion}%`,
      icon: 'clipboardList'
    },
    {
      label: 'Storage Used',
      value: storageUsed,
      icon: 'files'
    }
  ];

  const taskStatCards: SimpleStatCard[] = [
    {
      label: 'Not Started',
      value: (stats.totalTasks - stats.completedTasks - stats.inProgressTasks).toString(),
      icon: 'clock'
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks.toString(),
      icon: 'activity'
    },
    {
      label: 'Completed',
      value: stats.completedTasks.toString(),
      icon: 'clipboardCheck',
      trend: stats.tasksCompletedThisWeek > 0 ? {
        value: stats.tasksCompletedThisWeek,
        direction: 'up',
        label: 'this week'
      } : undefined
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks.toString(),
      icon: 'alertCircle'
    }
  ];

  const activePercentage = stats.totalClients > 0
    ? Math.round((stats.activeClients / stats.totalClients) * 100)
    : 0;
    
  const clientStatCards: SimpleStatCard[] = [
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      icon: 'users'
    },
    {
      label: 'Active Clients',
      value: `${activePercentage}%`,
      icon: 'trendingUp'
    },
    {
      label: 'Client Projects',
      value: stats.clientsWithActiveProjects.toString(),
      icon: 'folderOpen'
    },
    {
      label: 'Activity Today',
      value: stats.activitiesToday.toString(),
      icon: 'activity',
      trend: stats.activitiesThisWeek > 0 ? {
        value: stats.activitiesThisWeek,
        direction: 'up',
        label: 'this week'
      } : undefined
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Platform Overview</h2>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <IconRefresh className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <SimpleStatsGrid stats={defaultStatCards} />
      </div>
      
      {/* Client Overview and Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Status Overview */}
        <ClientStatusOverview clients={clientStatuses} showLimit={5} />
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconActivity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest actions across the platform
                </CardDescription>
              </div>
              <Link 
                href="/admin/activity" 
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <TimelineCompact activities={recentActivity} />
          </CardContent>
        </Card>
      </div>

      {/* Task and Client Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5" />
              Task Analytics
            </CardTitle>
            <CardDescription>
              Task distribution and completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleStatsGrid stats={taskStatCards} columns={4} />
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Client Activity Metrics</h4>
              <SimpleStatsGrid stats={clientStatCards} columns={2} className="gap-3" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTrendingUp className="h-5 w-5" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Project Completion</span>
                    <span className="text-sm font-medium">
                      {stats.activeProjects > 0 
                        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${stats.totalTasks > 0 
                          ? (stats.completedTasks / stats.totalTasks) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="pt-3 space-y-2">
                  <Link 
                    href="/organizations" 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <IconBuilding className="h-4 w-4" />
                    Manage Organizations
                  </Link>
                  <Link 
                    href="/users" 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <IconUsers className="h-4 w-4" />
                    Manage Users
                  </Link>
                  <Link 
                    href="/admin/reports" 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <IconClock className="h-4 w-4" />
                    View Reports
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link 
                href="/projects/new"
                className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
              >
                Create Project
              </Link>
              <Link 
                href="/organizations/new"
                className="block w-full text-center py-2 px-4 border border-border rounded-md hover:bg-accent transition-colors text-sm"
              >
                Add Organization
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Flags Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Feature Management</h2>
        <FeatureFlagsManager />
      </div>
    </div>
  );
}