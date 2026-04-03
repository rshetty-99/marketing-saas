/**
 * POST /api/leads/[id]/enrich — Trigger on-demand lead enrichment
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('leads.create');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const ref = adminDb.collection('workspaces').doc(auth.workspaceId).collection('leads').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const lead = doc.data()!;
  const email = lead.email as string;
  const domain = email?.split('@')[1];

  // In production: call Clearbit/Apollo API for enrichment
  // For dev: mock enrichment data
  const enrichmentData = {
    company: domain ? `${domain.split('.')[0].charAt(0).toUpperCase()}${domain.split('.')[0].slice(1)} Inc.` : null,
    jobTitle: 'Marketing Manager',
    companySize: '51-200',
    industry: 'Technology',
    linkedinUrl: `https://linkedin.com/in/${email?.split('@')[0]}`,
    location: 'San Francisco, CA',
    enrichedVia: 'mock',
  };

  await ref.update({
    enriched: true,
    enrichedAt: FieldValue.serverTimestamp(),
    enrichmentData,
    company: enrichmentData.company ?? lead.company,
    jobTitle: enrichmentData.jobTitle ?? lead.jobTitle,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ enrichmentData });
}
