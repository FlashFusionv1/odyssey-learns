/**
 * @fileoverview Tutorial Overlay Component
 * Provides an overlay for guided tutorials with spotlight and step navigation.
 * Phase 5: Tutorial Trigger System for Inner Odyssey K-12
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { TutorialStep, TutorialConfig } from '@/types/onboarding';

interface TutorialOverlayProps {
  tutorial: TutorialConfig;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onDefer?: () => void;
}

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay({
  tutorial,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onDefer,
}: TutorialOverlayProps) {
  const [targetPosition, setTargetPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const step = tutorial.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorial.steps.length - 1;
  const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

  // Calculate target element position
  const updatePosition = useCallback(() => {
    if (!step) return;
    
    const target = document.querySelector(step.targetSelector);
    if (!target) {
      console.warn(`Tutorial target not found: ${step.targetSelector}`);
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const padding = step.highlightPadding ?? 8;
    
    setTargetPosition({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
    
    // Calculate tooltip position based on placement
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    let top = 0;
    let left = rect.left + rect.width / 2;
    
    switch (step.placement) {
      case 'top':
        top = rect.top - tooltipHeight - 16 + window.scrollY;
        break;
      case 'bottom':
        top = rect.bottom + 16 + window.scrollY;
        break;
      case 'left':
        left = rect.left - tooltipWidth - 16;
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        break;
      case 'right':
        left = rect.right + 16;
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2 + window.scrollY;
        left = window.innerWidth / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16 + window.scrollY, top);
    
    setTooltipPosition({ top, left });
  }, [step]);

  // Update position on step change
  useEffect(() => {
    setIsTransitioning(true);
    updatePosition();
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentStep, updatePosition]);

  // Update position on scroll/resize
  useEffect(() => {
    const handleUpdate = () => {
      if (!isTransitioning) {
        updatePosition();
      }
    };
    
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [updatePosition, isTransitioning]);

  // Scroll target into view
  useEffect(() => {
    if (!step) return;
    
    const target = document.querySelector(step.targetSelector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onSkip();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (!isLastStep) onNext();
          else onComplete();
          break;
        case 'ArrowLeft':
          if (!isFirstStep) onPrev();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirstStep, isLastStep, onNext, onPrev, onSkip, onComplete]);

  if (!targetPosition) return null;

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
        >
          <defs>
            <mask id="tutorial-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ 
                  x: targetPosition.left,
                  y: targetPosition.top,
                  width: targetPosition.width,
                  height: targetPosition.height,
                  opacity: 1,
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
            fill="hsl(var(--background) / 0.85)"
            mask="url(#tutorial-spotlight-mask)"
          />
        </svg>

        {/* Spotlight border */}
        <motion.div
          className="absolute border-2 border-primary rounded-lg pointer-events-none shadow-lg"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.3)',
          }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute z-[51] w-80 bg-card text-card-foreground rounded-xl shadow-2xl border-2 border-border overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
          style={{
            pointerEvents: 'auto',
            transform: step?.placement === 'center' ? 'translateX(-50%)' : 'none',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                {tutorial.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1}/{tutorial.steps.length}
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-semibold text-lg mb-2">{step?.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {step?.description}
            </p>

            {/* Progress bar */}
            <Progress value={progress} className="h-1.5 mb-4" />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {onDefer && tutorial.canResumeLater && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDefer}
                    className="text-muted-foreground"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Later
                  </Button>
                )}
                {tutorial.isSkippable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-muted-foreground"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={onPrev}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={isLastStep ? onComplete : onNext}>
                  {isLastStep ? 'Done' : 'Next'}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Keyboard hints */}
        <div 
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-muted-foreground bg-card/90 px-4 py-2 rounded-full shadow-lg border"
          style={{ pointerEvents: 'auto' }}
        >
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-0.5">→</kbd>
            Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
            Continue
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
            Skip
          </span>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default TutorialOverlay;
