import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { TODAY_ISO } from '../data/initialData';
import { isOverdue } from '../lib/taskoUtils';
import { TaskStatus } from '../types/tasko';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function TaskCalendarView() {
  const { filteredTasks, navScope, setSelectedTaskId, openNewTaskModal } =
    useTasko();

  // Default to November 2026 (matching TODAY_ISO)
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); // 0-indexed: 10 = November

  const goPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setYear(2026);
    setMonth(10);
  };

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { iso: string | null; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ iso: null, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({ iso: `${year}-${mStr}-${dStr}`, day: d });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ iso: null, day: null });
    }
    return cells;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof filteredTasks>();
    for (const task of filteredTasks) {
      if (!task.dueDate) continue;
      const existing = map.get(task.dueDate) ?? [];
      existing.push(task);
      map.set(task.dueDate, existing);
    }
    return map;
  }, [filteredTasks]);

  const unscheduledTasks = useMemo(
    () => filteredTasks.filter((t) => !t.dueDate),
    [filteredTasks]
  );

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto w-full space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {year}년 {month + 1}월
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToday}
              className="h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="이전 달"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="다음 달"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          {WEEKDAYS.map((dayLabel, idx) => (
            <div
              key={dayLabel}
              className={`py-2 text-center text-xs font-medium ${
                idx === 0
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {dayLabel}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800">
          {calendarCells.map((cell, idx) => {
            if (!cell.iso || !cell.day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[104px] bg-slate-50/40 dark:bg-slate-950/30"
                />
              );
            }

            const dayTasks = tasksByDate.get(cell.iso) ?? [];
            const isToday = cell.iso === TODAY_ISO;

            return (
              <div
                key={cell.iso}
                className={`min-h-[104px] p-1.5 flex flex-col group ${
                  isToday ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded ${
                      isToday
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openNewTaskModal({
                        dueDate: cell.iso,
                        projectId:
                          navScope.type === 'project'
                            ? navScope.projectId
                            : undefined,
                      })
                    }
                    aria-label={`${cell.iso} 날짜에 새 작업 추가`}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto">
                  {dayTasks.map((task) => {
                    const isDone = task.status === TaskStatus.DONE;
                    const overdue = isOverdue(task);

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`w-full text-left px-1.5 py-1 rounded text-[11px] leading-tight border truncate transition-colors ${
                          isDone
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                            : overdue
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled section */}
      {unscheduledTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            마감일 미지정 작업 ({unscheduledTasks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <span className="font-mono text-slate-400 mr-1.5">
                  {task.code}
                </span>
                <span>{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
