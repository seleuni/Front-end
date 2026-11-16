import React, { useState } from 'react';
import { ArrowRight, Check, ListChecks, Plus } from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import {
  formatShortDate,
  isOverdue,
  PROJECT_COLOR_DOT,
  STATUS_META,
} from '../lib/taskoUtils';
import { TaskStatus } from '../types/tasko';
import { PriorityIndicator } from './PriorityBadge';

const BOARD_COLUMNS: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REVIEW,
  TaskStatus.DONE,
];

export function TaskBoardView() {
  const {
    filteredTasks,
    projects,
    navScope,
    selectedTaskId,
    setSelectedTaskId,
    moveTaskStatus,
    toggleTaskDone,
    openNewTaskModal,
  } = useTasko();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    const idx = BOARD_COLUMNS.indexOf(current);
    return BOARD_COLUMNS[(idx + 1) % BOARD_COLUMNS.length];
  };

  return (
    <div className="p-4 lg:p-6 flex-1 overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-0">
        {BOARD_COLUMNS.map((columnStatus) => {
          const columnTasks = filteredTasks.filter(
            (t) => t.status === columnStatus
          );
          const isDropActive = dragOverColumn === columnStatus;

          return (
            <section
              key={columnStatus}
              aria-label={`${STATUS_META[columnStatus].label} 열`}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverColumn !== columnStatus) {
                  setDragOverColumn(columnStatus);
                }
              }}
              onDragLeave={() => {
                if (dragOverColumn === columnStatus) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => handleDrop(e, columnStatus)}
              className={`flex flex-col rounded-lg border transition-colors min-h-[360px] ${
                isDropActive
                  ? 'border-blue-500 bg-blue-50/40 dark:border-blue-400 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50'
              }`}
            >
              {/* Column Header */}
              <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {STATUS_META[columnStatus].label}
                  </h2>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openNewTaskModal({
                      status: columnStatus,
                      projectId:
                        navScope.type === 'project'
                          ? navScope.projectId
                          : undefined,
                    })
                  }
                  aria-label={`${STATUS_META[columnStatus].label} 열에 새 작업 추가`}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Stack */}
              <div className="p-2.5 space-y-2 flex-1">
                {columnTasks.length === 0 ? (
                  <div className="py-10 px-3 text-center text-xs text-slate-400 dark:text-slate-500">
                    이 열에 작업이 없습니다
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const project = projectMap.get(task.projectId);
                    const isDone = task.status === TaskStatus.DONE;
                    const overdue = isOverdue(task);
                    const doneSubtasks = task.subtasks.filter(
                      (s) => s.completed
                    ).length;
                    const isSelected = selectedTaskId === task.id;
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-md border p-3 bg-white dark:bg-slate-900 transition-colors cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'border-blue-500 dark:border-blue-400'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        } ${draggingTaskId === task.id ? 'opacity-50' : ''}`}
                      >
                        {/* Top line: Code + Priority */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            {task.code}
                          </span>
                          <PriorityIndicator priority={task.priority} />
                        </div>

                        {/* Title */}
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          className="text-left w-full block mb-2.5"
                        >
                          <h3
                            className={`text-sm font-medium leading-snug line-clamp-2 ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </button>

                        {/* Clean unboxed metadata + quick action row */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            {project && (
                              <span className="inline-flex items-center gap-1.5 truncate">
                                <span
                                  className={`w-1.5 h-1.5 rounded-xs shrink-0 ${
                                    PROJECT_COLOR_DOT[project.color]
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{project.name}</span>
                              </span>
                            )}
                            {task.dueDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={`font-mono tabular-nums whitespace-nowrap ${
                                    overdue
                                      ? 'text-red-600 dark:text-red-400 font-semibold'
                                      : ''
                                  }`}
                                >
                                  {formatShortDate(task.dueDate)}
                                </span>
                              </>
                            )}
                            {task.subtasks.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-0.5 font-mono tabular-nums">
                                  <ListChecks className="w-3 h-3" aria-hidden="true" />
                                  {doneSubtasks}/{task.subtasks.length}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleTaskDone(task.id)}
                              aria-label={isDone ? '완료 해제' : '완료 처리'}
                              title={isDone ? '완료 해제' : '완료 처리'}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTaskStatus(task.id, nextStatus)}
                              aria-label={`${STATUS_META[nextStatus].label} 상태로 이동`}
                              title={`${STATUS_META[nextStatus].label}로 이동`}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
