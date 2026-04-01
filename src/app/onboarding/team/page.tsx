'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamInviteForm } from '@/components/features/F0/TeamInviteForm';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding';
import type { InviteTeamInput } from '@/lib/validations/onboarding';

export default function TeamPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accountType } = useOnboardingStore();

  function getNextRoute(): string {
    if (accountType === 'agency') {
      return '/onboarding/client';
    }
    return '/onboarding/complete';
  }

  async function handleSubmit(data: InviteTeamInput) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'Failed to send invites');
      }

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
    <OnboardingLayout currentStep={4} totalSteps={5}>
      <div className="flex flex-col gap-6" data-testid="onboarding-team">
        <div className="space-y-2 text-center">
          <h1 className="text-display-2xl font-display text-foreground">
            Invite your team
          </h1>
          <p className="text-body-md font-body text-muted-foreground">
            Collaborate with your team members. You can always invite more later.
          </p>
        </div>

        <TeamInviteForm
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
