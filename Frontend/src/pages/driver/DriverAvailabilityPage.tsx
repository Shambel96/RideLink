import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { driversApi } from '../../api/drivers.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DriverAvailabilityStatus } from '../../types';

export const DriverAvailabilityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualCoords, setManualCoords] = useState<{ lat: number; lng: number }>({
    lat: 9.0054,
    lng: 38.7636,
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: driver, isLoading } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driversApi.getMyProfile(),
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (payload: {
      status: DriverAvailabilityStatus;
      latitude?: number;
      longitude?: number;
    }) => driversApi.updateAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      setApiError(null);
    },
    onError: (err: unknown) => {
      setApiError(err instanceof Error ? err.message : 'Failed to update status');
    },
  });

  const isApproved = driver?.verificationStatus === 'APPROVED';

  const requestGps = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setManualCoords({
          lat: Math.round(pos.coords.latitude * 1000000) / 1000000,
          lng: Math.round(pos.coords.longitude * 1000000) / 1000000,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(`Location request failed (${err.message}). Using Addis Ababa center default.`);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleToggleOnline = (newStatus: DriverAvailabilityStatus) => {
    if (newStatus === 'AVAILABLE') {
      updateAvailabilityMutation.mutate({
        status: 'AVAILABLE',
        latitude: manualCoords.lat,
        longitude: manualCoords.lng,
      });
    } else {
      updateAvailabilityMutation.mutate({
        status: newStatus,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Driver Account Required</h2>
        <p className="text-xs text-slate-500">
          Please apply through driver onboarding first before managing availability.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Driver Availability & GPS Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Toggle your dispatch status and calibrate your live coordinates to receive nearby trip requests
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {!isApproved && (
        <Card variant="bordered" className="p-5 border-amber-300 bg-amber-50/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Driver Verification Pending</span>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Only <b>APPROVED</b> drivers are authorized to switch to AVAILABLE. Your current status is{' '}
            <b>{driver.verificationStatus}</b>. Once approved by our team, you will be able to go online.
          </p>
        </Card>
      )}

      {/* Main Switch Card */}
      <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Dispatch State
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xl font-black text-slate-900">
                {driver.availabilityStatus}
              </span>
              <Badge status={driver.availabilityStatus} />
            </div>
          </div>

          {/* Quick toggle button */}
          <div className="flex items-center gap-2">
            {driver.availabilityStatus === 'AVAILABLE' ? (
              <Button
                variant="outline"
                size="md"
                isLoading={updateAvailabilityMutation.isPending}
                onClick={() => handleToggleOnline('OFFLINE')}
              >
                Go Offline
              </Button>
            ) : (
              <Button
                variant="accent"
                size="md"
                disabled={!isApproved}
                isLoading={updateAvailabilityMutation.isPending}
                onClick={() => handleToggleOnline('AVAILABLE')}
              >
                Go Online & Available
              </Button>
            )}
          </div>
        </div>

        {/* GPS Coordinates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Live Driver Coordinates
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={requestGps}
              isLoading={gpsLoading}
              leftIcon={<Navigation className="w-3.5 h-3.5" />}
            >
              Calibrate with GPS
            </Button>
          </div>

          {gpsError && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              {gpsError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={manualCoords.lat}
                onChange={(e) =>
                  setManualCoords({ ...manualCoords, lat: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-mono text-base font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={manualCoords.lng}
                onChange={(e) =>
                  setManualCoords({ ...manualCoords, lng: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-transparent font-mono text-base font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Note: The RideLink dispatch engine uses these coordinates when passengers search for rides. Keep them updated when navigating the city.
          </p>
        </div>
      </Card>
    </div>
  );
};
