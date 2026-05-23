'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if session is already active
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push('/admin/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials. Access Denied.');
      }
    } catch (err) {
      setError('Connection failed. Server offline.');
    } finally {
      setSubmitting(false);
    }
  };

  // High-fidelity neon login loading screen
  if (checkingSession) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loginCard} style={{ alignItems: 'center' }}>
          <div className="loader-ring" style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(118, 255, 3, 0.1)',
            borderTopColor: 'var(--accent-neon)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{
            fontFamily: 'Syne',
            color: 'var(--accent-neon)',
            textShadow: 'var(--accent-neon-text-glow)',
            fontSize: '0.85rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase'
          }}>Verifying Portal Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginOverlay}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Studio GFX</h1>
          <span className={styles.loginSubtitle}>Admin Portal Entry</span>
        </div>

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="form-label" style={{
              fontSize: '0.75rem',
              fontFamily: 'Syne',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)'
            }}>Administrative User</label>
            <input 
              type="text" 
              required 
              placeholder="Enter username" 
              className="form-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="form-label" style={{
              fontSize: '0.75rem',
              fontFamily: 'Syne',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)'
            }}>Password Key</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••••••" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="status-message" style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-neon" 
            style={{ width: '100%', marginTop: '10px' }}
          >
            {submitting ? 'Decrypting Entry...' : 'Authenticate Credentials'}
          </button>
        </form>

        <Link href="/" style={{
          fontSize: '0.8rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}>
          Return to Public Site
        </Link>
      </div>
    </div>
  );
}
