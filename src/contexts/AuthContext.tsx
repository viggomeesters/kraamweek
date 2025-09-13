'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '@/types';
import { AuthService } from '@/lib/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Pick<User, 'naam' | 'rol' | 'profileCompleted'>>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      if (!AuthService.isConfigured()) {
        // If Supabase is not configured, set a demo user for development
        setAuthState({
          user: {
            id: 'demo-user',
            email: 'demo@kraamweek.nl',
            naam: 'Demo Gebruiker',
            rol: 'ouders',
            createdAt: new Date().toISOString(),
            profileCompleted: true,
          },
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }

      try {
        const { user, error } = await AuthService.getCurrentUser();
        if (error) {
          console.error('Auth initialization error:', error);
        }
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    // Set up auth state change listener if Supabase is configured
    if (AuthService.isConfigured()) {
      const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
        setAuthState(prev => ({
          ...prev,
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }));
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    if (!AuthService.isConfigured()) {
      return { success: false, error: 'Supabase is niet geconfigureerd' };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { user, error } = await AuthService.login(credentials);
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error };
      }

      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Inloggen mislukt' };
    } catch (loginError) {
      console.error('Login error:', loginError);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Er is een fout opgetreden' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!AuthService.isConfigured()) {
      return { success: false, error: 'Supabase is niet geconfigureerd' };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { user, error } = await AuthService.register(data);
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error };
      }

      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Registratie mislukt' };
    } catch (registerError) {
      console.error('Register error:', registerError);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Er is een fout opgetreden' };
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    if (!AuthService.isConfigured()) {
      // For demo mode, just clear the user
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { error } = await AuthService.logout();
      
      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error };
      }

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return { success: true };
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Er is een fout opgetreden bij het uitloggen' };
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'naam' | 'rol' | 'profileCompleted'>>): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'Geen gebruiker ingelogd' };
    }

    if (!AuthService.isConfigured()) {
      // For demo mode, just update the local user state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));
      return { success: true };
    }

    try {
      const { error } = await AuthService.updateProfile(authState.user.id, updates);
      
      if (error) {
        return { success: false, error };
      }

      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));

      return { success: true };
    } catch (updateError) {
      console.error('Update profile error:', updateError);
      return { success: false, error: 'Er is een fout opgetreden bij het updaten van het profiel' };
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}