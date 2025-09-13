'use client';

import { useState } from 'react';
import { LoginCredentials, RegisterData } from '@/types';

interface AuthFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  onRegister: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export default function AuthForm({ onLogin, onRegister, isLoading }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    naam: '',
    rol: 'ouders' as 'ouders' | 'kraamhulp',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLoginMode) {
      const result = await onLogin({
        email: formData.email,
        password: formData.password,
      });
      
      if (!result.success) {
        setError(result.error || 'Inloggen mislukt');
      }
    } else {
      if (!formData.naam.trim()) {
        setError('Naam is verplicht');
        return;
      }

      const result = await onRegister({
        email: formData.email,
        password: formData.password,
        naam: formData.naam.trim(),
        rol: formData.rol,
      });
      
      if (!result.success) {
        setError(result.error || 'Registratie mislukt');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <span className="text-2xl">👶</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'Inloggen' : 'Account aanmaken'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Kraamweek App - Kraamzorg tracker
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLoginMode && (
              <div>
                <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">
                  Volledige naam *
                </label>
                <input
                  id="naam"
                  name="naam"
                  type="text"
                  required={!isLoginMode}
                  value={formData.naam}
                  onChange={(e) => handleInputChange('naam', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Uw volledige naam"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mailadres *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="uw@email.nl"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={isLoginMode ? 'Uw wachtwoord' : 'Minimaal 6 karakters'}
                minLength={isLoginMode ? undefined : 6}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                  Uw rol *
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ouders">Ouder(s)</option>
                  <option value="kraamhulp">Kraamhulp</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Ouders kunnen baby data invoeren, kraamhulp kan alles beheren
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Bezig...
                </div>
              ) : (
                isLoginMode ? 'Inloggen' : 'Account aanmaken'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError(null);
                setFormData(prev => ({ ...prev, naam: '', password: '' }));
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLoginMode 
                ? 'Nog geen account? Registreer hier' 
                : 'Al een account? Log hier in'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}