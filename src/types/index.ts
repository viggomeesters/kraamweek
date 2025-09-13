// Data types for the Kraamweek app

export interface BabyRecord {
  id: string;
  timestamp: string;
  type: 'sleep' | 'feeding' | 'temperature' | 'diaper' | 'jaundice' | 'note' | 'pumping' | 'weight';
  value?: string | number;
  notes?: string;
  duration?: number; // for sleep in minutes
  amount?: number; // for feeding in ml or pumping in ml
  weight?: number; // for weight in grams
  diaperType?: 'wet' | 'dirty' | 'both';
  diaperAmount?: 'little' | 'medium' | 'much'; // amount of wetness/dirt
  jaundiceLevel?: 1 | 2 | 3 | 4 | 5; // 1=light, 5=severe
  feedingType?: 'bottle' | 'breast_left' | 'breast_right' | 'breast_both'; // feeding method
  breastSide?: 'left' | 'right' | 'both'; // for pumping
  noteCategory?: 'general' | 'question' | 'todo'; // categorized notes
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

export interface BabyProfile {
  id: string;
  voornaam: string;
  achternaam: string;
  roepnaam?: string;
  geslacht: 'jongen' | 'meisje' | 'onbekend';
  geboortedatum: string; // ISO date string
  geboortijd?: string; // HH:MM format
  geboortgewicht?: number; // in grams
  geboortelengte?: number; // in cm
  hoofdomvang?: number; // in cm
  goedeStartScore?: number; // APGAR score
  zwangerschapsduur?: number; // in weeks
  moederNaam?: string;
  partnerNaam?: string;
  huisarts?: string;
  verloskundige?: string;
  ziekenhuis?: string;
  bijzonderheden?: string;
  createdAt: string;
  updatedAt: string;
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
  resolutionComment?: string; // Comment added when resolving the alert
}

export interface AppData {
  babyRecords: BabyRecord[];
  motherRecords: MotherRecord[];
  familyObservations: FamilyObservation[];
  tasks: Task[];
  alerts: Alert[];
  babyProfile?: BabyProfile; // Single baby profile
}