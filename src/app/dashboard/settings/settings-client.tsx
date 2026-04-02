'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Settings, Building2, Bell, Trash2, ClipboardCheck } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface SettingsPageClientProps {
  workspace: {
    name: string;
    industry: string;
    timezone: string;
    locale: string;
    primaryEmail: string;
  };
  entityProfile: {
    legalName: string;
    phone: string;
    website: string;
    address: Record<string, string>;
    socialLinks: Record<string, string>;
    companySize: string;
    foundedYear: number | null;
    description: string;
  };
  notificationSettings: Record<string, unknown> | null;
  readOnly: boolean;
  isOwner: boolean;
  workspaceName: string;
}

type Tab = 'general' | 'profile' | 'approvals' | 'notifications' | 'danger';

export function SettingsPageClient({
  workspace,
  entityProfile,
  readOnly,
  isOwner,
  workspaceName,
}: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // General form state
  const [general, setGeneral] = useState(workspace);

  // Profile form state
  const [profile, setProfile] = useState(entityProfile);

  async function saveGeneral() {
    setIsSaving(true);
    await fetch('/api/settings/general', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(general),
    });
    setIsSaving(false);
  }

  async function saveProfile() {
    setIsSaving(true);
    await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setIsSaving(false);
  }

  async function handleDelete() {
    if (deleteConfirmName !== workspaceName) return;
    await fetch('/api/settings/danger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', confirmWorkspaceName: deleteConfirmName }),
    });
    window.location.href = '/';
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'profile', label: 'Profile', icon: Building2 },
    { key: 'approvals', label: 'Approvals', icon: ClipboardCheck },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    ...(isOwner ? [{ key: 'danger' as Tab, label: 'Danger Zone', icon: Trash2 }] : []),
  ];

  return (
    <>
      <h1 className="text-heading-xl font-display text-foreground">Settings</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border" data-testid="settings-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`settings-tab-${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-body-sm font-ui border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-orange text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              } ${tab.key === 'danger' ? 'text-destructive' : ''}`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">General Settings</CardTitle>
            <CardDescription>Basic workspace configuration.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Workspace Name</Label>
                <Input value={general.name} onChange={(e) => setGeneral({ ...general, name: e.target.value })} disabled={readOnly} data-testid="settings-name-input" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Industry</Label>
                <Input value={general.industry} onChange={(e) => setGeneral({ ...general, industry: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Timezone</Label>
                <Input value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Primary Email</Label>
                <Input type="email" value={general.primaryEmail} onChange={(e) => setGeneral({ ...general, primaryEmail: e.target.value })} disabled={readOnly} />
              </div>
            </div>
            {!readOnly && (
              <Button onClick={saveGeneral} disabled={isSaving} className="w-fit" data-testid="save-general-button">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Business Profile</CardTitle>
            <CardDescription>Your organization&apos;s identity and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Legal Name</Label>
                <Input value={profile.legalName} onChange={(e) => setProfile({ ...profile, legalName: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Website</Label>
                <Input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Company Size</Label>
                <Input value={profile.companySize} onChange={(e) => setProfile({ ...profile, companySize: e.target.value })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} disabled={readOnly} />
              </div>
            </div>

            <h3 className="text-heading-md font-display mt-4">Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>City</Label>
                <Input value={profile.address.city ?? ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>State</Label>
                <Input value={profile.address.state ?? ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, state: e.target.value } })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Country</Label>
                <Input value={profile.address.country ?? ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, country: e.target.value } })} disabled={readOnly} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Postal Code</Label>
                <Input value={profile.address.postalCode ?? ''} onChange={(e) => setProfile({ ...profile, address: { ...profile.address, postalCode: e.target.value } })} disabled={readOnly} />
              </div>
            </div>

            {!readOnly && (
              <Button onClick={saveProfile} disabled={isSaving} className="w-fit">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <Card data-testid="approval-settings">
          <CardHeader>
            <CardTitle className="font-display">Approval Workflow</CardTitle>
            <CardDescription>Configure how content is reviewed before publishing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-ui text-sm font-medium">Require Approval</p>
                <p className="text-[11px] text-muted-foreground">Content must be approved before publishing</p>
              </div>
              <Select defaultValue="true" disabled={readOnly}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-ui text-sm font-medium">Self-Approval</p>
                <p className="text-[11px] text-muted-foreground">Allow managers to approve their own content</p>
              </div>
              <Select defaultValue="false" disabled={readOnly}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-ui text-sm font-medium">Escalation Threshold</p>
                <p className="text-[11px] text-muted-foreground">Hours before pending approvals escalate to admins</p>
              </div>
              <Select defaultValue="48" disabled={readOnly}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24h</SelectItem>
                  <SelectItem value="48">48h</SelectItem>
                  <SelectItem value="72">72h</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-ui text-sm font-medium">Auto-Approve Roles</p>
                <p className="text-[11px] text-muted-foreground">These roles bypass the approval workflow</p>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-[10px]">Owner</Badge>
                <Badge variant="outline" className="text-[10px]">Admin</Badge>
              </div>
            </div>

            {!readOnly && (
              <Button disabled={isSaving} className="w-fit">
                {isSaving ? 'Saving...' : 'Save Approval Settings'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Notification Preferences</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-muted-foreground">
              Notification settings will be configurable here. Per-category toggles for email, in-app, and Slack channels.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && isOwner && (
        <div className="space-y-4" data-testid="danger-zone">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="font-display text-destructive flex items-center gap-2">
                <AlertTriangle className="size-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Archive */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-ui text-sm font-medium text-foreground">Archive Workspace</p>
                  <p className="text-body-sm text-muted-foreground">Members get read-only access. Reactivate within 90 days.</p>
                </div>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                  Archive
                </Button>
              </div>

              {/* Delete */}
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <p className="font-ui text-sm font-medium text-destructive">Delete Workspace</p>
                  <p className="text-body-sm text-muted-foreground">Permanently delete all content, members, and data. 14-day grace period.</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  data-testid="delete-workspace-button"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-destructive flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  Delete Workspace
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete <strong>{workspaceName}</strong> and all its data.
                  Type the workspace name to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder={workspaceName}
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                data-testid="delete-confirm-input"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmName !== workspaceName}
                  onClick={handleDelete}
                  data-testid="confirm-delete-workspace"
                >
                  I understand, delete this workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
