'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@chat/ui';
import { IconClipboardList, IconCalendar, IconProgress, IconPlus, IconEye, IconUsers, IconClock } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecentActivity } from './recent-activity';
import type { ActivityLog } from '@/packages/database/src/schema/activity';

interface TeamDashboardProps {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  recentActivity?: ActivityLog[];
}

export function TeamDashboard({ userId, userName, userEmail, recentActivity = [] }: TeamDashboardProps) {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>
          Welcome back, {userName || userEmail}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your task overview and project status
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => router.push('/tasks/new')} className="h-auto py-4 flex-col gap-2">
          <IconPlus className="h-6 w-6" />
          <span>Create Task</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/tasks')} className="h-auto py-4 flex-col gap-2">
          <IconClipboardList className="h-6 w-6" />
          <span>My Tasks</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/projects')} className="h-auto py-4 flex-col gap-2">
          <IconProgress className="h-6 w-6" />
          <span>Projects</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/calendar')} className="h-auto py-4 flex-col gap-2">
          <IconCalendar className="h-6 w-6" />
          <span>Calendar</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">My Open Tasks</CardTitle>
              <IconClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">3 due this week</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">3 need updates</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <IconProgress className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">2 near deadline</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">4 with active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Today\'s Tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Tasks</CardTitle>
                <CardDescription>Tasks scheduled for today</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  <IconEye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Review homepage mockup</p>
                  <p className="text-xs text-muted-foreground">Acme Corp • Due in 2 hours</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-destructive text-destructive-foreground">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Update project timeline</p>
                  <p className="text-xs text-muted-foreground">TechStart • Due in 4 hours</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-warning text-warning-foreground">
                  Medium
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Client call preparation</p>
                  <p className="text-xs text-muted-foreground">Global Solutions • Due today</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-destructive text-destructive-foreground">
                  High
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Important project milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-destructive"></div>
                  <div>
                    <p className="text-sm font-medium">Acme Rebrand Phase 2</p>
                    <p className="text-xs text-muted-foreground">3 days remaining</p>
                  </div>
                </div>
                <Link href="/projects/acme-rebrand">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-warning"></div>
                  <div>
                    <p className="text-sm font-medium">TechStart Website Launch</p>
                    <p className="text-xs text-muted-foreground">Next week</p>
                  </div>
                </div>
                <Link href="/projects/techstart-website">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-success"></div>
                  <div>
                    <p className="text-sm font-medium">Global Campaign Review</p>
                    <p className="text-xs text-muted-foreground">2 weeks</p>
                  </div>
                </div>
                <Link href="/projects/global-campaign">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <RecentActivity activities={recentActivity} role="team_member" />
      )}
    </div>
  );
}