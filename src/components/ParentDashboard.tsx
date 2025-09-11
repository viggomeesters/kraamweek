'use client';

import { useState, useEffect } from 'react';
import { BabyRecord, AppData } from '@/types';
import { DataService } from '@/lib/dataService';

// Utility functions for date/time inputs
const getCurrentDate = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const getCurrentTime = () => new Date().toTimeString().slice(0, 5); // HH:MM format
const createTimestamp = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();

export default function ParentDashboard() {
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const refreshData = () => {
    setData(DataService.loadData());
  };

  const handleAddRecord = (record: Omit<BabyRecord, 'id'>) => {
    DataService.addBabyRecord(record);
    refreshData();
    setActiveForm(null);
  };

  // Get recent records for display - sort by entry order (most recently entered first)
  const recentRecords = data.babyRecords
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order) 
    .slice(0, 10); // Take first 10 (most recently entered)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Baby gegevens registreren
        </h2>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <ActionButton
            icon="😴"
            title="Slaap"
            onClick={() => setActiveForm('sleep')}
            active={activeForm === 'sleep'}
          />
          <ActionButton
            icon="🍼"
            title="Voeding"
            onClick={() => setActiveForm('feeding')}
            active={activeForm === 'feeding'}
          />
          <ActionButton
            icon="🥛"
            title="Kolven"
            onClick={() => setActiveForm('pumping')}
            active={activeForm === 'pumping'}
          />
          <ActionButton
            icon="🌡️"
            title="Temperatuur"
            onClick={() => setActiveForm('temperature')}
            active={activeForm === 'temperature'}
          />
          <ActionButton
            icon="👶"
            title="Luier"
            onClick={() => setActiveForm('diaper')}
            active={activeForm === 'diaper'}
          />
          <ActionButton
            icon="📝"
            title="Notitie"
            onClick={() => setActiveForm('note')}
            active={activeForm === 'note'}
          />
        </div>

        {/* Forms */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
          {!activeForm && (
            <p className="text-gray-500 text-center py-8">
              Selecteer een actie hierboven om een registratie toe te voegen
            </p>
          )}
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Recente registraties
        </h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recentRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nog geen registraties
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentRecords.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: string;
  title: string;
  onClick: () => void;
  active: boolean;
}

