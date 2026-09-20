import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';
import { session } from '@/lib/session';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pending = session.getPendingAccount();
  const emailFromState = (location.state as { email?: string } | null)?.email;
  const [accountId, setAccountId] = useState(pending?.id ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.verifyEmail({ accountId, code });
      session.clearPendingAccount();
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    setInfo('');
    try {
      await authApi.resendEmailCode(accountId);
      setInfo('Te reenviamos el código.');
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <AuthLayout
      title="Verificá el email"
      subtitle={`Enviamos un código de 6 dígitos a ${pending?.email || emailFromState || 'tu casilla'}.`}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        {info ? (
          <div className="rounded-2xl bg-sage/10 px-4 py-3 text-sm text-sage">
            {info}
          </div>
        ) : null}
        {!pending ? (
          <Input
            label="ID de cuenta"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            hint="Lo devolvió el alta. Si venís del registro, ya está cargado."
          />
        ) : null}
        <Input
          label="Código"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Verificar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={resend}
        >
          Reenviar código
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-ink">
          Ir a login
        </Link>
      </p>
    </AuthLayout>
  );
}
