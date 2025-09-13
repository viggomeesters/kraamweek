// Reusable form field components for consistent UI and behavior
// Eliminates code duplication across logging forms

'use client';

import { LoggingField } from '@/config/loggingTypes';

interface FormFieldProps {
  field: LoggingField;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

export function FormField({ field, value, onChange }: FormFieldProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
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
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
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
                  onChange={(e) => onChange(e.target.value)}
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
                  onChange(hours * 60 + currentMinutes);
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
                  onChange(currentHours * 60 + minutes);
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

      case 'select':
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecteer...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">{field.placeholder}</span>
          </label>
        );

      case 'time':
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => {
              const timeValue = e.target.value;
              // Allow partial input while typing, but validate format
              if (timeValue === '' || /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/.test(timeValue)) {
                onChange(timeValue);
              }
            }}
            onBlur={(e) => {
              const timeValue = e.target.value;
              // Format to HH:MM on blur if valid
              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
                const [hours, minutes] = timeValue.split(':');
                const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                onChange(formattedTime);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={field.placeholder || "HH:MM"}
            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            title="Gebruik 24-uurs notatie (HH:MM)"
            maxLength={5}
          />
        );

      default:
        return (
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
}

interface DateTimeFieldsProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimeFields({ date, time, onDateChange, onTimeChange }: DateTimeFieldsProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3">Datum en tijd</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tijd</label>
          <input
            type="text"
            value={time}
            onChange={(e) => {
              const value = e.target.value;
              // Allow partial input while typing, but validate format
              if (value === '' || /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/.test(value)) {
                onTimeChange(value);
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              // Format to HH:MM on blur if valid
              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                const [hours, minutes] = value.split(':');
                const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                onTimeChange(formattedTime);
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
  );
}