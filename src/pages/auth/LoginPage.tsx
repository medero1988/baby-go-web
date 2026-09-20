import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { ApiError } from '@/types/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'email_not_verified') {
        navigate('/verify-email', { state: { email } });
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar al panel"
      subtitle="Usá la cuenta del provider para ver tienda, catálogo y movimientos."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-terracotta"
          >
            Olvidé la contraseña
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-ink">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
