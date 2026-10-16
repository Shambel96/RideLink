import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Car,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { ridesApi } from '../../api/rides.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RideStatus } from '../../types';

interface RideHistoryProps {
  role?: 'passenger' | 'driver';
}

export const RideHistoryPage: React.FC<RideHistoryProps> = ({ role = 'passenger' }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RideStatus | 'ALL'>('ALL');
  const limit = 8;

  const { data, isLoading } = useQuery({
    queryKey: ['my-rides', role, page, limit],
    queryFn: () => ridesApi.getMyRides(role, page, limit),
  });

  const allRides = data?.rides || [];
  const filteredRides =
    statusFilter === 'ALL'
      ? allRides
      : allRides.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {role === 'driver' ? 'Driver Trip Log' : 'My Ride History'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View completed, active, and past ride receipts and route details
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS', 'SEARCHING'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status === 'ALL' ? 'All Rides' : status.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Rides List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredRides.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Rides Found"
          description={
            statusFilter === 'ALL'
              ? 'No rides have been recorded yet.'
              : `No rides found matching the "${statusFilter}" filter.`
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRides.map((ride) => (
            <Card
              key={ride.id}
              variant="elevated"
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <Badge status={ride.status} />
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(ride.requestedAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                    ID: {ride.id.slice(0, 8)}...
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Pickup: {Number(ride.pickupLatitude).toFixed(4)},{' '}
                      {Number(ride.pickupLongitude).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-electric-600 shrink-0" />
                    <span className="truncate">
                      Dest: {Number(ride.destinationLatitude).toFixed(4)},{' '}
                      {Number(ride.destinationLongitude).toFixed(4)}
                    </span>
                  </div>
                </div>

                {ride.driver && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Driver: <b>{ride.driver.user.name}</b></span>
                    {ride.vehicle && (
                      <span>
                        Vehicle: {ride.vehicle.model} ({ride.vehicle.plateNumber})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-400">Fare Amount</p>
                  <p className="text-lg font-black text-slate-900">
                    {Number(ride.fare || 0).toFixed(2)}{' '}
                    <span className="text-xs text-electric-600 font-bold">{ride.currency}</span>
                  </p>
                </div>
                <Link to={`/rides/${ride.id}`}>
                  <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing page <b>{data.page}</b> of <b>{data.totalPages}</b> (Total {data.total} trips)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
