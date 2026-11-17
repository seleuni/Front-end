import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Plus,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import { NewCheckpointModal } from '../components/modals/CreateModals';
import { useArchive } from '../context/ArchiveContext';
import type { CheckpointStatus } from '../types/archive';

type StatusFilter = 'all' | CheckpointStatus;
type SortKey = 'dueDate' | 'progress' | 'updated';

export const CheckpointsPage: React.FC = () => {
  const { state, toggleCheckpoint, toggleChecklistItem } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');
  const [universeFilter, setUniverseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('dueDate');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = state.checkpoints.filter((cp) => {
      if (universeFilter !== 'all' && cp.universeId !== universeFilter) {
        return false;
      }
      if (statusFilter !== 'all' && cp.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        cp.title.toLowerCase().includes(q) ||
        cp.universeName.toLowerCase().includes(q) ||
        (cp.characterName || '').toLowerCase().includes(q) ||
        cp.category.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'updated') return b.updatedAt.localeCompare(a.updatedAt);
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [state.checkpoints, searchQuery, universeFilter, statusFilter, sortBy]);

  const urgentCount = state.checkpoints.filter((c) => c.status === 'urgent').length;
  const completedCount = state.checkpoints.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            MILESTONE & CHECKPOINT ARCHIVE
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            체크포인트 관리
          </h1>
          <p className="text-sm text-ink-muted mt-1 tabular-nums">
            전체 {state.checkpoints.length}건 · 긴급 {urgentCount}건 · 완료{' '}
            {completedCount}건
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 체크포인트 등록</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-hairline p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 캐릭터, 세계관 검색..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={universeFilter}
              onChange={(e) => setUniverseFilter(e.target.value)}
              aria-label="세계관 필터"
              className="px-3 py-2 text-xs font-medium rounded-xl border border-hairline bg-surface text-ink min-h-[38px]"
            >
              <option value="all">모든 세계관</option>
              {state.universes.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="정렬 기준"
              className="px-3 py-2 text-xs font-medium rounded-xl border border-hairline bg-surface text-ink min-h-[38px]"
            >
              <option value="dueDate">마감 임박순</option>
              <option value="progress">진행률순</option>
              <option value="updated">최근 수정순</option>
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
                aria-label="카드 보기"
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

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as const, label: '전체' },
            { id: 'urgent' as const, label: '긴급 마감' },
            { id: 'in_progress' as const, label: '진행 중' },
            { id: 'completed' as const, label: '완료됨' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-ink text-white'
                  : 'bg-surface-low text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline p-12 text-center">
          <p className="text-base font-semibold text-ink">
            표시할 체크포인트가 없습니다.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cp) => (
            <article
              key={cp.id}
              className="bg-white rounded-2xl border border-hairline overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Scene Visual Banner */}
                <div className="relative h-36 overflow-hidden bg-surface-low border-b border-hairline">
                  {cp.coverUrl ? (
                    <img
                      src={cp.coverUrl}
                      alt={cp.title}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${cp.coverGradient} flex items-center justify-center`}
                    >
                      <span className="text-xs font-semibold text-ink-muted">
                        {cp.universeName}
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums bg-white/95 border border-hairline ${
                      cp.completed
                        ? 'text-primary'
                        : cp.status === 'urgent'
                          ? 'text-danger'
                          : 'text-ink'
                    }`}
                  >
                    {cp.dDayLabel}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-ink-subtle">
                        {cp.universeName} · {cp.category}
                      </p>
                      <h2
                        className={`text-base font-bold mt-1 leading-snug ${
                          cp.completed
                            ? 'line-through text-ink-subtle'
                            : 'text-ink'
                        }`}
                      >
                        {cp.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCheckpoint(cp.id)}
                      className="p-1.5 rounded-lg text-ink-subtle hover:text-primary shrink-0"
                      aria-label="체크포인트 완료 전환"
                    >
                      {cp.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed">
                    {cp.summary}
                  </p>

                  {/* Sub-checklist */}
                  {cp.checklist.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-hairline">
                      {cp.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleChecklistItem(cp.id, item.id)}
                          className="w-full flex items-start gap-2 text-left text-xs py-1 hover:text-primary transition-colors"
                        >
                          {item.done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-ink-subtle shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              item.done
                                ? 'line-through text-ink-subtle'
                                : 'text-ink-muted'
                            }
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Progress */}
              <div className="px-5 py-3.5 bg-surface-low/50 border-t border-hairline space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {cp.characterId ? (
                    <Link
                      to={`/characters/${cp.characterId}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {cp.characterName} 시트 보기
                    </Link>
                  ) : (
                    <span className="text-ink-subtle">공통 설정</span>
                  )}
                  <span className="font-semibold text-ink tabular-nums">
                    {cp.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-hairline overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${cp.progress}%` }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-hairline divide-y divide-hairline overflow-hidden">
          {filtered.map((cp) => (
            <div
              key={cp.id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-surface-low/40 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleCheckpoint(cp.id)}
                  className="mt-0.5 text-ink-subtle hover:text-primary shrink-0"
                  aria-label="완료 전환"
                >
                  {cp.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className="text-xs text-ink-subtle">
                    {cp.universeName} · {cp.category} · 마감 {cp.dueDate}
                  </p>
                  <h2
                    className={`text-sm font-bold mt-0.5 ${
                      cp.completed
                        ? 'line-through text-ink-subtle'
                        : 'text-ink'
                    }`}
                  >
                    {cp.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs">
                {cp.characterId && (
                  <Link
                    to={`/characters/${cp.characterId}`}
                    className="hidden sm:inline font-semibold text-primary hover:underline"
                  >
                    {cp.characterName}
                  </Link>
                )}
                <span
                  className={`font-bold tabular-nums ${
                    cp.completed
                      ? 'text-primary'
                      : cp.status === 'urgent'
                        ? 'text-danger'
                        : 'text-ink'
                  }`}
                >
                  {cp.dDayLabel} ({cp.progress}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewCheckpointModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};
