'use client';

import { useState } from 'react';
import { BabyRecord, MotherRecord } from '@/types';
import { DataService } from '@/lib/dataService';

interface AnalyticsSectionProps {
  babyRecords: BabyRecord[];
  motherRecords: MotherRecord[];
}

export function AnalyticsSection({ }: AnalyticsSectionProps) {
  const [startDate, setStartDate] = useState(() => {
    // Default to 7 days ago
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });
  
  const [selectedMetric, setSelectedMetric] = useState<string>('feeding_count');
  
  const metrics = [
    { value: 'feeding_count', label: 'Aantal voedingen per dag' },
    { value: 'weight', label: 'Gewicht over tijd' },
    { value: 'birth_weight', label: 'Gewichtsverloop vanaf geboorte' },
    { value: 'baby_temperature', label: 'Baby temperatuur' },
    { value: 'mother_temperature', label: 'Moeder temperatuur' },
    { value: 'pain_levels', label: 'Pijn niveaus moeder' },
    { value: 'sleep_duration', label: 'Slaapduur per dag' },
  ];
  
  const getChartData = () => {
    switch (selectedMetric) {
      case 'feeding_count':
        return DataService.getDailyFeedingCount(startDate, endDate);
      case 'weight':
        return DataService.getDailyWeights(startDate, endDate);
      case 'birth_weight':
        return DataService.getDailyWeightsWithBirthWeight(startDate, endDate);
      case 'baby_temperature':
        return DataService.getDailyTemperatures(startDate, endDate, 'baby');
      case 'mother_temperature':
        return DataService.getDailyTemperatures(startDate, endDate, 'mother');
      case 'pain_levels':
        return DataService.getDailyPainLevels(startDate, endDate);
      case 'sleep_duration':
        return DataService.getDailySleepDuration(startDate, endDate);
      default:
        return [];
    }
  };
  
  const chartData = getChartData();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">📊 Analytics</h3>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Startdatum
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Einddatum
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metriek
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {metrics.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Chart */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {metrics.find(m => m.value === selectedMetric)?.label}
          </h4>
          {chartData.length > 0 ? (
            <SimpleLineChart data={chartData} metric={selectedMetric} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <p>Geen data beschikbaar voor de geselecteerde periode</p>
              <p className="text-sm mt-2">Voeg eerst wat data toe om de analytics te zien</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SimpleLineChartProps {
  data: Array<{date: string, count?: number, weight?: number, temperature?: number, painLevel?: number, duration?: number}>;
  metric: string;
}

function SimpleLineChart({ data, metric }: SimpleLineChartProps) {
  if (data.length === 0) return null;
  
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Get the value key based on metric
  const getValueKey = (metric: string) => {
    switch (metric) {
      case 'feeding_count': return 'count';
      case 'weight':
      case 'birth_weight': return 'weight';
      case 'baby_temperature':
      case 'mother_temperature': return 'temperature';
      case 'pain_levels': return 'painLevel';
      case 'sleep_duration': return 'duration';
      default: return 'value';
    }
  };
  
  const valueKey = getValueKey(metric);
  
  // Calculate scales
  const values = data.map(d => {
    switch (valueKey) {
      case 'count': return d.count;
      case 'weight': return d.weight;
      case 'temperature': return d.temperature;
      case 'painLevel': return d.painLevel;
      case 'duration': return d.duration;
      default: return 0;
    }
  }).filter(v => v != null && !isNaN(v)) as number[];
  
  if (values.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📈</div>
        <p>Geen data beschikbaar voor de geselecteerde periode</p>
        <p className="text-sm mt-2">Voeg eerst wat data toe om de analytics te zien</p>
      </div>
    );
  }
  
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1; // Prevent division by zero
  const yMin = Math.max(0, minValue - valueRange * 0.1);
  const yMax = maxValue + valueRange * 0.1;
  
  // Create points for the line - only use data points with valid values
  const validDataPoints = data.filter(d => {
    const value = (() => {
      switch (valueKey) {
        case 'count': return d.count;
        case 'weight': return d.weight;
        case 'temperature': return d.temperature;
        case 'painLevel': return d.painLevel;
        case 'duration': return d.duration;
        default: return 0;
      }
    })();
    return value != null && !isNaN(value) && isFinite(value);
  });
  
  const points = validDataPoints.map((d, i) => {
    const value = (() => {
      switch (valueKey) {
        case 'count': return d.count || 0;
        case 'weight': return d.weight || 0;
        case 'temperature': return d.temperature || 0;
        case 'painLevel': return d.painLevel || 0;
        case 'duration': return d.duration || 0;
        default: return 0;
      }
    })();
    
    const x = validDataPoints.length > 1 ? (i / (validDataPoints.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
    
    // Ensure values are finite
    const safeX = isFinite(x) ? x : chartWidth / 2;
    const safeY = isFinite(y) ? y : chartHeight / 2;
    
    return { x: safeX, y: safeY, date: d.date, value };
  });
  
  // Create SVG path
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  const formatValue = (value: number) => {
    switch (metric) {
      case 'weight':
      case 'birth_weight': return `${Math.round(value)}g`;
      case 'baby_temperature':
      case 'mother_temperature': return `${value.toFixed(1)}°C`;
      case 'pain_levels': return `${value.toFixed(1)}/10`;
      case 'sleep_duration': return `${Math.round(value)} min`;
      default: return Math.round(value).toString();
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="border border-gray-200 rounded">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => {
            const y = (i / 4) * chartHeight;
            const value = yMax - (i / 4) * (yMax - yMin);
            return (
              <g key={i}>
                <line 
                  x1={0} 
                  y1={y} 
                  x2={chartWidth} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  strokeDasharray="2,2"
                />
                <text 
                  x={-10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="12" 
                  fill="#6b7280"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {points.map((p, i) => {
            if (i % Math.max(1, Math.floor(points.length / 6)) === 0) {
              return (
                <text 
                  key={i}
                  x={p.x} 
                  y={chartHeight + 20} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill="#6b7280"
                >
                  {formatDate(p.date)}
                </text>
              );
            }
            return null;
          })}
          
          {/* Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
          />
          
          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                fill="#3b82f6"
                className="cursor-pointer hover:r-6 transition-all"
              />
              {/* Tooltip on hover */}
              <title>
                {formatDate(p.date)}: {formatValue(p.value)}
              </title>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}