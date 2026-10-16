import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Navigation,
  Loader2,
} from 'lucide-react';
import { ridesApi } from '../../api/rides.api';
import { RideMap } from '../../components/map/RideMap';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { RideStatus } from '../../types';

export const RideTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const {
    data: ride,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['ride-detail', id],
    queryFn: () => ridesApi.getRideById(id!),
    enabled: Boolean(id),
    // Poll every 3 seconds while ride is in progress or searching
    refetchInterval: (query) => {
      const currentRide = query.state.data;
      if (!currentRide) return 3000;
      if (currentRide.status === 'COMPLETED' || currentRide.status === 'CANCELLED') {
        return false;
      }
      return 3000;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ridesApi.cancelRide(id!),
    onSuccess: () => {
      setCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ride-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError('Unable to cancel ride at this stage.');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-[450px]" />
          <Skeleton className="lg:col-span-5 h-[450px]" />
        </div>
      </div>
    );
  }

  if (isError || !ride) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Ride Not Found</h2>
        <p className="text-xs text-slate-500">
          {(error as Error)?.message || 'We could not locate this ride request.'}
        </p>
        <Link to="/passenger">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isCancellable = ['REQUESTED', 'SEARCHING', 'DRIVER_ASSIGNED'].includes(ride.status);

  const getStatusStep = (status: RideStatus) => {
    switch (status) {
      case 'REQUESTED':
      case 'SEARCHING':
        return 1;
      case 'DRIVER_ASSIGNED':
        return 2;
      case 'DRIVER_ARRIVED':
        return 3;
      case 'IN_PROGRESS':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(ride.status);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/passenger">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Live Ride Tracking
              </h1>
              <Badge status={ride.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {ride.id}</p>
          </div>
        </div>

        {isCancellable && (
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => {
              setCancelError(null);
              setCancelModalOpen(true);
            }}
          >
            Cancel Ride
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map */}
        <div className="lg:col-span-7 space-y-4">
          <RideMap
            pickup={{
              lat: Number(ride.pickupLatitude),
              lng: Number(ride.pickupLongitude),
              name: 'Pickup Location',
            }}
            destination={{
              lat: Number(ride.destinationLatitude),
              lng: Number(ride.destinationLongitude),
              name: 'Destination Location',
            }}
            driverLocation={
              ride.driver?.currentLatitude && ride.driver?.currentLongitude
                ? {
                    lat: Number(ride.driver.currentLatitude),
                    lng: Number(ride.driver.currentLongitude),
                    name: 'Assigned Driver',
                  }
                : null
            }
            height="460px"
          />

          {/* Real-time status banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-500 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    ride.status === 'COMPLETED'
                      ? 'bg-emerald-500'
                      : ride.status === 'CANCELLED'
                      ? 'bg-rose-500'
                      : 'bg-electric-500'
                  }`}
                />
              </span>
              <span className="text-xs font-bold text-slate-800">
                {ride.status === 'SEARCHING' && 'Broadcasting request to nearby active drivers...'}
                {ride.status === 'DRIVER_ASSIGNED' && 'Driver assigned! En route to your pickup point.'}
                {ride.status === 'DRIVER_ARRIVED' && 'Driver has arrived at your pickup spot!'}
                {ride.status === 'IN_PROGRESS' && 'Trip is in progress. Sit back and enjoy the ride.'}
                {ride.status === 'COMPLETED' && 'Ride completed successfully.'}
                {ride.status === 'CANCELLED' && 'This ride has been cancelled.'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Live Polling (3s)</span>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Timeline */}
          <Card variant="elevated" className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ride Progression
            </h3>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Searching Driver', desc: 'Request broadcast to drivers' },
                { step: 2, title: 'Driver Assigned', desc: 'Driver confirmed & dispatched' },
                { step: 3, title: 'Driver Arrived', desc: 'Waiting at pickup location' },
                { step: 4, title: 'Trip In Progress', desc: 'Heading towards destination' },
                { step: 5, title: 'Completed', desc: 'Reached destination safely' },
              ].map((item) => {
                const isPassed = currentStep >= item.step && ride.status !== 'CANCELLED';
                const isCurrent = currentStep === item.step && ride.status !== 'CANCELLED';

                return (
                  <div key={item.step} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                        isCurrent
                          ? 'bg-electric-500 text-slate-950 ring-4 ring-electric-500/20'
                          : isPassed
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? <CheckCircle className="w-4 h-4" /> : item.step}
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-slate-950 font-extrabold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Driver & Vehicle Information */}
          {ride.driver ? (
            <Card variant="elevated" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assigned Driver
                </span>
                <Badge status={ride.driver.verificationStatus} size="sm" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg">
                  {ride.driver.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{ride.driver.user.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ride.driver.user.phone}</span>
                  </p>
                </div>
              </div>

              {ride.vehicle && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-700" />
                      {ride.vehicle.model}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[11px]">
                      {ride.vehicle.plateNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    Vehicle Type: {ride.vehicle.type.toLowerCase()}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card variant="default" className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-electric-500/10 text-electric-600 flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Matching Nearby Driver</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We're notifying available drivers in your area. As soon as a driver accepts, their vehicle and contact details will appear here.
              </p>
            </Card>
          )}

          {/* Fare Summary */}
          <div className="p-5 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-subtle">
            <div>
              <p className="text-xs text-slate-400">Total Agreed Fare</p>
              <p className="text-2xl font-black text-white">
                {Number(ride.fare || 0).toFixed(2)}{' '}
                <span className="text-xs text-electric-500 font-bold">{ride.currency}</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Requested: {new Date(ride.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              {ride.completedAt && (
                <div className="text-emerald-400 font-medium">
                  Completed: {new Date(ride.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Ride Request?"
        description="Are you sure you want to cancel this ride? If a driver has already been assigned, they will be freed for other trips."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Ride
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Confirm Cancellation
            </Button>
          </>
        }
      >
        {cancelError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {cancelError}
          </div>
        )}
      </Modal>
    </div>
  );
};
