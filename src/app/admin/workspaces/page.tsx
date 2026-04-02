import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { adminDb } from '@/lib/firebase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default async function AdminWorkspacesPage() {
  const auth = await requirePlatformAuth('workspaces.view_any');
  if (!auth) redirect('/sign-in');

  const workspaces = await adminDb.collection('workspaces').where('parentWorkspaceId', '==', null).orderBy('createdAt', 'desc').limit(50).get();

  const STATUS_COLORS: Record<string, string> = {
    trial: 'bg-yellow-500/15 text-yellow-400', active: 'bg-green-500/15 text-green-400',
    soft_locked: 'bg-red-500/15 text-red-400', archived: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6" data-testid="admin-workspaces">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl font-display text-foreground">Workspace Management</h1>
        <Badge variant="outline">{workspaces.size} workspaces</Badge>
      </div>
      <Card>
        <CardContent className="py-0">
          <table className="w-full">
            <thead><tr className="border-b text-left text-label text-muted-foreground">
              <th className="py-3 px-2">Workspace</th><th className="py-3 px-2">Type</th><th className="py-3 px-2">Tier</th><th className="py-3 px-2">Status</th><th className="py-3 px-2">Actions</th>
            </tr></thead>
            <tbody>
              {workspaces.docs.map((ws) => {
                const d = ws.data();
                return (
                  <tr key={ws.id} className="border-b border-border/50">
                    <td className="py-2 px-2"><p className="font-ui text-sm">{d.name}</p><p className="text-[11px] text-muted-foreground">{ws.id}</p></td>
                    <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{d.accountType}</Badge></td>
                    <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{d.tier}</Badge></td>
                    <td className="py-2 px-2"><Badge className={STATUS_COLORS[d.status] ?? ''} variant="outline">{d.status}</Badge></td>
                    <td className="py-2 px-2"><Button variant="ghost" size="icon-sm"><Eye className="size-3.5" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
