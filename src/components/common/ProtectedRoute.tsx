import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, state } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const roleRedirects = {
      'super_admin': '/dashboard',
      'admin': '/dashboard',
      'cafeowner': '/dashboard',
      'cafe_owner': '/dashboard',
      'customer': '/'
    };
    
    const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};