import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  XCircle,
  ArrowRight,
  Car,
} from 'lucide-react';
import { driversApi } from '../../api/drivers.api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const onboardingSchema = z.object({
  licenseNumber: z
    .string()
    .min(5, 'Driver license number is required (min 5 characters)'),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export const DriverOnboardingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: driverProfile, isLoading } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driversApi.getMyProfile(),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
  });

  const registerDriverMutation = useMutation({
    mutationFn: (data: OnboardingFormValues) => driversApi.register(data),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      // Update local roles if needed
      if (user && !user.roles.includes('DRIVER')) {
        setUser({ ...user, roles: [...user.roles, 'DRIVER'] });
      }
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Driver Onboarding & Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply to become an authorized RideLink driver and inspect your official verification status
        </p>
      </div>

      {/* If driver already has a profile registered */}
      {driverProfile ? (
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Official License ID
              </p>
              <p className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                {driverProfile.licenseNumber}
              </p>
            </div>
            <Badge status={driverProfile.verificationStatus} size="md" />
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Verification Progress Timeline
            </h3>

            <div className="space-y-4">
              {/* Step 1: Submission */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-950 text-electric-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Application Submitted</h4>
                  <p className="text-xs text-slate-500">
                    License document submitted on {new Date(driverProfile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Step 2: Admin Review */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    driverProfile.verificationStatus === 'APPROVED'
                      ? 'bg-slate-950 text-emerald-400'
                      : driverProfile.verificationStatus === 'REJECTED' ||
                        driverProfile.verificationStatus === 'SUSPENDED'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-600 animate-pulse'
                  }`}
                >
                  {driverProfile.verificationStatus === 'APPROVED' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : driverProfile.verificationStatus === 'REJECTED' ||
                    driverProfile.verificationStatus === 'SUSPENDED' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Administrative Compliance Review
                  </h4>
                  <p className="text-xs text-slate-500">
                    {driverProfile.verificationStatus === 'APPROVED'
                      ? `Approved by Platform Admin on ${
                          driverProfile.verifiedAt
                            ? new Date(driverProfile.verifiedAt).toLocaleDateString()
                            : 'Confirmed'
                        }`
                      : driverProfile.verificationStatus === 'PENDING'
                      ? 'Pending manual verification from RideLink Admin team.'
                      : `Status: ${driverProfile.verificationStatus}. ${
                          driverProfile.rejectionReason
                            ? `Reason: "${driverProfile.rejectionReason}"`
                            : ''
                        }`}
                  </p>
                </div>
              </div>

              {/* Step 3: Fleet Dispatch Ready */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    driverProfile.verificationStatus === 'APPROVED'
                      ? 'bg-electric-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Vehicle Fleet & Dispatch</h4>
                  <p className="text-xs text-slate-500">
                    {driverProfile.verificationStatus === 'APPROVED'
                      ? 'You are authorized to register vehicles, switch to AVAILABLE, and accept passenger rides.'
                      : 'Unlocks after compliance approval.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {driverProfile.verificationStatus === 'APPROVED' && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <Link to="/driver/vehicles">
                <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Manage Vehicles
                </Button>
              </Link>
              <Link to="/driver/availability">
                <Button variant="secondary" size="sm">
                  Go Online (Availability)
                </Button>
              </Link>
            </div>
          )}
        </Card>
      ) : (
        /* Application Form if not registered */
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Driver Application Form
            </h2>
            <p className="text-xs text-slate-500">
              Provide your government-issued driver license identifier to initiate background compliance.
            </p>
          </div>

          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit((d) => registerDriverMutation.mutate(d))} className="space-y-4">
            <Input
              label="Driver License Number"
              placeholder="e.g. DL-AA-12345678"
              leftIcon={<FileCheck className="w-4 h-4" />}
              helperText="Official license registration identifier issued by transport authority"
              error={errors.licenseNumber?.message}
              {...register('licenseNumber')}
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold text-slate-950 mt-4"
              isLoading={registerDriverMutation.isPending}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Submit Driver Application
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
