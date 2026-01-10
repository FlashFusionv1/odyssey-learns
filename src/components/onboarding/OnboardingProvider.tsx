/**
 * @fileoverview Onboarding Context Provider
 * Provides onboarding state and controls throughout the application.
 * Manages both parent and child onboarding flows.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FeatureTourStep {
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  // Parent onboarding
  showParentOnboarding: boolean;
  setShowParentOnboarding: (show: boolean) => void;
  completeParentOnboarding: () => void;
  
  // Child onboarding
  showChildOnboarding: boolean;
  setShowChildOnboarding: (show: boolean) => void;
  completeChildOnboarding: () => void;
  
  // Feature tour
  showFeatureTour: boolean;
  featureTourSteps: FeatureTourStep[];
  startFeatureTour: (steps: FeatureTourStep[]) => void;
  endFeatureTour: () => void;
  
  // Help menu state
  showHelpMenu: boolean;
  setShowHelpMenu: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

/**
 * Hook to access onboarding context
 */
export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

/**
 * Provider component for onboarding state
 */
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  // Parent onboarding state
  const [showParentOnboarding, setShowParentOnboarding] = useState(false);
  
  // Child onboarding state
  const [showChildOnboarding, setShowChildOnboarding] = useState(false);
  
  // Feature tour state
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [featureTourSteps, setFeatureTourSteps] = useState<FeatureTourStep[]>([]);
  
  // Help menu state
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const completeParentOnboarding = useCallback(() => {
    setShowParentOnboarding(false);
    // Could trigger confetti or celebration here
  }, []);

  const completeChildOnboarding = useCallback(() => {
    setShowChildOnboarding(false);
    // Could trigger celebration modal here
  }, []);

  const startFeatureTour = useCallback((steps: FeatureTourStep[]) => {
    setFeatureTourSteps(steps);
    setShowFeatureTour(true);
  }, []);

  const endFeatureTour = useCallback(() => {
    setShowFeatureTour(false);
    setFeatureTourSteps([]);
  }, []);

  const value: OnboardingContextType = {
    showParentOnboarding,
    setShowParentOnboarding,
    completeParentOnboarding,
    showChildOnboarding,
    setShowChildOnboarding,
    completeChildOnboarding,
    showFeatureTour,
    featureTourSteps,
    startFeatureTour,
    endFeatureTour,
    showHelpMenu,
    setShowHelpMenu,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export default OnboardingProvider;
