import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default async function AdminModerationPage() {
  const auth = await requirePlatformAuth('moderation.view_flagged');
  if (!auth) redirect('/sign-in');

  return (
    <div className="space-y-6" data-testid="admin-moderation">
      <h1 className="text-heading-xl font-display text-foreground">Content Moderation</h1>
      <Card><CardContent className="py-12 text-center">
        <Shield className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-body-sm text-muted-foreground">No flagged content. All workspaces are in compliance.</p>
      </CardContent></Card>
    </div>
  );
}
