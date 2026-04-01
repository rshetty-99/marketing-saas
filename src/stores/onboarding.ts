import { create } from 'zustand';
import type { AccountType } from '@/types/roles';

interface OnboardingStore {
  accountType: AccountType | null;
  workspaceId: string | null;
  workspaceName: string;
  industry: string;
  brandName: string;
  primaryColor: string;
  voiceTone: string;
  setAccountType: (type: AccountType) => void;
  setWorkspaceId: (id: string) => void;
  setWorkspaceDetails: (name: string, industry: string) => void;
  setBrandDetails: (name: string, color: string, tone: string) => void;
  reset: () => void;
}

const initialState = {
  accountType: null,
  workspaceId: null,
  workspaceName: '',
  industry: '',
  brandName: '',
  primaryColor: '',
  voiceTone: '',
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  setAccountType: (type: AccountType) => set({ accountType: type }),

  setWorkspaceId: (id: string) => set({ workspaceId: id }),

  setWorkspaceDetails: (name: string, industry: string) =>
    set({ workspaceName: name, industry }),

  setBrandDetails: (name: string, color: string, tone: string) =>
    set({ brandName: name, primaryColor: color, voiceTone: tone }),

  reset: () => set(initialState),
}));
