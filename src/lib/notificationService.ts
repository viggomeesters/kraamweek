'use client';

/**
 * Professional Push Notification Service for Kraamweek App
 * Handles notification permissions, service worker registration, and notification management
 */

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  canRequest: boolean;
  shouldShowRationale: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    healthAlerts: boolean;
    feedingReminders: boolean;
    temperatureAlerts: boolean;
    taskReminders: boolean;
    emergencyAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  category?: keyof NotificationSettings['categories'];
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

class NotificationService {
  private static instance: NotificationService;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private permissionChangeListeners: Array<(state: NotificationPermissionState) => void> = [];

  private constructor() {
    // Initialize service worker if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.initializeServiceWorker();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Get current notification permission state with detailed information
   */
  getPermissionState(): NotificationPermissionState {
    const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
    
    if (!isSupported) {
      return {
        permission: 'default',
        isSupported: false,
        canRequest: false,
        shouldShowRationale: false,
      };
    }

    const permission = Notification.permission;
    const hasBeenRequested = localStorage.getItem('kraamweek-notification-requested') === 'true';
    
    return {
      permission,
      isSupported: true,
      canRequest: permission === 'default',
      shouldShowRationale: permission === 'denied' && hasBeenRequested,
    };
  }

  /**
   * Request notification permission with proper user flow
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    const permissionState = this.getPermissionState();
    
    if (!permissionState.isSupported) {
      throw new Error('Notificaties worden niet ondersteund door deze browser');
    }

    if (!permissionState.canRequest) {
      return permissionState;
    }

    try {
      // Mark that we've requested permission
      localStorage.setItem('kraamweek-notification-requested', 'true');
      
      const permission = await Notification.requestPermission();
      const newState = this.getPermissionState();
      
      // Notify listeners of permission change
      this.permissionChangeListeners.forEach(listener => listener(newState));
      
      // If granted, initialize push notifications
      if (permission === 'granted') {
        await this.initializePushNotifications();
      }
      
      return newState;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw new Error('Er is een fout opgetreden bij het aanvragen van toestemming voor notificaties');
    }
  }

  /**
   * Add listener for permission changes
   */
  addPermissionChangeListener(listener: (state: NotificationPermissionState) => void): void {
    this.permissionChangeListeners.push(listener);
  }

  /**
   * Remove permission change listener
   */
  removePermissionChangeListener(listener: (state: NotificationPermissionState) => void): void {
    const index = this.permissionChangeListeners.indexOf(listener);
    if (index > -1) {
      this.permissionChangeListeners.splice(index, 1);
    }
  }

  /**
   * Get current notification settings
   */
  getNotificationSettings(): NotificationSettings {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      categories: {
        healthAlerts: true,
        feedingReminders: true,
        temperatureAlerts: true,
        taskReminders: true,
        emergencyAlerts: true,
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
      },
      soundEnabled: true,
      vibrationEnabled: true,
    };

    try {
      const saved = localStorage.getItem('kraamweek-notification-settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }

    return defaultSettings;
  }

  /**
   * Save notification settings
   */
  saveNotificationSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem('kraamweek-notification-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw new Error('Er is een fout opgetreden bij het opslaan van notificatie instellingen');
    }
  }

  /**
   * Check if notifications should be sent based on quiet hours
   */
  shouldSendNotification(category?: keyof NotificationSettings['categories']): boolean {
    const settings = this.getNotificationSettings();
    const permissionState = this.getPermissionState();
    
    // Check if notifications are enabled globally
    if (!settings.enabled || permissionState.permission !== 'granted') {
      return false;
    }

    // Check category-specific settings
    if (category && !settings.categories[category]) {
      return false;
    }

    // Emergency alerts always go through
    if (category === 'emergencyAlerts') {
      return true;
    }

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const start = settings.quietHours.start;
      const end = settings.quietHours.end;
      
      // Handle quiet hours that span midnight
      if (start > end) {
        if (currentTime >= start || currentTime <= end) {
          return false;
        }
      } else {
        if (currentTime >= start && currentTime <= end) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Send a notification
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.shouldSendNotification(payload.category)) {
      return;
    }

    const settings = this.getNotificationSettings();
    
    // Prepare notification options with supported properties
    const options = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.svg',
      badge: payload.badge || '/icons/icon-72x72.svg',
      data: payload.data || {},
      tag: payload.tag,
      silent: !settings.soundEnabled,
      vibrate: settings.vibrationEnabled ? [200, 100, 200] : undefined,
      actions: payload.actions,
      requireInteraction: payload.priority === 'critical',
    } as NotificationOptions & {
      vibrate?: number[];
      actions?: Array<{ action: string; title: string; icon?: string }>;
    };

    if (this.serviceWorkerRegistration) {
      // Use service worker for better reliability
      await this.serviceWorkerRegistration.showNotification(payload.title, options);
    } else {
      // Fallback to direct notification
      new Notification(payload.title, options);
    }
  }

