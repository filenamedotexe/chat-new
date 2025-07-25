import { auth } from '@/lib/auth/auth.config';
import { redirect } from 'next/navigation';
import { OrganizationForm } from './organization-form';

export default async function NewOrganizationPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Only admins can create organizations
  if (session.user.role !== 'admin') {
    redirect('/organizations');
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Organization</h1>
      
      <OrganizationForm />
    </div>
  );
}