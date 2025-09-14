'use client';

interface MainNavProps {
  activeTab: 'profile' | 'overview' | 'logging' | 'analytics';
  onTabChange: (tab: 'profile' | 'overview' | 'logging' | 'analytics') => void;
}

export default function MainNav({ activeTab, onTabChange }: MainNavProps) {
  const navItems = [
    { id: 'profile' as const, label: 'Profiel', icon: '👶' },
    { id: 'overview' as const, label: 'Overzicht', icon: '📋' },
    { id: 'logging' as const, label: 'Logging', icon: '➕' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 rounded-lg mx-1 min-h-[3.5rem] touch-manipulation ${
              activeTab === item.id
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}