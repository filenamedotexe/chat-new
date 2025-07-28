import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get user role from metadata or database
  const role = user.user_metadata?.role || 'client';
  
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.email!.split('@')[0],
    role: role as 'admin' | 'team_member' | 'client'
  };
});