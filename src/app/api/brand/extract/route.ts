/**
 * POST /api/brand/extract — Extract brand assets from a website URL (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { extractBrandFromUrl } from '@/lib/f8/brand-service';
import { extractBrandFromUrlSchema } from '@/lib/validations/entity-profile';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('brand.create_edit_profile');
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const parsed = extractBrandFromUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const extracted = await extractBrandFromUrl(parsed.data.url);
    return NextResponse.json({ extracted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Extraction failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
