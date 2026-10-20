import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Car,
  Compass,
  History,
  User as UserIcon,
  Shield,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Radio,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const DashboardLayout: React.FC = () => {
  const { user, activeRole, setActiveRole, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openLogoutModal = () => setLogoutModalOpen(true);
  const closeLogoutModal = () => setLogoutModalOpen(false);

  const passengerLinks = [
    { label: 'Overview', to: '/passenger', icon: Compass },
    { label: 'Book a Ride', to: '/book', icon: PlusCircle },
    { label: 'Ride History', to: '/passenger/history', icon: History },
    { label: 'Profile & Security', to: '/profile', icon: UserIcon },
  ];

  const driverLinks = [
    { label: 'Driver Portal', to: '/driver', icon: Compass },
    { label: 'Live Requests', to: '/driver/requests', icon: Radio },
    {
      label: 'Availability & GPS',
      to: '/driver/availability',
      icon: CheckCircle2,
    },
    { label: 'My Vehicles', to: '/driver/vehicles', icon: Car },
    { label: 'Ride History', to: '/driver/history', icon: History },
    { label: 'Verification Status', to: '/driver/onboarding', icon: FileCheck },
    { label: 'Profile & Security', to: '/profile', icon: UserIcon },
  ];

  const adminLinks = [
    { label: 'Admin Analytics', to: '/admin', icon: BarChart3 },
    { label: 'Driver Verification Queue', to: '/admin/drivers', icon: Shield },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'All Platform Rides', to: '/admin/rides', icon: FolderKanban },
    { label: 'Profile & Security', to: '/profile', icon: UserIcon },
  ];

  const navLinks =
    activeRole === 'ADMIN'
      ? adminLinks
      : activeRole === 'DRIVER'
        ? driverLinks
        : passengerLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:w-72 lg:shrink-0`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-electric-500 flex items-center justify-center text-slate-950 font-bold shadow-limeGlow">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold text-white">Ride</span>
              <span className="text-xl font-extrabold text-electric-500">
                Link
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher if multi-role */}
        {user?.roles && user.roles.length > 1 && (
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active Context
            </p>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {user.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    if (role === 'ADMIN') navigate('/admin');
                    else if (role === 'DRIVER') navigate('/driver');
                    else navigate('/passenger');
                    setSidebarOpen(false);
                  }}
                  className={`text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                    activeRole === role
                      ? 'bg-electric-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role === 'ADMIN'
                    ? 'Admin'
                    : role === 'DRIVER'
                      ? 'Driver'
                      : 'Rider'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-electric-500 stroke-[2.2]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-electric-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={logoutModalOpen}
        onClose={closeLogoutModal}
        title="Sign out of your account?"
        description="You’ll be signed out of your dashboard and returned to the login screen."
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge status={activeRole || 'PASSENGER'} size="sm" />
              <span className="hidden sm:inline text-xs text-slate-400">|</span>
              <span className="hidden sm:inline text-xs font-medium text-slate-600">
                {activeRole === 'ADMIN'
                  ? 'Platform Administration & Oversight'
                  : activeRole === 'DRIVER'
                    ? 'Driver Workspace & Ride Dispatch'
                    : 'Passenger Portal & Bookings'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/book">
              <Button
                variant="accent"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Book a Ride
              </Button>
            </Link>
            <button
              onClick={openLogoutModal}
              className="p-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
