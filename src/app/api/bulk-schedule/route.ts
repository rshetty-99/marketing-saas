import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listBulkJobs, createBulkJob, processBulkJob } from '@/lib/marketing/bulk-schedule-service';
import { z } from 'zod';

const importSchema = z.object({
  fileName: z.string(),
  rows: z.array(z.record(z.string(), z.string())).min(1).max(500),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ jobs: await listBulkJobs(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const jobId = await createBulkJob(auth.workspaceId, { fileName: parsed.data.fileName, totalRows: parsed.data.rows.length }, auth.userId);
  const result = await processBulkJob(auth.workspaceId, jobId, parsed.data.rows);
  return NextResponse.json({ jobId, ...result }, { status: 201 });
}
