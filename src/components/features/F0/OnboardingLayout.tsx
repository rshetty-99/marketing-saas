'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
}: OnboardingLayoutProps) {
  return (
    <div
      data-testid="onboarding-layout"
      className="flex min-h-screen flex-col items-center bg-background px-4 py-12"
    >
      {/* Aura logo */}
      <div className="mb-8">
        <span className="font-display text-display-xl tracking-tight text-brand-orange">
          AURA
        </span>
      </div>

      {/* Step progress indicator */}
      <div className="mb-10 flex items-center gap-2" aria-label={`Step ${currentStep} of ${totalSteps}`}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={stepNum} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-label font-ui text-xs transition-colors',
                  isActive && 'bg-brand-orange text-white',
                  isCompleted && 'bg-brand-orange/20 text-brand-orange',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                )}
              >
                {stepNum}
              </div>
              {stepNum < totalSteps && (
                <div
                  className={cn(
                    'h-px w-8 transition-colors',
                    isCompleted ? 'bg-brand-orange/40' : 'bg-muted',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content area with page transitions */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
