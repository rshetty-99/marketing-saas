/**
 * POST /api/contact
 * Public contact form submission endpoint.
 * Rate limited: 3 per minute per IP.
 * Stores in Firestore contact_submissions collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['general', 'support', 'sales', 'partnership', 'press']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

// In-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 3;
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return '0.0.0.0';
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(key);
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = getClientIp(request.headers);
  if (!checkContactRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute before trying again.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Store in Firestore
    const ref = adminDb.collection('contact_submissions').doc();
    await ref.set({
      id: ref.id,
      name,
      email,
      subject,
      message,
      status: 'new',
      ipHash: ip.split('.').slice(0, 2).join('.') + '.x.x', // Partial IP for abuse tracking
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'public',
      workspaceId: 'system',
    });

    // In production: would send notification email via SendGrid
    // await sendContactNotification({ name, email, subject, message, submissionId: ref.id });

    return NextResponse.json(
      { success: true, id: ref.id },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
