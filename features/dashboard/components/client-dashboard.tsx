'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@chat/ui';
import { IconFolder, IconProgress, IconCalendar, IconFiles, IconMessage, IconEye, IconDownload } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecentActivity } from './recent-activity';
import type { ActivityLog } from '@/packages/database/src/schema/activity';

interface ClientDashboardProps {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  recentActivity?: ActivityLog[];
}

export function ClientDashboard({ userId, userName, userEmail, recentActivity = [] }: ClientDashboardProps) {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>
          Welcome back, {userName || userEmail}!
        </h1>
        <p className="text-muted-foreground">
          Track your project progress and access deliverables
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={() => router.push('/projects')} className="h-auto py-4 flex-col gap-2">
          <IconFolder className="h-6 w-6" />
          <span>View Projects</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/files')} className="h-auto py-4 flex-col gap-2">
          <IconFiles className="h-6 w-6" />
          <span>Deliverables</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/projects')} className="h-auto py-4 flex-col gap-2">
          <IconProgress className="h-6 w-6" />
          <span>Recent Updates</span>
        </Button>
        <Button variant="secondary" onClick={() => router.push('/messages')} className="h-auto py-4 flex-col gap-2">
          <IconMessage className="h-6 w-6" />
          <span>Messages</span>
        </Button>
      </div>

      {/* Project Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <IconFolder className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">1 near completion</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <IconProgress className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
              <IconFiles className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">5 new this week</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 days</div>
            <p className="text-xs text-muted-foreground mt-1">Website launch</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Status of your active projects</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <IconEye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Website Redesign</p>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Final review phase</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Brand Identity Package</p>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Logo variations in progress</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Marketing Campaign</p>
                <span className="text-sm text-muted-foreground">40%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Content creation phase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Deliverables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Deliverables</CardTitle>
                <CardDescription>Latest files delivered to you</CardDescription>
              </div>
              <Link href="/files">
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
                <div className="flex items-center gap-3">
                  <IconFiles className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Homepage_Final_v3.pdf</p>
                    <p className="text-xs text-muted-foreground">2 days ago • 2.4 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <IconDownload className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <IconFiles className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Brand_Guidelines.pdf</p>
                    <p className="text-xs text-muted-foreground">1 week ago • 5.1 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <IconDownload className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <IconFiles className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Logo_Package.zip</p>
                    <p className="text-xs text-muted-foreground">2 weeks ago • 12.3 MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <IconDownload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Milestones</CardTitle>
            <CardDescription>Important dates for your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconCalendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Website Go-Live</p>
                  <p className="text-xs text-muted-foreground">March 15, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <IconCalendar className="h-5 w-5 text-warning" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Brand Review Meeting</p>
                  <p className="text-xs text-muted-foreground">March 20, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <IconCalendar className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Campaign Launch</p>
                  <p className="text-xs text-muted-foreground">April 1, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <RecentActivity activities={recentActivity} role="client" />
      )}
    </div>
  );
}