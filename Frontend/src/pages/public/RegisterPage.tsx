import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, User, Mail, Lock, Phone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, 'Phone number must be valid (e.g., +251911234567)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Must contain at least 1 uppercase, 1 lowercase, and 1 number',
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '+251',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await authApi.register(values);
      setAuth(response.user, response.accessToken, response.refreshToken);
      navigate('/passenger', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
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
            Create an account
          </h1>
          <p className="text-xs text-slate-500">
            Join RideLink to book fast rides or apply as a driver
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
              label="Full Name"
              placeholder="e.g. Abebe Bekele"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              placeholder="+251911234567"
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Include country code (e.g. +251 for Ethiopia)"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              isPassword
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              helperText="Include uppercase, lowercase, and a number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold text-slate-950 mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              By creating an account, you agree to RideLink's Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-slate-900 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
