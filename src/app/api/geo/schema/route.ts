/**
 * POST /api/geo/schema — Generate schema markup (JSON-LD)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { generateSchemaMarkup } from '@/lib/geo/geo-service';
import { z } from 'zod';

const schema = z.object({
  type: z.enum(['Article', 'FAQ', 'HowTo', 'Organization', 'Person', 'Product', 'Breadcrumb', 'WebSite', 'LocalBusiness']),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = generateSchemaMarkup(parsed.data.type, parsed.data.data);
  return NextResponse.json(result);
}
