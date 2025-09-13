'use client';

import { useState } from 'react';
import { getBabyLoggingTypes, getMotherLoggingTypes, LoggingTypeConfig } from '@/config/loggingTypes';
import { BabyRecord, MotherRecord } from '@/types';
import { formatTime24 } from '@/lib/dateUtils';
import { FormField, DateTimeFields } from '@/components/FormFields';

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

  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    setCustomDateTime(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (typeConfig: LoggingTypeConfig) => {
    // Validate required fields
    const missingFields = validateForm(typeConfig);

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

  // Validation helper
  const validateForm = (typeConfig: LoggingTypeConfig): string[] => {
    return typeConfig.fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);
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
            <DateTimeFields
              date={customDateTime.date}
              time={customDateTime.time}
              onDateChange={(date) => handleDateTimeChange('date', date)}
              onTimeChange={(time) => handleDateTimeChange('time', time)}
            />

            {/* Form fields */}
            <div className="space-y-4">
              {typeConfig.fields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  value={formData[field.id] || ''}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
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