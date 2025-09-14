'use client';

import { ErrorLog, BrowserInfo } from '@/types';

export class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errorLogs: ErrorLog[] = [];
  private readonly maxLocalLogs = 500; // Limit local storage size

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  /**
   * Generate a unique ID using timestamp and random number
   */
  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log an error with context information
   */
  public logError(
    error: Error | string,
    level: 'error' | 'warning' | 'info' = 'error',
    context?: {
      component?: string;
      action?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    try {
      const errorLog: ErrorLog = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        level,
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' && error.stack ? error.stack : undefined,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userId: context?.userId,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        component: context?.component,
        action: context?.action,
        metadata: context?.metadata,
        resolved: false,
      };

      this.errorLogs.unshift(errorLog); // Add to beginning for most recent first

      // Limit storage size
      if (this.errorLogs.length > this.maxLocalLogs) {
        this.errorLogs = this.errorLogs.slice(0, this.maxLocalLogs);
      }

      this.saveToStorage();
      this.sendToRemoteLogging();

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorLog);
      }
    } catch (loggingError) {
      // Fallback logging to console if our logging system fails
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Log a user action for debugging purposes
   */
  public logUserAction(
    action: string,
    component: string,
    metadata?: Record<string, unknown>,
    userId?: string
  ): void {
    this.logError(
      `User action: ${action}`,
      'info',
      {
        component,
        action,
        userId,
        metadata: {
          ...metadata,
          actionType: 'user_interaction',
        },
      }
    );
  }

  /**
   * Get all error logs
   */
  public getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs]; // Return copy to prevent direct mutation
  }

  /**
   * Get error logs with filtering
   */
  public getFilteredErrorLogs(filter?: {
    level?: 'error' | 'warning' | 'info';
    resolved?: boolean;
    component?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): ErrorLog[] {
    let filtered = this.errorLogs;

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.resolved !== undefined) {
      filtered = filtered.filter(log => log.resolved === filter.resolved);
    }

    if (filter?.component) {
      filtered = filtered.filter(log => log.component === filter.component);
    }

    if (filter?.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    if (filter?.dateFrom) {
      filtered = filtered.filter(log => log.timestamp >= filter.dateFrom!);
    }

    if (filter?.dateTo) {
      filtered = filtered.filter(log => log.timestamp <= filter.dateTo!);
    }

    return filtered;
  }

  /**
   * Mark an error as resolved
   */
  public resolveError(errorId: string, resolvedBy: string, resolutionNotes?: string): boolean {
    const errorIndex = this.errorLogs.findIndex(log => log.id === errorId);
    if (errorIndex === -1) return false;

    this.errorLogs[errorIndex] = {
      ...this.errorLogs[errorIndex],
      resolved: true,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    };

    this.saveToStorage();
    return true;
  }

  /**
   * Clear old error logs (older than specified days)
   */
  public clearOldLogs(daysToKeep = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffIso = cutoffDate.toISOString();

    const initialCount = this.errorLogs.length;
    this.errorLogs = this.errorLogs.filter(log => log.timestamp >= cutoffIso);
    const removed = initialCount - this.errorLogs.length;

    if (removed > 0) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number;
    unresolved: number;
    byLevel: Record<string, number>;
    last24Hours: number;
  } {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayIso = yesterday.toISOString();

    const stats = {
      total: this.errorLogs.length,
      unresolved: this.errorLogs.filter(log => !log.resolved).length,
      byLevel: {} as Record<string, number>,
      last24Hours: this.errorLogs.filter(log => log.timestamp >= yesterdayIso).length,
    };

    // Count by level
    this.errorLogs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    return stats;
  }

  /**
   * Create browser info for context
   */
  public static getBrowserInfo(): BrowserInfo | undefined {
    if (typeof window === 'undefined') return undefined;

    return {
      userAgent: window.navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: window.navigator.language,
      platform: window.navigator.platform,
    };
  }

  /**
   * Load error logs from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('kraamweek-error-logs');
      if (stored) {
        this.errorLogs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load error logs from storage:', error);
      this.errorLogs = [];
    }
  }

  /**
   * Save error logs to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem('kraamweek-error-logs', JSON.stringify(this.errorLogs));
    } catch (error) {
      console.error('Failed to save error logs to storage:', error);
    }
  }

  /**
   * Send error log to remote logging service (placeholder for future implementation)
   */
  private sendToRemoteLogging(): void {
    // In a real implementation, this would send to a service like Sentry, LogRocket, etc.
    // For now, we'll just store locally and provide the infrastructure

    if (process.env.NODE_ENV === 'development') {
      // Could send to a development logging endpoint
      return;
    }

    // Future implementation could include:
    // - Sentry integration
    // - LogRocket integration
    // - Custom API endpoint for error collection
    // - Rate limiting for error reporting
    // - Batch sending for performance

    try {
      // Placeholder for future remote logging
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });
    } catch {
      // Silently fail remote logging to not cause infinite loops
    }
  }
}

// Global error handler setup
export const setupGlobalErrorHandling = (): void => {
  if (typeof window === 'undefined') return;

  const errorLogger = ErrorLoggingService.getInstance();

  // Handle unhandled promises
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      'error',
      {
        component: 'global',
        action: 'unhandledrejection',
        metadata: {
          reason: event.reason,
        },
      }
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorLogger.logError(
      new Error(event.message),
      'error',
      {
        component: 'global',
        action: 'uncaught_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      }
    );
  });
};

// React Error Boundary utility
export const withErrorLogging = <T extends Error>(
  error: T,
  errorInfo?: { componentStack: string }
): void => {
  const errorLogger = ErrorLoggingService.getInstance();
  
  errorLogger.logError(
    error,
    'error',
    {
      component: 'error_boundary',
      action: 'component_error',
      metadata: {
        componentStack: errorInfo?.componentStack,
      },
    }
  );
};

export default ErrorLoggingService;