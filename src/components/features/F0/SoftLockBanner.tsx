import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SoftLockBanner() {
  return (
    <div
      data-testid="soft-lock-banner"
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-4 shrink-0 text-yellow-500" />
        <p className="text-body-sm font-body text-yellow-200">
          Your trial has ended. Upgrade to continue creating.
        </p>
      </div>
      <Button asChild size="sm" className="bg-yellow-500 text-yellow-950 hover:bg-yellow-400">
        <Link href="/settings/billing">Upgrade</Link>
      </Button>
    </div>
  );
}
