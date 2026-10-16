import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, MapPin, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { ridesApi } from '../../api/rides.api';
import { vehiclesApi } from '../../api/vehicles.api';
import { driversApi } from '../../api/drivers.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Ride } from '../../types';

export const AvailableRidesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [acceptError, setAcceptError] = useState<string | null>(null);

  // Check driver profile first
  const { data: driver } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driversApi.getMyProfile(),
  });

  // Query vehicles for acceptance dropdown
  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehiclesApi.findMine(),
    enabled: Boolean(driver),
  });

  // Auto-poll available searching rides every 3 seconds
  const {
    data: availableData,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['available-rides'],
    queryFn: () => ridesApi.getAvailableRides(1, 20),
    enabled: driver?.availabilityStatus === 'AVAILABLE',
    refetchInterval: 3500,
  });

  const acceptMutation = useMutation({
    mutationFn: ({ rideId, vehicleId }: { rideId: string; vehicleId: string }) =>
      ridesApi.acceptRide(rideId, { vehicleId }),
    onSuccess: (updatedRide) => {
      setSelectedRide(null);
      queryClient.invalidateQueries({ queryKey: ['available-rides'] });
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
      navigate(`/driver/rides/${updatedRide.id}`);
    },
    onError: (err: unknown) => {
      setAcceptError(err instanceof Error ? err.message : 'Failed to accept ride.');
    },
  });

  const handleOpenAcceptModal = (ride: Ride) => {
    setSelectedRide(ride);
    setAcceptError(null);
    if (vehicles && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  };

  const rides = availableData?.rides || [];

  if (driver?.availabilityStatus !== 'AVAILABLE') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Radio className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">You Are Currently Offline</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          To receive and accept incoming ride requests from passengers, you must first switch your driver availability status to AVAILABLE.
        </p>
        <Button
          variant="accent"
          size="md"
          onClick={() => navigate('/driver/availability')}
        >
          Go to Availability Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Ride Requests
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time feed of passengers requesting rides across Addis Ababa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Board
          </Button>
        </div>
      </div>

      {/* Rides List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No Requests At This Moment"
          description="We are actively listening for new passenger ride requests. Stay online — new requests will appear here automatically."
        />
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <Card
              key={ride.id}
              variant="elevated"
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <Badge status="SEARCHING" />
                  <span className="text-xs text-slate-400 font-mono">
                    Requested{' '}
                    {new Date(ride.requestedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Passenger: {ride.passenger?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Pickup: {Number(ride.pickupLatitude).toFixed(4)},{' '}
                      {Number(ride.pickupLongitude).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                    <span className="truncate">
                      Dest: {Number(ride.destinationLatitude).toFixed(4)},{' '}
                      {Number(ride.destinationLongitude).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Offer Fare</p>
                  <p className="text-xl font-black text-slate-900">
                    {Number(ride.fare || 0).toFixed(2)}{' '}
                    <span className="text-xs text-electric-600 font-bold">{ride.currency}</span>
                  </p>
                </div>

                <Button
                  variant="accent"
                  size="md"
                  className="font-bold text-slate-950"
                  onClick={() => handleOpenAcceptModal(ride)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Accept Ride
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Accept Ride Vehicle Selection Modal */}
      <Modal
        isOpen={Boolean(selectedRide)}
        onClose={() => setSelectedRide(null)}
        title="Confirm Ride Acceptance"
        description="Select the vehicle you will use to fulfill this ride dispatch."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSelectedRide(null)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              disabled={!selectedVehicleId}
              isLoading={acceptMutation.isPending}
              onClick={() => {
                if (selectedRide && selectedVehicleId) {
                  acceptMutation.mutate({
                    rideId: selectedRide.id,
                    vehicleId: selectedVehicleId,
                  });
                }
              }}
            >
              Confirm Acceptance
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {acceptError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{acceptError}</span>
            </div>
          )}

          {vehicles && vehicles.length > 0 ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Choose Registered Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} — {v.plateNumber} ({v.type})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
              <p className="font-bold">No Vehicles Registered!</p>
              <p>
                You must register at least one vehicle in your fleet before accepting rides.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedRide(null);
                  navigate('/driver/vehicles');
                }}
              >
                Register a Vehicle
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
