import { adminDb } from '@/lib/firebase/admin';
import { platformUserConverter } from '@/lib/firebase/converters/workspace';
import { Badge } from '@/components/ui/badge';
import type { PlatformUser } from '@/types/features/f0';
import type { Timestamp } from 'firebase-admin/firestore';

function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return 'Never';
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function roleBadgeVariant(role: PlatformUser['role']): string {
  switch (role) {
    case 'super_admin':
    case 'platform_admin':
      return 'bg-brand-orange/15 text-brand-orange border-brand-orange/25';
    case 'partner_manager':
    case 'operations':
      return 'bg-brand-indigo/15 text-brand-indigo border-brand-indigo/25';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export async function PlatformTeamTable() {
  const snapshot = await adminDb
    .collection('platform_users')
    .withConverter(platformUserConverter)
    .orderBy('createdAt', 'desc')
    .get();

  const users = snapshot.docs.map((doc) => doc.data());

  return (
    <div data-testid="platform-team-table" className="flex flex-col gap-4">
      <h2 className="text-heading-xl font-display text-foreground">
        Platform Team
      </h2>

      {users.length === 0 ? (
        <p className="text-body-md font-body text-muted-foreground">
          No platform users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-label font-ui text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-label font-ui text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-label font-ui text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-label font-ui text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-label font-ui text-muted-foreground">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 text-body-sm font-body text-foreground">
                    {user.displayName}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={roleBadgeVariant(user.role)}>
                      {user.role.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body capitalize text-muted-foreground">
                    {user.status}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-body text-muted-foreground">
                    {formatDate(user.lastLoginAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
