import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listCompetitors, createCompetitor, listBenchmarkSnapshots } from '@/lib/marketing/competitor-benchmark-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  websiteUrl: z.string().url().optional(),
  socialAccounts: z.array(z.object({
    platform: z.string(),
    handle: z.string(),
    followerCount: z.number().optional(),
    engagementRate: z.number().optional(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const competitorId = req.nextUrl.searchParams.get('benchmarks');
  if (competitorId) {
    return NextResponse.json({ snapshots: await listBenchmarkSnapshots(auth.workspaceId, competitorId) });
  }
  return NextResponse.json({ competitors: await listCompetitors(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createCompetitor(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
