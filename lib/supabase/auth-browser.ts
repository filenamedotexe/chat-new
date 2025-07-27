// Browser-side Supabase Auth Helpers
// Handles client-side authentication with Supabase

import { createClient } from './client';
import type { User, Session } from '@supabase/supabase-js';

// Create browser client instance
export function getSupabaseBrowserClient() {
  return createClient();
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
}

// Sign up new user
export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  return { data, error };
}

// Sign out
export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

// Get user with role from our users table
export async function getCurrentUserWithRole() {
  const supabase = getSupabaseBrowserClient();
  
  // First get the auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, profile: null, error: authError };
  }
  
  // Then get the user profile with role from our users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { 
    user, 
    profile, 
    error: profileError 
  };
}

// Listen to auth state changes
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const supabase = getSupabaseBrowserClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  
  return subscription;
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  
  return { data, error };
}

// Update password
export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  return { data, error };
}

// Update user metadata
export async function updateUserMetadata(metadata: Record<string, unknown>) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });
  
  return { data, error };
}