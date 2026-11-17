import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  archiveService,
  loadLocalArchiveState,
  saveLocalArchiveState,
} from '../services/archiveService';
import type {
  ArchiveState,
  AuthUser,
  Character,
  CharacterImage,
  Checkpoint,
  Pairing,
  TimelineEvent,
  UniverseFolder,
} from '../types/archive';

interface ToastMessage {
  id: string;
  text: string;
}

interface ArchiveContextValue {
  state: ArchiveState;
  isHydrated: boolean;
  toasts: ToastMessage[];
  showToast: (text: string) => void;
  cyclePrompt: () => void;
  toggleBookmark: (characterId: string) => void;
  updateCharacter: (characterId: string, updater: (prev: Character) => Character) => void;
  addCharacterImage: (characterId: string, image: Omit<CharacterImage, 'id' | 'createdAt'>) => void;
  createCharacter: (char: Omit<Character, 'id' | 'updatedAt'>) => Character;
  toggleCheckpoint: (checkpointId: string) => void;
  toggleChecklistItem: (checkpointId: string, itemId: string) => void;
  createCheckpoint: (cp: Omit<Checkpoint, 'id' | 'updatedAt'>) => Checkpoint;
  updatePairing: (pairingId: string, updater: (prev: Pairing) => Pairing) => void;
  addPairingTimelineEvent: (
    pairingId: string,
    event: Omit<TimelineEvent, 'id'>
  ) => void;
  createPairing: (pairing: Omit<Pairing, 'id' | 'updatedAt'>) => Pairing;
  createUniverse: (universe: Omit<UniverseFolder, 'id'>) => UniverseFolder;
  signIn: (email: string, password: string, displayName?: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetArchive: () => void;
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<ArchiveState>(() => loadLocalArchiveState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  useEffect(() => {
    let mounted = true;
    archiveService.hydrate().then((hydrated) => {
      if (!mounted) return;
      setState(hydrated);
      setIsHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const commitState = (updater: (prev: ArchiveState) => ArchiveState) => {
    setState((prev) => {
      const next = updater(prev);
      saveLocalArchiveState(next);
      return next;
    });
  };

  const cyclePrompt = () => {
    commitState((prev) => ({
      ...prev,
      currentPromptIndex: (prev.currentPromptIndex + 1) % prev.prompts.length,
    }));
  };

  const toggleBookmark = (characterId: string) => {
    let updatedChar: Character | undefined;
    commitState((prev) => {
      const characters = prev.characters.map((c) => {
        if (c.id !== characterId) return c;
        updatedChar = {
          ...c,
          bookmarked: !c.bookmarked,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return updatedChar;
      });
      return { ...prev, characters };
    });
    if (updatedChar) {
      archiveService.upsertCharacter(updatedChar);
      showToast(
        updatedChar.bookmarked
          ? `${updatedChar.name} 캐릭터를 즐겨찾기에 추가했습니다.`
          : `${updatedChar.name} 즐겨찾기를 해제했습니다.`
      );
    }
  };

  const updateCharacter = (
    characterId: string,
    updater: (prev: Character) => Character
  ) => {
    let savedChar: Character | undefined;
    commitState((prev) => {
      const characters = prev.characters.map((c) => {
        if (c.id !== characterId) return c;
        savedChar = {
          ...updater(c),
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return savedChar;
      });
      return { ...prev, characters };
    });
    if (savedChar) {
      archiveService.upsertCharacter(savedChar);
    }
  };

  const addCharacterImage = (
    characterId: string,
    image: Omit<CharacterImage, 'id' | 'createdAt'>
  ) => {
    const newImage: CharacterImage = {
      ...image,
      id: `img-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    updateCharacter(characterId, (prev) => ({
      ...prev,
      avatarUrl: prev.avatarUrl || image.url,
      images: [newImage, ...prev.images],
      completion: Math.min(100, prev.completion + 3),
    }));
    showToast('새 일러스트가 갤러리에 등록되었습니다.');
  };

  const createCharacter = (char: Omit<Character, 'id' | 'updatedAt'>): Character => {
    const newChar: Character = {
      ...char,
      id: `char-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    commitState((prev) => ({
      ...prev,
      characters: [newChar, ...prev.characters],
    }));
    archiveService.upsertCharacter(newChar);
    showToast(`새 캐릭터 '${newChar.name}'이(가) 아카이브에 등록되었습니다.`);
    return newChar;
  };

  const toggleCheckpoint = (checkpointId: string) => {
    let savedCp: Checkpoint | undefined;
    commitState((prev) => {
      const checkpoints = prev.checkpoints.map((cp) => {
        if (cp.id !== checkpointId) return cp;
        const nextCompleted = !cp.completed;
        savedCp = {
          ...cp,
          completed: nextCompleted,
          status: nextCompleted ? 'completed' : 'in_progress',
          progress: nextCompleted ? 100 : Math.min(85, cp.progress || 50),
          dDayLabel: nextCompleted ? '완료' : cp.dDayLabel === '완료' ? 'D-7' : cp.dDayLabel,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return savedCp;
      });
      return { ...prev, checkpoints };
    });
    if (savedCp) {
      archiveService.upsertCheckpoint(savedCp);
      showToast(
        savedCp.completed
          ? `'${savedCp.title}' 체크포인트를 완료 처리했습니다.`
          : `'${savedCp.title}' 상태를 진행 중으로 되돌렸습니다.`
      );
    }
  };

  const toggleChecklistItem = (checkpointId: string, itemId: string) => {
    let savedCp: Checkpoint | undefined;
    commitState((prev) => {
      const checkpoints = prev.checkpoints.map((cp) => {
        if (cp.id !== checkpointId) return cp;
        const nextList = cp.checklist.map((item) =>
          item.id === itemId ? { ...item, done: !item.done } : item
        );
        const doneCount = nextList.filter((i) => i.done).length;
        const progress =
          nextList.length > 0 ? Math.round((doneCount / nextList.length) * 100) : cp.progress;
        const allDone = nextList.length > 0 && doneCount === nextList.length;
        savedCp = {
          ...cp,
          checklist: nextList,
          progress,
          completed: allDone,
          status: allDone ? 'completed' : cp.status === 'completed' ? 'in_progress' : cp.status,
          dDayLabel: allDone ? '완료' : cp.dDayLabel === '완료' ? 'D-5' : cp.dDayLabel,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return savedCp;
      });
      return { ...prev, checkpoints };
    });
    if (savedCp) {
      archiveService.upsertCheckpoint(savedCp);
    }
  };

  const createCheckpoint = (cp: Omit<Checkpoint, 'id' | 'updatedAt'>): Checkpoint => {
    const newCp: Checkpoint = {
      ...cp,
      id: `cp-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    commitState((prev) => ({
      ...prev,
      checkpoints: [newCp, ...prev.checkpoints],
    }));
    archiveService.upsertCheckpoint(newCp);
    showToast('새 체크포인트가 생성되었습니다.');
    return newCp;
  };

  const updatePairing = (pairingId: string, updater: (prev: Pairing) => Pairing) => {
    let savedPairing: Pairing | undefined;
    commitState((prev) => {
      const pairings = prev.pairings.map((p) => {
        if (p.id !== pairingId) return p;
        savedPairing = {
          ...updater(p),
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        return savedPairing;
      });
      return { ...prev, pairings };
    });
    if (savedPairing) {
      archiveService.upsertPairing(savedPairing);
    }
  };

  const addPairingTimelineEvent = (
    pairingId: string,
    event: Omit<TimelineEvent, 'id'>
  ) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `pt-${Date.now()}`,
    };
    updatePairing(pairingId, (prev) => ({
      ...prev,
      timeline: [...prev.timeline, newEvent],
    }));
    showToast('서사 연표에 새 사건이 기록되었습니다.');
  };

  const createPairing = (pairing: Omit<Pairing, 'id' | 'updatedAt'>): Pairing => {
    const newPairing: Pairing = {
      ...pairing,
      id: `pair-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    commitState((prev) => ({
      ...prev,
      pairings: [newPairing, ...prev.pairings],
    }));
    archiveService.upsertPairing(newPairing);
    showToast(`'${newPairing.title}' 페어링이 등록되었습니다.`);
    return newPairing;
  };

  const createUniverse = (universe: Omit<UniverseFolder, 'id'>): UniverseFolder => {
    const newUniverse: UniverseFolder = {
      ...universe,
      id: `univ-${Date.now()}`,
    };
    commitState((prev) => ({
      ...prev,
      universes: [...prev.universes, newUniverse],
    }));
    showToast(`새 세계관 폴더 '${newUniverse.name}'이 생성되었습니다.`);
    return newUniverse;
  };

  const signIn = async (email: string, password: string, displayName?: string) => {
    const user: AuthUser = await archiveService.signIn(email, password, displayName);
    commitState((prev) => ({ ...prev, user }));
    showToast(`${user.displayName}님, 아카이브에 로그인되었습니다.`);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const user: AuthUser = await archiveService.signUp(email, password, displayName);
    commitState((prev) => ({ ...prev, user }));
    showToast(`${user.displayName}님의 계정이 준비되었습니다.`);
  };

  const signOut = async () => {
    await archiveService.signOut();
    commitState((prev) => ({ ...prev, user: null }));
    showToast('로그아웃되었습니다.');
  };

  const resetArchive = () => {
    const fresh = archiveService.resetToSeed();
    setState(fresh);
    showToast('초기 시드 데이터로 복원되었습니다.');
  };

  return (
    <ArchiveContext.Provider
      value={{
        state,
        isHydrated,
        toasts,
        showToast,
        cyclePrompt,
        toggleBookmark,
        updateCharacter,
        addCharacterImage,
        createCharacter,
        toggleCheckpoint,
        toggleChecklistItem,
        createCheckpoint,
        updatePairing,
        addPairingTimelineEvent,
        createPairing,
        createUniverse,
        signIn,
        signUp,
        signOut,
        resetArchive,
      }}
    >
      {children}
      {/* Toast Notifications */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-ink text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-white/10"
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ArchiveContext.Provider>
  );
};

export const useArchive = (): ArchiveContextValue => {
  const ctx = useContext(ArchiveContext);
  if (!ctx) {
    throw new Error('useArchive must be used inside ArchiveProvider');
  }
  return ctx;
};
