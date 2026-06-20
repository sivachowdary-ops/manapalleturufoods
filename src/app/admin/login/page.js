'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getDbMode } from '@/lib/db';
import { Lock, Mail, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dbMode, setDbMode] = useState('MockStorage');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDbMode(getDbMode());
    // If already logged in, redirect to dashboard
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('mp_admin_session');
      if (session === 'active') {
        router.push('/admin/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (dbMode === 'Supabase') {
        // Real Supabase Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        // Set session indicator
        sessionStorage.setItem('mp_admin_session', 'active');
        sessionStorage.setItem('mp_admin_email', data.user.email);
        
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => router.push('/admin/dashboard'), 1000);
      } else {
        // Mock Storage Mode Authentication
        // Verify against default admin credentials or registered mock users
        const mockUsers = JSON.parse(localStorage.getItem('mp_mock_users') || '[]');
        const isValidMockUser = mockUsers.some(u => u.email === email.trim() && u.password === password);
        const isDefaultAdmin = email.trim() === 'admin@manapalleturufoods.com' && password === 'admin';

        if (isValidMockUser || isDefaultAdmin) {
          sessionStorage.setItem('mp_admin_session', 'active');
          sessionStorage.setItem('mp_admin_email', email.trim());
          
          setSuccessMsg('Logged in (Mock Mode)! Redirecting...');
          setTimeout(() => router.push('/admin/dashboard'), 1000);
        } else {
          throw new Error('Invalid email or password for mock mode.');
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Mana Palleturu Foods</h1>
          <p className="login-subtitle">Admin Dashboard Authentication</p>
        </div>

        {dbMode === 'MockStorage' && (
          <div className="db-warning-bar">
            <ShieldAlert size={18} />
            <div>
              Running in <strong>Mock Storage Mode</strong>.<br />
              Use email: <code style={{ color: 'var(--color-primary-dark)' }}>admin@manapalleturufoods.com</code><br />
              Password: <code style={{ color: 'var(--color-primary-dark)' }}>admin</code>
            </div>
          </div>
        )}

        {errorMsg && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-danger-bg)', 
              color: 'var(--color-danger)', 
              border: '1px solid var(--color-danger)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.85rem', 
              marginBottom: '1.5rem', 
              fontWeight: 500 
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div 
            style={{ 
              backgroundColor: 'var(--color-success-bg)', 
              color: 'var(--color-success)', 
              border: '1px solid var(--color-success)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.85rem', 
              marginBottom: '1.5rem', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-light)' }} />
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="admin@manapalleturufoods.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-light)' }} />
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Manager'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--color-text-light)', textDecoration: 'underline' }}>
              ← Return to Main Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
