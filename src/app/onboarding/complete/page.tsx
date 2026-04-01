'use client';

import { useEffect, useState } from 'react';
import { OnboardingComplete } from '@/components/features/F0/OnboardingComplete';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding';

export default function CompletePage() {
  const { workspaceName, reset } = useOnboardingStore();
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function markComplete() {
      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'PATCH',
        });

        if (!response.ok) {
          const data = await response.json() as { error: string };
          throw new Error(data.error || 'Failed to complete onboarding');
        }

        if (mounted) {
          setCompleted(true);
          reset();
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(message);
        }
      }
    }

    markComplete();

    return () => {
      mounted = false;
    };
  }, [reset]);

  if (error) {
    return (
      <OnboardingLayout currentStep={5} totalSteps={5}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-body-md text-destructive">{error}</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (!completed) {
    return (
      <OnboardingLayout currentStep={5} totalSteps={5}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-body-md text-muted-foreground">Finishing setup...</p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={5} totalSteps={5}>
      <OnboardingComplete workspaceName={workspaceName || 'Your workspace'} />
    </OnboardingLayout>
  );
}
