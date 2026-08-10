import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import ScrollToTop from '@/components/shared/ScrollToTop';
import CompareBar from '@/components/public/CompareBar';

// Route-level code splitting: the public site and the admin panel are
// completely separate audiences, so a customer's browser never has to
// download admin dashboard/chart/form code, and vice versa. Each import()
// becomes its own chunk that Vite loads only when that route is visited.
const Home = lazy(() => import('@/pages/public/Home'));
const About = lazy(() => import('@/pages/public/About'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const CarDetails = lazy(() => import('@/pages/public/CarDetails'));
const Compare = lazy(() => import('@/pages/public/Compare'));
const PrivacyPolicy = lazy(() => import('@/pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/public/TermsOfService'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const ResetPassword = lazy(() => import('@/pages/admin/ResetPassword'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const UploadCar = lazy(() => import('@/pages/admin/UploadCar'));
const ManageCars = lazy(() => import('@/pages/admin/ManageCars'));
const EditCar = lazy(() => import('@/pages/admin/EditCar'));
const Enquiries = lazy(() => import('@/pages/admin/Enquiries'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-line dark:border-white/20 border-t-navy dark:border-t-emerald rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isComparePage = location.pathname === '/compare';

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ---------------- Public website ---------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cars/:idOrSlug" element={<CarDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* ---------------- Admin panel (fully separate) ---------------- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
          />

          <Route
            path="/admin/analytics"
            element={<ProtectedRoute><Analytics /></ProtectedRoute>}
          />

          <Route
            path="/admin/upload"
            element={<ProtectedRoute><UploadCar /></ProtectedRoute>}
          />

          <Route
            path="/admin/cars"
            element={<ProtectedRoute><ManageCars /></ProtectedRoute>}
          />

          <Route
            path="/admin/edit/:id"
            element={<ProtectedRoute><EditCar /></ProtectedRoute>}
          />

          <Route
            path="/admin/enquiries"
            element={<ProtectedRoute><Enquiries /></ProtectedRoute>}
          />

          <Route
            path="/admin/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />

          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          {/* ---------------- Fallback ---------------- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && !isComparePage && <CompareBar />}
    </div>
  );
}
