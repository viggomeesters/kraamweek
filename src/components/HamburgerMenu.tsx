'use client';

import { useEffect } from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onHelpClick?: () => void;
  onFeedbackClick?: () => void;
  onAccountClick?: () => void;
  onSettingsClick?: () => void;
  userRole?: string;
}

export default function HamburgerMenu({ 
  isOpen, 
  onClose, 
  onHelpClick, 
  onFeedbackClick, 
  onAccountClick,
  onSettingsClick,
  userRole 
}: HamburgerMenuProps) {
  // Close menu when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.hamburger-menu') && !target.closest('.hamburger-button')) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Menu */}
      {isOpen && (
        <div className={`hamburger-menu fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Menu sluiten"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-6">
              <nav className="space-y-4">
                {/* Account/Profile */}
                {onAccountClick && (
                  <button
                    onClick={() => {
                      onAccountClick();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <span className="text-2xl">👤</span>
                    <div>
                      <div className="font-medium text-gray-900">Account</div>
                      <div className="text-sm text-gray-500">Profiel en gebruikersbeheer</div>
                    </div>
                  </button>
                )}

                {/* Settings */}
                {onSettingsClick && (
                  <button
                    onClick={() => {
                      onSettingsClick();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <div className="font-medium text-gray-900">Instellingen</div>
                      <div className="text-sm text-gray-500">App configuratie en voorkeuren</div>
                    </div>
                  </button>
                )}

                {/* Help */}
                {onHelpClick && (
                  <button
                    onClick={() => {
                      onHelpClick();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <span className="text-2xl">🆘</span>
                    <div>
                      <div className="font-medium text-gray-900">Help & FAQ</div>
                      <div className="text-sm text-gray-500">Hulp en veelgestelde vragen</div>
                    </div>
                  </button>
                )}

                {/* Feedback */}
                {onFeedbackClick && (
                  <button
                    onClick={() => {
                      onFeedbackClick();
                      onClose();
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                  >
                    <span className="text-2xl">💬</span>
                    <div>
                      <div className="font-medium text-gray-900">Feedback</div>
                      <div className="text-sm text-gray-500">Deel je ervaring met ons</div>
                    </div>
                  </button>
                )}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                <div className="font-medium">Kraamweek App</div>
                <div>Voor {userRole === 'kraamhulp' ? 'kraamhulp' : 'ouders'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}