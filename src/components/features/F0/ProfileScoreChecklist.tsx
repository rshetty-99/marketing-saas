'use client';

import { useMemo } from 'react';
import type { AccountType } from '@/types/roles';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  accountTypes: AccountType[];
}

const ALL_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'workspace_created',
    label: 'Create your workspace',
    href: '/dashboard/settings',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'brand_configured',
    label: 'Set up your brand voice',
    href: '/dashboard/brand',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'team_invited',
    label: 'Invite team members',
    href: '/dashboard/team',
    accountTypes: ['organization', 'agency'],
  },
  {
    id: 'client_created',
    label: 'Add your first client',
    href: '/dashboard/clients',
    accountTypes: ['agency'],
  },
  {
    id: 'first_content',
    label: 'Create your first content',
    href: '/dashboard/content/create',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'integration_connected',
    label: 'Connect a social account',
    href: '/dashboard/integrations',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'profile_updated',
    label: 'Complete your business profile',
    href: '/dashboard/settings',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'first_publish',
    label: 'Publish your first post',
    href: '/dashboard/content/publish',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'calendar_setup',
    label: 'Set up your content calendar',
    href: '/dashboard/calendar',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
  {
    id: 'analytics_viewed',
    label: 'Check your analytics',
    href: '/dashboard/analytics',
    accountTypes: ['freelancer', 'organization', 'agency'],
  },
];

interface ProfileScoreChecklistProps {
  completedActions: string[];
  accountType: AccountType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileScoreChecklist({
  completedActions,
  accountType,
  open,
  onOpenChange,
}: ProfileScoreChecklistProps) {
  const relevantItems = useMemo(
    () => ALL_CHECKLIST_ITEMS.filter((item) => item.accountTypes.includes(accountType)),
    [accountType],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="profile-checklist" side="right">
        <SheetHeader>
          <SheetTitle>Profile Setup</SheetTitle>
          <SheetDescription>
            Complete these steps to get the most out of Aura.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 px-6 py-4">
          {relevantItems.map((item) => {
            const isDone = completedActions.includes(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted',
                  isDone && 'opacity-70',
                )}
              >
                {isDone ? (
                  <CheckCircle className="size-4 shrink-0 text-green-500" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    'text-body-sm font-body',
                    isDone && 'line-through text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
