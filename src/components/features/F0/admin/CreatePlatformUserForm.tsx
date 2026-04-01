'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2 } from 'lucide-react';
import type { PlatformRole } from '@/types/roles';

const ASSIGNABLE_PLATFORM_ROLES: { value: PlatformRole; label: string }[] = [
  { value: 'platform_admin', label: 'Platform Admin' },
  { value: 'partner_manager', label: 'Partner Manager' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'content_moderator', label: 'Content Moderator' },
  { value: 'analyst', label: 'Analyst' },
];

const createPlatformUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum([
    'platform_admin',
    'partner_manager',
    'operations',
    'finance',
    'support',
    'content_moderator',
    'analyst',
  ]),
});

type CreatePlatformUserInput = z.infer<typeof createPlatformUserSchema>;

export function CreatePlatformUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePlatformUserInput>({
    resolver: zodResolver(createPlatformUserSchema),
    defaultValues: {
      email: '',
      displayName: '',
      role: 'analyst',
    },
  });

  const roleValue = watch('role');

  async function onSubmit(data: CreatePlatformUserInput) {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/platform-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || 'Failed to create platform user');
      }

      setMessage({ type: 'success', text: `Platform user ${data.email} created successfully.` });
      reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div data-testid="create-platform-user-form" className="flex flex-col gap-4">
      <h3 className="text-heading-md font-display text-foreground">
        Add Platform User
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="platform-user-email">Email</Label>
          <Input
            id="platform-user-email"
            type="email"
            placeholder="user@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-body-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="platform-user-name">Display Name</Label>
          <Input
            id="platform-user-name"
            placeholder="Jane Doe"
            aria-invalid={!!errors.displayName}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p className="text-body-sm text-destructive">{errors.displayName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="platform-user-role">Platform Role</Label>
          <Select
            value={roleValue}
            onValueChange={(val) =>
              setValue('role', val as CreatePlatformUserInput['role'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="platform-user-role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_PLATFORM_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-body-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        {message && (
          <p
            className={
              message.type === 'success'
                ? 'text-body-sm text-green-500'
                : 'text-body-sm text-destructive'
            }
          >
            {message.text}
          </p>
        )}

        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Create Platform User
        </Button>
      </form>
    </div>
  );
}
