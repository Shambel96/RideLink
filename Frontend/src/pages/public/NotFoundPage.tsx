import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto shadow-subtle">
          <Compass className="w-8 h-8 stroke-[1.8]" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500">
          The route you are looking for does not exist or may have been relocated.
        </p>
        <div className="pt-4 flex items-center justify-center">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
