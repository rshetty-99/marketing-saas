'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountTypeSelector } from '@/components/features/F0/AccountTypeSelector';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding';
import type { AccountType } from '@/types/roles';

export default function AccountTypePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accountType, setAccountType } = useOnboardingStore();

  async function handleSelect(type: AccountType) {
    setAccountType(type);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/account-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: type }),
      });

      if (!response.ok) {
        const data = await response.json() as { error: string };
        throw new Error(data.error || 'Failed to save account type');
      }

      router.push('/onboarding/workspace');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingLayout currentStep={1} totalSteps={5}>
      <div className="flex flex-col gap-6" data-testid="onboarding-account-type">
        <div className="space-y-2 text-center">
          <h1 className="text-display-2xl font-display text-foreground">
            How will you use Aura?
          </h1>
          <p className="text-body-md font-body text-muted-foreground">
            This helps us tailor your experience.
          </p>
        </div>

        <AccountTypeSelector
          onSelect={handleSelect}
          selected={accountType ?? undefined}
        />

        {isLoading && (
          <p className="text-center text-body-sm text-muted-foreground">
            Setting up...
          </p>
        )}

        {error && (
          <p className="text-center text-body-sm text-destructive">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
