import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { Main, PageContainer } from '@chat/ui';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';
import { getAdminDashboardStats, getClientStatusOverview } from '@/features/admin/data/dashboard';
import { getRecentActivity } from '@/features/timeline/data/activity';

export default async function AdminPage() {
  const user = await getUser();
  
  if (!user || user?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get all required data
  const [stats, clientStatuses, recentActivity] = await Promise.all([
    getAdminDashboardStats(),
    getClientStatusOverview(),
    getRecentActivity(10)
  ]);

  return (
    <Main>
      <PageContainer>
        <AdminDashboard 
          stats={stats}
          clientStatuses={clientStatuses}
          recentActivity={recentActivity}
        />
      </PageContainer>
    </Main>
  );
}

