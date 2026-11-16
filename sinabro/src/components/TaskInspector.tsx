import React, { useEffect, useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import {
  formatDateTimeLabel,
  PRIORITY_META,
  STATUS_META,
} from '../lib/taskoUtils';
import { TaskPriority, TaskStatus } from '../types/tasko';

export function TaskInspector() {
  const {
    selectedTask,
    setSelectedTaskId,
    projects,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTaskNote,
  } = useTasko();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setConfirmingDelete(false);
    setNewSubtaskTitle('');
    setNewNoteContent('');
    setNewTagInput('');
  }, [selectedTask?.id]);

  if (!selectedTask) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(selectedTask.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addTaskNote(selectedTask.id, newNoteContent);
    setNewNoteContent('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    if (!selectedTask.tags.includes(clean)) {
      updateTask(selectedTask.id, { tags: [...selectedTask.tags, clean] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    updateTask(selectedTask.id, {
      tags: selectedTask.tags.filter((t) => t !== tag),
    });
  };

  const doneCount = selectedTask.subtasks.filter((s) => s.completed).length;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${selectedTask.code} 작업 상세`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-[1px]"
        onClick={() => setSelectedTaskId(null)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
              {selectedTask.code}
            </span>
            <span aria-hidden="true">·</span>
            <span>수정 {formatDateTimeLabel(selectedTask.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="작업 삭제"
                className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => deleteTask(selectedTask.id)}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                >
                  삭제 확인
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  취소
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              aria-label="상세 패널 닫기"
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Title & Description */}
          <div className="space-y-3">
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) =>
                updateTask(selectedTask.id, { title: e.target.value })
              }
              aria-label="작업 제목"
              className="w-full text-lg font-semibold text-slate-900 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-md px-2 py-1 -mx-2"
            />
            <textarea
              value={selectedTask.description}
              onChange={(e) =>
                updateTask(selectedTask.id, { description: e.target.value })
              }
              rows={3}
              placeholder="작업 설명이나 참고 사항을 입력하세요..."
              aria-label="작업 설명"
              className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-3 resize-y focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                상태
              </label>
              <select
                value={selectedTask.status}
                onChange={(e) =>
                  updateTask(selectedTask.id, {
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full h-9 px-2.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {Object.values(TaskStatus).map((st) => (
                  <option key={st} value={st}>
                    {STATUS_META[st].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                우선순위
              </label>
              <select
                value={selectedTask.priority}
                onChange={(e) =>
                  updateTask(selectedTask.id, {
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full h-9 px-2.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {Object.values(TaskPriority).map((pr) => (
                  <option key={pr} value={pr}>
                    {PRIORITY_META[pr].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                프로젝트
              </label>
              <select
                value={selectedTask.projectId}
                onChange={(e) =>
                  updateTask(selectedTask.id, { projectId: e.target.value })
                }
                className="w-full h-9 px-2.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                마감일
              </label>
              <input
                type="date"
                value={selectedTask.dueDate ?? ''}
                onChange={(e) =>
                  updateTask(selectedTask.id, {
                    dueDate: e.target.value || null,
                  })
                }
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                예상 소요 시간 (시간)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={selectedTask.estimateHours ?? ''}
                placeholder="예: 2"
                onChange={(e) => {
                  const val = e.target.value;
                  updateTask(selectedTask.id, {
                    estimateHours: val === '' ? null : Number(val),
                  });
                }}
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                태그 추가
              </label>
              <form onSubmit={handleAddTag} className="flex gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="태그 입력 후 Enter"
                  className="w-full h-9 px-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </form>
            </div>
          </div>

          {/* Unboxed Tags */}
          {selectedTask.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              {selectedTask.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`${tag} 태그 삭제`}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Subtasks Checklist */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                하위 체크리스트
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {doneCount}/{selectedTask.subtasks.length}
              </span>
            </div>

            {selectedTask.subtasks.length > 0 && (
              <ul className="space-y-1.5">
                {selectedTask.subtasks.map((st) => (
                  <li
                    key={st.id}
                    className="flex items-center justify-between gap-2 py-1 group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtask(selectedTask.id, st.id)}
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          st.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          st.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSubtask(selectedTask.id, st.id)}
                      aria-label="하위 작업 삭제"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="하위 작업 추가..."
                className="flex-1 h-8 px-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </form>
          </div>

          {/* Work Notes */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              작업 메모 ({selectedTask.notes.length})
            </h3>

            {selectedTask.notes.length > 0 && (
              <ul className="space-y-2">
                {selectedTask.notes.map((note) => (
                  <li
                    key={note.id}
                    className="p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1"
                  >
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {formatDateTimeLabel(note.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={2}
                placeholder="진행 상황이나 결정 사항 메모 남기기..."
                className="w-full p-2.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="h-8 px-3 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 text-xs font-medium whitespace-nowrap"
                >
                  메모 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
