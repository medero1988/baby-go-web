const ACCESS_KEY = 'baby-go.accessToken';
const REFRESH_KEY = 'baby-go.refreshToken';
const USER_KEY = 'baby-go.user';
const PENDING_ACCOUNT_KEY = 'baby-go.pendingAccount';

export type StoredUser = {
  id: string;
  email: string;
  name?: string;
  lastName?: string;
  picture?: string;
  provider: string;
  emailVerified?: boolean;
};

export type PendingAccount = {
  id: string;
  email: string;
};

export const session = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  getUser: (): StoredUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  setSession: (accessToken: string, refreshToken: string, user: StoredUser) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  updateTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getPendingAccount: (): PendingAccount | null => {
    const raw = sessionStorage.getItem(PENDING_ACCOUNT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingAccount;
    } catch {
      return null;
    }
  },
  setPendingAccount: (account: PendingAccount) => {
    sessionStorage.setItem(PENDING_ACCOUNT_KEY, JSON.stringify(account));
  },
  clearPendingAccount: () => {
    sessionStorage.removeItem(PENDING_ACCOUNT_KEY);
  },
};
