import React, { useState } from 'react';
import {
  Check,
  CheckSquare,
  ListChecks,
  Plus,
} from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import {
  formatShortDate,
  isOverdue,
  PROJECT_COLOR_DOT,
  STATUS_META,
} from '../lib/taskoUtils';
import { TaskStatus } from '../types/tasko';
import { PriorityIndicator } from './PriorityBadge';

export function TaskListView() {
  const {
    filteredTasks,
    projects,
    navScope,
    selectedTaskId,
    setSelectedTaskId,
    toggleTaskDone,
    moveTaskStatus,
    createTask,
    openNewTaskModal,
    setSearchQuery,
    setPriorityFilter,
    setHideCompleted,
    searchQuery,
    priorityFilter,
    hideCompleted,
  } = useTasko();

  const [quickTitle, setQuickTitle] = useState('');

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed) return;
    createTask({
      title: trimmed,
      projectId:
        navScope.type === 'project' ? navScope.projectId : projects[0]?.id,
      dueDate: navScope.type === 'today' ? '2026-11-12' : null,
      status: TaskStatus.BACKLOG,
    });
    setQuickTitle('');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || priorityFilter !== 'all' || hideCompleted;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {/* Inline Quick-Add Bar */}
        <form
          onSubmit={handleQuickAdd}
          className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80"
        >
          <Plus
            className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="여기에 작업 제목을 입력하고 Enter 키로 빠르게 추가하세요..."
            aria-label="빠른 작업 추가"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {quickTitle.trim() && (
            <button
              type="submit"
              className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shrink-0"
            >
              추가
            </button>
          )}
        </form>

        {/* Table Header (Desktop) */}
        <div className="hidden md:grid grid-cols-[32px_76px_1fr_110px_96px_130px_92px_64px] items-center gap-3 px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30">
          <span className="sr-only">완료</span>
          <span>ID</span>
          <span>작업</span>
          <span>상태</span>
          <span>우선순위</span>
          <span>프로젝트</span>
          <span className="text-right">마감일</span>
          <span className="text-right">예상</span>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CheckSquare
              className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              표시할 작업이 없습니다
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {hasActiveFilters
                ? '검색어나 필터 조건을 조정하거나 새 작업을 추가해 보세요.'
                : '첫 번째 작업을 등록해 워크스페이스를 시작하세요.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setPriorityFilter('all');
                    setHideCompleted(false);
                  }}
                  className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  필터 초기화
                </button>
              )}
              <button
                type="button"
                onClick={() => openNewTaskModal()}
                className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                새 작업 만들기
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredTasks.map((task) => {
              const isDone = task.status === TaskStatus.DONE;
              const overdue = isOverdue(task);
              const project = projectMap.get(task.projectId);
              const doneSubtasks = task.subtasks.filter((s) => s.completed).length;
              const selected = selectedTaskId === task.id;

              return (
                <li
                  key={task.id}
                  className={`group transition-colors ${
                    selected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="grid grid-cols-[28px_1fr_auto] md:grid-cols-[32px_76px_1fr_110px_96px_130px_92px_64px] items-center gap-3 px-4 py-2.5 min-h-[44px]">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleTaskDone(task.id)}
                      aria-label={isDone ? '완료 해제' : '완료로 표시'}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    </button>

                    {/* Code (Desktop) */}
                    <span className="hidden md:inline font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {task.code}
                    </span>

                    {/* Title + Mobile sub-meta */}
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-left min-w-0 flex flex-col md:flex-row md:items-center md:gap-2.5"
                    >
                      <span
                        className={`text-sm font-medium truncate ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.subtasks.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                          <ListChecks className="w-3 h-3" aria-hidden="true" />
                          {doneSubtasks}/{task.subtasks.length}
                        </span>
                      )}

                      {/* Mobile compact metadata line */}
                      <span className="md:hidden text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="font-mono tabular-nums">{task.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project?.name ?? '미분류'}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            overdue
                              ? 'text-red-600 dark:text-red-400 font-medium'
                              : ''
                          }
                        >
                          {overdue
                            ? `지연 (${formatShortDate(task.dueDate)})`
                            : formatShortDate(task.dueDate)}
                        </span>
                      </span>
                    </button>

                    {/* Status Select (Desktop) */}
                    <div className="hidden md:block">
                      <select
                        aria-label={`${task.title} 상태 변경`}
                        value={task.status}
                        onChange={(e) =>
                          moveTaskStatus(task.id, e.target.value as TaskStatus)
                        }
                        className="w-full h-7 px-1.5 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      >
                        {Object.values(TaskStatus).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_META[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority (Desktop) */}
                    <div className="hidden md:flex items-center">
                      <PriorityIndicator priority={task.priority} />
                    </div>

                    {/* Project (Desktop) */}
                    <div className="hidden md:flex items-center gap-2 min-w-0">
                      {project && (
                        <>
                          <span
                            className={`w-2 h-2 rounded-xs shrink-0 ${
                              PROJECT_COLOR_DOT[project.color]
                            }`}
                            aria-hidden="true"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {project.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Due date */}
                    <div className="text-right">
                      <span
                        className={`text-xs font-mono tabular-nums whitespace-nowrap ${
                          overdue
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {overdue
                          ? `지연 ${formatShortDate(task.dueDate)}`
                          : formatShortDate(task.dueDate)}
                      </span>
                    </div>

                    {/* Estimate (Desktop) */}
                    <div className="hidden md:block text-right">
                      <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {task.estimateHours ? `${task.estimateHours}h` : '—'}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
