'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: OnboardingStep[] = [
  {
    target: '[data-testid="cortex-floating-button"]',
    title: 'Meet Cortex',
    description: 'Your AI assistant lives here. Click anytime to open.',
    position: 'left',
  },
  {
    target: '[data-testid="cortex-input"]',
    title: 'Ask anything',
    description: 'Type a question or use voice input to interact with Cortex.',
    position: 'top',
  },
  {
    target: '[data-testid="cortex-suggestions"]',
    title: 'Quick suggestions',
    description: 'Use these shortcuts to get started quickly.',
    position: 'top',
  },
];

interface CortexOnboardingProps {
  onComplete: () => void;
  step: number;
}

function getTooltipOffset(position: OnboardingStep['position']) {
  switch (position) {
    case 'top':
      return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '12px' };
    case 'bottom':
      return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '12px' };
    case 'left':
      return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '12px' };
    case 'right':
      return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '12px' };
  }
}

export function CortexOnboarding({ onComplete, step }: CortexOnboardingProps) {
  const currentStep = STEPS[step];
  if (!currentStep) return null;

  const positionStyle = getTooltipOffset(currentStep.position);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        data-testid={`cortex-onboarding-step-${step}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="absolute z-[60] w-64 rounded-lg border border-border bg-card p-4 shadow-lg"
        style={positionStyle}
      >
        <p className="text-sm font-ui font-medium text-foreground">
          {currentStep.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground font-body">
          {currentStep.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[0.625rem] text-muted-foreground font-ui">
            {step + 1} / {STEPS.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={onComplete}
              data-testid="cortex-onboarding-skip"
            >
              Skip
            </Button>
            <Button
              variant="default"
              size="xs"
              onClick={() => {
                if (step >= STEPS.length - 1) {
                  onComplete();
                }
              }}
              data-testid="cortex-onboarding-next"
            >
              {step >= STEPS.length - 1 ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { STEPS as ONBOARDING_STEPS };
