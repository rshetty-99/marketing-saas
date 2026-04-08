'use client';

import { usePathname } from 'next/navigation';
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Global header that hides itself on auth routes (/sign-in, /sign-up)
 * where the AuthLayout provides its own brand mark.
 */
export function AppHeader() {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth-callback') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/portal');

  if (isAuthRoute) return null;

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-14 border-b border-border">
      <ThemeToggle />
      <Show when="signed-out">
        <SignInButton forceRedirectUrl="/auth-callback" />
        <SignUpButton forceRedirectUrl="/auth-callback">
          <button className="bg-primary text-primary-foreground rounded-md font-ui text-sm font-medium h-10 px-5 cursor-pointer hover:bg-brand-orange-hover transition-colors">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
