'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('chatUser', JSON.stringify(userData));
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.push('/');
      } else {
        setError('Error al iniciar sesión con Google');
      }
    } catch (err) {
      setError('Error de conexión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', margin: '0 auto' }}>
        <div>
          <h2 style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>
            Iniciar sesión
          </h2>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {error && (
            <div style={{ borderRadius: '0.375rem', backgroundColor: '#fef2f2', padding: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>
                {error}
              </div>
            </div>
          )}
          <div>
            <div>
              <label htmlFor="email-address" style={{ display: 'none' }}>
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  appearance: 'none', 
                  position: 'relative', 
                  display: 'block', 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  color: '#111827', 
                  borderRadius: '0.375rem', 
                  outline: 'none',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="tu@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'none' }}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  appearance: 'none', 
                  position: 'relative', 
                  display: 'block', 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  color: '#111827', 
                  borderRadius: '0.375rem', 
                  outline: 'none',
                  fontSize: '0.875rem'
                }}
                placeholder="Tu contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid transparent',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '0.375rem',
                color: 'white',
                backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '1rem'
              }}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
          
          {/* Google Login Button */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
              <div style={{ padding: '0 1rem', color: '#6b7280', fontSize: '0.875rem' }}>o continúa con</div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                fontWeight: '500',
                borderRadius: '0.375rem',
                color: '#111827',
                backgroundColor: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem'
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Iniciar sesión con Google
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              ¿No tienes cuenta?{' '}
              <button 
                type="button"
                onClick={() => router.push('/register')}
                style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}