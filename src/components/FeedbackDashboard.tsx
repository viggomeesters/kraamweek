'use client';

import React, { useState, useEffect } from 'react';
import { UserFeedback, ErrorLog } from '@/types';
import { FeedbackService } from '@/lib/feedbackService';
import { ErrorLoggingService } from '@/lib/errorLoggingService';

interface FeedbackDashboardProps {
  onBack: () => void;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ onBack }) => {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [activeView, setActiveView] = useState<'feedback' | 'errors' | 'stats'>('feedback');
  const [filters, setFilters] = useState({
    feedbackStatus: 'all' as 'all' | UserFeedback['status'],
    feedbackType: 'all' as 'all' | UserFeedback['type'],
    errorLevel: 'all' as 'all' | ErrorLog['level'],
    errorResolved: 'all' as 'all' | 'true' | 'false',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const feedbackService = FeedbackService.getInstance();
    const errorService = ErrorLoggingService.getInstance();
    
    setFeedback(feedbackService.getFeedback());
    setErrors(errorService.getErrorLogs());
  };

  const handleUpdateFeedbackStatus = (
    feedbackId: string, 
    status: UserFeedback['status'],
    responseMessage?: string
  ) => {
    const feedbackService = FeedbackService.getInstance();
    const success = feedbackService.updateFeedbackStatus(
      feedbackId, 
      status, 
      'Team Member', // In real app, use actual user name
      responseMessage
    );
    
    if (success) {
      loadData();
    }
  };

  const handleResolveError = (errorId: string, resolutionNotes?: string) => {
    const errorService = ErrorLoggingService.getInstance();
    const success = errorService.resolveError(errorId, 'Team Member', resolutionNotes);
    
    if (success) {
      loadData();
    }
  };

  const getFilteredFeedback = () => {
    let filtered = feedback;

    if (filters.feedbackStatus !== 'all') {
      filtered = filtered.filter(f => f.status === filters.feedbackStatus);
    }

    if (filters.feedbackType !== 'all') {
      filtered = filtered.filter(f => f.type === filters.feedbackType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getFilteredErrors = () => {
    let filtered = errors;

    if (filters.errorLevel !== 'all') {
      filtered = filtered.filter(e => e.level === filters.errorLevel);
    }

    if (filters.errorResolved !== 'all') {
      const resolved = filters.errorResolved === 'true';
      filtered = filtered.filter(e => e.resolved === resolved);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.message.toLowerCase().includes(query) ||
        (e.component && e.component.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getStats = () => {
    const feedbackService = FeedbackService.getInstance();
    const errorService = ErrorLoggingService.getInstance();
    
    return {
      feedback: feedbackService.getFeedbackStats(),
      errors: errorService.getErrorStats(),
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: UserFeedback['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: UserFeedback['status']) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: ErrorLog['level']) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = getStats();
  const filteredFeedback = getFilteredFeedback();
  const filteredErrors = getFilteredErrors();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Dashboard
            </h1>
          </div>
          
          <div className="text-sm text-gray-500">
            Monitoring & Feedback
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'feedback' as const, label: 'Feedback', count: stats.feedback.total },
            { id: 'errors' as const, label: 'Fouten', count: stats.errors.total },
            { id: 'stats' as const, label: 'Statistieken', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeView === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        {(activeView === 'feedback' || activeView === 'errors') && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Zoeken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {activeView === 'feedback' && (
                <>
                  <select
                    value={filters.feedbackStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, feedbackStatus: e.target.value as 'all' | UserFeedback['status'] }))}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Alle statussen</option>
                    <option value="new">Nieuw</option>
                    <option value="in_progress">In behandeling</option>
                    <option value="resolved">Opgelost</option>
                    <option value="closed">Gesloten</option>
                  </select>
                  
                  <select
                    value={filters.feedbackType}
                    onChange={(e) => setFilters(prev => ({ ...prev, feedbackType: e.target.value as 'all' | UserFeedback['type'] }))}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Alle types</option>
                    <option value="bug">Bug</option>
                    <option value="feature_request">Functie verzoek</option>
                    <option value="improvement">Verbetering</option>
                    <option value="question">Vraag</option>
                    <option value="other">Anders</option>
                  </select>
                </>
              )}
              
              {activeView === 'errors' && (
                <>
                  <select
                    value={filters.errorLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, errorLevel: e.target.value as 'all' | ErrorLog['level'] }))}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Alle levels</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                  
                  <select
                    value={filters.errorResolved}
                    onChange={(e) => setFilters(prev => ({ ...prev, errorResolved: e.target.value as 'all' | 'true' | 'false' }))}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Alle fouten</option>
                    <option value="false">Onopgelost</option>
                    <option value="true">Opgelost</option>
                  </select>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {activeView === 'feedback' && (
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Geen feedback gevonden</p>
              </div>
            ) : (
              filteredFeedback.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' ? 'Hoog' : item.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status === 'new' ? 'Nieuw' : 
                           item.status === 'in_progress' ? 'In behandeling' :
                           item.status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.type === 'bug' ? 'Bug' :
                           item.type === 'feature_request' ? 'Functie verzoek' :
                           item.type === 'improvement' ? 'Verbetering' :
                           item.type === 'question' ? 'Vraag' : 'Anders'}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        {formatDate(item.timestamp)} - {item.userRole === 'kraamhulp' ? 'Kraamhulp' : 'Ouders'}
                      </div>
                    </div>
                  </div>
                  
                  {item.status !== 'resolved' && item.status !== 'closed' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateFeedbackStatus(item.id, 'in_progress')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        In behandeling
                      </button>
                      <button
                        onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved', 'Bedankt voor je feedback!')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        Opgelost
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'errors' && (
          <div className="space-y-4">
            {filteredErrors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">Geen fouten gevonden</p>
              </div>
            ) : (
              filteredErrors.map((error) => (
                <div key={error.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(error.level)}`}>
                          {error.level.toUpperCase()}
                        </span>
                        {error.resolved && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Opgelost
                          </span>
                        )}
                        {error.component && (
                          <span className="text-xs text-gray-500">
                            {error.component}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {error.message}
                      </h3>
                      <div className="text-sm text-gray-500 mb-2">
                        {formatDate(error.timestamp)} - {error.url}
                      </div>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                            Stack trace
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  {!error.resolved && (
                    <button
                      onClick={() => handleResolveError(error.id, 'Error reviewed and resolved')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                    >
                      Markeer als opgelost
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feedback Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Feedback Statistieken
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Totaal feedback:</span>
                  <span className="font-medium">{stats.feedback.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Laatste 30 dagen:</span>
                  <span className="font-medium">{stats.feedback.last30Days}</span>
                </div>
                {stats.feedback.averageResponseTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gem. reactietijd:</span>
                    <span className="font-medium">
                      {Math.round(stats.feedback.averageResponseTime)} uur
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Per status:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.feedback.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{status}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fout Statistieken
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Totaal fouten:</span>
                  <span className="font-medium">{stats.errors.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Onopgelost:</span>
                  <span className="font-medium text-red-600">{stats.errors.unresolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Laatste 24 uur:</span>
                  <span className="font-medium">{stats.errors.last24Hours}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Per level:</h4>
                <div className="space-y-1">
                  {Object.entries(stats.errors.byLevel).map(([level, count]) => (
                    <div key={level} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{level}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackDashboard;