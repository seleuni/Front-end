import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  HeartHandshake,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { NewPairingModal } from '../components/modals/CreateModals';
import { useArchive } from '../context/ArchiveContext';
import type { PairingCategory } from '../types/archive';

type CategoryFilter = '전체' | PairingCategory;
type SortOption = 'updated' | 'resonance' | 'title';

export const PairingsPage: React.FC = () => {
  const { state } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('전체');
  const [sortBy, setSortBy] = useState<SortOption>('resonance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = state.pairings.filter((p) => {
      if (categoryFilter !== '전체' && p.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.universeName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'resonance') return b.resonance - a.resonance;
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ko');
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [state.pairings, searchQuery, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <p className="text-xs font-semibold text-tertiary uppercase tracking-wider">
            PAIRING & RELATIONSHIP ARCHIVE
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            페어링 · 관계 아카이브
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            두 캐릭터 사이의 호칭, 감정선, 공명도 및 공동 서사 연표를 정리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 페어링 등록</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-hairline p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="페어링 이름, 세계관, 키워드 검색..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="정렬 기준"
              className="px-3 py-2 text-xs font-medium rounded-xl border border-hairline bg-surface text-ink min-h-[38px]"
            >
              <option value="resonance">서사 공명도순</option>
              <option value="updated">최근 수정순</option>
              <option value="title">이름 가나다순</option>
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

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(
            [
              '전체',
              '로맨스·CP',
              '라이벌·대립',
              '파트너·동료',
              '가족·사제',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-ink text-white'
                  : 'bg-surface-low text-ink-muted hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid or List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline p-12 text-center">
          <p className="text-base font-semibold text-ink">
            해당 조건에 맞는 페어링이 없습니다.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((pairing) => {
            const charA = state.characters.find((c) => c.id === pairing.charAId);
            const charB = state.characters.find((c) => c.id === pairing.charBId);

            return (
              <Link
                key={pairing.id}
                to={`/couple/${pairing.id}`}
                className="group bg-white rounded-2xl border border-hairline overflow-hidden hover:border-primary/40 transition-colors flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-low border-b border-hairline">
                  {pairing.jointImageUrl ? (
                    <img
                      src={pairing.jointImageUrl}
                      alt={pairing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${pairing.jointGradient} flex items-center justify-center gap-6 px-6`}
                    >
                      {charA && (
                        <CharacterAvatar
                          character={charA}
                          variant="circle"
                          className="w-20 h-20 border-2 border-white shadow-sm"
                        />
                      )}
                      <HeartHandshake className="w-6 h-6 text-tertiary/80" />
                      {charB && (
                        <CharacterAvatar
                          character={charB}
                          variant="circle"
                          className="w-20 h-20 border-2 border-white shadow-sm"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-subtle">
                        {pairing.universeName} · {pairing.category}
                      </span>
                      <span className="font-bold text-tertiary tabular-nums">
                        공명 {pairing.resonance}%
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-ink">
                      {pairing.title}
                    </h2>
                    <p className="text-xs font-medium text-primary">
                      {pairing.subtitle}
                    </p>
                    <p className="text-sm text-ink-muted line-clamp-2 leading-relaxed">
                      {pairing.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-hairline text-xs">
                    <span className="text-ink-subtle truncate">
                      {pairing.tags.map((t) => `#${t}`).join(' · ')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary shrink-0 ml-2">
                      <span>관계 백과</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-hairline divide-y divide-hairline overflow-hidden">
          {filtered.map((pairing) => {
            const charA = state.characters.find((c) => c.id === pairing.charAId);
            const charB = state.characters.find((c) => c.id === pairing.charBId);
            return (
              <Link
                key={pairing.id}
                to={`/couple/${pairing.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-surface-low/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex -space-x-2 shrink-0">
                    {charA && (
                      <CharacterAvatar
                        character={charA}
                        variant="circle"
                        className="w-11 h-11 border-2 border-white"
                      />
                    )}
                    {charB && (
                      <CharacterAvatar
                        character={charB}
                        variant="circle"
                        className="w-11 h-11 border-2 border-white"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-subtle">
                      {pairing.universeName} · {pairing.category}
                    </p>
                    <h2 className="text-base font-bold text-ink mt-0.5">
                      {pairing.title}
                    </h2>
                    <p className="text-xs text-ink-muted truncate">
                      {pairing.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-tertiary tabular-nums">
                    공명 {pairing.resonance}%
                  </span>
                  <p className="text-[11px] text-ink-subtle">
                    {pairing.bondLabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <NewPairingModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
