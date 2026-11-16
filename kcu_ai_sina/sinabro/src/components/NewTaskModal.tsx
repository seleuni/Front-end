import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { PRIORITY_META, STATUS_META } from '../lib/taskoUtils';
import { TaskPriority, TaskStatus } from '../types/tasko';

export function NewTaskModal() {
  const {
    isNewTaskModalOpen,
    newTaskPreset,
    closeNewTaskModal,
    projects,
    createTask,
  } = useTasko();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.BACKLOG);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? 'proj-core');
  const [dueDate, setDueDate] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNewTaskModalOpen) return;
    setTitle('');
    setDescription('');
    setStatus(newTaskPreset?.status ?? TaskStatus.BACKLOG);
    setPriority(newTaskPreset?.priority ?? TaskPriority.MEDIUM);
    setProjectId(newTaskPreset?.projectId ?? projects[0]?.id ?? 'proj-core');
    setDueDate(newTaskPreset?.dueDate ?? '');
    setEstimateHours('');
    setSubtaskText('');
    setSubtasks([]);

    const timer = window.setTimeout(() => titleInputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [isNewTaskModalOpen, newTaskPreset, projects]);

  if (!isNewTaskModalOpen) return null;

  const handleAddSubtaskDraft = () => {
    const clean = subtaskText.trim();
    if (!clean) return;
    setSubtasks((prev) => [...prev, clean]);
    setSubtaskText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask({
      title,
      description,
      status,
      priority,
      projectId,
      dueDate: dueDate || null,
      estimateHours: estimateHours ? Number(estimateHours) : null,
      subtaskTitles: subtasks,
    });
    closeNewTaskModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="새 작업 만들기"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
        onClick={closeNewTaskModal}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            새 작업 만들기
          </h2>
          <button
            type="button"
            onClick={closeNewTaskModal}
            aria-label="창 닫기"
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              제목
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇을 완료해야 하나요?"
              className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              설명 (선택)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="배경 맥락이나 완료 기준을 적어두세요..."
              className="w-full p-2.5 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-9 px-2 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {Object.values(TaskStatus).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_META[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-2 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {Object.values(TaskPriority).map((pr) => (
                  <option key={pr} value={pr}>
                    {PRIORITY_META[pr].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                프로젝트
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-9 px-2 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                마감일
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-9 px-2 text-xs font-mono tabular-nums rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                예상 시간 (h)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimateHours}
                onChange={(e) => setEstimateHours(e.target.value)}
                placeholder="예: 2"
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                하위 체크리스트 (선택)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={subtaskText}
                  onChange={(e) => setSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtaskDraft();
                    }
                  }}
                  placeholder="체크 항목 입력 후 추가"
                  className="flex-1 h-9 px-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddSubtaskDraft}
                  className="h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>추가</span>
                </button>
              </div>
            </div>
          </div>

          {subtasks.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2">
              {subtasks.map((st, idx) => (
                <li
                  key={`${st}-${idx}`}
                  className="flex items-center justify-between py-1"
                >
                  <span className="truncate">• {st}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-red-600 ml-2"
                    aria-label="항목 제거"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeNewTaskModal}
              className="h-9 px-3.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold whitespace-nowrap"
            >
              작업 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
