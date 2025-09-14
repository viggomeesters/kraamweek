'use client';

import { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
  userRole: 'ouders' | 'kraamhulp';
}

export default function Onboarding({ onComplete, userRole }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  const parentSteps = [
    {
      title: 'Welkom bij Kraamweek App',
      icon: '👶',
      content: (
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              De <strong className="text-blue-600">Nederlandse kraamzorg app</strong> voor het bijhouden van de gezondheid van baby en moeder tijdens de kraamweek.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-semibold text-blue-800">Eenvoudig</h3>
              </div>
              <p className="text-sm text-blue-700">
                Intuïtieve interface voor snelle registratie van belangrijke momenten
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🩺</span>
                <h3 className="font-semibold text-green-800">Professioneel</h3>
              </div>
              <p className="text-sm text-green-700">
                Ontwikkeld volgens Nederlandse kraamzorg richtlijnen
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
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
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed">
              Begin met het aanmaken van een <strong className="text-indigo-600">baby profiel</strong> met belangrijke geboortegegevens.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="font-semibold text-indigo-800 mb-4 flex items-center">
              <span className="text-xl mr-2">📋</span>
              Wat vullen we in?
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-sm font-medium">Naam en geboortedatum</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-sm font-medium">Geboortegewicht en -lengte</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-sm font-medium">Bijzonderheden bij de geboorte</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-lg">✓</span>
                <span className="text-sm font-medium">Hoofdomvang (optioneel)</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-xl mt-1">💡</span>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Tip</h4>
                <p className="text-sm text-blue-700">
                  Deze gegevens helpen bij het monitoren van de groei en ontwikkeling van je baby.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Dagelijkse registratie',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed">
              Houd belangrijke momenten bij via de <strong className="text-purple-600">logging sectie</strong>:
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">🍼</span>
                <span className="text-sm font-medium text-orange-800">Voeding</span>
                <p className="text-xs text-orange-600 mt-1">Borst, fles & tijden</p>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">💤</span>
                <span className="text-sm font-medium text-indigo-800">Slaap</span>
                <p className="text-xs text-indigo-600 mt-1">Start & eindtijd</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">🌡️</span>
                <span className="text-sm font-medium text-red-800">Temperatuur</span>
                <p className="text-xs text-red-600 mt-1">Baby & moeder</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">🎯</span>
                <span className="text-sm font-medium text-green-800">Luier</span>
                <p className="text-xs text-green-600 mt-1">Nat, ontlasting</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">💛</span>
                <span className="text-sm font-medium text-yellow-800">Geelzucht</span>
                <p className="text-xs text-yellow-600 mt-1">Niveau 1-5</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-center">
                <span className="text-3xl block mb-2">📝</span>
                <span className="text-sm font-medium text-gray-800">Notities</span>
                <p className="text-xs text-gray-600 mt-1">Observaties & vragen</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
            <div className="flex items-start space-x-3">
              <span className="text-amber-500 text-xl mt-1">⏰</span>
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Belangrijk</h4>
                <p className="text-sm text-amber-700">
                  Alle tijden worden in 24-uurs formaat weergegeven (bijv. 14:30). Je kunt snel registreren met één druk op de knop!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Overzicht en trends',
      icon: '📈',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 text-lg leading-relaxed">
              Bekijk al je registraties en patronen in het <strong className="text-blue-600">overzicht</strong>:
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-4">
                <span className="text-blue-500 text-3xl">📋</span>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Tijdlijn van gebeurtenissen</h3>
                  <p className="text-sm text-blue-600">Chronologisch overzicht van alle baby activiteiten</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-4">
                <span className="text-purple-500 text-3xl">📊</span>
                <div>
                  <h3 className="font-semibold text-purple-800 mb-1">Grafieken en trends</h3>
                  <p className="text-sm text-purple-600">Visuele weergave van voeding-, slaap- en groeipatronen</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-5 rounded-xl border border-red-200">
              <div className="flex items-center space-x-4">
                <span className="text-red-500 text-3xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Automatische waarschuwingen</h3>
                  <p className="text-sm text-red-600">Alerts bij afwijkende waarden of lange periodes zonder activiteit</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl mt-1">🤖</span>
              <div>
                <h4 className="font-medium text-green-800 mb-1">Slim systeem</h4>
                <p className="text-sm text-green-700">
                  De app genereert automatisch waarschuwingen bij hoge temperatuur (&gt;37.5°C), lange periodes zonder voeding (&gt;4u), of afwijkende geelzucht niveaus.
                </p>
              </div>
            </div>
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
        <div className="text-center space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-indigo-600">Professionele kraamzorg app</strong> voor het monitoren en begeleiden van baby&apos;s en moeders tijdens de kraamweek.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold text-indigo-800">Dashboard</h3>
              </div>
              <p className="text-sm text-indigo-700">
                Compleet overzicht van alle gezondheidsgegevens en trends
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🚨</span>
                <h3 className="font-semibold text-purple-800">Alerts</h3>
              </div>
              <p className="text-sm text-purple-700">
                Automatische waarschuwingen bij afwijkende waarden
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
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
    setSlideDirection('forward');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    setSlideDirection('backward');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-4 w-16 h-16 bg-white rounded-full blur-xl"></div>
            <div className="absolute bottom-2 left-4 w-12 h-12 bg-white rounded-full blur-lg"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-3 filter drop-shadow-lg animate-pulse">
              {currentStepData.icon}
            </div>
            <h1 className="text-2xl font-bold mb-4 tracking-wide">
              {currentStepData.title}
            </h1>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-3">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ease-out ${
                    index <= currentStep 
                      ? 'w-8 h-3 bg-white rounded-full' 
                      : 'w-3 h-3 bg-white/30 rounded-full'
                  }`}
                />
              ))}
            </div>
            
            {/* Step counter */}
            <p className="text-sm opacity-90 mt-3">
              Stap {currentStep + 1} van {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px] relative overflow-hidden">
          <div 
            className={`transition-all duration-500 ease-out ${
              slideDirection === 'forward' 
                ? 'transform translate-x-0 opacity-100' 
                : 'transform translate-x-0 opacity-100'
            }`}
          >
            {currentStepData.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-100">
          <button
            onClick={skipOnboarding}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            Overslaan
          </button>
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>←</span>
                <span>Vorige</span>
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <span>{currentStep === steps.length - 1 ? 'Beginnen' : 'Volgende'}</span>
              {currentStep < steps.length - 1 && <span>→</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}