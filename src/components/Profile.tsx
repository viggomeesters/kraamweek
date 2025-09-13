'use client';

import { useState } from 'react';
import { BabyProfile } from '@/types';
import { DataService } from '@/lib/dataService';
import { formatTime24 } from '@/lib/dateUtils';

interface ProfileProps {
  profile?: BabyProfile;
  onProfileUpdate: () => void;
}

export default function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<Partial<BabyProfile>>(
    profile || {
      voornaam: '',
      achternaam: '',
      roepnaam: '',
      geslacht: 'onbekend',
      geboortedatum: '',
      geboortijd: '',
      geboortgewicht: undefined,
      geboortelengte: undefined,
      hoofdomvang: undefined,
      bijzonderheden: '',
    }
  );

  const handleSave = () => {
    if (!formData.voornaam || !formData.achternaam || !formData.geboortedatum) {
      alert('Vul de verplichte velden in (voornaam, achternaam, geboortedatum)');
      return;
    }

    const profileData: BabyProfile = {
      id: profile?.id || '1',
      voornaam: formData.voornaam!,
      achternaam: formData.achternaam!,
      roepnaam: formData.roepnaam,
      geslacht: formData.geslacht!,
      geboortedatum: formData.geboortedatum!,
      geboortijd: formData.geboortijd,
      geboortgewicht: formData.geboortgewicht,
      geboortelengte: formData.geboortelengte,
      hoofdomvang: formData.hoofdomvang,
      bijzonderheden: formData.bijzonderheden,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    DataService.saveBabyProfile(profileData);
    onProfileUpdate();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  if (!isEditing && profile) {
    return (
      <div className="p-4 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Baby Profiel</h1>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Bewerken
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">👶</div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.roepnaam || profile.voornaam} {profile.achternaam}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Voornaam:</span>
                <p className="text-gray-900">{profile.voornaam}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Achternaam:</span>
                <p className="text-gray-900">{profile.achternaam}</p>
              </div>
              {profile.roepnaam && (
                <div>
                  <span className="font-medium text-gray-600">Roepnaam:</span>
                  <p className="text-gray-900">{profile.roepnaam}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Geslacht:</span>
                <p className="text-gray-900 capitalize">{profile.geslacht}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Geboortedatum:</span>
                <p className="text-gray-900">
                  {new Date(profile.geboortedatum).toLocaleDateString('nl-NL')}
                </p>
              </div>
              {profile.geboortijd && (
                <div>
                  <span className="font-medium text-gray-600">Geboortijd:</span>
                  <p className="text-gray-900">{formatTime24(`1970-01-01T${profile.geboortijd}:00`)}</p>
                </div>
              )}
              {profile.geboortgewicht && (
                <div>
                  <span className="font-medium text-gray-600">Geboortegewicht:</span>
                  <p className="text-gray-900">{profile.geboortgewicht} gram</p>
                </div>
              )}
              {profile.geboortelengte && (
                <div>
                  <span className="font-medium text-gray-600">Geboortelengte:</span>
                  <p className="text-gray-900">{profile.geboortelengte} cm</p>
                </div>
              )}
              {profile.hoofdomvang && (
                <div>
                  <span className="font-medium text-gray-600">Hoofdomvang:</span>
                  <p className="text-gray-900">{profile.hoofdomvang} cm</p>
                </div>
              )}
            </div>

            {profile.bijzonderheden && (
              <div className="mt-4 pt-4 border-t">
                <span className="font-medium text-gray-600">Bijzonderheden:</span>
                <p className="text-gray-900 mt-1">{profile.bijzonderheden}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile ? 'Profiel bewerken' : 'Baby profiel aanmaken'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voornaam *
              </label>
              <input
                type="text"
                value={formData.voornaam || ''}
                onChange={(e) => setFormData({ ...formData, voornaam: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Voornaam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achternaam *
              </label>
              <input
                type="text"
                value={formData.achternaam || ''}
                onChange={(e) => setFormData({ ...formData, achternaam: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Achternaam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roepnaam
              </label>
              <input
                type="text"
                value={formData.roepnaam || ''}
                onChange={(e) => setFormData({ ...formData, roepnaam: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Roepnaam (optioneel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geslacht *
              </label>
              <select
                value={formData.geslacht || 'onbekend'}
                onChange={(e) => setFormData({ ...formData, geslacht: e.target.value as 'jongen' | 'meisje' | 'onbekend' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="onbekend">Onbekend</option>
                <option value="jongen">Jongen</option>
                <option value="meisje">Meisje</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortedatum *
              </label>
              <input
                type="date"
                value={formData.geboortedatum || ''}
                onChange={(e) => setFormData({ ...formData, geboortedatum: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortijd
              </label>
              <input
                type="text"
                value={formData.geboortijd || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow partial input while typing, but validate format
                  if (value === '' || /^([0-1]?[0-9]|2[0-3])(:[0-5][0-9])?$/.test(value)) {
                    setFormData({ ...formData, geboortijd: value });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // Format to HH:MM on blur if valid
                  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                    const [hours, minutes] = value.split(':');
                    const formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
                    setFormData({ ...formData, geboortijd: formattedTime });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="HH:MM"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                title="Gebruik 24-uurs notatie (HH:MM)"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortegewicht (gram)
              </label>
              <input
                type="number"
                value={formData.geboortgewicht || ''}
                onChange={(e) => setFormData({ ...formData, geboortgewicht: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="3500"
                min="500"
                max="8000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geboortelengte (cm)
              </label>
              <input
                type="number"
                value={formData.geboortelengte || ''}
                onChange={(e) => setFormData({ ...formData, geboortelengte: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50"
                min="20"
                max="80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hoofdomvang (cm)
              </label>
              <input
                type="number"
                value={formData.hoofdomvang || ''}
                onChange={(e) => setFormData({ ...formData, hoofdomvang: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="35"
                min="20"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bijzonderheden
              </label>
              <textarea
                value={formData.bijzonderheden || ''}
                onChange={(e) => setFormData({ ...formData, bijzonderheden: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Eventuele bijzonderheden..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium min-h-[3.5rem] touch-manipulation"
            >
              Opslaan
            </button>
            {profile && (
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-400 transition-colors font-medium min-h-[3.5rem] touch-manipulation"
              >
                Annuleren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}