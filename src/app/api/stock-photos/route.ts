/**
 * Stock Photo Search API
 * GET: Search Unsplash/Pexels/Pixabay
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { searchStockPhotos } from '@/lib/platform/stock-photo-service';

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;

  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });

  const provider = req.nextUrl.searchParams.get('provider') ?? 'unsplash';
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1');
  const perPage = Number(req.nextUrl.searchParams.get('perPage') ?? '20');

  const results = await searchStockPhotos(query, provider, page, perPage);
  return NextResponse.json({ results, query, provider, page });
}
