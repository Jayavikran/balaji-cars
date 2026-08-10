import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Public pages (the vast majority of traffic) never need admin auth
    // state, so skip the GET /admin/auth/me call entirely for them —
    // previously every page load fired this request and it always 401'd
    // for non-admin visitors. Only check once, the first time an /admin
    // route is reached (including via client-side navigation into it).
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAdminRoute) {
      if (!hasCheckedRef.current) setIsLoading(false);
      return;
    }
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    fetchCurrentAdmin()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setIsLoading(false));
  }, [location.pathname]);

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
