import { auth } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';
import { Main, PageContainer } from '@chat/ui';
import { TimelineFull } from '@/features/timeline/components/timeline';
import { getActivityLogs } from '@/features/timeline/data/activity';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';

export default async function ActivityPage() {
  const session = await auth();
  
  // Only admins can view this page
  if (session?.user.role !== 'admin') {
    redirect('/dashboard');
  }
  
  // Get all activity logs
  const activities = await getActivityLogs({ limit: 100 });
  
  return (
    <Main>
      <PageContainer>
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">Activity Timeline</h1>
          <p className="text-muted-foreground">
            View all platform activity and audit trail
          </p>
        </div>
        
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {activities.length} most recent activities
          </p>
        </div>
        
        <TimelineFull activities={activities} />
      </PageContainer>
    </Main>
  );
}