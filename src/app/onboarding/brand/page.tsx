'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickBrandForm } from '@/components/features/F0/QuickBrandForm';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding';
import type { QuickBrandInput } from '@/lib/validations/onboarding';

export default function BrandPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accountType, setBrandDetails } = useOnboardingStore();

  function getNextRoute(): string {
    if (accountType === 'freelancer') {
      return '/onboarding/complete';
    }
    return '/onboarding/team';
  }

  async function handleSubmit(data: QuickBrandInput) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'Failed to save brand details');
      }

      setBrandDetails(data.brandName, data.primaryColor, data.voiceTone);
      router.push(getNextRoute());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    router.push(getNextRoute());
  }

  return (
    <OnboardingLayout currentStep={3} totalSteps={5}>
      <div className="flex flex-col gap-6" data-testid="onboarding-brand">
        <div className="space-y-2 text-center">
          <h1 className="text-display-2xl font-display text-foreground">
            Set up your brand
          </h1>
          <p className="text-body-md font-body text-muted-foreground">
            Quick brand settings to personalize your content. You can always update these later.
          </p>
        </div>

        <QuickBrandForm
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          isLoading={isLoading}
        />

        {error && (
          <p className="text-center text-body-sm text-destructive">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
