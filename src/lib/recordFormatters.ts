// Centralized utilities for formatting different record types
// Provides consistent formatting logic across components

import { BabyRecord, MotherRecord, Alert, Task } from '@/types';

/**
 * Get icon for baby record types
 */
export const getBabyRecordIcon = (type: BabyRecord['type']): string => {
  const icons: Record<BabyRecord['type'], string> = {
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
};

/**
 * Get formatted title for baby record types
 */
export const getBabyRecordTitle = (record: BabyRecord): string => {
  const titles: Record<BabyRecord['type'], string> = {
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
};

/**
 * Get formatted details string for baby records
 */
export const getBabyRecordDetails = (record: BabyRecord): string => {
  switch (record.type) {
    case 'sleep':
      return `${record.duration || 0} minuten${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'feeding':
      if (record.feedingType === 'bottle') {
        return `${record.amount || 0} ml (fles)${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_left') {
        return `Linker borst${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_right') {
        return `Rechter borst${record.notes ? ` - ${record.notes}` : ''}`;
      } else if (record.feedingType === 'breast_both') {
        return `Beide borsten${record.notes ? ` - ${record.notes}` : ''}`;
      }
      return record.notes || 'Voeding';
    
    case 'temperature':
      return `${record.value || 0}°C${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'diaper':
      const diaperTypeText = record.diaperType === 'wet' ? 'Nat' : 
                           record.diaperType === 'dirty' ? 'Vies' : 'Nat en vies';
      return `${diaperTypeText} (${record.diaperAmount || 'onbekend'})${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'jaundice':
      return `Niveau ${record.jaundiceLevel || 0}${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'pumping':
      const breastText = record.breastSide === 'left' ? 'Linker' :
                        record.breastSide === 'right' ? 'Rechter' : 'Beide';
      return `${breastText} borst, ${record.amount || 0} ml${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'weight':
      return `${record.weight || 0} gram${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'note':
      return record.notes || 'Notitie';
    
    default:
      return record.notes || 'Geen details';
  }
};

/**
 * Get icon for mother record types
 */
export const getMotherRecordIcon = (type: MotherRecord['type']): string => {
  const icons: Record<MotherRecord['type'], string> = {
    temperature: '🌡️',
    blood_pressure: '💗',
    mood: '😊',
    pain: '😣',
    feeding_session: '🤱',
    note: '📝',
  };
  return icons[type] || '👩';
};

/**
 * Get formatted title for mother record types
 */
export const getMotherRecordTitle = (record: MotherRecord): string => {
  const titles: Record<MotherRecord['type'], string> = {
    temperature: 'Temperatuur',
    blood_pressure: 'Bloeddruk',
    mood: 'Stemming',
    pain: 'Pijn',
    feeding_session: 'Voedingssessie',
    note: 'Notitie',
  };
  return titles[record.type] || 'Onbekend';
};

/**
 * Get formatted details string for mother records
 */
export const getMotherRecordDetails = (record: MotherRecord): string => {
  switch (record.type) {
    case 'temperature':
      return `${record.value || 0}°C${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'blood_pressure':
      const systolic = record.bloodPressure?.systolic || 0;
      const diastolic = record.bloodPressure?.diastolic || 0;
      return `${systolic}/${diastolic} mmHg${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'mood':
      const moodLabels: Record<NonNullable<MotherRecord['mood']>, string> = {
        excellent: 'Uitstekend',
        good: 'Goed',
        okay: 'Oké',
        low: 'Laag',
        very_low: 'Zeer laag'
      };
      const moodText = record.mood ? moodLabels[record.mood] : 'Oké';
      return `${moodText}${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'pain':
      return `Niveau ${record.painLevel || 0}/10${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'feeding_session':
      return `${record.duration || 0} minuten${record.notes ? ` - ${record.notes}` : ''}`;
    
    case 'note':
      return record.notes || 'Notitie';
    
    default:
      return record.notes || 'Geen details';
  }
};

/**
 * Get icon for task status
 */
export const getTaskIcon = (status: Task['status']): string => {
  const icons: Record<Task['status'], string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
  };
  return icons[status] || '📋';
};

/**
 * Get alert icon based on type and category
 */
export const getAlertIcon = (alert: Alert): string => {
  if (alert.type === 'critical') return '🚨';
  if (alert.type === 'warning') return '⚠️';
  return 'ℹ️';
};