'use client';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'parents' | 'kraamhulp';
}

export default function BottomNavigation({ activeTab, onTabChange, userRole }: BottomNavigationProps) {
  // Navigation items for parents
  const parentNavItems = [
    { id: 'recent', label: 'Recent', icon: '🕒' },
    { id: 'overview', label: 'Overzicht', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'profile', label: 'Profiel', icon: '👶' },
  ];

  // Navigation items for kraamhulp
  const kraamhulpNavItems = [
    { id: 'recent', label: 'Recent', icon: '🕒' },
    { id: 'overview', label: 'Baby', icon: '👶' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'profile', label: 'Profiel', icon: '📄' },
  ];

  const navItems = userRole === 'parents' ? parentNavItems : kraamhulpNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
              activeTab === item.id
                ? 'text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}