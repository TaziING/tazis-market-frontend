import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Credenciales inválidas';
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (loginError: unknown) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-void p-4 text-bone">
      <section className="w-full max-w-md border border-blood bg-shadow p-6 sm:p-8">
        <h1 className="mb-6 font-display text-3xl text-alarm">Iniciar Sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="login-email" className="font-body text-sm">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="font-body text-sm">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
            />
          </div>

          {error && <p role="alert" className="text-sm text-alarm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alarm py-3 font-display text-bone transition hover:bg-blood disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 font-body text-sm text-bone">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blood transition hover:text-alarm">
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
