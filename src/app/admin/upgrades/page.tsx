import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { adminDb } from '@/lib/firebase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function AdminUpgradesPage() {
  const auth = await requirePlatformAuth('upgrades.view_pending');
  if (!auth) redirect('/sign-in');

  const requests = await adminDb.collection('upgrade_requests').orderBy('createdAt', 'desc').limit(50).get();

  return (
    <div className="space-y-6" data-testid="admin-upgrades">
      <h1 className="text-heading-xl font-display text-foreground">Upgrade Requests</h1>
      {requests.empty ? (
        <Card><CardContent className="py-8 text-center"><p className="text-body-sm text-muted-foreground">No pending upgrade requests.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {requests.docs.map((doc) => {
            const r = doc.data();
            return (
              <Card key={doc.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-ui text-sm">{r.currentAccountType} → {r.requestedAccountType}</p>
                    <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={r.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' : r.status === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}>{r.status}</Badge>
                    {r.status === 'pending' && (<><Button size="sm" variant="outline" className="text-green-500"><CheckCircle className="size-3.5 mr-1" />Approve</Button><Button size="sm" variant="outline" className="text-red-500"><XCircle className="size-3.5 mr-1" />Deny</Button></>)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
