/**
 * @fileoverview Onboarding Components Barrel Export
 * Central export point for all onboarding-related components.
 * Inner Odyssey K-12 - AI-Powered Adaptive Onboarding System
 */

// Core onboarding components
export { OnboardingTutorial } from './OnboardingTutorial';
export { ChildOnboardingTutorial } from './ChildOnboardingTutorial';
export { FeatureSpotlight } from './FeatureSpotlight';
export { HelpButton } from './HelpButton';
export { OnboardingProvider, useOnboardingContext } from './OnboardingProvider';

// Quick Start & Path Selection (Phase 3)
export { QuickStartWizard } from './QuickStartWizard';
export { OnboardingPathSelector } from './OnboardingPathSelector';
export { DeferredSetupBanner } from './DeferredSetupBanner';

// Tutorial System (Phase 5)
export { TutorialOverlay } from './TutorialOverlay';
export { TutorialManager } from './TutorialManager';
