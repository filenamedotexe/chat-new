import { auth } from '@/lib/auth/auth.config';
import { Main, PageContainer, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default async function DashboardPage() {
  const session = await auth();
  
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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