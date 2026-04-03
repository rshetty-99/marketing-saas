/**
 * POST /api/crm/leads — PUBLIC lead capture endpoint (no auth)
 * Used by embedded forms on external websites.
 * Rate limited: 10 req/min per form ID.
 * CAPTCHA verification required in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const submitSchema = z.object({
  formId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  customFields: z.record(z.string(), z.string()).optional(),
  gdprConsent: z.boolean().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  referrerUrl: z.string().optional(),
  captchaToken: z.string().optional(),
});

// Simple in-memory rate limiter (per form ID)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(formId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(formId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(formId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { formId } = parsed.data;

  // Rate limit: 10 submissions per minute per form
  if (!checkRateLimit(formId)) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  // In production: verify CAPTCHA token here
  // if (!parsed.data.captchaToken) {
  //   return NextResponse.json({ error: 'CAPTCHA required' }, { status: 400 });
  // }

  // Look up form to find workspace
  const formSnap = await adminDb.collectionGroup('crm_forms').where('id', '==', formId).limit(1).get();
  if (formSnap.empty) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const form = formSnap.docs[0].data();
  const workspaceId = form.workspaceId as string;

  // GDPR: enforce consent if form requires it
  if (form.requireGdprConsent && !parsed.data.gdprConsent) {
    return NextResponse.json({ error: 'GDPR consent is required' }, { status: 400 });
  }

  // Create lead
  const ref = adminDb.collection('workspaces').doc(workspaceId).collection('leads').doc();
  await ref.set({
    id: ref.id,
    workspaceId,
    clientId: form.clientId ?? null,
    email: parsed.data.email,
    firstName: parsed.data.firstName ?? null,
    lastName: parsed.data.lastName ?? null,
    phone: parsed.data.phone ?? null,
    company: parsed.data.company ?? null,
    customFields: parsed.data.customFields ?? {},
    stage: 'new',
    score: 0,
    enriched: false,
    tags: [],
    notes: [],
    source: {
      type: 'form',
      formId,
      utmSource: parsed.data.utmSource ?? null,
      utmMedium: parsed.data.utmMedium ?? null,
      utmCampaign: parsed.data.utmCampaign ?? null,
      referrerUrl: parsed.data.referrerUrl ?? null,
    },
    gdprConsent: parsed.data.gdprConsent ?? null,
    gdprConsentAt: parsed.data.gdprConsent ? FieldValue.serverTimestamp() : null,
    crmPushStatus: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: 'form-submission',
  });

  // Increment form submission count
  await formSnap.docs[0].ref.update({
    submissionCount: FieldValue.increment(1),
  });

  // In production: fire CRM webhook if configured (via Cloud Tasks)
  // In production: trigger email nurture sequence if configured

  return NextResponse.json({ success: true, leadId: ref.id }, { status: 201 });
}
