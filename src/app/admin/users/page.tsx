import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { adminDb } from '@/lib/firebase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, UserX, Eye } from 'lucide-react';

export default async function AdminUsersPage() {
  const auth = await requirePlatformAuth('users.search_view');
  if (!auth) redirect('/sign-in');

  // Fetch all workspace members across all workspaces (platform-level view)
  const workspaces = await adminDb.collection('workspaces').limit(50).get();
  const allMembers: Record<string, unknown>[] = [];
  for (const ws of workspaces.docs) {
    const members = await adminDb.collection('workspaces').doc(ws.id).collection('members').limit(20).get();
    for (const m of members.docs) {
      allMembers.push({ ...m.data(), workspaceId: ws.id, workspaceName: ws.data().name });
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-xl font-display text-foreground">User Management</h1>
        <Badge variant="outline">{allMembers.length} users</Badge>
      </div>
      <Card>
        <CardContent className="py-0">
          <table className="w-full">
            <thead><tr className="border-b text-left text-label text-muted-foreground">
              <th className="py-3 px-2">User</th><th className="py-3 px-2">Workspace</th><th className="py-3 px-2">Role</th><th className="py-3 px-2">Status</th><th className="py-3 px-2">Actions</th>
            </tr></thead>
            <tbody>
              {allMembers.slice(0, 50).map((m, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 px-2"><p className="font-ui text-sm">{m.displayName as string}</p><p className="text-[11px] text-muted-foreground">{m.email as string}</p></td>
                  <td className="py-2 px-2 text-body-sm text-muted-foreground">{m.workspaceName as string}</td>
                  <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{m.role as string}</Badge></td>
                  <td className="py-2 px-2"><Badge className={m.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'} variant="outline">{m.status as string}</Badge></td>
                  <td className="py-2 px-2"><Button variant="ghost" size="icon-sm"><Eye className="size-3.5" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
