import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { adminDb } from '@/lib/firebase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminSubscriptionsPage() {
  const auth = await requirePlatformAuth('subscriptions.view_all');
  if (!auth) redirect('/sign-in');

  const workspaces = await adminDb.collection('workspaces').where('parentWorkspaceId', '==', null).limit(50).get();
  const subs = workspaces.docs.map((ws) => {
    const d = ws.data();
    return { id: ws.id, name: d.name as string, tier: d.tier as string, status: d.status as string, accountType: d.accountType as string };
  });

  return (
    <div className="space-y-6" data-testid="admin-subscriptions">
      <h1 className="text-heading-xl font-display text-foreground">Subscriptions</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="py-4 text-center"><p className="text-heading-lg font-display">{subs.filter((s) => s.status === 'trial').length}</p><p className="text-label text-muted-foreground">Trials</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-heading-lg font-display">{subs.filter((s) => s.status === 'active').length}</p><p className="text-label text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="py-4 text-center"><p className="text-heading-lg font-display">{subs.filter((s) => s.status === 'soft_locked').length}</p><p className="text-label text-muted-foreground">Soft Locked</p></CardContent></Card>
      </div>
      <Card><CardContent className="py-0">
        <table className="w-full"><thead><tr className="border-b text-left text-label text-muted-foreground">
          <th className="py-3 px-2">Workspace</th><th className="py-3 px-2">Tier</th><th className="py-3 px-2">Status</th><th className="py-3 px-2">Type</th>
        </tr></thead><tbody>
          {subs.map((s) => (
            <tr key={s.id} className="border-b border-border/50">
              <td className="py-2 px-2 font-ui text-sm">{s.name as string}</td>
              <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{s.tier as string}</Badge></td>
              <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{s.status as string}</Badge></td>
              <td className="py-2 px-2 text-[11px] text-muted-foreground">{s.accountType as string}</td>
            </tr>
          ))}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
