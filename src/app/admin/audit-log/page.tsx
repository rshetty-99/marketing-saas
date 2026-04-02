import { redirect } from 'next/navigation';
import { requirePlatformAuth } from '@/lib/api/platform-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AdminAuditLogPage() {
  const auth = await requirePlatformAuth('settings.view_audit_logs');
  if (!auth) redirect('/sign-in');

  // Mock audit entries — in production, query platform_audit_log collection
  const entries = [
    { id: '1', action: 'platform_user.created', actor: 'Admin Supreme', target: 'Petra PlatformOps', timestamp: '2026-04-01 10:30' },
    { id: '2', action: 'workspace.trial_extended', actor: 'Oscar Operations', target: 'Acme Marketing Team', timestamp: '2026-04-01 09:15' },
    { id: '3', action: 'user.suspended', actor: 'Morgan Moderator', target: 'spammer@test.com', timestamp: '2026-03-31 16:45' },
    { id: '4', action: 'subscription.overridden', actor: 'Fiona FinanceOps', target: 'Bloom Digital', timestamp: '2026-03-31 14:20' },
    { id: '5', action: 'feature_flag.toggled', actor: 'Admin Supreme', target: 'ai_content_generation → enabled', timestamp: '2026-03-30 11:00' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-audit-log">
      <h1 className="text-heading-xl font-display text-foreground">Platform Audit Log</h1>
      <Card><CardContent className="py-0">
        <table className="w-full"><thead><tr className="border-b text-left text-label text-muted-foreground">
          <th className="py-3 px-2">Action</th><th className="py-3 px-2">Actor</th><th className="py-3 px-2">Target</th><th className="py-3 px-2">Time</th>
        </tr></thead><tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-border/50">
              <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{e.action}</Badge></td>
              <td className="py-2 px-2 font-ui text-sm">{e.actor}</td>
              <td className="py-2 px-2 text-body-sm text-muted-foreground">{e.target}</td>
              <td className="py-2 px-2 text-[11px] text-muted-foreground">{e.timestamp}</td>
            </tr>
          ))}
        </tbody></table>
      </CardContent></Card>
    </div>
  );
}
