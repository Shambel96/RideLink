import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import { driversApi } from '../../api/drivers.api';
import { ridesApi } from '../../api/rides.api';
import { vehiclesApi } from '../../api/vehicles.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const DriverDashboard: React.FC = () => {
  const { data: driverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driversApi.getMyProfile(),
    retry: false,
  });

  const { data: myRidesData, isLoading: ridesLoading } = useQuery({
    queryKey: ['my-rides', 'driver', 1, 10],
    queryFn: () => ridesApi.getMyRides('driver', 1, 10),
    enabled: Boolean(driverProfile),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.findMine(),
    enabled: Boolean(driverProfile),
  });

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  // If user hasn't registered as a driver yet
  if (!driverProfile) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center mx-auto shadow-limeGlow">
          <Car className="w-8 h-8 stroke-[2]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Become a RideLink Driver
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You are not registered as a driver on the platform yet. Submit your official driver license to begin the verification process.
          </p>
        </div>
        <Link to="/driver/onboarding">
          <Button variant="accent" size="lg" className="font-bold text-slate-950">
            Complete Driver Onboarding
          </Button>
        </Link>
      </div>
    );
  }

  const isApproved = driverProfile.verificationStatus === 'APPROVED';
  const isOnline = driverProfile.availabilityStatus === 'AVAILABLE';
  const rides = myRidesData?.rides || [];
  const completedRides = rides.filter((r) => r.status === 'COMPLETED');
  const activeRide = rides.find((r) => !['COMPLETED', 'CANCELLED'].includes(r.status));
  const totalEarnings = completedRides.reduce((sum, r) => sum + Number(r.fare || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge status={driverProfile.verificationStatus} />
              <Badge status={driverProfile.availabilityStatus} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Driver Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              License Number: <span className="font-mono text-white">{driverProfile.licenseNumber}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/driver/availability">
              <Button
                variant={isOnline ? 'accent' : 'secondary'}
                size="sm"
                leftIcon={<Radio className="w-4 h-4" />}
              >
                {isOnline ? 'Manage Status (Online)' : 'Go Online'}
              </Button>
            </Link>
            {isApproved && isOnline && (
              <Link to="/driver/requests">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View Live Requests
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Verification Alert if not approved */}
        {!isApproved && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">
                {driverProfile.verificationStatus === 'PENDING'
                  ? 'Verification In Progress: '
                  : 'Action Required: '}
              </span>
              <span className="text-slate-300">
                {driverProfile.verificationStatus === 'PENDING'
                  ? 'Your license is currently under review by our administration team. You will be able to go online once approved.'
                  : `Status: ${driverProfile.verificationStatus}. Reason: ${driverProfile.rejectionReason || 'Contact support'}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Active Ride Banner */}
      {activeRide && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-electric-500/15 via-slate-900 to-slate-950 border border-electric-500/40 text-white shadow-limeGlow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-electric-400 uppercase tracking-wider">
                Assigned Trip In Progress
              </span>
              <Badge status={activeRide.status} size="sm" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Passenger: {activeRide.passenger?.name} ({activeRide.passenger?.phone})
            </p>
          </div>
          <Link to={`/rides/${activeRide.id}`}>
            <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Dispatch Controls
            </Button>
          </Link>
        </div>
      )}

      {/* Driver Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Trips</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{completedRides.length}</p>
          <p className="text-[11px] text-slate-400">Successfully completed dispatches</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <CreditCard className="w-4 h-4 text-electric-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalEarnings.toFixed(2)} <span className="text-xs font-semibold text-slate-500">ETB</span>
          </p>
          <p className="text-[11px] text-slate-400">Total verified earnings</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Fleet</span>
            <Car className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{vehicles?.length ?? 0}</p>
          <p className="text-[11px] text-slate-400">Registered vehicles ready for dispatch</p>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="default" className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-electric-600" />
            Live Ride Requests
          </h3>
          <p className="text-xs text-slate-500">
            Search for waiting passengers across Addis Ababa and accept bookings.
          </p>
          <Link to="/driver/requests" className="block pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              Open Requests Board
            </Button>
          </Link>
        </Card>

        <Card variant="default" className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-slate-700" />
            Vehicle Fleet
          </h3>
          <p className="text-xs text-slate-500">
            Register and manage your car models, plate numbers, and vehicle types.
          </p>
          <Link to="/driver/vehicles" className="block pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              Manage Vehicles
            </Button>
          </Link>
        </Card>

        <Card variant="default" className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            Trip Records
          </h3>
          <p className="text-xs text-slate-500">
            Review detailed receipts and history for all previous passenger journeys.
          </p>
          <Link to="/driver/history" className="block pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              View Log
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
