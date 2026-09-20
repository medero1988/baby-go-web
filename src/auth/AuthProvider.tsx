import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth';
import { session } from '@/lib/session';
import type { AuthUser, CreateAccountResponse } from '@/types/api';

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (input: {
    name: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<CreateAccountResponse>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => session.getUser());
  const [ready] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    session.setSession(result.accessToken, result.refreshToken, result.user);
    session.clearPendingAccount();
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = session.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // local session still has to die
    }
    session.clear();
    setUser(null);
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      const account = await authApi.createAccount(input);
      session.setPendingAccount({ id: account.id, email: account.email });
      return account;
    },
    [],
  );

  const value = useMemo(
    () => ({ user, ready, login, logout, register }),
    [user, ready, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
