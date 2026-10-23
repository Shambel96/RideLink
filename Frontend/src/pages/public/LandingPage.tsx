import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';

const HERO_VIDEOS = [
  { id: 1, title: 'Passing Cars', src: '/hero-video-1.webm' },
  { id: 2, title: 'Bridge Traffic', src: '/hero-video-2.webm' },
  { id: 3, title: 'Night Driving', src: '/hero-video-3.webm' },
  { id: 4, title: 'City Timelapse', src: '/hero-video-4.webm' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [pickup, setPickup] = useState('Bole Medhanialem, Addis Ababa');
  const [destination, setDestination] = useState('Meskel Square, Addis Ababa');
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('ridelink-theme') === 'dark',
  );
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      setDarkMode((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener('ridelink-theme-change', handleThemeChange);
    return () => window.removeEventListener('ridelink-theme-change', handleThemeChange);
  }, []);

  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const playVideoStep = (videoIdx: number) => {
      // Each video plays for 7 seconds
      timer = setTimeout(() => {
        if (!isMounted) return;

        // If we just finished the last video in the sequence
        if (videoIdx === HERO_VIDEOS.length - 1) {
          // Show poster image again ONLY after ALL videos have finished
          setShowVideo(false);
          timer = setTimeout(() => {
            if (!isMounted) return;
            // After poster finishes (5s), restart cycle from video 0
            setCurrentVideoIndex(0);
            setShowVideo(true);
            playVideoStep(0);
          }, 5000);
        } else {
          // Transition directly to the next video in sequence without showing poster
          const nextIdx = videoIdx + 1;
          setCurrentVideoIndex(nextIdx);
          setShowVideo(true);
          playVideoStep(nextIdx);
        }
      }, 7000);
    };

    // On initial page load/refresh: show poster for 4.5 seconds, then begin video sequence
    timer = setTimeout(() => {
      if (!isMounted) return;
      setCurrentVideoIndex(0);
      setShowVideo(true);
      playVideoStep(0);
    }, 4500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Manage playback: active video plays, inactive videos pause
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (showVideo && idx === currentVideoIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [showVideo, currentVideoIndex]);

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    setShowVideo(true);
  };

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + HERO_VIDEOS.length) % HERO_VIDEOS.length);
    setShowVideo(true);
  };

  const shouldShowDriverSignIn =
    isAuthenticated && user ? !user.roles.includes('DRIVER') : false;

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`,
    );
  };

  return (
    <div className={`landing-page relative overflow-hidden ${darkMode ? 'landing-theme-dark' : 'bg-slate-50'}`}>
      {/* Hero Section — full screen height below navbar */}
      <section className="hero-section relative text-white min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex items-center overflow-hidden py-8 sm:py-12">
        {/* ── Cinematic background video playlist & poster ──────────── */}
        {/* Static poster fallback — z-index:0, sits BEHIND the videos */}
        <div className="hero-bg-poster" aria-hidden="true" />

        {/* Video elements in sequence order */}
        {HERO_VIDEOS.map((vid, idx) => (
          <video
            key={vid.id}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            className={`hero-bg-video ${showVideo && idx === currentVideoIndex ? 'is-visible' : 'is-hidden'}`}
            autoPlay={idx === 0}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source src={vid.src} type="video/webm" />
          </video>
        ))}

        {/* Layered gradient overlays — z-index:2, above video */}
        <div
          className="hero-overlay"
          style={{
            background:
              'linear-gradient(135deg,rgba(2,6,23,0.80) 0%,rgba(2,6,23,0.52) 55%,rgba(2,6,23,0.30) 100%)',
          }}
          aria-hidden="true"
        />
        {/* Bottom fade so the section blends into the content below */}
        <div
          className="hero-overlay hero-overlay-bottom"
          aria-hidden="true"
        />
        {/* Electric-lime glow top-right accent */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(204,255,0,0.06)', filter: 'blur(80px)', zIndex: 2 }}
          aria-hidden="true"
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right,#1e293b22 1px,transparent 1px),linear-gradient(to bottom,#1e293b22 1px,transparent 1px)',
            backgroundSize: '32px 32px',
            zIndex: 2,
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Hero Content — full-width, left-aligned on desktop */}
            <div className="hero-content-animate space-y-4">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                <span className="block">Move freely.</span>
                <span className="block text-electric-500">
                  Ride in real time.
                </span>
              </h1>

              <p className="text-sm text-slate-400 leading-relaxed">
                Verified drivers · Live GPS · Transparent ETB fares
              </p>

              {/* Quick Booking Hero Input */}
              <Card
                variant="dark"
                className="p-4 sm:p-5 border-slate-800 bg-slate-900/90 backdrop-blur-md shadow-2xl max-w-xl mx-auto lg:mx-0"
              >
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

                  <div className="pt-1 flex flex-col sm:flex-row gap-2 sm:items-stretch">
                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      className="w-full sm:flex-1 font-bold text-slate-950"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Book Ride Now
                    </Button>
                    {!isAuthenticated && (
                      <Link to="/register" className="w-full sm:w-auto">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="w-full sm:w-auto whitespace-nowrap"
                        >
                          Sign Up Free
                        </Button>
                      </Link>
                    )}
                  </div>

                  {shouldShowDriverSignIn && (
                    <div className="pt-1">
                      <Link to="/driver/onboarding" className="block w-full">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-slate-100 border-slate-700 hover:bg-slate-800"
                        >
                          Become a Driver
                        </Button>
                      </Link>
                    </div>
                  )}
                </form>
              </Card>

              {/* Trust badges — compact single row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-electric-500" />
                  Background-Checked
                </span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-electric-500" />
                  &lt; 3 Min Pickup
                </span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-electric-500" />
                  15 ETB Base Rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Media video playlist controls — clean arrows with minimal dots (no text) */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md shadow-lg">
          {/* Previous video button */}
          <button
            type="button"
            onClick={handlePrevVideo}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Previous video"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Minimal progress dots — no text */}
          <div className="flex items-center gap-1.5 px-2">
            {HERO_VIDEOS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentVideoIndex(idx);
                  setShowVideo(true);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  showVideo && currentVideoIndex === idx
                    ? 'w-4 bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Switch to video ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next video button */}
          <button
            type="button"
            onClick={handleNextVideo}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Next video"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="landing-content py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Effortless Mobility
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How RideLink Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Engineered with precision to get you to your destination in three
            simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            variant="elevated"
            className="space-y-4 text-center sm:text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Pinpoint Pickup & Destination
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use our interactive Leaflet map to select your route or type in
              readable landmarks. Instant ETB fare estimates appear right away.
            </p>
          </Card>

          <Card
            variant="elevated"
            className="space-y-4 text-center sm:text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Match with Verified Drivers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our backend dispatch assigns the nearest approved driver. Track
              vehicle model, plate number, and driver coordinates in real time.
            </p>
          </Card>

          <Card
            variant="elevated"
            className="space-y-4 text-center sm:text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-electric-500 flex items-center justify-center font-bold text-lg shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ride & Complete Safely
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enjoy your ride with live status transitions:{' '}
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                ARRIVED
              </code>{' '}
              →{' '}
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                IN_PROGRESS
              </code>{' '}
              →{' '}
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                COMPLETED
              </code>
              .
            </p>
          </Card>
        </div>
      </section>

      {/* ── Live Dispatch Demo Section ─────────────────────────── */}
      <section className="bg-slate-950 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: explanation */}
            <div className="space-y-5 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-electric-500">
                Real-Time Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Watch your ride come to life — before you even tap Book.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                RideLink calculates your fare instantly using the Haversine
                distance formula, matches you with the nearest verified driver,
                and streams live GPS coordinates until your trip is complete.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-electric-500 shrink-0" />
                  Instant ETB fare estimate before booking
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-electric-500 shrink-0" />
                  Live driver location via WebSocket
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-electric-500 shrink-0" />
                  Ride status: ACCEPTED → ARRIVED → IN_PROGRESS → COMPLETED
                </li>
              </ul>
              <div className="pt-2">
                <Link to="/book">
                  <Button variant="accent" size="lg" className="font-bold">
                    Try the Live Map
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Live Dispatch preview card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Dispatch
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-electric-500/20 text-electric-400">
                    Active Drivers Near You
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Pickup</p>
                        <p className="text-xs font-semibold text-white">Bole Medhanialem Church</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-dashed border-slate-700 ml-3 h-5" />
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-electric-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-electric-500" />
                      </div>
                      <div>
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
                Every driver undergoes strict administrative license
                verification before being permitted to accept rides on the
                RideLink network.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">
                    Government-issued driver license verification
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">
                    Registered vehicle license plate and roadworthiness
                    verification
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0" />
                  <span className="text-sm text-slate-200">
                    Protected user data with Argon2/Bcrypt hash cryptography
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <ShieldCheck className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">
                  Admin Oversight
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manual driver approval and suspension capabilities
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Navigation className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">Accurate GPS</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time coordinates with OpenStreetMap telemetry
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Clock className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">
                  Ride Timestamps
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Audit trail with requested, started, and completed records
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <Car className="w-8 h-8 text-electric-500 mb-3" />
                <h4 className="font-bold text-white text-base">
                  Fleet Variety
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Sedans, SUVs, Minivans, and Motorcycles supported
                </p>
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
              Register as a RideLink driver today, manage your vehicles, switch
              between Available and Offline anytime, and start receiving
              passenger requests.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/driver/onboarding">
                <Button variant="accent" size="lg" className="font-bold">
                  Apply to Drive
                </Button>
              </Link>
              {shouldShowDriverSignIn && (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-white border-slate-700 hover:bg-slate-900"
                  >
                    Driver Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
