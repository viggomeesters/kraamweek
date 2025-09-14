'use client';

import { useState } from 'react';

interface HelpProps {
  onBack: () => void;
  userRole?: 'ouders' | 'kraamhulp' | null;
}

export default function Help({ onBack, userRole }: HelpProps) {
  const [activeSection, setActiveSection] = useState<string>('algemeen');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const sections = [
    { id: 'algemeen', label: 'Algemeen', icon: '📖' },
    { id: 'registreren', label: 'Gegevens invoeren', icon: '📝' },
    { id: 'waarschuwingen', label: 'Waarschuwingen', icon: '⚠️' },
    { id: 'tijdformaat', label: 'Tijd & datum', icon: '🕐' },
    ...(userRole === 'kraamhulp' ? [{ id: 'kraamhulp', label: 'Voor kraamhulp', icon: '🩺' }] : [])
  ];

  const faqData = {
    algemeen: [
      {
        id: 'wat-is-app',
        question: 'Wat is de Kraamweek App?',
        answer: 'De Kraamweek App is een Nederlandse applicatie voor het bijhouden van de gezondheid van baby en moeder tijdens de kraamweek periode. Ouders kunnen voedingen, slaap, temperatuur en andere belangrijke gegevens registreren. Kraamhulp kan deze gegevens monitoren en taken beheren.'
      },
      {
        id: 'wie-gebruikt',
        question: 'Wie kan de app gebruiken?',
        answer: 'De app heeft twee gebruikersrollen: Ouders kunnen baby gegevens invoeren en hun eigen gezondheidsgegevens bijhouden. Kraamhulp heeft toegang tot alle gegevens, kan taken beheren en observaties toevoegen.'
      },
      {
        id: 'gegevens-opslag',
        question: 'Waar worden mijn gegevens opgeslagen?',
        answer: 'Alle gegevens worden lokaal in uw browser opgeslagen (localStorage). Er is geen externe database verbinding vereist. Dit betekent dat uw gegevens privé blijven op uw apparaat.'
      },
      {
        id: 'beginnen',
        question: 'Hoe begin ik met de app?',
        answer: 'Start met het aanmaken van een baby profiel in de Profiel sectie. Vul de geboortegegevens in en begin vervolgens met het registreren van dagelijkse activiteiten via de Logging sectie.'
      }
    ],
    registreren: [
      {
        id: 'voeding-invoeren',
        question: 'Hoe registreer ik voeding?',
        answer: 'Ga naar de Logging sectie en kies het voeding icoon (🍼). Selecteer het type voeding (fles, borstvoeding links/rechts/beide), vul de hoeveelheid in (ml) en eventuele notities. Druk op "Registreren" om op te slaan.'
      },
      {
        id: 'slaap-invoeren',
        question: 'Hoe registreer ik slaap?',
        answer: 'Klik op het slaap icoon (💤) in de Logging sectie. Vul de slaapduur in minuten in en voeg eventuele notities toe. U kunt ook de start- en eindtijd invullen als u dat liever heeft.'
      },
      {
        id: 'temperatuur',
        question: 'Hoe meet en registreer ik temperatuur?',
        answer: 'Gebruik een digitale thermometer en registreer de temperatuur in graden Celsius. De app waarschuwt automatisch bij temperaturen onder 36.0°C of boven 37.5°C voor baby\'s, en boven 38.0°C voor moeders.'
      },
      {
        id: 'luier-wijzigen',
        question: 'Hoe registreer ik luierversconing?',
        answer: 'Kies het luier icoon (🎯) en selecteer het type (nat, vol, beide) en de hoeveelheid (weinig, gemiddeld, veel). Dit helpt patronen te herkennen in het eet- en spijsverteringsgedrag.'
      }
    ],
    waarschuwingen: [
      {
        id: 'waarom-waarschuwingen',
        question: 'Waarom krijg ik waarschuwingen?',
        answer: 'De app monitort automatisch belangrijke gezondheidsparameters en waarschuwt bij afwijkende waarden. Dit helpt vroegtijdig problemen te signaleren tijdens de kwetsbare kraamweek periode.'
      },
      {
        id: 'temperatuur-waarschuwing',
        question: 'Wanneer krijg ik een temperatuur waarschuwing?',
        answer: 'Voor baby\'s: onder 36.0°C of boven 37.5°C. Voor moeders: boven 38.0°C. Deze waarden kunnen duiden op koorts of onderkoeling en vereisen aandacht van een zorgverlener.'
      },
      {
        id: 'voeding-waarschuwing',
        question: 'Wanneer waarschuwt de app voor voeding?',
        answer: 'Als er meer dan 4 uur tussen voedingen zit, krijgt u een waarschuwing. Regelmatige voeding is belangrijk voor de groei en ontwikkeling van de baby.'
      },
      {
        id: 'geelzucht-waarschuwing',
        question: 'Wat betekent een geelzucht waarschuwing?',
        answer: 'Bij geelzucht niveau 4 of 5 genereert de app een waarschuwing. Ernstige geelzucht kan schadelijk zijn en vereist medische beoordeling.'
      }
    ],
    tijdformaat: [
      {
        id: 'waarom-24-uur',
        question: 'Waarom gebruikt de app 24-uurs tijdnotatie?',
        answer: 'Voor medische nauwkeurigheid gebruikt de app uitsluitend 24-uurs tijdnotatie (bijv. 14:30 in plaats van 2:30 PM). Dit voorkomt verwarring en foutieve interpretatie van tijden.'
      },
      {
        id: 'tijd-invoeren',
        question: 'Hoe voer ik tijd in?',
        answer: 'Gebruik altijd het HH:MM formaat: 08:30 voor 8:30 \'s ochtends, 20:15 voor 8:15 \'s avonds. Gebruik voorloopnullen voor uren en minuten onder de 10.'
      },
      {
        id: 'datum-formaat',
        question: 'Welk datumformaat gebruikt de app?',
        answer: 'De app gebruikt het Nederlandse DD-MM-JJJJ formaat: 15-12-2024 voor 15 december 2024. Dit is consistent met Nederlandse medische standaarden.'
      }
    ],
    kraamhulp: [
      {
        id: 'dashboard-overzicht',
        question: 'Wat zie ik op het kraamhulp dashboard?',
        answer: 'Het dashboard toont een overzicht van baby statistieken, moeder gezondheidsgegevens, actieve waarschuwingen en taken. U kunt schakelen tussen verschillende secties via de tabbladen.'
      },
      {
        id: 'taken-beheren',
        question: 'Hoe beheer ik taken?',
        answer: 'Taken worden automatisch aangemaakt vanuit ouder vragen en todo notities. U kunt taken toewijzen, prioriteiten instellen en de status bijwerken. Gebruik de taken sectie voor volledig overzicht.'
      },
      {
        id: 'observaties-toevoegen',
        question: 'Hoe voeg ik observaties toe?',
        answer: 'In de Observaties sectie kunt u professionele waarnemingen vastleggen over bonding, omgeving, ondersteuning en gezondheid. Deze observaties helpen bij de evaluatie van de kraamzorg.'
      },
      {
        id: 'waarschuwingen-afhandelen',
        question: 'Hoe handel ik waarschuwingen af?',
        answer: 'Waarschuwingen verschijnen automatisch bij afwijkende waarden. U kunt deze bevestigen, aantekeningen toevoegen en ze markeren als afgehandeld. Kritieke waarschuwingen vereisen directe aandacht.'
      }
    ]
  };

  const currentFaqs = faqData[activeSection as keyof typeof faqData] || [];

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Help & FAQ</h1>
            </div>
            <div className="text-2xl">🆘</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium rounded-md ${
                    activeSection === section.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Veelgestelde vragen en uitleg over dit onderwerp
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {currentFaqs.map((faq) => (
                  <div key={faq.id} className="px-6 py-4">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h3 className="text-md font-medium text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Help Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Meer hulp nodig?</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">📞</span>
                  <div>
                    <strong>Medische vragen:</strong> Neem bij zorgen over de gezondheid van baby of moeder altijd contact op met uw verloskundige, kraamhulp of huisarts.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">🚨</span>
                  <div>
                    <strong>Noodgevallen:</strong> Bij acute situaties belt u direct 112 of gaat u naar de spoedeisende hulp.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">🕐</span>
                  <div>
                    <strong>24-uurs tijdnotatie:</strong> De app gebruikt uitsluitend 24-uurs tijd (14:30) voor medische nauwkeurigheid.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}