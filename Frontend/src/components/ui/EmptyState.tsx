import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white shadow-subtle border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
