import {
  SEED_CHARACTERS,
  SEED_CHECKPOINTS,
  SEED_PAIRINGS,
  SEED_PROMPTS,
  SEED_UNIVERSES,
} from '../data/seedData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  ArchiveState,
  AuthUser,
  Character,
  Checkpoint,
  Pairing,
  UniverseFolder,
} from '../types/archive';

const STORAGE_KEY = 'sinabro_archive_state_v1';
const USER_STORAGE_KEY = 'sinabro_local_user_v1';

const getDefaultState = (): ArchiveState => ({
  universes: SEED_UNIVERSES,
  characters: SEED_CHARACTERS,
  checkpoints: SEED_CHECKPOINTS,
  pairings: SEED_PAIRINGS,
  prompts: SEED_PROMPTS,
  currentPromptIndex: 0,
  user: null,
});

export const loadLocalArchiveState = (): ArchiveState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const savedUserRaw = localStorage.getItem(USER_STORAGE_KEY);
    const savedUser = savedUserRaw ? (JSON.parse(savedUserRaw) as AuthUser) : null;

    if (!raw) {
      const initial = getDefaultState();
      initial.user = savedUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<ArchiveState>;
    const defaults = getDefaultState();
    return {
      universes: parsed.universes?.length ? parsed.universes : defaults.universes,
      characters: parsed.characters?.length ? parsed.characters : defaults.characters,
      checkpoints: parsed.checkpoints?.length ? parsed.checkpoints : defaults.checkpoints,
      pairings: parsed.pairings?.length ? parsed.pairings : defaults.pairings,
      prompts: parsed.prompts?.length ? parsed.prompts : defaults.prompts,
      currentPromptIndex: parsed.currentPromptIndex ?? 0,
      user: savedUser ?? parsed.user ?? null,
    };
  } catch {
    return getDefaultState();
  }
};

export const saveLocalArchiveState = (state: ArchiveState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('로컬 아카이브 저장 중 용량 또는 직렬화 오류가 발생했습니다:', error);
  }
};

/**
 * Supabase JS 2.x 동기화 계층 (환경 변수가 설정된 경우 Supabase 테이블과 연동,
 * 미설정 시에도 로컬 워크스페이스 스토리지로 즉시 영속화 지원)
 */
export const archiveService = {
  async hydrate(): Promise<ArchiveState> {
    const localState = loadLocalArchiveState();

    if (!isSupabaseConfigured || !supabase) {
      return localState;
    }

    try {
      const [{ data: sessionData }, charsRes, cpsRes, pairsRes, univRes] =
        await Promise.all([
          supabase.auth.getSession(),
          supabase.from('characters').select('payload'),
          supabase.from('checkpoints').select('payload'),
          supabase.from('pairings').select('payload'),
          supabase.from('universes').select('payload'),
        ]);

      const supaUser = sessionData.session?.user;
      const mappedUser: AuthUser | null = supaUser
        ? {
            id: supaUser.id,
            email: supaUser.email ?? '',
            displayName:
              (supaUser.user_metadata?.display_name as string | undefined) ||
              supaUser.email?.split('@')[0] ||
              '작가',
            mode: 'supabase',
          }
        : localState.user;

      const characters =
        charsRes.data && charsRes.data.length > 0
          ? charsRes.data.map((r) => r.payload as Character)
          : localState.characters;

      const checkpoints =
        cpsRes.data && cpsRes.data.length > 0
          ? cpsRes.data.map((r) => r.payload as Checkpoint)
          : localState.checkpoints;

      const pairings =
        pairsRes.data && pairsRes.data.length > 0
          ? pairsRes.data.map((r) => r.payload as Pairing)
          : localState.pairings;

      const universes =
        univRes.data && univRes.data.length > 0
          ? univRes.data.map((r) => r.payload as UniverseFolder)
          : localState.universes;

      return {
        ...localState,
        universes,
        characters,
        checkpoints,
        pairings,
        user: mappedUser,
      };
    } catch {
      return localState;
    }
  },

  async upsertCharacter(character: Character): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('characters').upsert({
      id: character.id,
      payload: character,
      updated_at: new Date().toISOString(),
    });
  },

  async upsertCheckpoint(checkpoint: Checkpoint): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('checkpoints').upsert({
      id: checkpoint.id,
      payload: checkpoint,
      updated_at: new Date().toISOString(),
    });
  },

  async upsertPairing(pairing: Pairing): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('pairings').upsert({
      id: pairing.id,
      payload: pairing,
      updated_at: new Date().toISOString(),
    });
  },

  async signIn(email: string, password: string, displayName?: string): Promise<AuthUser> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message);
      }
      const user = data.user;
      return {
        id: user.id,
        email: user.email ?? email,
        displayName:
          displayName ||
          (user.user_metadata?.display_name as string | undefined) ||
          email.split('@')[0],
        mode: 'supabase',
      };
    }

    const localUser: AuthUser = {
      id: `local-${Date.now()}`,
      email,
      displayName: displayName?.trim() || email.split('@')[0] || '아카이브 작가',
      mode: 'local',
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(localUser));
    return localUser;
  },

  async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      const user = data.user;
      return {
        id: user?.id ?? `supa-${Date.now()}`,
        email: user?.email ?? email,
        displayName: displayName || email.split('@')[0],
        mode: 'supabase',
      };
    }

    const localUser: AuthUser = {
      id: `local-${Date.now()}`,
      email,
      displayName: displayName.trim() || email.split('@')[0] || '아카이브 작가',
      mode: 'local',
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(localUser));
    return localUser;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  resetToSeed(): ArchiveState {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = getDefaultState();
    saveLocalArchiveState(fresh);
    return fresh;
  },
};
