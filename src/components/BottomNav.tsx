'use client';

interface BottomNavProps {
  activeTab: 'profile' | 'overview' | 'logging' | 'analytics' | 'user';
  onTabChange: (tab: 'profile' | 'overview' | 'logging' | 'analytics' | 'user') => void;
  onHelpClick?: () => void;
  onFeedbackClick?: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onHelpClick, onFeedbackClick }: BottomNavProps) {
  const navItems = [
    { id: 'profile' as const, label: 'Profiel', icon: '👶' },
    { id: 'overview' as const, label: 'Overzicht', icon: '📋' },
    { id: 'logging' as const, label: 'Logging', icon: '➕' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
    { id: 'user' as const, label: 'Account', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 rounded-lg mx-1 min-h-[3.5rem] touch-manipulation ${
              activeTab === item.id
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium leading-tight">{item.label}</span>
          </button>
        ))}
        
        {/* Help Button */}
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="flex flex-col items-center justify-center w-12 h-full space-y-1 transition-colors duration-200 rounded-lg mx-1 min-h-[3.5rem] touch-manipulation text-gray-400 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100"
            title="Help & FAQ"
          >
            <span className="text-lg">🆘</span>
            <span className="text-xs font-medium leading-tight">Help</span>
          </button>
        )}

        {/* Feedback Button */}
        {onFeedbackClick && (
          <button
            onClick={onFeedbackClick}
            className="flex flex-col items-center justify-center w-12 h-full space-y-1 transition-colors duration-200 rounded-lg mx-1 min-h-[3.5rem] touch-manipulation text-gray-400 hover:text-success-600 hover:bg-success-50 active:bg-success-100"
            title="Feedback versturen"
          >
            <span className="text-lg">💬</span>
            <span className="text-xs font-medium leading-tight">Feedback</span>
          </button>
        )}
      </div>
    </nav>
  );
}