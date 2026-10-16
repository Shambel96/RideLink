import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';

interface RoleRouteProps {
  requiredRole: UserRole;
  children: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ requiredRole, children }) => {
  const { user } = useAuthStore();

  if (!user || !user.roles.includes(requiredRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};
