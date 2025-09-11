'use client';

import { useState } from 'react';
import { BabyRecord } from '@/types';

interface MobileOverviewProps {
  records: BabyRecord[];
}

export default function MobileOverview({ records }: MobileOverviewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'Alles', icon: '📋' },
    { id: 'sleep', label: 'Slaap', icon: '😴' },
    { id: 'feeding', label: 'Voeding', icon: '🍼' },
    { id: 'temperature', label: 'Temperatuur', icon: '🌡️' },
    { id: 'diaper', label: 'Luier', icon: '👶' },
    { id: 'note', label: 'Notities', icon: '📝' },
  ];

  // Filter records based on selected filter
  const filteredRecords = selectedFilter === 'all' 
    ? records 
    : records.filter(record => record.type === selectedFilter);

  // Sort by timestamp (newest first)
  const sortedRecords = filteredRecords
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50); // Limit to 50 most recent items for performance

  const getRecordDisplay = (record: BabyRecord) => {
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Overzicht
        </h2>
        
        {/* Filter buttons */}
        <div className="flex overflow-x-auto space-x-2 pb-2 mb-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Record count */}
        <p className="text-sm text-gray-600 mb-3">
          {filteredRecords.length === 0 
            ? 'Geen registraties gevonden'
            : `${filteredRecords.length} registratie${filteredRecords.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Records list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>Nog geen registraties</p>
            {selectedFilter !== 'all' && (
              <p className="text-sm mt-1">Probeer een ander filter</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedRecords.map((record) => {
              const { icon, text, time, date } = getRecordDisplay(record);
              return (
                <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}