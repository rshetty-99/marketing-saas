'use client';

import type { AccountType } from '@/types/roles';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AccountTypeSelectorProps {
  onSelect: (type: AccountType) => void;
  selected?: AccountType;
}

interface AccountOption {
  type: AccountType;
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
  testId: string;
}

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    type: 'freelancer',
    icon: User,
    title: 'Freelancer',
    description: 'I work independently',
    detail: 'Solo workspace, all features',
    testId: 'account-type-freelancer',
  },
  {
    type: 'organization',
    icon: Building2,
    title: 'Organization',
    description: "I'm part of a marketing team",
    detail: 'Team workspace with roles',
    testId: 'account-type-organization',
  },
  {
    type: 'agency',
    icon: Briefcase,
    title: 'Agency',
    description: 'I manage clients',
    detail: 'Multi-client workspaces',
    testId: 'account-type-agency',
  },
];

export function AccountTypeSelector({ onSelect, selected }: AccountTypeSelectorProps) {
  return (
    <div data-testid="account-type-selector" className="grid gap-4 sm:grid-cols-3">
      {ACCOUNT_OPTIONS.map((option) => {
        const isSelected = selected === option.type;
        const Icon = option.icon;

        return (
          <button
            key={option.type}
            type="button"
            data-testid={option.testId}
            aria-selected={isSelected}
            onClick={() => onSelect(option.type)}
            className="text-left"
          >
            <Card
              className={cn(
                'cursor-pointer border transition-all hover:border-brand-orange',
                isSelected && 'border-brand-orange ring-2 ring-brand-orange/30',
              )}
            >
              <CardContent className="flex flex-col items-center gap-3 pt-2 text-center">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg bg-muted transition-colors',
                    isSelected && 'bg-brand-orange/15 text-brand-orange',
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-heading-md font-display">{option.title}</h3>
                  <p className="text-body-sm font-body text-muted-foreground">
                    {option.description}
                  </p>
                  <p className="text-body-sm font-body text-muted-foreground/70">
                    {option.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
