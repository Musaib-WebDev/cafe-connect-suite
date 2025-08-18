import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { CafeOwnerDashboard } from '@/components/dashboard/CafeOwnerDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {user.role === 'super_admin' && <SuperAdminDashboard />}
        {user.role === 'cafe_owner' && <CafeOwnerDashboard />}
      </main>
    </div>
  );
}