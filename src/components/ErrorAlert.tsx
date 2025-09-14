'use client';

import React, { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';

interface ErrorAlertProps {
  error: Error | string;
  errorId?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  showFeedbackOption?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  errorId,
  onDismiss,
  onRetry,
  showFeedbackOption = true
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
                        errorMessage.toLowerCase().includes('fetch');

  const getErrorSuggestion = () => {
    if (isNetworkError) {
      return 'Controleer je internetverbinding en probeer het opnieuw.';
    }
    return 'Probeer de actie opnieuw uit te voeren.';
  };

  const handleFeedbackSuccess = () => {
    setShowFeedback(false);
    onDismiss?.();
  };

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg 
              className="h-5 w-5 text-red-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Er is een fout opgetreden
            </h3>
            
            <div className="mt-1 text-sm text-red-700">
              <p className="mb-2">{errorMessage}</p>
              <p className="text-red-600">{getErrorSuggestion()}</p>
            </div>

            {errorId && (
              <div className="mt-2">
                <p className="text-xs text-red-600">
                  Fout ID: <code className="bg-red-100 px-1 py-0.5 rounded text-xs">{errorId}</code>
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Probeer opnieuw
                </button>
              )}

              {showFeedbackOption && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Meld probleem
                </button>
              )}

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sluiten
                </button>
              )}
            </div>
          </div>

          {onDismiss && (
            <div className="ml-auto pl-3">
              <button
                onClick={onDismiss}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
                aria-label="Foutmelding sluiten"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {showFeedback && (
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
};

export default ErrorAlert;