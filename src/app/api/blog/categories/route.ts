/**
 * Blog Categories API
 * GET: List fixed categories (public)
 */

import { NextResponse } from 'next/server';
import { BLOG_CATEGORIES } from '@/types/features/blog';

export async function GET() {
  return NextResponse.json({ categories: BLOG_CATEGORIES });
}
