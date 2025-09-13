'use client';

import { useState } from 'react';
import { LoginCredentials, RegisterData } from '@/types';
import { validateEmail, validatePassword, validateName, validateRole } from '@/lib/validation';

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string[]}>({});

  const validateField = (field: string, value: string) => {
    let validation;
    
    switch (field) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'naam':
        validation = validateName(value);
        break;
      case 'rol':
        validation = validateRole(value);
        break;
      default:
        return;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? [] : validation.errors
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate all fields
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    
    const errors: {[key: string]: string[]} = {};
    
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }
    
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }

    if (!isLoginMode) {
      const nameValidation = validateName(formData.naam);
      const roleValidation = validateRole(formData.rol);
      
      if (!nameValidation.isValid) {
        errors.naam = nameValidation.errors;
      }
      
      if (!roleValidation.isValid) {
        errors.rol = roleValidation.errors;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (isLoginMode) {
      const result = await onLogin({
        email: (emailValidation.sanitizedValue as string) || formData.email,
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
        email: (emailValidation.sanitizedValue as string) || formData.email,
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
    if (error) setError(null); // Clear general error when user starts typing
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: [] }));
    }
    
    // Validate on blur (after a short delay)
    setTimeout(() => validateField(field, value), 300);
  };

  const getFieldError = (field: string): string | null => {
    const errors = fieldErrors[field];
    return errors && errors.length > 0 ? errors[0] : null;
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
                  onBlur={(e) => validateField('naam', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    getFieldError('naam') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Uw volledige naam"
                />
                {getFieldError('naam') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('naam')}</p>
                )}
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
                onBlur={(e) => validateField('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="uw@email.nl"
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
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
                onBlur={(e) => validateField('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  getFieldError('password') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={isLoginMode ? 'Uw wachtwoord' : 'Minimaal 8 karakters, letter en cijfer'}
                minLength={isLoginMode ? undefined : 8}
              />
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
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