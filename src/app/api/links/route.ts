import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listShortLinks, createShortLink, listUTMTemplates, createUTMTemplate } from '@/lib/marketing/link-shortener-service';
import { z } from 'zod';

const createLinkSchema = z.object({
  originalUrl: z.string().url(),
  customAlias: z.string().max(50).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'utm_templates') {
    return NextResponse.json({ templates: await listUTMTemplates(auth.workspaceId) });
  }
  return NextResponse.json({ links: await listShortLinks(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.type === 'utm_template') {
    const id = await createUTMTemplate(auth.workspaceId, body);
    return NextResponse.json({ id }, { status: 201 });
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await createShortLink(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
