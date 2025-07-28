import { getUser } from '@/lib/auth/get-user';
import { Main, PageContainer } from '@chat/ui';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { TeamDashboard } from '@/features/dashboard/components/team-dashboard';
import { ClientDashboard } from '@/features/dashboard/components/client-dashboard';
import { getRecentActivity } from '@/features/timeline/data/activity';
import { getAdminDashboardStats, getClientStatusOverview } from '@/features/admin/data/dashboard-simple';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Admin Dashboard
  if (user.role === 'admin') {
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
  if (user.role === 'team_member') {
    const recentActivity = await getRecentActivity(10);
    return (
      <Main>
        <PageContainer>
          <TeamDashboard 
            userId={user.id}
            userName={user.name}
            userEmail={user.email}
            recentActivity={recentActivity}
          />
        </PageContainer>
      </Main>
    );
  }
  
  // Client Dashboard
  if (user.role === 'client') {
    const recentActivity = await getRecentActivity(10);
    return (
      <Main>
        <PageContainer>
          <ClientDashboard
            userId={user.id}
            userName={user.name}
            userEmail={user.email}
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
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            You&apos;re logged in as a {user.role} user.
          </p>
        </div>
        <p className="text-muted-foreground">
          Dashboard content for your role is being prepared.
        </p>
      </PageContainer>
    </Main>
  );
}