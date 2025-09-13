/**
 * @jest-environment jsdom
 */

import { DataService } from '@/lib/dataService';
import { AppData, BabyRecord, MotherRecord, Task, Alert, BabyProfile } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DataService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Basic data operations', () => {
    it('should load initial data when localStorage is empty', () => {
      const data = DataService.loadData();
      
      expect(data).toEqual({
        babyRecords: [],
        motherRecords: [],
        familyObservations: [],
        tasks: [],
        alerts: [],
        babyProfile: undefined,
      });
    });

    it('should save and load data correctly', () => {
      const testData: AppData = {
        babyRecords: [{
          id: 'test-1',
          timestamp: '2024-01-01T12:00:00.000Z',
          type: 'temperature',
          value: 36.5,
        }],
        motherRecords: [],
        familyObservations: [],
        tasks: [],
        alerts: [],
        babyProfile: undefined,
      };

      DataService.saveData(testData);
      const loadedData = DataService.loadData();
      
      expect(loadedData).toEqual(testData);
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Suppress expected console error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      localStorageMock.setItem('kraamweek-data', 'invalid json');
      
      const data = DataService.loadData();
      
      expect(data).toEqual({
        babyRecords: [],
        motherRecords: [],
        familyObservations: [],
        tasks: [],
        alerts: [],
        babyProfile: undefined,
      });
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('Baby record management', () => {
    it('should add baby record with generated ID', () => {
      const recordData: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 36.5,
        notes: 'Test temperature',
      };

      const addedRecord = DataService.addBabyRecord(recordData);
      
      expect(addedRecord.id).toBeDefined();
      expect(addedRecord.timestamp).toBe(recordData.timestamp);
      expect(addedRecord.type).toBe(recordData.type);
      expect(addedRecord.value).toBe(recordData.value);
      expect(addedRecord.notes).toBe(recordData.notes);

      const data = DataService.loadData();
      expect(data.babyRecords).toHaveLength(1);
      expect(data.babyRecords[0]).toEqual(addedRecord);
    });

    it('should create alert for high temperature', () => {
      const highTempRecord: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 38.2,
      };

      DataService.addBabyRecord(highTempRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('critical');
      expect(data.alerts[0].category).toBe('baby');
      expect(data.alerts[0].message).toContain('te hoog');
    });

    it('should create alert for low temperature', () => {
      const lowTempRecord: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 35.5,
      };

      DataService.addBabyRecord(lowTempRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('warning');
      expect(data.alerts[0].category).toBe('baby');
      expect(data.alerts[0].message).toContain('te laag');
    });

    it('should create alert for high jaundice level', () => {
      const jaundiceRecord: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'jaundice',
        jaundiceLevel: 5,
      };

      DataService.addBabyRecord(jaundiceRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('critical');
      expect(data.alerts[0].category).toBe('baby');
      expect(data.alerts[0].message).toContain('Geelzien niveau 5');
    });

    it('should create task from note with question category', () => {
      const questionNote: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'note',
        noteCategory: 'question',
        notes: 'Is de baby temperatuur van 37.1 normaal?',
      };

      DataService.addBabyRecord(questionNote);
      
      const data = DataService.loadData();
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].title).toContain('Vraag beantwoorden');
      expect(data.tasks[0].assignedTo).toBe('kraamhulp');
      expect(data.tasks[0].createdBy).toBe('parents');
      expect(data.tasks[0].priority).toBe('medium');
    });

    it('should create task from note with todo category', () => {
      const todoNote: Omit<BabyRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'note',
        noteCategory: 'todo',
        notes: 'Vergeet niet om luier te verwisselen',
      };

      DataService.addBabyRecord(todoNote);
      
      const data = DataService.loadData();
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].title).toContain('Verzoek uitvoeren');
      expect(data.tasks[0].category).toBe('household');
      expect(data.tasks[0].priority).toBe('low');
    });
  });

  describe('Mother record management', () => {
    it('should add mother record with generated ID', () => {
      const recordData: Omit<MotherRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 37.2,
      };

      const addedRecord = DataService.addMotherRecord(recordData);
      
      expect(addedRecord.id).toBeDefined();
      expect(addedRecord.timestamp).toBe(recordData.timestamp);
      expect(addedRecord.type).toBe(recordData.type);
      expect(addedRecord.value).toBe(recordData.value);

      const data = DataService.loadData();
      expect(data.motherRecords).toHaveLength(1);
      expect(data.motherRecords[0]).toEqual(addedRecord);
    });

    it('should create alert for high mother temperature', () => {
      const feverRecord: Omit<MotherRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 38.8,
      };

      DataService.addMotherRecord(feverRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('critical');
      expect(data.alerts[0].category).toBe('mother');
      expect(data.alerts[0].message).toContain('koorts');
    });

    it('should create alert for abnormal blood pressure', () => {
      const highBPRecord: Omit<MotherRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'blood_pressure',
        bloodPressure: { systolic: 165, diastolic: 105 },
      };

      DataService.addMotherRecord(highBPRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('critical');
      expect(data.alerts[0].category).toBe('mother');
      expect(data.alerts[0].message).toContain('165/105');
    });

    it('should create alert for high pain level', () => {
      const painRecord: Omit<MotherRecord, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'pain',
        painLevel: 9,
      };

      DataService.addMotherRecord(painRecord);
      
      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('warning');
      expect(data.alerts[0].category).toBe('mother');
      expect(data.alerts[0].message).toContain('niveau 9/10');
    });
  });

  describe('Task management', () => {
    it('should add task with generated ID and createdAt', () => {
      const taskData: Omit<Task, 'id' | 'createdAt'> = {
        title: 'Test task',
        description: 'Test description',
        category: 'baby_care',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'parents',
        createdBy: 'kraamhulp',
      };

      const addedTask = DataService.addTask(taskData);
      
      expect(addedTask.id).toBeDefined();
      expect(addedTask.createdAt).toBeDefined();
      expect(addedTask.title).toBe(taskData.title);
      expect(addedTask.status).toBe('pending');

      const data = DataService.loadData();
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0]).toEqual(addedTask);
    });

    it('should update task and set completedAt when status becomes completed', () => {
      const task = DataService.addTask({
        title: 'Test task',
        category: 'baby_care',
        priority: 'medium',
        status: 'pending',
        assignedTo: 'parents',
        createdBy: 'kraamhulp',
      });

      const updatedTask = DataService.updateTask(task.id, { status: 'completed' });
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask!.status).toBe('completed');
      expect(updatedTask!.completedAt).toBeDefined();
    });

    it('should return null when updating non-existent task', () => {
      const result = DataService.updateTask('non-existent', { status: 'completed' });
      expect(result).toBeNull();
    });
  });

  describe('Alert management', () => {
    it('should add alert with generated ID', () => {
      const alertData: Omit<Alert, 'id'> = {
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'warning',
        category: 'baby',
        message: 'Test alert',
      };

      const addedAlert = DataService.addAlert(alertData);
      
      expect(addedAlert.id).toBeDefined();
      expect(addedAlert.timestamp).toBe(alertData.timestamp);
      expect(addedAlert.type).toBe(alertData.type);
      expect(addedAlert.message).toBe(alertData.message);

      const data = DataService.loadData();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0]).toEqual(addedAlert);
    });

    it('should acknowledge alert correctly', () => {
      const alert = DataService.addAlert({
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'warning',
        category: 'baby',
        message: 'Test alert',
      });

      const acknowledgedAlert = DataService.acknowledgeAlert(
        alert.id, 
        'Test User',
        'Alert resolved successfully'
      );
      
      expect(acknowledgedAlert).toBeDefined();
      expect(acknowledgedAlert!.acknowledged).toBe(true);
      expect(acknowledgedAlert!.acknowledgedBy).toBe('Test User');
      expect(acknowledgedAlert!.acknowledgedAt).toBeDefined();
      expect(acknowledgedAlert!.resolutionComment).toBe('Alert resolved successfully');
    });

    it('should return null when acknowledging non-existent alert', () => {
      const result = DataService.acknowledgeAlert('non-existent', 'Test User');
      expect(result).toBeNull();
    });
  });

  describe('Baby profile management', () => {
    it('should save and retrieve baby profile', () => {
      const profileData: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        voornaam: 'Emma',
        achternaam: 'Test',
        geslacht: 'meisje',
        geboortedatum: '2024-01-01',
        geboortijd: '14:30',
        geboortgewicht: 3200,
      };

      const savedProfile = DataService.saveBabyProfile(profileData);
      
      expect(savedProfile.id).toBeDefined();
      expect(savedProfile.createdAt).toBeDefined();
      expect(savedProfile.updatedAt).toBeDefined();
      expect(savedProfile.voornaam).toBe('Emma');

      const retrievedProfile = DataService.getBabyProfile();
      expect(retrievedProfile).toEqual(savedProfile);
    });

    it('should create birth weight record when saving profile with birth weight', () => {
      const profileData: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'> = {
        voornaam: 'Emma',
        achternaam: 'Test',
        geslacht: 'meisje',
        geboortedatum: '2024-01-01',
        geboortijd: '14:30',
        geboortgewicht: 3200,
      };

      DataService.saveBabyProfile(profileData);
      
      const data = DataService.loadData();
      const birthWeightRecord = data.babyRecords.find(r => 
        r.type === 'weight' && r.notes === 'Geboortegewicht'
      );
      
      expect(birthWeightRecord).toBeDefined();
      expect(birthWeightRecord!.weight).toBe(3200);
      expect(birthWeightRecord!.timestamp).toContain('2024-01-01T14:30:00');
    });

    it('should delete baby profile', () => {
      DataService.saveBabyProfile({
        voornaam: 'Test',
        achternaam: 'Baby',
        geslacht: 'onbekend',
        geboortedatum: '2024-01-01',
      });

      DataService.deleteBabyProfile();
      
      const profile = DataService.getBabyProfile();
      expect(profile).toBeNull();
    });
  });

  describe('Data utility methods', () => {
    it('should clear all data', () => {
      DataService.addBabyRecord({
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 36.5,
      });

      DataService.clearAllData();
      
      const data = DataService.loadData();
      expect(data.babyRecords).toHaveLength(0);
    });

    it('should export data as JSON string', () => {
      DataService.addBabyRecord({
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 36.5,
      });

      const exportedData = DataService.exportData();
      const parsedData = JSON.parse(exportedData);
      
      expect(parsedData.babyRecords).toHaveLength(1);
      expect(parsedData.babyRecords[0].value).toBe(36.5);
    });

    it('should import data from JSON string', () => {
      const testData = {
        babyRecords: [{
          id: 'test',
          timestamp: '2024-01-01T12:00:00.000Z',
          type: 'temperature',
          value: 36.5,
        }],
        motherRecords: [],
        familyObservations: [],
        tasks: [],
        alerts: [],
      };

      const success = DataService.importData(JSON.stringify(testData));
      
      expect(success).toBe(true);
      
      const data = DataService.loadData();
      expect(data.babyRecords).toHaveLength(1);
      expect(data.babyRecords[0].value).toBe(36.5);
    });

    it('should handle invalid JSON during import', () => {
      // Suppress expected console error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const success = DataService.importData('invalid json');
      expect(success).toBe(false);
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('Analytics methods (basic functionality)', () => {
    it('should have analytics methods available', () => {
      expect(typeof DataService.getDailyFeedingCount).toBe('function');
      expect(typeof DataService.getDailyWeights).toBe('function');
      expect(typeof DataService.getAnalyticsData).toBe('function');
      expect(typeof DataService.getDailyTemperatures).toBe('function');
    });

    it('should return empty arrays for date ranges with no data', () => {
      localStorageMock.clear();
      
      const feedingData = DataService.getDailyFeedingCount('2024-01-01', '2024-01-02');
      const weightData = DataService.getDailyWeights('2024-01-01', '2024-01-02');
      const analyticsData = DataService.getAnalyticsData('2024-01-01', '2024-01-02');
      
      expect(Array.isArray(feedingData)).toBe(true);
      expect(Array.isArray(weightData)).toBe(true);
      expect(analyticsData.babyRecords).toEqual([]);
      expect(analyticsData.motherRecords).toEqual([]);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing localStorage gracefully in server environment', () => {
      // Mock server environment
      const originalWindow = global.window;
      delete (global as any).window;
      
      expect(() => {
        const data = DataService.loadData();
        expect(data).toEqual({
          babyRecords: [],
          motherRecords: [],
          familyObservations: [],
          tasks: [],
          alerts: [],
        });
      }).not.toThrow();
      
      // Restore window
      global.window = originalWindow;
    });

    it('should handle concurrent ID generation', () => {
      const originalDateNow = Date.now;
      let counter = 1000000;
      Date.now = jest.fn(() => counter++);
      
      const record1 = DataService.addBabyRecord({
        timestamp: '2024-01-01T12:00:00.000Z',
        type: 'temperature',
        value: 36.5,
      });
      
      const record2 = DataService.addBabyRecord({
        timestamp: '2024-01-01T12:01:00.000Z',
        type: 'temperature',
        value: 36.7,
      });
      
      expect(record1.id).not.toBe(record2.id);
      
      Date.now = originalDateNow;
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      // Suppress expected console error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      expect(() => {
        DataService.addBabyRecord({
          timestamp: '2024-01-01T12:00:00.000Z',
          type: 'temperature',
          value: 36.5,
        });
      }).not.toThrow();
      
      localStorageMock.setItem = originalSetItem;
      console.error = originalConsoleError;
    });
  });
});