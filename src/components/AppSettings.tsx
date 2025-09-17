'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Alert } from '@/components/ui';
import NotificationSettingsComponent from '@/components/NotificationSettingsComponent';

interface AppSettingsProps {
  onBack?: () => void;
}

export default function AppSettings({ onBack }: AppSettingsProps) {
  const [settings, setSettings] = useState({
    dataRetention: '30', // days
    theme: 'light',
    autoBackup: true,
    language: 'nl'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('kraamweek-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsed }));
      } catch (error) {
        console.error('Failed to load app settings:', error);
      }
    }
  }, []); // Empty dependency array is correct here - we only want to load once on mount

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('kraamweek-app-settings', JSON.stringify(settings));
      setMessage({ text: 'Instellingen succesvol opgeslagen', type: 'success' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ text: 'Er is een fout opgetreden bij het opslaan', type: 'error' });
    }

    setIsLoading(false);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      dataRetention: '30',
      theme: 'light',
      autoBackup: true,
      language: 'nl'
    };
    setSettings(defaultSettings);
    setMessage({ text: 'Instellingen gereset naar standaardwaarden', type: 'success' });
  };

  const handleExportData = () => {
    try {
      const data = localStorage.getItem('kraamweek-data');
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kraamweek-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMessage({ text: 'Data succesvol geëxporteerd', type: 'success' });
      } else {
        setMessage({ text: 'Geen data gevonden om te exporteren', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      setMessage({ text: 'Er is een fout opgetreden bij het exporteren', type: 'error' });
    }
  };

  const handleClearData = () => {
    if (window.confirm('Weet je zeker dat je alle data wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
      try {
        localStorage.removeItem('kraamweek-data');
        setMessage({ text: 'Alle data is gewist', type: 'success' });
      } catch (error) {
        console.error('Failed to clear data:', error);
        setMessage({ text: 'Er is een fout opgetreden bij het wissen', type: 'error' });
      }
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">App Instellingen</h1>

        {message && (
          <Alert 
            variant={message.type === 'success' ? 'success' : 'error'}
            className="mb-4"
          >
            {message.text}
          </Alert>
        )}

        {/* Notification Settings */}
        <NotificationSettingsComponent className="mb-6" />

        {/* General Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Algemene Instellingen</h2>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thema
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="light">Licht</option>
                <option value="dark">Donker</option>
                <option value="auto">Automatisch</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taal
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Beheer</h2>
          
          <div className="space-y-4">
            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Automatische backup
                </label>
                <p className="text-sm text-gray-500">Automatisch data backup naar lokale opslag</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Data Retention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data bewaarperiode (dagen)
              </label>
              <select
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7">7 dagen</option>
                <option value="30">30 dagen</option>
                <option value="90">90 dagen</option>
                <option value="365">1 jaar</option>
                <option value="unlimited">Onbeperkt</option>
              </select>
            </div>

            {/* Data Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleExportData}
                variant="secondary"
                fullWidth
                className="flex items-center justify-center space-x-2"
              >
                <span>📥</span>
                <span>Data Exporteren</span>
              </Button>
              
              <Button
                onClick={handleClearData}
                variant="danger"
                fullWidth
                className="flex items-center justify-center space-x-2"
              >
                <span>🗑️</span>
                <span>Alle Data Wissen</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveSettings}
            loading={isLoading}
            fullWidth
          >
            Instellingen Opslaan
          </Button>
          
          <Button
            onClick={handleResetSettings}
            variant="secondary"
            disabled={isLoading}
            fullWidth
          >
            Standaard Instellingen
          </Button>

          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              fullWidth
            >
              Terug
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}