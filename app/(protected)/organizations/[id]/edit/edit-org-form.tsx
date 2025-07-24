'use client';

import { useRouter } from 'next/navigation';
import { OrgForm } from '@/features/organizations/components/org-form';
import type { Organization, NewOrganization } from '@/features/organizations/data/organizations';

interface EditOrgFormProps {
  organization: Organization;
}

export function EditOrgForm({ organization }: EditOrgFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: NewOrganization) => {
    const response = await fetch(`/api/organizations/${organization.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push(`/organizations/${organization.id}`);
      router.refresh();
    } else {
      throw new Error('Failed to update organization');
    }
  };

  const handleCancel = () => {
    router.push(`/organizations/${organization.id}`);
  };

  return (
    <OrgForm 
      organization={organization}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}