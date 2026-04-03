/**
 * POST /api/webhooks/stripe — Handle Stripe webhook events
 * Handles: charge.succeeded, invoice.payment_failed, subscription.updated/deleted
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const eventType = body.type as string;
  const data = body.data?.object as Record<string, unknown>;

  if (!eventType || !data) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  }

  // In production: verify webhook signature with STRIPE_WEBHOOK_SECRET
  // const sig = request.headers.get('stripe-signature');

  switch (eventType) {
    case 'customer.subscription.updated': {
      const customerId = data.customer as string;
      // Find workspace by stripeCustomerId and update
      const workspaces = await adminDb.collection('workspaces')
        .where('stripeCustomerId', '==', customerId).limit(1).get();
      if (!workspaces.empty) {
        await workspaces.docs[0].ref.update({
          status: data.status === 'active' ? 'active' : data.status === 'trialing' ? 'trial' : 'soft_locked',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const customerId = data.customer as string;
      const workspaces = await adminDb.collection('workspaces')
        .where('stripeCustomerId', '==', customerId).limit(1).get();
      if (!workspaces.empty) {
        await workspaces.docs[0].ref.update({
          status: 'soft_locked',
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      // Log for dunning management
      const customerId = data.customer as string;
      const workspaces = await adminDb.collection('workspaces')
        .where('stripeCustomerId', '==', customerId).limit(1).get();
      if (!workspaces.empty) {
        await workspaces.docs[0].ref.update({
          status: 'past_due' as string,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      break;
    }

    case 'charge.succeeded':
      // Log successful payment — no workspace update needed
      break;

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
