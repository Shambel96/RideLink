import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, ChevronLeft, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { RideStatus } from '../../types';

export const AdminRidesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RideStatus | 'ALL'>('ALL');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rides', page, limit, statusFilter],
    queryFn: () =>
      adminApi.getAllRides(
        page,
        limit,
        statusFilter === 'ALL' ? undefined : statusFilter
      ),
  });

  const rides = data?.rides || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Platform Rides
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global dispatch logs and status tracking across the entire RideLink network
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SEARCHING', 'DRIVER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  statusFilter === status
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status === 'ALL' ? 'All Trips' : status.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Rides Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-16 w-full" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Rides Found"
          description={`No rides currently match the status filter "${statusFilter}".`}
        />
      ) : (
        <Card variant="elevated" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Ride ID</th>
                  <th className="py-3.5 px-4">Passenger</th>
                  <th className="py-3.5 px-4">Driver & Vehicle</th>
                  <th className="py-3.5 px-4">GPS Coordinates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Fare</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">
                      {ride.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{ride.passenger?.name}</div>
                      <div className="text-[11px] text-slate-400">{ride.passenger?.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      {ride.driver ? (
                        <div>
                          <div className="font-semibold text-slate-900">
                            {ride.driver.user?.name}
                          </div>
                          {ride.vehicle && (
                            <div className="text-[10px] text-slate-500">
                              {ride.vehicle.model} ({ride.vehicle.plateNumber})
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Driver</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        Pickup: {Number(ride.pickupLatitude).toFixed(3)},{' '}
                        {Number(ride.pickupLongitude).toFixed(3)}
                      </div>
                      <div>
                        Dest: {Number(ride.destinationLatitude).toFixed(3)},{' '}
                        {Number(ride.destinationLongitude).toFixed(3)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={ride.status} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {Number(ride.fare || 0).toFixed(2)} {ride.currency}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/rides/${ride.id}`}>
                        <Button variant="secondary" size="sm">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page {data.page} of {data.totalPages} (Total {data.total} rides)
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
