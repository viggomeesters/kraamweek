'use client';

interface TopNavProps {
  title?: string;
  onMenuClick: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function TopNav({ title = "Kraamweek", onMenuClick, showBackButton, onBackClick }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 safe-area-inset-top">
      <div className="flex items-center justify-between h-16 px-4 max-w-md mx-auto">
        {/* Left side - Back button or Logo */}
        <div className="flex items-center">
          {showBackButton && onBackClick ? (
            <button
              onClick={onBackClick}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Terug"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👶</span>
              <span className="font-semibold text-gray-900 text-lg">{title}</span>
            </div>
          )}
        </div>

        {/* Right side - Hamburger menu button */}
        <button
          onClick={onMenuClick}
          className="hamburger-button flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Menu openen"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}