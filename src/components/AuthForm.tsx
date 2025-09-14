'use client';

import { useState } from 'react';
import { LoginCredentials, RegisterData } from '@/types';
import { validateEmail, validatePassword, validateName, validateRole } from '@/lib/validation';
import { Button, Input, Select, Card, Alert } from '@/components/ui';

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
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl">👶</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'Inloggen' : 'Account aanmaken'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Kraamweek App - Kraamzorg tracker
          </p>
        </div>
        
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            <div className="space-y-4">
              {!isLoginMode && (
                <Input
                  label="Volledige naam"
                  name="naam"
                  type="text"
                  required={!isLoginMode}
                  value={formData.naam}
                  onChange={(e) => handleInputChange('naam', e.target.value)}
                  onBlur={(e) => validateField('naam', e.target.value)}
                  error={getFieldError('naam') || undefined}
                  placeholder="Uw volledige naam"
                />
              )}

              <Input
                label="E-mailadres"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => validateField('email', e.target.value)}
                error={getFieldError('email') || undefined}
                placeholder="uw@email.nl"
              />

              <Input
                label="Wachtwoord"
                name="password"
                type="password"
                autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => validateField('password', e.target.value)}
                error={getFieldError('password') || undefined}
                placeholder={isLoginMode ? 'Uw wachtwoord' : 'Minimaal 8 karakters, letter en cijfer'}
                minLength={isLoginMode ? undefined : 8}
              />

              {!isLoginMode && (
                <Select
                  label="Uw rol"
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                  helperText="Ouders kunnen baby data invoeren, kraamhulp kan alles beheren"
                >
                  <option value="ouders">Ouder(s)</option>
                  <option value="kraamhulp">Kraamhulp</option>
                </Select>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
            >
              {isLoginMode ? 'Inloggen' : 'Account aanmaken'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError(null);
                  setFormData(prev => ({ ...prev, naam: '', password: '' }));
                }}
              >
                {isLoginMode 
                  ? 'Nog geen account? Registreer hier' 
                  : 'Al een account? Log hier in'
                }
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}