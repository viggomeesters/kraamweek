'use client';

import React, { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';

interface SuccessFeedbackPromptProps {
  isVisible: boolean;
  onClose: () => void;
  successMessage: string;
  showFeedbackPrompt?: boolean;
}

export const SuccessFeedbackPrompt: React.FC<SuccessFeedbackPromptProps> = ({
  isVisible,
  onClose,
  successMessage,
  showFeedbackPrompt = true
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Check if user has recently provided feedback to avoid over-prompting
  const shouldShowFeedbackPrompt = () => {
    if (!showFeedbackPrompt) return false;
    
    const lastFeedbackPrompt = localStorage.getItem('lastFeedbackPrompt');
    const lastPromptTime = lastFeedbackPrompt ? new Date(lastFeedbackPrompt).getTime() : 0;
    const now = new Date().getTime();
    const hoursSinceLastPrompt = (now - lastPromptTime) / (1000 * 60 * 60);
    
    // Only show feedback prompt if it's been more than 24 hours since last prompt
    return hoursSinceLastPrompt > 24;
  };

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
    localStorage.setItem('lastFeedbackPrompt', new Date().toISOString());
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackModal(false);
    onClose();
  };

  const handleDismiss = () => {
    setPromptDismissed(true);
    onClose();
  };

  if (!isVisible || promptDismissed) return null;

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm mx-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {successMessage}
              </p>
              
              {shouldShowFeedbackPrompt() && (
                <p className="text-xs text-gray-600 mb-3">
                  Hoe was je ervaring? Je feedback helpt ons de app te verbeteren.
                </p>
              )}

              <div className="flex items-center space-x-2">
                {shouldShowFeedbackPrompt() && (
                  <button
                    onClick={handleFeedbackClick}
                    className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Feedback geven
                  </button>
                )}
                
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center px-2.5 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sluiten
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
              aria-label="Melding sluiten"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
};

export default SuccessFeedbackPrompt;