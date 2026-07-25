import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { requestPasswordReset } from '@/api/auth';

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function AdminLogin() {
  const { admin, isLoading, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginValues>();

  if (!isLoading && admin) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password, !!values.rememberMe);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password.');
    }
  };

  const onForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    try {
      const message = await requestPasswordReset(forgotEmail);
      toast.success(message);
      setForgotMode(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1568605117276-ee842e888a0f?q=80&w=2000&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/85" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald flex items-center justify-center text-white font-display font-bold text-xl mb-3">
            CC
          </div>
          <h1 className="text-white font-display font-bold text-2xl">BALAJI CARS Admin</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to manage your inventory</p>
        </div>

        <div className="bg-white rounded-card shadow-cardHover p-7">
          {!forgotMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    placeholder="admin@BALAJI CARS.com"
                    className="w-full border border-line rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-navy outline-none"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">Email is required.</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: true, minLength: 6 })}
                    placeholder="••••••••"
                    className="w-full border border-line rounded-xl pl-10 pr-10 py-2.5 text-sm focus:border-navy outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters.</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-body cursor-pointer">
                  <input type="checkbox" {...register('rememberMe')} className="accent-emerald" />
                  Remember Me
                </label>
                <button type="button" onClick={() => setForgotMode(true)} className="text-navy font-medium hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full bg-emerald hover:bg-emerald-dark disabled:opacity-60">
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={onForgotSubmit} className="space-y-4">
              <h3 className="font-display font-semibold text-ink">Reset your password</h3>
              <p className="text-sm text-body">Enter your admin email and we'll send you a reset link.</p>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@BALAJI CARS.com"
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm focus:border-navy outline-none"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setForgotMode(false)} className="btn-outline flex-1">Back</button>
                <button type="submit" disabled={forgotSubmitting} className="btn-primary flex-1 bg-emerald hover:bg-emerald-dark disabled:opacity-60">
                  {forgotSubmitting ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
