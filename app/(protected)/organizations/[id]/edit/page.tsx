import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { getOrganizationById } from '@/features/organizations/data/organizations';
import { Button, Card } from '@chat/ui';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { EditOrgForm } from './edit-org-form';

interface EditOrganizationPageProps {
  params: {
    id: string;
  };
}

export default async function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Only admins can edit organizations
  if (user.role !== 'admin') {
    redirect('/organizations');
  }

  const organization = await getOrganizationById(params.id);
  
  if (!organization) {
    redirect('/organizations');
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6">
        <Link href={`/organizations/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Organization
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Edit Organization</h1>
        <p className="text-muted-foreground mt-2">
          Update organization details
        </p>
      </div>

      <Card className="p-6">
        <EditOrgForm organization={organization} />
      </Card>
    </div>
  );
}