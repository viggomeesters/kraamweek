'use client';

import { useState } from 'react';
import { AppData, Alert, BabyRecord, MotherRecord, FamilyObservation, Task } from '@/types';
import { DataService } from '@/lib/dataService';

export default function NurseDashboard() {
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [activeTab, setActiveTab] = useState<'overview' | 'mother' | 'observations' | 'tasks'>('overview');

  const refreshData = () => {
    setData(DataService.loadData());
  };

  // Get unacknowledged alerts
  const unacknowledgedAlerts = data.alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
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
                onAcknowledge={() => {
                  DataService.acknowledgeAlert(alert.id, 'Kraamhulp');
                  refreshData();
                }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Baby Overzicht', icon: '👶' },
            { id: 'mother', label: 'Moeder', icon: '👩' },
            { id: 'observations', label: 'Observaties', icon: '📋' },
            { id: 'tasks', label: 'Taken', icon: '✅' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'mother' | 'observations' | 'tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <BabyOverview records={data.babyRecords} />
      )}
      {activeTab === 'mother' && (
        <MotherSection records={data.motherRecords} onRefresh={refreshData} />
      )}
      {activeTab === 'observations' && (
        <ObservationsSection observations={data.familyObservations} onRefresh={refreshData} />
      )}
      {activeTab === 'tasks' && (
        <TasksSection tasks={data.tasks} onRefresh={refreshData} />
      )}
    </div>
  );
}

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: () => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
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

  return (
    <div className={`p-3 rounded-md ${getAlertColor()} flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getAlertIcon()}</span>
        <span className="font-medium">{alert.message}</span>
        <span className="text-xs opacity-75">
          {new Date(alert.timestamp).toLocaleString('nl-NL')}
        </span>
      </div>
      <button
        onClick={onAcknowledge}
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
    .slice(-20)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
          <div className="text-2xl font-bold text-gray-900">
            {stats.lastTemperature ? `${stats.lastTemperature.value}°C` : '-'}
          </div>
          <div className="text-sm text-gray-600">Laatste temperatuur</div>
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
                        {record.type === 'temperature' && `Temperatuur: ${record.value}°C`}
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
                    <div>{new Date(record.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{new Date(record.timestamp).toLocaleDateString('nl-NL')}</div>
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
    .slice(-10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
                    <div>{new Date(record.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{new Date(record.timestamp).toLocaleDateString('nl-NL')}</div>
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
                    <div>{new Date(observation.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{new Date(observation.timestamp).toLocaleDateString('nl-NL')}</div>
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
            ✅ Voltooid op {new Date(task.completedAt).toLocaleDateString('nl-NL')}
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
