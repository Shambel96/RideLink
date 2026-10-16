import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Navigation,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Info,
  Car,
} from 'lucide-react';
import { ridesApi } from '../../api/rides.api';
import { RideMap, LocationPoint } from '../../components/map/RideMap';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { calculateFareEstimate } from '../../utils/haversine';

// Popular landmarks in Addis Ababa with accurate GPS coordinates
const ADDIS_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  bole: { lat: 9.0054, lng: 38.7636, name: 'Bole Medhanialem' },
  meskel: { lat: 9.0108, lng: 38.7612, name: 'Meskel Square' },
  piazza: { lat: 9.0345, lng: 38.7523, name: 'Piazza Central' },
  megenagna: { lat: 9.0203, lng: 38.7995, name: 'Megenagna Roundabout' },
  mexico: { lat: 9.0102, lng: 38.7441, name: 'Mexico Square' },
  kazanchis: { lat: 9.0181, lng: 38.7684, name: 'Kazanchis Business District' },
  cmc: { lat: 9.0264, lng: 38.8351, name: 'CMC Residential Area' },
  sarbet: { lat: 8.9958, lng: 38.7369, name: 'Sarbet / Old Airport' },
};

export const BookRidePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Initialize with Bole -> Meskel Square or defaults
  const [pickup, setPickup] = useState<LocationPoint>(ADDIS_LOCATIONS.bole);
  const [destination, setDestination] = useState<LocationPoint>(ADDIS_LOCATIONS.meskel);
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'destination' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { distanceKm, fare } = calculateFareEstimate(
    pickup.lat,
    pickup.lng,
    destination.lat,
    destination.lng
  );

  const requestRideMutation = useMutation({
    mutationFn: () =>
      ridesApi.requestRide({
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        destinationLatitude: destination.lat,
        destinationLongitude: destination.lng,
      }),
    onSuccess: (newRide) => {
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
      navigate(`/rides/${newRide.id}`);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to request ride. Please check locations.');
      }
    },
  });

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (selectionMode === 'pickup') {
      setPickup({
        lat: Math.round(coords.lat * 1000000) / 1000000,
        lng: Math.round(coords.lng * 1000000) / 1000000,
        name: `Custom Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      });
      setSelectionMode(null);
    } else if (selectionMode === 'destination') {
      setDestination({
        lat: Math.round(coords.lat * 1000000) / 1000000,
        lng: Math.round(coords.lng * 1000000) / 1000000,
        name: `Custom Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      });
      setSelectionMode(null);
    }
  };

  const handleSelectPreset = (key: string, type: 'pickup' | 'destination') => {
    const loc = ADDIS_LOCATIONS[key];
    if (type === 'pickup') setPickup(loc);
    else setDestination(loc);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book a Ride
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick your pickup and drop-off points on the map or select from known Addis Ababa hubs
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Booking Request Blocked</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Grid: Map + Booking Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map View */}
        <div className="lg:col-span-7 space-y-3">
          <RideMap
            pickup={pickup}
            destination={destination}
            onMapClick={handleMapClick}
            selectionMode={selectionMode}
            height="500px"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Click button below to enable map-pinning</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectionMode === 'pickup' ? 'accent' : 'secondary'}
                size="sm"
                onClick={() => setSelectionMode(selectionMode === 'pickup' ? null : 'pickup')}
              >
                {selectionMode === 'pickup' ? 'Click Map for Pickup...' : 'Pin Pickup on Map'}
              </Button>
              <Button
                variant={selectionMode === 'destination' ? 'accent' : 'secondary'}
                size="sm"
                onClick={() => setSelectionMode(selectionMode === 'destination' ? null : 'destination')}
              >
                {selectionMode === 'destination' ? 'Click Map for Dest...' : 'Pin Dest on Map'}
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="elevated" className="p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-electric-600" />
              Route & Fare Confirmation
            </h2>

            {/* Pickup selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Pickup Point
                </span>
                <span className="text-[10px] text-slate-400">
                  {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                </span>
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900">
                {pickup.name}
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(ADDIS_LOCATIONS).slice(0, 4).map(([key, loc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key, 'pickup')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      pickup.name === loc.name
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-electric-600" />
                  Destination
                </span>
                <span className="text-[10px] text-slate-400">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </span>
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900">
                {destination.name}
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Object.entries(ADDIS_LOCATIONS).slice(4).map(([key, loc]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key, 'destination')}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      destination.name === loc.name
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Breakdown Card */}
            <div className="rounded-2xl bg-slate-950 text-white p-5 space-y-3 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs text-slate-400">Estimated Distance</div>
                <div className="text-sm font-bold text-slate-200">{distanceKm} km</div>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs text-slate-400">Rate Breakdown</div>
                <div className="text-xs text-slate-300">15 ETB base + (8 ETB/km)</div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-xs text-slate-400">Total Calculated Fare</div>
                  <div className="text-2xl font-black text-white">
                    {fare.toFixed(2)} <span className="text-sm text-electric-500 font-bold">ETB</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-electric-500/20 text-electric-400">
                  Guaranteed
                </span>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="w-full font-bold text-slate-950"
              isLoading={requestRideMutation.isPending}
              onClick={() => requestRideMutation.mutate()}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Confirm & Request Driver
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
