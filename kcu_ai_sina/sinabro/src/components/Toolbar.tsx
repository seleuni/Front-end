import {
  Calendar,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { SortBy, TaskPriority, ViewMode } from '../types/tasko';

export function Toolbar() {
  const {
    viewMode,
    setViewMode,
    priorityFilter,
    setPriorityFilter,
    hideCompleted,
    setHideCompleted,
    sortBy,
    setSortBy,
    filteredTasks,
    searchQuery,
    setSearchQuery,
  } = useTasko();

  return (
    <div className="px-4 lg:px-6 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Segmented View Switcher + Count */}
      <div className="flex items-center gap-3">
        <div
          role="tablist"
          aria-label="보기 방식 선택"
          className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === ViewMode.LIST}
            onClick={() => setViewMode(ViewMode.LIST)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === ViewMode.LIST
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" aria-hidden="true" />
            <span>리스트</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === ViewMode.BOARD}
            onClick={() => setViewMode(ViewMode.BOARD)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === ViewMode.BOARD
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span>보드</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === ViewMode.CALENDAR}
            onClick={() => setViewMode(ViewMode.CALENDAR)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === ViewMode.CALENDAR
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>캘린더</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
          {filteredTasks.length}개 작업
        </span>
      </div>

      {/* Right: Filter & Sort Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mobile search */}
        <div className="relative flex sm:hidden items-center w-full mb-1">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작업 검색..."
            aria-label="모바일 작업 검색"
            className="w-full h-8 pl-8 pr-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          aria-label="우선순위 필터"
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TaskPriority | 'all')
          }
          className="h-8 px-2.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 whitespace-nowrap"
        >
          <option value="all">우선순위: 전체</option>
          <option value={TaskPriority.URGENT}>긴급만</option>
          <option value={TaskPriority.HIGH}>높음만</option>
          <option value={TaskPriority.MEDIUM}>보통만</option>
          <option value={TaskPriority.LOW}>낮음만</option>
        </select>

        <select
          aria-label="정렬 기준"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="h-8 px-2.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-700 dark:text-slate-300 whitespace-nowrap"
        >
          <option value={SortBy.MANUAL}>정렬: 기본</option>
          <option value={SortBy.DUE_DATE}>정렬: 마감일순</option>
          <option value={SortBy.PRIORITY}>정렬: 우선순위순</option>
          <option value={SortBy.CREATED}>정렬: 최신 생성순</option>
        </select>

        <button
          type="button"
          onClick={() => setHideCompleted(!hideCompleted)}
          className={`h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
            hideCompleted
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {hideCompleted ? (
            <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>완료 숨기기</span>
        </button>
      </div>
    </div>
  );
}
