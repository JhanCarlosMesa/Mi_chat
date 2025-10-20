'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatComponent from '@/components/ChatComponent';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('chatUser');
    if (user) {
      setIsAuthenticated(true);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('chatUser');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ width: '3rem', height: '3rem', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Cerrar sesión
        </button>
      </div>
      <ChatComponent />
    </main>
  );
}