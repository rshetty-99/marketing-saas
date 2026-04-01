'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/features/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'new-password'>('email');
  const [error, setError] = useState('');

  const isSubmitting = fetchStatus === 'fetching';

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Step 1: Create sign-in with the email identifier
    const createResult = await signIn.create({ identifier: email });
    if (createResult.error) {
      setError(createResult.error.longMessage ?? createResult.error.message);
      return;
    }

    // Step 2: Send the reset password email code
    const sendResult = await signIn.resetPasswordEmailCode.sendCode();
    if (sendResult.error) {
      setError(sendResult.error.longMessage ?? sendResult.error.message);
      return;
    }

    setStep('code');
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (result.error) {
      setError(result.error.longMessage ?? result.error.message);
      return;
    }

    if (signIn.status === 'needs_new_password') {
      setStep('new-password');
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (result.error) {
      setError(result.error.longMessage ?? result.error.message);
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl('/dashboard');
          if (url.startsWith('http')) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  }

  const headings: Record<typeof step, { heading: string; subheading: string }> = {
    email: {
      heading: 'Forgot password?',
      subheading: "Enter your email and we'll send you a reset code.",
    },
    code: {
      heading: 'Check your email',
      subheading: `We sent a 6-digit code to ${email}`,
    },
    'new-password': {
      heading: 'Set new password',
      subheading: 'Choose a strong password for your account.',
    },
  };

  const inputClass =
    'bg-card border-border text-foreground h-11 rounded-lg font-body text-body-sm placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20';

  const buttonClass =
    'w-full bg-brand-orange hover:bg-brand-orange-hover text-brand-void font-ui text-sm h-11 rounded-lg';

  return (
    <AuthLayout
      heading={headings[step].heading}
      subheading={headings[step].subheading}
    >
      {/* ─── Step 1: Email ─── */}
      {step === 'email' && (
        <form onSubmit={handleSendCode}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Field>
              <Button type="submit" disabled={isSubmitting} className={buttonClass}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Send reset code
              </Button>
            </Field>

            <FieldDescription className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3" />
                Back to sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      )}

      {/* ─── Step 2: Verify code ─── */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">Verification code</FieldLabel>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                className={`${inputClass} text-center tracking-[0.3em] placeholder:tracking-normal`}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Field>
              <Button type="submit" disabled={isSubmitting} className={buttonClass}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Verify code
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Didn&apos;t receive a code?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                }}
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Try again
              </button>
            </FieldDescription>
          </FieldGroup>
        </form>
      )}

      {/* ─── Step 3: New password ─── */}
      {step === 'new-password' && (
        <form onSubmit={handleResetPassword}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className={inputClass}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <Field>
              <Button type="submit" disabled={isSubmitting} className={buttonClass}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Reset password
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
    </AuthLayout>
  );
}
