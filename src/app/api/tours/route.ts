/**
 * Guided Tours API
 * GET: List all tours or fetch specific tour
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listTours, getTour } from '@/lib/onboarding-tours/tour-service';

export async function GET(req: NextRequest) {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const tourId = req.nextUrl.searchParams.get('tourId');
  if (tourId) {
    const tour = getTour(tourId);
    if (!tour) return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    return NextResponse.json({ tour });
  }

  return NextResponse.json({ tours: listTours() });
}
