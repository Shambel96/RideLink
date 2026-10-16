import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car,
  MapPin,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { ridesApi } from '../../api/rides.api';
import { RideMap } from '../../components/map/RideMap';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { RideStatus } from '../../types';

export const ActiveDriverRidePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: ride, isLoading, isError } = useQuery({
    queryKey: ['ride-detail', id],
    queryFn: () => ridesApi.getRideById(id!),
    enabled: Boolean(id),
    refetchInterval: 3000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'DRIVER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED') =>
      ridesApi.updateStatus(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to update ride status');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !ride) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-xs text-slate-500">
          This ride dispatch could not be loaded or you are not assigned as the driver.
        </p>
        <Link to="/driver">
          <Button variant="secondary" size="sm">
            Back to Driver Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/driver">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Driver Dispatch Cockpit
              </h1>
              <Badge status={ride.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Ride #{ride.id.slice(0, 8)}</p>
          </div>
        </div>

        <Link to="/driver">
          <Button variant="secondary" size="sm">
            Driver Overview
          </Button>
        </Link>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map */}
        <div className="lg:col-span-7 space-y-4">
          <RideMap
            pickup={{
              lat: Number(ride.pickupLatitude),
              lng: Number(ride.pickupLongitude),
              name: 'Passenger Pickup',
            }}
            destination={{
              lat: Number(ride.destinationLatitude),
              lng: Number(ride.destinationLongitude),
              name: 'Passenger Destination',
            }}
            driverLocation={
              ride.driver?.currentLatitude && ride.driver?.currentLongitude
                ? {
                    lat: Number(ride.driver.currentLatitude),
                    lng: Number(ride.driver.currentLongitude),
                    name: 'My Vehicle',
                  }
                : null
            }
            height="460px"
          />
        </div>

        {/* Action Controls & Passenger Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Trigger Card */}
          <Card variant="dark" className="p-6 bg-slate-950 border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lifecycle Action
              </span>
              <span className="text-xs text-electric-400 font-semibold font-mono">
                {ride.status}
              </span>
            </div>

            {ride.status === 'DRIVER_ASSIGNED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  You are en route to the passenger. Once you arrive at the designated pickup point, tap below to notify them.
                </p>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full font-bold text-slate-950"
                  isLoading={updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate('DRIVER_ARRIVED')}
                >
                  I Have Arrived at Pickup
                </Button>
              </div>
            )}

            {ride.status === 'DRIVER_ARRIVED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Passenger is boarding. Once they are safely in your vehicle, start the trip.
                </p>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full font-bold text-slate-950"
                  isLoading={updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
                >
                  Start Ride (In Progress)
                </Button>
              </div>
            )}

            {ride.status === 'IN_PROGRESS' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Drive safely to destination. When you arrive and the passenger disembarks, complete the trip.
                </p>
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full font-bold text-slate-950"
                  isLoading={updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate('COMPLETED')}
                >
                  Complete Trip & Collect Fare
                </Button>
              </div>
            )}

            {ride.status === 'COMPLETED' && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Trip Successfully Completed!</span>
                </div>
                <p>
                  You are now back to <b>AVAILABLE</b> status and ready for new passenger dispatch requests.
                </p>
              </div>
            )}

            {ride.status === 'CANCELLED' && (
              <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                This ride was cancelled by the passenger.
              </div>
            )}
          </Card>

          {/* Passenger Information */}
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Passenger Details
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {ride.passenger?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{ride.passenger?.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ride.passenger?.phone}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">Agreed Fare</div>
              <div className="text-base font-extrabold text-slate-900">
                {Number(ride.fare || 0).toFixed(2)} {ride.currency}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
