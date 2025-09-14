'use client';

import { useState, useEffect } from 'react';
import { AppData, BabyRecord, MotherRecord } from '@/types';
import { DataService } from '@/lib/dataService';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import MainNav from '@/components/MainNav';
import HamburgerMenu from '@/components/HamburgerMenu';
import Profile from '@/components/Profile';
import Overview from '@/components/Overview';
import LoggingGallery from '@/components/LoggingGallery';
import { AnalyticsSection } from '@/components/Analytics';
import Toast from '@/components/Toast';
import AuthForm from '@/components/AuthForm';
import UserProfile from '@/components/UserProfile';
import Onboarding from '@/components/Onboarding';
import Help from '@/components/Help';
import FeedbackModal from '@/components/FeedbackModal';
import FeedbackDashboard from '@/components/FeedbackDashboard';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import SplashScreen from '@/components/SplashScreen';
import ErrorAlert from '@/components/ErrorAlert';
import SuccessFeedbackPrompt from '@/components/SuccessFeedbackPrompt';
import { setupGlobalErrorHandling, ErrorLoggingService } from '@/lib/errorLoggingService';

export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated, login, register, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'overview' | 'logging' | 'analytics'>('profile');
  const [data, setData] = useState<AppData>(DataService.loadData());
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackDashboard, setShowFeedbackDashboard] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const [errorAlert, setErrorAlert] = useState<{ isVisible: boolean; error: Error | string; errorId?: string }>({
    isVisible: false,
    error: '',
    errorId: undefined
  });
  const [successFeedbackPrompt, setSuccessFeedbackPrompt] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: ''
  });

  // Setup global error handling on component mount
  useEffect(() => {
    setupGlobalErrorHandling();
    
    // Listen for global feedback modal events from ErrorBoundary
    const handleOpenFeedbackModal = (event: CustomEvent) => {
      const { prefillError, errorId } = event.detail || {};
      if (prefillError) {
        // Store error context for feedback modal
        localStorage.setItem('feedbackErrorContext', JSON.stringify({ errorId }));
      }
      setShowFeedbackModal(true);
    };

    window.addEventListener('openFeedbackModal', handleOpenFeedbackModal as EventListener);
    
    // Log application start
    const errorLogger = ErrorLoggingService.getInstance();
    errorLogger.logUserAction('app_started', 'App', {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    }, user?.id);

    return () => {
      window.removeEventListener('openFeedbackModal', handleOpenFeedbackModal as EventListener);
    };
  }, [user?.id]);

  useEffect(() => {
    // Load initial data when user changes
    if (user && !showSplash) {
      setData(DataService.loadData());
      
      // Check if user needs onboarding (first time user with no baby profile)
      const userData = DataService.loadData();
      const hasProfile = !!userData.babyProfile;
      const hasSeenOnboarding = localStorage.getItem('kraamweek-onboarding-completed') === 'true';
      
      if (!hasProfile && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
    if (!showSplash) {
      setIsLoading(false);
    }
  }, [user, showSplash]);

  const refreshData = () => {
    setData(DataService.loadData());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const showErrorAlert = (error: Error | string, errorId?: string) => {
    setErrorAlert({ isVisible: true, error, errorId });
  };

  const showSuccessFeedbackPrompt = (message: string) => {
    setSuccessFeedbackPrompt({ isVisible: true, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const hideErrorAlert = () => {
    setErrorAlert(prev => ({ ...prev, isVisible: false }));
  };

  const hideSuccessFeedbackPrompt = () => {
    setSuccessFeedbackPrompt(prev => ({ ...prev, isVisible: false }));
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('kraamweek-onboarding-completed', 'true');
    setShowOnboarding(false);
    showToast('Welkom bij Kraamweek App! Begin met het aanmaken van een baby profiel.', 'info');
  };

  const handleShowHelp = () => {
    setShowHelp(true);
    setIsMenuOpen(false);
    // Log help access
    const errorLogger = ErrorLoggingService.getInstance();
    errorLogger.logUserAction('help_opened', 'Help', {}, user?.id);
  };

  const handleHideHelp = () => {
    setShowHelp(false);
  };

  const handleShowFeedback = () => {
    setShowFeedbackModal(true);
    setIsMenuOpen(false);
    // Log feedback modal access
    const errorLogger = ErrorLoggingService.getInstance();
    errorLogger.logUserAction('feedback_modal_opened', 'FeedbackModal', {}, user?.id);
  };

  const handleHideFeedback = () => {
    setShowFeedbackModal(false);
  };

  const handleFeedbackSuccess = (feedbackId: string) => {
    showToast('Bedankt voor je feedback! We nemen het mee in onze verbeteringen.', 'success');
    // Log successful feedback submission
    const errorLogger = ErrorLoggingService.getInstance();
    errorLogger.logUserAction('feedback_submitted', 'FeedbackModal', { feedbackId }, user?.id);
  };

  const handleShowFeedbackDashboard = () => {
    setShowFeedbackDashboard(true);
    setIsMenuOpen(false);
    // Log dashboard access
    const errorLogger = ErrorLoggingService.getInstance();
    errorLogger.logUserAction('feedback_dashboard_opened', 'FeedbackDashboard', {}, user?.id);
  };

  const handleHideFeedbackDashboard = () => {
    setShowFeedbackDashboard(false);
  };

  const handleShowUserProfile = () => {
    setShowUserProfile(true);
    setIsMenuOpen(false);
  };

  const handleHideUserProfile = () => {
    setShowUserProfile(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleAddBabyRecord = (record: Omit<BabyRecord, 'id'>) => {
    try {
      DataService.addBabyRecord(record);
      refreshData();
      // Switch to overview to show the new record
      setActiveTab('overview');
      
      // Show success feedback prompt
      showSuccessFeedbackPrompt(
        'Baby registratie succesvol toegevoegd!'
      );
      
      // Log successful record addition
      const errorLogger = ErrorLoggingService.getInstance();
      errorLogger.logUserAction('baby_record_added', 'LoggingGallery', {
        recordType: record.type,
      }, user?.id);
    } catch (error) {
      const errorLogger = ErrorLoggingService.getInstance();
      const errorInstance = error instanceof Error ? error : new Error('Failed to add baby record');
      
      errorLogger.logError(
        errorInstance,
        'error',
        {
          component: 'App',
          action: 'add_baby_record',
          userId: user?.id,
          metadata: { recordType: record.type },
        }
      );
      
      // Get error ID for display
      const errorLogs = errorLogger.getErrorLogs();
      const latestError = errorLogs[0];
      
      showErrorAlert(
        'Er is een fout opgetreden bij het toevoegen van de baby registratie. Probeer het opnieuw.',
        latestError?.id
      );
    }
  };

  const handleAddMotherRecord = (record: Omit<MotherRecord, 'id'>) => {
    try {
      DataService.addMotherRecord(record);
      refreshData();
      // Switch to overview to show the new record
      setActiveTab('overview');
      
      // Show success feedback prompt
      showSuccessFeedbackPrompt(
        'Moeder registratie succesvol toegevoegd!'
      );
      
      // Log successful record addition
      const errorLogger = ErrorLoggingService.getInstance();
      errorLogger.logUserAction('mother_record_added', 'LoggingGallery', {
        recordType: record.type,
      }, user?.id);
    } catch (error) {
      const errorLogger = ErrorLoggingService.getInstance();
      const errorInstance = error instanceof Error ? error : new Error('Failed to add mother record');
      
      errorLogger.logError(
        errorInstance,
        'error',
        {
          component: 'App',
          action: 'add_mother_record',
          userId: user?.id,
          metadata: { recordType: record.type },
        }
      );
      
      // Get error ID for display
      const errorLogs = errorLogger.getErrorLogs();
      const latestError = errorLogs[0];
      
      showErrorAlert(
        'Er is een fout opgetreden bij het toevoegen van de moeder registratie. Probeer het opnieuw.',
        latestError?.id
      );
    }
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading screen while auth is being determined
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (isAuthenticated && showOnboarding) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete}
        userRole={user?.rol || 'ouders'}
      />
    );
  }

  // Show user profile screen
  if (showUserProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav 
          title="Account" 
          onMenuClick={handleMenuToggle}
          showBackButton={true}
          onBackClick={handleHideUserProfile}
        />
        <div className="pt-16 p-4">
          <div className="max-w-md mx-auto">
            <UserProfile 
              user={user!}
              onLogout={logout}
              onProfileUpdate={updateProfile}
              onShowFeedbackDashboard={user?.rol === 'kraamhulp' ? handleShowFeedbackDashboard : undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show feedback dashboard for kraamhulp
  if (showFeedbackDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav 
          title="Feedback Dashboard" 
          onMenuClick={handleMenuToggle}
          showBackButton={true}
          onBackClick={handleHideFeedbackDashboard}
        />
        <div className="pt-16">
          <FeedbackDashboard 
            onBack={handleHideFeedbackDashboard}
          />
        </div>
      </div>
    );
  }

  // Show help screen
  if (showHelp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav 
          title="Help & FAQ" 
          onMenuClick={handleMenuToggle}
          showBackButton={true}
          onBackClick={handleHideHelp}
        />
        <div className="pt-16">
          <Help 
            onBack={handleHideHelp}
            userRole={user?.rol}
          />
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm 
        onLogin={login}
        onRegister={register}
        isLoading={authLoading}
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="pt-16">
            <Profile profile={data.babyProfile} onProfileUpdate={refreshData} />
          </div>
        );
      case 'overview':
        return (
          <div className="pt-16">
            <Overview data={data} />
          </div>
        );
      case 'logging':
        return (
          <div className="pt-16">
            <LoggingGallery
              onAddBabyRecord={handleAddBabyRecord}
              onAddMotherRecord={handleAddMotherRecord}
              onSuccess={showToast}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="pt-16 p-4 pb-24">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Trends</h1>
              <AnalyticsSection 
                babyRecords={data.babyRecords} 
                motherRecords={data.motherRecords} 
              />
            </div>
          </div>
        );
      default:
        return <Profile profile={data.babyProfile} onProfileUpdate={refreshData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <TopNav 
        title="Kraamweek" 
        onMenuClick={handleMenuToggle}
      />
      {renderActiveTab()}
      <MainNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onHelpClick={handleShowHelp}
        onFeedbackClick={handleShowFeedback}
        onAccountClick={handleShowUserProfile}
        userRole={user?.rol}
      />
      <InstallPrompt 
        onInstall={() => showToast('App succesvol geïnstalleerd!', 'success')}
        onDismiss={() => showToast('Je kunt de app later nog steeds installeren via het menu.', 'info')}
      />
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleHideFeedback}
        onSuccess={handleFeedbackSuccess}
      />
      {errorAlert.isVisible && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
          <ErrorAlert
            error={errorAlert.error}
            errorId={errorAlert.errorId}
            onDismiss={hideErrorAlert}
            onRetry={() => {
              hideErrorAlert();
              // Trigger a page refresh or specific retry logic
              window.location.reload();
            }}
          />
        </div>
      )}
      <SuccessFeedbackPrompt
        isVisible={successFeedbackPrompt.isVisible}
        onClose={hideSuccessFeedbackPrompt}
        successMessage={successFeedbackPrompt.message}
      />
    </div>
  );
}
