'use client';

import { useState, useEffect } from 'react';
import { BabyRecord, AppData, BabyProfile, User } from '@/types';
import { DataService } from '@/lib/dataService';
import { AnalyticsSection } from './Analytics';

import { formatTime24, formatDateDDMMYYYY, formatDateLong } from '@/lib/dateUtils';
import FloatingActionButton from './FloatingActionButton';
import BottomNavigation from './BottomNavigation';
import MobileOverview from './MobileOverview';

// Utility functions for date/time inputs
const getCurrentDate = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const getCurrentTime = () => new Date().toTimeString().slice(0, 5); // HH:MM format
const createTimestamp = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

interface UnifiedDashboardProps {
  user: User;
}

export default function UnifiedDashboard({ user }: UnifiedDashboardProps) {
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'overview' | 'analytics' | 'profile'>('profile');

  const refreshData = () => {
    setData(DataService.loadData());
  };

  const handleAddRecord = (record: Omit<BabyRecord, 'id'>) => {
    DataService.addBabyRecord(record);
    refreshData();
    setActiveForm(null);
    // Switch to recent tab to show the newly added record
    setActiveTab('recent');
  };

  // Get unacknowledged alerts (kraamhulp only)
  const unacknowledgedAlerts = data.alerts.filter(alert => !alert.acknowledged);

  // Get recent records for display - sort by entry order (most recently entered first)
  const recentRecords = data.babyRecords
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order) 
    .slice(0, 10); // Take first 10 (most recently entered)

  return (
    <>
      <div className="space-y-4">
        {/* Alerts Section - Only for Kraamhulp */}
        {user.role === 'kraamhulp' && unacknowledgedAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
              ⚠️ Waarschuwingen ({unacknowledgedAlerts.length})
            </h3>
            <div className="space-y-2">
              {unacknowledgedAlerts.map((alert) => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert} 
                  onAcknowledge={(comment) => {
                    DataService.acknowledgeAlert(alert.id, 'Kraamhulp', comment);
                    refreshData();
                  }} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recente registraties
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {recentRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {user.role === 'parents' ? 'Nog geen registraties' : 'Nog geen registraties'}
                  </h3>
                  <p className="text-gray-600">
                    {user.role === 'parents' 
                      ? 'Gebruik de + knop om een registratie toe te voegen'
                      : 'Wacht op nieuwe registraties van ouders'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentRecords.map((record) => (
                    <RecordItem key={record.id} record={record} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <MobileOverview data={data} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection data={data} />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Baby profiel
            </h2>
            
            {data.babyProfile ? (
              <BabyProfileDisplay profile={data.babyProfile} />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">👶</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nog geen baby profiel
                </h3>
                <p className="text-gray-600 mb-4">
                  {user.role === 'parents' 
                    ? 'Maak een profiel aan om belangrijke informatie over je baby vast te leggen.'
                    : 'Maak een profiel aan om belangrijke informatie over de baby vast te leggen.'
                  }
                </p>
                <button
                  onClick={() => setActiveForm('profile')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Profiel aanmaken
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form Modals */}
        {activeForm && (
          <FormModal 
            type={activeForm} 
            onClose={() => setActiveForm(null)} 
            onSubmit={handleAddRecord}
            data={data}
            refreshData={refreshData}
          />
        )}
      </div>

      {/* Floating Action Button - Only for Parents */}
      {user.role === 'parents' && (
        <FloatingActionButton onActionSelect={setActiveForm} />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user.role}
      />
    </>
  );
}

// Components that need to be copied from the original files
function RecordItem({ record }: { record: BabyRecord }) {
  // This will be copied from ParentDashboard
  return <div>Record Item Component</div>;
}

function BabyProfileDisplay({ profile }: { profile: BabyProfile }) {
  // This will be copied from ParentDashboard
  return <div>Baby Profile Display Component</div>;
}

function FormModal({ type, onClose, onSubmit, data, refreshData }: any) {
  // This will be copied from ParentDashboard
  return <div>Form Modal Component</div>;
}

function AlertItem({ alert, onAcknowledge }: any) {
  // This will be copied from NurseDashboard
  return <div>Alert Item Component</div>;
}