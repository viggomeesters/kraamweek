'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { DataService } from '@/lib/dataService';
import UserSelector from '@/components/UserSelector';
import DashboardLayout from '@/components/DashboardLayout';
import ParentDashboard from '@/components/ParentDashboard';
import NurseDashboard from '@/components/NurseDashboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = DataService.loadUser();
    setUser(savedUser);
    setIsLoading(false);
  }, []);

  const handleUserSelected = (selectedUser: User) => {
    setUser(selectedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <UserSelector onUserSelected={handleUserSelected} />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {user.role === 'kraamhulp' ? (
        <NurseDashboard />
      ) : (
        <ParentDashboard user={user} />
      )}
    </DashboardLayout>
  );
}
