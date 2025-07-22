import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@chat/auth';
import { Layout, Header } from '@chat/ui';
import { Navigation } from '@/components/Navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <Layout>
      <Header>
        <Navigation user={session.user} />
      </Header>
      {children}
    </Layout>
  );
}