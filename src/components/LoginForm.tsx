"use client";

import { useState } from 'react';

interface LoginFormProps {
  onLogin: (success: boolean) => void;
}

const Button = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <button 
    style={{ 
      background: '#667eea', 
      color: 'white', 
      padding: '12px 24px', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      margin: '8px 0', 
      fontSize: '16px', 
      fontWeight: '500',
      width: '100%'
    }} 
    {...props}
  >
    {children}
  </button>
);

const Input = (props: any) => (
  <input 
    style={{ 
      padding: '12px 16px', 
      width: '100%', 
      border: '2px solid #e1e5e9', 
      borderRadius: '8px', 
      fontSize: '16px', 
      marginBottom: '16px',
      boxSizing: 'border-box'
    }} 
    {...props} 
  />
);

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'boardx') {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid password. Please try again.');
      onLogin(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1a202c', 
            marginBottom: '8px' 
          }}>
            🎯 PPTGen Access
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#718096' 
          }}>
            Enter password to access the AI presentation generator
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter access password"
            autoFocus
          />
          
          {error && (
            <div style={{
              background: '#fed7d7',
              border: '1px solid #fc8181',
              color: '#c53030',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <Button type="submit">
            🔓 Access PPTGen
          </Button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f7fafc',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#4a5568'
        }}>
          💡 This is a secure AI-powered presentation generator with template selection
        </div>
      </div>
    </div>
  );
}
