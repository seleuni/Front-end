import React from 'react';
import { Menu, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { useTasko } from '../context/TaskoContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function Header({ onOpenMobileMenu, searchInputRef }: HeaderProps) {
  const {
    theme,
    toggleTheme,
    navScope,
    projects,
    searchQuery,
    setSearchQuery,
    openNewTaskModal,
  } = useTasko();

  let scopeTitle = '전체 작업';
  if (navScope.type === 'today') {
    scopeTitle = '오늘 집중';
  } else if (navScope.type === 'upcoming') {
    scopeTitle = '예정된 일정';
  } else if (navScope.type === 'project') {
    scopeTitle =
      projects.find((p) => p.id === navScope.projectId)?.name ?? '프로젝트';
  }

  const handleOpenNew = () => {
    if (navScope.type === 'project') {
      openNewTaskModal({ projectId: navScope.projectId });
    } else if (navScope.type === 'today') {
      openNewTaskModal({ dueDate: '2026-11-12' });
    } else {
      openNewTaskModal();
    }
  };

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button + Breadcrumb trail */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="메뉴 열기"
          className="lg:hidden w-10 h-10 -ml-2 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="현재 위치" className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Open Tasko
          </span>
          <span
            className="hidden sm:inline text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          >
            /
          </span>
          <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {scopeTitle}
          </h1>
        </nav>
      </div>

      {/* Right: Search, Theme Toggle, Primary CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden sm:flex items-center w-56 md:w-64">
          <Search
            className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색 (⌘K)"
            aria-label="작업 검색"
            className="w-full h-9 pl-8 pr-7 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
              className="absolute right-1.5 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          title={theme === 'light' ? '다크 모드' : '라이트 모드'}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={handleOpenNew}
          className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>새 작업</span>
        </button>
      </div>
    </header>
  );
}
