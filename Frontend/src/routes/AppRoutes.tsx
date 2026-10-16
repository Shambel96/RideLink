import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Guards
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { AccessDeniedPage } from '../pages/public/AccessDeniedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Passenger Pages
import { PassengerDashboard } from '../pages/passenger/PassengerDashboard';
import { BookRidePage } from '../pages/passenger/BookRidePage';
import { RideTrackingPage } from '../pages/passenger/RideTrackingPage';
import { RideHistoryPage } from '../pages/passenger/RideHistoryPage';
import { ProfilePage } from '../pages/passenger/ProfilePage';

// Driver Pages
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { DriverOnboardingPage } from '../pages/driver/DriverOnboardingPage';
import { DriverAvailabilityPage } from '../pages/driver/DriverAvailabilityPage';
import { AvailableRidesPage } from '../pages/driver/AvailableRidesPage';
import { ActiveDriverRidePage } from '../pages/driver/ActiveDriverRidePage';
import { VehiclesPage } from '../pages/driver/VehiclesPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DriverVerificationPage } from '../pages/admin/DriverVerificationPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { AdminRidesPage } from '../pages/admin/AdminRidesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with standard Navbar & Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
      </Route>

      {/* Standalone Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Experience */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Passenger Routes */}
        <Route path="/passenger" element={<PassengerDashboard />} />
        <Route path="/book" element={<BookRidePage />} />
        <Route path="/rides/:id" element={<RideTrackingPage />} />
        <Route path="/passenger/history" element={<RideHistoryPage role="passenger" />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Driver Onboarding (accessible by any registered passenger who wants to become a driver) */}
        <Route path="/driver/onboarding" element={<DriverOnboardingPage />} />

        {/* Driver Role Protected Routes */}
        <Route
          path="/driver"
          element={
            <RoleRoute requiredRole="DRIVER">
              <DriverDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/driver/availability"
          element={
            <RoleRoute requiredRole="DRIVER">
              <DriverAvailabilityPage />
            </RoleRoute>
          }
        />
        <Route
          path="/driver/requests"
          element={
            <RoleRoute requiredRole="DRIVER">
              <AvailableRidesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/driver/rides/:id"
          element={
            <RoleRoute requiredRole="DRIVER">
              <ActiveDriverRidePage />
            </RoleRoute>
          }
        />
        <Route
          path="/driver/vehicles"
          element={
            <RoleRoute requiredRole="DRIVER">
              <VehiclesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/driver/history"
          element={
            <RoleRoute requiredRole="DRIVER">
              <RideHistoryPage role="driver" />
            </RoleRoute>
          }
        />

        {/* Admin Role Protected Routes */}
        <Route
          path="/admin"
          element={
            <RoleRoute requiredRole="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <RoleRoute requiredRole="ADMIN">
              <DriverVerificationPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute requiredRole="ADMIN">
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/rides"
          element={
            <RoleRoute requiredRole="ADMIN">
              <AdminRidesPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
