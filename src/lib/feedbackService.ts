'use client';

import { UserFeedback, BrowserInfo, PageContext } from '@/types';
import { ErrorLoggingService } from './errorLoggingService';

export class FeedbackService {
  private static instance: FeedbackService;
  private feedback: UserFeedback[] = [];
  private readonly maxLocalFeedback = 200; // Limit local storage size
  private errorLogger: ErrorLoggingService;

  private constructor() {
    this.errorLogger = ErrorLoggingService.getInstance();
    this.loadFromStorage();
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Generate a unique ID for feedback
   */
  private generateId(): string {
    return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Submit new user feedback
   */
  public async submitFeedback(
    feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'status' | 'browserInfo' | 'pageContext'>
  ): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
    try {
      const feedback: UserFeedback = {
        ...feedbackData,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        status: 'new',
        browserInfo: this.getBrowserInfo(),
        pageContext: this.getPageContext(),
      };

      this.feedback.unshift(feedback); // Add to beginning for most recent first

      // Limit storage size
      if (this.feedback.length > this.maxLocalFeedback) {
        this.feedback = this.feedback.slice(0, this.maxLocalFeedback);
      }

      this.saveToStorage();
      
      // Send to remote service if available
      await this.sendToRemoteService(feedback);

      // Log the feedback submission
      this.errorLogger.logUserAction(
        'feedback_submitted',
        'FeedbackService',
        {
          feedbackId: feedback.id,
          type: feedback.type,
          category: feedback.category,
          priority: feedback.priority,
        },
        feedback.userId
      );

      return { success: true, feedbackId: feedback.id };
    } catch (error) {
      this.errorLogger.logError(
        error instanceof Error ? error : new Error('Failed to submit feedback'),
        'error',
        {
          component: 'FeedbackService',
          action: 'submit_feedback',
          metadata: { feedbackData },
        }
      );

      return { 
        success: false, 
        error: 'Er is een fout opgetreden bij het versturen van de feedback. Probeer het later opnieuw.' 
      };
    }
  }

  /**
   * Get all feedback
   */
  public getFeedback(): UserFeedback[] {
    return [...this.feedback]; // Return copy to prevent direct mutation
  }

  /**
   * Get filtered feedback
   */
  public getFilteredFeedback(filter?: {
    type?: UserFeedback['type'];
    category?: UserFeedback['category'];
    status?: UserFeedback['status'];
    priority?: UserFeedback['priority'];
    userId?: string;
    userRole?: 'ouders' | 'kraamhulp';
    dateFrom?: string;
    dateTo?: string;
  }): UserFeedback[] {
    let filtered = this.feedback;

    if (filter?.type) {
      filtered = filtered.filter(f => f.type === filter.type);
    }

    if (filter?.category) {
      filtered = filtered.filter(f => f.category === filter.category);
    }

    if (filter?.status) {
      filtered = filtered.filter(f => f.status === filter.status);
    }

    if (filter?.priority) {
      filtered = filtered.filter(f => f.priority === filter.priority);
    }

    if (filter?.userId) {
      filtered = filtered.filter(f => f.userId === filter.userId);
    }

    if (filter?.userRole) {
      filtered = filtered.filter(f => f.userRole === filter.userRole);
    }

    if (filter?.dateFrom) {
      filtered = filtered.filter(f => f.timestamp >= filter.dateFrom!);
    }

    if (filter?.dateTo) {
      filtered = filtered.filter(f => f.timestamp <= filter.dateTo!);
    }

    return filtered;
  }

  /**
   * Update feedback status (for team management)
   */
  public updateFeedbackStatus(
    feedbackId: string,
    status: UserFeedback['status'],
    updatedBy: string,
    responseMessage?: string
  ): boolean {
    const feedbackIndex = this.feedback.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) return false;

    this.feedback[feedbackIndex] = {
      ...this.feedback[feedbackIndex],
      status,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: updatedBy,
      responseMessage,
    };

    this.saveToStorage();

    // Log the status update
    this.errorLogger.logUserAction(
      'feedback_status_updated',
      'FeedbackService',
      {
        feedbackId,
        newStatus: status,
        updatedBy,
      }
    );

    return true;
  }

