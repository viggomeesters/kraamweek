'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}: ToastProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isShowing) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-success-500',
          borderColor: 'border-success-400'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-error-500',
          borderColor: 'border-error-400'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-info-500',
          borderColor: 'border-info-400'
        };
      default:
        return {
          icon: '✅',
          bgColor: 'bg-success-500',
          borderColor: 'border-success-400'
        };
    }
  };

  const { icon, bgColor, borderColor } = getIconAndColors();

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isShowing 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div
        className={`${bgColor} ${borderColor} border text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-h-[3.5rem] max-w-sm mx-4`}
      >
        <span className="text-xl flex-shrink-0" role="img" aria-label="status">
          {icon}
        </span>
        <span className="font-medium text-sm leading-tight">
          {message}
        </span>
      </div>
    </div>
  );
}