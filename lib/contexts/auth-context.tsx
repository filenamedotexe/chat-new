'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/auth-browser';

type AuthUser = User | null;
type AuthSession = Session | null;

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
  const useSupabaseAuth = true; // Always use Supabase


  // Supabase auth effect
  useEffect(() => {

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
  }, []);

  // NextAuth no longer used

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  const isAuthenticated = Boolean(user && session);

  const value: AuthContextType = {
    user,
    session,
    loading,
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