'use client';

import { useState } from 'react';
import { AppData, BabyRecord, MotherRecord, Alert, Task } from '@/types';
import { formatDateTime24 } from '@/lib/dateUtils';

interface OverviewProps {
  data: AppData;
}

type FilterType = 'all' | 'baby' | 'mother' | 'alerts' | 'tasks';

interface EventItem {
  id: string;
  timestamp: string;
  type: FilterType;
  icon: string;
  title: string;
  subtitle?: string;
  details: string;
  originalRecord?: BabyRecord | MotherRecord | Alert | Task;
}

export default function Overview({ data }: OverviewProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filters = [
    { id: 'all' as const, label: 'Alles', icon: '📋' },
    { id: 'baby' as const, label: 'Baby', icon: '👶' },
    { id: 'mother' as const, label: 'Moeder', icon: '👩' },
    { id: 'alerts' as const, label: 'Alerts', icon: '⚠️' },
    { id: 'tasks' as const, label: 'Taken', icon: '✅' },
  ];

  // Convert all records to unified event items
  const getAllEvents = (): EventItem[] => {
    const events: EventItem[] = [];

    // Baby records
    data.babyRecords.forEach(record => {
      events.push({
        id: record.id,
        timestamp: record.timestamp,
        type: 'baby',
        icon: getBabyRecordIcon(record.type),
        title: getBabyRecordTitle(record),
        details: getBabyRecordDetails(record),
        originalRecord: record,
      });
    });

    // Mother records
    data.motherRecords.forEach(record => {
      events.push({
        id: record.id,
        timestamp: record.timestamp,
        type: 'mother',
        icon: getMotherRecordIcon(record.type),
        title: getMotherRecordTitle(record),
        details: getMotherRecordDetails(record),
        originalRecord: record,
      });
    });

    // Alerts
    data.alerts.forEach(alert => {
      events.push({
        id: alert.id,
        timestamp: alert.timestamp,
        type: 'alerts',
        icon: '⚠️',
        title: 'Alert',
        subtitle: alert.type,
        details: alert.message,
        originalRecord: alert,
      });
    });

    // Tasks
    data.tasks.forEach(task => {
      events.push({
        id: task.id,
        timestamp: task.createdAt,
        type: 'tasks',
        icon: getTaskIcon(task.status),
        title: task.title,
        subtitle: task.status,
        details: task.description || '',
        originalRecord: task,
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredEvents = getAllEvents().filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  return (
    <div className="p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Overzicht</h1>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span className="text-sm font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500">Nog geen events geregistreerd</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{event.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDateTime24(event.timestamp)}
                      </span>
                    </div>
                    {event.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{event.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-700 mt-2">{event.details}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions for formatting different record types
function getBabyRecordIcon(type: BabyRecord['type']): string {
  const icons = {
    sleep: '😴',
    feeding: '🍼',
    temperature: '🌡️',
    diaper: '👶',
    jaundice: '💛',
    note: '📝',
    pumping: '🤱',
    weight: '⚖️',
  };
  return icons[type] || '📋';
}

function getBabyRecordTitle(record: BabyRecord): string {
  const titles = {
    sleep: 'Slaap',
    feeding: 'Voeding',
    temperature: 'Temperatuur',
    diaper: 'Luier',
    jaundice: 'Geelzucht',
    note: 'Notitie',
    pumping: 'Kolven',
    weight: 'Gewicht',
  };
  return titles[record.type] || 'Onbekend';
}

function getBabyRecordDetails(record: BabyRecord): string {
  switch (record.type) {
    case 'sleep':
      return `${record.duration} minuten${record.notes ? ` - ${record.notes}` : ''}`;
    case 'feeding':
      if (record.feedingType === 'bottle') {
        return `${record.amount} ml (fles)${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_left') {
        return `Linker borst${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_right') {
        return `Rechter borst${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_both') {
        return `Beide borsten${record.notes ? ` - ${record.notes}` : ''}`;
      }
      return record.notes || 'Voeding';
    case 'temperature':
      return `${record.value}°C${record.notes ? ` - ${record.notes}` : ''}`;
    case 'diaper':
      return `${record.diaperType === 'wet' ? 'Nat' : record.diaperType === 'dirty' ? 'Vies' : 'Nat en vies'} (${record.diaperAmount})${record.notes ? ` - ${record.notes}` : ''}`;
    case 'jaundice':
      return `Niveau ${record.jaundiceLevel}${record.notes ? ` - ${record.notes}` : ''}`;
    case 'pumping':
      return `${record.breastSide} borst, ${record.amount} ml${record.notes ? ` - ${record.notes}` : ''}`;
    case 'weight':
      return `${record.weight} gram${record.notes ? ` - ${record.notes}` : ''}`;
    case 'note':
      return record.notes || 'Notitie';
    default:
      return record.notes || 'Geen details';
  }
}

function getMotherRecordIcon(type: MotherRecord['type']): string {
  const icons = {
    temperature: '🌡️',
    blood_pressure: '💗',
    mood: '😊',
    pain: '😣',
    feeding_session: '🤱',
    note: '📝',
  };
  return icons[type] || '👩';
}

function getMotherRecordTitle(record: MotherRecord): string {
  const titles = {
    temperature: 'Temperatuur',
    blood_pressure: 'Bloeddruk',
    mood: 'Stemming',
    pain: 'Pijn',
    feeding_session: 'Voedingssessie',
    note: 'Notitie',
  };
  return titles[record.type] || 'Onbekend';
}

function getMotherRecordDetails(record: MotherRecord): string {
  switch (record.type) {
    case 'temperature':
      return `${record.value}°C${record.notes ? ` - ${record.notes}` : ''}`;
    case 'blood_pressure':
      return `${record.bloodPressure?.systolic}/${record.bloodPressure?.diastolic} mmHg${record.notes ? ` - ${record.notes}` : ''}`;
    case 'mood':
      const moodLabels = {
        excellent: 'Uitstekend',
        good: 'Goed',
        okay: 'Oké',
        low: 'Laag',
        very_low: 'Zeer laag'
      };
      return `${moodLabels[record.mood || 'okay']}${record.notes ? ` - ${record.notes}` : ''}`;
    case 'pain':
      return `Niveau ${record.painLevel}/10${record.notes ? ` - ${record.notes}` : ''}`;
    case 'feeding_session':
      return record.notes || 'Voedingssessie';
    case 'note':
      return record.notes || 'Notitie';
    default:
      return record.notes || 'Geen details';
  }
}

function getTaskIcon(status: Task['status']): string {
  const icons = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
  };
  return icons[status] || '📋';
}