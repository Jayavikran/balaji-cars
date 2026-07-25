import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AdminUser } from '@/types';
import { fetchCurrentAdmin, loginAdmin as loginAdminApi, logoutAdmin as logoutAdminApi } from '@/api/auth';

interface AuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentAdmin()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const user = await loginAdminApi(email, password, rememberMe);
    setAdmin(user);
  };

  const logout = async () => {
    await logoutAdminApi();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
