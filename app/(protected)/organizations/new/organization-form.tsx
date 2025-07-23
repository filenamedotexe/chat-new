'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrgForm } from '@/features/organizations/components/org-form';
import type { NewOrganization } from '@/features/organizations/data/organizations';

export function OrganizationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NewOrganization) => {
    setError(null);
    
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create organization');
      }

      router.push('/organizations');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err; // Re-throw to keep the form in loading state
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      <OrgForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </>
  );
}