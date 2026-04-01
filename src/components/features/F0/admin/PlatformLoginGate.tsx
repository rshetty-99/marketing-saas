import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { platformUserConverter } from '@/lib/firebase/converters/workspace';
import type { ReactNode } from 'react';

interface PlatformLoginGateProps {
  children: ReactNode;
}

export async function PlatformLoginGate({ children }: PlatformLoginGateProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const userDoc = await adminDb
    .collection('platform_users')
    .doc(userId)
    .withConverter(platformUserConverter)
    .get();

  const platformUser = userDoc.data();

  if (!platformUser || platformUser.status !== 'active') {
    redirect('/');
  }

  return <>{children}</>;
}
