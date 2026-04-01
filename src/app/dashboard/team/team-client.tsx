'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus, Link2, MoreHorizontal, Shield, AlertTriangle } from 'lucide-react';

interface Member {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  title: string;
  department: string;
  employmentType: string;
  availabilityStatus: string;
  joinedAt: string | null;
  lastActiveAt: string | null;
}

interface TeamPageClientProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  workspaceName: string;
  isOwner: boolean;
  workspaceId: string;
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-brand-orange/15 text-brand-orange border-brand-orange/25',
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  manager: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  editor: 'bg-green-500/15 text-green-400 border-green-500/25',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const AVAILABILITY_COLORS: Record<string, string> = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  away: 'bg-orange-500',
  on_leave: 'bg-muted-foreground',
};

export function TeamPageClient({
  members,
  currentUserId,
  currentUserRole,
  workspaceName,
  isOwner,
  workspaceId,
}: TeamPageClientProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [roleConfirm, setRoleConfirm] = useState<{ userId: string; newRole: string } | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);

  const activeMembers = members.filter((m) => m.status === 'active');
  const invitedMembers = members.filter((m) => m.status === 'invited');
  const deactivatedMembers = members.filter((m) => m.status === 'deactivated');

  async function handleInvite() {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await fetch('/api/team/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitations: [{ email: inviteEmail, role: inviteRole }] }),
      });
      setInviteEmail('');
      setShowInvite(false);
      window.location.reload();
    } catch {
      // handle error
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRoleChange() {
    if (!roleConfirm) return;
    await fetch(`/api/team/members/${roleConfirm.userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleConfirm.newRole }),
    });
    setRoleConfirm(null);
    window.location.reload();
  }

  async function handleDeactivate() {
    if (!deactivateConfirm) return;
    await fetch(`/api/team/members/${deactivateConfirm}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setDeactivateConfirm(null);
    window.location.reload();
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-xl font-display text-foreground">Team</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}
            {invitedMembers.length > 0 && ` · ${invitedMembers.length} pending`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {/* create invite link */}}>
            <Link2 className="size-4 mr-1.5" />
            Invite Link
          </Button>
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="size-4 mr-1.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Active Members */}
      <div className="space-y-2" data-testid="team-members-list">
        {activeMembers.map((member) => (
          <Card key={member.userId} data-testid={`team-member-${member.userId}`}>
            <CardContent className="flex items-center gap-4 py-3">
              {/* Avatar + availability dot */}
              <div className="relative">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${AVAILABILITY_COLORS[member.availabilityStatus] ?? 'bg-muted'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-ui text-sm font-medium text-foreground truncate">
                    {member.displayName}
                  </span>
                  {member.userId === currentUserId && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                  <span className="truncate">{member.email}</span>
                  {member.title && <span>· {member.title}</span>}
                </div>
              </div>

              {/* Role badge */}
              <Badge className={ROLE_COLORS[member.role] ?? ROLE_COLORS.viewer}>
                <Shield className="size-3 mr-1" />
                {member.role}
              </Badge>

              {/* Employment type */}
              {member.employmentType !== 'full_time' && (
                <Badge variant="outline" className="text-[10px]">
                  {member.employmentType.replace('_', ' ')}
                </Badge>
              )}

              {/* Actions */}
              {member.userId !== currentUserId && member.role !== 'owner' && (
                <div className="flex gap-1">
                  <Select
                    value={member.role}
                    onValueChange={(newRole) => setRoleConfirm({ userId: member.userId, newRole })}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs" data-testid={`role-select-${member.userId}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserRole === 'owner' && <SelectItem value="admin">Admin</SelectItem>}
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeactivateConfirm(member.userId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Invitations */}
      {invitedMembers.length > 0 && (
        <div>
          <h2 className="text-heading-md font-display text-foreground mb-3">Pending Invitations</h2>
          <div className="space-y-2">
            {invitedMembers.map((member) => (
              <Card key={member.userId} className="opacity-60">
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">?</div>
                  <div className="flex-1">
                    <span className="font-ui text-sm text-foreground">{member.email}</span>
                  </div>
                  <Badge variant="outline">invited as {member.role}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join {workspaceName}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              data-testid="invite-email-input"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger data-testid="invite-role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentUserRole === 'owner' && <SelectItem value="admin">Admin</SelectItem>}
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={isInviting || !inviteEmail} data-testid="send-invite-button">
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation */}
      <Dialog open={!!roleConfirm} onOpenChange={() => setRoleConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Change Role</DialogTitle>
            <DialogDescription>
              Change this member&apos;s role to <strong>{roleConfirm?.newRole}</strong>? This takes effect immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleConfirm(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} data-testid="confirm-role-change">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog open={!!deactivateConfirm} onOpenChange={() => setDeactivateConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Deactivate Member
            </DialogTitle>
            <DialogDescription>
              This member will lose access to the workspace immediately. Their content and assignments can be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} data-testid="confirm-deactivate">
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
