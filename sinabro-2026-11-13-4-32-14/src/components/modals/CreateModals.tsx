import React, { useState } from 'react';
import {
  BookmarkPlus,
  HeartHandshake,
  LogIn,
  UserPlus,
  X,
} from 'lucide-react';
import { useArchive } from '../../context/ArchiveContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { CheckpointStatus, PairingCategory } from '../../types/archive';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ============================================================================
 * 1. New Character Modal
 * ============================================================================ */
export const NewCharacterModal: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, createCharacter } = useArchive();
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [universeId, setUniverseId] = useState(state.universes[0]?.id || 'stardust');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const universe =
      state.universes.find((u) => u.id === universeId) || state.universes[0];

    createCharacter({
      name: name.trim(),
      englishName: englishName.trim() || 'Original Character',
      alias: role.trim() || '새로운 기록자',
      universeId: universe.id,
      universeName: universe.name,
      role: role.trim() || '미정',
      age: '미상',
      height: '미정',
      birthday: '미정',
      mbti: 'INFJ',
      gender: '미정',
      origin: universe.name,
      voiceTone: '차분하고 또렷한 어조',
      voiceActorNote: '추후 보이스 노트 작성 예정',
      palette: [universe.accentColor, '#7DB9DE', '#F5F7FA', '#1E293B'],
      quote: quote.trim() || '“아직 쓰이지 않은 첫 문장을 기다리고 있어.”',
      shortBio:
        shortBio.trim() || `${universe.name} 세계관에 새로 합류한 오리지널 캐릭터입니다.`,
      appearanceSummary: '외모 및 의상 디테일을 추가해 주세요.',
      personalitySummary: '성격과 가치관 서술을 추가해 주세요.',
      likes: ['따뜻한 차'],
      dislikes: ['무기력'],
      speechStyle: '상황에 따라 유연한 어조를 사용합니다.',
      abilityName: '고유 능력 미설정',
      abilitySummary: '상세 설정 편집에서 능력과 아티팩트를 정의할 수 있습니다.',
      secretMemo: '',
      episodeMemo: '',
      tags: tagsRaw
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      completion: 35,
      bookmarked: false,
      avatarGradient: 'from-sky-100 via-blue-50 to-indigo-100',
      images: [],
      radarStats: {
        combat: 65,
        intellect: 75,
        charm: 70,
        willpower: 80,
        agility: 68,
      },
      artifacts: [],
      timeline: [],
      relations: [],
      storyFlags: [],
    });

    setName('');
    setEnglishName('');
    setRole('');
    setQuote('');
    setShortBio('');
    setTagsRaw('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-ink">새 캐릭터 등록</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                캐릭터 이름 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 에이든"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                영문명
              </label>
              <input
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="예: Aiden Vance"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                소속 세계관
              </label>
              <select
                value={universeId}
                onChange={(e) => setUniverseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              >
                {state.universes.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                역할 / 직책
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="예: 마법탑 견습 사서"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              대표 대사
            </label>
            <input
              type="text"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="캐릭터의 성격을 보여주는 한 마디"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              간단 소개
            </label>
            <textarea
              rows={2}
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="캐릭터의 배경과 핵심 설정을 간략히 적어주세요."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="예: 은발, 사서, 비밀계약"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-surface-low"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl"
            >
              캐릭터 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. New Checkpoint Modal
 * ============================================================================ */
export const NewCheckpointModal: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, createCheckpoint } = useArchive();
  const [title, setTitle] = useState('');
  const [universeId, setUniverseId] = useState(state.universes[0]?.id || 'stardust');
  const [characterId, setCharacterId] = useState(state.characters[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-11-28');
  const [status, setStatus] = useState<CheckpointStatus>('in_progress');
  const [category, setCategory] = useState('비주얼 설정');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const universe =
      state.universes.find((u) => u.id === universeId) || state.universes[0];
    const character = state.characters.find((c) => c.id === characterId);

    const diffDays = Math.max(
      0,
      Math.ceil(
        (new Date(dueDate).getTime() - new Date('2026-11-13').getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    createCheckpoint({
      title: title.trim(),
      universeId: universe.id,
      universeName: universe.name,
      characterId: character?.id,
      characterName: character?.name,
      dDayLabel: status === 'completed' ? '완료' : `D-${diffDays}`,
      dueDate,
      status,
      completed: status === 'completed',
      progress: status === 'completed' ? 100 : 25,
      category,
      summary: summary.trim() || '세부 점검 항목을 순서대로 완료해보세요.',
      checklist: [
        { id: `chk-${Date.now()}-1`, text: '초안 스케치 및 핵심 키워드 확정', done: false },
        { id: `chk-${Date.now()}-2`, text: '연결된 캐릭터 시트 반영 확인', done: false },
      ],
      coverUrl: character?.avatarUrl,
      coverGradient: 'from-sky-100 to-indigo-50',
    });

    setTitle('');
    setSummary('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-ink">새 체크포인트 등록</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              체크포인트 제목 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 겨울 이벤트 스틸컷 구도 확정"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                세계관
              </label>
              <select
                value={universeId}
                onChange={(e) => setUniverseId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              >
                {state.universes.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                연결 캐릭터
              </label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              >
                <option value="">선택 안 함</option>
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                목표 마감일
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                우선순위
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CheckpointStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              >
                <option value="urgent">긴급</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료됨</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                작업 유형
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              상세 메모
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="마감 전 반드시 확인해야 할 설정 사항을 입력하세요."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-surface-low"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl"
            >
              체크포인트 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. New Pairing Modal
 * ============================================================================ */
export const NewPairingModal: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, createPairing } = useArchive();
  const [charAId, setCharAId] = useState(state.characters[0]?.id || 'haneul');
  const [charBId, setCharBId] = useState(state.characters[1]?.id || 'byeoli');
  const [category, setCategory] = useState<PairingCategory>('로맨스·CP');
  const [subtitle, setSubtitle] = useState('');
  const [bondLabel, setBondLabel] = useState('');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const charA = state.characters.find((c) => c.id === charAId);
    const charB = state.characters.find((c) => c.id === charBId);
    if (!charA || !charB) return;

    createPairing({
      title: `${charA.name} × ${charB.name}`,
      subtitle: subtitle.trim() || `${charA.name}와 ${charB.name}의 관계 연대기`,
      category,
      universeId: charA.universeId,
      universeName: charA.universeName,
      charAId: charA.id,
      charBId: charB.id,
      resonance: 85,
      bondLabel: bondLabel.trim() || `${category} · 서사 연결`,
      summary:
        summary.trim() ||
        `${charA.name}와(과) ${charB.name}이(가) 같은 사건 속에서 만들어가는 서사적 교차점입니다.`,
      aToBQuote: '“네가 멈춘 자리부터 내가 이어서 걸어갈게.”',
      bToAQuote: '“이번엔 나도 혼자 두지 않을 거야.”',
      aToBAffection: 85,
      bToAAffection: 85,
      charANote: `${charB.name}을(를) 향한 시선 노트`,
      charBNote: `${charA.name}을(를) 향한 시선 노트`,
      jointGradient: 'from-sky-100 via-indigo-50 to-violet-100',
      tags: [charA.universeName, category],
      speechTable: [
        {
          context: '평소 호칭',
          charAToB: `${charB.name} 씨`,
          charBToA: `${charA.name}`,
        },
      ],
      timeline: [],
    });

    setSubtitle('');
    setBondLabel('');
    setSummary('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-tertiary" />
            <h2 className="text-base font-bold text-ink">새 페어링 등록</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                인물 A
              </label>
              <select
                value={charAId}
                onChange={(e) => setCharAId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
              >
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.universeName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                인물 B
              </label>
              <select
                value={charBId}
                onChange={(e) => setCharBId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
              >
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.universeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                관계 분류
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PairingCategory)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
              >
                <option value="로맨스·CP">로맨스·CP</option>
                <option value="라이벌·대립">라이벌·대립</option>
                <option value="파트너·동료">파트너·동료</option>
                <option value="가족·사제">가족·사제</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                관계 키워드
              </label>
              <input
                type="text"
                value={bondLabel}
                onChange={(e) => setBondLabel(e.target.value)}
                placeholder="예: 상호 구원 · 운명의 서약"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              페어링 부제
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="한 문장으로 두 사람의 관계를 요약해보세요"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              서사 요약
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="첫 만남부터 현재까지의 감정선을 정리하세요."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-surface-low"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl"
            >
              페어링 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. Auth Modal (Supabase Auth + Local Workspace Fallback)
 * ============================================================================ */
export const AuthModal: React.FC<ModalBaseProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useArchive();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password, displayName);
      } else {
        await signUp(email.trim(), password, displayName.trim() || '아카이브 작가');
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-ink">
              {mode === 'login' ? '시나브로 아카이브 로그인' : '새 작가 계정 등록'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex rounded-xl bg-surface-low p-1 border border-hairline">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              회원가입
            </button>
          </div>

          {!isSupabaseConfigured && (
            <p className="text-xs text-ink-muted bg-surface-low px-3.5 py-2.5 rounded-xl border border-hairline leading-relaxed">
              현재 로컬 워크스페이스 모드로 동작 중입니다. 임의의 이메일로 로그인하면
              브라우저에 작업 상태가 즉시 저장됩니다.
            </p>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                필명 / 닉네임
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="예: 은하수"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="author@sinabro.archive"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-danger bg-danger-soft/50 px-3 py-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors disabled:opacity-60"
          >
            {loading
              ? '처리 중...'
              : mode === 'login'
                ? '아카이브 열기'
                : '계정 만들기'}
          </button>
        </form>
      </div>
    </div>
  );
};
