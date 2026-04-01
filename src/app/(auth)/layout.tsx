import type { ReactNode } from 'react';

/**
 * Auth route group layout.
 * Renders children without the global header/nav bar,
 * since auth pages use the AuthLayout split-panel design.
 */
export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
