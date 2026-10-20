import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-electric-500">
                <Car className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold text-white">Ride<span className="text-electric-500">Link</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern urban ride-hailing engineered for speed, transparent fares, and absolute passenger safety.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-electric-500" />
              <span>100% Verified Drivers & Live GPS</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Passengers</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/book" className="hover:text-electric-500 transition-colors">Book a Ride</Link></li>
              <li><Link to="/passenger" className="hover:text-electric-500 transition-colors">Passenger Dashboard</Link></li>
              <li><Link to="/passenger/history" className="hover:text-electric-500 transition-colors">Ride History</Link></li>
              <li><a href="#fares" className="hover:text-electric-500 transition-colors">Transparent Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Drivers</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/driver/onboarding" className="hover:text-electric-500 transition-colors">Apply to Drive</Link></li>
              <li><Link to="/driver" className="hover:text-electric-500 transition-colors">Driver Portal</Link></li>
              <li><Link to="/driver/vehicles" className="hover:text-electric-500 transition-colors">Vehicle Management</Link></li>
              <li><Link to="/driver/requests" className="hover:text-electric-500 transition-colors">Ride Requests</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">System</h4>
            <div className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">NestJS REST API Online</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connected to PostgreSQL & Prisma 6.9 database.
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Swagger Documentation available at <code className="text-electric-400">/api/docs</code>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RideLink Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted by Shambel Dechu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
