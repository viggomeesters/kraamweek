// Data types for the Kraamweek app
// Strict TypeScript interfaces with no 'any' types

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
  duration?: number; // for feeding_session in minutes
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
  babyProfile?: BabyProfile; // Single baby profile (future: support multiple)
  userId?: string; // Associated user ID for multi-user support
  // Monitoring and feedback data
  errorLogs?: ErrorLog[]; // Error logging for debugging
  userFeedback?: UserFeedback[]; // User feedback and feature requests
  // Future extensibility placeholders:
  notifications?: Notification[]; // For future notification system
  settings?: AppSettings; // For user preferences
  metadata?: AppMetadata; // For app version, data migrations, etc.
}

// Future notification system interface
export interface Notification {
  id: string;
  type: 'alert' | 'reminder' | 'task_due' | 'health_check';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor: string; // ISO timestamp
  delivered: boolean;
  deliveredAt?: string;
  relatedRecordId?: string;
  relatedBabyId?: string; // For future multi-baby support
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'dismiss' | 'snooze' | 'mark_done' | 'view_record';
  data?: Record<string, unknown>;
}

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  naam: string;
  rol: 'ouders' | 'kraamhulp';
  avatar?: string; // base64 encoded image or URL
  createdAt: string;
  lastLoginAt?: string;
  profileCompleted: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  naam: string;
  rol: 'ouders' | 'kraamhulp';
}

// Future app settings interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'nl' | 'en'; // Future multi-language support
  notifications: {
    enabled: boolean;
    feedingReminders: boolean;
    temperatureAlerts: boolean;
    taskReminders: boolean;
  };
  display: {
    timeFormat: '24h' | '12h'; // Currently enforced to 24h
    dateFormat: 'dd-mm-yyyy' | 'mm-dd-yyyy' | 'yyyy-mm-dd';
    defaultView: 'overview' | 'logging' | 'analytics';
  };
  privacy: {
    dataSharingEnabled: boolean;
    anonymousAnalytics: boolean;
  };
}

// App metadata for versioning and migrations
export interface AppMetadata {
  version: string;
  dataSchemaVersion: number;
  createdAt: string;
  lastMigration?: string;
  features: {
    multipleBabies: boolean;
    notifications: boolean;
    cloudSync: boolean;
  };
}

// Future multi-baby support interfaces
export interface MultiBabyData {
  babies: BabyProfile[];
  activeBabyId?: string;
  babyRecords: Record<string, BabyRecord[]>; // Records per baby ID
  motherRecords: MotherRecord[]; // Mother records are shared
  familyObservations: FamilyObservation[];
  tasks: Task[];
  alerts: Alert[];
  notifications?: Notification[];
  settings?: AppSettings;
  metadata?: AppMetadata;
}

// Enhanced baby profile for future features
export interface ExtendedBabyProfile extends BabyProfile {
  // Future fields
  siblings?: string[]; // IDs of sibling babies
  caregivers?: Caregiver[];
  medicalHistory?: MedicalRecord[];
  preferences?: BabyPreferences;
  growth?: GrowthChart;
}

export interface Caregiver {
  id: string;
  name: string;
  role: 'mother' | 'father' | 'partner' | 'kraamhulp' | 'family' | 'other';
  contactInfo?: ContactInfo;
  permissions: CaregiverPermissions;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  emergencyContact?: boolean;
}

export interface CaregiverPermissions {
  canView: boolean;
  canEdit: boolean;
  canAddRecords: boolean;
  canManageTasks: boolean;
  canAcknowledgeAlerts: boolean;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'illness' | 'medication' | 'other';
  description: string;
  provider?: string;
  notes?: string;
}

export interface BabyPreferences {
  feedingSchedule?: FeedingSchedule;
  sleepSchedule?: SleepSchedule;
  alertSettings?: BabyAlertSettings;
}

export interface FeedingSchedule {
  expectedInterval: number; // minutes
  preferredTimes?: string[]; // HH:MM format
  alertThreshold: number; // hours before alert
}

