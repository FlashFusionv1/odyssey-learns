/**
 * @fileoverview Feature Spotlight Component
 * Highlights specific UI elements with a spotlight effect and tooltip.
 * Used for contextual feature discovery after initial onboarding.
 */

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SpotlightStep {
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureSpotlightProps {
  steps: SpotlightStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Feature Spotlight overlay for guided feature discovery
 */
export function FeatureSpotlight({
  steps,
  isActive,
  onComplete,
  onSkip,
}: FeatureSpotlightProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState<TooltipPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Find and track target element position
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.targetSelector);
      if (!targetElement) {
        console.warn(`Spotlight target not found: ${currentStep.targetSelector}`);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const padding = 8;
      
      setTargetPosition({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
      });

      // Calculate tooltip position based on placement
      const placement = currentStep.placement || 'bottom';
      let tooltipTop = 0;
      let tooltipLeft = rect.left + rect.width / 2;

      switch (placement) {
        case 'top':
          tooltipTop = rect.top - 120 + window.scrollY;
          break;
        case 'bottom':
          tooltipTop = rect.bottom + 16 + window.scrollY;
          break;
        case 'left':
          tooltipLeft = rect.left - 200;
          tooltipTop = rect.top + rect.height / 2 - 50 + window.scrollY;
          break;
        case 'right':
          tooltipLeft = rect.right + 16;
          tooltipTop = rect.top + rect.height / 2 - 50 + window.scrollY;
          break;
      }

      // Keep tooltip within viewport
      tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - 320));
      
      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!isActive || !targetPosition) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: 'none' }}
      >
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          onClick={onSkip}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetPosition.left}
                y={targetPosition.top}
                width={targetPosition.width}
                height={targetPosition.height}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border highlight */}
        <motion.div
          className="absolute border-2 border-primary rounded-lg pointer-events-none"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: '0 0 0 4px rgba(var(--primary), 0.2)',
          }}
          style={{
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
          }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute z-[51] w-80 bg-popover text-popover-foreground rounded-lg shadow-xl border p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Close spotlight"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <h4 className="font-semibold text-base mb-1 pr-6">{currentStep.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStepIndex === steps.length - 1 ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default FeatureSpotlight;
