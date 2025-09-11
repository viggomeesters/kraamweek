'use client';

import { useState } from 'react';
import { BabyRecord, AppData } from '@/types';
import { DataService } from '@/lib/dataService';

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

  // Get recent records for display
  const recentRecords = data.babyRecords
    .slice(-10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
            icon="🟡"
            title="Geelzien"
            onClick={() => setActiveForm('jaundice')}
            active={activeForm === 'jaundice'}
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
          {activeForm === 'temperature' && (
            <TemperatureForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
          )}
          {activeForm === 'diaper' && (
            <DiaperForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
          )}
          {activeForm === 'jaundice' && (
            <JaundiceForm onSubmit={handleAddRecord} onCancel={() => setActiveForm(null)} />
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
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'sleep',
      duration: parseInt(duration) || 0,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Slaap registreren</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duur (minuten)
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'feeding',
      amount: parseInt(amount) || 0,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Voeding registreren</h3>
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
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customDateTime = new Date(`${date}T${time}:00`);
    onSubmit({
      timestamp: customDateTime.toISOString(),
      type: 'temperature',
      value: parseFloat(temperature),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Temperatuur meten</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Temperatuur (°C)
        </label>
        <input
          type="number"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          min="30"
          max="42"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

function DiaperForm({ onSubmit, onCancel }: FormProps) {
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'diaper',
      diaperType,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Luier verschonen</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type
        </label>
        <div className="space-y-2">
          {[
            { value: 'wet', label: 'Nat' },
            { value: 'dirty', label: 'Vies' },
            { value: 'both', label: 'Nat en vies' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="diaperType"
                value={option.value}
                checked={diaperType === option.value}
                onChange={(e) => setDiaperType(e.target.value as 'wet' | 'dirty' | 'both')}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
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

function JaundiceForm({ onSubmit, onCancel }: FormProps) {
  const [jaundiceLevel, setJaundiceLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'jaundice',
      jaundiceLevel,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Geelzien beoordelen</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Niveau (1 = licht, 5 = ernstig)
        </label>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <label key={level} className="flex items-center">
              <input
                type="radio"
                name="jaundiceLevel"
                value={level}
                checked={jaundiceLevel === level}
                onChange={(e) => setJaundiceLevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="mr-1"
              />
              {level}
            </label>
          ))}
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
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'note',
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Notitie toevoegen</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notitie
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={4}
          required
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

interface RecordItemProps {
  record: BabyRecord;
}

function RecordItem({ record }: RecordItemProps) {
  const getRecordDisplay = () => {
    const time = new Date(record.timestamp).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const date = new Date(record.timestamp).toLocaleDateString('nl-NL');

    switch (record.type) {
      case 'sleep':
        return { icon: '😴', text: `Slaap: ${record.duration} min`, time, date };
      case 'feeding':
        return { icon: '🍼', text: `Voeding: ${record.amount} ml`, time, date };
      case 'temperature':
        return { icon: '🌡️', text: `Temperatuur: ${record.value}°C`, time, date };
      case 'diaper':
        return { icon: '👶', text: `Luier: ${record.diaperType}`, time, date };
      case 'jaundice':
        return { icon: '🟡', text: `Geelzien: niveau ${record.jaundiceLevel}`, time, date };
      case 'note':
        return { icon: '📝', text: 'Notitie', time, date };
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