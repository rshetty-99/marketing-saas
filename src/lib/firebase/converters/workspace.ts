import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import type {
  Workspace,
  WorkspaceMember,
  PlatformUser,
  ProfileScore,
  EntityProfile,
  AgencyClient,
} from '@/types/features/f0';

export const workspaceConverter: FirestoreDataConverter<Workspace> = {
  toFirestore(workspace: Workspace) {
    const { id, ...data } = workspace;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Workspace {
    const data = snapshot.data();
    return { id: snapshot.id, ...data } as Workspace;
  },
};

export const workspaceMemberConverter: FirestoreDataConverter<WorkspaceMember> =
  {
    toFirestore(member: WorkspaceMember) {
      const { userId, ...data } = member;
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): WorkspaceMember {
      const data = snapshot.data();
      return { userId: snapshot.id, ...data } as WorkspaceMember;
    },
  };

export const platformUserConverter: FirestoreDataConverter<PlatformUser> = {
  toFirestore(user: PlatformUser) {
    const { userId, ...data } = user;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): PlatformUser {
    const data = snapshot.data();
    return { userId: snapshot.id, ...data } as PlatformUser;
  },
};

export const profileScoreConverter: FirestoreDataConverter<ProfileScore> = {
  toFirestore(score: ProfileScore) {
    return { ...score };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProfileScore {
    const data = snapshot.data();
    return { ...data } as ProfileScore;
  },
};

export const entityProfileConverter: FirestoreDataConverter<EntityProfile> = {
  toFirestore(profile: EntityProfile) {
    return { ...profile };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): EntityProfile {
    const data = snapshot.data();
    return { workspaceId: snapshot.id, ...data } as EntityProfile;
  },
};

export const clientConverter: FirestoreDataConverter<AgencyClient> = {
  toFirestore(client: AgencyClient) {
    const { clientId, ...data } = client;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): AgencyClient {
    const data = snapshot.data();
    return { clientId: snapshot.id, ...data } as AgencyClient;
  },
};
