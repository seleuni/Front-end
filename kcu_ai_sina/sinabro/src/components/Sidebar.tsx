import {
  CalendarClock,
  CheckSquare,
  Database,
  FolderKanban,
  Inbox,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { TODAY_ISO } from '../data/initialData';
import { isDueToday, isOverdue, PROJECT_COLOR_DOT } from '../lib/taskoUtils';
import { NavScope, TaskStatus } from '../types/tasko';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const {
    tasks,
    projects,
    navScope,
    setNavScope,
    setIsNewProjectModalOpen,
    setIsDataModalOpen,
  } = useTasko();

  const totalOpenCount = tasks.filter((t) => t.status !== TaskStatus.DONE).length;
  const todayCount = tasks.filter(
    (t) => t.status !== TaskStatus.DONE && (isDueToday(t) || isOverdue(t))
  ).length;
  const upcomingCount = tasks.filter(
    (t) => t.status !== TaskStatus.DONE && t.dueDate !== null && t.dueDate >= TODAY_ISO
  ).length;

  const selectScope = (scope: NavScope) => {
    setNavScope(scope);
    onCloseMobile();
  };

  const isActiveScope = (candidate: NavScope): boolean => {
    if (candidate.type !== navScope.type) return false;
    if (candidate.type === 'project' && navScope.type === 'project') {
      return candidate.projectId === navScope.projectId;
    }
    return true;
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => selectScope({ type: 'all' })}
          className="flex items-center gap-2.5 text-left group"
        >
          <span className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Open Tasko
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="사이드바 닫기"
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Primary Views */}
        <div>
          <p className="px-2.5 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            워크스페이스
          </p>
          <nav className="space-y-0.5" aria-label="기본 작업 보기">
            <button
              type="button"
              onClick={() => selectScope({ type: 'all' })}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveScope({ type: 'all' })
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">전체 작업</span>
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {totalOpenCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectScope({ type: 'today' })}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveScope({ type: 'today' })
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">오늘 집중</span>
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {todayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectScope({ type: 'upcoming' })}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveScope({ type: 'upcoming' })
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <CalendarClock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">예정된 일정</span>
              </span>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {upcomingCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Projects */}
        <div>
          <div className="px-2.5 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              프로젝트
            </span>
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              aria-label="새 프로젝트 만들기"
              className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="space-y-0.5" aria-label="프로젝트 목록">
            {projects.map((project) => {
              const active = isActiveScope({
                type: 'project',
                projectId: project.id,
              });
              const openInProject = tasks.filter(
                (t) => t.projectId === project.id && t.status !== TaskStatus.DONE
              ).length;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() =>
                    selectScope({ type: 'project', projectId: project.id })
                  }
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-xs shrink-0 ${PROJECT_COLOR_DOT[project.color]}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{project.name}</span>
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {openInProject}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace Summary (Flat, unboxed dividers) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 px-2.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <FolderKanban className="w-3.5 h-3.5" aria-hidden="true" />
            <span>진행 현황</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="py-1.5">
              <div className="text-slate-500 dark:text-slate-400">남은 작업</div>
              <div className="text-base font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {totalOpenCount}
              </div>
            </div>
            <div className="py-1.5">
              <div className="text-slate-500 dark:text-slate-400">완료됨</div>
              <div className="text-base font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {tasks.length - totalOpenCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Open Portability Action */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsDataModalOpen(true);
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Database className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <span>데이터 내보내기 · 가져오기</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full z-10">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
