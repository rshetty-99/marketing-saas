'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SeedAlertsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      await fetch('/api/platform-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      router.refresh();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleSeed} disabled={loading}>
      <Plus className="size-4 mr-1.5" />{loading ? 'Seeding...' : 'Seed Sample Alerts'}
    </Button>
  );
}
