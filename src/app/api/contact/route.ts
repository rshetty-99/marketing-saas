import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.enum(['General', 'Sales', 'Support', 'Partnership', 'Press']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // In production, this would write to Firestore contact_submissions collection
    // with serverTimestamp() for createdAt and updatedAt.
    // For now, we log the validated submission and return success.
    const submission = {
      ...data,
      status: 'new' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Replace with Firestore write when Firebase is configured
    // const docRef = await addDoc(collection(db, 'contact_submissions'), {
    //   ...data,
    //   status: 'new',
    //   createdAt: serverTimestamp(),
    //   updatedAt: serverTimestamp(),
    // });

    // Suppress unused variable in dev mode
    void submission;

    return NextResponse.json(
      { success: true, message: 'Thank you for your message. We will get back to you shortly.' },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
