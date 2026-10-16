import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await authApi.login(values);
      setAuth(response.user, response.accessToken, response.refreshToken);

      if (from) {
        navigate(from, { replace: true });
      } else if (response.user.roles.includes('ADMIN')) {
        navigate('/admin', { replace: true });
      } else if (response.user.roles.includes('DRIVER')) {
        navigate('/driver', { replace: true });
      } else {
        navigate('/passenger', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Unable to sign in. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for 1-click test credentials
  const setQuickCreds = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setApiError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-electric-500 shadow-sm">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-950">
              Ride<span className="text-electric-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your rides, driver dispatch, or administration
          </p>
        </div>

        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              isPassword
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold text-slate-950"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Fill (Seeded Backend Accounts)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setQuickCreds('abebe@example.com', 'Passenger@123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left text-slate-700 transition-colors"
              >
                <div className="font-semibold text-slate-900">Passenger</div>
                <div className="text-[10px] text-slate-500 truncate">abebe@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => setQuickCreds('kebede.driver@example.com', 'Driver@1234')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left text-slate-700 transition-colors"
              >
                <div className="font-semibold text-slate-900">Approved Driver</div>
                <div className="text-[10px] text-slate-500 truncate">kebede.driver...</div>
              </button>
              <button
                type="button"
                onClick={() => setQuickCreds('admin@ridelink.com', 'Admin@1234')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left text-slate-700 transition-colors"
              >
                <div className="font-semibold text-slate-900">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@ridelink.com</div>
              </button>
              <button
                type="button"
                onClick={() => setQuickCreds('selam.driver@example.com', 'Driver@1234')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-left text-slate-700 transition-colors"
              >
                <div className="font-semibold text-slate-900">Pending Driver</div>
                <div className="text-[10px] text-slate-500 truncate">selam.driver...</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-slate-900 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
