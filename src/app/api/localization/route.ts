/**
 * Localization API
 * GET: Get locale config or list content locales
 * POST: Create translation or update config
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getLocaleConfig, updateLocaleConfig, listLocales, createLocale, translateContent } from '@/lib/platform/localization-service';
import { z } from 'zod';

const translateSchema = z.object({
  contentDraftId: z.string(),
  title: z.string(),
  content: z.string(),
  targetLocale: z.string().min(2).max(5),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;

  const draftId = req.nextUrl.searchParams.get('draftId');
  if (draftId) {
    return NextResponse.json({ locales: await listLocales(auth.workspaceId, draftId) });
  }
  return NextResponse.json({ config: await getLocaleConfig(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'updateConfig') {
    await updateLocaleConfig(auth.workspaceId, body);
    return NextResponse.json({ success: true });
  }

  const parsed = translateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const translated = await translateContent(parsed.data.title, parsed.data.content, parsed.data.targetLocale);
  const id = await createLocale(auth.workspaceId, {
    contentDraftId: parsed.data.contentDraftId,
    locale: parsed.data.targetLocale,
    ...translated,
  }, auth.userId);

  return NextResponse.json({ id, translated }, { status: 201 });
}
