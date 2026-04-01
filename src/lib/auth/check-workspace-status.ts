import { adminDb } from '@/lib/firebase/admin';
import { workspaceConverter } from '@/lib/firebase/converters/workspace';
import { SoftLockError, SuspendedError, NotFoundError } from './errors';

export async function requireActiveWorkspace(workspaceId: string) {
  const wsDoc = await adminDb
    .collection('workspaces').doc(workspaceId)
    .withConverter(workspaceConverter)
    .get();

  const workspace = wsDoc.data();
  if (!workspace || workspace.status === 'deleted') {
    throw new NotFoundError('Workspace not found.');
  }
  if (workspace.status === 'soft_locked') {
    throw new SoftLockError();
  }
  if (workspace.status === 'suspended') {
    throw new SuspendedError();
  }

  return workspace;
}
