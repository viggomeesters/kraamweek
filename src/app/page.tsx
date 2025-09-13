'use client';

import { useState, useEffect } from 'react';
import { AppData, BabyRecord, MotherRecord } from '@/types';
import { DataService } from '@/lib/dataService';
import BottomNav from '@/components/BottomNav';
import Profile from '@/components/Profile';
import Overview from '@/components/Overview';
import LoggingGallery from '@/components/LoggingGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'logging'>('profile');
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    setData(DataService.loadData());
    setIsLoading(false);
  }, []);

  const refreshData = () => {
    setData(DataService.loadData());
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
          />
        );
      default:
        return <Profile profile={data.babyProfile} onProfileUpdate={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderActiveTab()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
