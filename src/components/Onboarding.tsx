'use client';

import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
  userRole: 'ouders' | 'kraamhulp';
}

export default function Onboarding({ onComplete, userRole }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const parentSteps = [
    {
      title: 'Welkom bij Kraamweek App',
      icon: '👶',
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            De Nederlandse kraamzorg app voor het bijhouden van de gezondheid van baby en moeder tijdens de kraamweek.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Voor ouders:</strong> Registreer eenvoudig voeding, slaap, luierversconing en andere belangrijke momenten van je baby.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Baby profiel instellen',
      icon: '📝',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Begin met het aanmaken van een baby profiel met belangrijke geboortegegevens.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Naam en geboortedatum</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Geboortegewicht en -lengte</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Bijzonderheden bij de geboorte</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Dagelijkse registratie',
      icon: '📊',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Houd belangrijke momenten bij via de logging sectie:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span>🍼</span>
              <span>Voeding</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💤</span>
              <span>Slaap</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌡️</span>
              <span>Temperatuur</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Luier</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💛</span>
              <span>Geelzucht</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📝</span>
              <span>Notities</span>
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Let op:</strong> Alle tijden worden in 24-uurs formaat weergegeven (bijv. 14:30).
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Overzicht en trends',
      icon: '📈',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Bekijk al je registraties en patronen in het overzicht:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">📋</span>
              <span className="text-sm">Tijdlijn van alle gebeurtenissen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">📊</span>
              <span className="text-sm">Grafieken en trends</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">⚠️</span>
              <span className="text-sm">Automatische waarschuwingen</span>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-800">
              De app genereert automatisch waarschuwingen bij afwijkende waarden zoals hoge temperatuur of lange periodes zonder voeding.
            </p>
          </div>
        </div>
      )
    }
  ];

  const kraamhulpSteps = [
    {
      title: 'Welkom bij Kraamweek App',
      icon: '🩺',
      content: (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            Professionele kraamzorg app voor het monitoren en begeleiden van baby&apos;s en moeders tijdens de kraamweek.
          </p>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>Voor kraamhulp:</strong> Krijg een compleet overzicht van alle registraties, beheer taken en monitor de gezondheid van moeder en baby.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Dashboard overzicht',
      icon: '📊',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Het dashboard geeft je een volledig overzicht van de kraamzorg situatie:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">👶</span>
              <span className="text-sm">Baby statistieken en trends</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">👩</span>
              <span className="text-sm">Moeder gezondheidsgegevens</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">⚠️</span>
              <span className="text-sm">Actieve waarschuwingen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">✅</span>
              <span className="text-sm">Taken en observaties</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Waarschuwingen systeem',
      icon: '🚨',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            De app monitort automatisch belangrijke gezondheidsparameters:
          </p>
          <div className="space-y-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-red-500">🌡️</span>
                <span className="text-sm font-medium">Temperatuur</span>
              </div>
              <p className="text-xs text-red-700">Baby: &lt;36.0°C of &gt;37.5°C | Moeder: &gt;38.0°C</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-yellow-500">💛</span>
                <span className="text-sm font-medium">Geelzucht</span>
              </div>
              <p className="text-xs text-yellow-700">Waarschuwing bij niveau 4-5</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-blue-500">🍼</span>
                <span className="text-sm font-medium">Voeding</span>
              </div>
              <p className="text-xs text-blue-700">Waarschuwing bij &gt;4 uur tussen voedingen</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Taken beheer',
      icon: '📋',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Beheer en volg taken en observaties:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Ouder vragen worden automatisch taken</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Todo&apos;s uit notities krijgen prioriteit</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm">Voeg observaties toe voor evaluatie</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-700">
              Gebruik de observaties sectie om belangrijke waarnemingen over bonding, omgeving en ondersteuning vast te leggen.
            </p>
          </div>
        </div>
      )
    }
  ];

  const steps = userRole === 'kraamhulp' ? kraamhulpSteps : parentSteps;
  const currentStepData = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 text-center">
          <div className="text-4xl mb-2">{currentStepData.icon}</div>
          <h1 className="text-xl font-bold">{currentStepData.title}</h1>
          <div className="flex justify-center mt-3 space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <button
            onClick={skipOnboarding}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Overslaan
          </button>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Vorige
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {currentStep === steps.length - 1 ? 'Beginnen' : 'Volgende'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}