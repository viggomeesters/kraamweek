'use client';

import React, { useState } from 'react';
import { Button, Card, Alert } from '@/components/ui';
import NotificationService, { NotificationPermissionState } from '@/lib/notificationService';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

export default function NotificationPermissionModal({
  isOpen,
  onClose,
  onPermissionGranted
}: NotificationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(
    NotificationService.getPermissionState()
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const newState = await NotificationService.requestPermission();
      setPermissionState(newState);
      
      if (newState.permission === 'granted') {
        onPermissionGranted?.();
        onClose();
      } else if (newState.permission === 'denied') {
        setError('Notificaties zijn geweigerd. Je kunt dit later wijzigen in je browserinstellingen.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.testNotification();
    } catch {
      setError('Test notificatie kon niet worden verzonden');
    }
  };

  // If permission is already granted, show success state
  if (permissionState.permission === 'granted') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Notificaties ingeschakeld!
              </h2>
              <p className="text-gray-600">
                Je ontvangt nu belangrijke meldingen van de Kraamweek app.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Button
                onClick={handleTestNotification}
                variant="secondary"
                fullWidth
              >
                📱 Test notificatie versturen
              </Button>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="primary"
                fullWidth
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If permission was denied and we've asked before, show rationale
  if (permissionState.shouldShowRationale) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Notificaties zijn uitgeschakeld
              </h2>
              <p className="text-gray-600">
                Je hebt eerder notificaties geweigerd. Om ze in te schakelen:
              </p>
            </div>

            <Card className="mb-6">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="font-medium text-indigo-600">1.</span>
                  <span>Klik op het slotje 🔒 in de adresbalk</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="font-medium text-indigo-600">2.</span>
                  <span>Wijzig &apos;Notificaties&apos; naar &apos;Toestaan&apos;</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="font-medium text-indigo-600">3.</span>
                  <span>Vernieuw de pagina</span>
                </div>
              </div>
            </Card>

            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="secondary"
                fullWidth
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If browser doesn't support notifications
  if (!permissionState.isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Notificaties niet ondersteund
              </h2>
              <p className="text-gray-600">
                Je browser ondersteunt geen notificaties. Probeer een modernere browser zoals Chrome, Firefox of Safari.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="secondary"
                fullWidth
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main permission request flow
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sta notificaties toe
            </h2>
            <p className="text-gray-600">
              Ontvang belangrijke meldingen over de gezondheid en zorg van je baby
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Waarom notificaties?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-red-500 text-xl mt-0.5">🚨</span>
                <div>
                  <div className="font-medium text-gray-900">Kritieke gezondheidsalerts</div>
                  <div className="text-sm text-gray-600">Onmiddellijke waarschuwingen bij afwijkende waarden</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-blue-500 text-xl mt-0.5">🍼</span>
                <div>
                  <div className="font-medium text-gray-900">Voeding herinneringen</div>
                  <div className="text-sm text-gray-600">Mis geen voedingstijd meer</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500 text-xl mt-0.5">✅</span>
                <div>
                  <div className="font-medium text-gray-900">Taak herinneringen</div>
                  <div className="text-sm text-gray-600">Blijf op de hoogte van belangrijke taken</div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy info */}
          <Card className="mb-6 bg-gray-50">
            <div className="text-sm text-gray-700">
              <div className="flex items-start space-x-2 mb-2">
                <span className="text-indigo-600">🔒</span>
                <span className="font-medium">Privacy gewaarborgd</span>
              </div>
              <p>
                Notificaties worden alleen lokaal op je apparaat verzonden. 
                Geen persoonlijke gegevens worden gedeeld met externe servers.
              </p>
            </div>
          </Card>

          {/* Error message */}
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRequestPermission}
              loading={isRequesting}
              fullWidth
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isRequesting ? 'Bezig met aanvragen...' : '🔔 Notificaties toestaan'}
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              fullWidth
              disabled={isRequesting}
            >
              Misschien later
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            Je kunt notificaties later altijd in- of uitschakelen via de app instellingen
          </div>
        </div>
      </div>
    </div>
  );
}