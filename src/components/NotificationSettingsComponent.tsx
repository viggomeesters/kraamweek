'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Alert } from '@/components/ui';
import NotificationService, { NotificationSettings, NotificationPermissionState } from '@/lib/notificationService';
import NotificationPermissionModal from './NotificationPermissionModal';

interface NotificationSettingsComponentProps {
  className?: string;
}

export default function NotificationSettingsComponent({ className }: NotificationSettingsComponentProps) {
  const [settings, setSettings] = useState<NotificationSettings>(
    NotificationService.getNotificationSettings()
  );
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(
    NotificationService.getPermissionState()
  );
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Listen for permission changes
    const handlePermissionChange = (newState: NotificationPermissionState) => {
      setPermissionState(newState);
    };

    NotificationService.addPermissionChangeListener(handlePermissionChange);

    return () => {
      NotificationService.removePermissionChangeListener(handlePermissionChange);
    };
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      NotificationService.saveNotificationSettings(settings);
      setMessage({ text: 'Notificatie instellingen opgeslagen', type: 'success' });
    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : 'Er is een fout opgetreden', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.testNotification();
      setMessage({ text: 'Test notificatie verzonden!', type: 'success' });
    } catch {
      setMessage({ 
        text: 'Test notificatie kon niet worden verzonden', 
        type: 'error' 
      });
    }
  };

  const handleToggleEnabled = () => {
    if (!settings.enabled && permissionState.permission !== 'granted') {
      // Show permission modal if trying to enable notifications without permission
      setShowPermissionModal(true);
    } else {
      setSettings({ ...settings, enabled: !settings.enabled });
    }
  };

  const handleCategoryToggle = (category: keyof NotificationSettings['categories']) => {
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category],
      },
    });
  };

  const handleQuietHoursToggle = () => {
    setSettings({
      ...settings,
      quietHours: {
        ...settings.quietHours,
        enabled: !settings.quietHours.enabled,
      },
    });
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    setSettings({
      ...settings,
      quietHours: {
        ...settings.quietHours,
        [field]: value,
      },
    });
  };

  const getPermissionStatusBadge = () => {
    switch (permissionState.permission) {
      case 'granted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Toegestaan
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Geweigerd
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ⏳ Niet gevraagd
          </span>
        );
    }
  };

  return (
    <div className={className}>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📱 Notificatie Instellingen
        </h2>

        {message && (
          <Alert 
            variant={message.type === 'success' ? 'success' : 'error'}
            className="mb-4"
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <div className="space-y-6">
          {/* Permission Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">Toestemming status</h3>
                <p className="text-sm text-gray-600">
                  {!permissionState.isSupported 
                    ? 'Je browser ondersteunt geen notificaties'
                    : permissionState.permission === 'granted'
                    ? 'Je ontvangt notificaties van deze app'
                    : 'Geef toestemming om notificaties te ontvangen'
                  }
                </p>
              </div>
              {getPermissionStatusBadge()}
            </div>

            {permissionState.isSupported && permissionState.permission !== 'granted' && (
              <Button
                onClick={() => setShowPermissionModal(true)}
                variant="primary"
                size="sm"
              >
                🔔 Toestemming vragen
              </Button>
            )}

            {permissionState.permission === 'granted' && (
              <Button
                onClick={handleTestNotification}
                variant="secondary"
                size="sm"
              >
                📱 Test notificatie
              </Button>
            )}
          </div>

          {/* Global Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notificaties inschakelen
              </label>
              <p className="text-sm text-gray-500">
                Hoofdschakelaar voor alle notificaties
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled && permissionState.permission === 'granted'}
                onChange={handleToggleEnabled}
                disabled={!permissionState.isSupported}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Category Settings */}
          {settings.enabled && permissionState.permission === 'granted' && (
            <>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notificatie categorieën</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-red-500 text-lg">🚨</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Gezondheidsalerts</div>
                        <div className="text-xs text-gray-600">Kritieke waarschuwingen bij afwijkende waarden</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.categories.healthAlerts}
                        onChange={() => handleCategoryToggle('healthAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-500 text-lg">🍼</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Voeding herinneringen</div>
                        <div className="text-xs text-gray-600">Herinneringen voor volgende voeding</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.categories.feedingReminders}
                        onChange={() => handleCategoryToggle('feedingReminders')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-orange-500 text-lg">🌡️</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Temperatuur alerts</div>
                        <div className="text-xs text-gray-600">Waarschuwingen bij koorts of te lage temperatuur</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.categories.temperatureAlerts}
                        onChange={() => handleCategoryToggle('temperatureAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-green-500 text-lg">✅</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Taak herinneringen</div>
                        <div className="text-xs text-gray-600">Herinneringen voor belangrijke taken</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.categories.taskReminders}
                        onChange={() => handleCategoryToggle('taskReminders')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-red-600 text-lg">🚨</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Noodmeldingen</div>
                        <div className="text-xs text-gray-600">Kritieke alerts die altijd doorgelaten worden</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.categories.emergencyAlerts}
                        onChange={() => handleCategoryToggle('emergencyAlerts')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">🌙 Stille uren</h3>
                    <p className="text-sm text-gray-600">Geen notificaties tijdens slaapuren (behalve noodmeldingen)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={handleQuietHoursToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start tijd
                      </label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Eind tijd
                      </label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sound and Vibration */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">🔊 Geluid en trillen</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Geluid inschakelen</div>
                      <div className="text-xs text-gray-600">Standaard notificatiegeluid afspelen</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Trillen inschakelen</div>
                      <div className="text-xs text-gray-600">Apparaat laten trillen bij notificaties</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.vibrationEnabled}
                        onChange={(e) => setSettings({ ...settings, vibrationEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleSaveSettings}
              loading={isLoading}
              fullWidth
            >
              💾 Instellingen opslaan
            </Button>
          </div>
        </div>
      </Card>

      {/* Permission Modal */}
      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onPermissionGranted={() => {
          setSettings({ ...settings, enabled: true });
          setMessage({ text: 'Notificaties succesvol ingeschakeld!', type: 'success' });
        }}
      />
    </div>
  );
}