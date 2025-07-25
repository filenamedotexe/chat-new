import { auth } from '@/lib/auth/auth.config';
import { Main, PageContainer, Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@chat/ui';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { IconFiles, IconEye } from '@tabler/icons-react';
import Link from 'next/link';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { getRecentActivity } from '@/features/timeline/data/activity';
import { getAdminDashboardStats, getClientStatusOverview } from '@/features/admin/data/dashboard-simple';

export default async function DashboardPage() {
  const session = await auth();
  
  // If admin, get stats and activity
  if (session?.user.role === 'admin') {
    try {
      // Get all dashboard data in parallel
      const [stats, recentActivity, clientStatuses] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivity(10),
        getClientStatusOverview()
      ]);
      
      return (
        <Main>
          <PageContainer>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Platform overview and recent activity
              </p>
            </div>
            
            <AdminDashboard 
              stats={stats} 
              recentActivity={recentActivity} 
              clientStatuses={clientStatuses} 
            />
          </PageContainer>
        </Main>
      );
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    }
  }
  
  return (
    <Main>
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session?.user.name || session?.user.email}!
          </h1>
          <p className="text-muted-foreground">
            You&apos;re logged in as a {session?.user.role} user.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card hover>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>View and edit your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {session?.user.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {session?.user.role}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>View your recent conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent conversations
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customize your experience
              </p>
            </CardContent>
          </Card>

          <Card hover data-testid="my-files-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFiles className="h-5 w-5" />
                My Files
              </CardTitle>
              <CardDescription>View and manage your uploaded files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Access all your files across projects
                </p>
                <Link href={`/users/${session?.user.id}/files`}>
                  <Button size="sm" className="w-full">
                    <IconEye className="h-4 w-4 mr-2" />
                    View All Files
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Chat Assistant</CardTitle>
            <CardDescription>
              Start a conversation with our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChatInterface />
          </CardContent>
        </Card>
      </PageContainer>
    </Main>
  );
}