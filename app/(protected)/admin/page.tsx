import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, isAdmin } from '@chat/auth';
import { Main, PageContainer, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { sql } from '@chat/database';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !isAdmin(session.user)) {
    redirect('/dashboard');
  }

  // Get stats
  const userCount = await sql`SELECT COUNT(*) as count FROM users`;
  const adminCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
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
              <CardTitle>Admins</CardTitle>
              <CardDescription>Admin users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{adminCount[0].count}</p>
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentUsers />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>System feature toggles</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureFlags />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </Main>
  );
}

async function RecentUsers() {
  const recentUsers = await sql`
    SELECT id, email, name, role, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 5
  `;

  return (
    <div className="space-y-3">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium text-sm">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
            {user.role}
          </span>
        </div>
      ))}
    </div>
  );
}

async function FeatureFlags() {
  const features = await sql`
    SELECT id, name, description, enabled 
    FROM features 
    ORDER BY name
  `;

  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="font-medium text-sm">{feature.name}</p>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md ${
            feature.enabled 
              ? 'bg-green-500/10 text-green-600' 
              : 'bg-red-500/10 text-red-600'
          }`}>
            {feature.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      ))}
    </div>
  );
}