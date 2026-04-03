/**
 * Content Migration API
 * GET: List migration jobs
 * POST: Create and run migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listMigrationJobs, createMigrationJob, processMigration } from '@/lib/platform/migration-service';
import { z } from 'zod';

const createSchema = z.object({
  source: z.enum(['hootsuite', 'buffer', 'later', 'sprout_social', 'hubspot', 'csv', 'wordpress']),
  config: z.object({
    importContent: z.boolean().optional(),
    importScheduled: z.boolean().optional(),
    importAnalytics: z.boolean().optional(),
    importSubscribers: z.boolean().optional(),
  }).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ jobs: await listMigrationJobs(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const jobId = await createMigrationJob(auth.workspaceId, parsed.data, auth.userId);
  await processMigration(auth.workspaceId, jobId);
  return NextResponse.json({ jobId }, { status: 201 });
}
