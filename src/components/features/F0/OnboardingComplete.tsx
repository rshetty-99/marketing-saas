'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface OnboardingCompleteProps {
  workspaceName: string;
}

export function OnboardingComplete({ workspaceName }: OnboardingCompleteProps) {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div
      data-testid="onboarding-complete"
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <CheckCircle className="size-16 text-brand-orange" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-display-xl font-display text-foreground">
          You&apos;re all set!
        </h1>
        <p className="text-body-lg font-body text-muted-foreground">
          Your workspace <span className="font-medium text-foreground">{workspaceName}</span> is ready.
        </p>
      </div>

      <Button
        size="lg"
        onClick={() => router.push('/dashboard')}
        className="mt-4"
      >
        Go to Dashboard
      </Button>

      <p className="text-body-sm text-muted-foreground">
        Redirecting automatically in a few seconds...
      </p>
    </div>
  );
}
