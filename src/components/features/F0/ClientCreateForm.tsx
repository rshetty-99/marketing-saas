'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createClientSchema,
  type CreateClientInput,
} from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailableMember {
  id: string;
  name: string;
  role: string;
}

interface ClientCreateFormProps {
  onSubmit: (data: CreateClientInput) => void;
  onSkip: () => void;
  availableMembers: AvailableMember[];
  isLoading?: boolean;
}

const INDUSTRY_OPTIONS = [
  'Marketing',
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Real Estate',
  'Other',
] as const;

export function ClientCreateForm({
  onSubmit,
  onSkip,
  availableMembers,
  isLoading,
}: ClientCreateFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      contactEmail: '',
      industry: undefined,
      assignedTeamMemberIds: [],
    },
  });

  const industryValue = watch('industry');
  const assignedIds = watch('assignedTeamMemberIds') ?? [];

  function toggleMember(memberId: string) {
    const current = assignedIds;
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    setValue('assignedTeamMemberIds', next, { shouldValidate: true });
  }

  return (
    <form
      data-testid="client-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-name">Client name</Label>
        <Input
          id="client-name"
          data-testid="client-name-input"
          placeholder="Acme Corp"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-body-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="client-email">Contact email</Label>
        <Input
          id="client-email"
          data-testid="client-email-input"
          type="email"
          placeholder="contact@client.com"
          aria-invalid={!!errors.contactEmail}
          {...register('contactEmail')}
        />
        {errors.contactEmail && (
          <p className="text-body-sm text-destructive">{errors.contactEmail.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="client-industry">Industry (optional)</Label>
        <Select
          value={industryValue ?? ''}
          onValueChange={(val) => setValue('industry', val, { shouldValidate: true })}
        >
          <SelectTrigger id="client-industry" data-testid="client-industry-select" className="w-full">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableMembers.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Assign team members</Label>
          <div className="flex flex-col gap-1.5">
            {availableMembers.map((member) => {
              const isChecked = assignedIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                    isChecked
                      ? 'border-brand-orange/40 bg-brand-orange/5'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                      isChecked
                        ? 'border-brand-orange bg-brand-orange text-white'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {isChecked && <Check className="size-3" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-sm font-medium">{member.name}</span>
                    <span className="text-body-sm text-muted-foreground">{member.role}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          data-testid="client-skip"
          onClick={onSkip}
          disabled={isLoading}
          size="lg"
        >
          Skip
        </Button>
        <Button
          type="submit"
          data-testid="client-submit"
          disabled={isLoading}
          size="lg"
          className="flex-1"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Create Client
        </Button>
      </div>
    </form>
  );
}
