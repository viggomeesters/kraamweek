// Data types for the Kraamweek app

export interface BabyRecord {
  id: string;
  timestamp: string;
  type: 'sleep' | 'feeding' | 'temperature' | 'diaper' | 'jaundice' | 'note';
  value?: string | number;
  notes?: string;
  duration?: number; // for sleep in minutes
  amount?: number; // for feeding in ml
  diaperType?: 'wet' | 'dirty' | 'both';
  jaundiceLevel?: 1 | 2 | 3 | 4 | 5; // 1=light, 5=severe
}

export interface MotherRecord {
  id: string;
  timestamp: string;
  type: 'temperature' | 'blood_pressure' | 'mood' | 'pain' | 'feeding_session' | 'note';
  value?: string | number;
  notes?: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  painLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  mood?: 'excellent' | 'good' | 'okay' | 'low' | 'very_low';
}

export interface FamilyObservation {
  id: string;
  timestamp: string;
  observer: string; // name of the kraamhulp
  category: 'bonding' | 'environment' | 'support' | 'health' | 'general';
  observation: string;
  concerns?: string[];
  recommendations?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'household' | 'baby_care' | 'mother_care' | 'administrative' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: 'parents' | 'kraamhulp' | 'family' | 'other';
  createdBy: 'parents' | 'kraamhulp';
  createdAt: string;
  completedAt?: string;
  suggestedBy?: string; // if parents suggest a task
}

export interface Alert {
  id: string;
  timestamp: string;
  type: 'warning' | 'critical' | 'info';
  category: 'baby' | 'mother' | 'general';
  message: string;
  relatedRecordId?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AppData {
  babyRecords: BabyRecord[];
  motherRecords: MotherRecord[];
  familyObservations: FamilyObservation[];
  tasks: Task[];
  alerts: Alert[];
}

export type UserRole = 'parents' | 'kraamhulp';

export interface User {
  role: UserRole;
  name: string;
}