  /**
   * Send a health alert notification
   */
  async sendHealthAlert(message: string, recordId?: string): Promise<void> {
    await this.sendNotification({
      title: '⚠️ Gezondheidsalert',
      body: message,
      category: 'healthAlerts',
      priority: 'high',
      tag: 'health-alert',
      data: { recordId, type: 'health_alert' },
      actions: [
        { action: 'view', title: 'Bekijk details' },
        { action: 'dismiss', title: 'Sluiten' },
      ],
    });
  }

  /**
   * Send a feeding reminder
   */
  async sendFeedingReminder(): Promise<void> {
    await this.sendNotification({
      title: '🍼 Voeding herinnering',
      body: 'Het is tijd voor de volgende voeding',
      category: 'feedingReminders',
      priority: 'normal',
      tag: 'feeding-reminder',
      data: { type: 'feeding_reminder' },
      actions: [
        { action: 'log_feeding', title: 'Voeding registreren' },
        { action: 'snooze', title: 'Uitstellen' },
      ],
    });
  }

  /**
   * Send a task reminder
   */
  async sendTaskReminder(taskTitle: string, taskId: string): Promise<void> {
    await this.sendNotification({
      title: '✅ Taak herinnering',
      body: `Vergeet niet: ${taskTitle}`,
      category: 'taskReminders',
      priority: 'normal',
      tag: `task-${taskId}`,
      data: { taskId, type: 'task_reminder' },
      actions: [
        { action: 'complete_task', title: 'Markeer als voltooid' },
        { action: 'snooze', title: 'Uitstellen' },
      ],
    });
  }

  /**
   * Send emergency alert
   */
  async sendEmergencyAlert(message: string): Promise<void> {
    await this.sendNotification({
      title: '🚨 Noodmelding',
      body: message,
      category: 'emergencyAlerts',
      priority: 'critical',
      tag: 'emergency',
      data: { type: 'emergency' },
      actions: [
        { action: 'view', title: 'Bekijk details' },
        { action: 'call_emergency', title: 'Bel hulp' },
      ],
    });
  }

  /**
   * Initialize service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorkerRegistration = registration;
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        console.log('Service worker update available');
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  /**
   * Initialize push notifications after permission granted
   */
  private async initializePushNotifications(): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      await this.initializeServiceWorker();
    }

    if (this.serviceWorkerRegistration) {
      try {
        // In a real app, you would subscribe to push notifications here
        // For this demo, we'll just set up local notifications
        console.log('Push notifications initialized');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    }
  }

  /**
   * Clear all notifications with a specific tag
   */
  async clearNotifications(tag?: string): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      const notifications = await this.serviceWorkerRegistration.getNotifications(tag ? { tag } : {});
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<void> {
    await this.sendNotification({
      title: '🧪 Test notificatie',
      body: 'Dit is een test notificatie van de Kraamweek app',
      category: 'healthAlerts',
      priority: 'normal',
      tag: 'test',
      data: { type: 'test' },
    });
  }
}

// Export singleton instance
export default NotificationService.getInstance();