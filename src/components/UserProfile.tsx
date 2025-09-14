'use client';

import { useState } from 'react';
import { User } from '@/types';
import { Button, Input, Select, Card, Alert } from '@/components/ui';
import Avatar from '@/components/Avatar';

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<{ success: boolean; error?: string }>;
  onProfileUpdate: (updates: Partial<Pick<User, 'naam' | 'rol' | 'avatar'>>) => Promise<{ success: boolean; error?: string }>;
  onShowFeedbackDashboard?: () => void;
}

export default function UserProfile({ user, onLogout, onProfileUpdate, onShowFeedbackDashboard }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    naam: user.naam,
    rol: user.rol,
    avatar: user.avatar,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    const result = await onProfileUpdate({
      naam: formData.naam.trim(),
      rol: formData.rol,
      avatar: formData.avatar,
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
      avatar: user.avatar,
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

  const handleAvatarChange = (avatarData: string) => {
    setFormData(prev => ({ ...prev, avatar: avatarData }));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gebruikersprofiel</h2>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Bewerken
          </Button>
        )}
      </div>

      {message && (
        <Alert 
          variant={message.type === 'success' ? 'success' : 'error'}
          className="mb-4"
        >
          {message.text}
        </Alert>
      )}

      <div className="space-y-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-3 pb-4 border-b border-gray-200">
          <Avatar
            src={isEditing ? formData.avatar : user.avatar}
            name={isEditing ? formData.naam : user.naam}
            size="xl"
            editable={isEditing}
            onAvatarChange={handleAvatarChange}
          />
          <div className="text-center">
            <h3 className="font-medium text-gray-900">{isEditing ? formData.naam : user.naam}</h3>
            <p className="text-sm text-gray-500">{isEditing ? formData.rol : user.rol === 'ouders' ? 'Ouder(s)' : 'Kraamhulp'}</p>
          </div>
        </div>

        <Input
          label="Naam"
          value={isEditing ? formData.naam : user.naam}
          onChange={(e) => setFormData(prev => ({ ...prev, naam: e.target.value }))}
          placeholder="Uw volledige naam"
          readOnly={!isEditing}
        />

        <Input
          label="E-mail"
          value={user.email}
          readOnly
        />

        <Select
          label="Rol"
          value={isEditing ? formData.rol : user.rol}
          onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as 'ouders' | 'kraamhulp' }))}
          disabled={!isEditing}
        >
          <option value="ouders">Ouder(s)</option>
          <option value="kraamhulp">Kraamhulp</option>
        </Select>

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
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={!formData.naam.trim()}
            fullWidth
          >
            Opslaan
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            fullWidth
          >
            Annuleren
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {/* Feedback Dashboard Link for Kraamhulp */}
          {user.rol === 'kraamhulp' && onShowFeedbackDashboard && (
            <Button
              onClick={onShowFeedbackDashboard}
              fullWidth
              className="flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Team Dashboard</span>
            </Button>
          )}
          
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={isLoading}
            fullWidth
          >
            Uitloggen
          </Button>
        </div>
      )}
    </Card>
  );
}