'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('chatUser', JSON.stringify(userData));
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', margin: '0 auto' }}>
        <div>
          <h2 style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: '800', color: '#111827' }}>
            Registrarse
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
              <label htmlFor="name" style={{ display: 'none' }}>
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="Tu nombre completo"
              />
            </div>
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
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Tu contraseña"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" style={{ display: 'none' }}>
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                placeholder="Confirma tu contraseña"
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
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              ¿Ya tienes cuenta?{' '}
              <button 
                type="button"
                onClick={() => router.push('/login')}
                style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}