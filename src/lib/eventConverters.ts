// Utilities for converting records to event items for unified display
// Separates event conversion logic from UI components

import { AppData, BabyRecord, MotherRecord, Alert, Task } from '@/types';
import { EventItem } from './filterUtils';
import { 
  getBabyRecordIcon, 
  getBabyRecordTitle, 
  getBabyRecordDetails,
  getMotherRecordIcon,
  getMotherRecordTitle,
  getMotherRecordDetails,
  getTaskIcon,
  getAlertIcon
} from './recordFormatters';

/**
 * Convert baby record to event item
 */
export const convertBabyRecordToEvent = (record: BabyRecord): EventItem => {
  return {
    id: record.id,
    timestamp: record.timestamp,
    type: 'baby',
    icon: getBabyRecordIcon(record.type),
    title: getBabyRecordTitle(record),
    details: getBabyRecordDetails(record),
    originalRecord: record,
  };
};

/**
 * Convert mother record to event item
 */
export const convertMotherRecordToEvent = (record: MotherRecord): EventItem => {
  return {
    id: record.id,
    timestamp: record.timestamp,
    type: 'mother',
    icon: getMotherRecordIcon(record.type),
    title: getMotherRecordTitle(record),
    details: getMotherRecordDetails(record),
    originalRecord: record,
  };
};

/**
 * Convert alert to event item
 */
export const convertAlertToEvent = (alert: Alert): EventItem => {
  return {
    id: alert.id,
    timestamp: alert.timestamp,
    type: 'alerts',
    icon: getAlertIcon(alert),
    title: 'Alert',
    subtitle: alert.type,
    details: alert.message,
    originalRecord: alert,
  };
};

/**
 * Convert task to event item
 */
export const convertTaskToEvent = (task: Task): EventItem => {
  return {
    id: task.id,
    timestamp: task.createdAt,
    type: 'tasks',
    icon: getTaskIcon(task.status),
    title: task.title,
    subtitle: task.status,
    details: task.description || '',
    originalRecord: task,
  };
};

/**
 * Convert all app data to unified event items array
 */
export const convertDataToEvents = (data: AppData): EventItem[] => {
  const events: EventItem[] = [];

  // Convert baby records
  data.babyRecords.forEach(record => {
    events.push(convertBabyRecordToEvent(record));
  });

  // Convert mother records
  data.motherRecords.forEach(record => {
    events.push(convertMotherRecordToEvent(record));
  });

  // Convert alerts
  data.alerts.forEach(alert => {
    events.push(convertAlertToEvent(alert));
  });

  // Convert tasks
  data.tasks.forEach(task => {
    events.push(convertTaskToEvent(task));
  });

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};