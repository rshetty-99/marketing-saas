'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  quickBrandSchema,
  type QuickBrandInput,
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

interface QuickBrandFormProps {
  onSubmit: (data: QuickBrandInput) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const VOICE_TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'playful', label: 'Playful' },
] as const;

export function QuickBrandForm({ onSubmit, onSkip, isLoading }: QuickBrandFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickBrandInput>({
    resolver: zodResolver(quickBrandSchema),
    defaultValues: {
      brandName: '',
      primaryColor: '#FF4D00',
      voiceTone: 'professional',
    },
  });

  const colorValue = watch('primaryColor');
  const voiceTone = watch('voiceTone');

  return (
    <form
      data-testid="brand-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="brand-name">Brand name</Label>
        <Input
          id="brand-name"
          data-testid="brand-name-input"
          placeholder="Your brand name"
          aria-invalid={!!errors.brandName}
          {...register('brandName')}
        />
        {errors.brandName && (
          <p className="text-body-sm text-destructive">{errors.brandName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="brand-color">Primary color</Label>
        <div className="flex items-center gap-3">
          <div
            className="size-7 shrink-0 rounded-md border border-input"
            aria-hidden="true"
            style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorValue) ? colorValue : '#000000' }}
          />
          <Input
            id="brand-color"
            placeholder="#FF4D00"
            aria-invalid={!!errors.primaryColor}
            {...register('primaryColor')}
          />
        </div>
        {errors.primaryColor && (
          <p className="text-body-sm text-destructive">Enter a valid hex color (e.g. #FF4D00)</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="voice-tone">Voice tone</Label>
        <Select
          value={voiceTone}
          onValueChange={(val) =>
            setValue('voiceTone', val as QuickBrandInput['voiceTone'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="voice-tone" className="w-full">
            <SelectValue placeholder="Select a tone" />
          </SelectTrigger>
          <SelectContent>
            {VOICE_TONE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          data-testid="brand-skip"
          onClick={onSkip}
          disabled={isLoading}
          size="lg"
        >
          Skip for now
        </Button>
        <Button type="submit" disabled={isLoading} size="lg" className="flex-1">
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          Continue
        </Button>
      </div>
    </form>
  );
}
