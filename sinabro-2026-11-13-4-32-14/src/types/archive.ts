export type UniverseId = 'stardust' | 'nightmarket' | 'whitecity' | 'academy';

export interface UniverseFolder {
  id: UniverseId | string;
  name: string;
  description: string;
  accentColor: string;
}

export type ImageCategory = '대표 전신' | '표정 시트' | 'SD·설정화' | '팬아트';

export interface CharacterImage {
  id: string;
  url: string;
  title: string;
  category: ImageCategory;
  note?: string;
  createdAt: string;
}

export interface CharacterRadarStats {
  combat: number;     // 전투력 / 행동력
  intellect: number;  // 지략 / 통찰
  charm: number;      // 매력 / 교섭
  willpower: number;  // 의지 / 정신력
  agility: number;    // 민첩 / 기동성
}

export interface CharacterArtifact {
  id: string;
  name: string;
  kind: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  dateLabel: string;
  title: string;
  summary: string;
  tag?: string;
}

export interface CharacterRelationLink {
  targetId: string;
  targetName: string;
  relationLabel: string;
  summary: string;
}

export interface StoryFlag {
  id: string;
  label: string;
  status: 'active' | 'pending' | 'resolved';
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  englishName: string;
  alias: string;
  universeId: string;
  universeName: string;
  role: string;
  age: string;
  height: string;
  birthday: string;
  mbti: string;
  gender: string;
  origin: string;
  voiceTone: string;
  voiceActorNote: string;
  palette: string[];
  quote: string;
  shortBio: string;
  appearanceSummary: string;
  personalitySummary: string;
  likes: string[];
  dislikes: string[];
  speechStyle: string;
  abilityName: string;
  abilitySummary: string;
  secretMemo: string;
  episodeMemo: string;
  tags: string[];
  completion: number;
  bookmarked: boolean;
  isFeatured?: boolean;
  avatarUrl?: string;
  avatarGradient: string;
  images: CharacterImage[];
  radarStats: CharacterRadarStats;
  artifacts: CharacterArtifact[];
  timeline: TimelineEvent[];
  relations: CharacterRelationLink[];
  storyFlags: StoryFlag[];
  updatedAt: string;
}

export type CheckpointStatus = 'urgent' | 'in_progress' | 'completed';

export interface Checkpoint {
  id: string;
  title: string;
  universeId: string;
  universeName: string;
  characterId?: string;
  characterName?: string;
  dDayLabel: string;
  dueDate: string;
  status: CheckpointStatus;
  completed: boolean;
  progress: number;
  category: string;
  summary: string;
  checklist: { id: string; text: string; done: boolean }[];
  coverUrl?: string;
  coverGradient: string;
  updatedAt: string;
}

export type PairingCategory = '로맨스·CP' | '라이벌·대립' | '파트너·동료' | '가족·사제';

export interface SpeechComparisonRow {
  context: string;
  charAToB: string;
  charBToA: string;
}

export interface Pairing {
  id: string;
  title: string;
  subtitle: string;
  category: PairingCategory;
  universeId: string;
  universeName: string;
  charAId: string;
  charBId: string;
  resonance: number;
  bondLabel: string;
  summary: string;
  aToBQuote: string;
  bToAQuote: string;
  aToBAffection: number;
  bToAAffection: number;
  charANote: string;
  charBNote: string;
  jointImageUrl?: string;
  jointGradient: string;
  tags: string[];
  speechTable: SpeechComparisonRow[];
  timeline: TimelineEvent[];
  updatedAt: string;
}

export interface InspirationPrompt {
  id: string;
  category: string;
  prompt: string;
  hint: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  mode: 'supabase' | 'local';
}

export interface ArchiveState {
  universes: UniverseFolder[];
  characters: Character[];
  checkpoints: Checkpoint[];
  pairings: Pairing[];
  prompts: InspirationPrompt[];
  currentPromptIndex: number;
  user: AuthUser | null;
}
