'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@chat/ui';
import { Input } from '@chat/ui';
import { Card } from '@chat/ui';
import { signInWithPassword } from '@/lib/supabase/auth-browser';
import { isFeatureEnabled } from '@/packages/database/src';
import { FEATURES } from '@/lib/features/constants';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSupabaseAuth, setUseSupabaseAuth] = useState(false);

  useEffect(() => {
    async function checkSupabaseAuth() {
      try {
        const enabled = await isFeatureEnabled(FEATURES.SUPABASE_AUTH);
        setUseSupabaseAuth(enabled);
      } catch (error) {
        console.error('Error checking Supabase auth feature:', error);
        setUseSupabaseAuth(false);
      }
    }
    checkSupabaseAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (useSupabaseAuth) {
        const { data, error } = await signInWithPassword(email, password);
        
        if (error) {
          setError(error.message || 'Invalid email or password');
        } else if (data.user) {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
          {useSupabaseAuth && (
            <div className="text-xs text-center text-blue-600 mb-2">
              Using Supabase Auth
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </Card>
  );
}