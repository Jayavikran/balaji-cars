import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

/**
 * Wraps every /admin/* route (except /admin/login). If there is no
 * authenticated session, the user is redirected to /admin/login and
 * the original destination is preserved so we can return them there
 * after a successful login.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
