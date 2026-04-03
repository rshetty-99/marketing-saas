import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listReportTemplates, createReportTemplate, generateReport, listGeneratedReports } from '@/lib/marketing/report-builder-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.string().optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'on_demand']).optional(),
  format: z.enum(['pdf', 'html', 'csv']).optional(),
  recipientEmails: z.array(z.string().email()).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'generated') {
    const templateId = req.nextUrl.searchParams.get('templateId') ?? undefined;
    return NextResponse.json({ reports: await listGeneratedReports(auth.workspaceId, templateId) });
  }
  return NextResponse.json({ templates: await listReportTemplates(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'generate') {
    const id = await generateReport(auth.workspaceId, body.templateId, new Date(body.periodStart), new Date(body.periodEnd));
    return NextResponse.json({ reportId: id }, { status: 201 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createReportTemplate(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
