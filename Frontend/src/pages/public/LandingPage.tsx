import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('Bole Medhanialem, Addis Ababa');
  const [destination, setDestination] = useState('Meskel Square, Addis Ababa');

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white pt-20 pb-28 lg:pt-28 lg:pb-36 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-electric-400">
                <Sparkles className="w-3.5 h-3.5 text-electric-500" />
                <span>Next-Gen Urban Mobility Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Move freely. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Ride with confidence in{' '}
                </span>
                <span className="text-electric-500 underline decoration-electric-500/50 underline-offset-8">
                  real time
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                RideLink connects verified drivers and passengers in seconds. Enjoy crystal-clear ETB fares, live GPS route estimation, and effortless booking.
              </p>

              {/* Quick Booking Hero Input */}
              <Card variant="dark" className="p-4 sm:p-5 border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-2xl max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleQuickBook} className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                    </div>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup spot"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-9 pr-3 text-sm focus:outline-none focus:border-electric-500"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-electric-500">
                      <MapPin className="w-4 h-4 text-electric-500" />
                    </div>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where are you heading?"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-9 pr-3 text-sm focus:outline-none focus:border-electric-500"
                    />
                  </div>

                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="w-full font-bold text-slate-950"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Book Ride Now
                    </Button>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button variant="secondary" size="lg" className="w-full">
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                </form>
              </Card>

              {/* Trust badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-electric-500" />
                  <span>Licensed & Background-Checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-electric-500" />
                  <span>&lt; 3 Min Average Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-electric-500" />
                  <span>Transparent 15 ETB Base Rate</span>
                </div>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Dispatch</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-electric-500/20 text-electric-400">
                    Active Drivers Near You
                  </span>
                </div>

                {/* Simulated interactive ride visualizer */}
                <div className="py-6 space-y-4">
                  <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] text-slate-400">Pickup</p>
                        <p className="text-xs font-semibold text-white">Bole Medhanialem Church</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-dashed border-slate-700 ml-3 h-5" />
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-500 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-electric-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] text-slate-400">Destination</p>
                        <p className="text-xs font-semibold text-white">Meskel Square, Stadium</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Estimated Fare (Haversine)</p>
                      <p className="text-xl font-extrabold text-white">
                        47.50 <span className="text-xs text-electric-500">ETB</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">Estimated Time</p>
                      <p className="text-sm font-bold text-slate-200">~ 9 mins</p>
                    </div>
                  </div>

                  <Link to="/book" className="block w-full">
                    <Button variant="accent" className="w-full font-bold">
                      Launch Interactive Map
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Effortless Mobility</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How RideLink Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Engineered with precision to get you to your destination in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="elevated" className="space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pinpoint Pickup & Destination</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use our interactive Leaflet map to select your route or type in readable landmarks. Instant ETB fare estimates appear right away.
            </p>
          </Card>

          <Card variant="elevated" className="space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Match with Verified Drivers</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our backend dispatch assigns the nearest approved driver. Track vehicle model, plate number, and driver coordinates in real time.
            </p>
          </Card>

          <Card variant="elevated" className="space-y-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Ride & Complete Safely</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enjoy your ride with live status transitions: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">ARRIVED</code> → <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">IN_PROGRESS</code> → <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">COMPLETED</code>.
            </p>
          </Card>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-electric-500">
                Safety First Protocol
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Designed for Trust, Built with Integrity
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Every driver undergoes strict administrative license verification before being permitted to accept rides on the RideLink network.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">Government-issued driver license verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">Registered vehicle license plate and roadworthiness verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">Protected user data with Argon2/Bcrypt hash cryptography</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <ShieldCheck className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">Admin Oversight</h4>
                <p className="text-xs text-slate-400 mt-1">Manual driver approval and suspension capabilities</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Navigation className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">Accurate GPS</h4>
                <p className="text-xs text-slate-400 mt-1">Real-time coordinates with OpenStreetMap telemetry</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Clock className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">Ride Timestamps</h4>
                <p className="text-xs text-slate-400 mt-1">Audit trail with requested, started, and completed records</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Car className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">Fleet Variety</h4>
                <p className="text-xs text-slate-400 mt-1">Sedans, SUVs, Minivans, and Motorcycles supported</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driver CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-14 overflow-hidden border border-slate-800 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-electric-500">
              Drive on Your Terms
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Earn competitive income with transparent dispatch
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Register as a RideLink driver today, manage your vehicles, switch between Available and Offline anytime, and start receiving passenger requests.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/driver/onboarding">
                <Button variant="accent" size="lg" className="font-bold">
                  Apply to Drive
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-900">
                  Driver Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
