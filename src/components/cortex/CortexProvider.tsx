'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { CortexFloatingButton } from './CortexFloatingButton';
import { CortexPanel } from './CortexPanel';
import { CortexCommandPalette } from './CortexCommandPalette';
import type { DegradationLevel } from './CortexDegradationBanner';

interface CortexContextValue {
  isPanelOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeSessionId: string;
  isStreaming: boolean;
  degradationLevel: DegradationLevel | null;
  openPanel: () => void;
  closePanel: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  newChat: () => void;
}

const CortexContext = createContext<CortexContextValue | null>(null);

export function useCortex(): CortexContextValue {
  const ctx = useContext(CortexContext);
  if (!ctx) {
    throw new Error('useCortex must be used within CortexProvider');
  }
  return ctx;
}

interface CortexProviderProps {
  children: React.ReactNode;
  workspaceId: string;
  userId: string;
  workspaceName: string;
  accountType: string;
  clientId?: string;
}

const ONBOARDING_KEY = 'cortex-onboarding-complete';

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CortexProvider({
  children,
  workspaceId: _workspaceId,
  userId: _userId,
  workspaceName,
  accountType: _accountType,
  clientId,
}: CortexProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(() => generateSessionId());
  const [isStreaming, setIsStreaming] = useState(false);
  const [degradationLevel, setDegradationLevel] = useState<DegradationLevel | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding state on mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // localStorage unavailable
    }
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    setIsCommandPaletteOpen(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
    setIsPanelOpen(false);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const newChat = useCallback(() => {
    setActiveSessionId(generateSessionId());
  }, []);

  // Cmd+K / Ctrl+K keyboard listener (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth <= 768) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        if (!isCommandPaletteOpen) {
          setIsPanelOpen(false);
        }
      }

      // Escape to close
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (isPanelOpen) {
          setIsPanelOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, isCommandPaletteOpen]);

  // Degradation check — ping health endpoint periodically
  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const response = await fetch('/api/cortex/health', { method: 'GET' });
        if (!mounted) return;

        if (!response.ok) {
          setDegradationLevel('offline');
          return;
        }

        const data: { status: string; level?: DegradationLevel } = await response.json();
        if (data.status === 'ok') {
          setDegradationLevel(null);
        } else if (data.level) {
          setDegradationLevel(data.level);
        }
      } catch {
        if (mounted) setDegradationLevel('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const contextValue = useMemo<CortexContextValue>(
    () => ({
      isPanelOpen,
      isCommandPaletteOpen,
      activeSessionId,
      isStreaming,
      degradationLevel,
      openPanel,
      closePanel,
      openCommandPalette,
      closeCommandPalette,
      newChat,
    }),
    [
      isPanelOpen,
      isCommandPaletteOpen,
      activeSessionId,
      isStreaming,
      degradationLevel,
      openPanel,
      closePanel,
      openCommandPalette,
      closeCommandPalette,
      newChat,
    ]
  );

  // Suppress unused variable warnings — these are reserved for future API calls
  void _workspaceId;
  void _userId;
  void _accountType;
  void setIsStreaming;

  return (
    <CortexContext.Provider value={contextValue}>
      {children}

      <CortexFloatingButton onOpen={openPanel} />

      <CortexPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        workspaceName={workspaceName}
        clientName={undefined}
        sessionId={activeSessionId}
        onNewChat={newChat}
        degradationLevel={degradationLevel}
        showOnboarding={showOnboarding}
        onOnboardingComplete={handleOnboardingComplete}
      />

      <CortexCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </CortexContext.Provider>
  );
}
