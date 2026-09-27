import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
}

function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      setSuccess(true);
    } catch (registerError: unknown) {
      setError(getErrorMessage(registerError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-void p-4 text-bone">
      <section className="w-full max-w-md border border-blood bg-shadow p-6 sm:p-8">
        <h1 className="mb-6 font-display text-3xl text-alarm">Registro</h1>

        {success && (
          <p role="status" className="mb-5 font-body text-sm text-bone">
            Cuenta creada exitosamente.{' '}
            <Link to="/login" className="text-blood transition hover:text-alarm">
              Inicia sesión
            </Link>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="register-email" className="font-body text-sm">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="font-body text-sm">Contraseña</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm-password" className="font-body text-sm">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
            />
          </div>

          {error && <p role="alert" className="text-sm text-alarm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alarm py-3 font-display text-bone transition hover:bg-blood disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 font-body text-sm text-bone">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blood transition hover:text-alarm">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
