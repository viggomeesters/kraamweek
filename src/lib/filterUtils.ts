// Centralized filtering utilities for records and events
// Provides consistent filtering logic across components

import { BabyRecord, MotherRecord, Alert, Task } from '@/types';

export type FilterType = 'all' | 'baby' | 'mother' | 'alerts' | 'tasks';

export interface EventItem {
  id: string;
  timestamp: string;
  type: FilterType;
  icon: string;
  title: string;
  subtitle?: string;
  details: string;
  originalRecord?: BabyRecord | MotherRecord | Alert | Task;
}

/**
 * Filter configuration for UI components
 */
export const FILTER_CONFIG = [
  { id: 'all' as const, label: 'Alles', icon: '📋' },
  { id: 'baby' as const, label: 'Baby', icon: '👶' },
  { id: 'mother' as const, label: 'Moeder', icon: '👩' },
  { id: 'alerts' as const, label: 'Alerts', icon: '⚠️' },
  { id: 'tasks' as const, label: 'Taken', icon: '✅' },
] as const;

/**
 * Filter events by type
 */
export const filterEventsByType = (events: EventItem[], filterType: FilterType): EventItem[] => {
  if (filterType === 'all') return events;
  return events.filter(event => event.type === filterType);
};

/**
 * Filter records by date range
 */
export const filterRecordsByDateRange = <T extends { timestamp: string }>(
  records: T[], 
  startDate: string, 
  endDate: string
): T[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date
  
  return records.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= start && recordDate <= end;
  });
};

/**
 * Filter baby records by type
 */
export const filterBabyRecordsByType = (
  records: BabyRecord[], 
  type: BabyRecord['type']
): BabyRecord[] => {
  return records.filter(record => record.type === type);
};

/**
 * Filter mother records by type
 */
export const filterMotherRecordsByType = (
  records: MotherRecord[], 
  type: MotherRecord['type']
): MotherRecord[] => {
  return records.filter(record => record.type === type);
};

/**
 * Filter alerts by status
 */
export const filterAlertsByStatus = (
  alerts: Alert[], 
  acknowledged: boolean
): Alert[] => {
  return alerts.filter(alert => Boolean(alert.acknowledged) === acknowledged);
};

/**
 * Filter tasks by status
 */
export const filterTasksByStatus = (
  tasks: Task[], 
  status: Task['status']
): Task[] => {
  return tasks.filter(task => task.status === status);
};

/**
 * Sort records by timestamp (newest first)
 */
export const sortRecordsByTimestamp = <T extends { timestamp: string }>(
  records: T[], 
  ascending: boolean = false
): T[] => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Get records from the last N days
 */
export const getRecentRecords = <T extends { timestamp: string }>(
  records: T[], 
  days: number
): T[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return records.filter(record => {
    const recordDate = new Date(record.timestamp);
    return recordDate >= cutoffDate;
  });
};