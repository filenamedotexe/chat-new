'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSession as useNextAuthSession } from 'next-auth/react';
import { Session as NextAuthSession } from 'next-auth';
import { getSupabaseBrowserClient } from '@/lib/supabase/auth-browser';
import { isFeatureEnabled } from '@/packages/database/src';
import { FEATURES } from '@/lib/features/constants';

type AuthUser = User | NextAuthSession['user'] | null;
type AuthSession = Session | NextAuthSession | null;

interface AuthContextType {
  user: AuthUser;
  session: AuthSession;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  useSupabaseAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<AuthSession>(null);
  const [loading, setLoading] = useState(true);
  const [useSupabaseAuth, setUseSupabaseAuth] = useState(false);
  const [featureCheckDone, setFeatureCheckDone] = useState(false);

  // NextAuth session fallback
  const { data: nextAuthSession, status: nextAuthStatus } = useNextAuthSession();

  // Check feature flag for auth system
  useEffect(() => {
    async function checkAuthSystem() {
      try {
        const enabled = await isFeatureEnabled(FEATURES.SUPABASE_AUTH);
        setUseSupabaseAuth(enabled);
      } catch (error) {
        console.error('Error checking Supabase auth feature:', error);
        setUseSupabaseAuth(false);
      } finally {
        setFeatureCheckDone(true);
      }
    }
    checkAuthSystem();
  }, []);

  // Supabase auth effect
  useEffect(() => {
    if (!featureCheckDone || !useSupabaseAuth) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setSession(null);
        } else {
          setUser(initialSession?.user ?? null);
          setSession(initialSession);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [featureCheckDone, useSupabaseAuth]);

  // NextAuth fallback effect
  useEffect(() => {
    if (!featureCheckDone) {
      return;
    }

    if (!useSupabaseAuth) {
      // Use NextAuth session
      setUser(nextAuthSession?.user ?? null);
      setSession(nextAuthSession);
      setLoading(nextAuthStatus === 'loading');
    }
  }, [featureCheckDone, useSupabaseAuth, nextAuthSession, nextAuthStatus]);

  const signOut = async () => {
    if (useSupabaseAuth) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } else {
      // Use NextAuth signOut
      const { signOut: nextAuthSignOut } = await import('next-auth/react');
      await nextAuthSignOut();
    }
  };

  const isAuthenticated = Boolean(user && session);

  const value: AuthContextType = {
    user,
    session,
    loading: loading || !featureCheckDone,
    isAuthenticated,
    signOut,
    useSupabaseAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Compatibility hook that matches the existing useSession interface
export function useSession() {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    user,
    isLoading: loading,
    isAuthenticated,
  };
}