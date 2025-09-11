'use client';

import { useState } from 'react';
import { User, UserRole } from '@/types';
import { DataService } from '@/lib/dataService';

interface UserSelectorProps {
  onUserSelected: (user: User) => void;
}

export default function UserSelector({ onUserSelected }: UserSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name.trim()) return;
    
    const user: User = {
      role: selectedRole,
      name: name.trim(),
    };
    
    DataService.saveUser(user);
    onUserSelected(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kraamweek App
          </h1>
          <p className="text-gray-600">
            Welkom! Selecteer uw rol om te beginnen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ik ben:
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="parents"
                  checked={selectedRole === 'parents'}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Ouder(s)</div>
                  <div className="text-sm text-gray-500">
                    Voer gegevens van de baby in
                  </div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="kraamhulp"
                  checked={selectedRole === 'kraamhulp'}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Kraamhulp</div>
                  <div className="text-sm text-gray-500">
                    Bekijk overzichten en beheer taken
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Naam:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Vul uw naam in"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!selectedRole || !name.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Doorgaan
          </button>
        </form>
      </div>
    </div>
  );
}