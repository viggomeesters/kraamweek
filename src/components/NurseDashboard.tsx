'use client';

import { useState } from 'react';
import { AppData, Alert, BabyRecord, MotherRecord, FamilyObservation, Task, BabyProfile } from '@/types';
import { DataService } from '@/lib/dataService';
import { AnalyticsSection } from './Analytics';

import { formatTime24, formatDateDDMMYYYY, formatDateTime24, formatDateLong } from '@/lib/dateUtils';
import BottomNavigation from './BottomNavigation';
import MobileOverview from './MobileOverview';

export default function NurseDashboard() {
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [activeTab, setActiveTab] = useState<'recent' | 'overview' | 'analytics' | 'profile'>('recent');

  const refreshData = () => {
    setData(DataService.loadData());
  };

  // Get unacknowledged alerts
  const unacknowledgedAlerts = data.alerts.filter(alert => !alert.acknowledged);

  // Get recent records for display - sort by entry order (most recently entered first)
  const recentRecords = data.babyRecords
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order) 
    .slice(0, 10); // Take first 10 (most recently entered)

  return (
    <>
      <div className="space-y-4">
        {/* Alerts Section */}
        {unacknowledgedAlerts.length > 0 && (
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
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>Nog geen registraties</p>
                  <p className="text-sm mt-1">Wacht op nieuwe registraties van ouders</p>
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
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Baby Overzicht</h2>
            <BabyOverview records={data.babyRecords} />
          </div>
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
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as 'recent' | 'overview' | 'analytics' | 'profile')}
        userRole="kraamhulp"
      />
    </>
  );
}

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (comment?: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState('');

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'warning': return 'text-yellow-800 bg-yellow-100';
      case 'info': return 'text-blue-800 bg-blue-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const handleAcknowledge = () => {
    onAcknowledge(comment.trim() || undefined);
    setShowCommentDialog(false);
    setComment('');
  };

  if (showCommentDialog) {
    return (
      <div className={`p-4 rounded-md ${getAlertColor()}`}>
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getAlertIcon()}</span>
            <span className="font-medium">{alert.message}</span>
          </div>
          <div className="text-sm opacity-75">
            {formatDateTime24(alert.timestamp)}
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Opmerking bij afhandeling (optioneel):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              rows={2}
              placeholder="Bijv: Huisarts gebeld, temperatuur wordt gemonitord..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAcknowledge}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Afhandelen
            </button>
            <button
              onClick={() => setShowCommentDialog(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Annuleren
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-md ${getAlertColor()} flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getAlertIcon()}</span>
        <span className="font-medium">{alert.message}</span>
        <span className="text-xs opacity-75">
          {formatDateTime24(alert.timestamp)}
        </span>
      </div>
      <button
        onClick={() => setShowCommentDialog(true)}
        className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
      >
        Afhandelen
      </button>
    </div>
  );
}

interface BabyOverviewProps {
  records: BabyRecord[];
}

