import React from 'react';
import {
  RideStatus,
  DriverVerificationStatus,
  DriverAvailabilityStatus,
  UserRole,
} from '../../types';

interface BadgeProps {
  status?: RideStatus | DriverVerificationStatus | DriverAvailabilityStatus | UserRole | string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  size = 'md',
  children,
  className = '',
}) => {
  let resolvedVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status) {
      // Ride Statuses
      case 'REQUESTED':
      case 'SEARCHING':
        resolvedVariant = 'warning';
        label = label || (status === 'SEARCHING' ? 'Searching Driver' : 'Requested');
        break;
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_ARRIVED':
        resolvedVariant = 'info';
        label = label || (status === 'DRIVER_ASSIGNED' ? 'Driver Assigned' : 'Driver Arrived');
        break;
      case 'IN_PROGRESS':
        resolvedVariant = 'accent';
        label = label || 'In Progress';
        break;
      case 'COMPLETED':
        resolvedVariant = 'success';
        label = label || 'Completed';
        break;
      case 'CANCELLED':
        resolvedVariant = 'danger';
        label = label || 'Cancelled';
        break;

      // Driver Verification
      case 'PENDING':
        resolvedVariant = 'warning';
        label = label || 'Pending Approval';
        break;
      case 'APPROVED':
        resolvedVariant = 'success';
        label = label || 'Verified Driver';
        break;
      case 'REJECTED':
        resolvedVariant = 'danger';
        label = label || 'Rejected';
        break;
      case 'SUSPENDED':
        resolvedVariant = 'danger';
        label = label || 'Suspended';
        break;

      // Availability Status
      case 'AVAILABLE':
        resolvedVariant = 'success';
        label = label || 'Online / Available';
        break;
      case 'BUSY':
        resolvedVariant = 'info';
        label = label || 'On Ride (Busy)';
        break;
      case 'OFFLINE':
        resolvedVariant = 'neutral';
        label = label || 'Offline';
        break;

      // Roles
      case 'ADMIN':
        resolvedVariant = 'accent';
        label = label || 'Admin';
        break;
      case 'DRIVER':
        resolvedVariant = 'info';
        label = label || 'Driver';
        break;
      case 'PASSENGER':
        resolvedVariant = 'neutral';
        label = label || 'Passenger';
        break;
      default:
        label = label || status;
    }
  }

  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: 'bg-electric-500/15 text-slate-950 font-semibold border-electric-500/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-tight',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          resolvedVariant === 'success'
            ? 'bg-emerald-500'
            : resolvedVariant === 'warning'
            ? 'bg-amber-500'
            : resolvedVariant === 'danger'
            ? 'bg-rose-500'
            : resolvedVariant === 'accent'
            ? 'bg-electric-600'
            : resolvedVariant === 'info'
            ? 'bg-sky-500'
            : 'bg-slate-400'
        }`}
      />
      {label}
    </span>
  );
};
