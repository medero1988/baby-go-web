import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState =
    (location.state as { email?: string } | null)?.email ?? '';
  const [email, setEmail] = useState(emailFromState);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.newPassword({ email, recoveryCode, newPassword });
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Usá el código que te llegó por mail y elegí una contraseña nueva."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Código"
          required
          maxLength={6}
          value={recoveryCode}
          onChange={(e) => setRecoveryCode(e.target.value)}
        />
        <Input
          label="Nueva contraseña"
          type="password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Guardar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-ink">
          Volver a login
        </Link>
      </p>
    </AuthLayout>
  );
}
