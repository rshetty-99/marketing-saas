/**
 * GET /api/brand — Get brand profile (all roles)
 * PATCH /api/brand — Update brand profile (admin+ for edit, manager+ for assets)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getBrandProfile, updateBrandProfile } from '@/lib/f8/brand-service';
import { updateBrandProfileSchema } from '@/lib/validations/entity-profile';

export async function GET() {
  const authResult = await requireWorkspaceAuth('brand.view_profile');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const profile = await getBrandProfile(workspaceId);

  if (!profile) {
    return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
  }

  return NextResponse.json({ brand: profile });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('brand.create_edit_profile');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = updateBrandProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await updateBrandProfile(workspaceId, parsed.data, userId);

  return NextResponse.json({ success: true });
}
