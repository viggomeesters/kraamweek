import { AppData, BabyRecord, MotherRecord, FamilyObservation, Task, Alert, BabyProfile } from '@/types';

// Check if API is available
const isApiAvailable = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Import API service dynamically only when needed
const getApiService = async () => {
  if (isApiAvailable()) {
    const { ApiService } = await import('./apiService');
    return ApiService;
  }
  return null;
};

const STORAGE_KEY = 'kraamweek-data';

// Default/initial data
const getInitialData = (): AppData => ({
  babyRecords: [],
  motherRecords: [],
  familyObservations: [],
  tasks: [],
  alerts: [],
  babyProfile: undefined, // No profile by default
});

export class DataService {
  // Load data from API or localStorage fallback
  static async loadData(): Promise<AppData> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.loadData();
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.loadDataFromLocalStorage();
  }

  // Synchronous localStorage method for compatibility
  static loadDataFromLocalStorage(): AppData {
    if (typeof window === 'undefined') {
      return getInitialData();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : getInitialData();
      
      // Migrate birth weight from profile to logging entry if needed
      this.migrateBirthWeightToLogging(data);
      
      return data;
    } catch (error) {
      console.error('Failed to load data:', error);
      return getInitialData();
    }
  }

  // Migration: Convert birth weight from profile to logging entry
  private static migrateBirthWeightToLogging(data: AppData): void {
    if (!data.babyProfile?.geboortgewicht || !data.babyProfile?.geboortedatum) {
      return;
    }
    
    // Check if birth weight logging entry already exists
    const birthWeightExists = data.babyRecords.some(record => 
      record.type === 'weight' && 
      record.timestamp.startsWith(data.babyProfile!.geboortedatum) &&
      record.weight === data.babyProfile!.geboortgewicht
    );
    
    if (!birthWeightExists) {
      // Create birth weight logging entry at birth time
      const birthDateTime = data.babyProfile.geboortijd 
        ? `${data.babyProfile.geboortedatum}T${data.babyProfile.geboortijd}:00`
        : `${data.babyProfile.geboortedatum}T00:00:00`;
        
      const birthWeightRecord: BabyRecord = {
        id: `birth-weight-${data.babyProfile.geboortedatum}`,
        timestamp: new Date(birthDateTime).toISOString(),
        type: 'weight',
        weight: data.babyProfile.geboortgewicht,
        notes: 'Geboortegewicht',
      };
      
      data.babyRecords.push(birthWeightRecord);
      this.saveDataToLocalStorage(data);
    }
  }

  // Save data to localStorage
  static saveDataToLocalStorage(data: AppData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Baby records
  static async addBabyRecord(record: Omit<BabyRecord, 'id'>): Promise<BabyRecord> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        const newRecord = await ApiService.addBabyRecord(record);
        this.createTasksFromNote(newRecord);
        // Note: API alerts are handled server-side in a real implementation
        return newRecord;
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.addBabyRecordToLocalStorage(record);
  }

  static addBabyRecordToLocalStorage(record: Omit<BabyRecord, 'id'>): BabyRecord {
    const data = this.loadDataFromLocalStorage();
    const newRecord: BabyRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    data.babyRecords.push(newRecord);
    this.saveDataToLocalStorage(data);
    this.checkForAlerts(newRecord);
    this.createTasksFromNote(newRecord);
    
    return newRecord;
  }

  // Mother records
  static async addMotherRecord(record: Omit<MotherRecord, 'id'>): Promise<MotherRecord> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.addMotherRecord(record);
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.addMotherRecordToLocalStorage(record);
  }

  static addMotherRecordToLocalStorage(record: Omit<MotherRecord, 'id'>): MotherRecord {
    const data = this.loadDataFromLocalStorage();
    const newRecord: MotherRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    data.motherRecords.push(newRecord);
    this.saveDataToLocalStorage(data);
    this.checkForMotherAlerts(newRecord);
    
    return newRecord;
  }

  // Baby profile
  static async getBabyProfile(): Promise<BabyProfile | null> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.getBabyProfile();
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const data = this.loadDataFromLocalStorage();
    return data.babyProfile || null;
  }

  static async saveBabyProfile(profile: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        await ApiService.saveBabyProfile(profile);
        return;
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const data = this.loadDataFromLocalStorage();
    const timestamp = new Date().toISOString();
    
    data.babyProfile = {
      id: data.babyProfile?.id || Date.now().toString(),
      ...profile,
      createdAt: data.babyProfile?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    
    this.saveDataToLocalStorage(data);
  }

  static async deleteBabyProfile(): Promise<void> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        await ApiService.deleteBabyProfile();
        return;
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const data = this.loadDataFromLocalStorage();
    data.babyProfile = undefined;
    this.saveDataToLocalStorage(data);
  }

  // Tasks
  static async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.addTask(task);
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.addTaskToLocalStorage(task);
  }

  static addTaskToLocalStorage(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const data = this.loadDataFromLocalStorage();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    this.saveDataToLocalStorage(data);
    
    return newTask;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.updateTask(id, updates);
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.updateTaskInLocalStorage(id, updates);
  }

  static updateTaskInLocalStorage(id: string, updates: Partial<Task>): Task | null {
    const data = this.loadDataFromLocalStorage();
    const taskIndex = data.tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return null;
    
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
    this.saveDataToLocalStorage(data);
    
    return data.tasks[taskIndex];
  }

  // Family observations
  static async addFamilyObservation(observation: Omit<FamilyObservation, 'id'>): Promise<FamilyObservation> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.addFamilyObservation(observation);
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.addFamilyObservationToLocalStorage(observation);
  }

  static addFamilyObservationToLocalStorage(observation: Omit<FamilyObservation, 'id'>): FamilyObservation {
    const data = this.loadDataFromLocalStorage();
    const newObservation: FamilyObservation = {
      ...observation,
      id: Date.now().toString(),
    };
    
    data.familyObservations.push(newObservation);
    this.saveDataToLocalStorage(data);
    
    return newObservation;
  }

  // Alerts
  static async addAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        return await ApiService.addAlert(alert);
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.addAlertToLocalStorage(alert);
  }

  static addAlertToLocalStorage(alert: Omit<Alert, 'id'>): Alert {
    const data = this.loadDataFromLocalStorage();
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
    };
    
    data.alerts.push(newAlert);
    this.saveDataToLocalStorage(data);
    
    return newAlert;
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    const ApiService = await getApiService();
    
    if (ApiService) {
      try {
        await ApiService.clearAllData();
        return;
      } catch (error) {
        console.warn('API unavailable, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    this.saveDataToLocalStorage(getInitialData());
  }

  // Export data
  static async exportData(): Promise<string> {
    const data = await this.loadData();
    return JSON.stringify(data, null, 2);
  }

  // Import data
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData) as AppData;
      
      const ApiService = await getApiService();
      if (ApiService) {
        // When API is available, we would need to implement bulk import
        console.warn('API bulk import not implemented, falling back to localStorage');
      }
      
      // Fallback to localStorage
      this.saveDataToLocalStorage(data);
    } catch {
      throw new Error('Invalid JSON data');
    }
  }

  // Private helper methods (same as original implementation)
  private static createTasksFromNote(record: BabyRecord): void {
    if (record.type === 'note' && (record.noteCategory === 'question' || record.noteCategory === 'todo')) {
      const taskTitle = record.noteCategory === 'question' 
        ? `Vraag beantwoorden: ${record.notes?.substring(0, 50)}${(record.notes?.length || 0) > 50 ? '...' : ''}`
        : `Verzoek uitvoeren: ${record.notes?.substring(0, 50)}${(record.notes?.length || 0) > 50 ? '...' : ''}`;
      
      const taskDescription = record.notes || '';
      
      this.addTaskToLocalStorage({
        title: taskTitle,
        description: taskDescription,
        category: record.noteCategory === 'question' ? 'other' : 'household',
        priority: record.noteCategory === 'question' ? 'medium' : 'low',
        status: 'pending',
        assignedTo: 'kraamhulp',
        createdBy: 'parents',
      });
    }
  }

  private static checkForAlerts(record: BabyRecord): void {
    // Temperature alerts
    if (record.type === 'temperature' && typeof record.value === 'number') {
      if (record.value < 36 || record.value > 37.5) {
        this.addAlertToLocalStorage({
          timestamp: new Date().toISOString(),
          type: record.value < 35 || record.value > 38 ? 'critical' : 'warning',
          category: 'baby',
          message: `Afwijkende baby temperatuur: ${record.value}°C`,
          relatedRecordId: record.id,
        });
      }
    }
  }

  private static checkForMotherAlerts(record: MotherRecord): void {
    // Blood pressure alerts
    if (record.type === 'blood_pressure' && record.bloodPressure) {
      const { systolic, diastolic } = record.bloodPressure;
      if (systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60) {
        this.addAlertToLocalStorage({
          timestamp: new Date().toISOString(),
          type: systolic > 160 || diastolic > 100 ? 'critical' : 'warning',
          category: 'mother',
          message: `Afwijkende bloeddruk: ${systolic}/${diastolic} mmHg`,
          relatedRecordId: record.id,
        });
      }
    }
  }
}