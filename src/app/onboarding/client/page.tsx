'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientCreateForm } from '@/components/features/F0/ClientCreateForm';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import type { CreateClientInput } from '@/lib/validations/onboarding';

export default function ClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateClientInput) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'Failed to create client');
      }

      router.push('/onboarding/complete');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSkip() {
    router.push('/onboarding/complete');
  }

  return (
    <OnboardingLayout currentStep={5} totalSteps={5}>
      <div className="flex flex-col gap-6" data-testid="onboarding-client">
        <div className="space-y-2 text-center">
          <h1 className="text-display-2xl font-display text-foreground">
            Add your first client
          </h1>
          <p className="text-body-md font-body text-muted-foreground">
            Set up a client workspace to start managing their content. You can add more later.
          </p>
        </div>

        <ClientCreateForm
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          availableMembers={[]}
          isLoading={isLoading}
        />

        {error && (
          <p className="text-center text-body-sm text-destructive">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
