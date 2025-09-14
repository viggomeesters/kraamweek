'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'pulse' | 'outro'>('intro');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('pulse');
    }, 800);

    const timer2 = setTimeout(() => {
      setAnimationPhase('outro');
    }, 2200);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-white rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="text-center text-white z-10">
        {/* Logo */}
        <div 
          className={`mb-6 transition-all duration-1000 ease-out ${
            animationPhase === 'intro' 
              ? 'transform scale-50 opacity-0 translate-y-8' 
              : animationPhase === 'pulse'
              ? 'transform scale-100 opacity-100 translate-y-0'
              : 'transform scale-110 opacity-90 translate-y-0'
          }`}
        >
          <div className="relative">
            <div className="text-8xl mb-4 filter drop-shadow-lg">
              👶
            </div>
            {/* Glow effect behind emoji */}
            <div className="absolute inset-0 text-8xl mb-4 opacity-30 blur-md">
              👶
            </div>
          </div>
        </div>

        {/* App Name */}
        <div 
          className={`transition-all duration-1000 delay-300 ease-out ${
            animationPhase === 'intro' 
              ? 'transform opacity-0 translate-y-6' 
              : animationPhase === 'pulse'
              ? 'transform opacity-100 translate-y-0'
              : 'transform opacity-90 translate-y-0'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-wide">
            Kraamweek
          </h1>
          <div className="h-1 w-24 bg-white mx-auto rounded-full mb-4 opacity-80"></div>
          <p className="text-lg md:text-xl opacity-90 font-light tracking-wide">
            Nederlandse Kraamzorg App
          </p>
        </div>

        {/* Subtitle */}
        <div 
          className={`mt-8 transition-all duration-1000 delay-600 ease-out ${
            animationPhase === 'intro' 
              ? 'transform opacity-0 translate-y-4' 
              : animationPhase === 'pulse'
              ? 'transform opacity-100 translate-y-0'
              : 'transform opacity-80 translate-y-0'
          }`}
        >
          <p className="text-base opacity-80 max-w-md mx-auto leading-relaxed">
            Bijhouden van de gezondheid van baby en moeder tijdens de kraamweek
          </p>
        </div>

        {/* Loading indicator */}
        <div 
          className={`mt-12 flex justify-center transition-all duration-1000 delay-900 ease-out ${
            animationPhase === 'intro' 
              ? 'transform opacity-0 translate-y-4' 
              : 'transform opacity-100 translate-y-0'
          }`}
        >
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce opacity-75"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce opacity-75" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce opacity-75" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      {/* Subtle pulsing overlay for breathing effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-700/20 transition-opacity duration-2000 ${
          animationPhase === 'pulse' ? 'animate-pulse' : ''
        }`}
      ></div>
    </div>
  );
}