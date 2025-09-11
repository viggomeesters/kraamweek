'use client';

import { useState } from 'react';

interface FloatingActionButtonProps {
  onActionSelect: (action: string) => void;
}

export default function FloatingActionButton({ onActionSelect }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'sleep', icon: '😴', label: 'Slaap', color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'feeding', icon: '🍼', label: 'Voeding', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'temperature', icon: '🌡️', label: 'Temperatuur', color: 'bg-red-500 hover:bg-red-600' },
    { id: 'diaper', icon: '👶', label: 'Luier', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { id: 'note', icon: '📝', label: 'Notitie', color: 'bg-green-500 hover:bg-green-600' },
  ];

  const handleActionSelect = (actionId: string) => {
    onActionSelect(actionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons (when open) */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-50 space-y-3">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className={`transition-all duration-300 ease-out transform ${
                isOpen 
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-4 opacity-0 scale-95'
              }`}
              style={{ 
                transitionDelay: `${index * 50}ms` 
              }}
            >
              <button
                onClick={() => handleActionSelect(action.id)}
                className={`${action.color} text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white`}
                title={action.label}
              >
                <span className="text-lg">{action.icon}</span>
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-90">
                {action.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 transform ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        aria-label={isOpen ? 'Sluiten' : 'Registratie toevoegen'}
      >
        <span className="text-2xl">
          {isOpen ? '×' : '+'}
        </span>
      </button>
    </>
  );
}