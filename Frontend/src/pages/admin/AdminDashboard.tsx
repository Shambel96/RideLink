import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Car,
  Compass,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  const { data: recentRidesData, isLoading: ridesLoading } = useQuery({
    queryKey: ['admin-rides-recent'],
    queryFn: () => adminApi.getAllRides(1, 5),
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const rideBreakdown = [
    { name: 'Completed', value: stats?.rides.completed || 0, color: '#10B981' },
    { name: 'Active', value: stats?.rides.active || 0, color: '#CCFF00' },
    { name: 'Cancelled', value: stats?.rides.cancelled || 0, color: '#F43F5E' },
  ];

  const userDistribution = [
    { name: 'Total Users', count: stats?.users.total || 0 },
    { name: 'Verified Drivers', count: stats?.drivers.total || 0 },
    { name: 'Platform Rides', count: stats?.rides.total || 0 },
  ];

  const recentRides = recentRidesData?.rides || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Analytics & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time authoritative backend operational metrics from PostgreSQL
          </p>
        </div>

        <Link to="/admin/drivers">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
            <ShieldCheck className="w-4 h-4 text-electric-500" />
            <span>Driver Verification Queue</span>
          </button>
        </Link>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.users.total ?? 0}</p>
          <p className="text-[11px] text-slate-400">Registered passengers & drivers</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Fleet Drivers</span>
            <Car className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.drivers.total ?? 0}</p>
          <p className="text-[11px] text-slate-400">Total driver applicants & verified</p>
        </Card>

        <Card variant="elevated" className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rides</span>
            <Compass className="w-4 h-4 text-electric-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.rides.total ?? 0}</p>
          <p className="text-[11px] text-slate-400">
            {stats?.rides.completed} completed ({stats?.rides.active} active)
          </p>
        </Card>

        <Card variant="elevated" className="space-y-2 bg-slate-950 text-white border-slate-900">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</span>
            <CreditCard className="w-4 h-4 text-electric-500" />
          </div>
          <p className="text-3xl font-black text-white">
            {stats?.revenue.total.toFixed(2)}{' '}
            <span className="text-xs text-electric-500 font-bold">{stats?.revenue.currency}</span>
          </p>
          <p className="text-[11px] text-slate-400">Aggregate completed trips value</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ride Status Pie Breakdown */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ride Status Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total: {stats?.rides.total}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rideBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rideBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} rides`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Volume Bar Chart */}
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Platform Scale Metrics
            </h3>
            <span className="text-xs text-slate-400">Real-time counts</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#0F172A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Platform Rides */}
      <Card variant="elevated" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent Platform Dispatches
          </h3>
          <Link to="/admin/rides" className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1">
            <span>View All Rides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {ridesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-12 w-full" />
            ))}
          </div>
        ) : recentRides.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No rides recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Ride ID</th>
                  <th className="pb-3">Passenger</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono text-slate-500">{ride.id.slice(0, 8)}...</td>
                    <td className="py-3 font-semibold text-slate-900">{ride.passenger?.name}</td>
                    <td className="py-3 text-slate-600">
                      {ride.driver?.user?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3">
                      <Badge status={ride.status} size="sm" />
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {Number(ride.fare || 0).toFixed(2)} {ride.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
