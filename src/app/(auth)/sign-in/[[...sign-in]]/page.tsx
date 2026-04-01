import { SignIn } from '@clerk/nextjs';
import { AuthLayout } from '@/components/features/auth/AuthLayout';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your Aura workspace to continue creating."
    >
      <SignIn
        forceRedirectUrl="/auth-callback"
        appearance={{
          elements: {
            rootBox: 'w-full',
            cardBox: 'w-full shadow-none',
            card: 'w-full bg-transparent border-none shadow-none p-0 gap-6',
            headerTitle: 'sr-only',
            headerSubtitle: 'sr-only',
            socialButtons: 'gap-3',
            socialButtonsBlockButton:
              'bg-card border border-border text-foreground font-ui text-sm h-11 rounded-lg hover:bg-accent transition-colors',
            socialButtonsBlockButtonText: 'font-ui text-sm',
            dividerLine: 'bg-border',
            dividerText: 'font-ui text-label text-muted-foreground uppercase tracking-widest',
            formFieldLabel: 'font-ui text-body-sm text-foreground',
            formFieldInput:
              'bg-card border-border text-foreground h-11 rounded-lg font-body text-body-sm placeholder:text-muted-foreground focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20',
            formButtonPrimary:
              'bg-brand-orange hover:bg-brand-orange-hover text-brand-void font-ui text-sm h-11 rounded-lg shadow-none transition-colors',
            footerAction: 'pt-4',
            footerActionText: 'font-body text-body-sm text-muted-foreground',
            footerActionLink:
              'font-ui text-body-sm text-brand-indigo hover:text-brand-indigo-hover underline-offset-4',
            formFieldAction:
              'font-body text-body-sm text-muted-foreground hover:text-foreground',
            identityPreview: 'bg-card border border-border rounded-lg',
            identityPreviewText: 'font-body text-body-sm text-foreground',
            identityPreviewEditButton: 'text-brand-orange hover:text-brand-orange-hover',
            otpCodeFieldInput: 'border-border text-foreground',
            formResendCodeLink: 'text-brand-indigo hover:text-brand-indigo-hover font-ui text-sm',
            alert: 'bg-destructive/10 border-destructive/20 text-destructive rounded-lg',
            alertText: 'font-body text-body-sm',
          },
          layout: {
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
          },
        }}
      />
      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="font-body text-body-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
}
