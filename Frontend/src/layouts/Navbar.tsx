import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Menu,
  X,
  Car,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, activeRole, setActiveRole, logout } =
    useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('ridelink-theme') === 'dark',
  );
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openLogoutModal = () => setLogoutModalOpen(true);
  const closeLogoutModal = () => setLogoutModalOpen(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (activeRole === 'ADMIN') return '/admin';
    if (activeRole === 'DRIVER') return '/driver';
    return '/passenger';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-electric-500 shadow-sm group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                Ride
              </span>
              <span className="text-xl font-extrabold tracking-tight text-electric-600">
                Link
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-electric-500 ml-0.5" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/book"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Book a Ride
            </Link>
            <Link
              to="/driver/onboarding"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Drive with Us
            </Link>
            <a
              href="#safety"
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              Safety
            </a>
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-4">
            {location.pathname === '/' && (
              <button
                type="button"
                onClick={() => setDarkMode((current) => {
                  const next = !current;
                  localStorage.setItem('ridelink-theme', next ? 'dark' : 'light');
                  window.dispatchEvent(new CustomEvent('ridelink-theme-change', { detail: next }));
                  return next;
                })}
                className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label={`Switch to ${darkMode ? 'day' : 'night'} mode`}
                title={`Switch to ${darkMode ? 'day' : 'night'} mode`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Multi-role Switcher */}
                {user.roles && user.roles.length > 1 && (
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                    {user.roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          if (role === 'ADMIN') navigate('/admin');
                          else if (role === 'DRIVER') navigate('/driver');
                          else navigate('/passenger');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          activeRole === role
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {role === 'ADMIN'
                          ? 'Admin'
                          : role === 'DRIVER'
                            ? 'Driver'
                            : 'Passenger'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dashboard button */}
                <Link to={getDashboardLink()}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<LayoutDashboard className="w-4 h-4" />}
                  >
                    Dashboard
                  </Button>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {activeRole?.toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">
                          {user.email}
                        </p>
                        <Badge
                          status={activeRole || 'PASSENGER'}
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openLogoutModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {location.pathname === '/' && (
              <button
                type="button"
                onClick={() => setDarkMode((current) => {
                  const next = !current;
                  localStorage.setItem('ridelink-theme', next ? 'dark' : 'light');
                  window.dispatchEvent(new CustomEvent('ridelink-theme-change', { detail: next }));
                  return next;
                })}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label={`Switch to ${darkMode ? 'day' : 'night'} mode`}
                title={`Switch to ${darkMode ? 'day' : 'night'} mode`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Book a Ride
          </Link>
          <Link
            to="/driver/onboarding"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            Drive with Us
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button variant="secondary" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full text-rose-600 border-rose-200"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLogoutModal();
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="accent" className="w-full font-bold">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={logoutModalOpen}
        onClose={closeLogoutModal}
        title="Sign out of your account?"
        description="You’ll be signed out of your current RideLink session and redirected to the login page."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeLogoutModal}>
              Stay Signed In
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                closeLogoutModal();
                await handleLogout();
              }}
            >
              Sign Out
            </Button>
          </>
        }
      ></Modal>
    </header>
  );
};
