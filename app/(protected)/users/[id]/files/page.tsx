import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { Button } from '@chat/ui';
import { IconArrowLeft, IconFiles } from '@tabler/icons-react';
import Link from 'next/link';
import { UserFileManager } from '@/features/files/components/user-file-manager';

interface UserFilesPageProps {
  params: {
    id: string;
  };
}

export default async function UserFilesPage({ params }: UserFilesPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Permission check: users can only see their own files unless they're admin
  if (session.user.role !== 'admin' && session.user.id !== params.id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to view these files.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnFiles = session.user.id === params.id;
  const userName = isOwnFiles ? 'Your' : session.user.name || 'User';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <IconFiles className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {isOwnFiles ? 'My Files' : `Files by ${userName}`}
            </h1>
            <p className="text-muted-foreground">
              {isOwnFiles 
                ? 'Manage all your uploaded files across projects'
                : 'View all files uploaded by this user'
              }
            </p>
          </div>
        </div>
      </div>

      {/* File Manager */}
      <UserFileManager 
        userId={params.id}
        className="max-w-none"
      />

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/projects">
            <Button variant="outline">
              View Projects
            </Button>
          </Link>
          {session.user.role !== 'client' && (
            <Link href="/tasks">
              <Button variant="outline">
                View All Tasks
              </Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}