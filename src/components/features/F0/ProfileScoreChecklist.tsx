'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AccountType } from '@/types/roles';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, ChevronRight, ChevronLeft, SkipForward, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  accountTypes: AccountType[];
  icon: string;
}

const ALL_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'workspace_created',
    label: 'Create your workspace',
    description: 'Set up your workspace name, timezone, and basic settings. This is your central hub for all marketing activities.',
    href: '/dashboard/settings',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '🏢',
  },
  {
    id: 'brand_configured',
    label: 'Set up your brand voice',
    description: 'Define your brand tone, personality, and target audience so AI generates content that sounds like you.',
    href: '/dashboard/brand',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '🎨',
  },
  {
    id: 'team_invited',
    label: 'Invite team members',
    description: 'Add your team and assign roles. Editors create content, managers approve, owners manage billing.',
    href: '/dashboard/team',
    accountTypes: ['organization', 'agency'],
    icon: '👥',
  },
  {
    id: 'client_created',
    label: 'Add your first client',
    description: 'Create a client workspace with their brand profile, social accounts, and content pipeline.',
    href: '/dashboard/clients',
    accountTypes: ['agency'],
    icon: '🏗️',
  },
  {
    id: 'integration_connected',
    label: 'Connect a social account',
    description: 'Link your LinkedIn, Instagram, Twitter, or other social accounts to publish and track content directly.',
    href: '/dashboard/integrations',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '🔗',
  },
  {
    id: 'first_content',
    label: 'Create your first content',
    description: 'Use AI to generate a blog post, social update, or email. Choose your platform and let Cortex do the heavy lifting.',
    href: '/dashboard/content/create',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '✍️',
  },
  {
    id: 'first_publish',
    label: 'Publish your first post',
    description: 'Send your content live to one or more platforms. You can publish immediately or schedule for later.',
    href: '/dashboard/content/publish',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '🚀',
  },
  {
    id: 'calendar_setup',
    label: 'Set up your content calendar',
    description: 'Plan your week visually. Drag posts on the calendar, set deadlines, and never miss a publishing slot.',
    href: '/dashboard/calendar',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '📅',
  },
  {
    id: 'profile_updated',
    label: 'Complete your business profile',
    description: 'Add your company details, logo, address, and social links. This info appears on reports and emails.',
    href: '/dashboard/settings',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '📋',
  },
  {
    id: 'analytics_viewed',
    label: 'Check your analytics',
    description: 'View your content performance, engagement metrics, and audience growth across all connected platforms.',
    href: '/dashboard/analytics',
    accountTypes: ['freelancer', 'organization', 'agency'],
    icon: '📊',
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
  const router = useRouter();
  const relevantItems = useMemo(
    () => ALL_CHECKLIST_ITEMS.filter((item) => item.accountTypes.includes(accountType)),
    [accountType],
  );

  // Start at the first incomplete step
  const firstIncompleteIndex = useMemo(() => {
    const idx = relevantItems.findIndex((item) => !completedActions.includes(item.id));
    return idx === -1 ? 0 : idx;
  }, [relevantItems, completedActions]);

  const [currentStep, setCurrentStep] = useState(firstIncompleteIndex);

  const completedCount = relevantItems.filter((item) => completedActions.includes(item.id)).length;
  const totalSteps = relevantItems.length;
  const currentItem = relevantItems[currentStep];
  const isCurrentDone = currentItem ? completedActions.includes(currentItem.id) : false;

  function goNext() {
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  }

  function goPrev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function goToStep(item: ChecklistItem) {
    router.push(item.href);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="profile-checklist" side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display">Profile Setup</SheetTitle>
          <SheetDescription>
            Complete these steps to get the most out of Aura.
          </SheetDescription>
        </SheetHeader>

        {/* Progress bar */}
        <div className="px-6 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-ui text-muted-foreground">
              {completedCount} of {totalSteps} complete
            </span>
            <span className="text-xs font-ui font-medium text-brand-orange">
              {Math.round((completedCount / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-indigo transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators (mini dots) */}
        <div className="px-6 flex items-center gap-1.5 mb-4">
          {relevantItems.map((item, i) => {
            const isDone = completedActions.includes(item.id);
            const isCurrent = i === currentStep;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  isCurrent ? 'w-6 bg-brand-orange' : isDone ? 'w-2 bg-green-500' : 'w-2 bg-muted-foreground/30',
                )}
                aria-label={`Step ${i + 1}: ${item.label}`}
              />
            );
          })}
        </div>

        {/* Current step detail card */}
        {currentItem && (
          <div className="px-6 flex-1">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{currentItem.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Step {currentStep + 1}/{totalSteps}
                    </span>
                    {isCurrentDone && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-ui font-medium text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle className="size-3" /> Done
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-heading-md mt-1">{currentItem.label}</h3>
                </div>
              </div>
              <p className="text-body-sm text-muted-foreground leading-relaxed mb-4">
                {currentItem.description}
              </p>
              <Button
                onClick={() => goToStep(currentItem)}
                className={cn(
                  'w-full',
                  isCurrentDone
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'bg-brand-orange text-white hover:bg-brand-orange-hover',
                )}
                size="sm"
              >
                {isCurrentDone ? 'Review' : 'Go to this step'}
                <ExternalLink className="size-3.5 ml-1.5" />
              </Button>
            </div>

            {/* Step list (scrollable) */}
            <div className="mt-4 space-y-0.5 max-h-48 overflow-y-auto">
              {relevantItems.map((item, i) => {
                const isDone = completedActions.includes(item.id);
                const isCurrent = i === currentStep;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-left transition-colors',
                      isCurrent ? 'bg-brand-orange/10 border border-brand-orange/20' : 'hover:bg-muted',
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <Circle className={cn('size-4 shrink-0', isCurrent ? 'text-brand-orange' : 'text-muted-foreground/40')} />
                    )}
                    <span className={cn(
                      'text-sm font-ui',
                      isDone && 'line-through text-muted-foreground',
                      isCurrent && !isDone && 'font-medium text-foreground',
                      !isCurrent && !isDone && 'text-muted-foreground',
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={goNext}
            disabled={currentStep >= totalSteps - 1}
            className="text-muted-foreground gap-1.5"
          >
            <SkipForward className="size-3.5" />
            Skip
          </Button>

          <Button
            size="sm"
            onClick={goNext}
            disabled={currentStep >= totalSteps - 1}
            className="gap-1.5 bg-brand-orange text-white hover:bg-brand-orange-hover"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
