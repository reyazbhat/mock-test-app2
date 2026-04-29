'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="header-banner">
      <Link href="/" className="brand">
        🎓 JKSSBMock Tests
      </Link>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {status === 'loading' ? (
          <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
        ) : session ? (
          <>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {session.user?.name || session.user?.email}
            </span>
            <button 
              onClick={() => signOut()} 
              className="btn btn-outline" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
              Login
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
