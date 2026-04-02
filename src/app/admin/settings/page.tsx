import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  const auth = await requirePlatformAuth('settings.configure_global');
  if (!auth) redirect('/sign-in');

  return (
    <div className="space-y-6" data-testid="admin-settings">
      <h1 className="text-heading-xl font-display text-foreground">Platform Settings</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="font-display text-sm">Platform Name</CardTitle></CardHeader>
          <CardContent><p className="font-ui text-sm">Aura.ai</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-sm">Default Trial Duration</CardTitle></CardHeader>
          <CardContent><p className="font-ui text-sm">15 days</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-sm">Max Workspaces per User</CardTitle></CardHeader>
          <CardContent><p className="font-ui text-sm">5</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-sm">Webhook Configuration</CardTitle></CardHeader>
          <CardContent><Badge variant="outline">Not configured</Badge></CardContent>
        </Card>
      </div>
    </div>
  );
}
