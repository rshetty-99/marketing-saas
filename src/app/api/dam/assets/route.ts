import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listAssets, createAsset } from '@/lib/f16/dam-service';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('dam.view_download');
  if (isAuthError(authResult)) return authResult;
  const { searchParams } = new URL(request.url);
  const assets = await listAssets(authResult.workspaceId, {
    folderId: searchParams.get('folderId') ?? undefined,
    assetType: searchParams.get('assetType') ?? undefined,
  });
  return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('dam.upload');
  if (isAuthError(authResult)) return authResult;
  const body = await request.json();
  const assetId = await createAsset(authResult.workspaceId, body, authResult.userId);
  return NextResponse.json({ assetId });
}