export interface SleepSchedule {
  expectedDuration: number; // minutes
  bedtime?: string; // HH:MM format
  napTimes?: string[]; // HH:MM format
}

export interface BabyAlertSettings {
  temperatureThresholds: {
    low: number;
    high: number;
  };
  weightChangeThreshold: number; // grams per day
  jaundiceAlertLevel: number; // 1-5
}

export interface GrowthChart {
  measurements: GrowthMeasurement[];
  percentiles?: Record<string, number>;
}

export interface GrowthMeasurement {
  date: string;
  weight?: number; // grams
  length?: number; // cm
  headCircumference?: number; // cm
}

// Utility types for better type safety
export type BabyRecordType = BabyRecord['type'];
export type MotherRecordType = MotherRecord['type'];
export type TaskStatus = Task['status'];
export type AlertType = Alert['type'];
export type NotificationType = Notification['type'];
export type RecordWithTimestamp = BabyRecord | MotherRecord | Alert;

// Enhanced type guards for runtime type checking
export const isBabyRecord = (record: RecordWithTimestamp): record is BabyRecord => {
  return 'type' in record && ['sleep', 'feeding', 'temperature', 'diaper', 'jaundice', 'note', 'pumping', 'weight'].includes(record.type);
};

export const isMotherRecord = (record: RecordWithTimestamp): record is MotherRecord => {
  return 'type' in record && ['temperature', 'blood_pressure', 'mood', 'pain', 'feeding_session', 'note'].includes(record.type);
};

export const isAlert = (record: RecordWithTimestamp): record is Alert => {
  return 'category' in record && 'acknowledged' in record;
};

// Future type guards
export const isNotification = (item: unknown): item is Notification => {
  return typeof item === 'object' && item !== null && 'type' in item && 'scheduledFor' in item && 'delivered' in item;
};

export const isMultiBabyData = (data: AppData | MultiBabyData): data is MultiBabyData => {
  return 'babies' in data && Array.isArray(data.babies);
};

// Error logging and monitoring interfaces
export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  userId?: string;
  userAgent?: string;
  url: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

// User feedback interfaces
export interface UserFeedback {
  id: string;
  timestamp: string;
  userId?: string;
  userRole?: 'ouders' | 'kraamhulp';
  type: 'bug' | 'feature_request' | 'improvement' | 'question' | 'other';
  category: 'usability' | 'performance' | 'functionality' | 'design' | 'data' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  responseMessage?: string;
  attachments?: FeedbackAttachment[];
  votes?: number; // for community voting on feedback
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: BrowserInfo;
  pageContext?: PageContext;
}

export interface FeedbackAttachment {
  id: string;
  type: 'screenshot' | 'log' | 'other';
  filename: string;
  data: string; // base64 encoded data
  size: number;
}

export interface BrowserInfo {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  language: string;
  platform: string;
}

export interface PageContext {
  url: string;
  referrer?: string;
  timestamp: string;
  activeTab?: string;
  currentData?: {
    babyRecordsCount: number;
    motherRecordsCount: number;
    alertsCount: number;
  };
}

// Monitoring statistics
export interface MonitoringStats {
  totalErrors: number;
  unresolvedErrors: number;
  totalFeedback: number;
  pendingFeedback: number;
  userSatisfactionScore?: number;
  lastUpdated: string;
}

// Data migration utilities (for future use)
export interface DataMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: unknown) => unknown;
  description: string;
}

// Export utility for creating strongly typed record objects
export const createBabyRecord = (
  type: BabyRecordType,
  data: Partial<Omit<BabyRecord, 'id' | 'type' | 'timestamp'>>
): Omit<BabyRecord, 'id'> => ({
  timestamp: new Date().toISOString(),
  type,
  ...data,
});

export const createMotherRecord = (
  type: MotherRecordType,
  data: Partial<Omit<MotherRecord, 'id' | 'type' | 'timestamp'>>
): Omit<MotherRecord, 'id'> => ({
  timestamp: new Date().toISOString(),
  type,
  ...data,
});