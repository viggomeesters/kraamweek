'use client';

import { useState, useEffect } from 'react';
import { BabyRecord, AppData, BabyProfile } from '@/types';
import { DataService } from '@/lib/dataService';
import { AnalyticsSection } from './Analytics';
import FloatingActionButton from './FloatingActionButton';
import BottomNavigation from './BottomNavigation';
import MobileOverview from './MobileOverview';

// Utility functions for date/time inputs
const getCurrentDate = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const getCurrentTime = () => new Date().toTimeString().slice(0, 5); // HH:MM format
const createTimestamp = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

export default function ParentDashboard() {
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'overview' | 'analytics' | 'profile'>('recent');

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

  // Get recent records for display - sort by entry order (most recently entered first)
  const recentRecords = data.babyRecords
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order) 
    .slice(0, 10); // Take first 10 (most recently entered)

  return (
    <>
      <div className="space-y-4">
        {/* Tab Content */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recente registraties
            </h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {recentRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Nog geen registraties</p>
                  <p className="text-sm mt-1">Gebruik de + knop om een registratie toe te voegen</p>
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
          <MobileOverview records={data.babyRecords} />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
            <AnalyticsSection babyRecords={data.babyRecords} motherRecords={data.motherRecords} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Baby profiel</h2>
            <BabyProfileSection onRefresh={refreshData} />
          </div>
        )}

        {/* Form Modal */}
        {activeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-y-auto">
              <div className="p-6">
                {activeForm === 'sleep' && (
                  <SleepForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
                {activeForm === 'feeding' && (
                  <FeedingForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
                {activeForm === 'pumping' && (
                  <PumpingForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
                {activeForm === 'temperature' && (
                  <TemperatureForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
                {activeForm === 'diaper' && (
                  <DiaperForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
                {activeForm === 'note' && (
                  <NoteForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onActionSelect={(action) => setActiveForm(action)} />

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as 'recent' | 'overview' | 'analytics' | 'profile')}
        userRole="parents"
      />
    </>
  );
}

interface FormProps {
  onSubmit: (record: Omit<BabyRecord, 'id'>) => void;
  onCancel: () => void;
}

function SleepForm({ onSubmit, onCancel }: FormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState(getCurrentTime); // Default to current time
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [date] = useState(getCurrentDate);

  // Auto-calculate start time when component mounts (end time defaults to now, duration is 60 min)
  useEffect(() => {
    if (endTime && duration && !startTime) {
      calculateStartTimeFromDuration(endTime, duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Calculate duration when start/end times change
  const calculateDurationFromTimes = (start: string, end: string) => {
    if (!start || !end) return;
    
    const startDate = new Date(`2000-01-01T${start}:00`);
    const endDate = new Date(`2000-01-01T${end}:00`);
    
    // Handle overnight sleep (end time is next day)
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    setDuration(diffMinutes);
  };

  // Calculate end time when start time and duration change
  const calculateEndTimeFromDuration = (start: string, durationMinutes: number) => {
    if (!start) return;
    
    const startDate = new Date(`2000-01-01T${start}:00`);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    
    const hours = endDate.getHours().toString().padStart(2, '0');
    const minutes = endDate.getMinutes().toString().padStart(2, '0');
    setEndTime(`${hours}:${minutes}`);
  };

  // Calculate start time when end time and duration change  
  const calculateStartTimeFromDuration = (end: string, durationMinutes: number) => {
    if (!end) return;
    
    const endDate = new Date(`2000-01-01T${end}:00`);
    const startDate = new Date(endDate.getTime() - durationMinutes * 60 * 1000);
    
    const hours = startDate.getHours().toString().padStart(2, '0');
    const minutes = startDate.getMinutes().toString().padStart(2, '0');
    setStartTime(`${hours}:${minutes}`);
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    if (endTime) {
      calculateDurationFromTimes(newStartTime, endTime);
    } else {
      calculateEndTimeFromDuration(newStartTime, duration);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    if (startTime) {
      calculateDurationFromTimes(startTime, newEndTime);
    } else {
      calculateStartTimeFromDuration(newEndTime, duration);
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (endTime) {
      calculateStartTimeFromDuration(endTime, newDuration);
    } else if (startTime) {
      calculateEndTimeFromDuration(startTime, newDuration);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use end time as the timestamp (when baby woke up)
    const timestamp = endTime ? createTimestamp(date, endTime) : new Date().toISOString();
    
    onSubmit({
      timestamp,
      type: 'sleep',
      duration,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">😴 Slaap registreren</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Sleep Duration Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slaapduur: {Math.floor(duration / 60)}u {duration % 60}m
        </label>
        <input
          type="range"
          min="10"
          max="480"
          step="10"
          value={duration}
          onChange={(e) => handleDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10min</span>
          <span>8u</span>
        </div>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Begintijd
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eindtijd
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={2}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

function FeedingForm({ onSubmit, onCancel }: FormProps) {
  const [feedingType, setFeedingType] = useState<'bottle' | 'breast_left' | 'breast_right' | 'breast_both'>('bottle');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(getCurrentDate);
  const [time] = useState(getCurrentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: createTimestamp(date, time),
      type: 'feeding',
      feedingType,
      amount: feedingType === 'bottle' ? parseInt(amount) || 0 : undefined, // Only track amount for bottle
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">🍼 Voeding registreren</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Feeding Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type voeding
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFeedingType('bottle')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'bottle'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">🍼</div>
            <div className="text-sm font-medium">Fles</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_left')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_left'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">🤱</div>
            <div className="text-sm font-medium">Links</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_right')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_right'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">🤱</div>
            <div className="text-sm font-medium">Rechts</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_both')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_both'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">🤱</div>
            <div className="text-sm font-medium">Beide</div>
          </button>
        </div>
      </div>

      {/* Amount for bottle feeding only */}
      {feedingType === 'bottle' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hoeveelheid (ml)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            min="1"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={2}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

function PumpingForm({ onSubmit, onCancel }: FormProps) {
  const [breastSide, setBreastSide] = useState<'left' | 'right' | 'both'>('left');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(getCurrentDate);
  const [time] = useState(getCurrentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: createTimestamp(date, time),
      type: 'pumping',
      breastSide,
      amount: parseInt(amount) || 0,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">🥛 Kolven registreren</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Breast Side Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Welke borst?
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setBreastSide('left')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              breastSide === 'left'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Links</div>
          </button>
          
          <button
            type="button"
            onClick={() => setBreastSide('right')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              breastSide === 'right'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Rechts</div>
          </button>
          
          <button
            type="button"
            onClick={() => setBreastSide('both')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              breastSide === 'both'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Beide</div>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hoeveelheid (ml)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          min="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={2}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

function TemperatureForm({ onSubmit, onCancel }: FormProps) {
  const [temperature, setTemperature] = useState(37.0);
  const [notes, setNotes] = useState('');
  const [date] = useState(getCurrentDate);
  const [time] = useState(getCurrentTime);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: 'high' | 'low';
    message: string;
    advice: string[];
  } | null>(null);

  const checkTemperatureAlert = (temp: number) => {
    if (temp >= 37.6) {
      setAlertData({
        type: 'high',
        message: 'Let op: je baby heeft koorts!',
        advice: [
          'Controleer de temperatuur opnieuw na 15-30 minuten',
          'Zorg dat je baby niet te warm aangekleed is',
          'Geef extra vocht (borstvoeding of flesvoeding)',
          'Neem contact op met de kraamhulp of huisarts',
          'Bij koorts boven 38°C: direct contact opnemen met arts',
          'Let op tekenen van ziekte: prikkelbaarheid, slapheid, voeding weigeren'
        ]
      });
      setShowAlert(true);
    } else if (temp < 36.0) {
      setAlertData({
        type: 'low',
        message: 'Let op: je baby is te koud!',
        advice: [
          'Controleer of baby warm genoeg aangekleed is',
          'Zet een mutsje op',
          'Trek warme sokjes aan',
          'Leg een extra dekentje over baby heen',
          'Controleer de kamertemperaat (ideaal: 18-20°C)',
          'Neem contact op met kraamhulp indien temperatuur onder 35.5°C',
          'Bij aanhoudende lage temperatuur: contact opnemen met arts'
        ]
      });
      setShowAlert(true);
    }
  };

  const getTemperatureBackgroundColor = () => {
    if (temperature >= 37.6) {
      return 'bg-red-50 border-red-300'; // Too warm
    } else if (temperature < 36.0) {
      return 'bg-blue-50 border-blue-300'; // Too cold
    }
    return 'bg-white border-gray-300'; // Normal
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for temperature alerts on form submission (not while typing)
    checkTemperatureAlert(temperature);
    
    // If there's an alert, show it before submitting
    if (temperature >= 37.6 || temperature < 36.0) {
      return; // Don't submit yet, let user acknowledge the alert first
    }
    
    onSubmit({
      timestamp: createTimestamp(date, time),
      type: 'temperature',
      value: temperature,
      notes: notes.trim() || undefined,
    });
  };

  const handleAlertAcknowledged = () => {
    setShowAlert(false);
    // After acknowledging, submit the form
    onSubmit({
      timestamp: createTimestamp(date, time),
      type: 'temperature',
      value: temperature,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">🌡️ Temperatuur meten</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {/* Temperature Slider */}
        <div className={`p-4 rounded-md border-2 transition-colors ${getTemperatureBackgroundColor()}`}>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Temperatuur: {temperature.toFixed(1)}°C
          </label>
          <input
            type="range"
            min="35.0"
            max="41.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>35°C</span>
            <span>41°C</span>
          </div>
          {temperature >= 37.6 && (
            <div className="mt-2 flex items-center text-red-600">
              <span className="mr-1">🌡️🔥</span>
              <span className="text-sm font-medium">Te warm</span>
            </div>
          )}
          {temperature < 36.0 && (
            <div className="mt-2 flex items-center text-blue-600">
              <span className="mr-1">🌡️❄️</span>
              <span className="text-sm font-medium">Te koud</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notities (optioneel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            rows={2}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Opslaan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuleren
          </button>
        </div>
      </form>

      {/* Temperature Alert Modal */}
      {showAlert && alertData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-80 overflow-y-auto">
            <div className={`p-4 rounded-t-lg ${alertData.type === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {alertData.type === 'high' ? '🌡️🔥' : '🌡️❄️'}
                </span>
                <h3 className="text-md font-semibold">{alertData.message}</h3>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Wat kun je doen:</h4>
              <ul className="space-y-1">
                {alertData.advice.slice(0, 3).map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-600 mr-2 flex-shrink-0">•</span>
                    <span className="text-xs text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              >
                Annuleren
              </button>
              <button
                onClick={handleAlertAcknowledged}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                Begrepen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DiaperForm({ onSubmit, onCancel }: FormProps) {
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [diaperAmount, setDiaperAmount] = useState<'little' | 'medium' | 'much'>('medium');
  const [notes, setNotes] = useState('');
  const [date] = useState(getCurrentDate);
  const [time] = useState(getCurrentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: createTimestamp(date, time),
      type: 'diaper',
      diaperType,
      diaperAmount,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">👶 Luier verschonen</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Diaper Type - Easy Click Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type luier
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDiaperType('wet')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'wet'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">💧</div>
            <div className="text-sm font-medium">Nat</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperType('dirty')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'dirty'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">💩</div>
            <div className="text-sm font-medium">Vies</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperType('both')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'both'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-xl mb-1">💧💩</div>
            <div className="text-sm font-medium">Beide</div>
          </button>
        </div>
      </div>

      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hoeveelheid
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDiaperAmount('little')}
            className={`p-2 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'little'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium">Weinig</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperAmount('medium')}
            className={`p-2 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'medium'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium">Middel</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperAmount('much')}
            className={`p-2 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'much'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium">Veel</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={2}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

function NoteForm({ onSubmit, onCancel }: FormProps) {
  const [noteCategory, setNoteCategory] = useState<'general' | 'question' | 'todo'>('general');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'note',
      noteCategory,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">📝 Notitie toevoegen</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {/* Note Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type notitie
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setNoteCategory('general')}
            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'general'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">📝</span>
              <div>
                <div className="font-medium text-sm">Algemene notitie</div>
                <div className="text-xs opacity-75">Voor jezelf bijhouden</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setNoteCategory('question')}
            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'question'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">❓</span>
              <div>
                <div className="font-medium text-sm">Vraag aan kraamhulp</div>
                <div className="text-xs opacity-75">Vraag over ontwikkeling of verzorging</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setNoteCategory('todo')}
            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'todo'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-3">✅</span>
              <div>
                <div className="font-medium text-sm">Verzoek aan kraamhulp</div>
                <div className="text-xs opacity-75">Bijvoorbeeld: was draaien, boodschappen</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {noteCategory === 'general' && 'Notitie'}
          {noteCategory === 'question' && 'Wat is je vraag?'}
          {noteCategory === 'todo' && 'Wat zou je graag willen dat de kraamhulp doet?'}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={3}
          placeholder={
            noteCategory === 'general' ? 'Typ hier je notitie...' :
            noteCategory === 'question' ? 'Bijv: Hoe vaak moet ik baby verschonen?' :
            'Bijv: Kun je vandaag de was doen?'
          }
          required
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

interface RecordItemProps {
  record: BabyRecord;
}

function RecordItem({ record }: RecordItemProps) {
  const getRecordDisplay = () => {
    const time = new Date(record.timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const date = new Date(record.timestamp).toLocaleDateString('nl-NL');

    switch (record.type) {
      case 'sleep':
        return { icon: '😴', text: `Slaap: ${record.duration} min`, time, date };
      case 'feeding':
        if (record.feedingType === 'bottle') {
          return { icon: '🍼', text: `Voeding: ${record.amount} ml (fles)`, time, date };
        } else if (record.feedingType === 'breast_left') {
          return { icon: '🤱', text: `Voeding: linker borst`, time, date };
        } else if (record.feedingType === 'breast_right') {
          return { icon: '🤱', text: `Voeding: rechter borst`, time, date };
        } else if (record.feedingType === 'breast_both') {
          return { icon: '🤱', text: `Voeding: beide borsten`, time, date };
        }
        return { icon: '🍼', text: `Voeding`, time, date };
      case 'pumping':
        const sideText = record.breastSide === 'both' ? 'beide borsten' : 
                        record.breastSide === 'left' ? 'linker borst' : 'rechter borst';
        return { icon: '🥛', text: `Kolven: ${record.amount} ml (${sideText})`, time, date };
      case 'temperature':
        const tempValue = record.value as number;
        const tempIcon = tempValue >= 38.5 ? '🌡️🔥' : tempValue <= 35.0 ? '🌡️❄️' : '🌡️';
        const tempText = `Temperatuur: ${record.value}°C${tempValue >= 38.5 ? ' (Extreem hoog!)' : tempValue <= 35.0 ? ' (Extreem laag!)' : tempValue >= 37.6 ? ' (Verhoogd)' : ''}`;
        return { icon: tempIcon, text: tempText, time, date };
      case 'diaper':
        const amountText = record.diaperAmount ? ` (${record.diaperAmount})` : '';
        return { icon: '👶', text: `Luier: ${record.diaperType}${amountText}`, time, date };
      case 'jaundice':
        return { icon: '🟡', text: `Geelzien: niveau ${record.jaundiceLevel}`, time, date };
      case 'note':
        const categoryIcon = record.noteCategory === 'question' ? '❓' : 
                           record.noteCategory === 'todo' ? '✅' : '📝';
        const categoryText = record.noteCategory === 'question' ? 'Vraag' :
                           record.noteCategory === 'todo' ? 'Verzoek' : 'Notitie';
        return { icon: categoryIcon, text: categoryText, time, date };
      default:
        return { icon: '📋', text: record.type, time, date };
    }
  };

  const { icon, text, time, date } = getRecordDisplay();

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.notes && (
              <div className="text-sm text-gray-600 mt-1">{record.notes}</div>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{time}</div>
          <div>{date}</div>
        </div>
      </div>
    </div>
  );
}

// Baby Profile Components for Parents
function BabyProfileSection({ onRefresh }: { onRefresh: () => void }) {
  const [profile, setProfile] = useState<BabyProfile | null>(DataService.getBabyProfile());
  const [showForm, setShowForm] = useState(false);

  const refreshProfile = () => {
    setProfile(DataService.getBabyProfile());
    onRefresh();
  };

  const handleSaveProfile = (profileData: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    DataService.saveBabyProfile(profileData);
    refreshProfile();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <BabyProfileForm 
            profile={profile}
            onSubmit={handleSaveProfile}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!showForm && profile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-medium text-gray-900">Baby profiel</h4>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              Bewerken
            </button>
          </div>
          <BabyProfileDisplay profile={profile} />
        </div>
      )}

      {!showForm && !profile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👶</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nog geen baby profiel</h4>
            <p className="text-gray-600 mb-4">
              Maak een profiel aan om belangrijke informatie over je baby vast te leggen.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Profiel aanmaken
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BabyProfileFormProps {
  profile: BabyProfile | null;
  onSubmit: (profile: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function BabyProfileForm({ profile, onSubmit, onCancel }: BabyProfileFormProps) {
  const [voornaam, setVoornaam] = useState(profile?.voornaam || '');
  const [achternaam, setAchternaam] = useState(profile?.achternaam || '');
  const [roepnaam, setRoepnaam] = useState(profile?.roepnaam || '');
  const [geslacht, setGeslacht] = useState<'jongen' | 'meisje' | 'onbekend'>(profile?.geslacht || 'onbekend');
  const [geboortedatum, setGeboortedatum] = useState(profile?.geboortedatum?.split('T')[0] || '');
  const [geboortijd, setGeboortijd] = useState(profile?.geboortijd || '');
  const [geboortgewicht, setGeboortgewicht] = useState(profile?.geboortgewicht?.toString() || '');
  const [geboortelengte, setGeboortelengte] = useState(profile?.geboortelengte?.toString() || '');
  const [huisarts, setHuisarts] = useState(profile?.huisarts || '');
  const [verloskundige, setVerloskundige] = useState(profile?.verloskundige || '');
  const [bijzonderheden, setBijzonderheden] = useState(profile?.bijzonderheden || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      voornaam: voornaam.trim(),
      achternaam: achternaam.trim(),
      roepnaam: roepnaam.trim() || undefined,
      geslacht,
      geboortedatum: geboortedatum ? new Date(geboortedatum).toISOString() : new Date().toISOString(),
      geboortijd: geboortijd.trim() || undefined,
      geboortgewicht: geboortgewicht ? parseInt(geboortgewicht) : undefined,
      geboortelengte: geboortelengte ? parseInt(geboortelengte) : undefined,
      huisarts: huisarts.trim() || undefined,
      verloskundige: verloskundige.trim() || undefined,
      bijzonderheden: bijzonderheden.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">
        {profile ? 'Baby profiel bewerken' : 'Nieuw baby profiel'}
      </h4>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voornaam *
          </label>
          <input
            type="text"
            value={voornaam}
            onChange={(e) => setVoornaam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Achternaam *
          </label>
          <input
            type="text"
            value={achternaam}
            onChange={(e) => setAchternaam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roepnaam
          </label>
          <input
            type="text"
            value={roepnaam}
            onChange={(e) => setRoepnaam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="Indien anders dan voornaam"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geslacht
          </label>
          <select
            value={geslacht}
            onChange={(e) => setGeslacht(e.target.value as 'jongen' | 'meisje' | 'onbekend')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="onbekend">Onbekend</option>
            <option value="jongen">Jongen</option>
            <option value="meisje">Meisje</option>
          </select>
        </div>
      </div>

      {/* Birth Information - Simplified for parents */}
      <div className="border-t border-gray-200 pt-6">
        <h5 className="text-md font-medium text-gray-900 mb-4">Geboorte informatie</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortedatum *
            </label>
            <input
              type="date"
              value={geboortedatum}
              onChange={(e) => setGeboortedatum(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortijd
            </label>
            <input
              type="time"
              value={geboortijd}
              onChange={(e) => setGeboortijd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortegewicht (gram)
            </label>
            <input
              type="number"
              value={geboortgewicht}
              onChange={(e) => setGeboortgewicht(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              min="500"
              max="8000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geboortelengte (cm)
            </label>
            <input
              type="number"
              value={geboortelengte}
              onChange={(e) => setGeboortelengte(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              min="25"
              max="70"
            />
          </div>
        </div>
      </div>

      {/* Care Information - Simplified for parents */}
      <div className="border-t border-gray-200 pt-6">
        <h5 className="text-md font-medium text-gray-900 mb-4">Zorgverlening</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Huisarts
            </label>
            <input
              type="text"
              value={huisarts}
              onChange={(e) => setHuisarts(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verloskundige
            </label>
            <input
              type="text"
              value={verloskundige}
              onChange={(e) => setVerloskundige(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="border-t border-gray-200 pt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bijzonderheden  
          </label>
          <textarea
            value={bijzonderheden}
            onChange={(e) => setBijzonderheden(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            rows={3}
            placeholder="Medische bijzonderheden, allergieën, etc."
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {profile ? 'Wijzigingen opslaan' : 'Profiel aanmaken'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>
  );
}

interface BabyProfileDisplayProps {
  profile: BabyProfile;
}

function BabyProfileDisplay({ profile }: BabyProfileDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} dag${diffDays !== 1 ? 'en' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return `${weeks} we${weeks !== 1 ? 'ken' : 'ek'}${remainingDays > 0 ? ` en ${remainingDays} dag${remainingDays !== 1 ? 'en' : ''}` : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} maand${months !== 1 ? 'en' : ''}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with baby info */}
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="text-4xl mb-2">
          {profile.geslacht === 'jongen' ? '👶🏻' : profile.geslacht === 'meisje' ? '👶🏻' : '👶'}
        </div>
        <h5 className="text-xl font-bold text-gray-900">
          {profile.roepnaam || profile.voornaam} {profile.achternaam}
        </h5>
        <p className="text-indigo-600 font-medium mt-1">
          {calculateAge(profile.geboortedatum)} oud
        </p>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h6 className="font-medium text-gray-900 text-sm">Geboren</h6>
          <p className="text-gray-700">
            {formatDate(profile.geboortedatum)}
            {profile.geboortijd && ` om ${profile.geboortijd}`}
          </p>
        </div>

        {profile.geboortgewicht && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h6 className="font-medium text-gray-900 text-sm">Geboortegewicht</h6>
            <p className="text-gray-700">{profile.geboortgewicht} gram</p>
          </div>
        )}

        {profile.geboortelengte && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h6 className="font-medium text-gray-900 text-sm">Geboortelengte</h6>
            <p className="text-gray-700">{profile.geboortelengte} cm</p>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg">
          <h6 className="font-medium text-gray-900 text-sm">Geslacht</h6>
          <p className="text-gray-700 capitalize">{profile.geslacht}</p>
        </div>
      </div>

      {/* Care Providers */}
      {(profile.huisarts || profile.verloskundige) && (
        <div className="border-t border-gray-200 pt-4">
          <h6 className="font-medium text-gray-900 mb-2">Zorgverlening</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.huisarts && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Huisarts: </span>
                <span className="text-gray-700">{profile.huisarts}</span>
              </div>
            )}
            {profile.verloskundige && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Verloskundige: </span>
                <span className="text-gray-700">{profile.verloskundige}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {profile.bijzonderheden && (
        <div className="border-t border-gray-200 pt-4">
          <h6 className="font-medium text-gray-900 mb-2">Bijzonderheden</h6>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{profile.bijzonderheden}</p>
          </div>
        </div>
      )}
    </div>
  );
}