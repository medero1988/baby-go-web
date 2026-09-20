import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ErrorBanner } from '@/components/ui/Feedback';
import { errorMessage } from '@/lib/errors';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name, lastName, email, password });
      navigate('/verify-email');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Creá tu cuenta para publicar tienda y catálogo. El tipo de usuario lo define el flujo, no un campo role."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <ErrorBanner message={error} /> : null}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Apellido"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          minLength={8}
          required
          hint="Mínimo 8 caracteres."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Crear cuenta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-ink">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
