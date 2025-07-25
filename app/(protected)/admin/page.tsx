import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { Main, PageContainer, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { FeatureFlagsManager } from '@/features/admin/components/feature-flags-manager';
import { sql } from '@chat/database';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get basic stats
  const userCount = await sql`SELECT COUNT(*) as count FROM users`;
  const featureCount = await sql`SELECT COUNT(*) as count FROM features`;

  return (
    <Main>
      <PageContainer>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, features, and system settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount[0].count}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Feature flags</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{featureCount[0].count}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Overall health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-green-600">Operational</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Feature Management</h2>
          <FeatureFlagsManager />
        </div>
      </PageContainer>
    </Main>
  );
}

