'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Dynamic import to avoid SSR issues
      const { signInWithPassword } = await import('@/lib/supabase/auth-browser');
      
      console.log('🔐 Attempting Supabase login...');
      const { data, error } = await signInWithPassword(email, password);
      
      if (error) {
        setMessage(`❌ Login failed: ${error.message}`);
      } else if (data.user) {
        setMessage(`✅ Login successful! User: ${data.user.email}`);
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          🔐 Supabase Auth Login
        </h1>
        
        {message && (
          <div style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: message.includes('✅') ? '#e6f7ff' : '#fff2f0',
            color: message.includes('✅') ? '#0369a1' : '#dc2626',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSupabaseLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email (test@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#94a3b8' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 Signing in...' : '🚀 Sign In with Supabase'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Test credentials needed:</p>
          <p>Create a user in Supabase Auth first</p>
        </div>
      </div>
    </div>
  );
}