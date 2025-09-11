'use client';

import { useState } from 'react';

interface FloatingActionButtonProps {
  onActionSelect: (action: string) => void;
  userRole: 'parents' | 'kraamhulp';
}

export default function FloatingActionButton({ onActionSelect, userRole }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parent actions (basic baby care + new mother mood and baby weight)
  const parentActions = [
    { id: 'sleep', icon: '😴', label: 'Slaap', color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'feeding', icon: '🍼', label: 'Voeding', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'temperature', icon: '🌡️', label: 'Temperatuur', color: 'bg-red-500 hover:bg-red-600' },
    { id: 'diaper', icon: '👶', label: 'Luier', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { id: 'weight', icon: '⚖️', label: 'Wegen', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { id: 'mother_mood', icon: '😊', label: 'Stemming moeder', color: 'bg-pink-500 hover:bg-pink-600' },
    { id: 'note', icon: '📝', label: 'Notitie', color: 'bg-green-500 hover:bg-green-600' },
  ];

  // Kraamhulp actions (more comprehensive care options)
  const kraamhulpActions = [
    { id: 'baby_care', icon: '👶', label: 'Baby verzorging', color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'mother_care', icon: '👩', label: 'Moeder verzorging', color: 'bg-pink-500 hover:bg-pink-600' },
    { id: 'temperature', icon: '🌡️', label: 'Temperatuur', color: 'bg-red-500 hover:bg-red-600' },
    { id: 'weight', icon: '⚖️', label: 'Baby wegen', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { id: 'observation', icon: '📋', label: 'Observatie', color: 'bg-green-500 hover:bg-green-600' },
    { id: 'task', icon: '✅', label: 'Taak toevoegen', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  const actions = userRole === 'parents' ? parentActions : kraamhulpActions;

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
        <div className="fixed bottom-20 right-4 z-50 space-y-3">
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
              <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-90 pointer-events-none">
                {action.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB - positioned higher to avoid covering tabs */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 transform ${
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