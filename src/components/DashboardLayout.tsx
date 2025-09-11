'use client';

import { User } from '@/types';
import { DataService } from '@/lib/dataService';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const handleLogout = () => {
    DataService.clearUser();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Mobile-first Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Kraamweek
              </h1>
              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                {user.role === 'parents' ? 'Ouders' : 'Kraamhulp'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors p-2"
                aria-label="Uitloggen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile optimized */}
      <main className="px-4 py-4 max-w-md mx-auto lg:max-w-4xl">
        {children}
      </main>
    </div>
  );
}