function BabyOverview({ records }: BabyOverviewProps) {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showJaundiceForm, setShowJaundiceForm] = useState(false);
  
  const recentRecords = records
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order)
    .slice(0, 20); // Take first 20 (most recently entered)

  const refreshData = () => {
    // This should trigger a refresh of the data - we'll need to pass this from parent
    window.location.reload();
  };

  const handleAddRecord = (record: Omit<BabyRecord, 'id'>) => {
    DataService.addBabyRecord(record);
    refreshData();
  };

  const getStats = () => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(r => new Date(r.timestamp).toDateString() === today);
    
    const sleepToday = todayRecords
      .filter(r => r.type === 'sleep')
      .reduce((total, r) => total + (r.duration || 0), 0);
    
    const feedingsToday = todayRecords.filter(r => r.type === 'feeding' || r.type === 'pumping').length;
    
    const lastTemperature = records
      .filter(r => r.type === 'temperature')
      .slice(-1)[0];
    
    const lastWeight = records
      .filter(r => r.type === 'weight')
      .slice(-1)[0];
    
    const lastJaundice = records
      .filter(r => r.type === 'jaundice')
      .slice(-1)[0];

    return { sleepToday, feedingsToday, lastTemperature, lastWeight, lastJaundice };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Action Buttons for Kraamhulp */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowWeightForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
        >
          <span className="mr-2">⚖️</span>
          Baby wegen
        </button>
        <button
          onClick={() => setShowJaundiceForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center"
        >
          <span className="mr-2">🟡</span>
          Geelzien beoordelen
        </button>
      </div>

      {/* Weight Form */}
      {showWeightForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <BabyWeightForm 
            onSubmit={(record) => {
              handleAddRecord(record);
              setShowWeightForm(false);
            }}
            onCancel={() => setShowWeightForm(false)}
          />
        </div>
      )}

      {/* Jaundice Form */}
      {showJaundiceForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <JaundiceAssessmentForm 
            onSubmit={(record) => {
              handleAddRecord(record);
              setShowJaundiceForm(false);
            }}
            onCancel={() => setShowJaundiceForm(false)}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">😴</div>
          <div className="text-2xl font-bold text-gray-900">{Math.floor(stats.sleepToday / 60)}h {stats.sleepToday % 60}m</div>
          <div className="text-sm text-gray-600">Slaap vandaag</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">🍼</div>
          <div className="text-2xl font-bold text-gray-900">{stats.feedingsToday}</div>
          <div className="text-sm text-gray-600">Voedingen vandaag</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">🌡️</div>
          <div className={`text-2xl font-bold ${
            stats.lastTemperature ? 
              (stats.lastTemperature.value as number) >= 38.0 ? 'text-red-600' :
              (stats.lastTemperature.value as number) >= 37.6 ? 'text-orange-600' :
              (stats.lastTemperature.value as number) <= 35.5 ? 'text-blue-600' : 
              'text-gray-900'
            : 'text-gray-900'
          }`}>
            {stats.lastTemperature ? `${stats.lastTemperature.value}°C` : '-'}
            {stats.lastTemperature && (stats.lastTemperature.value as number) >= 38.5 && <span className="text-red-500 ml-1">🔥</span>}
            {stats.lastTemperature && (stats.lastTemperature.value as number) <= 35.0 && <span className="text-blue-500 ml-1">❄️</span>}
          </div>
          <div className="text-sm text-gray-600">
            Laatste temperatuur
            {stats.lastTemperature && (stats.lastTemperature.value as number) >= 38.5 && 
              <div className="text-red-600 font-medium mt-1">⚠️ Extreem hoog</div>}
            {stats.lastTemperature && (stats.lastTemperature.value as number) <= 35.0 && 
              <div className="text-blue-600 font-medium mt-1">⚠️ Extreem laag</div>}
            {stats.lastTemperature && (stats.lastTemperature.value as number) >= 37.6 && (stats.lastTemperature.value as number) < 38.5 && 
              <div className="text-orange-600 font-medium mt-1">Verhoogd</div>}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">⚖️</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.lastWeight ? `${stats.lastWeight.weight}g` : '-'}
          </div>
          <div className="text-sm text-gray-600">Laatste gewicht</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">🟡</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.lastJaundice ? `Niveau ${stats.lastJaundice.jaundiceLevel}` : '-'}
          </div>
          <div className="text-sm text-gray-600">Laatste geelzien</div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recente registraties</h3>
        </div>
        {recentRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nog geen registraties
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentRecords.map((record) => (
              <div key={record.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {record.type === 'sleep' && '😴'}
                      {record.type === 'feeding' && (record.feedingType === 'bottle' ? '🍼' : '🤱')}
                      {record.type === 'pumping' && '🥛'}
                      {record.type === 'temperature' && '🌡️'}
                      {record.type === 'diaper' && '👶'}
                      {record.type === 'jaundice' && '🟡'}
                      {record.type === 'weight' && '⚖️'}
                      {record.type === 'note' && (
                        record.noteCategory === 'question' ? '❓' : 
                        record.noteCategory === 'todo' ? '✅' : '📝'
                      )}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.type === 'sleep' && `Slaap: ${record.duration} min`}
                        {record.type === 'feeding' && (
                          record.feedingType === 'bottle' 
                            ? `Voeding: ${record.amount} ml (fles)`
                            : record.feedingType === 'breast_left' ? 'Voeding: linker borst'
                            : record.feedingType === 'breast_right' ? 'Voeding: rechter borst'
                            : record.feedingType === 'breast_both' ? 'Voeding: beide borsten'
                            : 'Voeding'
                        )}
                        {record.type === 'pumping' && (
                          `Kolven: ${record.amount} ml (${
                            record.breastSide === 'both' ? 'beide borsten' : 
                            record.breastSide === 'left' ? 'linker borst' : 'rechter borst'
                          })`
                        )}
                        {record.type === 'temperature' && (
                          <>
                            <span className={
                              (record.value as number) >= 38.0 ? 'text-red-600 font-bold' :
                              (record.value as number) >= 37.6 ? 'text-orange-600 font-bold' :
                              (record.value as number) <= 35.5 ? 'text-blue-600 font-bold' : 
                              ''
                            }>
                              Temperatuur: {record.value}°C
                            </span>
                            {(record.value as number) >= 38.5 && <span className="text-red-500 ml-1">🔥</span>}
                            {(record.value as number) <= 35.0 && <span className="text-blue-500 ml-1">❄️</span>}
                          </>
                        )}
                        {record.type === 'weight' && `Gewicht: ${record.weight}g`}
                        {record.type === 'diaper' && (
                          `Luier: ${record.diaperType}${record.diaperAmount ? ` (${record.diaperAmount})` : ''}`
                        )}
                        {record.type === 'jaundice' && `Geelzien: niveau ${record.jaundiceLevel}`}
                        {record.type === 'note' && (
                          record.noteCategory === 'question' ? 'Vraag van ouders' :
                          record.noteCategory === 'todo' ? 'Verzoek van ouders' : 'Notitie'
                        )}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-600 mt-1">{record.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{formatTime24(record.timestamp)}</div>
                    <div>{formatDateDDMMYYYY(record.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MotherSectionProps {
  records: MotherRecord[];
  onRefresh: () => void;
}

function MotherSection({ records, onRefresh }: MotherSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAddRecord = (record: Omit<MotherRecord, 'id'>) => {
    DataService.addMotherRecord(record);
    onRefresh();
    setShowForm(false);
  };

  const recentRecords = records
    .sort((a, b) => parseInt(b.id) - parseInt(a.id)) // Sort by ID (entry order)
    .slice(0, 10); // Take first 10 (most recently entered)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Moeder gegevens</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showForm ? 'Annuleren' : 'Nieuwe registratie'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <MotherRecordForm onSubmit={handleAddRecord} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Recente registraties</h4>
        </div>
        {recentRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nog geen registraties voor de moeder
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentRecords.map((record) => (
              <div key={record.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👩</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {record.type === 'temperature' && `Temperatuur: ${record.value}°C`}
                        {record.type === 'blood_pressure' && `Bloeddruk: ${record.bloodPressure?.systolic}/${record.bloodPressure?.diastolic}`}
                        {record.type === 'pain' && `Pijn: niveau ${record.painLevel}/10`}
                        {record.type === 'mood' && `Stemming: ${record.mood}`}
                        {record.type === 'note' && 'Notitie'}
                        {record.type === 'feeding_session' && 'Voedingssessie'}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-600 mt-1">{record.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{formatTime24(record.timestamp)}</div>
                    <div>{formatDateDDMMYYYY(record.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MotherRecordFormProps {
  onSubmit: (record: Omit<MotherRecord, 'id'>) => void;
  onCancel: () => void;
}

function MotherRecordForm({ onSubmit, onCancel }: MotherRecordFormProps) {
  const [type, setType] = useState<MotherRecord['type']>('temperature');
  const [value, setValue] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [painLevel, setPainLevel] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [mood, setMood] = useState<MotherRecord['mood']>('good');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseRecord = {
      timestamp: new Date().toISOString(),
      type,
      notes: notes.trim() || undefined,
    };

    if (type === 'temperature') {
      onSubmit({ ...baseRecord, value: parseFloat(value) });
    } else if (type === 'blood_pressure') {
      onSubmit({ 
        ...baseRecord, 
        bloodPressure: { 
          systolic: parseInt(systolic), 
          diastolic: parseInt(diastolic) 
        } 
      });
    } else if (type === 'pain') {
      onSubmit({ ...baseRecord, painLevel });
    } else if (type === 'mood') {
      onSubmit({ ...baseRecord, mood });
    } else {
      onSubmit(baseRecord);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-medium">Moeder registratie</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type registratie
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MotherRecord['type'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="temperature">Temperatuur</option>
          <option value="blood_pressure">Bloeddruk</option>
          <option value="pain">Pijn</option>
          <option value="mood">Stemming</option>
          <option value="feeding_session">Voedingssessie</option>
          <option value="note">Notitie</option>
        </select>
      </div>

      {type === 'temperature' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatuur (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      )}

      {type === 'blood_pressure' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Systolisch
            </label>
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diastolisch
            </label>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      )}

      {type === 'pain' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pijnlevel (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10)}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600 mt-1">{painLevel}/10</div>
        </div>
      )}

      {type === 'mood' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stemming
          </label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as MotherRecord['mood'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="excellent">Uitstekend</option>
            <option value="good">Goed</option>
            <option value="okay">Oké</option>
            <option value="low">Laag</option>
            <option value="very_low">Zeer laag</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notities (optioneel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

interface ObservationsSectionProps {
  observations: FamilyObservation[];
  onRefresh: () => void;
}

function ObservationsSection({ observations, onRefresh }: ObservationsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAddObservation = (observation: Omit<FamilyObservation, 'id'>) => {
    DataService.addFamilyObservation(observation);
    onRefresh();
    setShowForm(false);
  };

  const recentObservations = observations
    .slice(-10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Familie observaties</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showForm ? 'Annuleren' : 'Nieuwe observatie'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <ObservationForm onSubmit={handleAddObservation} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Recente observaties</h4>
        </div>
        {recentObservations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nog geen observaties geregistreerd
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentObservations.map((observation) => (
              <div key={observation.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {observation.category}
                      </span>
                      <span className="text-sm text-gray-600">door {observation.observer}</span>
                    </div>
                    <p className="text-gray-900 mb-2">{observation.observation}</p>
                    {observation.concerns && observation.concerns.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-yellow-800">Zorgen:</span>
                        <ul className="list-disc list-inside text-sm text-yellow-700">
                          {observation.concerns.map((concern, index) => (
                            <li key={index}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {observation.recommendations && observation.recommendations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-green-800">Aanbevelingen:</span>
                        <ul className="list-disc list-inside text-sm text-green-700">
                          {observation.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{formatTime24(observation.timestamp)}</div>
                    <div>{formatDateDDMMYYYY(observation.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ObservationFormProps {
  onSubmit: (observation: Omit<FamilyObservation, 'id'>) => void;
  onCancel: () => void;
}

function ObservationForm({ onSubmit, onCancel }: ObservationFormProps) {
  const [observer, setObserver] = useState('');
  const [category, setCategory] = useState<FamilyObservation['category']>('general');
  const [observation, setObservation] = useState('');
  const [concerns, setConcerns] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const concernsList = concerns.trim() 
      ? concerns.split('\n').filter(c => c.trim()).map(c => c.trim())
      : undefined;
    
    const recommendationsList = recommendations.trim()
      ? recommendations.split('\n').filter(r => r.trim()).map(r => r.trim())
      : undefined;

    onSubmit({
      timestamp: new Date().toISOString(),
      observer: observer.trim(),
      category,
      observation: observation.trim(),
      concerns: concernsList,
      recommendations: recommendationsList,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-medium">Nieuwe observatie</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observator
          </label>
          <input
            type="text"
            value={observer}
            onChange={(e) => setObserver(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FamilyObservation['category'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="general">Algemeen</option>
            <option value="bonding">Hechting</option>
            <option value="environment">Omgeving</option>
            <option value="support">Ondersteuning</option>
            <option value="health">Gezondheid</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observatie
        </label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zorgen/Aandachtspunten (één per regel, optioneel)
        </label>
        <textarea
          value={concerns}
          onChange={(e) => setConcerns(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aanbevelingen (één per regel, optioneel)
        </label>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

interface TasksSectionProps {
  tasks: Task[];
  onRefresh: () => void;
}

function TasksSection({ tasks, onRefresh }: TasksSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    DataService.addTask(task);
    onRefresh();
    setShowForm(false);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    DataService.updateTask(id, updates);
    onRefresh();
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed').slice(-5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Taken beheer</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showForm ? 'Annuleren' : 'Nieuwe taak'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Te doen ({pendingTasks.length})</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} />
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">Geen openstaande taken</p>
            )}
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Bezig ({inProgressTasks.length})</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {inProgressTasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} />
            ))}
            {inProgressTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">Geen taken in uitvoering</p>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Voltooid (recent)</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} />
            ))}
            {completedTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nog geen voltooide taken</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

function TaskItem({ task, onUpdate }: TaskItemProps) {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h5 className="font-medium text-gray-900">{task.title}</h5>
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor()}`}>
            {task.priority}
          </span>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Door: {task.createdBy}</span>
          {task.assignedTo && <span>Voor: {task.assignedTo}</span>}
        </div>
        
        {task.suggestedBy && (
          <p className="text-xs text-blue-600">💡 Suggestie van {task.suggestedBy}</p>
        )}
        
        {task.status !== 'completed' && (
          <div className="flex space-x-2">
            {task.status === 'pending' && (
              <button
                onClick={() => onUpdate(task.id, { status: 'in_progress' })}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                Start
              </button>
            )}
            <button
              onClick={() => onUpdate(task.id, { status: 'completed' })}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            >
              Voltooid
            </button>
          </div>
        )}
        
        {task.completedAt && (
          <p className="text-xs text-green-600">
            ✅ Voltooid op {formatDateDDMMYYYY(task.completedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('household');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState<Task['assignedTo']>('parents');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status: 'pending',
      assignedTo,
      createdBy: 'kraamhulp',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-lg font-medium">Nieuwe taak</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Beschrijving (optioneel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Task['category'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="household">Huishoudelijk</option>
            <option value="baby_care">Baby verzorging</option>
            <option value="mother_care">Moeder verzorging</option>
            <option value="administrative">Administratief</option>
            <option value="other">Anders</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioriteit
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Laag</option>
            <option value="medium">Gemiddeld</option>
            <option value="high">Hoog</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Toegewezen aan
          </label>
          <select
            value={assignedTo || ''}
            onChange={(e) => setAssignedTo(e.target.value as Task['assignedTo'] || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Niet toegewezen</option>
            <option value="parents">Ouders</option>
            <option value="kraamhulp">Kraamhulp</option>
            <option value="family">Familie</option>
            <option value="other">Anders</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Taak aanmaken
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
interface BabyWeightFormProps {
  onSubmit: (record: Omit<BabyRecord, 'id'>) => void;
  onCancel: () => void;
}

function BabyWeightForm({ onSubmit, onCancel }: BabyWeightFormProps) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      timestamp: new Date().toISOString(),
      type: 'weight',
      weight: parseInt(weight),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Baby wegen</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gewicht (gram)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          min="1000"
          max="8000"
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
          placeholder="Bijzonderheden bij de weging..."
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

interface JaundiceAssessmentFormProps {
  onSubmit: (record: Omit<BabyRecord, 'id'>) => void;
  onCancel: () => void;
}

function JaundiceAssessmentForm({ onSubmit, onCancel }: JaundiceAssessmentFormProps) {
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

  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1: return 'Zeer licht - nauwelijks zichtbaar';
      case 2: return 'Licht - zichtbaar in gezicht';
      case 3: return 'Matig - zichtbaar tot aan borst';
      case 4: return 'Ernstig - zichtbaar tot aan buik';
      case 5: return 'Zeer ernstig - zichtbaar in hele lichaam';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Geelzien beoordelen</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Niveau geelzien (1 = licht, 5 = ernstig)
        </label>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <label key={level} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="jaundiceLevel"
                value={level}
                checked={jaundiceLevel === level}
                onChange={(e) => setJaundiceLevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">Niveau {level}</div>
                <div className="text-sm text-gray-600">{getLevelDescription(level)}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaties en notities
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          rows={4}
          placeholder="Beschrijf de geelzien en eventuele andere observaties..."
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-600">⚠️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Belangrijk</h4>
            <div className="text-sm text-yellow-700">
              <p>• Bij niveau 4-5: direct contact opnemen met arts</p>
              <p>• Let op: voeding weigeren, slaperigheid, koorts</p>
              <p>• Documenteer nauwkeurig voor follow-up</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
            jaundiceLevel >= 4 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
          }`}
        >
          Beoordeling opslaan
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

// Alert History Components
interface AlertHistorySectionProps {
  alerts: Alert[];
}

function AlertHistorySection({ alerts }: AlertHistorySectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'critical' | 'info'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'baby' | 'mother' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter acknowledged alerts only
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  // Apply filters
  const filteredAlerts = acknowledgedAlerts.filter(alert => {
    const matchesSearch = !searchTerm || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.resolutionComment && alert.resolutionComment.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort alerts
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.acknowledgedAt || '').getTime() - new Date(b.acknowledgedAt || '').getTime();
        break;
      case 'type':
        const typeOrder = { 'critical': 3, 'warning': 2, 'info': 1 };
        comparison = typeOrder[a.type] - typeOrder[b.type];
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Statistics
  const stats = {
    total: acknowledgedAlerts.length,
    critical: acknowledgedAlerts.filter(a => a.type === 'critical').length,
    warning: acknowledgedAlerts.filter(a => a.type === 'warning').length,
    info: acknowledgedAlerts.filter(a => a.type === 'info').length,
    baby: acknowledgedAlerts.filter(a => a.category === 'baby').length,
    mother: acknowledgedAlerts.filter(a => a.category === 'mother').length,
    general: acknowledgedAlerts.filter(a => a.category === 'general').length,
  };

  // Get alerts from last 7 days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentAlerts = acknowledgedAlerts.filter(a => 
    new Date(a.acknowledgedAt || '') >= last7Days
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Waarschuwingen Geschiedenis</h3>
        <div className="text-sm text-gray-500">
          Totaal {stats.total} afgehandelde waarschuwingen
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Totaal afgehandeld</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">🚨</div>
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-gray-600">Kritieke waarschuwingen</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
          <div className="text-sm text-gray-600">Waarschuwingen</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-2xl font-bold text-blue-600">{recentAlerts.length}</div>
          <div className="text-sm text-gray-600">Laatste 7 dagen</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">👶</span>
            <span className="font-medium text-gray-900">Baby gerelateerd</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.baby}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">👩</span>
            <span className="font-medium text-gray-900">Moeder gerelateerd</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.mother}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">📋</span>
            <span className="font-medium text-gray-900">Algemeen</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{stats.general}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Filters en Zoeken</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoeken
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek in berichten..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'warning' | 'critical' | 'info')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Alle types</option>
              <option value="critical">Kritiek</option>
              <option value="warning">Waarschuwing</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | 'baby' | 'mother' | 'general')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Alle categorieën</option>
              <option value="baby">Baby</option>
              <option value="mother">Moeder</option>
              <option value="general">Algemeen</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sorteer op
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date">Datum</option>
              <option value="type">Type</option>
              <option value="category">Categorie</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volgorde
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Nieuwste eerst</option>
              <option value="asc">Oudste eerst</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert History List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">
            Alle afgehandelde waarschuwingen ({sortedAlerts.length})
          </h4>
        </div>
        
        {sortedAlerts.length === 0 ? (
          <div className="p-8 text-center">
            {acknowledgedAlerts.length === 0 ? (
              <div>
                <div className="text-6xl mb-4">✅</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Geen afgehandelde waarschuwingen</h4>
                <p className="text-gray-600">Er zijn nog geen waarschuwingen afgehandeld.</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🔍</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Geen resultaten gevonden</h4>
                <p className="text-gray-600">Probeer je zoekopdracht of filters aan te passen.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedAlerts.map((alert) => (
              <AlertHistoryItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AlertHistoryItemProps {
  alert: Alert;
}

function AlertHistoryItem({ alert }: AlertHistoryItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = () => {
    switch (alert.category) {
      case 'baby': return '👶';
      case 'mother': return '👩';
      case 'general': return '📋';
      default: return '📝';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Minder dan een uur geleden';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} uur geleden`;
    } else {
      return `${Math.floor(diffInHours / 24)} dagen geleden`;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getAlertColor()}`}>
            <span className="text-lg">{getAlertIcon()}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {getCategoryIcon()} {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.type === 'critical' ? 'Kritiek' : 
                   alert.type === 'warning' ? 'Waarschuwing' : 'Info'}
                </span>
              </div>
              
              <p className="text-sm text-gray-900 mb-2">{alert.message}</p>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  Ontstaan: {formatDateTime24(alert.timestamp)}
                </div>
                <div>
                  Afgehandeld: {formatDateTime24(alert.acknowledgedAt || "")} door {alert.acknowledgedBy}
                </div>
                <div>
                  {formatTimeAgo(alert.acknowledgedAt || '')}
                </div>
              </div>
              
              {alert.resolutionComment && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-xs font-medium text-green-800 mb-1">Opmerking bij afhandeling:</div>
                  <div className="text-sm text-green-700">{alert.resolutionComment}</div>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 ml-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
              >
                {showDetails ? 'Minder details' : 'Meer details'}
              </button>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Technische details</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Alert ID:</strong> {alert.id}</div>
                {alert.relatedRecordId && (
                  <div><strong>Gerelateerde record ID:</strong> {alert.relatedRecordId}</div>
                )}
                <div><strong>Timestamp ontstaan:</strong> {alert.timestamp}</div>
                <div><strong>Timestamp afhandeling:</strong> {alert.acknowledgedAt}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Baby Profile Components added for requirement #8
// ... (components will be added via editor)

function BabyProfileSection({ onRefresh }: { onRefresh: () => void }) {
  const [profile, setProfile] = useState<BabyProfile | null>(DataService.getBabyProfile());
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const refreshProfile = () => {
    setProfile(DataService.getBabyProfile());
    onRefresh();
  };

  const handleSaveProfile = (profileData: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    DataService.saveBabyProfile(profileData);
    refreshProfile();
    setShowForm(false);
  };

  const handleDeleteProfile = () => {
    DataService.deleteBabyProfile();
    refreshProfile();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Baby Profiel</h3>
        <div className="flex space-x-3">
          {profile && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              Verwijderen
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {profile ? (showForm ? 'Annuleren' : 'Bewerken') : 'Profiel aanmaken'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-red-600 text-xl mr-2">⚠️</span>
            <h4 className="text-lg font-medium text-red-800">Profiel verwijderen</h4>
          </div>
          <p className="text-red-700 mb-4">
            Weet je zeker dat je het baby profiel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteProfile}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Ja, verwijderen
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

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
          <BabyProfileDisplay profile={profile} />
        </div>
      )}

      {!showForm && !profile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👶</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nog geen baby profiel</h4>
            <p className="text-gray-600 mb-4">
              Maak een profiel aan om belangrijke informatie over de baby vast te leggen.
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
  const [hoofdomvang, setHoofdotmvang] = useState(profile?.hoofdomvang?.toString() || '');
  const [goedeStartScore, setGoedeStartScore] = useState(profile?.goedeStartScore?.toString() || '');
  const [zwangerschapsduur, setZwangerschapsduur] = useState(profile?.zwangerschapsduur?.toString() || '');
  const [moederNaam, setMoederNaam] = useState(profile?.moederNaam || '');
  const [partnerNaam, setPartnerNaam] = useState(profile?.partnerNaam || '');
  const [huisarts, setHuisarts] = useState(profile?.huisarts || '');
  const [verloskundige, setVerloskundige] = useState(profile?.verloskundige || '');
  const [ziekenhuis, setZiekenhuis] = useState(profile?.ziekenhuis || '');
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
      hoofdomvang: hoofdomvang ? parseInt(hoofdomvang) : undefined,
      goedeStartScore: goedeStartScore ? parseInt(goedeStartScore) : undefined,
      zwangerschapsduur: zwangerschapsduur ? parseInt(zwangerschapsduur) : undefined,
      moederNaam: moederNaam.trim() || undefined,
      partnerNaam: partnerNaam.trim() || undefined,
      huisarts: huisarts.trim() || undefined,
      verloskundige: verloskundige.trim() || undefined,
      ziekenhuis: ziekenhuis.trim() || undefined,
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

      {/* Birth Information */}
      <div className="border-t border-gray-200 pt-6">
        <h5 className="text-md font-medium text-gray-900 mb-4">Geboorte informatie</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              Zwangerschapsduur (weken)
            </label>
            <input
              type="number"
              value={zwangerschapsduur}
              onChange={(e) => setZwangerschapsduur(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              min="20"
              max="45"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hoofdomvang (cm)
            </label>
            <input
              type="number"
              value={hoofdomvang}
              onChange={(e) => setHoofdotmvang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              min="20"
              max="50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              APGAR score
            </label>
            <input
              type="number"
              value={goedeStartScore}
              onChange={(e) => setGoedeStartScore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              min="0"
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Family and Care Information */}
      <div className="border-t border-gray-200 pt-6">
        <h5 className="text-md font-medium text-gray-900 mb-4">Familie en zorgverlening</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam moeder
            </label>
            <input
              type="text"
              value={moederNaam}
              onChange={(e) => setMoederNaam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam partner
            </label>
            <input
              type="text"
              value={partnerNaam}
              onChange={(e) => setPartnerNaam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          
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
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ziekenhuis/Geboorteplek
            </label>
            <input
              type="text"
              value={ziekenhuis}
              onChange={(e) => setZiekenhuis(e.target.value)}
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
            rows={4}
            placeholder="Medische bijzonderheden, allergieën, medicatie, etc."
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
    <div className="space-y-6">
      {/* Header with baby info */}
      <div className="text-center pb-6 border-b border-gray-200">
        <div className="text-6xl mb-4">
          {profile.geslacht === 'jongen' ? '👶🏻' : profile.geslacht === 'meisje' ? '👶🏻' : '👶'}
        </div>
        <h4 className="text-2xl font-bold text-gray-900">
          {profile.roepnaam || profile.voornaam} {profile.achternaam}
        </h4>
        {profile.roepnaam && profile.roepnaam !== profile.voornaam && (
          <p className="text-gray-600">Volledige naam: {profile.voornaam} {profile.achternaam}</p>
        )}
        <p className="text-lg text-gray-700 mt-2">
          Geboren op {formatDateLong(profile.geboortedatum)}
          {profile.geboortijd && ` om ${profile.geboortijd}`}
        </p>
        <p className="text-indigo-600 font-medium">
          {calculateAge(profile.geboortedatum)} oud
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Geslacht</h5>
          <p className="text-gray-700 capitalize">{profile.geslacht}</p>
        </div>

        {profile.zwangerschapsduur && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Zwangerschapsduur</h5>
            <p className="text-gray-700">{profile.zwangerschapsduur} weken</p>
          </div>
        )}

        {profile.geboortgewicht && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Geboortegewicht</h5>
            <p className="text-gray-700">{profile.geboortgewicht} gram</p>
          </div>
        )}

        {profile.geboortelengte && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Geboortelengte</h5>
            <p className="text-gray-700">{profile.geboortelengte} cm</p>
          </div>
        )}

        {profile.hoofdomvang && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Hoofdomvang</h5>
            <p className="text-gray-700">{profile.hoofdomvang} cm</p>
          </div>
        )}

        {profile.goedeStartScore !== undefined && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">APGAR Score</h5>
            <p className="text-gray-700">{profile.goedeStartScore}/10</p>
          </div>
        )}
      </div>

      {/* Family Information */}
      {(profile.moederNaam || profile.partnerNaam) && (
        <div className="border-t border-gray-200 pt-6">
          <h5 className="text-lg font-medium text-gray-900 mb-4">Familie</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.moederNaam && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-1">Moeder</h6>
                <p className="text-gray-700">{profile.moederNaam}</p>
              </div>
            )}
            {profile.partnerNaam && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-1">Partner</h6>
                <p className="text-gray-700">{profile.partnerNaam}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Care Providers */}
      {(profile.huisarts || profile.verloskundige || profile.ziekenhuis) && (
        <div className="border-t border-gray-200 pt-6">
          <h5 className="text-lg font-medium text-gray-900 mb-4">Zorgverlening</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.huisarts && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-1">Huisarts</h6>
                <p className="text-gray-700">{profile.huisarts}</p>
              </div>
            )}
            {profile.verloskundige && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-1">Verloskundige</h6>
                <p className="text-gray-700">{profile.verloskundige}</p>
              </div>
            )}
            {profile.ziekenhuis && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-medium text-gray-900 mb-1">Geboorteplek</h6>
                <p className="text-gray-700">{profile.ziekenhuis}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {profile.bijzonderheden && (
        <div className="border-t border-gray-200 pt-6">
          <h5 className="text-lg font-medium text-gray-900 mb-4">Bijzonderheden</h5>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bijzonderheden}</p>
          </div>
        </div>
      )}

      {/* Profile metadata */}
      <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
        <p>Profiel aangemaakt: {formatDateLong(profile.createdAt)}</p>
        {profile.updatedAt !== profile.createdAt && (
          <p>Laatst bijgewerkt: {formatDateLong(profile.updatedAt)}</p>
        )}
      </div>
    </div>
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
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 text-sm">{text}</div>
            {record.notes && (
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">{record.notes}</div>
            )}
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 flex-shrink-0 ml-3">
          <div>{time}</div>
          <div>{date}</div>
        </div>
      </div>
    </div>
  );
}

