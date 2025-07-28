import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { OrganizationForm } from './organization-form';

export default async function NewOrganizationPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Only admins can create organizations
  if (user.role !== 'admin') {
    redirect('/organizations');
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Organization</h1>
      
      <OrganizationForm />
    </div>
  );
}