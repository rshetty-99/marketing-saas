'use client';

import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  inviteTeamSchema,
  type InviteTeamInput,
} from '@/lib/validations/onboarding';
import type { WorkspaceRole } from '@/types/roles';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RolePicker } from './RolePicker';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface TeamInviteFormProps {
  onSubmit: (data: InviteTeamInput) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const ASSIGNABLE_ROLES: WorkspaceRole[] = ['admin', 'manager', 'editor', 'viewer'];

export function TeamInviteForm({ onSubmit, onSkip, isLoading }: TeamInviteFormProps) {
  const [showPaste, setShowPaste] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteTeamInput>({
    resolver: zodResolver(inviteTeamSchema),
    defaultValues: {
      invitations: [{ email: '', role: 'editor' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invitations',
  });

  const watchedInvitations = watch('invitations');

  const handlePasteEmails = useCallback(() => {
    const emails = pasteValue
      .split(/[,\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emails.length === 0) return;

    const newInvitations = emails.map((email) => ({
      email,
      role: 'editor' as const,
    }));

    // Replace the current invitations with pasted ones appended
    const existing = watchedInvitations.filter((inv) => inv.email.trim() !== '');
    const merged = [...existing, ...newInvitations];
    setValue('invitations', merged, { shouldValidate: true });
    setPasteValue('');
    setShowPaste(false);
  }, [pasteValue, watchedInvitations, setValue]);

  return (
    <form
      data-testid="team-invite-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div data-testid="team-invite-list" className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3">
            <div className="flex-1">
              <Label htmlFor={`invite-email-${index}`} className="sr-only">
                Email
              </Label>
              <Input
                id={`invite-email-${index}`}
                data-testid={index === 0 ? 'team-invite-email-input' : `team-invite-email-input-${index}`}
                type="email"
                placeholder="colleague@company.com"
                aria-invalid={!!errors.invitations?.[index]?.email}
                {...register(`invitations.${index}.email`)}
              />
              {errors.invitations?.[index]?.email && (
                <p data-testid={index === 0 ? 'team-invite-email-error' : `team-invite-email-error-${index}`} className="mt-1 text-body-sm text-destructive">
                  {errors.invitations[index].email.message}
                </p>
              )}
            </div>
            <div data-testid={index === 0 ? 'team-invite-role-select' : `team-invite-role-select-${index}`} className="w-36">
              <RolePicker
                roles={ASSIGNABLE_ROLES}
                value={watchedInvitations[index]?.role ?? 'editor'}
                onChange={(role) =>
                  setValue(`invitations.${index}.role` as const, role as InviteTeamInput['invitations'][number]['role'], {
                    shouldValidate: true,
                  })
                }
              />
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label="Remove invite row"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="team-invite-add-button"
          onClick={() => append({ email: '', role: 'editor' })}
        >
          <Plus className="size-3.5" />
          Add another
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPaste(!showPaste)}
        >
          Paste emails
        </Button>
      </div>

      {showPaste && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="paste-emails">Paste comma-separated emails</Label>
          <textarea
            id="paste-emails"
            className="min-h-20 w-full rounded-md border border-input bg-input/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
            placeholder="alice@example.com, bob@example.com"
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={handlePasteEmails}>
            Add pasted emails
          </Button>
        </div>
      )}

      {errors.invitations?.root && (
        <p className="text-body-sm text-destructive">{errors.invitations.root.message}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          data-testid="invite-skip"
          onClick={onSkip}
          disabled={isLoading}
          size="lg"
        >
          Skip
        </Button>
        <Button
          type="submit"
          data-testid="invite-submit"
          disabled={isLoading}
          size="lg"
          className="flex-1"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Send Invites
        </Button>
      </div>
    </form>
  );
}
