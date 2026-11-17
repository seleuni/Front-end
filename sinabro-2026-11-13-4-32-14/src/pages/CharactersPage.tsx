import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { NewCharacterModal } from '../components/modals/CreateModals';
import { useArchive } from '../context/ArchiveContext';

type SortOption = 'updated' | 'name' | 'completion';

export const CharactersPage: React.FC = () => {
  const { state, toggleBookmark } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');
  const [universeFilter, setUniverseFilter] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = state.characters.filter((c) => {
      if (universeFilter !== 'all' && c.universeId !== universeFilter) {
        return false;
      }
      if (onlyBookmarked && !c.bookmarked) {
        return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.universeName.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortBy === 'completion') return b.completion - a.completion;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [state.characters, searchQuery, universeFilter, onlyBookmarked, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            CHARACTER ARCHIVE
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            캐릭터 아카이브
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            등록된 자작 캐릭터의 설정, 외모 아트워크, 능력치 및 연표를 관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 캐릭터 등록</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-hairline p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="캐릭터 이름, 영문명, 태그, 역할 검색..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyBookmarked((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors min-h-[38px] ${
                onlyBookmarked
                  ? 'bg-primary-fixed/40 text-primary border-primary/40'
                  : 'bg-surface text-ink-muted border-hairline hover:text-ink'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-current' : ''}`}
              />
              <span>즐겨찾기만</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="정렬 기준"
              className="px-3 py-2 text-xs font-medium rounded-xl border border-hairline bg-surface text-ink focus:outline-none focus:border-primary min-h-[38px]"
            >
              <option value="updated">최근 수정순</option>
              <option value="name">이름 가나다순</option>
              <option value="completion">설정 완성도순</option>
            </select>

            <div className="inline-flex rounded-xl border border-hairline bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-ink-subtle hover:text-ink'
                }`}
                aria-label="그리드 보기"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-ink-subtle hover:text-ink'
                }`}
                aria-label="리스트 보기"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Universe Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setUniverseFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              universeFilter === 'all'
                ? 'bg-ink text-white'
                : 'bg-surface-low text-ink-muted hover:text-ink'
            }`}
          >
            전체 ({state.characters.length})
          </button>
          {state.universes.map((u) => {
            const count = state.characters.filter(
              (c) => c.universeId === u.id
            ).length;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setUniverseFilter(u.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  universeFilter === u.id
                    ? 'bg-ink text-white'
                    : 'bg-surface-low text-ink-muted hover:text-ink'
                }`}
              >
                {u.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline p-12 text-center space-y-3">
          <p className="text-base font-semibold text-ink">
            조건에 맞는 캐릭터가 없습니다.
          </p>
          <p className="text-sm text-ink-subtle">
            검색어를 비우거나 새로운 캐릭터를 등록해보세요.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((char) => (
            <div
              key={char.id}
              className="group bg-white rounded-2xl border border-hairline overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface-low">
                <Link to={`/characters/${char.id}`} className="block w-full h-full">
                  <CharacterAvatar
                    character={char}
                    variant="square"
                    className="w-full h-full rounded-none group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBookmark(char.id)}
                  aria-label={`${char.name} 즐겨찾기`}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-colors ${
                    char.bookmarked
                      ? 'bg-white/95 text-primary border-primary/30'
                      : 'bg-white/80 text-ink-muted border-white/60 hover:text-ink'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${char.bookmarked ? 'fill-current' : ''}`}
                  />
                </button>
              </div>

              <Link
                to={`/characters/${char.id}`}
                className="p-4 flex-1 flex flex-col justify-between gap-3"
              >
                <div>
                  <p className="text-xs text-ink-subtle truncate">
                    {char.universeName} · {char.mbti}
                  </p>
                  <h2 className="text-lg font-bold text-ink mt-0.5 flex items-baseline gap-2">
                    <span>{char.name}</span>
                    <span className="text-xs font-normal text-ink-subtle font-display truncate">
                      {char.englishName}
                    </span>
                  </h2>
                  <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                    {char.shortBio}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-subtle truncate">
                      {char.tags
                        .slice(0, 3)
                        .map((t) => `#${t}`)
                        .join(' ')}
                    </span>
                    <span className="font-semibold text-primary tabular-nums shrink-0 ml-2">
                      {char.completion}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-low overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${char.completion}%` }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-hairline divide-y divide-hairline overflow-hidden">
          {filtered.map((char) => (
            <div
              key={char.id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-surface-low/40 transition-colors"
            >
              <Link
                to={`/characters/${char.id}`}
                className="flex items-center gap-4 min-w-0 flex-1"
              >
                <CharacterAvatar
                  character={char}
                  variant="square"
                  className="w-14 h-16 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-ink-subtle">
                    {char.universeName} · {char.role}
                  </p>
                  <h2 className="text-base font-bold text-ink mt-0.5">
                    {char.name}
                    <span className="ml-2 text-xs font-normal text-ink-subtle">
                      {char.englishName}
                    </span>
                  </h2>
                  <p className="text-xs text-ink-muted truncate mt-0.5">
                    {char.quote}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    완성도 {char.completion}%
                  </span>
                  <p className="text-[11px] text-ink-subtle tabular-nums">
                    수정 {char.updatedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleBookmark(char.id)}
                  className={`p-2 rounded-xl border ${
                    char.bookmarked
                      ? 'text-primary border-primary/30 bg-primary-fixed/30'
                      : 'text-ink-subtle border-hairline'
                  }`}
                  aria-label="즐겨찾기"
                >
                  <Bookmark
                    className={`w-4 h-4 ${char.bookmarked ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewCharacterModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
