'use client';

import { useState } from 'react';
import { AppData } from '@/types';
import { formatDateTime24 } from '@/lib/dateUtils';
import { FilterType, FILTER_CONFIG, filterEventsByType } from '@/lib/filterUtils';
import { convertDataToEvents } from '@/lib/eventConverters';

interface OverviewProps {
  data: AppData;
}

export default function Overview({ data }: OverviewProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Convert all app data to unified events and apply filtering
  const allEvents = convertDataToEvents(data);
  const filteredEvents = filterEventsByType(allEvents, selectedFilter);

  return (
    <div className="p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Overzicht</h1>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_CONFIG.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap transition-colors min-h-[3rem] touch-manipulation ${
                selectedFilter === filter.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
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