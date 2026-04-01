import Link from 'next/link';
import { ROLE_DISPLAY, type WorkspaceRole } from '@/types/roles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InvitedMemberWelcomeProps {
  workspaceName: string;
  role: WorkspaceRole;
  inviterName: string;
}

export function InvitedMemberWelcome({
  workspaceName,
  role,
  inviterName,
}: InvitedMemberWelcomeProps) {
  const roleInfo = ROLE_DISPLAY[role];

  return (
    <div
      data-testid="invited-welcome"
      className="flex flex-col items-center gap-8 py-12 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-display-xl font-display text-foreground">
          Welcome to {workspaceName}
        </h1>
        <p className="text-body-lg font-body text-muted-foreground">
          {inviterName} invited you to collaborate.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-2 pt-2 text-center">
          <p className="text-body-sm text-muted-foreground">You&apos;ve been invited as</p>
          <p className="text-heading-lg font-display text-foreground">{roleInfo.label}</p>
          <p className="text-body-sm font-body text-muted-foreground">
            {roleInfo.description}
          </p>
        </CardContent>
      </Card>

      <Button asChild size="lg">
        <Link href="/dashboard">Get Started</Link>
      </Button>
    </div>
  );
}
