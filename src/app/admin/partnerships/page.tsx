import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Handshake } from 'lucide-react';

export default async function AdminPartnershipsPage() {
  const auth = await requirePlatformAuth('partnerships.view_applications');
  if (!auth) redirect('/sign-in');

  return (
    <div className="space-y-6" data-testid="admin-partnerships">
      <h1 className="text-heading-xl font-display text-foreground">Agency Partnerships</h1>
      <Card><CardContent className="py-12 text-center">
        <Handshake className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-body-sm text-muted-foreground">No partnership applications yet. Agencies can apply from their workspace.</p>
      </CardContent></Card>
    </div>
  );
}
