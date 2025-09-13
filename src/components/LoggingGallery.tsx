'use client';

import { useState } from 'react';
import { getBabyLoggingTypes, getMotherLoggingTypes, LoggingTypeConfig, LoggingField } from '@/config/loggingTypes';
import { BabyRecord, MotherRecord } from '@/types';
import { formatTime24 } from '@/lib/dateUtils';

interface LoggingGalleryProps {
  onAddBabyRecord: (record: Omit<BabyRecord, 'id'>) => void;
  onAddMotherRecord: (record: Omit<MotherRecord, 'id'>) => void;
  onSuccess?: (message: string) => void;
}

export default function LoggingGallery({ onAddBabyRecord, onAddMotherRecord, onSuccess }: LoggingGalleryProps) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [customDateTime, setCustomDateTime] = useState({
    date: new Date().toISOString().split('T')[0],
    time: formatTime24(new Date()),
  });

  const babyTypes = getBabyLoggingTypes();
  const motherTypes = getMotherLoggingTypes();

  const handleTypeSelect = (typeConfig: LoggingTypeConfig) => {
    setActiveForm(typeConfig.id);
    setFormData({});
    setCustomDateTime({
      date: new Date().toISOString().split('T')[0],
      time: formatTime24(new Date()),
    });
  };

  const handleFieldChange = (fieldId: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (typeConfig: LoggingTypeConfig) => {
    // Validate required fields
    const missingFields = typeConfig.fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Vul de volgende verplichte velden in: ${missingFields.join(', ')}`);
      return;
    }

    const timestamp = new Date(`${customDateTime.date}T${customDateTime.time}:00`).toISOString();

    if (typeConfig.category === 'baby') {
      const record: Omit<BabyRecord, 'id'> = {
        timestamp,
        type: typeConfig.id as BabyRecord['type'],
        ...formData,
      };
      onAddBabyRecord(record);
      onSuccess?.(`${typeConfig.label} succesvol geregistreerd!`);
    } else {
      // Handle mother record types - now using direct mapping
      const record: Omit<MotherRecord, 'id'> = {
        timestamp,
        type: typeConfig.id as MotherRecord['type'],
        ...formData,
      };

      // Handle blood pressure specially
      if (typeConfig.id === 'blood_pressure' && formData.systolic && formData.diastolic) {
        record.bloodPressure = {
          systolic: Number(formData.systolic),
          diastolic: Number(formData.diastolic),
        };
      }

      onAddMotherRecord(record);
      onSuccess?.(`${typeConfig.label} succesvol geregistreerd!`);
    }

    setActiveForm(null);
    setFormData({});
  };

  const renderField = (field: LoggingField) => {
    const value = formData[field.id];

    switch (field.type) {
      case 'text':
        return (
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {field.unit && (
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'duration':
        const durationValue = typeof value === 'number' ? value : 0;
        return (
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={Math.floor(durationValue / 60)}
                onChange={(e) => {
                  const hours = Number(e.target.value) || 0;
                  const currentMinutes = durationValue % 60;
                  handleFieldChange(field.id, hours * 60 + currentMinutes);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                min="0"
                max="24"
              />
              <span className="text-xs text-gray-500 mt-1 block">uren</span>
            </div>
            <div className="flex-1">
              <input
                type="number"
                value={durationValue % 60}
                onChange={(e) => {
                  const minutes = Number(e.target.value) || 0;
                  const currentHours = Math.floor(durationValue / 60);
                  handleFieldChange(field.id, currentHours * 60 + minutes);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                min="0"
                max="59"
              />
              <span className="text-xs text-gray-500 mt-1 block">minuten</span>
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (activeForm) {
    const typeConfig = [...babyTypes, ...motherTypes].find(t => t.id === activeForm);
    if (!typeConfig) return null;

    return (
      <div className="p-4 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{typeConfig.icon}</span>
              {typeConfig.label}
            </h2>
            <button
              onClick={() => setActiveForm(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Date and time selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Datum en tijd</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Datum</label>
                  <input
                    type="date"
                    value={customDateTime.date}
                    onChange={(e) => setCustomDateTime(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tijd</label>
                  <input
                    type="text"
                    value={customDateTime.time}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow partial input while typing, but validate format
                      if (value === '' || /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/.test(value)) {
                        setCustomDateTime(prev => ({ ...prev, time: value }));
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      // Format to HH:MM on blur if valid
                      if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                        const [hours, minutes] = value.split(':');
                        const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                        setCustomDateTime(prev => ({ ...prev, time: formattedTime }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="HH:MM"
                    pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                    title="Gebruik 24-uurs notatie (HH:MM)"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {typeConfig.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleSubmit(typeConfig)}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base min-h-[3.5rem] touch-manipulation"
              >
                Opslaan
              </button>
              <button
                onClick={() => setActiveForm(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-base min-h-[3.5rem] touch-manipulation"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Logging</h1>
        
        {/* Baby section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">👶</span>
            Baby
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {babyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md hover:border-indigo-300 transition-all duration-200 min-h-[6rem] active:scale-95 active:bg-indigo-50 touch-manipulation"
              >
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mother section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">👩</span>
            Moeder
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {motherTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md hover:border-indigo-300 transition-all duration-200 min-h-[6rem] active:scale-95 active:bg-indigo-50 touch-manipulation"
              >
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}