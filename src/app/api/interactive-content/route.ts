/**
 * Interactive Content API (Quizzes, Calculators, Assessments)
 * GET: List interactive content
 * POST: Create new or submit response
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listInteractiveContent, createInteractiveContent, submitResponse, INTERACTIVE_TEMPLATES } from '@/lib/interactive-content/interactive-service';
import { z } from 'zod';

const createSchema = z.object({
  type: z.enum(['quiz', 'calculator', 'assessment']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  templateId: z.string().optional(),
});

const submitSchema = z.object({
  contentId: z.string().min(1),
  workspaceId: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), value: z.string(), score: z.number().optional() })),
  totalScore: z.number(),
  resultId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  gdprConsent: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');

  if (type === 'templates') {
    return NextResponse.json({ templates: INTERACTIVE_TEMPLATES });
  }

  // Public endpoint for fetching published content (embed)
  const contentId = req.nextUrl.searchParams.get('contentId');
  const workspaceId = req.nextUrl.searchParams.get('workspaceId');
  if (contentId && workspaceId) {
    const { getInteractiveContent } = await import('@/lib/interactive-content/interactive-service');
    const content = await getInteractiveContent(workspaceId, contentId);
    if (!content || (content as Record<string, unknown>).status !== 'published') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ content });
  }

  // Authenticated list
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  return NextResponse.json({ content: await listInteractiveContent(auth.workspaceId, status) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Public submission endpoint (no auth — like lead form)
  if (body.action === 'submit') {
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const result = await submitResponse(parsed.data.workspaceId, parsed.data.contentId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  }

  // Authenticated create
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // If template specified, merge template data
  let templateData = {};
  if (parsed.data.templateId) {
    const template = INTERACTIVE_TEMPLATES.find((t) => t.id === parsed.data.templateId);
    if (template) {
      templateData = { questions: template.questions, results: template.results };
    }
  }

  const result = await createInteractiveContent(auth.workspaceId, { ...parsed.data, ...templateData }, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
