'use client';

import { useState, useEffect } from 'react';
import { AppData, BabyRecord, MotherRecord } from '@/types';
import { DataService } from '@/lib/dataService';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import Profile from '@/components/Profile';
import Overview from '@/components/Overview';
import LoggingGallery from '@/components/LoggingGallery';
import { AnalyticsSection } from '@/components/Analytics';
import Toast from '@/components/Toast';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';

export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated, login, register, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'logging' | 'analytics' | 'user'>('profile');
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    // Load initial data when user changes
    if (user) {
      setData(DataService.loadData());
    }
    setIsLoading(false);
  }, [user]);

  const refreshData = () => {
    setData(DataService.loadData());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleAddBabyRecord = (record: Omit<BabyRecord, 'id'>) => {
    DataService.addBabyRecord(record);
    refreshData();
    // Switch to overview to show the new record
    setActiveTab('overview');
  };

  const handleAddMotherRecord = (record: Omit<MotherRecord, 'id'>) => {
    DataService.addMotherRecord(record);
    refreshData();
    // Switch to overview to show the new record
    setActiveTab('overview');
  };

  // Show loading screen while auth is being determined
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm 
        onLogin={login}
        onRegister={register}
        isLoading={authLoading}
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile profile={data.babyProfile} onProfileUpdate={refreshData} />;
      case 'overview':
        return <Overview data={data} />;
      case 'logging':
        return (
          <LoggingGallery
            onAddBabyRecord={handleAddBabyRecord}
            onAddMotherRecord={handleAddMotherRecord}
            onSuccess={showToast}
          />
        );
      case 'analytics':
        return (
          <div className="p-4 pb-24">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Trends</h1>
              <AnalyticsSection 
                babyRecords={data.babyRecords} 
                motherRecords={data.motherRecords} 
              />
            </div>
          </div>
        );
      case 'user':
        return (
          <div className="p-4 pb-24">
            <div className="max-w-md mx-auto">
              <UserProfile 
                user={user!}
                onLogout={logout}
                onProfileUpdate={updateProfile}
              />
            </div>
          </div>
        );
      default:
        return <Profile profile={data.babyProfile} onProfileUpdate={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderActiveTab()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
