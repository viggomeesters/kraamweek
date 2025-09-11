import { AppData, BabyRecord, MotherRecord, FamilyObservation, Task, Alert, User, BabyProfile } from '@/types';

const STORAGE_KEY = 'kraamweek-data';
const USER_KEY = 'kraamweek-user';

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
  // Load data from localStorage
  static loadData(): AppData {
    if (typeof window === 'undefined') {
      return getInitialData();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : getInitialData();
    } catch (error) {
      console.error('Failed to load data:', error);
      return getInitialData();
    }
  }

  // Save data to localStorage
  static saveData(data: AppData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // User management
  static loadUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load user:', error);
      return null;
    }
  }

  static saveUser(user: User): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  static clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  }

  // Baby records
  static addBabyRecord(record: Omit<BabyRecord, 'id'>): BabyRecord {
    const data = this.loadData();
    const newRecord: BabyRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    data.babyRecords.push(newRecord);
    this.saveData(data);
    this.checkForAlerts(newRecord, data);
    this.createTasksFromNote(newRecord);
    
    return newRecord;
  }

  // Mother records
  static addMotherRecord(record: Omit<MotherRecord, 'id'>): MotherRecord {
    const data = this.loadData();
    const newRecord: MotherRecord = {
      ...record,
      id: Date.now().toString(),
    };
    
    data.motherRecords.push(newRecord);
    this.saveData(data);
    this.checkForMotherAlerts(newRecord, data);
    
    return newRecord;
  }

  // Family observations
  static addFamilyObservation(observation: Omit<FamilyObservation, 'id'>): FamilyObservation {
    const data = this.loadData();
    const newObservation: FamilyObservation = {
      ...observation,
      id: Date.now().toString(),
    };
    
    data.familyObservations.push(newObservation);
    this.saveData(data);
    
    return newObservation;
  }

  // Tasks
  static addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const data = this.loadData();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    data.tasks.push(newTask);
    this.saveData(data);
    
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const data = this.loadData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
    
    if (updates.status === 'completed' && !data.tasks[taskIndex].completedAt) {
      data.tasks[taskIndex].completedAt = new Date().toISOString();
    }
    
    this.saveData(data);
    return data.tasks[taskIndex];
  }

  // Alerts
  static addAlert(alert: Omit<Alert, 'id'>): Alert {
    const data = this.loadData();
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
    };
    
    data.alerts.push(newAlert);
    this.saveData(data);
    
    return newAlert;
  }

  static acknowledgeAlert(id: string, acknowledgedBy: string, resolutionComment?: string): Alert | null {
    const data = this.loadData();
    const alertIndex = data.alerts.findIndex(a => a.id === id);
    
    if (alertIndex === -1) return null;
    
    data.alerts[alertIndex] = {
      ...data.alerts[alertIndex],
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
      resolutionComment: resolutionComment?.trim() || undefined,
    };
    
    this.saveData(data);
    return data.alerts[alertIndex];
  }

  // Alert checking logic
  private static checkForAlerts(record: BabyRecord, data: AppData): void {
    const recordTime = new Date(record.timestamp);
    
    // Check temperature alerts
    if (record.type === 'temperature' && typeof record.value === 'number') {
      if (record.value < 36.0 || record.value > 37.5) {
        this.addAlert({
          timestamp: new Date().toISOString(),
          type: record.value < 35.0 || record.value > 38.0 ? 'critical' : 'warning',
          category: 'baby',
          message: `Baby temperatuur is ${record.value}°C - ${record.value < 36.0 ? 'te laag' : 'te hoog'}`,
          relatedRecordId: record.id,
        });
      }
    }

    // Check jaundice alerts
    if (record.type === 'jaundice' && record.jaundiceLevel && record.jaundiceLevel >= 4) {
      this.addAlert({
        timestamp: new Date().toISOString(),
        type: record.jaundiceLevel === 5 ? 'critical' : 'warning',
        category: 'baby',
        message: `Geelzien niveau ${record.jaundiceLevel} - overleg met kraamhulp/arts`,
        relatedRecordId: record.id,
      });
    }

    // Check feeding frequency (no feeding in last 4 hours for newborn)
    if (record.type === 'feeding') {
      const lastFeeding = data.babyRecords
        .filter(r => r.type === 'feeding' && r.timestamp < record.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (lastFeeding) {
        const hoursSinceLastFeeding = (recordTime.getTime() - new Date(lastFeeding.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastFeeding > 4) {
          this.addAlert({
            timestamp: new Date().toISOString(),
            type: 'warning',
            category: 'baby',
            message: `Meer dan 4 uur tussen voedingen (${Math.round(hoursSinceLastFeeding * 10) / 10} uur)`,
            relatedRecordId: record.id,
          });
        }
      }
    }
  }

  private static checkForMotherAlerts(record: MotherRecord, _data: AppData): void {
    // Check temperature alerts for mother
    if (record.type === 'temperature' && typeof record.value === 'number') {
      if (record.value > 38.0) {
        this.addAlert({
          timestamp: new Date().toISOString(),
          type: record.value > 38.5 ? 'critical' : 'warning',
          category: 'mother',
          message: `Moeder heeft koorts: ${record.value}°C`,
          relatedRecordId: record.id,
        });
      }
    }

    // Check blood pressure alerts
    if (record.type === 'blood_pressure' && record.bloodPressure) {
      const { systolic, diastolic } = record.bloodPressure;
      if (systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60) {
        this.addAlert({
          timestamp: new Date().toISOString(),
          type: (systolic > 160 || diastolic > 100 || systolic < 80) ? 'critical' : 'warning',
          category: 'mother',
          message: `Bloeddruk buiten normale waarden: ${systolic}/${diastolic}`,
          relatedRecordId: record.id,
        });
      }
    }

    // Check severe pain levels
    if (record.type === 'pain' && record.painLevel && record.painLevel >= 8) {
      this.addAlert({
        timestamp: new Date().toISOString(),
        type: 'warning',
        category: 'mother',
        message: `Hoge pijnklacht: niveau ${record.painLevel}/10`,
        relatedRecordId: record.id,
      });
    }
  }

  // Create tasks automatically from parent questions and todos
  private static createTasksFromNote(record: BabyRecord): void {
    if (record.type === 'note' && (record.noteCategory === 'question' || record.noteCategory === 'todo')) {
      const taskTitle = record.noteCategory === 'question' 
        ? `Vraag beantwoorden: ${record.notes?.substring(0, 50)}${(record.notes?.length || 0) > 50 ? '...' : ''}`
        : `Verzoek uitvoeren: ${record.notes?.substring(0, 50)}${(record.notes?.length || 0) > 50 ? '...' : ''}`;
      
      const taskDescription = record.notes || '';
      
      this.addTask({
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

  // Baby Profile management
  static getBabyProfile(): BabyProfile | null {
    const data = this.loadData();
    return data.babyProfile || null;
  }

  static saveBabyProfile(profile: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): BabyProfile {
    const data = this.loadData();
    const now = new Date().toISOString();
    
    const newProfile: BabyProfile = {
      ...profile,
      id: data.babyProfile?.id || Date.now().toString(),
      createdAt: data.babyProfile?.createdAt || now,
      updatedAt: now,
    };
    
    data.babyProfile = newProfile;
    this.saveData(data);
    
    return newProfile;
  }

  static deleteBabyProfile(): void {
    const data = this.loadData();
    data.babyProfile = undefined;
    this.saveData(data);
  }

  // Utility methods
  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  static exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Analytics methods
  static getAnalyticsData(startDate: string, endDate: string) {
    const data = this.loadData();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter records within date range
    const babyRecordsInRange = data.babyRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= start && recordDate <= end;
    });
    
    const motherRecordsInRange = data.motherRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= start && recordDate <= end;
    });
    
    return {
      babyRecords: babyRecordsInRange,
      motherRecords: motherRecordsInRange
    };
  }

  static getDailyFeedingCount(startDate: string, endDate: string): Array<{date: string, count: number}> {
    const { babyRecords } = this.getAnalyticsData(startDate, endDate);
    const feedingRecords = babyRecords.filter(record => record.type === 'feeding');
    
    const dailyCounts: Record<string, number> = {};
    
    feedingRecords.forEach(record => {
      const date = record.timestamp.split('T')[0]; // Get date part only
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    // Fill in missing dates with 0 counts
    const result: Array<{date: string, count: number}> = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dailyCounts[dateStr] || 0
      });
    }
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  static getDailyWeights(startDate: string, endDate: string): Array<{date: string, weight: number}> {
    const { babyRecords } = this.getAnalyticsData(startDate, endDate);
    const weightRecords = babyRecords.filter(record => record.type === 'weight' && record.weight);
    
    const dailyWeights: Record<string, number[]> = {};
    
    weightRecords.forEach(record => {
      if (record.weight) {
        const date = record.timestamp.split('T')[0];
        if (!dailyWeights[date]) {
          dailyWeights[date] = [];
        }
        dailyWeights[date].push(record.weight);
      }
    });
    
    // Average weights per day
    const result: Array<{date: string, weight: number}> = [];
    Object.keys(dailyWeights).forEach(date => {
      const weights = dailyWeights[date];
      const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      result.push({ date, weight: avgWeight });
    });
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  static getDailyTemperatures(startDate: string, endDate: string, type: 'baby' | 'mother'): Array<{date: string, temperature: number}> {
    const { babyRecords, motherRecords } = this.getAnalyticsData(startDate, endDate);
    const records = type === 'baby' ? babyRecords : motherRecords;
    const tempRecords = records.filter(record => record.type === 'temperature' && record.value);
    
    const dailyTemps: Record<string, number[]> = {};
    
    tempRecords.forEach(record => {
      if (record.value) {
        // Convert value to number if it's a string
        const temp = typeof record.value === 'string' ? parseFloat(record.value) : record.value;
        if (!isNaN(temp)) {
          const date = record.timestamp.split('T')[0];
          if (!dailyTemps[date]) {
            dailyTemps[date] = [];
          }
          dailyTemps[date].push(temp);
        }
      }
    });
    
    // Average temperatures per day
    const result: Array<{date: string, temperature: number}> = [];
    Object.keys(dailyTemps).forEach(date => {
      const temps = dailyTemps[date];
      const avgTemp = temps.reduce((sum, t) => sum + t, 0) / temps.length;
      result.push({ date, temperature: avgTemp });
    });
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  static getDailyPainLevels(startDate: string, endDate: string): Array<{date: string, painLevel: number}> {
    const { motherRecords } = this.getAnalyticsData(startDate, endDate);
    const painRecords = motherRecords.filter(record => record.type === 'pain' && record.painLevel);
    
    const dailyPain: Record<string, number[]> = {};
    
    painRecords.forEach(record => {
      if (record.painLevel) {
        const date = record.timestamp.split('T')[0];
        if (!dailyPain[date]) {
          dailyPain[date] = [];
        }
        dailyPain[date].push(record.painLevel);
      }
    });
    
    // Average pain levels per day
    const result: Array<{date: string, painLevel: number}> = [];
    Object.keys(dailyPain).forEach(date => {
      const levels = dailyPain[date];
      const avgPain = levels.reduce((sum, p) => sum + p, 0) / levels.length;
      result.push({ date, painLevel: avgPain });
    });
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  static getDailySleepDuration(startDate: string, endDate: string): Array<{date: string, duration: number}> {
    const { babyRecords } = this.getAnalyticsData(startDate, endDate);
    const sleepRecords = babyRecords.filter(record => record.type === 'sleep' && record.duration);
    
    const dailySleep: Record<string, number> = {};
    
    sleepRecords.forEach(record => {
      if (record.duration) {
        const date = record.timestamp.split('T')[0];
        dailySleep[date] = (dailySleep[date] || 0) + record.duration;
      }
    });
    
    // Convert to array
    const result: Array<{date: string, duration: number}> = [];
    Object.keys(dailySleep).forEach(date => {
      result.push({ date, duration: dailySleep[date] });
    });
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}