  /**
   * Assign feedback to team member
   */
  public assignFeedback(feedbackId: string, assignedTo: string): boolean {
    const feedbackIndex = this.feedback.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) return false;

    this.feedback[feedbackIndex] = {
      ...this.feedback[feedbackIndex],
      assignedTo,
      statusUpdatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    return true;
  }

  /**
   * Get feedback statistics
   */
  public getFeedbackStats(): {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    last30Days: number;
    averageResponseTime?: number; // in hours
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    const stats: {
      total: number;
      byStatus: Record<string, number>;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
      last30Days: number;
      averageResponseTime?: number;
    } = {
      total: this.feedback.length,
      byStatus: {},
      byType: {},
      byPriority: {},
      last30Days: this.feedback.filter(f => f.timestamp >= thirtyDaysAgoIso).length,
    };

    // Count by status, type, and priority
    this.feedback.forEach(f => {
      stats.byStatus[f.status] = (stats.byStatus[f.status] || 0) + 1;
      stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
      stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
    });

    // Calculate average response time for resolved feedback
    const resolvedFeedback = this.feedback.filter(f => f.status === 'resolved' && f.statusUpdatedAt);
    if (resolvedFeedback.length > 0) {
      const totalResponseTime = resolvedFeedback.reduce((acc, f) => {
        const submittedTime = new Date(f.timestamp).getTime();
        const resolvedTime = new Date(f.statusUpdatedAt!).getTime();
        return acc + (resolvedTime - submittedTime);
      }, 0);
      
      stats.averageResponseTime = totalResponseTime / resolvedFeedback.length / (1000 * 60 * 60); // Convert to hours
    }

    return stats;
  }

  /**
   * Search feedback by text
   */
  public searchFeedback(query: string): UserFeedback[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.feedback.filter(f => 
      f.title.toLowerCase().includes(lowercaseQuery) ||
      f.description.toLowerCase().includes(lowercaseQuery) ||
      (f.responseMessage && f.responseMessage.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): BrowserInfo | undefined {
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
   * Get current page context
   */
  private getPageContext(): PageContext {
    if (typeof window === 'undefined') {
      return {
        url: '',
        timestamp: new Date().toISOString(),
      };
    }

    // Try to get current app data for context
    let currentData;
    try {
      const storedData = localStorage.getItem('kraamweek-data');
      if (storedData) {
        const data = JSON.parse(storedData);
        currentData = {
          babyRecordsCount: data.babyRecords?.length || 0,
          motherRecordsCount: data.motherRecords?.length || 0,
          alertsCount: data.alerts?.length || 0,
        };
      }
    } catch {
      // Ignore errors when trying to get context data
    }

    return {
      url: window.location.href,
      referrer: document.referrer || undefined,
      timestamp: new Date().toISOString(),
      currentData,
    };
  }

  /**
   * Load feedback from localStorage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      const stored = localStorage.getItem('kraamweek-feedback');
      if (stored) {
        this.feedback = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load feedback from storage:', error);
      this.feedback = [];
    }
  }

  /**
   * Save feedback to localStorage
   */
  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem('kraamweek-feedback', JSON.stringify(this.feedback));
    } catch (error) {
      console.error('Failed to save feedback to storage:', error);
    }
  }

  /**
   * Send feedback to remote service (placeholder for future implementation)
   */
  private async sendToRemoteService(feedback: UserFeedback): Promise<void> {
    // In a real implementation, this would send to a feedback management service
    // For now, we'll just store locally and provide the infrastructure

    if (process.env.NODE_ENV === 'development') {
      console.log('Feedback submitted:', feedback);
      return;
    }

    try {
      // Placeholder for future remote service integration
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedback),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to send feedback to remote service');
      // }
    } catch (error) {
      // Log but don't throw - local storage is our fallback
      this.errorLogger.logError(
        error instanceof Error ? error : new Error('Failed to send feedback remotely'),
        'warning',
        {
          component: 'FeedbackService',
          action: 'send_remote_feedback',
          metadata: { feedbackId: feedback.id },
        }
      );
    }
  }
}

export default FeedbackService;