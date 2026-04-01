'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceForm } from '@/components/features/F0/WorkspaceForm';
import { OnboardingLayout } from '@/components/features/F0/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboarding';
import type { CreateWorkspaceInput } from '@/lib/validations/onboarding';

export default function WorkspacePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWorkspaceId, setWorkspaceDetails } = useOnboardingStore();

  async function handleSubmit(data: CreateWorkspaceInput) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'Failed to create workspace');
      }

      const result = await response.json() as { workspaceId: string };
      setWorkspaceId(result.workspaceId);
      setWorkspaceDetails(data.name, data.industry ?? '');

      router.push('/onboarding/brand');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingLayout currentStep={2} totalSteps={5}>
      <div className="flex flex-col gap-6" data-testid="onboarding-workspace">
        <div className="space-y-2 text-center">
          <h1 className="text-display-2xl font-display text-foreground">
            Create your workspace
          </h1>
          <p className="text-body-md font-body text-muted-foreground">
            This is where your team will collaborate.
          </p>
        </div>

        <WorkspaceForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <p className="text-center text-body-sm text-destructive">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  );
}
