import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listVideoProjects, createVideoProject, renderVideo } from '@/lib/marketing/video-editor-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  width: z.number().optional(),
  height: z.number().optional(),
  outputFormat: z.enum(['mp4', 'mov', 'webm']).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ projects: await listVideoProjects(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'render' && body.projectId) {
    await renderVideo(auth.workspaceId, body.projectId);
    return NextResponse.json({ success: true, status: 'rendering' });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createVideoProject(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
