import { auth } from '@/lib/auth/auth.config';
import { Main, PageContainer } from '@chat/ui';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { TeamDashboard } from '@/features/dashboard/components/team-dashboard';
import { ClientDashboard } from '@/features/dashboard/components/client-dashboard';
import { getRecentActivity } from '@/features/timeline/data/activity';
import { getAdminDashboardStats, getClientStatusOverview } from '@/features/admin/data/dashboard-simple';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <Main>
        <PageContainer>
          <p>Please log in to view your dashboard.</p>
        </PageContainer>
      </Main>
    );
  }

  // Admin Dashboard
  if (session.user.role === 'admin') {
    try {
      const [stats, recentActivity, clientStatuses] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivity(10),
        getClientStatusOverview()
      ]);
      
      return (
        <Main>
          <PageContainer>
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>Admin Dashboard</h1>
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
  
  // Team Member Dashboard
  if (session.user.role === 'team_member') {
    const recentActivity = await getRecentActivity(10);
    return (
      <Main>
        <PageContainer>
          <TeamDashboard 
            userId={session.user.id}
            userName={session.user.name}
            userEmail={session.user.email}
            recentActivity={recentActivity}
          />
        </PageContainer>
      </Main>
    );
  }
  
  // Client Dashboard
  if (session.user.role === 'client') {
    const recentActivity = await getRecentActivity(10);
    return (
      <Main>
        <PageContainer>
          <ClientDashboard
            userId={session.user.id}
            userName={session.user.name}
            userEmail={session.user.email}
            recentActivity={recentActivity}
          />
        </PageContainer>
      </Main>
    );
  }
  
  // Fallback for unknown roles
  return (
    <Main>
      <PageContainer>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="text-4xl font-bold" style={{ marginBottom: 'var(--space-2)' }}>
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="text-muted-foreground">
            You&apos;re logged in as a {session.user.role} user.
          </p>
        </div>
        <p className="text-muted-foreground">
          Dashboard content for your role is being prepared.
        </p>
      </PageContainer>
    </Main>
  );
}