function ActionButton({ icon, title, onClick, active }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        active
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
    </button>
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
  const [date, setDate] = useState(getCurrentDate);
  const [showDateControls, setShowDateControls] = useState(false);

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
    if (startTime) {
      calculateEndTimeFromDuration(startTime, newDuration);
    } else if (endTime) {
      calculateStartTimeFromDuration(endTime, newDuration);
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
      <h3 className="text-lg font-medium">Slaap registreren</h3>
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Begintijd (wanneer ging baby slapen)
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
            Eindtijd (wanneer werd baby wakker)
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
        💡 <strong>Tip:</strong> Vul de begintijd, eindtijd of slaapduur in - de andere velden worden automatisch berekend!
      </div>

      {/* Collapsible Date Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowDateControls(!showDateControls)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          <span className="mr-1">{showDateControls ? '▼' : '▶'}</span>
          Tijdstip aanpassen?
        </button>
        
        {showDateControls && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              required
            />
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
          rows={3}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
  const [date, setDate] = useState(getCurrentDate);
  const [time, setTime] = useState(getCurrentTime);
  const [showDateControls, setShowDateControls] = useState(false);

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
      <h3 className="text-lg font-medium">Voeding registreren</h3>
      
      {/* Feeding Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type voeding
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFeedingType('bottle')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'bottle'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">🍼</div>
            <div className="font-medium">Fles</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_left')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_left'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">🤱</div>
            <div className="font-medium">Linker borst</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_right')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_right'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">🤱</div>
            <div className="font-medium">Rechter borst</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFeedingType('breast_both')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              feedingType === 'breast_both'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">🤱</div>
            <div className="font-medium">Beide borsten</div>
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

      {/* Collapsible Date/Time Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowDateControls(!showDateControls)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          <span className="mr-1">{showDateControls ? '▼' : '▶'}</span>
          Tijdstip aanpassen?
        </button>
        
        {showDateControls && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tijd
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
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
          rows={3}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
  const [date, setDate] = useState(getCurrentDate);
  const [time, setTime] = useState(getCurrentTime);
  const [showDateControls, setShowDateControls] = useState(false);

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
      <h3 className="text-lg font-medium">Kolven registreren</h3>
      
      {/* Breast Side Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Welke borst?
        </label>
        <div className="grid grid-cols-3 gap-3">
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

      {/* Collapsible Date/Time Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowDateControls(!showDateControls)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          <span className="mr-1">{showDateControls ? '▼' : '▶'}</span>
          Tijdstip aanpassen?
        </button>
        
        {showDateControls && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tijd
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
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
          rows={3}
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
  const [date, setDate] = useState(getCurrentDate);
  const [time, setTime] = useState(getCurrentTime);
  const [showDateControls, setShowDateControls] = useState(false);
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
        <h3 className="text-lg font-medium">Temperatuur meten</h3>
        
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

        {/* Collapsible Date/Time Section */}
        <div>
          <button
            type="button"
            onClick={() => setShowDateControls(!showDateControls)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
          >
            <span className="mr-1">{showDateControls ? '▼' : '▶'}</span>
            Tijdstip aanpassen?
          </button>
          
          {showDateControls && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tijd
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  required
                />
              </div>
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
          rows={3}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Annuleren
        </button>
      </div>
    </form>

    {/* Temperature Alert Modal */}
    {showAlert && alertData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
          <div className={`p-4 rounded-t-lg ${alertData.type === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {alertData.type === 'high' ? '🌡️🔥' : '🌡️❄️'}
              </span>
              <h3 className="text-lg font-semibold">{alertData.message}</h3>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Wat kun je doen:</h4>
            <ul className="space-y-2">
              {alertData.advice.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-600 mr-2 flex-shrink-0">•</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAlert(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuleren
            </button>
            <button
              onClick={handleAlertAcknowledged}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Begrepen, toch opslaan
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
  const [date, setDate] = useState(getCurrentDate);
  const [time, setTime] = useState(getCurrentTime);
  const [showDateControls, setShowDateControls] = useState(false);

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
      <h3 className="text-lg font-medium">Luier verschonen</h3>
      
      {/* Diaper Type - Easy Click Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type luier
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDiaperType('wet')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'wet'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">💧</div>
            <div className="font-medium">Nat</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperType('dirty')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'dirty'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">💩</div>
            <div className="font-medium">Vies</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperType('both')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              diaperType === 'both'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">💧💩</div>
            <div className="font-medium">Beide</div>
          </button>
        </div>
      </div>

      {/* Amount Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hoeveelheid
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDiaperAmount('little')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'little'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Weinig</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperAmount('medium')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'medium'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Middel</div>
          </button>
          
          <button
            type="button"
            onClick={() => setDiaperAmount('much')}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${
              diaperAmount === 'much'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">Veel</div>
          </button>
        </div>
      </div>

      {/* Collapsible Date/Time Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowDateControls(!showDateControls)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          <span className="mr-1">{showDateControls ? '▼' : '▶'}</span>
          Tijdstip aanpassen?
        </button>
        
        {showDateControls && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tijd
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                required
              />
            </div>
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
          rows={3}
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
      <h3 className="text-lg font-medium">Notitie toevoegen</h3>
      
      {/* Note Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type notitie
        </label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => setNoteCategory('general')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'general'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">📝</span>
              <div>
                <div className="font-medium">Algemene notitie</div>
                <div className="text-sm opacity-75">Voor jezelf bijhouden</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setNoteCategory('question')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'question'
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">❓</span>
              <div>
                <div className="font-medium">Vraag aan kraamhulp</div>
                <div className="text-sm opacity-75">Vraag over ontwikkeling of verzorging</div>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setNoteCategory('todo')}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              noteCategory === 'todo'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">✅</span>
              <div>
                <div className="font-medium">Verzoek aan kraamhulp</div>
                <div className="text-sm opacity-75">Bijvoorbeeld: was draaien, boodschappen</div>
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
          rows={4}
          placeholder={
            noteCategory === 'general' ? 'Typ hier je notitie...' :
            noteCategory === 'question' ? 'Bijv: Hoe vaak moet ik baby verschonen?' :
            'Bijv: Kun je vandaag de was doen?'
          }
          required
        />
      </div>
      
      {(noteCategory === 'question' || noteCategory === 'todo') && (
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">ℹ️</span>
            <div className="text-sm text-blue-800">
              <strong>Let op:</strong> Deze {noteCategory === 'question' ? 'vraag' : 'taak'} wordt doorgestuurd naar de kraamhulp en verschijnt in haar takenoverzicht.
            </div>
          </div>
        </div>
      )}
      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Opslaan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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