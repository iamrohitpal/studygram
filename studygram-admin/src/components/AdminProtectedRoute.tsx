import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';

export const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.adminAuth);

  // Note: we can add admin-specific role checks here
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
