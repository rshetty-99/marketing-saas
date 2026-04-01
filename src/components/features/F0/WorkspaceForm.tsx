'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
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
import { Loader2 } from 'lucide-react';

interface WorkspaceFormProps {
  onSubmit: (data: CreateWorkspaceInput) => void;
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

export function WorkspaceForm({ onSubmit, isLoading }: WorkspaceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      industry: undefined,
    },
  });

  const industryValue = watch('industry');

  return (
    <form
      data-testid="workspace-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          data-testid="workspace-name-input"
          placeholder="My workspace"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-body-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="workspace-industry">Industry (optional)</Label>
        <Select
          value={industryValue ?? ''}
          onValueChange={(val) => setValue('industry', val, { shouldValidate: true })}
        >
          <SelectTrigger id="workspace-industry" className="w-full">
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

      <Button
        type="submit"
        data-testid="workspace-submit"
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        Continue
      </Button>
    </form>
  );
}
