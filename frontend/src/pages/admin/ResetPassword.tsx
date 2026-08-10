import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '@/api/auth';

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<ResetPasswordValues>();

  const password = watch('password');

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error('Reset link is invalid or has expired.');
      return;
    }
    try {
      const message = await resetPassword(token, values.password);
      toast.success(message || 'Password updated. You can now log in.');
      navigate('/admin/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset link is invalid or has expired.');
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
          <h1 className="text-white font-display font-bold text-2xl">Reset Password</h1>
          <p className="text-white/60 text-sm mt-1">Choose a new password for your admin account</p>
        </div>

        <div className="bg-white rounded-card shadow-cardHover p-7">
          {!token ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-body">This reset link is invalid or has expired.</p>
              <Link to="/admin/login" className="btn-primary w-full bg-emerald hover:bg-emerald-dark inline-flex justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">New Password</label>
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

              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: true,
                      validate: (value) => value === password || 'Passwords do not match.',
                    })}
                    placeholder="••••••••"
                    className="w-full border border-line rounded-xl pl-10 pr-3 py-2.5 text-sm focus:border-navy outline-none"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message || 'Passwords do not match.'}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full bg-emerald hover:bg-emerald-dark disabled:opacity-60">
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>

              <Link to="/admin/login" className="block text-center text-sm text-navy font-medium hover:underline">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
