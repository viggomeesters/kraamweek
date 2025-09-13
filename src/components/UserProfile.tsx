'use client';

import { useState } from 'react';
import { User } from '@/types';

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<{ success: boolean; error?: string }>;
  onProfileUpdate: (updates: Partial<Pick<User, 'naam' | 'rol'>>) => Promise<{ success: boolean; error?: string }>;
}

export default function UserProfile({ user, onLogout, onProfileUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    naam: user.naam,
    rol: user.rol,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    const result = await onProfileUpdate({
      naam: formData.naam.trim(),
      rol: formData.rol,
    });

    if (result.success) {
      setMessage({ text: 'Profiel succesvol bijgewerkt', type: 'success' });
      setIsEditing(false);
    } else {
      setMessage({ text: result.error || 'Er is een fout opgetreden', type: 'error' });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      naam: user.naam,
      rol: user.rol,
    });
    setIsEditing(false);
    setMessage(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await onLogout();
    if (!result.success) {
      setMessage({ text: result.error || 'Uitloggen mislukt', type: 'error' });
      setIsLoading(false);
    }
    // If successful, the auth context will handle the state change
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gebruikersprofiel</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Bewerken
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.naam}
              onChange={(e) => setFormData(prev => ({ ...prev, naam: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Uw volledige naam"
            />
          ) : (
            <p className="text-gray-900">{user.naam}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <p className="text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          {isEditing ? (
            <select
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as 'ouders' | 'kraamhulp' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ouders">Ouder(s)</option>
              <option value="kraamhulp">Kraamhulp</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {user.rol === 'ouders' ? 'Ouder(s)' : 'Kraamhulp'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lid sinds
          </label>
          <p className="text-gray-500 text-sm">
            {new Date(user.createdAt).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {user.lastLoginAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laatste login
            </label>
            <p className="text-gray-500 text-sm">
              {new Date(user.lastLoginAt).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.naam.trim()}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
          >
            Annuleren
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uitloggen...' : 'Uitloggen'}
          </button>
        </div>
      )}
    </div>
  );
}