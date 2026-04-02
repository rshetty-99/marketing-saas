/**
 * GET /api/publish — List publish jobs
 * POST /api/publish — Create a publish job
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createPublishJob, listPublishJobs } from '@/lib/f3/publishing-service';
import { createPublishJobSchema } from '@/lib/validations/content';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('publishing.publish');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { searchParams } = new URL(request.url);

  const jobs = await listPublishJobs(workspaceId, {
    status: searchParams.get('status') ?? undefined,
    limit: parseInt(searchParams.get('limit') ?? '50', 10),
  });

  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('publishing.publish');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = createPublishJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const jobId = await createPublishJob(workspaceId, parsed.data, userId);

  return NextResponse.json({ jobId });
}
