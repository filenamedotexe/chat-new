import { OrgList } from '@/features/organizations/components/org-list';
import { Button } from '@chat/ui';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth.config';
import { getOrganizations } from '@/features/organizations/data/organizations';
import { redirect } from 'next/navigation';
import type { UserRole } from '@chat/shared-types';

export default async function OrganizationsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Clients shouldn't access this page
  if (session.user.role === 'client') {
    redirect('/dashboard');
  }

  const organizations = await getOrganizations(session.user.id, session.user.role as UserRole);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link href="/organizations/new">
          <Button>Create Organization</Button>
        </Link>
      </div>
      
      <OrgList organizations={organizations} />
    </div>
  );
}