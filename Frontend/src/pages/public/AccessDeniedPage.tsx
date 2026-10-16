import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-subtle">
          <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          You don't have the required role permissions (Driver or Admin) to view this area.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="secondary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/passenger">
            <Button variant="primary" size="md">
              Go to Passenger Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
