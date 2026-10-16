import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car,
  Compass,
  History,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Navigation,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { ridesApi } from '../../api/rides.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-rides', 'passenger', 1, 5],
    queryFn: () => ridesApi.getMyRides('passenger', 1, 5),
  });

  const rides = data?.rides || [];
  const activeRide = rides.find(
    (r) => !['COMPLETED', 'CANCELLED'].includes(r.status)
  );

  // Compute passenger summary metrics from loaded rides
  const completedRides = rides.filter((r) => r.status === 'COMPLETED');
  const totalSpent = completedRides.reduce((acc, r) => acc + Number(r.fare || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-8 overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-electric-500">
              Passenger Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Where would you like to go today? Pick your destination on our live map or view your trip history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/book">
              <Button variant="accent" size="lg" className="font-bold text-slate-950" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Request a Ride
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Ride Banner if currently in a ride */}
      {activeRide && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-electric-500/20 via-slate-900 to-slate-950 border border-electric-500/40 text-white shadow-limeGlow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-electric-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-electric-400 uppercase tracking-wider">
                  Active Ride in Progress
                </span>
                <Badge status={activeRide.status} size="sm" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                {activeRide.status === 'SEARCHING'
                  ? 'Finding nearest driver...'
                  : `Driver: ${activeRide.driver?.user.name || 'Assigned'}`}
              </p>
            </div>
          </div>
          <Link to={`/rides/${activeRide.id}`}>
            <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Tracking Map
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rides Taken</span>
            <Compass className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.total ?? 0}</p>
          <p className="text-[11px] text-slate-400">All registered trips on your account</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Safely</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{completedRides.length}</p>
          <p className="text-[11px] text-slate-400">Successful arrivals at destination</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <CreditCard className="w-4 h-4 text-electric-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalSpent.toFixed(2)} <span className="text-xs font-semibold text-slate-500">ETB</span>
          </p>
          <p className="text-[11px] text-slate-400">Calculated transparent fare volume</p>
        </Card>
      </div>

      {/* Recent Rides Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Rides</h2>
          <Link to="/passenger/history" className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1">
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-20 w-full" />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No Rides Yet"
            description="You haven't requested any rides yet. Try booking your first trip across Addis Ababa today!"
            actionLabel="Book a Ride Now"
            onAction={() => (window.location.href = '/book')}
          />
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Card
                key={ride.id}
                variant="default"
                className="p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(ride.requestedAt).toLocaleDateString()}
                      </span>
                      <Badge status={ride.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Pickup: {Number(ride.pickupLatitude).toFixed(4)}, {Number(ride.pickupLongitude).toFixed(4)} → Dest: {Number(ride.destinationLatitude).toFixed(4)}, {Number(ride.destinationLongitude).toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      {Number(ride.fare || 0).toFixed(2)} {ride.currency}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {ride.driver ? `Driver: ${ride.driver.user.name}` : 'No driver assigned'}
                    </p>
                  </div>
                  <Link to={`/rides/${ride.id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
