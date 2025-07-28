'use client';

import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('✅ Basic form working! Supabase auth coming next...');
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '400px', 
      padding: '2rem', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        🧪 Test Login Form
      </h2>
      
      {message && (
        <div style={{ 
          padding: '0.75rem', 
          marginBottom: '1rem',
          backgroundColor: '#f0f9ff',
          color: '#0369a1',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            margin: '0.5rem 0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          required
        />
        
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            marginTop: '1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Submit
        </button>
      </form>
    </div>
  );
}