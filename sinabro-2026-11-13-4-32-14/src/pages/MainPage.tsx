import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Circle,
  FolderPlus,
  HeartHandshake,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { CharacterAvatar } from '../components/CharacterAvatar';
import {
  NewCharacterModal,
  NewPairingModal,
} from '../components/modals/CreateModals';
import { useArchive } from '../context/ArchiveContext';

export const MainPage: React.FC = () => {
  const {
    state,
    cyclePrompt,
    toggleBookmark,
    toggleCheckpoint,
    createUniverse,
    showToast,
    updateCharacter,
  } = useArchive();
  const navigate = useNavigate();

  const [selectedUniverseId, setSelectedUniverseId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [quickMemo, setQuickMemo] = useState('');
  const [newCharModalOpen, setNewCharModalOpen] = useState(false);
  const [newPairingModalOpen, setNewPairingModalOpen] = useState(false);

  const filteredCharacters = useMemo(() => {
    return state.characters.filter((c) => {
      const matchUniv =
        selectedUniverseId === 'all' || c.universeId === selectedUniverseId;
      const matchTag = !selectedTag || c.tags.includes(selectedTag);
      return matchUniv && matchTag;
    });
  }, [state.characters, selectedUniverseId, selectedTag]);

  const featuredCharacter = useMemo(() => {
    return (
      filteredCharacters.find((c) => c.isFeatured) ||
      filteredCharacters[0] ||
      state.characters[0]
    );
  }, [filteredCharacters, state.characters]);

  const featuredPairing = useMemo(() => {
    return (
      state.pairings.find(
        (p) =>
          selectedUniverseId === 'all' || p.universeId === selectedUniverseId
      ) || state.pairings[0]
    );
  }, [state.pairings, selectedUniverseId]);

  const pairCharA = state.characters.find(
    (c) => c.id === featuredPairing?.charAId
  );
  const pairCharB = state.characters.find(
    (c) => c.id === featuredPairing?.charBId
  );

  const urgentCheckpoints = useMemo(() => {
    return state.checkpoints
      .filter((cp) => !cp.completed)
      .slice(0, 4);
  }, [state.checkpoints]);

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>();
    state.characters.forEach((c) => {
      c.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [state.characters]);

  const currentPrompt =
    state.prompts[state.currentPromptIndex] || state.prompts[0];

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const created = createUniverse({
      name: newFolderName.trim(),
      description: '새로 만든 창작 세계관 폴더',
      accentColor: '#006194',
    });
    setSelectedUniverseId(created.id);
    setNewFolderName('');
    setShowNewFolderForm(false);
  };

  const handleSaveQuickMemo = () => {
    if (!quickMemo.trim() || !featuredCharacter) return;
    updateCharacter(featuredCharacter.id, (prev) => ({
      ...prev,
      episodeMemo: prev.episodeMemo
        ? `${prev.episodeMemo}\n\n[영감 메모] ${quickMemo.trim()}`
        : `[영감 메모] ${quickMemo.trim()}`,
    }));
    setQuickMemo('');
    showToast(`${featuredCharacter.name}의 에피소드 메모에 영감을 기록했습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Compact Studio Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            CREATIVE ARCHIVE STUDIO
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            나의 창작 세계와 인물 기록
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNewCharModalOpen(true)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors min-h-[40px]"
          >
            + 새 캐릭터 등록
          </button>
          <button
            type="button"
            onClick={() => setNewPairingModalOpen(true)}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-ink bg-white border border-hairline hover:bg-surface-low rounded-xl transition-colors min-h-[40px]"
          >
            + 새 페어링
          </button>
        </div>
      </div>

      {/* 3-Column Studio Grid (1440px Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (3 cols): Universes & Quick Tags */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Universe Folders */}
          <section className="bg-white rounded-2xl border border-hairline p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-ink">세계관 폴더</h2>
              <button
                type="button"
                onClick={() => setShowNewFolderForm((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </div>

            {showNewFolderForm && (
              <form onSubmit={handleCreateFolder} className="mb-3 flex gap-1.5">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="세계관 이름"
                  className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-lg border border-hairline bg-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg shrink-0"
                >
                  생성
                </button>
              </form>
            )}

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedUniverseId('all');
                  setSelectedTag(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  selectedUniverseId === 'all'
                    ? 'bg-primary-fixed/40 text-primary font-semibold'
                    : 'text-ink-muted hover:bg-surface-low hover:text-ink'
                }`}
              >
                <span>전체 세계관</span>
                <span className="text-xs tabular-nums text-ink-subtle">
                  {state.characters.length}
                </span>
              </button>

              {state.universes.map((univ) => {
                const count = state.characters.filter(
                  (c) => c.universeId === univ.id
                ).length;
                const active = selectedUniverseId === univ.id;
                return (
                  <button
                    key={univ.id}
                    type="button"
                    onClick={() => {
                      setSelectedUniverseId(univ.id);
                      setSelectedTag(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? 'bg-primary-fixed/40 text-primary font-semibold'
                        : 'text-ink-muted hover:bg-surface-low hover:text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: univ.accentColor }}
                      />
                      <span className="truncate">{univ.name}</span>
                    </span>
                    <span className="text-xs tabular-nums text-ink-subtle shrink-0 ml-2">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Tag Filters */}
          <section className="bg-white rounded-2xl border border-hairline p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-ink">빠른 태그 탐색</h2>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-primary hover:underline"
                >
                  초기화
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setSelectedTag((prev) => (prev === tag ? null : tag))
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-low/70 text-ink-muted border-hairline hover:border-primary/40 hover:text-ink'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Archive Summary Stats */}
          <section className="bg-white rounded-2xl border border-hairline p-5">
            <h2 className="text-sm font-bold text-ink mb-3">아카이브 요약</h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-low/60">
                <dt className="text-[11px] text-ink-subtle">캐릭터</dt>
                <dd className="text-lg font-bold text-ink tabular-nums mt-0.5">
                  {state.characters.length}
                </dd>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-low/60">
                <dt className="text-[11px] text-ink-subtle">페어링</dt>
                <dd className="text-lg font-bold text-tertiary tabular-nums mt-0.5">
                  {state.pairings.length}
                </dd>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-low/60">
                <dt className="text-[11px] text-ink-subtle">할 일</dt>
                <dd className="text-lg font-bold text-primary tabular-nums mt-0.5">
                  {urgentCheckpoints.length}
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        {/* CENTER COLUMN (6 cols): Featured OC & Recent Pairing */}
        <div className="lg:col-span-6 space-y-6">
          {/* Featured OC Showcase */}
          {featuredCharacter && (
            <section className="bg-white rounded-2xl border border-hairline overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-5 relative min-h-[280px] sm:min-h-[340px] bg-surface-low">
                  <CharacterAvatar
                    character={featuredCharacter}
                    variant="square"
                    className="w-full h-full min-h-[280px] sm:min-h-[340px] rounded-none"
                  />
                </div>

                <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-ink-subtle">
                          {featuredCharacter.universeName} ·{' '}
                          {featuredCharacter.role}
                        </p>
                        <h2 className="text-2xl font-bold text-ink mt-1">
                          {featuredCharacter.name}
                          <span className="ml-2 text-sm font-normal text-ink-subtle font-display">
                            {featuredCharacter.englishName}
                          </span>
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(featuredCharacter.id)}
                        aria-label="캐릭터 즐겨찾기"
                        className={`p-2 rounded-xl border transition-colors ${
                          featuredCharacter.bookmarked
                            ? 'text-primary border-primary/30 bg-primary-fixed/30'
                            : 'text-ink-subtle border-hairline hover:text-ink'
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            featuredCharacter.bookmarked ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <blockquote className="text-sm font-medium text-ink leading-relaxed bg-surface-low/80 px-4 py-3 rounded-xl">
                      {featuredCharacter.quote}
                    </blockquote>

                    <p className="text-sm text-ink-muted leading-relaxed">
                      {featuredCharacter.shortBio}
                    </p>

                    {/* Clean Color Swatches & Inline Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-ink-subtle mr-1">
                          테마 컬러
                        </span>
                        {featuredCharacter.palette.map((hex) => (
                          <span
                            key={hex}
                            title={hex}
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-primary tabular-nums">
                        설정 완성도 {featuredCharacter.completion}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-hairline">
                    <span className="text-xs text-ink-subtle truncate">
                      {featuredCharacter.tags
                        .slice(0, 3)
                        .map((t) => `#${t}`)
                        .join(' · ')}
                    </span>
                    <Link
                      to={`/characters/${featuredCharacter.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container shrink-0"
                    >
                      <span>시트 열기</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recent Characters Mini Strip when filtered */}
          <section className="bg-white rounded-2xl border border-hairline p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-ink">
                  {selectedUniverseId === 'all'
                    ? '최근 작업한 캐릭터'
                    : '선택된 세계관 캐릭터'}
                </h2>
              </div>
              <Link
                to="/characters"
                className="text-xs font-medium text-primary hover:underline"
              >
                전체 보기 ({state.characters.length})
              </Link>
            </div>

            {filteredCharacters.length === 0 ? (
              <p className="text-sm text-ink-subtle py-4 text-center">
                해당 조건에 일치하는 캐릭터가 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredCharacters.slice(0, 4).map((char) => (
                  <Link
                    key={char.id}
                    to={`/characters/${char.id}`}
                    className="group flex flex-col rounded-xl border border-hairline overflow-hidden bg-surface/50 hover:border-primary/40 transition-colors"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <CharacterAvatar
                        character={char}
                        variant="square"
                        className="w-full h-full rounded-none group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-semibold text-ink truncate">
                        {char.name}
                      </p>
                      <p className="text-[11px] text-ink-subtle truncate mt-0.5">
                        {char.universeName} · {char.completion}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Featured Pairing Highlight */}
          {featuredPairing && (
            <section className="bg-white rounded-2xl border border-hairline p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-tertiary" />
                  <h2 className="text-sm font-bold text-ink">
                    주요 페어링 · 서사 공명
                  </h2>
                </div>
                <Link
                  to="/couple"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  페어링 갤러리
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5">
                  {featuredPairing.jointImageUrl ? (
                    <img
                      src={featuredPairing.jointImageUrl}
                      alt={featuredPairing.title}
                      className="w-full aspect-[4/3] object-cover rounded-xl border border-hairline"
                    />
                  ) : (
                    <div
                      className={`w-full aspect-[4/3] rounded-xl bg-gradient-to-br ${featuredPairing.jointGradient} flex items-center justify-center border border-hairline`}
                    >
                      <span className="text-base font-bold text-ink">
                        {featuredPairing.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-ink-subtle">
                        {featuredPairing.universeName} ·{' '}
                        {featuredPairing.category}
                      </p>
                      <h3 className="text-lg font-bold text-ink mt-0.5">
                        {featuredPairing.title}
                      </h3>
                    </div>
                    <span className="text-sm font-bold text-tertiary tabular-nums">
                      공명 {featuredPairing.resonance}%
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {featuredPairing.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-hairline">
                    <div className="flex items-center gap-2">
                      {pairCharA && (
                        <CharacterAvatar
                          character={pairCharA}
                          variant="circle"
                          className="w-8 h-8 border border-hairline"
                        />
                      )}
                      <span className="text-xs text-ink-subtle">×</span>
                      {pairCharB && (
                        <CharacterAvatar
                          character={pairCharB}
                          variant="circle"
                          className="w-8 h-8 border border-hairline"
                        />
                      )}
                      <span className="text-xs text-ink-subtle ml-1">
                        {featuredPairing.bondLabel}
                      </span>
                    </div>

                    <Link
                      to={`/couple/${featuredPairing.id}`}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
                    >
                      <span>자세히</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (3 cols): Inspiration Prompt & Urgent Checkpoints */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Daily Inspiration Prompt */}
          {currentPrompt && (
            <section className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-ink">오늘의 창작 질문</h2>
                </div>
                <button
                  type="button"
                  onClick={cyclePrompt}
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-primary transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>바꾸기</span>
                </button>
              </div>

              <p className="text-[11px] font-semibold text-primary">
                {currentPrompt.category}
              </p>
              <p className="text-sm font-semibold text-ink leading-relaxed">
                {currentPrompt.prompt}
              </p>
              <p className="text-xs text-ink-subtle leading-relaxed">
                {currentPrompt.hint}
              </p>

              {featuredCharacter && (
                <div className="pt-2 space-y-2 border-t border-hairline">
                  <textarea
                    rows={2}
                    value={quickMemo}
                    onChange={(e) => setQuickMemo(e.target.value)}
                    placeholder={`${featuredCharacter.name}의 에피소드 메모에 바로 기록...`}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSaveQuickMemo}
                    disabled={!quickMemo.trim()}
                    className="w-full py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors disabled:opacity-40"
                  >
                    메모에 추가하기
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Urgent Checkpoints */}
          <section className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">마감 임박 체크포인트</h2>
              <Link
                to="/checkpoints"
                className="text-xs font-medium text-primary hover:underline"
              >
                모두 보기
              </Link>
            </div>

            {urgentCheckpoints.length === 0 ? (
              <p className="text-xs text-ink-subtle py-3 text-center">
                모든 체크포인트를 완료했습니다.
              </p>
            ) : (
              <div className="space-y-2.5">
                {urgentCheckpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-low/60 hover:bg-surface-low transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCheckpoint(cp.id)}
                      className="mt-0.5 text-ink-subtle hover:text-primary shrink-0"
                      aria-label={`${cp.title} 완료 전환`}
                    >
                      {cp.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate('/checkpoints')}
                        className="text-left text-xs font-semibold text-ink hover:text-primary line-clamp-2"
                      >
                        {cp.title}
                      </button>
                      <p className="text-[11px] text-ink-subtle mt-1 tabular-nums">
                        {cp.universeName} ·{' '}
                        <span
                          className={
                            cp.status === 'urgent'
                              ? 'text-danger font-semibold'
                              : ''
                          }
                        >
                          {cp.dDayLabel}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <NewCharacterModal
        isOpen={newCharModalOpen}
        onClose={() => setNewCharModalOpen(false)}
      />
      <NewPairingModal
        isOpen={newPairingModalOpen}
        onClose={() => setNewPairingModalOpen(false)}
      />
    </div>
  );
};
